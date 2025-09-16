// src/services/PromptService.ts
import { Panel, Character, SpeechBubble, BackgroundElement, EffectElement } from '../types';

// 🆕 辞書型定義
declare global {
  interface Window {
    DEFAULT_SFW_DICT: {
      SFW: {
        gender: Array<{ tag: string; label: string }>;
        age: Array<{ tag: string; label: string }>;
        hair_style: Array<{ tag: string; label: string }>;
        eyes: Array<{ tag: string; label: string }>;
        skin_features: Array<{ tag: string; label: string }>;
        outfit: Array<{ tag: string; label: string; cat?: string }>;
        body_type: Array<{ tag: string; label: string }>;
        height: Array<{ tag: string; label: string }>;
        colors: Array<{ tag: string; label: string }>;
        background: Array<{ tag: string; label: string }>;
        pose: Array<{ tag: string; label: string }>;
        expressions: Array<{ tag: string; label: string }>;
        composition: Array<{ tag: string; label: string }>;
        view: Array<{ tag: string; label: string }>;
        lighting: Array<{ tag: string; label: string }>;
      };
    };
  }
}

// Project型を定義（現在のtypes.tsに存在しないため追加）
export interface Project {
  panels: Panel[];
  characters: Character[];
  speechBubbles: SpeechBubble[];
  backgrounds: BackgroundElement[];
  effects: EffectElement[];
}

export interface CharacterPrompt {
  id: string;
  name: string;
  basicInfoPrompt: string;      // キャラ基本情報（プロンプトツール用 + 独立使用可能）
  positionPrompt: string;       // ネームレイアウトから生成した配置・ポーズ情報
  sceneContext?: string;        // パネル内での役割・状況
  appearance: {
    gender: string;
    hairColor: string;
    hairStyle: string;
    eyeColor: string;
    skinTone: string;
    clothing: string;
    clothingColor: string;
  };
}

export interface ScenePrompt {
  panelId: number;
  sceneType: string;
  backgroundPrompt?: string;    // 背景専用プロンプト
  effectsPrompt?: string;       // エフェクト専用プロンプト
  compositionPrompt?: string;   // 構図専用プロンプト
  elements: {
    background?: string;
    effects?: string[];
    mood?: string;
    composition?: string;
  };
}

export interface PromptOutput {
  characters: CharacterPrompt[];
  scenes: ScenePrompt[];
  storyFlow: string;
  technicalNotes: string;
}

class PromptService {
  /**
   * 🆕 辞書データを取得（フォールバック対応）
   */
  private getDictionary() {
    if (typeof window !== 'undefined' && window.DEFAULT_SFW_DICT) {
      return window.DEFAULT_SFW_DICT.SFW;
    }
    
    // フォールバック辞書
    return {
      gender: [
        { tag: "female", label: "女性" },
        { tag: "male", label: "男性" }
      ],
      hair_style: [
        { tag: "long hair", label: "ロング" },
        { tag: "short hair", label: "ショート" },
        { tag: "ponytail", label: "ポニーテール" }
      ],
      eyes: [
        { tag: "brown eyes", label: "茶色い瞳" },
        { tag: "blue eyes", label: "青い瞳" }
      ],
      outfit: [
        { tag: "school uniform", label: "制服" },
        { tag: "casual", label: "カジュアル" }
      ],
      colors: [
        { tag: "blue", label: "青" },
        { tag: "red", label: "赤" },
        { tag: "black", label: "黒" }
      ],
      age: [{ tag: "teen", label: "ティーン" }],
      skin_features: [{ tag: "fair skin", label: "色白肌" }],
      body_type: [{ tag: "average build", label: "標準体型" }],
      height: [{ tag: "average height", label: "中背" }],
      background: [{ tag: "classroom", label: "教室" }],
      pose: [{ tag: "standing", label: "立ち" }],
      expressions: [{ tag: "smiling", label: "笑顔" }],
      composition: [{ tag: "full_body", label: "全身" }],
      view: [{ tag: "front_view", label: "正面" }],
      lighting: [{ tag: "soft lighting", label: "柔らかい照明" }]
    };
  }

  /**
   * 🆕 辞書からタグを検索
   */
  private findTagByLabel(category: string, searchText: string): string {
    const dict = this.getDictionary();
    const categoryData = dict[category as keyof typeof dict] || [];
    
    const found = categoryData.find(item => 
      item.label.includes(searchText) || 
      item.tag.includes(searchText.toLowerCase())
    );
    
    return found ? found.tag : searchText;
  }

  /**
   * プロジェクト全体からAI用プロンプトを生成
   */
  public generatePrompts(project: Project): PromptOutput {
    const characters = this.extractCharacterPrompts(project);
    const scenes = this.extractScenePrompts(project);
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
   * キャラクター設定からプロンプトを生成（辞書対応）
   */
  private extractCharacterPrompts(project: Project): CharacterPrompt[] {
    const characterMap = new Map<string, Character>();
    
    // プロジェクト内の全キャラクターを収集
    project.characters.forEach(char => {
      if (!characterMap.has(char.id)) {
        characterMap.set(char.id, char);
      }
    });

    return Array.from(characterMap.values()).map(char => ({
      id: char.id,
      name: char.name || `Character_${char.id}`,
      basicInfoPrompt: this.generateBasicInfoPrompt(char),
      positionPrompt: this.generatePositionPrompt(char),
      sceneContext: this.generateSceneContext(char),
      appearance: this.extractAppearanceData(char)
    }));
  }

  /**
   * 🆕 辞書を使ったキャラクター基本情報プロンプト生成
   */
  private generateBasicInfoPrompt(character: Character): string {
    const appearance = this.extractAppearanceData(character);
    
    // 辞書から適切なタグを取得
    const genderTag = this.findTagByLabel('gender', appearance.gender);
    const hairTag = this.findTagByLabel('hair_style', appearance.hairStyle);
    const eyeTag = this.findTagByLabel('eyes', appearance.eyeColor);
    const outfitTag = this.findTagByLabel('outfit', appearance.clothing);
    const colorTag = this.findTagByLabel('colors', appearance.clothingColor);
    
    const parts = [
      'masterpiece, best quality',
      genderTag,
      hairTag,
      eyeTag,
      outfitTag,
      colorTag && `${colorTag} clothing`,
      'anime style'
    ].filter(Boolean);

    return parts.join(', ');
  }

  /**
   * ネームレイアウトから配置・ポーズ情報を生成
   */
  private generatePositionPrompt(character: Character): string {
    const position = this.analyzeCharacterPosition(character);
    const pose = this.analyzeCharacterPose(character);
    
    const parts = [];
    if (position) parts.push(position);
    if (pose) parts.push(pose);
    
    return parts.length > 0 ? parts.join(', ') : 'standing, center frame';
  }

  /**
   * シーン内での役割・状況を生成
   */
  private generateSceneContext(character: Character): string {
    return 'main character in scene';
  }

  /**
   * キャラクターの配置を分析
   */
  private analyzeCharacterPosition(character: Character): string {
    const x = character.x;
    const y = character.y;
    
    if (x < 0.3) return 'left side';
    if (x > 0.7) return 'right side';
    if (y < 0.3) return 'upper frame';
    if (y > 0.7) return 'lower frame';
    
    return 'center frame';
  }

  /**
   * 🆕 辞書を使ったキャラクターポーズ分析
   */
  private analyzeCharacterPose(character: Character): string {
    const dict = this.getDictionary();
    
    // 既存のbodyPoseプロパティを辞書で変換
    const poseTag = this.findTagByLabel('pose', character.bodyPose || 'standing');
    return poseTag;
  }

  /**
   * 🆕 辞書対応キャラクター外見データ抽出
   */
  private extractAppearanceData(character: Character): CharacterPrompt['appearance'] {
    // TODO: Character型にappearanceプロパティを追加予定
    // 現在は基本的なフォールバック値 + 名前から推定
    
    return {
      gender: this.detectGender(character),
      hairColor: this.detectHairColor(character),
      hairStyle: this.detectHairStyle(character),
      eyeColor: this.detectEyeColor(character),
      skinTone: this.detectSkinTone(character),
      clothing: this.detectClothing(character),
      clothingColor: this.detectClothingColor(character)
    };
  }

  /**
   * 🆕 辞書を使った性別検出
   */
  private detectGender(character: Character): string {
    const name = character.name || '';
    const dict = this.getDictionary();
    
    // 名前パターンで判定
    if (name.includes('子') || name.includes('女') || name.includes('さん')) {
      return dict.gender.find(g => g.tag === 'female')?.tag || 'female';
    }
    if (name.includes('男') || name.includes('くん') || name.includes('君')) {
      return dict.gender.find(g => g.tag === 'male')?.tag || 'male';
    }
    
    return 'female'; // デフォルト
  }

  private detectHairColor(character: Character): string {
    return 'black'; // TODO: 実装時に辞書から取得
  }

  private detectHairStyle(character: Character): string {
    return 'medium hair'; // TODO: 実装時に辞書から取得
  }

  private detectEyeColor(character: Character): string {
    return 'brown eyes'; // TODO: 実装時に辞書から取得
  }

  private detectSkinTone(character: Character): string {
    return 'fair skin'; // TODO: 実装時に辞書から取得
  }

  private detectClothing(character: Character): string {
    return 'school uniform'; // TODO: 実装時に辞書から取得
  }

  private detectClothingColor(character: Character): string {
    return 'blue'; // TODO: 実装時に辞書から取得
  }

  /**
   * シーン構成プロンプトを生成
   */
  private extractScenePrompts(project: Project): ScenePrompt[] {
    return project.panels.map(panel => ({
      panelId: panel.id,
      sceneType: this.analyzeSceneType(panel, project),
      backgroundPrompt: this.generateBackgroundPrompt(panel, project),
      effectsPrompt: this.generateEffectsPrompt(panel, project),
      compositionPrompt: this.generateCompositionPrompt(panel, project),
      elements: {
        background: this.analyzeBackground(panel, project),
        effects: this.analyzeEffects(panel, project),
        mood: this.analyzeMood(panel, project),
        composition: this.analyzeComposition(panel, project)
      }
    }));
  }

  /**
   * 🆕 辞書を使った背景専用プロンプト生成
   */
  private generateBackgroundPrompt(panel: Panel, project: Project): string | undefined {
    const backgrounds = project.backgrounds.filter(bg => bg.panelId === panel.id);
    if (backgrounds.length === 0) return undefined;

    const bg = backgrounds[0];
    const backgroundTag = this.findTagByLabel('background', bg.type);
    
    return backgroundTag;
  }

  /**
   * エフェクト専用プロンプト生成
   */
  private generateEffectsPrompt(panel: Panel, project: Project): string | undefined {
    const effects = project.effects.filter(effect => effect.panelId === panel.id);
    if (effects.length === 0) return undefined;
    
    return effects.map(effect => 
      this.translateEffectType(effect.type, effect.direction)
    ).filter(Boolean).join(', ');
  }

  /**
   * 🆕 辞書を使った構図専用プロンプト生成
   */
  private generateCompositionPrompt(panel: Panel, project: Project): string | undefined {
    const characterCount = project.characters.filter(char => char.panelId === panel.id).length;
    
    const dict = this.getDictionary();
    let compositionTag = '';
    
    if (characterCount === 1) {
      compositionTag = dict.composition.find(c => c.tag === 'full_body')?.tag || 'single character focus';
    } else if (characterCount === 2) {
      compositionTag = 'two character composition';
    } else if (characterCount > 2) {
      compositionTag = 'group composition';
    }
    
    return compositionTag;
  }

  // 簡略化された分析メソッド群
  private analyzeSceneType(panel: Panel, project: Project): string {
    const characterCount = project.characters.filter(char => char.panelId === panel.id).length;
    const bubbleCount = project.speechBubbles.filter(bubble => bubble.panelId === panel.id).length;
    const hasEffects = project.effects.filter(effect => effect.panelId === panel.id).length > 0;

    if (hasEffects) return 'action';
    if (characterCount > 1) return 'dialogue';
    if (bubbleCount > 0) return 'speech';
    return 'scene';
  }

  private analyzeBackground(panel: Panel, project: Project): string | undefined {
    const backgrounds = project.backgrounds.filter(bg => bg.panelId === panel.id);
    return backgrounds.length > 0 ? backgrounds[0].type : undefined;
  }

  private analyzeEffects(panel: Panel, project: Project): string[] {
    const effects = project.effects.filter(effect => effect.panelId === panel.id);
    return effects.map(effect => effect.type);
  }

  private analyzeMood(panel: Panel, project: Project): string | undefined {
    const effects = project.effects.filter(effect => effect.panelId === panel.id);
    const hasAction = effects.some(e => e.type === 'speed' || e.type === 'explosion');
    
    if (hasAction) return 'dynamic, energetic';
    
    const dialogueCount = project.speechBubbles.filter(bubble => bubble.panelId === panel.id).length;
    if (dialogueCount > 2) return 'conversational, calm';
    
    return 'peaceful, serene';
  }

  private analyzeComposition(panel: Panel, project: Project): string | undefined {
    const characterCount = project.characters.filter(char => char.panelId === panel.id).length;
    
    if (characterCount === 0) return 'environmental shot';
    if (characterCount === 1) return 'single character focus';
    if (characterCount === 2) return 'two character composition';
    return 'group composition';
  }

  private generateStoryFlow(project: Project): string {
    const panelCount = project.panels.length;
    const totalDialogue = project.speechBubbles.length;
    
    return `${panelCount} panel manga page, ${totalDialogue} dialogue bubbles, sequential storytelling`;
  }

  private generateTechnicalNotes(): string {
    return [
      "Generated by ネーム制作ツール",
      "Recommended settings: High quality, anime/manga style",
      "Panel-by-panel composition for manga layout",
      "Character consistency across panels recommended"
    ].join('\n');
  }

  /**
   * エフェクトタイプ変換
   */
  private translateEffectType(type: string, direction?: string): string | undefined {
    const mapping: Record<string, Record<string, string>> = {
      'speed': {
        'horizontal': 'speed lines, motion blur',
        'vertical': 'vertical speed lines',
        'radial': 'radial motion lines'
      },
      'focus': {
        'radial': 'focus lines, dramatic emphasis'
      },
      'explosion': {
        'radial': 'explosion effect, dynamic burst'
      },
      'flash': {
        'radial': 'flash effect, bright light'
      }
    };

    return mapping[type]?.[direction || 'radial'];
  }

  /**
   * 🆕 負プロンプト生成（辞書対応）
   */
  private buildNegativePrompt(): string {
    const dict = this.getDictionary();
    
    // 基本的な負プロンプト
    const basicNegative = [
      'lowres', 'bad anatomy', 'bad hands', 'text', 'error',
      'worst quality', 'low quality', 'blurry', 'bad face',
      'deformed face', 'extra fingers', 'watermark', 'signature',
      'multiple people'
    ];

    return basicNegative.join(', ');
  }

  /**
   * プロンプトを整形されたテキストとして出力（辞書対応版）
   */
  public formatPromptOutput(promptData: PromptOutput): string {
    let output = "=== Ready-to-Use AI Image Generation Prompts ===\n\n";

    // 各パネル用のプロンプト生成
    promptData.scenes.forEach((scene, index) => {
      output += `━━━ Panel ${index + 1} ━━━\n`;
      
      // キャラクター情報を含む完全プロンプト
      const panelCharacters = promptData.characters;

      // 正プロンプト構築（辞書対応）
      const positivePrompt = this.buildPositivePrompt(panelCharacters, scene);
      output += `【Positive Prompt】\n${positivePrompt}\n\n`;

      // 日本語説明
      const japaneseDescription = this.buildJapaneseDescription(panelCharacters, scene);
      output += `【日本語説明】\n${japaneseDescription}\n\n`;

      // 負プロンプト（辞書対応）
      const negativePrompt = this.buildNegativePrompt();
      output += `【Negative Prompt】\n${negativePrompt}\n\n`;

      // 推奨設定
      output += `【Recommended Settings】\n`;
      output += `• Steps: 20-28\n`;
      output += `• CFG Scale: 7-9\n`;
      output += `• Size: 512x768 (portrait) or 768x512 (landscape)\n`;
      output += `• Sampler: DPM++ 2M Karras\n\n`;

      output += `───────────────────────────────\n\n`;
    });

    // キャラクター設定参考情報
    output += "=== Character Reference (For Consistency) ===\n\n";
    promptData.characters.forEach((char, index) => {
      output += `Character ${index + 1} (${char.name}):\n`;
      output += `${char.basicInfoPrompt}\n`;
      output += `Position: ${char.positionPrompt}\n\n`;
    });

    // 使用ガイド
    output += "=== Usage Guide ===\n";
    output += "1. Copy the Positive Prompt to your AI image generator\n";
    output += "2. Copy the Negative Prompt to negative prompt field\n";
    output += "3. Adjust settings according to recommendations\n";
    output += "4. Use Character Reference for consistent character generation\n\n";

    // 技術情報
    output += "=== Technical Info ===\n";
    output += `Story: ${promptData.storyFlow}\n`;
    output += `Generated: ${new Date().toLocaleString()}\n`;
    output += `Tool: ${promptData.technicalNotes}\n`;

    return output;
  }

  /**
   * 🆕 辞書対応 正プロンプト構築
   */
  private buildPositivePrompt(characters: CharacterPrompt[], scene: ScenePrompt): string {
    const parts = [];

    // 基本品質
    parts.push("masterpiece, best quality");

    // キャラクター情報（辞書タグ使用）
    if (characters.length > 0) {
      characters.forEach(char => {
        parts.push(char.basicInfoPrompt);
        parts.push(char.positionPrompt);
      });
    }

    // シーン情報
    if (scene.backgroundPrompt) {
      parts.push(scene.backgroundPrompt);
    }
    if (scene.compositionPrompt) {
      parts.push(scene.compositionPrompt);
    }
    if (scene.effectsPrompt) {
      parts.push(scene.effectsPrompt);
    }

    // スタイル
    parts.push("anime style");

    return parts.join(", ");
  }

  /**
   * 日本語でプロンプト内容を説明
   */
  private buildJapaneseDescription(characters: CharacterPrompt[], scene: ScenePrompt): string {
    const parts = [];

    // キャラクター説明
    if (characters.length > 0) {
      characters.forEach((char, index) => {
        const appearance = char.appearance;
        const characterDesc = [
          appearance.gender === 'female' ? '女性' : '男性',
          appearance.hairStyle,
          appearance.eyeColor,
          appearance.clothing,
          char.positionPrompt
        ].filter(Boolean).join('、');
        
        parts.push(`キャラクター${index + 1}: ${characterDesc}`);
      });
    }

    // シーン説明
    const sceneDescriptions = [];
    if (scene.backgroundPrompt) {
      sceneDescriptions.push(scene.backgroundPrompt);
    }
    if (scene.compositionPrompt) {
      sceneDescriptions.push(scene.compositionPrompt);
    }
    
    if (sceneDescriptions.length > 0) {
      parts.push(`シーン: ${sceneDescriptions.join('、')}`);
    }

    parts.push("画質: 高品質なアニメ風イラスト");

    return parts.join('\n');
  }

  /**
   * 画面キャプチャと合わせたプロンプト出力
   */
  public async exportPromptWithCapture(
    project: Project, 
    canvasElement: HTMLCanvasElement
  ): Promise<{ imageBlob: Blob; promptText: string }> {
    // プロンプト生成
    const promptData = this.generatePrompts(project);
    const promptText = this.formatPromptOutput(promptData);

    // 画面キャプチャ
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