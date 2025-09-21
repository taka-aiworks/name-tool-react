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
  // src/services/PromptService.ts の generatePrompts 関数修正

  public generatePrompts(project: Project): PromptOutput {
    // デバッグログ追加
    console.log('📊 PromptService受信データ確認:', {
      panels: project.panels?.length || 0,
      characters: project.characters?.length || 0,
      characterSettings: project.characterSettings,
      characterSettingsKeys: Object.keys(project.characterSettings || {})
    });

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
 * 🆕 新Character型 + CharacterSettings対応のプロンプト生成（修正版）
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

    console.log('🎭 プロンプト生成対象キャラクター:', characterMap.size, '体');

    return Array.from(characterMap.values()).map(char => {
      // 🔧 修正: char.type を使って characterSettings から取得
      const characterType = char.type || char.characterId || char.id;
      const settingsData = project.characterSettings?.[characterType] as any; // 型安全回避
      
      console.log('🔍 キャラクター設定データ取得:', {
        characterType,
        settingsData,
        hasAppearance: !!settingsData?.appearance,
        hasBasePrompt: !!settingsData?.appearance?.basePrompt
      });

      // 🔧 修正: appearance.basePrompt から取得
      let basePrompt = '';
      if (settingsData?.appearance?.basePrompt) {
        basePrompt = settingsData.appearance.basePrompt;
        console.log('✅ basePrompt取得成功:', basePrompt.substring(0, 50));
      } else {
        console.log('❌ basePrompt取得失敗: データが見つかりません');
      }

      const settings = {
        id: char.characterId || char.id,
        name: char.name || 'キャラクター',
        role: settingsData?.role || '主人公',
        gender: 'female' as const,
        basePrompt
      };

      const scenePrompt = this.generateScenePrompt(char);
      const fullPrompt = this.generateFullPrompt(settings.basePrompt, char);

      console.log(`👤 キャラクター "${settings.name}" プロンプト生成完了:`, {
        basePrompt: settings.basePrompt.substring(0, 30) + (settings.basePrompt.length > 30 ? '...' : ''),
        scenePrompt: scenePrompt,
        fullPrompt: fullPrompt.substring(0, 50) + (fullPrompt.length > 50 ? '...' : '')
      });

      return {
        id: char.id,
        name: settings.name,
        role: settings.role,
        basePrompt: settings.basePrompt,
        scenePrompt: scenePrompt,
        fullPrompt: fullPrompt
      };
    });
  }

  /**
 * 🆕 詳細設定からシーンプロンプト生成（完全版）
 * viewType + expression + action + facing + eyeState + mouthState + handGesture
 */
  private generateScenePrompt(character: Character): string {
    const parts = [];

    console.log('🎭 プロンプト生成用キャラクターデータ:', {
      id: character.id,
      name: character.name,
      viewType: (character as any).viewType,
      expression: character.expression,
      action: character.action,
      facing: character.facing,
      eyeState: (character as any).eyeState,
      mouthState: (character as any).mouthState,
      handGesture: (character as any).handGesture
    });

    // 🔧 1. 表示タイプ（構図）- 実際の辞書のcompositionカテゴリを使用
    const viewType = (character as any).viewType;
    if (viewType) {
      const viewTypeMapping: Record<string, string> = {
        'face': 'close-up',         // 辞書のcompositionに存在
        'upper_body': 'upper_body', // 辞書のcompositionに存在  
        'full_body': 'full_body'    // 辞書のcompositionに存在
      };
      const compositionTag = viewTypeMapping[viewType];
      if (compositionTag) {
        parts.push(compositionTag);
        console.log('📐 構図タグ追加:', compositionTag);
      }
    }

    // 🔧 2. 表情
    if (character.expression && character.expression.trim()) {
      const expressionTag = this.getEnglishTag('expressions', character.expression);
      parts.push(expressionTag);
      console.log('😊 表情タグ追加:', expressionTag);
    }

    // 🔧 3. 動作・ポーズ
    if (character.action && character.action.trim()) {
      const actionTag = this.getEnglishTag('pose_manga', character.action);
      parts.push(actionTag);
      console.log('🤸 動作タグ追加:', actionTag);
    }

    // 🔧 4. 体の向き
    if (character.facing && character.facing.trim()) {
      const facingTag = this.getEnglishTag('gaze', character.facing);
      parts.push(facingTag);
      console.log('🔄 向きタグ追加:', facingTag);
    }

    // 🆕 5. 目の状態
    const eyeState = (character as any).eyeState;
    if (eyeState && eyeState.trim()) {
      const eyeTag = this.getEnglishTag('eye_state', eyeState);
      parts.push(eyeTag);
      console.log('👀 目の状態タグ追加:', eyeTag);
    }

    // 🆕 6. 口の状態
    const mouthState = (character as any).mouthState;
    if (mouthState && mouthState.trim()) {
      const mouthTag = this.getEnglishTag('mouth_state', mouthState);
      parts.push(mouthTag);
      console.log('👄 口の状態タグ追加:', mouthTag);
    }

    // 🆕 7. 手の動作
    const handGesture = (character as any).handGesture;
    if (handGesture && handGesture.trim()) {
      const handTag = this.getEnglishTag('hand_gesture', handGesture);
      parts.push(handTag);
      console.log('✋ 手の動作タグ追加:', handTag);
    }

    const result = parts.join(', ');
    console.log('🎯 生成されたシーンプロンプト:', result);
    
    return result;
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
 * 🆕 改良されたプロンプト出力（詳細設定完全対応版）
 */
  public formatPromptOutput(promptData: PromptOutput): string {
    let output = "=== AI画像生成用プロンプト（詳細設定完全対応版） ===\n\n";

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

      // 🔧 正プロンプト生成（詳細設定反映確認）
      const parts = ['masterpiece, best quality'];
      
      panelCharacters.forEach(char => {
        console.log(`🎯 Panel ${index + 1} - ${char.name} プロンプト構成:`, {
          basePrompt: char.basePrompt,
          scenePrompt: char.scenePrompt,
          fullPrompt: char.fullPrompt
        });
        
        if (char.fullPrompt && char.fullPrompt.trim()) {
          parts.push(char.fullPrompt);
        } else {
          // フォールバック: basePromptとscenePromptを個別追加
          if (char.basePrompt && char.basePrompt.trim()) {
            parts.push(char.basePrompt);
          }
          if (char.scenePrompt && char.scenePrompt.trim()) {
            parts.push(char.scenePrompt);
          }
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

      // 🔧 日本語説明（詳細設定込み）
      const japaneseDesc = this.buildJapaneseDescription(panelCharacters, scene);
      output += `【日本語説明】\n${japaneseDesc}\n\n`;

      // ネガティブプロンプト
      const negativePrompt = this.buildNegativePrompt();
      output += `【Negative Prompt】\n${negativePrompt}\n\n`;

      // 🆕 詳細設定の確認情報を追加
      output += `【詳細設定確認】\n`;
      panelCharacters.forEach(char => {
        output += `• ${char.name}: `;
        const details = [];
        if (char.scenePrompt) {
          details.push(`シーン設定あり (${char.scenePrompt.split(', ').length}項目)`);
        } else {
          details.push('シーン設定なし');
        }
        if (char.basePrompt) {
          details.push(`基本設定あり`);
        } else {
          details.push('基本設定なし');
        }
        output += details.join(', ') + '\n';
      });
      output += '\n';

      output += `【推奨設定】\n`;
      output += `• Steps: 20-30\n`;
      output += `• CFG Scale: 7-11\n`;
      output += `• サイズ: 512x768 (縦) または 768x512 (横)\n`;
      output += `• サンプラー: DPM++ 2M Karras\n\n`;

      output += `───────────────────\n\n`;
    });

    // 🔧 キャラクター設定詳細情報
    output += "=== キャラクター詳細設定 ===\n\n";
    promptData.characters.forEach((char, index) => {
      output += `${index + 1}. ${char.name} (${char.role}):\n`;
      
      if (char.basePrompt && char.basePrompt.trim()) {
        output += `   基本設定: ${char.basePrompt}\n`;
      } else {
        output += `   基本設定: 未設定\n`;
      }
      
      if (char.scenePrompt && char.scenePrompt.trim()) {
        output += `   詳細設定: ${char.scenePrompt}\n`;
        
        // 詳細設定の内訳を表示
        const sceneItems = char.scenePrompt.split(', ').filter(item => item.trim());
        if (sceneItems.length > 0) {
          output += `   設定項目: ${sceneItems.join(' | ')}\n`;
        }
      } else {
        output += `   詳細設定: 未設定\n`;
      }
      
      if (char.fullPrompt && char.fullPrompt.trim()) {
        output += `   統合プロンプト: ${char.fullPrompt}\n`;
      }
      
      output += `\n`;
    });

    output += "=== 使用方法 ===\n";
    output += "1. Positive Promptをコピーして画像生成AIに貼り付け\n";
    output += "2. Negative Promptもコピーして貼り付け\n";
    output += "3. 推奨設定を参考に調整\n";
    output += "4. キャラクター詳細設定で一貫性を保持\n";
    output += "5. 詳細設定確認でプロンプト内容を把握\n\n";

    output += "=== 技術情報 ===\n";
    output += `${promptData.storyFlow}\n`;
    output += `生成日時: ${new Date().toLocaleString()}\n`;
    output += `${promptData.technicalNotes}\n`;
    output += `詳細設定対応: v2.0 完全版\n`;

    return output;
  }

  // 🔧 デバッグ用の詳細ログ関数を追加

  /**
   * 🆕 デバッグ用: プロジェクト内容の詳細確認
   */
  public debugProjectData(project: Project): void {
    console.log('🔍 プロジェクトデータ詳細確認開始');
    
    console.log('📊 基本統計:');
    console.log(`- パネル数: ${project.panels.length}`);
    console.log(`- キャラクター数: ${project.characters.length}`);
    console.log(`- 吹き出し数: ${project.speechBubbles.length}`);
    
    console.log('\n👥 キャラクター詳細:');
    project.characters.forEach((char, index) => {
      console.log(`Character ${index + 1}: ${char.name || 'Unnamed'}`);
      console.log(`  ID: ${char.id}`);
      console.log(`  Character ID: ${char.characterId}`);
      console.log(`  Panel ID: ${char.panelId}`);
      console.log(`  Position: (${char.x}, ${char.y})`);
      console.log(`  Scale: ${char.scale}`);
      console.log(`  ViewType: ${(char as any).viewType || '未設定'}`);
      console.log(`  Expression: ${char.expression || '未設定'}`);
      console.log(`  Action: ${char.action || '未設定'}`);
      console.log(`  Facing: ${char.facing || '未設定'}`);
      console.log(`  Eye State: ${(char as any).eyeState || '未設定'}`);
      console.log(`  Mouth State: ${(char as any).mouthState || '未設定'}`);
      console.log(`  Hand Gesture: ${(char as any).handGesture || '未設定'}`);
      console.log('');
    });
    
    console.log('🎭 CharacterSettings:');
    if (project.characterSettings && Object.keys(project.characterSettings).length > 0) {
      Object.entries(project.characterSettings).forEach(([id, settings]) => {
        console.log(`${id}: ${settings.name} (${settings.role})`);
        console.log(`  Base Prompt: ${settings.basePrompt || '未設定'}`);
      });
    } else {
      console.log('CharacterSettings が設定されていません');
    }
    
    console.log('🔍 プロジェクトデータ詳細確認完了');
  }

  // 🔧 buildJapaneseDescription メソッドも詳細設定対応に修正

  private buildJapaneseDescription(characters: CharacterPrompt[], scene: ScenePrompt): string {
    const parts = [];

    characters.forEach((char, index) => {
      const descriptions = [];
      
      // 基本情報
      descriptions.push(`${char.name} (${char.role})`);
      
      // 基本プロンプト表示（短縮）
      if (char.basePrompt && char.basePrompt.trim()) {
        const shortBase = char.basePrompt.length > 20 ? 
          char.basePrompt.substring(0, 20) + '...' : 
          char.basePrompt;
        descriptions.push(`基本: ${shortBase}`);
      }
      
      // 🔧 シーンプロンプトを辞書で日本語変換（詳細版）
      if (char.scenePrompt && char.scenePrompt.trim()) {
        const scenePartsJapanese = char.scenePrompt.split(', ').map(part => {
          part = part.trim();
          
          // 各カテゴリから日本語ラベルを取得
          let japanese = this.getJapaneseLabel('expressions', part);
          if (japanese === part) japanese = this.getJapaneseLabel('pose_manga', part);
          if (japanese === part) japanese = this.getJapaneseLabel('gaze', part);
          if (japanese === part) japanese = this.getJapaneseLabel('eye_state', part);
          if (japanese === part) japanese = this.getJapaneseLabel('mouth_state', part);
          if (japanese === part) japanese = this.getJapaneseLabel('hand_gesture', part);
          if (japanese === part) japanese = this.getJapaneseLabel('composition', part);
          
          // 🔧 特別な変換（辞書にない場合の補完）
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
              'at_viewer': 'こちらを見る',
              'away': 'そっぽ向く',
              'down': '下を見る',
              
              // 表情系
              'neutral': '普通',
              'normal': '普通',
              'neutral_expression': '普通の表情',
              'smiling': '笑顔',
              'sad': '悲しい',
              'angry': '怒り',
              'surprised': '驚き',
              
              // 動作系
              'standing': '立ち',
              'sitting': '座り',
              'walking': '歩く',
              'running': '走る',
              'arms_crossed': '腕組み',
              
              // 目の状態
              'eyes_open': '目を開ける',
              'eyes_closed': '目を閉じる',
              'wink_left': '左ウインク',
              'wink_right': '右ウインク',
              
              // 口の状態
              'mouth_closed': '口を閉じる',
              'open_mouth': '口を開ける',
              'slight_smile': '微笑み',
              'grin': '歯を見せて笑う',
              
              // 手の動作
              'peace_sign': 'ピースサイン',
              'pointing': '指差し',
              'waving': '手を振る',
              'thumbs_up': 'サムズアップ',
              
              // その他
              'single character': '1人',
              'two characters': '2人',
              'group shot': 'グループ'
            };
            japanese = specialTranslations[part] || part;
          }
          
          return japanese;
        }).filter(j => j.trim()).join('、');
        
        if (scenePartsJapanese) {
          descriptions.push(`詳細: ${scenePartsJapanese}`);
        }
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