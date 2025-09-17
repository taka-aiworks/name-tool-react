// src/services/PromptService.ts - カテゴリ修正版
import { Panel, Character, SpeechBubble, BackgroundElement, EffectElement } from '../types';

// 🆕 辞書型定義
declare global {
  interface Window {
    DEFAULT_SFW_DICT: {
      SFW: {
        gender: Array<{ tag: string; label: string }>;
        hair_length: Array<{ tag: string; label: string }>;
        hair_style: Array<{ tag: string; label: string }>;
        eyes: Array<{ tag: string; label: string }>;
        colors: Array<{ tag: string; label: string }>;
        outfit: Array<{ tag: string; label: string; cat?: string }>;
        expressions: Array<{ tag: string; label: string }>;
        pose: Array<{ tag: string; label: string }>;
        pose_manga: Array<{ tag: string; label: string }>;
        background: Array<{ tag: string; label: string }>;
        composition: Array<{ tag: string; label: string }>;
        view: Array<{ tag: string; label: string }>;
        lighting: Array<{ tag: string; label: string }>;
        [key: string]: Array<{ tag: string; label: string }>;
      };
    };
  }
}

// Project型を定義
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
  basicInfoPrompt: string;
  positionPrompt: string;
  sceneContext?: string;
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
  backgroundPrompt?: string;
  effectsPrompt?: string;
  compositionPrompt?: string;
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
   * 🔧 修正版: 辞書データを取得
   */
  private getDictionary() {
    if (typeof window !== 'undefined' && window.DEFAULT_SFW_DICT) {
      return window.DEFAULT_SFW_DICT.SFW;
    }
    
    // 🔧 修正されたフォールバック辞書
    return {
      gender: [
        { tag: "female", label: "女性" },
        { tag: "male", label: "男性" }
      ],
      hair_length: [  // 🔧 hair_style → hair_length
        { tag: "long hair", label: "ロングヘア" },
        { tag: "medium hair", label: "ミディアムヘア" },
        { tag: "short hair", label: "ショートヘア" }
      ],
      hair_style: [
        { tag: "ponytail", label: "ポニーテール" },
        { tag: "twin tails", label: "ツインテール" }
      ],
      colors: [  // 🔧 目の色と服の色を統合
        { tag: "brown", label: "茶色" },
        { tag: "blue", label: "青" },
        { tag: "black", label: "黒" },
        { tag: "red", label: "赤" }
      ],
      eyes: [
        { tag: "round eyes", label: "丸い目" },
        { tag: "almond eyes", label: "アーモンド形の目" }
      ],
      outfit: [
        { tag: "school uniform", label: "学校制服" },
        { tag: "casual", label: "カジュアル" }
      ],
      expressions: [
        { tag: "smiling", label: "笑顔" },
        { tag: "happy", label: "嬉しそう" },
        { tag: "surprised", label: "驚いた" },
        { tag: "normal", label: "普通" }
      ],
      pose_manga: [  // 🔧 pose → pose_manga
        { tag: "standing", label: "立っている" },
        { tag: "sitting", label: "座っている" },
        { tag: "walking", label: "歩いている" },
        { tag: "running", label: "走っている" }
      ],
      background: [{ tag: "classroom", label: "教室" }],
      composition: [{ tag: "full_body", label: "全身" }],
      view: [{ tag: "front_view", label: "正面" }],
      lighting: [{ tag: "soft lighting", label: "柔らかい照明" }]
    };
  }

  /**
   * 🔧 修正版: 辞書からタグを検索
   */
  private findTagByLabel(category: string, searchText: string): string {
    const dict = this.getDictionary();
    const categoryData = dict[category as keyof typeof dict] || [];
    
    const found = categoryData.find(item => 
      item.label.includes(searchText) || 
      item.tag.includes(searchText.toLowerCase()) ||
      item.tag === searchText
    );
    
    return found ? found.tag : searchText;
  }

  /**
   * 🔧 修正版: 辞書から日本語ラベルを取得
   */
  private findLabelByTag(category: string, tag: string): string {
    const dict = this.getDictionary();
    const categoryData = dict[category as keyof typeof dict] || [];
    
    const found = categoryData.find(item => 
      item.tag === tag || 
      item.tag.includes(tag) ||
      tag.includes(item.tag)
    );
    
    return found ? found.label : tag;
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
   * キャラクター設定からプロンプトを生成
   */
  private extractCharacterPrompts(project: Project): CharacterPrompt[] {
    const characterMap = new Map<string, Character>();
    
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
   * 🔧 修正版: 正しいカテゴリを使用したプロンプト生成
   */
  private generateBasicInfoPrompt(character: Character): string {
    const appearance = this.extractAppearanceData(character);
    
    // 🔧 正しいカテゴリを使用
    const genderTag = this.findTagByLabel('gender', appearance.gender);
    const hairLengthTag = this.findTagByLabel('hair_length', appearance.hairStyle); // hair_length使用
    const hairColorTag = this.findTagByLabel('colors', appearance.hairColor); // colors使用
    const eyeColorTag = this.findTagByLabel('colors', appearance.eyeColor); // colors使用  
    const outfitTag = this.findTagByLabel('outfit', appearance.clothing);
    const clothingColorTag = this.findTagByLabel('colors', appearance.clothingColor); // colors使用

    // 表情・ポーズ情報を追加
    const expressionTag = this.findTagByLabel('expressions', character.faceExpression || 'normal');
    const poseTag = this.findTagByLabel('pose_manga', character.bodyPose || 'standing'); // pose_manga使用

    const parts = [
      genderTag,
      expressionTag,
      hairLengthTag,
      hairColorTag && `${hairColorTag} hair`,
      eyeColorTag && `${eyeColorTag} eyes`,
      outfitTag,
      clothingColorTag && `${clothingColorTag} clothing`,
      poseTag
    ].filter(Boolean);

    return parts.join(', ');
  }

  /**
   * ネームレイアウトから配置情報を生成
   */
  private generatePositionPrompt(character: Character): string {
    const position = this.analyzeCharacterPosition(character);
    
    return position || 'center frame';
  }

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
   * 🔧 修正版: キャラクター外見データ抽出
   */
  private extractAppearanceData(character: Character): CharacterPrompt['appearance'] {
    if (character.appearance) {
      return {
        gender: character.appearance.gender,
        hairColor: character.appearance.hairColor,
        hairStyle: character.appearance.hairStyle,
        eyeColor: character.appearance.eyeColor,
        skinTone: character.appearance.skinTone,
        clothing: character.appearance.clothing,
        clothingColor: character.appearance.clothingColor
      };
    }

    // フォールバック
    return {
      gender: this.detectGender(character),
      hairColor: 'black',
      hairStyle: 'medium hair',  // 🔧 hair_lengthに存在する値
      eyeColor: 'brown',         // 🔧 colorsに存在する値
      skinTone: 'fair',
      clothing: 'school uniform',
      clothingColor: 'blue'      // 🔧 colorsに存在する値
    };
  }

  private detectGender(character: Character): string {
    const name = character.name || '';
    if (name.includes('子') || name.includes('女') || name.includes('さん')) {
      return 'female';
    }
    if (name.includes('男') || name.includes('くん') || name.includes('君')) {
      return 'male';
    }
    return 'female';
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

  private generateBackgroundPrompt(panel: Panel, project: Project): string | undefined {
    const backgrounds = project.backgrounds.filter(bg => bg.panelId === panel.id);
    if (backgrounds.length === 0) return undefined;

    const bg = backgrounds[0];
    const backgroundTag = this.findTagByLabel('background', bg.type);
    
    return backgroundTag;
  }

  private generateEffectsPrompt(panel: Panel, project: Project): string | undefined {
    const effects = project.effects.filter(effect => effect.panelId === panel.id);
    if (effects.length === 0) return undefined;
    
    return effects.map(effect => 
      this.translateEffectType(effect.type, effect.direction)
    ).filter(Boolean).join(', ');
  }

  private generateCompositionPrompt(panel: Panel, project: Project): string | undefined {
    const characterCount = project.characters.filter(char => char.panelId === panel.id).length;
    
    if (characterCount === 1) {
      return 'full_body';
    } else if (characterCount === 2) {
      return 'two character composition';
    } else if (characterCount > 2) {
      return 'group composition';
    }
    
    return undefined;
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

  private buildNegativePrompt(): string {
    const basicNegative = [
      'lowres', 'bad anatomy', 'bad hands', 'text', 'error',
      'worst quality', 'low quality', 'blurry', 'bad face',
      'deformed face', 'extra fingers', 'watermark', 'signature',
      'multiple people'
    ];

    return basicNegative.join(', ');
  }

  /**
   * 🔧 修正版: プロンプト整形出力
   */
  public formatPromptOutput(promptData: PromptOutput): string {
    let output = "=== Ready-to-Use AI Image Generation Prompts ===\n\n";

    promptData.scenes.forEach((scene, index) => {
      output += `━━━ Panel ${index + 1} ━━━\n`;
      
      const panelCharacters = promptData.characters;

      const positivePrompt = this.buildPositivePrompt(panelCharacters, scene);
      output += `【Positive Prompt】\n${positivePrompt}\n\n`;

      const japaneseDescription = this.buildJapaneseDescription(panelCharacters, scene);
      output += `【日本語説明】\n${japaneseDescription}\n\n`;

      const negativePrompt = this.buildNegativePrompt();
      output += `【Negative Prompt】\n${negativePrompt}\n\n`;

      output += `【Recommended Settings】\n`;
      output += `• Steps: 20-28\n`;
      output += `• CFG Scale: 7-9\n`;
      output += `• Size: 512x768 (portrait) or 768x512 (landscape)\n`;
      output += `• Sampler: DPM++ 2M Karras\n\n`;

      output += `───────────────────────────────\n\n`;
    });

    output += "=== Character Reference (For Consistency) ===\n\n";
    promptData.characters.forEach((char, index) => {
      output += `Character ${index + 1} (${char.name}):\n`;
      output += `masterpiece, best quality, ${char.basicInfoPrompt}\n`;
      output += `Position: ${char.positionPrompt}\n\n`;
    });

    output += "=== Usage Guide ===\n";
    output += "1. Copy the Positive Prompt to your AI image generator\n";
    output += "2. Copy the Negative Prompt to negative prompt field\n";
    output += "3. Adjust settings according to recommendations\n";
    output += "4. Use Character Reference for consistent character generation\n\n";

    output += "=== Technical Info ===\n";
    output += `Story: ${promptData.storyFlow}\n`;
    output += `Generated: ${new Date().toLocaleString()}\n`;
    output += `Tool: ${promptData.technicalNotes}\n`;

    return output;
  }

  /**
   * 🔧 修正版: 重複排除された正プロンプト構築
   */
  private buildPositivePrompt(characters: CharacterPrompt[], scene: ScenePrompt): string {
    const parts = [];

    parts.push("masterpiece, best quality");

    if (characters.length > 0) {
      characters.forEach(char => {
        parts.push(char.basicInfoPrompt);
        if (char.positionPrompt !== 'center frame') {
          parts.push(char.positionPrompt);
        }
      });
    }

    if (scene.backgroundPrompt) {
      parts.push(scene.backgroundPrompt);
    }
    if (scene.compositionPrompt) {
      parts.push(scene.compositionPrompt);
    }
    if (scene.effectsPrompt) {
      parts.push(scene.effectsPrompt);
    }

    parts.push("anime style");

    return parts.join(", ");
  }

  /**
   * 🔧 修正版: 正しいカテゴリを使用した日本語説明
   */
  private buildJapaneseDescription(characters: CharacterPrompt[], scene: ScenePrompt): string {
    const parts = [];

    if (characters.length > 0) {
      characters.forEach((char, index) => {
        const appearance = char.appearance;
        
        const genderLabel = this.findLabelByTag('gender', appearance.gender);
        const hairStyleLabel = this.findLabelByTag('hair_length', appearance.hairStyle); // 🔧 修正
        const hairColorLabel = this.findLabelByTag('colors', appearance.hairColor); // 🔧 修正
        const eyeLabel = this.findLabelByTag('colors', appearance.eyeColor); // 🔧 修正
        const clothingLabel = this.findLabelByTag('outfit', appearance.clothing);
        const positionLabel = this.findLabelByTag('pose_manga', char.positionPrompt.split(', ')[0] || 'standing');
        
        const characterDesc = [
          genderLabel,
          hairStyleLabel,
          hairColorLabel && `${hairColorLabel}い髪`,
          eyeLabel && `${eyeLabel}い瞳`,
          clothingLabel,
          positionLabel
        ].filter(Boolean).join('、');
        
        parts.push(`キャラクター${index + 1}: ${characterDesc}`);
      });
    }

    const sceneDescriptions = [];
    if (scene.backgroundPrompt) {
      sceneDescriptions.push(this.findLabelByTag('background', scene.backgroundPrompt));
    }
    if (scene.compositionPrompt) {
      sceneDescriptions.push(this.findLabelByTag('composition', scene.compositionPrompt));
    }
    
    if (sceneDescriptions.length > 0) {
      parts.push(`シーン: ${sceneDescriptions.join('、')}`);
    }

    parts.push("画質: 高品質なアニメ風イラスト");

    return parts.join('\n');
  }

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