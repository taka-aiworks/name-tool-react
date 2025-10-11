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
      "note": "リナ悩む表情、カフェの一角",
      "dialogue": "絵が描けない...でも漫画作りたい",
      "bubbleType": "普通",
      "actionPrompt": "worried expression, looking down, sitting at cafe table, upper body, natural lighting",
      "actionPromptJa": "心配そうな表情、下を向く、カフェのテーブルに座る、上半身、自然光",
      "characterId": "character_1"
    }
  ]
}

ルール:
- コマ数は厳密に守る
- noteは簡潔に（キャラ名＋動作＋場所、20文字以内）
- dialogueは自然な会話（1コマ15文字以内推奨）
- bubbleTypeは「普通」「叫び」「小声」「心の声」のいずれか
- actionPromptは英語で、表情・動作・構図・背景・ライティングを含める（Stable Diffusion形式）
- actionPromptJaは日本語で、actionPromptの内容を分かりやすく説明
- characterIdは登場キャラのIDを指定（登録キャラがいる場合は必ず使用）
- トーン（コメディ/シリアス等）に合わせた表現にする`;

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
          x: panel.x + panel.width * 0.5,
          y: panel.y + panel.height * 0.2,
          scale: 1.0,
          width: 120,
          height: 60,
          vertical: true, // デフォルトは縦書き
          isGlobalPosition: true
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
  "note": "コマの内容説明（日本語）",
  "dialogue": "セリフ",
  "bubbleType": "普通",
  "actionPrompt": "動作・表情・構図のプロンプト（英語）",
  "actionPromptJa": "動作プロンプトの日本語説明",
  "characterId": "character_1"
}

【注意事項】
- 既存のコマとの整合性を保つ
- ストーリーの流れに沿った内容にする
- セリフは自然で魅力的にする
- プロンプトは画像生成に適した英語で記述する`;

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
}

export const openAIService = new OpenAIService();

