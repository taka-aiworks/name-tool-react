// src/services/PromptService.ts - 新Character型対応版
import { Panel, Character, SpeechBubble, BackgroundElement, EffectElement, CharacterSettings } from '../types';

// 辞書型定義はCharacterDetailPanel.tsxで定義済み（削除）

// Project型を修正
export interface Project {
  panels: Panel[];
  characters: Character[];
  speechBubbles: SpeechBubble[];
  backgrounds: BackgroundElement[];
  effects: EffectElement[];
  // 🆕 CharacterSettings追加
  characterSettings?: Record<string, CharacterSettings>;
}

// シンプル化されたCharacterPrompt
export interface CharacterPrompt {
  id: string;
  name: string;
  role: string;
  basePrompt: string;        // CharacterSettings.basePrompt
  scenePrompt: string;       // 詳細設定から生成
  fullPrompt: string;        // basePrompt + scenePrompt
}

export interface ScenePrompt {
  panelId: number;
  sceneType: string;
  backgroundPrompt?: string;
  effectsPrompt?: string;
  compositionPrompt?: string;
  panelCharacters: CharacterPrompt[];
}

export interface PromptOutput {
  characters: CharacterPrompt[];
  scenes: ScenePrompt[];
  storyFlow: string;
  technicalNotes: string;
}

class PromptService {
  /**
   * 辞書データを取得
   */
  private getDictionary(): any {
    if (typeof window !== 'undefined' && window.DEFAULT_SFW_DICT) {
      return window.DEFAULT_SFW_DICT.SFW;
    }
    
    // フォールバック辞書（実際の辞書に合わせて修正）
    return {
      expressions: [
        { tag: "smiling", label: "笑顔" },
        { tag: "sad", label: "悲しい" },
        { tag: "angry", label: "怒り" },
        { tag: "surprised", label: "驚き" },
        { tag: "neutral_expression", label: "普通" }  // ← 修正
      ],
      pose_manga: [
        { tag: "standing", label: "立ち" },
        { tag: "sitting", label: "座り" },
        { tag: "walking", label: "歩く" },
        { tag: "running", label: "走る" },
        { tag: "arms_crossed", label: "腕組み" }
      ],
      gaze: [
        { tag: "at_viewer", label: "視線こちら" },  // ← 修正
        { tag: "away", label: "視線そらす" },
        { tag: "to_side", label: "横向き" },
        { tag: "down", label: "下を見る" }
      ],
      eye_state: [
        { tag: "eyes_open", label: "目を開ける" },
        { tag: "eyes_closed", label: "目を閉じる" },
        { tag: "wink_left", label: "左ウインク" }
      ],
      mouth_state: [
        { tag: "mouth_closed", label: "口を閉じる" },
        { tag: "open_mouth", label: "口を開ける" },
        { tag: "slight_smile", label: "微笑み" }
      ],
      hand_gesture: [
        { tag: "peace_sign", label: "ピースサイン" },
        { tag: "pointing", label: "指差し" },
        { tag: "waving", label: "手を振る" }
      ],
      composition: [
        { tag: "close-up", label: "顔のみ" },      // ← 実際の辞書に合わせて修正
        { tag: "upper_body", label: "上半身" },   // ← 修正
        { tag: "full_body", label: "全身" }       // ← 修正
      ]
    };
  }

  /**
   * 辞書から英語タグを取得
   */
  private getEnglishTag(category: string, key: string): string {
    const dict = this.getDictionary();
    const categoryData = dict[category] || [];
    
    // 完全一致検索
    const found = categoryData.find((item: any) => item.tag === key || item.label === key);
    return found ? found.tag : key;
  }

  /**
   * 辞書から日本語ラベルを取得
   */
  private getJapaneseLabel(category: string, key: string): string {
    const dict = this.getDictionary();
    const categoryData = dict[category] || [];
    
    const found = categoryData.find((item: any) => item.tag === key);
    return found ? found.label : key;
  }

  /**
   * プロジェクト全体からAI用プロンプトを生成
   */
  public generatePrompts(project: Project): PromptOutput {
    const characters = this.extractCharacterPrompts(project);
    const scenes = this.extractScenePrompts(project, characters);
    const storyFlow = this.generateStoryFlow(project);
    const technicalNotes = this.generateTechnicalNotes();

    return {
      characters,
      scenes,
      storyFlow,
      technicalNotes
    };
  }

  /**
   * 🆕 新Character型 + CharacterSettings対応のプロンプト生成
   */
  private extractCharacterPrompts(project: Project): CharacterPrompt[] {
    const characterMap = new Map<string, Character>();
    
    // 重複を除去してキャラクター一覧を作成
    project.characters.forEach(char => {
      const key = char.characterId || char.id;
      if (!characterMap.has(key)) {
        characterMap.set(key, char);
      }
    });

    return Array.from(characterMap.values()).map(char => {
      // CharacterSettingsから基本情報を取得
      const settings = project.characterSettings?.[char.characterId] || {
        id: char.characterId || char.id,
        name: char.name || 'キャラクター',
        role: '主人公',
        gender: 'female' as const,
        basePrompt: ''
      };

      return {
        id: char.id,
        name: settings.name,
        role: settings.role,
        basePrompt: settings.basePrompt,
        scenePrompt: this.generateScenePrompt(char),
        fullPrompt: this.generateFullPrompt(settings.basePrompt, char)
      };
    });
  }

  /**
   * 🆕 詳細設定からシーンプロンプト生成
   * viewType + expression + action + facing + eyeState + mouthState + handGesture
   */
  private generateScenePrompt(character: Character): string {
    const parts = [];

    // 表示タイプ（構図）- 実際の辞書のcompositionカテゴリを使用
    if ((character as any).viewType) {
      const viewTypeMapping: Record<string, string> = {
        'face': 'close-up',         // 辞書のcompositionに存在
        'upper_body': 'upper_body', // 辞書のcompositionに存在  
        'full_body': 'full_body'    // 辞書のcompositionに存在
      };
      const compositionTag = viewTypeMapping[(character as any).viewType];
      if (compositionTag) {
        parts.push(compositionTag);
      }
    }

    // 表情
    if (character.expression) {
      const expressionTag = this.getEnglishTag('expressions', character.expression);
      parts.push(expressionTag);
    }

    // 動作
    if (character.action) {
      const actionTag = this.getEnglishTag('pose_manga', character.action);
      parts.push(actionTag);
    }

    // 向き
    if (character.facing) {
      const facingTag = this.getEnglishTag('gaze', character.facing);
      parts.push(facingTag);
    }

    // 🆕 目の状態
    if ((character as any).eyeState) {
      const eyeTag = this.getEnglishTag('eye_state', (character as any).eyeState);
      parts.push(eyeTag);
    }

    // 🆕 口の状態
    if ((character as any).mouthState) {
      const mouthTag = this.getEnglishTag('mouth_state', (character as any).mouthState);
      parts.push(mouthTag);
    }

    // 🆕 手の動作
    if ((character as any).handGesture) {
      const handTag = this.getEnglishTag('hand_gesture', (character as any).handGesture);
      parts.push(handTag);
    }

    return parts.join(', ');
  }

  /**
   * フルプロンプト生成（basePrompt + scenePrompt）
   */
  private generateFullPrompt(basePrompt: string, character: Character): string {
    const scenePrompt = this.generateScenePrompt(character);
    
    const parts = [];
    
    if (basePrompt && basePrompt.trim()) {
      parts.push(basePrompt.trim());
    }
    
    if (scenePrompt && scenePrompt.trim()) {
      parts.push(scenePrompt.trim());
    }

    return parts.join(', ');
  }

  /**
   * パネル別シーンプロンプト生成
   */
  private extractScenePrompts(project: Project, allCharacters: CharacterPrompt[]): ScenePrompt[] {
    return project.panels.map(panel => {
      // このパネルのキャラクターを取得
      const panelCharacterIds = project.characters
        .filter(char => char.panelId === panel.id)
        .map(char => char.id);
      
      const panelCharacters = allCharacters.filter(char => 
        panelCharacterIds.includes(char.id)
      );

      return {
        panelId: panel.id,
        sceneType: this.analyzeSceneType(panel, project),
        backgroundPrompt: this.generateBackgroundPrompt(panel, project),
        effectsPrompt: this.generateEffectsPrompt(panel, project),
        compositionPrompt: this.generateCompositionPrompt(panel, project),
        panelCharacters
      };
    });
  }

  private generateBackgroundPrompt(panel: Panel, project: Project): string | undefined {
    const backgrounds = project.backgrounds.filter(bg => bg.panelId === panel.id);
    if (backgrounds.length === 0) return undefined;
    return backgrounds[0].type;
  }

  private generateEffectsPrompt(panel: Panel, project: Project): string | undefined {
    const effects = project.effects.filter(effect => effect.panelId === panel.id);
    if (effects.length === 0) return undefined;
    
    return effects.map(effect => {
      const mapping: Record<string, string> = {
        'speed': 'speed lines',
        'focus': 'focus lines',
        'explosion': 'explosion effect',
        'flash': 'flash effect'
      };
      return mapping[effect.type] || effect.type;
    }).join(', ');
  }

  private generateCompositionPrompt(panel: Panel, project: Project): string | undefined {
    const characterCount = project.characters.filter(char => char.panelId === panel.id).length;
    
    if (characterCount === 1) return 'single character';
    if (characterCount === 2) return 'two characters';
    if (characterCount > 2) return 'group shot';
    return undefined;
  }

  private analyzeSceneType(panel: Panel, project: Project): string {
    const characterCount = project.characters.filter(char => char.panelId === panel.id).length;
    const bubbleCount = project.speechBubbles.filter(bubble => bubble.panelId === panel.id).length;
    const hasEffects = project.effects.filter(effect => effect.panelId === panel.id).length > 0;

    if (hasEffects) return 'action';
    if (characterCount > 1) return 'dialogue';
    if (bubbleCount > 0) return 'speech';
    return 'scene';
  }

  private generateStoryFlow(project: Project): string {
    const panelCount = project.panels.length;
    const totalDialogue = project.speechBubbles.length;
    const characterCount = new Set(project.characters.map(c => c.characterId)).size;
    
    return `${panelCount} panels, ${characterCount} characters, ${totalDialogue} dialogue bubbles`;
  }

  private generateTechnicalNotes(): string {
    return [
      "Generated by ネーム制作ツール v2.0",
      "Character-based prompt system with detailed settings",
      "Recommended: High quality anime/manga style",
      "Use negative prompts for optimal results"
    ].join('\n');
  }

  /**
   * 🆕 改良されたプロンプト出力
   */
  public formatPromptOutput(promptData: PromptOutput): string {
    let output = "=== AI画像生成用プロンプト（詳細設定対応版） ===\n\n";

    // パネル別出力
    promptData.scenes.forEach((scene, index) => {
      output += `━━━ Panel ${index + 1} ━━━\n`;
      
      const panelCharacters = scene.panelCharacters;

      // 空パネル判定
      if (panelCharacters.length === 0) {
        output += `【背景のみのパネル】\n`;
        const bgPrompt = scene.backgroundPrompt || 'simple background';
        output += `masterpiece, best quality, ${bgPrompt}, no humans, anime style\n`;
        output += `\n───────────────────\n\n`;
        return;
      }

      // 正プロンプト生成
      const parts = ['masterpiece, best quality'];
      
      panelCharacters.forEach(char => {
        if (char.fullPrompt.trim()) {
          parts.push(char.fullPrompt);
        }
      });

      if (scene.backgroundPrompt) {
        parts.push(scene.backgroundPrompt);
      }
      
      if (scene.effectsPrompt) {
        parts.push(scene.effectsPrompt);
      }
      
      if (scene.compositionPrompt) {
        parts.push(scene.compositionPrompt);
      }

      parts.push('anime style');

      const positivePrompt = parts.join(', ');
      output += `【Positive Prompt】\n${positivePrompt}\n\n`;

      // 日本語説明
      const japaneseDesc = this.buildJapaneseDescription(panelCharacters, scene);
      output += `【日本語説明】\n${japaneseDesc}\n\n`;

      // ネガティブプロンプト
      const negativePrompt = this.buildNegativePrompt();
      output += `【Negative Prompt】\n${negativePrompt}\n\n`;

      output += `【推奨設定】\n`;
      output += `• Steps: 20-30\n`;
      output += `• CFG Scale: 7-11\n`;
      output += `• サイズ: 512x768 (縦) または 768x512 (横)\n`;
      output += `• サンプラー: DPM++ 2M Karras\n\n`;

      output += `───────────────────\n\n`;
    });

    // キャラクター参考情報
    output += "=== キャラクター設定参考 ===\n\n";
    promptData.characters.forEach((char, index) => {
      output += `${char.name} (${char.role}):\n`;
      if (char.basePrompt) {
        output += `基本設定: ${char.basePrompt}\n`;
      }
      if (char.scenePrompt) {
        output += `詳細設定: ${char.scenePrompt}\n`;
      }
      output += `\n`;
    });

    output += "=== 使用方法 ===\n";
    output += "1. Positive Promptをコピーして画像生成AIに貼り付け\n";
    output += "2. Negative Promptもコピーして貼り付け\n";
    output += "3. 推奨設定を参考に調整\n";
    output += "4. キャラクター設定参考で一貫性を保持\n\n";

    output += "=== 技術情報 ===\n";
    output += `${promptData.storyFlow}\n`;
    output += `生成日時: ${new Date().toLocaleString()}\n`;
    output += `${promptData.technicalNotes}\n`;

    return output;
  }

  private buildJapaneseDescription(characters: CharacterPrompt[], scene: ScenePrompt): string {
    const parts = [];

    characters.forEach((char, index) => {
      const descriptions = [];
      
      // 基本情報
      descriptions.push(`${char.name} (${char.role})`);
      
      // 基本プロンプト表示
      if (char.basePrompt) {
        descriptions.push(`基本: ${char.basePrompt.length > 30 ? char.basePrompt.substring(0, 30) + '...' : char.basePrompt}`);
      }
      
      // シーンプロンプトを辞書で日本語変換
      if (char.scenePrompt) {
        const scenePartsJapanese = char.scenePrompt.split(', ').map(part => {
          // 各カテゴリから日本語ラベルを取得
          let japanese = this.getJapaneseLabel('expressions', part);
          if (japanese === part) japanese = this.getJapaneseLabel('pose_manga', part);
          if (japanese === part) japanese = this.getJapaneseLabel('gaze', part);
          if (japanese === part) japanese = this.getJapaneseLabel('eye_state', part);
          if (japanese === part) japanese = this.getJapaneseLabel('mouth_state', part);
          if (japanese === part) japanese = this.getJapaneseLabel('hand_gesture', part);
          if (japanese === part) japanese = this.getJapaneseLabel('composition', part);
          
          // 特別な変換（辞書にない場合の補完）
          if (japanese === part) {
            const specialTranslations: Record<string, string> = {
              // 構図系
              'close-up': '顔のみ',
              'upper body': '上半身', 
              'full body': '全身',
              'face': '顔のみ',
              'halfBody': '上半身',
              'upper_body': '上半身',
              'full_body': '全身',
              
              // 向き系
              'front': '正面',
              'left': '左向き',
              'right': '右向き',
              'back': '後ろ向き',
              'to_side': '横向き',
              
              // 表情系
              'neutral': '普通',
              'normal': '普通',
              'neutral_expression': '普通の表情',
              
              // その他
              'single character': '1人',
              'two characters': '2人',
              'group shot': 'グループ'
            };
            japanese = specialTranslations[part] || part;
          }
          
          return japanese;
        }).join('、');
        
        descriptions.push(`詳細: ${scenePartsJapanese}`);
      }

      parts.push(`${char.name}: ${descriptions.slice(1).join(' | ')}`);
    });

    // シーン情報
    const sceneDetails = [];
    if (scene.backgroundPrompt) {
      sceneDetails.push(`背景: ${scene.backgroundPrompt}`);
    }

    if (scene.effectsPrompt) {
      sceneDetails.push(`効果: ${scene.effectsPrompt}`);
    }

    if (scene.compositionPrompt) {
      // 構図も辞書＋手動変換で日本語化
      let compositionJapanese = this.getJapaneseLabel('composition', scene.compositionPrompt);
      
      if (compositionJapanese === scene.compositionPrompt) {
        const compositionTranslations: Record<string, string> = {
          'single character': '1人',
          'two characters': '2人',
          'group shot': 'グループ'
        };
        compositionJapanese = compositionTranslations[scene.compositionPrompt] || scene.compositionPrompt;
      }
      
      sceneDetails.push(`構図: ${compositionJapanese}`);
    }

    if (sceneDetails.length > 0) {
      parts.push(`シーン: ${sceneDetails.join('、')}`);
    }

    parts.push("画質: 高品質なアニメ・漫画風イラスト");

    return parts.join('\n');
  }

  private buildNegativePrompt(): string {
    const negativeItems = [
      'lowres', 'bad anatomy', 'bad hands', 'text', 'error',
      'worst quality', 'low quality', 'blurry', 'bad face',
      'extra fingers', 'watermark', 'signature',
      'deformed', 'mutated', 'disfigured'
    ];

    return negativeItems.join(', ');
  }

  /**
   * Canvas付きエクスポート
   */
  public async exportPromptWithCapture(
    project: Project, 
    canvasElement: HTMLCanvasElement
  ): Promise<{ imageBlob: Blob; promptText: string }> {
    const promptData = this.generatePrompts(project);
    const promptText = this.formatPromptOutput(promptData);

    return new Promise((resolve) => {
      canvasElement.toBlob((blob) => {
        if (blob) {
          resolve({
            imageBlob: blob,
            promptText
          });
        }
      }, 'image/png');
    });
  }
}

export const promptService = new PromptService();