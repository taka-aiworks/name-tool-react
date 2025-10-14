// src/services/NanoBananaExportService.ts
// NanoBanana連携用エクスポートサービス

import { 
  Panel, 
  Character, 
  SpeechBubble, 
  CharacterSettings,
  PaperSize,
  NanoBananaExportOptions,
  NanoBananaExportProgress,
  NanoBananaExportResult,
  NanoBananaExportMetadata,
  NanoBananaExportPackage,
  CharacterNameMapping,
  LayoutImageOptions,
  DEFAULT_LAYOUT_IMAGE_OPTIONS,
  DEFAULT_NANOBANANA_EXPORT_OPTIONS,
  PAPER_SIZES
} from '../types';

const JSZip = require('jszip');

export class NanoBananaExportService {
  private static instance: NanoBananaExportService;

  public static getInstance(): NanoBananaExportService {
    if (!NanoBananaExportService.instance) {
      NanoBananaExportService.instance = new NanoBananaExportService();
    }
    return NanoBananaExportService.instance;
  }

  /**
   * 🍌 NanoBanana用パッケージエクスポート
   */
  async exportForNanoBanana(
    panels: Panel[],
    characters: Character[],
    bubbles: SpeechBubble[],
    paperSize: PaperSize,
    characterSettings?: Record<string, CharacterSettings>,
    characterNames?: Record<string, string>,
    options: NanoBananaExportOptions = DEFAULT_NANOBANANA_EXPORT_OPTIONS,
    onProgress?: (progress: NanoBananaExportProgress) => void,
    canvasElement?: HTMLCanvasElement  // 🆕 実際のキャンバス要素を受け取る
  ): Promise<NanoBananaExportResult> {
    try {
      const zip = new JSZip();
      const startTime = Date.now();

      // 進行状況更新
      const updateProgress = (step: NanoBananaExportProgress['step'], progress: number, message: string, currentFile?: string) => {
        if (onProgress) {
          onProgress({ step, progress, message, currentFile });
        }
      };

      updateProgress('initialize', 0, 'NanoBananaエクスポートを初期化中...');

      // 1. レイアウト画像生成
      updateProgress('generate_layout', 10, 'レイアウト画像を生成中...', 'layout.png');
      const layoutImage = canvasElement 
        ? await this.captureCanvasAsImage(canvasElement)
        : await this.generateLayoutImage(panels, paperSize, DEFAULT_LAYOUT_IMAGE_OPTIONS);
      zip.file('layout.png', layoutImage);

      // 2. プロンプト生成
      updateProgress('generate_prompt', 30, 'AIプロンプトを生成中...', 'prompt.txt');
      const promptText = this.generatePromptText(panels, characters, bubbles, options.promptLanguage || 'english', characterSettings);
      zip.file('prompt.txt', promptText);

      // 3. キャラクター名対応表生成
      if (options.includeCharacterMapping !== false) {
        updateProgress('create_mapping', 50, 'キャラクター名対応表を作成中...', 'character_mapping.txt');
      const characterMapping = this.generateCharacterMapping(characters, characterNames);
        zip.file('character_mapping.txt', characterMapping);
      }

      // 4. 使用方法ガイド生成
      if (options.includeInstructions !== false) {
        updateProgress('create_instructions', 70, '使用方法ガイドを作成中...', 'instructions.txt');
        const instructions = this.generateInstructions(options.promptLanguage || 'english');
        zip.file('instructions.txt', instructions);
      }

      // 5. メタデータ生成
      updateProgress('package_files', 90, 'パッケージを最終化中...', 'metadata.json');
      const metadata = this.generateMetadata(panels, characters, bubbles, paperSize, startTime);
      zip.file('metadata.json', JSON.stringify(metadata, null, 2));

      // 6. ZIPファイル生成
      updateProgress('package_files', 95, 'ZIPファイルを作成中...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      updateProgress('complete', 100, 'エクスポート完了！');

      return {
        success: true,
        zipBlob,
        filename: `nanobanana_export_${new Date().toISOString().slice(0, 10)}.zip`,
        size: zipBlob.size,
        metadata
      };

    } catch (error) {
      console.error('NanoBanana export error:', error);
      return {
        success: false,
        filename: '',
        size: 0,
        metadata: {} as NanoBananaExportMetadata,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 🎨 実際のキャンバスをキャプチャ
   */
  private async captureCanvasAsImage(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas to Blob conversion failed'));
        }
      }, 'image/png');
    });
  }

  /**
   * 🎨 レイアウト画像生成（フォールバック用）
   */
  private async generateLayoutImage(
    panels: Panel[], 
    paperSize: PaperSize, 
    options: LayoutImageOptions
  ): Promise<Blob> {
    // 仮実装: 実際にはCanvasを使ってレイアウト画像を生成
    // ここでは簡単なテキストベースの画像を生成
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;

    // 背景
    ctx.fillStyle = options.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // パネル描画
    ctx.strokeStyle = options.borderColor;
    ctx.lineWidth = options.borderWidth;
    panels.forEach((panel, index) => {
      const x = panel.x * canvas.width;
      const y = panel.y * canvas.height;
      const w = panel.width * canvas.width;
      const h = panel.height * canvas.height;

      ctx.strokeRect(x, y, w, h);

      if (options.showPanelNumbers) {
        ctx.fillStyle = options.fontColor;
        ctx.font = `${options.fontSize}px Arial`;
        ctx.fillText(`${index + 1}`, x + 10, y + options.fontSize + 5);
      }
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob || new Blob());
      }, 'image/png', options.quality);
    });
  }

  /**
   * 📝 プロンプトテキスト生成
   */
  private generatePromptText(
    panels: Panel[],
    characters: Character[],
    bubbles: SpeechBubble[],
    language: 'english' | 'japanese' | 'both',
    characterSettings?: Record<string, CharacterSettings>
  ): string {
    const isEnglish = language === 'english' || language === 'both';
    const isJapanese = language === 'japanese' || language === 'both';

    let prompt = '';

    if (isEnglish) {
      prompt += this.generateEnglishPrompt(panels, characters, bubbles, characterSettings);
    }

    if (isJapanese && isEnglish) {
      prompt += '\n\n' + '='.repeat(50) + '\n\n';
    }

    if (isJapanese) {
      prompt += this.generateJapanesePrompt(panels, characters, bubbles, characterSettings);
    }

    return prompt;
  }

  /**
   * 🇺🇸 英語プロンプト生成
   */
  private generateEnglishPrompt(
    panels: Panel[], 
    characters: Character[], 
    bubbles: SpeechBubble[],
    characterSettings?: Record<string, CharacterSettings>
  ): string {
    let prompt = '=== AI Manga Generation Prompt ===\n\n';
    
    prompt += 'Layout: ' + panels.length + ' panels\n';
    prompt += 'Characters: ' + characters.length + '\n';
    prompt += 'Dialogue bubbles: ' + bubbles.length + '\n\n';

    // 🆕 キャラクター設定プロンプトを最初に出力
    if (characterSettings && Object.keys(characterSettings).length > 0) {
      prompt += '=== 📸 Generate Character Reference Images First ===\n';
      prompt += '※Before using NanoBanana, generate character images with these prompts\n';
      prompt += '※Use Stable Diffusion, Midjourney, DALL-E, etc.\n\n';
      
      Object.entries(characterSettings).forEach(([charId, settings]) => {
        const charName = settings.name || charId;
        prompt += `【${charName}】\n`;
        if (settings.basePrompt) {
          prompt += `Appearance Prompt:\n${settings.basePrompt}\n`;
          prompt += `\nRecommended Settings:\n`;
          prompt += `- Style: anime style, manga style\n`;
          prompt += `- Background: simple background, white background\n`;
          prompt += `- Composition: full body, standing pose, front view\n`;
          prompt += `- Quality: masterpiece, best quality, high resolution\n`;
          prompt += `\nComplete Prompt Example:\n`;
          prompt += `${settings.basePrompt}, full body, standing pose, front view, `;
          prompt += `simple background, masterpiece, best quality, anime style\n`;
        }
        prompt += '\n';
      });
      prompt += '─'.repeat(60) + '\n\n';
    }

    // Panel別プロンプト（キャラ＋動作の分離システム）
    prompt += '=== Panel Prompts ===\n';
    panels.forEach((panel, index) => {
      prompt += `Panel ${index + 1}:\n`;
      if (panel.note) {
        prompt += `  📌 Note: ${panel.note}\n`;
      }
      
      // 🆕 吹き出し・セリフ情報を追加
      const panelBubbles = bubbles.filter(b => b.panelId === panel.id);
      if (panelBubbles.length > 0) {
        prompt += `  💬 Dialogue:\n`;
        panelBubbles.forEach((bubble, bubbleIdx) => {
          const bubbleTypeText = bubble.type === 'shout' ? ' (shouting)' :
                                 bubble.type === 'whisper' ? ' (whispering)' :
                                 bubble.type === 'thought' ? ' (thinking)' : '';
          prompt += `    ${bubbleIdx + 1}. "${bubble.text}"${bubbleTypeText}\n`;
        });
      }
      
      // 分離プロンプトシステム（characterSettingsのbasePromptを優先）
      const parts: string[] = [];
      
      // キャラクタープロンプトを取得（characterSettings優先）
      let charPrompt = panel.characterPrompt;
      if (panel.selectedCharacterId && characterSettings?.[panel.selectedCharacterId]?.basePrompt) {
        charPrompt = characterSettings[panel.selectedCharacterId].basePrompt;
      }
      
      if (charPrompt) parts.push(charPrompt.trim());
      if (panel.actionPrompt) parts.push(panel.actionPrompt.trim());
      
      if (parts.length > 0) {
        prompt += `  🎨 Image Generation Prompt: ${parts.join(', ')}\n`;
        if (charPrompt) prompt += `    - Character: ${charPrompt}\n`;
        if (panel.actionPrompt) prompt += `    - Action: ${panel.actionPrompt}\n`;
      } else if (panel.prompt) {
        // フォールバック
        prompt += `  🎨 Prompt: ${panel.prompt}\n`;
      } else {
        prompt += `  📐 Size: ${Math.round(panel.width * 100)}% x ${Math.round(panel.height * 100)}%\n`;
      }
      prompt += '\n';
    });

    // キャラクター詳細（キャラクターがいる場合のみ）
    if (characters.length > 0) {
      prompt += '=== Character Details ===\n';
      characters.forEach((char, index) => {
        prompt += `Character ${index + 1}: ${char.name}\n`;
        prompt += `  - View: ${char.viewType}\n`;
        prompt += `  - Expression: ${char.expression || 'neutral'}\n`;
        prompt += `  - Action: ${char.action || 'standing'}\n`;
        if (char.facing) prompt += `  - Facing: ${char.facing}\n`;
        if ((char as any).eyeState) prompt += `  - Eye State: ${(char as any).eyeState}\n`;
        if ((char as any).mouthState) prompt += `  - Mouth State: ${(char as any).mouthState}\n`;
        if ((char as any).handGesture) prompt += `  - Hand Gesture: ${(char as any).handGesture}\n`;
        if ((char as any).emotion_primary) prompt += `  - Emotion: ${(char as any).emotion_primary}\n`;
        if ((char as any).physical_state) prompt += `  - Physical State: ${(char as any).physical_state}\n`;
        prompt += '\n';
      });
    }

    prompt += '\n=== Style Instructions ===\n';
    prompt += 'Create a high-quality manga/comic with:\n';
    prompt += '- Clean line art\n';
    prompt += '- Proper character consistency\n';
    prompt += '- Dynamic panel composition\n';
    prompt += '- Clear dialogue placement\n';
    prompt += '- Professional manga styling\n';

    return prompt;
  }

  /**
   * 🇯🇵 日本語プロンプト生成
   */
  private generateJapanesePrompt(
    panels: Panel[], 
    characters: Character[], 
    bubbles: SpeechBubble[],
    characterSettings?: Record<string, CharacterSettings>
  ): string {
    let prompt = '=== AI漫画生成用プロンプト ===\n\n';
    
    prompt += 'レイアウト: ' + panels.length + 'コマ\n';
    prompt += 'キャラクター: ' + characters.length + '人\n';
    prompt += '吹き出し: ' + bubbles.length + '個\n\n';

    // 🆕 キャラクター設定プロンプトを最初に出力
    if (characterSettings && Object.keys(characterSettings).length > 0) {
      prompt += '=== 📸 キャラクターリファレンス画像の生成 ===\n';
      prompt += '※NanoBananaで使う前に、以下のプロンプトでキャラクター画像を生成してください\n';
      prompt += '※Stable Diffusion、Midjourney、DALL-E等で生成できます\n\n';
      
      Object.entries(characterSettings).forEach(([charId, settings]) => {
        const charName = settings.name || charId;
        prompt += `【${charName}】\n`;
        if (settings.basePrompt) {
          prompt += `外見プロンプト:\n${settings.basePrompt}\n`;
          prompt += `\n推奨設定:\n`;
          prompt += `- スタイル: anime style, manga style\n`;
          prompt += `- 背景: simple background, white background\n`;
          prompt += `- 構図: full body, standing pose, front view\n`;
          prompt += `- 品質: masterpiece, best quality, high resolution\n`;
          prompt += `\n完全なプロンプト例:\n`;
          prompt += `${settings.basePrompt}, full body, standing pose, front view, `;
          prompt += `simple background, masterpiece, best quality, anime style\n`;
        }
        prompt += '\n';
      });
      prompt += '─'.repeat(60) + '\n\n';
    }

    // コマ別プロンプト（キャラ＋動作の分離システム）
    prompt += '=== コマ別プロンプト ===\n';
    panels.forEach((panel, index) => {
      prompt += `コマ${index + 1}:\n`;
      if (panel.note) {
        prompt += `  📌 メモ: ${panel.note}\n`;
      }
      
      // 🆕 吹き出し・セリフ情報を追加
      const panelBubbles = bubbles.filter(b => b.panelId === panel.id);
      if (panelBubbles.length > 0) {
        prompt += `  💬 セリフ:\n`;
        panelBubbles.forEach((bubble, bubbleIdx) => {
          const bubbleTypeText = bubble.type === 'shout' ? '（叫び）' :
                                 bubble.type === 'whisper' ? '（小声）' :
                                 bubble.type === 'thought' ? '（心の声）' : '';
          prompt += `    ${bubbleIdx + 1}. 「${bubble.text}」${bubbleTypeText}\n`;
        });
      }
      
      // 分離プロンプトシステム（characterSettingsのbasePromptを優先）
      const parts: string[] = [];
      
      // キャラクタープロンプトを取得（characterSettings優先）
      let charPrompt = panel.characterPrompt;
      if (panel.selectedCharacterId && characterSettings?.[panel.selectedCharacterId]?.basePrompt) {
        charPrompt = characterSettings[panel.selectedCharacterId].basePrompt;
      }
      
      if (charPrompt) parts.push(charPrompt.trim());
      if (panel.actionPrompt) parts.push(panel.actionPrompt.trim());
      
      if (parts.length > 0) {
        prompt += `  🎨 画像生成プロンプト: ${parts.join(', ')}\n`;
        if (charPrompt) prompt += `    - キャラ: ${charPrompt}\n`;
        if (panel.actionPrompt) prompt += `    - 動作: ${panel.actionPrompt}\n`;
      } else if (panel.prompt) {
        // フォールバック
        prompt += `  🎨 プロンプト: ${panel.prompt}\n`;
      } else {
        prompt += `  📐 サイズ: ${Math.round(panel.width * 100)}% x ${Math.round(panel.height * 100)}%\n`;
      }
      prompt += '\n';
    });

    // キャラクター詳細（キャラクターがいる場合のみ）
    if (characters.length > 0) {
      prompt += '=== キャラクター詳細 ===\n';
      characters.forEach((char, index) => {
        prompt += `キャラクター${index + 1}: ${char.name}\n`;
        prompt += `  - 表示範囲: ${char.viewType}\n`;
        prompt += `  - 表情: ${char.expression || '通常'}\n`;
        prompt += `  - 動作: ${char.action || '立っている'}\n`;
        if (char.facing) prompt += `  - 向き: ${char.facing}\n`;
        if ((char as any).eyeState) prompt += `  - 目の状態: ${(char as any).eyeState}\n`;
        if ((char as any).mouthState) prompt += `  - 口の状態: ${(char as any).mouthState}\n`;
        if ((char as any).handGesture) prompt += `  - 手の動作: ${(char as any).handGesture}\n`;
        if ((char as any).emotion_primary) prompt += `  - 感情: ${(char as any).emotion_primary}\n`;
        if ((char as any).physical_state) prompt += `  - 体調・状態: ${(char as any).physical_state}\n`;
        prompt += '\n';
      });
    }

    prompt += '\n=== スタイル指示 ===\n';
    prompt += '高品質な漫画を作成してください：\n';
    prompt += '- クリーンな線画\n';
    prompt += '- キャラクターの一貫性\n';
    prompt += '- ダイナミックなコマ構成\n';
    prompt += '- 明確なセリフ配置\n';
    prompt += '- プロフェッショナルな漫画スタイル\n';

    return prompt;
  }

  /**
   * 👥 キャラクター名対応表生成
   */
  private generateCharacterMapping(
    characters: Character[],
    characterNames?: Record<string, string>
  ): string {
    let mapping = '=== Character Name Mapping ===\n\n';
    
    characters.forEach((char, index) => {
      const displayName = characterNames?.[char.id] || char.name;
      mapping += `${index + 1}. ${displayName}\n`;
      mapping += `   Original ID: ${char.id}\n`;
      mapping += `   Character ID: ${char.characterId}\n`;
      mapping += `   View Type: ${char.viewType}\n`;
      mapping += `   Expression: ${char.expression || 'neutral'}\n`;
      mapping += `   Action: ${char.action || 'standing'}\n`;
      if (char.facing) mapping += `   Facing: ${char.facing}\n`;
      if ((char as any).eyeState) mapping += `   Eye State: ${(char as any).eyeState}\n`;
      if ((char as any).mouthState) mapping += `   Mouth State: ${(char as any).mouthState}\n`;
      if ((char as any).handGesture) mapping += `   Hand Gesture: ${(char as any).handGesture}\n`;
      if ((char as any).emotion_primary) mapping += `   Emotion: ${(char as any).emotion_primary}\n`;
      if ((char as any).physical_state) mapping += `   Physical State: ${(char as any).physical_state}\n`;
      mapping += '\n';
    });

    mapping += '=== Usage Instructions ===\n';
    mapping += 'Use these character names consistently throughout the manga generation.\n';
    mapping += 'Each character should maintain visual consistency across all panels.\n';

    return mapping;
  }

  /**
   * 📖 使用方法ガイド生成
   */
  private generateInstructions(language: 'english' | 'japanese' | 'both'): string {
    // デフォルトは日本語ガイド
    if (language === 'english') {
      return this.generateEnglishInstructions();
    } else if (language === 'both') {
      return this.generateJapaneseInstructions() + '\n\n' + '='.repeat(80) + '\n\n' + this.generateEnglishInstructions();
    } else {
      // 'japanese' または指定なしの場合は日本語
      return this.generateJapaneseInstructions();
    }
  }

  /**
   * 🇺🇸 英語使用方法ガイド
   */
  private generateEnglishInstructions(): string {
    return `=== NanoBanana Usage Guide ===

This package contains everything you need to generate a manga using Google AI Studio's NanoBanana.

Files included:
- layout.png: Visual layout of panels
- prompt.txt: Detailed generation prompt
- character_mapping.txt: Character reference guide
- metadata.json: Project information

How to use:
1. Open Google AI Studio
2. Select NanoBanana model
3. Upload layout.png as reference image
4. Copy and paste prompt.txt content
5. Generate your manga!

Tips for best results:
- Use the character mapping to maintain consistency
- Adjust prompts based on your specific needs
- Experiment with different styles and settings
- Save your favorite results for future reference

Generated by Name Tool v1.2.0
For support, visit: https://github.com/your-repo/name-tool-react
`;
  }

  /**
   * 🇯🇵 日本語使用方法ガイド
   */
  private generateJapaneseInstructions(): string {
    return `=== 🍌 NanoBanana使用方法ガイド ===

このパッケージには、Google AI StudioのNanoBanana（Gemini）を使用して
漫画を自動生成するために必要なファイルが含まれています。

📦 含まれるファイル：
─────────────────────────────────────
• layout.png - コマ割りレイアウト画像
• prompt.txt - AI画像生成用プロンプト集
• character_mapping.txt - キャラクター名対応表
• metadata.json - プロジェクト情報

🚀 基本的な使い方：
─────────────────────────────────────
【ステップ1】キャラクターリファレンス画像を生成
1. prompt.txt を開く
2. 「📸 キャラクターリファレンス画像の生成」セクションを確認
3. 各キャラクターの外見プロンプトをコピー
4. Stable Diffusion / Midjourney / DALL-E で画像生成
   例: 「主人公」の外見プロンプト → 主人公の立ち絵を生成
5. 生成した画像を保存（例: character_主人公.png）

※キャラクターが複数いる場合は、全員分の画像を生成してください

【ステップ2】Google AI Studio で準備
1. Google AI Studio にアクセス
   → https://aistudio.google.com
2. Googleアカウントでログイン
3. 「New Chat」をクリック
4. モデルを「Gemini 2.0 Flash Experimental」に設定
   （画像生成対応モデル）

【ステップ3】画像をアップロード
1. 「📎 Attach」ボタンをクリック
2. キャラクターリファレンス画像をすべてアップロード
   （主人公.png、サブキャラ.png など）
3. layout.png（レイアウト画像）もアップロード
4. すべての画像が表示されることを確認

【ステップ4】プロンプトを入力
1. prompt.txt を開く
2. 各コマの情報を確認：
   • 📌 メモ（シーン説明）
   • 💬 セリフ（吹き出しの内容・タイプ）
   • 🎨 画像生成プロンプト（キャラ+動作）

3. 以下のテンプレートを使用：

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
アップロードした画像を使って、漫画を生成してください。

【重要な指示】
1. キャラクターリファレンス画像のキャラクターを使用
   • 主人公: [アップロードした主人公の画像]
   • サブキャラ: [アップロードしたサブキャラの画像]
   
2. layout.png のコマ割り、吹き出し配置を維持

3. 各コマの内容：
[Panel 1のプロンプトをコピペ]

[Panel 2のプロンプトをコピペ]

[Panel 3のプロンプトをコピペ]

【必須条件】
• キャラクターの外見を全コマで統一（リファレンス画像通り）
• レイアウトのコマ配置を維持
• 吹き出し内のセリフを正確に描画
• 高品質な漫画スタイル（anime style, masterpiece）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. 「送信」ボタンをクリック
5. AIが画像を生成（30秒〜1分）

【ステップ5】生成・確認
1. 生成された画像を確認
2. 気に入らない場合はプロンプトを調整して再生成
3. 満足したら画像をダウンロード
4. 完成！

🎯 キャラクター一貫性を高める方法：
─────────────────────────────────────
キャラクターが複数コマに登場する場合：

方法1：最初のコマで生成した画像を再アップロード
1. Panel 1を生成
2. 生成された画像もアップロード（リファレンスとして）
3. プロンプトに追加：
   "Use the character design from the reference image. 
    Maintain the exact same appearance."

方法2：キャラクター設定をより詳細に
1. prompt.txt のキャラクタープロンプトをさらに詳しく
   例: 髪型、目の色、服装の細かい特徴
2. すべてのコマで同じキャラクタープロンプトを使用

💡 生成のコツ：
─────────────────────────────────────
✅ プロンプトは具体的に
   ○ "black hair, blue eyes, white shirt"
   × "girl"

✅ レイアウト維持を強調
   プロンプトに必ず含める：
   "Keep the same panel layout and speech bubble positions"

✅ 1コマずつ生成してから一括生成
   - 最初は1コマだけ生成して品質確認
   - 問題なければ全コマ一括生成

✅ Negative Promptを活用
   prompt.txt の最後に記載されています

⚠️ 注意事項：
─────────────────────────────────────
• NanoBananaは無料枠がありますが、回数制限があります
• 生成結果は毎回異なります（同じプロンプトでも）
• 複雑なシーンは2-3回試すことをおすすめ
• 商用利用する場合はGoogleの利用規約を確認してください

📚 参考リンク：
─────────────────────────────────────
• Google AI Studio: https://aistudio.google.com
• NanoBanana詳細ガイド: https://eikyuhozon.com/generative-ai/nanobanana-guide.html

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AI漫画ネームメーカー v1.2.0 で生成
サポート: https://github.com/taka-aiworks/ai-manga-name-maker-beta
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
  }

  /**
   * 📊 メタデータ生成
   */
  private generateMetadata(
    panels: Panel[],
    characters: Character[],
    bubbles: SpeechBubble[],
    paperSize: PaperSize,
    startTime: number
  ): NanoBananaExportMetadata {
    return {
      exportedAt: new Date().toISOString(),
      toolVersion: '1.2.0',
      pageCount: 1, // 現在は1ページのみ対応
      panelCount: panels.length,
      characterCount: characters.length,
      paperSize: `${paperSize.name} (${paperSize.width}x${paperSize.height})`,
      totalElements: panels.length + characters.length + bubbles.length
    };
  }

}

// シングルトンインスタンスをエクスポート
export const nanoBananaExportService = NanoBananaExportService.getInstance();