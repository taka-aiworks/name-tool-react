// src/components/CanvasArea/sceneTemplates.ts - 辞書対応版（修正版）
import { Character, SpeechBubble, BackgroundElement, EffectElement, ToneElement } from "../../types";

export interface EnhancedSceneTemplate {
  name: string;
  description: string;
  category: 'basic' | 'emotion' | 'action' | 'daily' | 'special';
  characters: Omit<Character, "id">[];
  speechBubbles: Omit<SpeechBubble, "id">[];
  backgrounds?: Omit<BackgroundElement, "id">[];
  effects?: Omit<EffectElement, "id">[];
  tones?: Omit<ToneElement, "id">[];
}

// 辞書データ取得ヘルパー
const getDictionaryData = () => {
  if (typeof window !== 'undefined' && window.DEFAULT_SFW_DICT?.SFW) {
    return window.DEFAULT_SFW_DICT.SFW;
  }
  
  // フォールバック辞書（正しい辞書タグ使用）
  return {
    expressions: [
      { tag: "smiling", label: "笑顔" },
      { tag: "sad", label: "悲しい" },
      { tag: "angry", label: "怒り" },
      { tag: "surprised", label: "驚き" },
      { tag: "worried", label: "心配" },
      { tag: "neutral_expression", label: "普通" }
    ],
    pose_manga: [
      { tag: "standing", label: "立ち" },
      { tag: "sitting", label: "座り" },
      { tag: "walking", label: "歩く" },
      { tag: "running", label: "走る" },
      { tag: "arms_crossed", label: "腕組み" },
      { tag: "pointing", label: "指差し" },
      { tag: "waving", label: "手を振る" }
    ],
    gaze: [
      { tag: "looking_at_viewer", label: "正面" },
      { tag: "looking_to_the_side", label: "横向き" },
      { tag: "looking_away", label: "そっぽ向く" },
      { tag: "looking_down", label: "下向き" },
      { tag: "looking_up", label: "上向き" }
    ]
  };
};

// ==========================================
// 辞書ベース動的シーンテンプレート生成
// ==========================================

// 基本シーン生成関数
const createBaseScene = (
  sceneName: string,
  description: string,
  category: EnhancedSceneTemplate['category'],
  characterConfigs: Array<{
    type: string;
    name: string;
    expression: string;
    action: string;
    facing: string;
    viewType: "face" | "upper_body" | "full_body";
    position: { x: number; y: number }; // 相対位置（0-1）
    scale: number;
  }>,
  bubbleConfigs: Array<{
    type: string;
    text: string;
    position: { x: number; y: number }; // 相対位置（0-1）
    size: { width: number; height: number };
  }>,
  backgroundConfig?: {
    type: 'solid' | 'gradient';
    colors: string[];
    opacity: number;
  },
  effectConfig?: {
    type: 'speed' | 'focus' | 'explosion' | 'flash';
    position: { x: number; y: number; width: number; height: number }; // 相対位置
    intensity: number;
    direction: string;
  },
  toneConfig?: {
    pattern: string;
    density: number;
    opacity: number;
    coverage: { x: number; y: number; width: number; height: number }; // 相対位置
  }
): EnhancedSceneTemplate => {
  // キャラクター生成
  const characters = characterConfigs.map((config, index) => ({
    panelId: 1,
    characterId: `character_${index + 1}`, // 汎用的なID: character_1, character_2, ...
    type: `character_${index + 1}`,        // typeも汎用的に
    name: config.name,
    x: config.position.x * 600, // 相対→絶対座標変換（600px基準）
    y: config.position.y * 300, // 相対→絶対座標変換（300px基準）
    scale: config.scale,
    facing: config.facing,
    expression: config.expression,
    action: config.action,
    viewType: config.viewType,
    isGlobalPosition: false,
  } as Omit<Character, "id">));

  // 吹き出し生成
  const speechBubbles = bubbleConfigs.map((config) => ({
    panelId: 1,
    type: config.type,
    text: config.text,
    x: config.position.x * 600,
    y: config.position.y * 300,
    scale: 1.0,
    width: config.size.width,
    height: config.size.height,
    vertical: true,
    isGlobalPosition: false,
  } as Omit<SpeechBubble, "id">));

  // 背景生成（コマ全体にフィット）
  const backgrounds: Omit<BackgroundElement, "id">[] = backgroundConfig ? [{
    panelId: 1,
    type: backgroundConfig.type,
    x: 0,
    y: 0,
    width: 600, // コマ幅にぴったり
    height: 300, // コマ高さにぴったり
    rotation: 0,
    zIndex: -10,
    opacity: backgroundConfig.opacity,
    solidColor: backgroundConfig.type === 'solid' ? backgroundConfig.colors[0] : undefined,
    gradientType: backgroundConfig.type === 'gradient' ? 'linear' : undefined,
    gradientColors: backgroundConfig.type === 'gradient' ? backgroundConfig.colors : undefined,
    gradientDirection: 90,
  }] : [];

  // 効果線生成（コマサイズに合わせて配置）
  const effects: Omit<EffectElement, "id">[] = effectConfig ? [{
    panelId: 1,
    type: effectConfig.type as any,
    x: effectConfig.position.x * 600,
    y: effectConfig.position.y * 300,
    width: effectConfig.position.width * 600,
    height: effectConfig.position.height * 300,
    direction: effectConfig.direction as any,
    intensity: effectConfig.intensity,
    density: 0.7,
    length: 30,
    angle: 0,
    color: "#333333",
    opacity: 0.6,
    blur: 0,
    selected: false,
    zIndex: 5,
    isGlobalPosition: false,
  }] : [];

  // トーン生成（コマ全体または指定範囲にフィット）
  const tones: Omit<ToneElement, "id">[] = toneConfig ? [{
    panelId: 1,
    type: "halftone",
    pattern: toneConfig.pattern as any,
    x: toneConfig.coverage.x,
    y: toneConfig.coverage.y,
    width: toneConfig.coverage.width,
    height: toneConfig.coverage.height,
    density: toneConfig.density,
    opacity: toneConfig.opacity,
    rotation: 0,
    scale: 1.0,
    blendMode: "multiply",
    contrast: 1.0,
    brightness: 0,
    invert: false,
    maskEnabled: false,
    maskShape: "rectangle",
    maskFeather: 0,
    selected: false,
    zIndex: 3,
    isGlobalPosition: false,
    visible: true,
  }] : [];

  return {
    name: sceneName,
    description: description,
    category: category,
    characters: characters,
    speechBubbles: speechBubbles,
    backgrounds: backgrounds,
    effects: effects,
    tones: tones,
  };
};

// ==========================================
// 辞書データ活用の豊富なシーンテンプレート
// ==========================================

// 感情カテゴリのシーン
export const createEmotionScenes = (): Record<string, EnhancedSceneTemplate> => {
  return {
    // 😊 嬉しいシーン
    happy_scene: createBaseScene(
      "😊 嬉しいシーン",
      "キャラクターが喜んでいるシーン",
      'emotion',
      [{
        type: "character_1", // 汎用的なtype
        name: "主人公",
        expression: "smiling",  // 辞書対応: happy → smiling
        action: "standing",
        facing: "looking_at_viewer",  // 辞書対応: at_viewer → looking_at_viewer
        viewType: "upper_body",
        position: { x: 0.5, y: 0.6 },
        scale: 2.2
      }],
      [{
        type: "普通",
        text: "やったー！",
        position: { x: 0.15, y: 0.15 },
        size: { width: 80, height: 60 }
      }],
      {
        type: 'gradient',
        colors: ['#fffacd', '#ffebcd'],
        opacity: 0.3
      },
      {
        type: 'flash',
        position: { x: 0.2, y: 0.2, width: 0.6, height: 0.6 },
        intensity: 0.6,
        direction: 'radial'
      }
    ),

    // 😢 悲しいシーン
    sad_scene: createBaseScene(
      "😢 悲しいシーン",
      "キャラクターが悲しんでいるシーン",
      'emotion',
      [{
        type: "character_1", // 汎用的なtype
        name: "ヒロイン",
        expression: "sad",
        action: "sitting",
        facing: "looking_down",  // 辞書対応: down → looking_down
        viewType: "upper_body",
        position: { x: 0.5, y: 0.65 },
        scale: 2.0
      }],
      [{
        type: "心の声",
        text: "つらい...",
        position: { x: 0.7, y: 0.2 },
        size: { width: 70, height: 50 }
      }],
      {
        type: 'solid',
        colors: ['#e6f3ff'],
        opacity: 0.4
      },
      undefined,
      {
        pattern: 'dots_85',
        density: 0.3,
        opacity: 0.4,
        coverage: { x: 0, y: 0, width: 600, height: 300 }
      }
    ),

    // 😡 怒りシーン
    angry_scene: createBaseScene(
      "😡 怒りシーン",
      "キャラクターが怒っているシーン",
      'emotion',
      [{
        type: "character_1",
        name: "主人公",
        expression: "angry",
        action: "arms_crossed",
        facing: "looking_at_viewer",  // 辞書対応
        viewType: "upper_body",
        position: { x: 0.5, y: 0.6 },
        scale: 2.3
      }],
      [{
        type: "叫び",
        text: "許さない！",
        position: { x: 0.15, y: 0.1 },
        size: { width: 90, height: 70 }
      }],
      {
        type: 'gradient',
        colors: ['#ffe4e1', '#ffcccb'],
        opacity: 0.4
      },
      {
        type: 'explosion',
        position: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
        intensity: 0.8,
        direction: 'radial'
      }
    ),

    // 😲 驚きシーン（改良版）
    surprise_enhanced: createBaseScene(
      "😲 大驚きシーン",
      "キャラクターが大きく驚くシーン",
      'emotion',
      [{
        type: "character_1",
        name: "主人公",
        expression: "surprised",
        action: "standing",
        facing: "looking_at_viewer",  // 辞書対応
        viewType: "face",
        position: { x: 0.5, y: 0.6 },
        scale: 2.8
      }],
      [{
        type: "叫び",
        text: "えええ！？",
        position: { x: 0.1, y: 0.05 },
        size: { width: 100, height: 80 }
      }],
      undefined,
      {
        type: 'focus',
        position: { x: 0.15, y: 0.15, width: 0.7, height: 0.7 },
        intensity: 0.9,
        direction: 'radial'
      }
    ),

    // 😟 心配シーン
    worried_scene: createBaseScene(
      "😟 心配シーン",
      "キャラクターが心配しているシーン",
      'emotion',
      [{
        type: "character_1",
        name: "ヒロイン",
        expression: "worried",
        action: "standing",
        facing: "looking_away",  // 辞書対応: away → looking_away
        viewType: "upper_body",
        position: { x: 0.5, y: 0.6 },
        scale: 2.1
      }],
      [{
        type: "心の声",
        text: "大丈夫かな...",
        position: { x: 0.65, y: 0.15 },
        size: { width: 85, height: 65 }
      }],
      {
        type: 'solid',
        colors: ['#f0f8ff'],
        opacity: 0.3
      },
      undefined,
      {
        pattern: 'lines_diagonal',
        density: 0.2,
        opacity: 0.3,
        coverage: { x: 0, y: 0, width: 600, height: 200 }
      }
    )
  };
};

// アクションカテゴリのシーン
export const createActionScenes = (): Record<string, EnhancedSceneTemplate> => {
  return {
    // 🏃 走るシーン
    running_scene: createBaseScene(
      "🏃 走るシーン",
      "キャラクターが走っているシーン",
      'action',
      [{
        type: "character_1",
        name: "主人公",
        expression: "neutral_expression",
        action: "running",
        facing: "looking_to_the_side",  // 辞書対応: to_side → looking_to_the_side
        viewType: "full_body",
        position: { x: 0.4, y: 0.7 },
        scale: 2.0
      }],
      [{
        type: "叫び",
        text: "急がなきゃ！",
        position: { x: 0.1, y: 0.1 },
        size: { width: 85, height: 60 }
      }],
      undefined,
      {
        type: 'speed',
        position: { x: 0.05, y: 0.3, width: 0.5, height: 0.4 },
        intensity: 0.8,
        direction: 'horizontal'
      }
    ),

    // 👉 指差しシーン
    pointing_scene: createBaseScene(
      "👉 指差しシーン",
      "キャラクターが何かを指差すシーン",
      'action',
      [{
        type: "character_1",
        name: "主人公",
        expression: "surprised",
        action: "pointing",
        facing: "looking_to_the_side",  // 辞書対応
        viewType: "upper_body",
        position: { x: 0.4, y: 0.6 },
        scale: 2.2
      }],
      [{
        type: "普通",
        text: "あそこだ！",
        position: { x: 0.1, y: 0.15 },
        size: { width: 75, height: 55 }
      }],
      {
        type: 'gradient',
        colors: ['#f0ffff', '#e0ffff'],
        opacity: 0.2
      },
      {
        type: 'focus',
        position: { x: 0.6, y: 0.2, width: 0.3, height: 0.6 },
        intensity: 0.5,
        direction: 'radial'
      }
    ),

    // 🤝 握手シーン
    handshake_scene: createBaseScene(
      "🤝 握手シーン",
      "二人が握手するシーン",
      'action',
      [
        {
          type: "character_1",
          name: "主人公",
          expression: "smiling",
          action: "standing",
          facing: "looking_to_the_side",  // 辞書対応
          viewType: "upper_body",
          position: { x: 0.3, y: 0.6 },
          scale: 1.8
        },
        {
          type: "character_2",
          name: "ヒロイン",
          expression: "smiling",
          action: "standing",
          facing: "looking_to_the_side",  // 辞書対応
          viewType: "upper_body",
          position: { x: 0.7, y: 0.6 },
          scale: 1.8
        }
      ],
      [{
        type: "普通",
        text: "よろしく！",
        position: { x: 0.4, y: 0.1 },
        size: { width: 80, height: 60 }
      }],
      {
        type: 'gradient',
        colors: ['#fffaf0', '#fff8dc'],
        opacity: 0.3
      }
    )
  };
};

// 日常カテゴリのシーン
export const createDailyScenes = (): Record<string, EnhancedSceneTemplate> => {
  return {
    // 🍽️ 食事シーン
    eating_scene: createBaseScene(
      "🍽️ 食事シーン",
      "キャラクターが食事しているシーン",
      'daily',
      [{
        type: "character_1",
        name: "ヒロイン",
        expression: "smiling",  // 辞書対応: happy → smiling
        action: "sitting",
        facing: "looking_at_viewer",  // 辞書対応
        viewType: "upper_body",
        position: { x: 0.5, y: 0.65 },
        scale: 2.0
      }],
      [{
        type: "普通",
        text: "美味しい♪",
        position: { x: 0.15, y: 0.15 },
        size: { width: 80, height: 60 }
      }],
      {
        type: 'solid',
        colors: ['#fafafa'],
        opacity: 0.3
      },
      undefined,
      {
        pattern: 'dots_120',
        density: 0.15,
        opacity: 0.2,
        coverage: { x: 0, y: 200, width: 600, height: 100 }
      }
    ),

    // 📚 勉強シーン
    studying_scene: createBaseScene(
      "📚 勉強シーン",
      "キャラクターが勉強しているシーン",
      'daily',
      [{
        type: "character_1",
        name: "主人公",
        expression: "neutral_expression",
        action: "sitting",
        facing: "looking_down",  // 辞書対応
        viewType: "upper_body",
        position: { x: 0.5, y: 0.7 },
        scale: 2.0
      }],
      [{
        type: "心の声",
        text: "集中集中...",
        position: { x: 0.65, y: 0.2 },
        size: { width: 75, height: 55 }
      }],
      {
        type: 'solid',
        colors: ['#f5f5f5'],
        opacity: 0.4
      },
      undefined,
      {
        pattern: 'lines_horizontal',
        density: 0.1,
        opacity: 0.15,
        coverage: { x: 0, y: 0, width: 600, height: 300 }
      }
    ),

    // 💬 基本会話（改良版）
    conversation_enhanced: createBaseScene(
      "💬 基本会話",
      "二人の日常的な会話シーン",
      'daily',
      [
        {
          type: "character_1",
          name: "主人公",
          expression: "smiling",
          action: "standing",
          facing: "looking_to_the_side",  // 辞書対応
          viewType: "upper_body",
          position: { x: 0.25, y: 0.6 },
          scale: 2.0
        },
        {
          type: "character_2",
          name: "ヒロイン",
          expression: "smiling",
          action: "standing",
          facing: "looking_to_the_side",  // 辞書対応
          viewType: "upper_body",
          position: { x: 0.75, y: 0.6 },
          scale: 2.0
        }
      ],
      [
        {
          type: "普通",
          text: "おはよう",
          position: { x: 0.05, y: 0.15 },
          size: { width: 70, height: 50 }
        },
        {
          type: "普通",
          text: "おはよう♪",
          position: { x: 0.82, y: 0.15 },
          size: { width: 75, height: 50 }
        }
      ],
      {
        type: 'gradient',
        colors: ['#ffffff', '#f8f8ff'],
        opacity: 0.2
      }
    )
  };
};

// 特殊カテゴリのシーン
export const createSpecialScenes = (): Record<string, EnhancedSceneTemplate> => {
  return {
    // ✨ 魔法シーン
    magic_scene: createBaseScene(
      "✨ 魔法シーン",
      "魔法を使っているシーン",
      'special',
      [{
        type: "character_1",
        name: "魔法使い",
        expression: "neutral_expression",
        action: "standing",
        facing: "looking_at_viewer",  // 辞書対応
        viewType: "full_body",
        position: { x: 0.5, y: 0.7 },
        scale: 2.0
      }],
      [{
        type: "普通",
        text: "エイッ！",
        position: { x: 0.15, y: 0.1 },
        size: { width: 60, height: 50 }
      }],
      {
        type: 'gradient',
        colors: ['#e6e6fa', '#dda0dd'],
        opacity: 0.4
      },
      {
        type: 'flash',
        position: { x: 0.3, y: 0.2, width: 0.4, height: 0.6 },
        intensity: 0.7,
        direction: 'radial'
      },
      {
        pattern: 'dots_60',
        density: 0.2,
        opacity: 0.3,
        coverage: { x: 100, y: 50, width: 400, height: 200 }
      }
    ),

    // 🌟 決意シーン
    determination_scene: createBaseScene(
      "🌟 決意シーン",
      "キャラクターが決意を固めるシーン",
      'special',
      [{
        type: "character_1",
        name: "主人公",
        expression: "neutral_expression",
        action: "arms_crossed",
        facing: "looking_at_viewer",  // 辞書対応
        viewType: "upper_body",
        position: { x: 0.5, y: 0.6 },
        scale: 2.4
      }],
      [{
        type: "心の声",
        text: "やってやる！",
        position: { x: 0.65, y: 0.15 },
        size: { width: 90, height: 65 }
      }],
      {
        type: 'gradient',
        colors: ['#fffacd', '#ffd700'],
        opacity: 0.3
      },
      {
        type: 'focus',
        position: { x: 0.2, y: 0.2, width: 0.6, height: 0.6 },
        intensity: 0.6,
        direction: 'radial'
      }
    )
  };
};

// ==========================================
// 統合・管理関数（辞書対応版）
// ==========================================

// 全シーンテンプレート取得（辞書ベース + 既存）
export const getAllSceneTemplates = (): Record<string, EnhancedSceneTemplate> => {
  const emotionScenes = createEmotionScenes();
  const actionScenes = createActionScenes();
  const dailyScenes = createDailyScenes();
  const specialScenes = createSpecialScenes();
  
  return {
    // 辞書ベーステンプレート
    ...emotionScenes,
    ...actionScenes,
    ...dailyScenes,
    ...specialScenes,
    
    // 既存テンプレート（後方互換性）
    basic_dialogue: {
      name: "💬 基本会話（旧）",
      description: "2人の会話シーン（従来版）",
      category: 'basic',
      characters: [
        {
          panelId: 1,
          characterId: "character_1", // 汎用的なID
          type: "character_1",
          name: "主人公",
          x: 150,
          y: 180,
          scale: 2.0,
          facing: "looking_to_the_side",  // 辞書対応
          expression: "neutral_expression",
          action: "standing",
          viewType: "upper_body",
          isGlobalPosition: false,
        },
        {
          panelId: 1,
          characterId: "character_2", // 汎用的なID
          type: "character_2", 
          name: "ヒロイン",
          x: 450,
          y: 180,
          scale: 2.0,
          facing: "looking_to_the_side",  // 辞書対応
          expression: "neutral_expression",
          action: "standing",
          viewType: "upper_body",
          isGlobalPosition: false,
        },
      ],
      speechBubbles: [
        {
          panelId: 1,
          type: "普通",
          text: "こんにちは",
          x: 100,
          y: 50,
          scale: 1.0,
          width: 80,
          height: 60,
          vertical: true,
          isGlobalPosition: false,
        },
        {
          panelId: 1,
          type: "普通",
          text: "こんにちは",
          x: 500,
          y: 50,
          scale: 1.0,
          width: 80,
          height: 60,
          vertical: true,
          isGlobalPosition: false,
        },
      ],
    } as EnhancedSceneTemplate
  };
};

// カテゴリ別取得（拡張版）
export const getTemplatesByCategory = (category: EnhancedSceneTemplate['category']): Record<string, EnhancedSceneTemplate> => {
  const allTemplates = getAllSceneTemplates();
  const filtered: Record<string, EnhancedSceneTemplate> = {};
  
  Object.entries(allTemplates).forEach(([key, template]) => {
    if (template.category === category) {
      filtered[key] = template;
    }
  });
  
  return filtered;
};

// 統合テンプレート適用関数（コマフィット版）
export const applyEnhancedSceneTemplate = (
  templateKey: string,
  panels: any[],
  existingCharacters: any[],
  existingSpeechBubbles: any[],
  existingBackgrounds: any[],
  existingEffects: any[],
  existingTones: any[],
  selectedPanel?: any
): {
  characters: any[];
  speechBubbles: any[];
  backgrounds: any[];
  effects: any[];
  tones: any[];
} => {
  const template = getAllSceneTemplates()[templateKey];
  if (!template || panels.length === 0) {
    return {
      characters: existingCharacters,
      speechBubbles: existingSpeechBubbles,
      backgrounds: existingBackgrounds,
      effects: existingEffects,
      tones: existingTones,
    };
  }

  const targetPanel = selectedPanel || panels[0];
  console.log(`🎭 辞書ベーステンプレート適用: ${template.name} → パネル${targetPanel.id}`);

  // キャラクター生成（パネルサイズに合わせてスケール）
  const newCharacters = template.characters.map((char) => ({
    ...char,
    id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: targetPanel.id,
    x: targetPanel.x + (char.x / 600) * targetPanel.width,
    y: targetPanel.y + (char.y / 300) * targetPanel.height,
  }));

  // 吹き出し生成（パネルサイズに合わせてスケール）
  const newSpeechBubbles = template.speechBubbles.map((bubble) => ({
    ...bubble,
    id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: targetPanel.id,
    x: targetPanel.x + (bubble.x / 600) * targetPanel.width,
    y: targetPanel.y + (bubble.y / 300) * targetPanel.height,
    width: (bubble.width / 600) * targetPanel.width,
    height: (bubble.height / 300) * targetPanel.height,
  }));

  // 背景生成（パネル全体にぴったりフィット）
  const newBackgrounds = (template.backgrounds || []).map((bg) => ({
    ...bg,
    id: `bg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: targetPanel.id,
    x: targetPanel.x,
    y: targetPanel.y,
    width: targetPanel.width,
    height: targetPanel.height,
  }));

  // 効果線生成（パネルサイズに合わせてスケール・フィット）
  const newEffects = (template.effects || []).map((effect) => ({
    ...effect,
    id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: targetPanel.id,
    x: targetPanel.x + (effect.x / 600) * targetPanel.width,
    y: targetPanel.y + (effect.y / 300) * targetPanel.height,
    width: (effect.width / 600) * targetPanel.width,
    height: (effect.height / 300) * targetPanel.height,
  }));

  // トーン生成（パネルサイズに合わせてスケール・フィット）
  const newTones = (template.tones || []).map((tone) => ({
    ...tone,
    id: `tone_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: targetPanel.id,
    x: (tone.x / 600) * targetPanel.width,
    y: (tone.y / 300) * targetPanel.height,
    width: (tone.width / 600) * targetPanel.width,
    height: (tone.height / 300) * targetPanel.height,
  }));

  console.log(`✅ 辞書ベース要素追加: キャラ${newCharacters.length}個、吹き出し${newSpeechBubbles.length}個、背景${newBackgrounds.length}個、効果線${newEffects.length}個、トーン${newTones.length}個`);

  return {
    characters: [...existingCharacters, ...newCharacters],
    speechBubbles: [...existingSpeechBubbles, ...newSpeechBubbles], 
    backgrounds: [...existingBackgrounds, ...newBackgrounds],
    effects: [...existingEffects, ...newEffects],
    tones: [...existingTones, ...newTones],
  };
};

// ==========================================
// 後方互換性のための既存関数（維持）
// ==========================================

export interface SceneTemplate {
  characters: Omit<Character, "id">[];
  speechBubbles: Omit<SpeechBubble, "id">[];
}

export const sceneTemplates: Record<string, SceneTemplate> = {
  daily: {
    characters: [
      {
        panelId: 1,
        characterId: "character_1",
        type: "character_1",
        name: "主人公",
        x: 150,
        y: 180,
        scale: 2.0,
        facing: "looking_to_the_side",
        expression: "neutral_expression",
        action: "standing",
        viewType: "upper_body",
        isGlobalPosition: false,
      }
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "普通",
        text: "こんにちは",
        x: 100,
        y: 50,
        scale: 1.0,
        width: 80,
        height: 60,
        vertical: true,
        isGlobalPosition: false,
      }
    ],
  },
  action: {
    characters: [
      {
        panelId: 1,
        characterId: "character_1",
        type: "character_1",
        name: "主人公",
        x: 200,
        y: 200,
        scale: 2.3,
        facing: "looking_to_the_side",
        expression: "neutral_expression",
        action: "running",
        viewType: "full_body",
        isGlobalPosition: false,
      }
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "叫び",
        text: "行くぞ！",
        x: 100,
        y: 50,
        scale: 1.1,
        width: 70,
        height: 60,
        vertical: true,
        isGlobalPosition: false,
      }
    ],
  },
  emotional: {
    characters: [
      {
        panelId: 1,
        characterId: "character_1",
        type: "character_1",
        name: "ヒロイン",
        x: 270,
        y: 180,
        scale: 2.2,
        facing: "looking_down",
        expression: "worried",
        action: "standing",
        viewType: "upper_body",
        isGlobalPosition: false,
      }
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "心の声",
        text: "どうしよう...",
        x: 400,
        y: 80,
        scale: 1.0,
        width: 90,
        height: 70,
        vertical: true,
        isGlobalPosition: false,
      }
    ],
  },
  surprise: {
    characters: [
      {
        panelId: 1,
        characterId: "character_1",
        type: "character_1",
        name: "主人公",
        x: 300,
        y: 180,
        scale: 2.5,
        facing: "looking_at_viewer",
        expression: "surprised",
        action: "standing",
        viewType: "face",
        isGlobalPosition: false,
      }
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "叫び",
        text: "えっ！？",
        x: 150,
        y: 50,
        scale: 1.2,
        width: 80,
        height: 70,
        vertical: true,
        isGlobalPosition: false,
      }
    ],
  },
};

export const applySceneTemplate = (
  sceneType: string,
  panels: any[],
  existingCharacters: Character[],
  existingSpeechBubbles: SpeechBubble[],
  selectedPanel?: any
): { characters: Character[], speechBubbles: SpeechBubble[] } => {
  const template = sceneTemplates[sceneType];
  if (!template || panels.length === 0) {
    return { characters: existingCharacters, speechBubbles: existingSpeechBubbles };
  }

  const targetPanel = selectedPanel || panels[0];
  console.log(`🎭 後方互換テンプレート適用: ${sceneType} → パネル${targetPanel.id}`);

  const newCharacters = template.characters.map((char) => ({
    ...char,
    id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: targetPanel.id,
    x: (char.x / 600) * targetPanel.width + targetPanel.x,
    y: (char.y / 300) * targetPanel.height + targetPanel.y,
  }));

  const newSpeechBubbles = template.speechBubbles.map((bubble) => ({
    ...bubble,
    id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: targetPanel.id,
    x: (bubble.x / 600) * targetPanel.width + targetPanel.x,
    y: (bubble.y / 300) * targetPanel.height + targetPanel.y,
  }));

  return {
    characters: [...existingCharacters, ...newCharacters],
    speechBubbles: [...existingSpeechBubbles, ...newSpeechBubbles],
  };
};