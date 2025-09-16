// src/services/PromptService.ts
import { Project, Panel, Character, BubbleElement, BackgroundElement, EffectElement } from '../types';

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
   * キャラクター設定からプロンプトを生成（ハイブリッド対応）
   */
  private extractCharacterPrompts(project: Project): CharacterPrompt[] {
    const characterMap = new Map<string, Character>();
    
    // 全パネルからキャラクターを収集
    project.panels.forEach(panel => {
      panel.characters?.forEach(char => {
        if (!characterMap.has(char.id)) {
          characterMap.set(char.id, char);
        }
      });
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
   * キャラクター基本情報プロンプト生成（プロンプトツール連携 + 独立使用対応）
   */
  private generateBasicInfoPrompt(character: Character): string {
    const style = "anime style, manga style";
    const appearance = this.extractAppearanceData(character);
    
    // 基本情報：髪・目・肌・年齢・体型・服装
    const basicParts = [
      style,
      this.translateGender(appearance.gender),
      this.translateHair(appearance.hairColor, appearance.hairStyle),
      this.translateEyes(appearance.eyeColor),
      this.translateSkin(appearance.skinTone),
      this.translateClothing(appearance.clothing, appearance.clothingColor)
    ].filter(part => part && part.trim() !== '');

    return basicParts.join(', ');
  }

  /**
   * ネームレイアウトから配置・ポーズ情報を生成
   */
  private generatePositionPrompt(character: Character): string {
    // キャラクターの座標や配置から判断
    const position = this.analyzeCharacterPosition(character);
    const pose = this.analyzeCharacterPose(character);
    
    const parts = [];
    if (position) parts.push(position);
    if (pose) parts.push(pose);
    
    return parts.length > 0 ? parts.join(', ') : 'standing, neutral pose';
  }

  /**
   * シーン内での役割・状況を生成
   */
  private generateSceneContext(character: Character): string {
    // パネル内での役割を分析
    return 'main character in scene'; // 実装時に詳細化
  }

  /**
   * キャラクターの配置を分析
   */
  private analyzeCharacterPosition(character: Character): string {
    // キャラクターの座標から配置を判断
    // 実装時にcharacter.x, character.y等を使用
    return 'center frame';
  }

  /**
   * キャラクターのポーズを分析
   */
  private analyzeCharacterPose(character: Character): string {
    // キャラクターの状態やアニメーションから判断
    // 実装時にcharacter.animation等を使用
    return 'standing';
  }

  /**
   * キャラクターの外見データを抽出（共通カテゴリ対応）
   */
  private extractAppearanceData(character: Character): CharacterPrompt['appearance'] {
    // Phase 12.1で実装予定のキャラクター見た目設定システムから取得
    // プロンプトツールと同じカテゴリを使用
    
    // TODO: 実際の設定UIから値を取得する実装
    // 現在は基本的なフォールバック値を使用
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

  // === 共通カテゴリ検出関数（プロンプトツールと統一） ===

  private detectGender(character: Character): string {
    // キャラクター名や設定から推定
    const name = character.name || '';
    if (name.includes('子') || name.includes('女') || name.includes('さん')) return 'female';
    if (name.includes('男') || name.includes('くん') || name.includes('君')) return 'male';
    return 'female'; // デフォルト
  }

  private detectHairColor(character: Character): string {
    // TODO: 色設定UIから取得
    return 'black'; // 黒髪（デフォルト）
  }

  private detectHairStyle(character: Character): string {
    // TODO: 髪型設定UIから取得
    return 'medium'; // ミディアム（デフォルト）
  }

  private detectEyeColor(character: Character): string {
    // TODO: 目色設定UIから取得
    return 'brown'; // 茶色（デフォルト）
  }

  private detectSkinTone(character: Character): string {
    // TODO: 肌色設定UIから取得
    return 'light'; // 明るい肌（デフォルト）
  }

  private detectClothing(character: Character): string {
    // TODO: 服装設定UIから取得
    return 'school uniform'; // 制服（デフォルト）
  }

  private detectClothingColor(character: Character): string {
    // TODO: 服装色設定UIから取得
    return 'blue'; // 青（デフォルト）
  }

  /**
   * シーン構成プロンプトを生成
   */
  private extractScenePrompts(project: Project): ScenePrompt[] {
    return project.panels.map(panel => ({
      panelId: panel.id,
      sceneType: this.analyzeSceneType(panel),
      backgroundPrompt: this.generateBackgroundPrompt(panel),
      effectsPrompt: this.generateEffectsPrompt(panel),
      compositionPrompt: this.generateCompositionPrompt(panel),
      elements: {
        background: this.analyzeBackground(panel),
        effects: this.analyzeEffects(panel),
        mood: this.analyzeMood(panel),
        composition: this.analyzeComposition(panel)
      }
    }));
  }

  /**
   * 背景専用プロンプト生成
   */
  private generateBackgroundPrompt(panel: Panel): string | undefined {
    const background = this.analyzeBackground(panel);
    const mood = this.analyzeMood(panel);
    
    if (!background) return undefined;
    
    const parts = [background];
    if (mood) parts.push(mood);
    
    return parts.join(', ');
  }

  /**
   * エフェクト専用プロンプト生成
   */
  private generateEffectsPrompt(panel: Panel): string | undefined {
    const effects = this.analyzeEffects(panel);
    if (!effects || effects.length === 0) return undefined;
    
    return effects.join(', ');
  }

  /**
   * 構図専用プロンプト生成
   */
  private generateCompositionPrompt(panel: Panel): string | undefined {
    const composition = this.analyzeComposition(panel);
    const characterCount = panel.characters?.length || 0;
    
    const parts = [];
    if (composition) parts.push(composition);
    
    // 構図の詳細情報
    if (characterCount === 1) parts.push('single character focus');
    else if (characterCount === 2) parts.push('two character composition');
    else if (characterCount > 2) parts.push('group composition');
    
    return parts.length > 0 ? parts.join(', ') : undefined;
  }

  /**
   * シーンタイプを分析
   */
  private analyzeSceneType(panel: Panel): string {
    const characterCount = panel.characters?.length || 0;
    const bubbleCount = panel.bubbles?.length || 0;
    const hasEffects = panel.effects && panel.effects.length > 0;

    if (hasEffects) return 'action';
    if (characterCount > 1) return 'dialogue';
    if (bubbleCount > 0) return 'speech';
    return 'scene';
  }

  /**
   * 背景要素を分析
   */
  private analyzeBackground(panel: Panel): string | undefined {
    if (!panel.backgrounds || panel.backgrounds.length === 0) {
      return undefined;
    }

    const bg = panel.backgrounds[0]; // 最初の背景を使用
    return this.translateBackgroundType(bg.type, bg.subtype);
  }

  /**
   * エフェクト要素を分析
   */
  private analyzeEffects(panel: Panel): string[] {
    if (!panel.effects || panel.effects.length === 0) {
      return [];
    }

    return panel.effects.map(effect => 
      this.translateEffectType(effect.type, effect.subtype)
    ).filter(effect => effect !== undefined) as string[];
  }

  /**
   * ムードを分析
   */
  private analyzeMood(panel: Panel): string | undefined {
    const hasAction = panel.effects && panel.effects.some(e => 
      e.type === 'speed' || e.type === 'explosion'
    );
    
    if (hasAction) return 'dynamic, energetic';
    
    const dialogueCount = panel.bubbles?.length || 0;
    if (dialogueCount > 2) return 'conversational, calm';
    
    return 'peaceful, serene';
  }

  /**
   * 構図を分析
   */
  private analyzeComposition(panel: Panel): string | undefined {
    const characterCount = panel.characters?.length || 0;
    
    if (characterCount === 0) return 'environmental shot';
    if (characterCount === 1) return 'single character focus';
    if (characterCount === 2) return 'two character composition';
    return 'group composition';
  }

  /**
   * ストーリーフローを生成
   */
  private generateStoryFlow(project: Project): string {
    const panelCount = project.panels.length;
    const totalDialogue = project.panels.reduce((sum, panel) => 
      sum + (panel.bubbles?.length || 0), 0
    );
    
    return `${panelCount} panel manga page, ${totalDialogue} dialogue bubbles, sequential storytelling`;
  }

  /**
   * 技術的ノートを生成
   */
  private generateTechnicalNotes(): string {
    return [
      "Generated by ネーム制作ツール",
      "Recommended settings: High quality, anime/manga style",
      "Panel-by-panel composition for manga layout",
      "Character consistency across panels recommended"
    ].join('\n');
  }

  // === 翻訳ヘルパーメソッド ===

  private translateGender(gender: string): string {
    const mapping: Record<string, string> = {
      'male': 'young man, male',
      'female': 'young woman, female',
      'other': 'person'
    };
    return mapping[gender] || 'person';
  }

  private translateHair(color: string, style: string): string {
    const colorMap: Record<string, string> = {
      'black': 'black hair',
      'brown': 'brown hair', 
      'blonde': 'blonde hair',
      'red': 'red hair',
      'blue': 'blue hair',
      'green': 'green hair'
    };

    const styleMap: Record<string, string> = {
      'short': 'short hair',
      'medium': 'medium length hair',
      'long': 'long hair',
      'ponytail': 'ponytail',
      'twintails': 'twin tails'
    };

    const colorStr = colorMap[color] || 'dark hair';
    const styleStr = styleMap[style] || '';
    
    return [colorStr, styleStr].filter(s => s).join(', ');
  }

  private translateEyes(color: string): string {
    const mapping: Record<string, string> = {
      'brown': 'brown eyes',
      'blue': 'blue eyes',
      'green': 'green eyes',
      'gray': 'gray eyes',
      'black': 'dark eyes'
    };
    return mapping[color] || 'expressive eyes';
  }

  private translateSkin(tone: string): string {
    const mapping: Record<string, string> = {
      'light': 'fair skin',
      'medium': 'medium skin tone',
      'dark': 'dark skin',
      'tan': 'tanned skin'
    };
    return mapping[tone] || 'natural skin tone';
  }

  private translateClothing(type: string, color: string): string {
    const typeMap: Record<string, string> = {
      'school': 'school uniform',
      'casual': 'casual clothing',
      'formal': 'formal wear',
      'sports': 'sportswear'
    };

    const colorMap: Record<string, string> = {
      'blue': 'blue',
      'red': 'red',
      'green': 'green',
      'black': 'black',
      'white': 'white',
      'gray': 'gray'
    };

    const typeStr = typeMap[type] || 'clothing';
    const colorStr = colorMap[color];
    
    return colorStr ? `${colorStr} ${typeStr}` : typeStr;
  }

  private translateBackgroundType(type: string, subtype?: string): string {
    const mapping: Record<string, Record<string, string>> = {
      'natural': {
        'sky': 'blue sky, clouds',
        'forest': 'forest background, trees',
        'beach': 'beach scene, ocean',
        'mountain': 'mountain landscape'
      },
      'indoor': {
        'room': 'indoor room, furniture',
        'kitchen': 'kitchen interior',
        'bathroom': 'bathroom setting'
      },
      'school': {
        'classroom': 'classroom, desks and chairs',
        'hallway': 'school hallway',
        'library': 'library, bookshelves'
      },
      'urban': {
        'street': 'city street, buildings',
        'park': 'urban park, trees',
        'station': 'train station'
      }
    };

    return mapping[type]?.[subtype || 'default'] || `${type} background`;
  }

  private translateEffectType(type: string, subtype?: string): string | undefined {
    const mapping: Record<string, Record<string, string>> = {
      'speed': {
        'horizontal': 'speed lines, motion blur',
        'vertical': 'vertical speed lines',
        'diagonal': 'diagonal motion lines'
      },
      'focus': {
        'radial': 'focus lines, dramatic emphasis',
        'parallel': 'parallel focus lines'
      },
      'explosion': {
        'burst': 'explosion effect, dynamic burst',
        'impact': 'impact lines, collision effect'
      },
      'flash': {
        'shine': 'flash effect, bright light',
        'sparkle': 'sparkle effect, glimmer'
      }
    };

    return mapping[type]?.[subtype || 'default'];
  }

  /**
   * プロンプトを整形されたテキストとして出力（AI画像生成用）
   */
  public formatPromptOutput(promptData: PromptOutput): string {
    let output = "=== Ready-to-Use AI Image Generation Prompts ===\n\n";

    // 各パネル用のプロンプト生成
    promptData.scenes.forEach((scene, index) => {
      output += `━━━ Panel ${index + 1} ━━━\n`;
      
      // キャラクター情報を含む完全プロンプト
      const panelCharacters = promptData.characters.filter(char => 
        // 実際の実装では、パネルに含まれるキャラクターを判定
        true // 仮実装
      );

      // 正プロンプト構築
      const positivePrompt = this.buildPositivePrompt(panelCharacters, scene);
      output += `【Positive Prompt】\n${positivePrompt}\n\n`;

      // 日本語説明
      const japaneseDescription = this.buildJapaneseDescription(panelCharacters, scene);
      output += `【日本語説明】\n${japaneseDescription}\n\n`;

      // 負プロンプト
      const negativePrompt = this.buildNegativePrompt();
      output += `【Negative Prompt】\n${negativePrompt}\n\n`;

      // 推奨設定（シンプル）
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
   * AI画像生成用の正プロンプトを構築（シンプル版）
   */
  private buildPositivePrompt(characters: CharacterPrompt[], scene: ScenePrompt): string {
    const parts = [];

    // 基本品質（最小限）
    parts.push("masterpiece, best quality");

    // キャラクター情報（メイン）
    if (characters.length > 0) {
      characters.forEach(char => {
        // 基本情報のみ（冗長性を削除）
        const cleanBasicInfo = char.basicInfoPrompt
          .replace(/anime style,?\s*/gi, '')
          .replace(/manga style,?\s*/gi, '')
          .trim();
        parts.push(cleanBasicInfo);
        parts.push(char.positionPrompt);
      });
    }

    // シーン情報（重要なもののみ）
    if (scene.backgroundPrompt) {
      parts.push(scene.backgroundPrompt);
    }
    if (scene.compositionPrompt) {
      parts.push(scene.compositionPrompt);
    }
    
    // エフェクトは控えめに
    if (scene.effectsPrompt && !scene.effectsPrompt.includes('speed lines')) {
      parts.push(scene.effectsPrompt);
    }

    // スタイル（シンプル）
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
          this.translateGenderToJapanese(appearance.gender),
          this.translateHairToJapanese(appearance.hairColor, appearance.hairStyle),
          this.translateEyesToJapanese(appearance.eyeColor),
          this.translateClothingToJapanese(appearance.clothing, appearance.clothingColor),
          this.translatePositionToJapanese(char.positionPrompt)
        ].filter(Boolean).join('、');
        
        parts.push(`キャラクター${index + 1}: ${characterDesc}`);
      });
    }

    // シーン説明
    const sceneDescriptions = [];
    if (scene.backgroundPrompt) {
      sceneDescriptions.push(this.translateBackgroundToJapanese(scene.backgroundPrompt));
    }
    if (scene.compositionPrompt) {
      sceneDescriptions.push(this.translateCompositionToJapanese(scene.compositionPrompt));
    }
    
    if (sceneDescriptions.length > 0) {
      parts.push(`シーン: ${sceneDescriptions.join('、')}`);
    }

    // 全体的な説明
    parts.push("画質: 高品質なアニメ風イラスト");

    return parts.join('\n');
  }

  // === 日本語翻訳ヘルパーメソッド ===

  private translateGenderToJapanese(gender: string): string {
    const mapping: Record<string, string> = {
      'male': '男性',
      'female': '女性',
      'other': '人物'
    };
    return mapping[gender] || '人物';
  }

  private translateHairToJapanese(color: string, style: string): string {
    const colorMap: Record<string, string> = {
      'black': '黒髪',
      'brown': '茶髪',
      'blonde': '金髪',
      'red': '赤髪',
      'blue': '青髪',
      'green': '緑髪'
    };

    const styleMap: Record<string, string> = {
      'short': 'ショート',
      'medium': 'ミディアム',
      'long': 'ロング',
      'ponytail': 'ポニーテール',
      'twintails': 'ツインテール'
    };

    const colorStr = colorMap[color] || '髪';
    const styleStr = styleMap[style] || '';
    
    return styleStr ? `${colorStr}の${styleStr}` : colorStr;
  }

  private translateEyesToJapanese(color: string): string {
    const mapping: Record<string, string> = {
      'brown': '茶色の瞳',
      'blue': '青い瞳',
      'green': '緑の瞳',
      'gray': 'グレーの瞳',
      'black': '黒い瞳'
    };
    return mapping[color] || '瞳';
  }

  private translateClothingToJapanese(type: string, color: string): string {
    const typeMap: Record<string, string> = {
      'school uniform': '制服',
      'casual': 'カジュアル服',
      'formal': 'フォーマル服',
      'sports': 'スポーツウェア'
    };

    const colorMap: Record<string, string> = {
      'blue': '青い',
      'red': '赤い',
      'green': '緑の',
      'black': '黒い',
      'white': '白い',
      'gray': 'グレーの'
    };

    const typeStr = typeMap[type] || '服装';
    const colorStr = colorMap[color];
    
    return colorStr ? `${colorStr}${typeStr}` : typeStr;
  }

  private translatePositionToJapanese(positionPrompt: string): string {
    if (positionPrompt.includes('standing')) return '立っている';
    if (positionPrompt.includes('sitting')) return '座っている';
    if (positionPrompt.includes('walking')) return '歩いている';
    if (positionPrompt.includes('running')) return '走っている';
    return '立っている';
  }

  private translateBackgroundToJapanese(backgroundPrompt: string): string {
    if (backgroundPrompt.includes('classroom')) return '教室';
    if (backgroundPrompt.includes('school')) return '学校';
    if (backgroundPrompt.includes('outdoor')) return '屋外';
    if (backgroundPrompt.includes('indoor')) return '室内';
    if (backgroundPrompt.includes('park')) return '公園';
    if (backgroundPrompt.includes('street')) return '街中';
    return '背景';
  }

  private translateCompositionToJapanese(compositionPrompt: string): string {
    if (compositionPrompt.includes('close-up')) return 'クローズアップ';
    if (compositionPrompt.includes('full body')) return '全身';
    if (compositionPrompt.includes('upper body')) return '上半身';
    if (compositionPrompt.includes('two character')) return '2人構図';
    if (compositionPrompt.includes('single character')) return '1人構図';
    return '構図';
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