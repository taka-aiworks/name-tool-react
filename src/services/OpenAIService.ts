// src/services/OpenAIService.ts
// OpenAI API連携サービス

import { Panel, SpeechBubble } from '../types';

export interface StoryToComicRequest {
  story: string;
  panelCount: number;
  tone?: string; // コメディ、シリアス、日常など
  characters?: Array<{ id: string; name: string; prompt?: string }>; // 登録済みキャラ情報
  generationMode?: 'page' | 'panel'; // 1ページ分 or 1コマずつ
  existingPanels?: PanelContent[]; // 既存のコマ情報（1コマ生成時）
  targetPanelId?: number; // 対象コマID（1コマ生成時）
}

export interface PanelContent {
  panelId: number;
  note: string;
  dialogue: string;
  bubbleType?: string; // 普通、叫び、小声、心の声
  actionPrompt: string; // 動作・表情・構図プロンプト
  actionPromptJa?: string; // 動作プロンプトの日本語説明
  characterId?: string; // 使用キャラクターID（character_1等）
}

export interface StoryToComicResponse {
  panels: PanelContent[];
  success: boolean;
  error?: string;
}

class OpenAIService {
  private apiKey: string | null = null;
  private model: string = 'gpt-4o-mini';

  /**
   * APIキーを設定
   */
  public setApiKey(key: string): void {
    this.apiKey = key;
    // ローカルストレージに保存（セキュリティ注意：本番では暗号化推奨）
    if (typeof window !== 'undefined') {
      localStorage.setItem('openai_api_key', key);
    }
  }

  /**
   * APIキーを取得
   */
  public getApiKey(): string | null {
    // 環境変数からAPIキーを取得（公開モード用）
    const envApiKey = process.env.REACT_APP_OPENAI_API_KEY;
    const useEnvKey = process.env.REACT_APP_USE_ENV_API_KEY === 'true';
    
    if (useEnvKey && envApiKey) {
      return envApiKey;
    }
    
    // ローカルストレージから取得（開発モード用）
    if (!this.apiKey && typeof window !== 'undefined') {
      this.apiKey = localStorage.getItem('openai_api_key');
    }
    return this.apiKey;
  }

  /**
   * APIキーが設定されているか確認
   */
  public hasApiKey(): boolean {
    return !!this.getApiKey();
  }

  /**
   * APIキーをクリア
   */
  public clearApiKey(): void {
    this.apiKey = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('openai_api_key');
    }
  }

  /**
   * 話からコマ内容を生成
   */
  public async generatePanelContent(request: StoryToComicRequest): Promise<StoryToComicResponse> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      return {
        panels: [],
        success: false,
        error: 'APIキーが設定されていません'
      };
    }

    try {
      // 登録キャラ情報をシステムプロンプトに含める
      let characterInfo = '';
      if (request.characters && request.characters.length > 0) {
        characterInfo = '\n\n登場キャラクター:\n';
        request.characters.forEach(char => {
          characterInfo += `- ${char.name} (ID: ${char.id})\n`;
        });
      }

      const systemPrompt = `あなたは漫画のネーム制作アシスタントです。
ユーザーが入力した話の概要を、指定されたコマ数に分割して、各コマのメモ・セリフ・動作プロンプトを生成してください。
${characterInfo}
出力形式（JSON）:
{
  "panels": [
    {
      "panelId": 1,
      "note": "リナ悩む表情",
      "dialogue": "絵が描けない...",
      "bubbleType": "普通",
      "actionPrompt": "worried expression, looking down",
      "actionPromptJa": "心配そうな表情、下を向く",
      "characterId": "character_1"
    }
  ]
}

**重要なルール:**
1. **入力内容のみを使用** - 入力にない要素（具体的な物、場所、詳細な設定）は絶対に追加しない
2. コマ数は厳密に守る
3. noteは簡潔に（キャラ名＋基本的な動作のみ、15文字以内）
4. dialogueは自然な会話（1コマ15文字以内推奨）
5. bubbleTypeは「普通」「叫び」「小声」「心の声」のいずれか
6. actionPromptは英語で、**入力された動作・表情のみ**を表現（勝手な追加禁止）
7. actionPromptJaは日本語で、actionPromptの内容をそのまま説明
8. characterIdは登場キャラのIDを指定（登録キャラがいる場合は必ず使用）
9. トーン（コメディ/シリアス等）に合わせた表現にする

**禁止事項:**
- 入力にない具体的な物や生き物を追加する（例: 入力「びっくりする」→「巨大なウサギ」は禁止）
- 入力にない場所や環境を追加する
- 過度に詳細な描写や装飾を加える`;

      const userPrompt = `話の概要: ${request.story}
コマ数: ${request.panelCount}
トーン: ${request.tone || 'コメディ'}

上記に基づき、${request.panelCount}コマ分のネーム内容を生成してください。`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content in response');
      }

      const parsedContent = JSON.parse(content);
      
      return {
        panels: parsedContent.panels || [],
        success: true
      };

    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        panels: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 生成されたコマ内容をパネルと吹き出しに適用
   */
  public applyPanelContent(
    panels: Panel[],
    speechBubbles: SpeechBubble[],
    generatedContent: PanelContent[],
    characterSettings?: Record<string, any>
  ): { updatedPanels: Panel[]; newBubbles: SpeechBubble[] } {
    const updatedPanels = panels.map(panel => {
      const content = generatedContent.find(c => c.panelId === panel.id);
      if (content) {
        const update: any = {
          ...panel,
          note: content.note,
          actionPrompt: content.actionPrompt,
          actionPromptJa: content.actionPromptJa // 日本語説明を保存
        };
        
        // キャラIDが指定されている場合
        if (content.characterId) {
          update.selectedCharacterId = content.characterId;
          // 登録済みプロンプトを取得
          if (characterSettings?.[content.characterId]?.appearance?.basePrompt) {
            update.characterPrompt = characterSettings[content.characterId].appearance.basePrompt;
          }
        }
        
        return update;
      }
      return panel;
    });

    const newBubbles: SpeechBubble[] = [];
    
    generatedContent.forEach(content => {
      const panel = panels.find(p => p.id === content.panelId);
      if (panel && content.dialogue) {
        const bubbleTypeMap: Record<string, string> = {
          '普通': 'normal',
          '叫び': 'shout',
          '小声': 'whisper',
          '心の声': 'thought'
        };

        const newBubble: SpeechBubble = {
          id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          panelId: panel.id,
          type: bubbleTypeMap[content.bubbleType || '普通'] || 'normal',
          text: content.dialogue,
          x: 0.5,  // パネル中央（相対座標）
          y: 0.3,  // パネル上部寄り（相対座標）
          scale: 1.0,
          width: 0.7,  // パネル幅の70%（相対座標）
          height: 0.25, // パネル高さの25%（相対座標）
          vertical: true, // デフォルトは縦書き
          isGlobalPosition: false  // パネル相対座標を使用
        };
        
        
        newBubbles.push(newBubble);
      }
    });

    return {
      updatedPanels,
      newBubbles: [...speechBubbles, ...newBubbles]
    };
  }

  /**
   * 1コマのみ生成（既存のコマを置き換え）
   */
  public async generateSinglePanel(
    story: string,
    targetPanelId: number,
    existingPanels: PanelContent[],
    tone?: string,
    characters?: Array<{ id: string; name: string; prompt?: string }>
  ): Promise<PanelContent | null> {
    if (!this.apiKey) {
      throw new Error('APIキーが設定されていません');
    }

    const characterInfo = characters ? characters.map(char => 
      `- ${char.name} (ID: ${char.id}): ${char.prompt || 'プロンプト未設定'}`
    ).join('\n') : '';

    const existingContext = existingPanels.length > 0 ? 
      `\n\n【既存のコマ情報】\n${existingPanels.map(panel => 
        `コマ${panel.panelId}: ${panel.note} - ${panel.dialogue}`
      ).join('\n')}` : '';

    const prompt = `あなたは漫画制作の専門家です。以下のストーリーから、指定されたコマの内容を生成してください。

【ストーリー】
${story}

【トーン】
${tone || 'コメディ'}

【登録済みキャラクター】
${characterInfo || 'キャラクター情報なし'}

【対象コマ】
コマ${targetPanelId}の内容を生成してください。${existingContext}

【出力形式】
以下のJSON形式で1つのコマの情報のみを返してください：
{
  "panelId": ${targetPanelId},
  "note": "コマの内容説明（簡潔に、15文字以内）",
  "dialogue": "セリフ",
  "bubbleType": "普通",
  "actionPrompt": "動作・表情のプロンプト（英語、シンプルに）",
  "actionPromptJa": "動作プロンプトの日本語説明",
  "characterId": "character_1"
}

**重要なルール:**
1. **入力内容のみを使用** - 入力（ストーリー）にない要素は絶対に追加しない
2. noteは簡潔に（キャラ名＋基本的な動作のみ、15文字以内）
3. dialogueは自然な会話（15文字以内推奨）
4. actionPromptは英語で、**入力された動作・表情のみ**を表現（勝手な追加禁止）
5. 既存のコマとの整合性を保つ

**禁止事項:**
- 入力にない具体的な物や生き物を追加する（例: 入力「びっくりする」→「巨大なウサギ」は禁止）
- 入力にない場所や環境を追加する
- 過度に詳細な描写や装飾を加える`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('API response is empty');
      }

      // JSON部分を抽出
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('JSON形式のレスポンスが見つかりません');
      }

      const panelData = JSON.parse(jsonMatch[0]);
      return panelData as PanelContent;

    } catch (error) {
      console.error('Single panel generation error:', error);
      throw error;
    }
  }

  /**
   * 動作・シチュエーションの説明から英語プロンプトを生成
   */
  public async generateActionPrompt(description: string): Promise<{ prompt: string; promptJa: string }> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      throw new Error('APIキーが設定されていません');
    }

    try {
      const systemPrompt = `あなたは漫画の画像生成プロンプト作成の専門家です。
ユーザーが入力した日本語の動作・シチュエーション説明を、画像生成AI用の簡潔な英語プロンプトに変換してください。

重要なルール：
1. **入力された内容のみ**を英語化する
2. 入力にない要素（背景、環境、詳細な設定など）は**絶対に追加しない**
3. シンプルで明確な表現を使う
4. 余計な装飾や説明を加えない

例：
- 入力「驚いた顔」→ 出力「surprised expression, eyes wide open」
- 入力「笑顔で手を振る」→ 出力「smiling and waving hand」
- 入力「怒った表情でにらむ」→ 出力「angry expression, glaring」

JSON形式で返してください：
{
  "prompt": "英語プロンプト（シンプルに）",
  "promptJa": "日本語の説明（元の入力そのまま）"
}`;

      const userPrompt = `以下の説明から画像生成用プロンプトを作成してください：

${description}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('API response is empty');
      }

      // JSON部分を抽出
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('JSON形式のレスポンスが見つかりません');
      }

      const result = JSON.parse(jsonMatch[0]);
      return result as { prompt: string; promptJa: string };

    } catch (error) {
      console.error('Action prompt generation error:', error);
      throw error;
    }
  }
}

export const openAIService = new OpenAIService();

