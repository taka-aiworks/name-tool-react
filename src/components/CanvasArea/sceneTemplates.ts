// src/CanvasArea/sceneTemplates.ts - 辞書対応版（エラー修正済み）
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

// ==========================================
// 🔧 辞書対応版シーンテンプレート
// ==========================================

// 基本シーン生成関数（辞書対応版）
const createUnifiedScene = (
  sceneName: string,
  description: string,
  category: EnhancedSceneTemplate['category'],
  characterConfigs: Array<{
    type: string;
    name: string;
    viewType: "face" | "upper_body" | "full_body";
    position: { x: number; y: number }; // 相対位置（0-1）
    scale: number;
    // 🌟 辞書対応設定
    expression?: string;  // expressions カテゴリ
    action?: string;     // pose_manga カテゴリ
    facing?: string;     // gaze カテゴリ
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
    intensity: number;
    direction: string;
  },
  toneConfig?: {
    pattern: string;
    density: number;
    opacity: number;
  }
): EnhancedSceneTemplate => {
  
  // 🔧 キャラクター生成（辞書対応版）
  const characters = characterConfigs.map((config, index) => ({
    panelId: 1,
    characterId: `character_${index + 1}`,
    type: `character_${index + 1}`,
    name: config.name,
    x: config.position.x, // 相対座標として保存
    y: config.position.y, // 相対座標として保存
    scale: config.scale,
    // 🔧 辞書対応：expressions, pose_manga, gaze から選択
    facing: config.facing || "at_viewer",           // gaze カテゴリ
    expression: config.expression || "neutral_expression", // expressions カテゴリ
    action: config.action || "standing",           // pose_manga カテゴリ
    eyeState: "",        // 詳細設定は空でOK
    mouthState: "",      // 詳細設定は空でOK
    handGesture: "",     // 詳細設定は空でOK
    viewType: config.viewType,
    isGlobalPosition: true,
  } as Omit<Character, "id">));

  // 🔧 吹き出し生成（統一版）
  const speechBubbles = bubbleConfigs.map((config, index) => ({
    panelId: 1,
    type: config.type,
    text: config.text,
    x: config.position.x, // 相対座標として保存
    y: config.position.y, // 相対座標として保存
    scale: 1.0,
    width: config.size.width,
    height: config.size.height,
    vertical: true,
    isGlobalPosition: true,
  } as Omit<SpeechBubble, "id">));

  // 🔧 背景生成（統一版）
  const backgrounds: Omit<BackgroundElement, "id">[] = backgroundConfig ? [{
    panelId: 1,
    type: backgroundConfig.type,
    x: 0,    // パネル全体：相対座標
    y: 0,    // パネル全体：相対座標
    width: 1,   // パネル全体：相対座標
    height: 1,  // パネル全体：相対座標
    rotation: 0,
    zIndex: -10,
    opacity: backgroundConfig.opacity,
    solidColor: backgroundConfig.type === 'solid' ? backgroundConfig.colors[0] : undefined,
    gradientType: backgroundConfig.type === 'gradient' ? 'linear' : undefined,
    gradientColors: backgroundConfig.type === 'gradient' ? backgroundConfig.colors : undefined,
    gradientDirection: 90,
  }] : [];

  // 🔧 効果線生成（統一版）
  const effects: Omit<EffectElement, "id">[] = effectConfig ? [{
    panelId: 1,
    type: effectConfig.type as any,
    x: 0,        // パネル全体：相対座標
    y: 0,        // パネル全体：相対座標
    width: 1,    // パネル全体：相対座標
    height: 1,   // パネル全体：相対座標
    direction: effectConfig.direction as any,
    intensity: effectConfig.intensity,
    density: 0.7,
    length: 30,
    angle: 0,
    color: "#333333",
    opacity: 0.6,
    blur: 0,
    selected: false,
    zIndex: 100,
    isGlobalPosition: false,
  }] : [];

  // 🔧 トーン生成（統一版）
  const tones: Omit<ToneElement, "id">[] = toneConfig ? [{
    panelId: 1,
    type: "halftone",
    pattern: toneConfig.pattern as any,
    x: 0,        // パネル全体：相対座標
    y: 0,        // パネル全体：相対座標
    width: 1,    // パネル全体：相対座標
    height: 1,   // パネル全体：相対座標
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
// 🎭 感情カテゴリのシーン（辞書対応版）
// ==========================================
export const createEmotionScenes = (): Record<string, EnhancedSceneTemplate> => {
  return {
    // 😊 基本的な嬉しいシーン
    happy_basic: createUnifiedScene(
      "😊 嬉しい表情",
      "キャラクターの基本的な喜びの表現",
      'emotion',
      [{
        type: "character_1",
        name: "主人公",
        viewType: "upper_body",
        position: { x: 0.5, y: 0.6 },
        scale: 2.2,
        // 🔧 辞書対応: expressions, pose_manga, gaze
        expression: "smiling",          // ✅ 辞書にある
        action: "standing",            // ✅ 辞書にある
        facing: "at_viewer",           // ✅ 辞書にある（gazeカテゴリ）
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
        intensity: 0.5,
        direction: 'radial'
      }
    ),

    // 😢 悲しい・落ち込みシーン
    sad_basic: createUnifiedScene(
      "😢 悲しみ・落ち込み",
      "キャラクターの悲しい感情表現",
      'emotion',
      [{
        type: "character_1",
        name: "主人公",
        viewType: "upper_body",
        position: { x: 0.5, y: 0.65 },
        scale: 2.0,
        // 🔧 辞書対応
        expression: "sad",             // ✅ 辞書にある
        action: "sitting",            // ✅ 辞書にある
        facing: "down",               // ✅ 辞書にある（gazeカテゴリ）
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
        opacity: 0.4
      }
    ),

    // 😡 怒り・イライラシーン
    angry_basic: createUnifiedScene(
      "😡 怒り・イライラ",
      "キャラクターの怒りの感情表現",
      'emotion',
      [{
        type: "character_1",
        name: "主人公",
        viewType: "upper_body",
        position: { x: 0.5, y: 0.6 },
        scale: 2.3,
        // 🔧 辞書対応
        expression: "angry_look",      // ✅ 辞書にある
        action: "arms_crossed",       // ✅ 辞書にある
        facing: "at_viewer",          // ✅ 辞書にある
      }],
      [{
        type: "叫び",
        text: "もう！",
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
        intensity: 0.7,
        direction: 'radial'
      }
    ),

    // 😲 驚き・ショックシーン
    surprise_basic: createUnifiedScene(
      "😲 驚き・ショック",
      "キャラクターの驚きの表現",
      'emotion',
      [{
        type: "character_1",
        name: "主人公",
        viewType: "face",
        position: { x: 0.5, y: 0.6 },
        scale: 2.8,
        // 🔧 辞書対応
        expression: "surprised",       // ✅ 辞書にある
        action: "standing",           // ✅ 辞書にある
        facing: "at_viewer",          // ✅ 辞書にある
      }],
      [{
        type: "叫び",
        text: "えっ！？",
        position: { x: 0.1, y: 0.05 },
        size: { width: 100, height: 80 }
      }],
      undefined,
      {
        type: 'focus',
        intensity: 0.8,
        direction: 'radial'
      }
    ),

    // 😰 心配・不安シーン
    worried_basic: createUnifiedScene(
      "😰 心配・不安",
      "キャラクターの心配している表現",
      'emotion',
      [{
        type: "character_1",
        name: "主人公",
        viewType: "upper_body",
        position: { x: 0.5, y: 0.6 },
        scale: 2.1,
        // 🔧 辞書対応
        expression: "worried_face",    // ✅ 辞書にある
        action: "standing",           // ✅ 辞書にある
        facing: "away",               // ✅ 辞書にある
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
        opacity: 0.3
      }
    )
  };
};

// ==========================================
// ⚡ アクションカテゴリのシーン（辞書対応版）
// ==========================================
export const createActionScenes = (): Record<string, EnhancedSceneTemplate> => {
  return {
    // 🏃 走る・急ぐシーン
    running_basic: createUnifiedScene(
      "🏃 走る・急ぐ",
      "キャラクターが急いでいるシーン",
      'action',
      [{
        type: "character_1",
        name: "主人公",
        viewType: "full_body",
        position: { x: 0.4, y: 0.7 },
        scale: 2.0,
        // 🔧 辞書対応
        expression: "neutral_expression", // ✅ 辞書にある
        action: "running",               // ✅ 辞書にある
        facing: "to_side",               // ✅ 辞書にある（gazeカテゴリ）
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
        intensity: 0.8,
        direction: 'horizontal'
      }
    ),

    // 👉 指差し・発見シーン
    pointing_basic: createUnifiedScene(
      "👉 指差し・発見",
      "何かを指差して発見するシーン",
      'action',
      [{
        type: "character_1",
        name: "主人公",
        viewType: "upper_body",
        position: { x: 0.4, y: 0.6 },
        scale: 2.2,
        // 🔧 辞書対応
        expression: "surprised",         // ✅ 辞書にある
        action: "pointing",             // ✅ 辞書にある（pose_mangaカテゴリ）
        facing: "to_side",              // ✅ 辞書にある
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
        intensity: 0.4,
        direction: 'radial'
      }
    ),

    // 💥 衝撃・ぶつかるシーン
    impact_basic: createUnifiedScene(
      "💥 衝撃・ぶつかる",
      "衝撃や衝突の表現",
      'action',
      [{
        type: "character_1",
        name: "主人公",
        viewType: "upper_body",
        position: { x: 0.5, y: 0.7 },
        scale: 2.1,
        // 🔧 辞書対応
        expression: "surprised",         // ✅ 辞書にある
        action: "standing",             // ✅ 辞書にある
        facing: "at_viewer",            // ✅ 辞書にある
      }],
      [{
        type: "叫び",
        text: "うわー！",
        position: { x: 0.15, y: 0.1 },
        size: { width: 80, height: 65 }
      }],
      undefined,
      {
        type: 'explosion',
        intensity: 0.9,
        direction: 'radial'
      }
    ),

    // 🤝 二人の会話・対話シーン
    dialogue_basic: createUnifiedScene(
      "🤝 二人の対話",
      "二人のキャラクターの会話シーン",
      'action',
      [
        {
          type: "character_1",
          name: "主人公",
          viewType: "upper_body",
          position: { x: 0.3, y: 0.6 },
          scale: 1.8,
          // 🔧 辞書対応（キャラ1）
          expression: "smiling",         // ✅ 辞書にある
          action: "standing",           // ✅ 辞書にある
          facing: "to_side",            // ✅ 辞書にある
        },
        {
          type: "character_2", 
          name: "相手",
          viewType: "upper_body",
          position: { x: 0.7, y: 0.6 },
          scale: 1.8,
          // 🔧 辞書対応（キャラ2）
          expression: "smiling",         // ✅ 辞書にある
          action: "standing",           // ✅ 辞書にある
          facing: "to_side",            // ✅ 辞書にある
        }
      ],
      [
        {
          type: "普通",
          text: "こんにちは",
          position: { x: 0.05, y: 0.15 },
          size: { width: 70, height: 50 }
        },
        {
          type: "普通",
          text: "こんにちは！",
          position: { x: 0.8, y: 0.15 },
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

// ==========================================
// 🏠 日常カテゴリのシーン（辞書対応版）
// ==========================================
export const createDailyScenes = (): Record<string, EnhancedSceneTemplate> => {
  return {
    // 🍽️ 食べる・飲むシーン
    eating_basic: createUnifiedScene(
      "🍽️ 食べる・飲む",
      "食事や飲み物のシーン",
      'daily',
      [{
        type: "character_1",
        name: "主人公",
        viewType: "upper_body",
        position: { x: 0.5, y: 0.65 },
        scale: 2.0,
        // 🔧 辞書対応
        expression: "smiling",          // ✅ 辞書にある
        action: "sitting",             // ✅ 辞書にある
        facing: "down",                // ✅ 辞書にある
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
        opacity: 0.2
      }
    ),

    // 📱 電話・スマホシーン
    phone_basic: createUnifiedScene(
      "📱 電話・スマホ",
      "電話やスマホを使うシーン",
      'daily',
      [{
        type: "character_1",
        name: "主人公",
        viewType: "upper_body",
        position: { x: 0.5, y: 0.6 },
        scale: 2.1,
        // 🔧 辞書対応
        expression: "neutral_expression", // ✅ 辞書にある
        action: "standing",              // ✅ 辞書にある
        facing: "to_side",               // ✅ 辞書にある
      }],
      [{
        type: "普通",
        text: "もしもし",
        position: { x: 0.65, y: 0.2 },
        size: { width: 70, height: 50 }
      }],
      {
        type: 'solid',
        colors: ['#f5f5f5'],
        opacity: 0.2
      }
    ),

    // 🚶 歩く・移動シーン
    walking_basic: createUnifiedScene(
      "🚶 歩く・移動",
      "歩いたり移動したりするシーン",
      'daily',
      [{
        type: "character_1",
        name: "主人公",
        viewType: "full_body",
        position: { x: 0.4, y: 0.7 },
        scale: 1.9,
        // 🔧 辞書対応
        expression: "neutral_expression", // ✅ 辞書にある
        action: "walking",               // ✅ 辞書にある
        facing: "to_side",               // ✅ 辞書にある
      }],
      [{
        type: "心の声",
        text: "さて...",
        position: { x: 0.65, y: 0.2 },
        size: { width: 60, height: 45 }
      }],
      {
        type: 'gradient',
        colors: ['#ffffff', '#f0f8ff'],
        opacity: 0.3
      }
    ),

    // 💭 考える・悩むシーン
    thinking_basic: createUnifiedScene(
      "💭 考える・悩む",
      "考え事や悩んでいるシーン",
      'daily',
      [{
        type: "character_1",
        name: "主人公",
        viewType: "upper_body",
        position: { x: 0.5, y: 0.6 },
        scale: 2.0,
        // 🔧 辞書対応
        expression: "thoughtful",        // ✅ 辞書にある
        action: "standing",             // ✅ 辞書にある
        facing: "away",                 // ✅ 辞書にある
      }],
      [{
        type: "心の声",
        text: "うーん...",
        position: { x: 0.7, y: 0.2 },
        size: { width: 65, height: 50 }
      }],
      {
        type: 'solid',
        colors: ['#f8f8ff'],
        opacity: 0.3
      },
      undefined,
      {
        pattern: 'lines_horizontal',
        density: 0.1,
        opacity: 0.15
      }
    )
  };
};

// ==========================================
// ✨ 特殊カテゴリのシーン（辞書対応版）
// ==========================================
export const createSpecialScenes = (): Record<string, EnhancedSceneTemplate> => {
  return {
    // ✨ 決意・やる気シーン
    determination_basic: createUnifiedScene(
      "✨ 決意・やる気",
      "決意を固めたりやる気を出すシーン",
      'special',
      [{
        type: "character_1",
        name: "主人公",
        viewType: "upper_body",
        position: { x: 0.5, y: 0.6 },
        scale: 2.4,
        // 🔧 辞書対応
        expression: "determined",        // ✅ 辞書にある
        action: "arms_crossed",         // ✅ 辞書にある
        facing: "at_viewer",            // ✅ 辞書にある
      }],
      [{
        type: "心の声",
        text: "よし！",
        position: { x: 0.65, y: 0.15 },
        size: { width: 60, height: 50 }
      }],
      {
        type: 'gradient',
        colors: ['#fffacd', '#ffd700'],
        opacity: 0.3
      },
      {
        type: 'focus',
        intensity: 0.6,
        direction: 'radial'
      }
    ),

    // 🌟 ひらめき・発見シーン
    idea_basic: createUnifiedScene(
      "🌟 ひらめき・発見",
      "何かをひらめいたり発見したりするシーン",
      'special',
      [{
        type: "character_1",
        name: "主人公",
        viewType: "upper_body",
        position: { x: 0.5, y: 0.6 },
        scale: 2.2,
        // 🔧 辞書対応
        expression: "surprised",         // ✅ 辞書にある
        action: "pointing",             // ✅ 辞書にある
        facing: "up",                   // ✅ 辞書にある
      }],
      [{
        type: "普通",
        text: "そうか！",
        position: { x: 0.15, y: 0.1 },
        size: { width: 70, height: 55 }
      }],
      {
        type: 'gradient',
        colors: ['#fff8dc', '#fffacd'],
        opacity: 0.4
      },
      {
        type: 'flash',
        intensity: 0.7,
        direction: 'radial'
      }
    ),

    // 😴 疲れ・眠いシーン
    tired_basic: createUnifiedScene(
      "😴 疲れ・眠い",
      "疲れていたり眠かったりするシーン",
      'special',
      [{
        type: "character_1",
        name: "主人公",
        viewType: "upper_body",
        position: { x: 0.5, y: 0.65 },
        scale: 2.0,
        // 🔧 辞書対応（sleepyがない場合はsadで代用）
        expression: "sad",              // ✅ 辞書にある（疲れた表情として）
        action: "sitting",             // ✅ 辞書にある
        facing: "down",                // ✅ 辞書にある
      }],
      [{
        type: "心の声",
        text: "眠い...",
        position: { x: 0.65, y: 0.2 },
        size: { width: 65, height: 50 }
      }],
      {
        type: 'solid',
        colors: ['#e6e6fa'],
        opacity: 0.4
      },
      undefined,
      {
        pattern: 'dots_60',
        density: 0.2,
        opacity: 0.3
      }
    ),

    // 💪 頑張る・努力シーン
    effort_basic: createUnifiedScene(
      "💪 頑張る・努力",
      "頑張ったり努力したりするシーン",
      'special',
      [{
        type: "character_1",
        name: "主人公",
        viewType: "upper_body",
        position: { x: 0.5, y: 0.6 },
        scale: 2.3,
        // 🔧 辞書対応
        expression: "determined",        // ✅ 辞書にある
        action: "arms_crossed",         // ✅ 辞書にある
        facing: "at_viewer",            // ✅ 辞書にある
      }],
      [{
        type: "叫び",
        text: "頑張る！",
        position: { x: 0.15, y: 0.1 },
        size: { width: 80, height: 60 }
      }],
      {
        type: 'gradient',
        colors: ['#ffe4b5', '#ffd700'],
        opacity: 0.3
      },
    )
  };
};

// ==========================================
// 🔧 統合・管理関数（辞書対応版）
// ==========================================

// 全シーンテンプレート取得（辞書対応版）
export const getAllSceneTemplates = (): Record<string, EnhancedSceneTemplate> => {
  const emotionScenes = createEmotionScenes();
  const actionScenes = createActionScenes();
  const dailyScenes = createDailyScenes();
  const specialScenes = createSpecialScenes();
  
  return {
    // 辞書対応版テンプレート
    ...emotionScenes,
    ...actionScenes,
    ...dailyScenes,
    ...specialScenes,
  };
};

// カテゴリ別取得（辞書対応版）
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

// 🔧 辞書対応版シーンテンプレート適用関数
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
    console.error(`❌ テンプレート適用失敗: ${templateKey}`);
    return {
      characters: existingCharacters,
      speechBubbles: existingSpeechBubbles,
      backgrounds: existingBackgrounds,
      effects: existingEffects,
      tones: existingTones,
    };
  }

  const targetPanel = selectedPanel || panels[0];
  console.log(`🎭 辞書対応版テンプレート適用: ${template.name} → パネル${targetPanel.id}`);

  // 既存のパネル内要素をクリア
  const filteredCharacters = existingCharacters.filter(char => char.panelId !== targetPanel.id);
  const filteredBubbles = existingSpeechBubbles.filter(bubble => bubble.panelId !== targetPanel.id);
  const filteredBackgrounds = existingBackgrounds.filter(bg => bg.panelId !== targetPanel.id);
  const filteredEffects = existingEffects.filter(effect => effect.panelId !== targetPanel.id);
  const filteredTones = existingTones.filter(tone => tone.panelId !== targetPanel.id);

  // 🔧 キャラクター生成（辞書対応版）
  const newCharacters = template.characters.map((char, index) => {
    const uniqueId = `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${index}`;
    
    // 🔧 相対座標→絶対座標変換
    const absoluteX = targetPanel.x + (char.x * targetPanel.width);
    const absoluteY = targetPanel.y + (char.y * targetPanel.height);
    
    console.log(`👤 キャラクター辞書対応生成: ${char.name}`);
    console.log(`   相対座標: (${char.x}, ${char.y}) → 絶対座標: (${absoluteX.toFixed(1)}, ${absoluteY.toFixed(1)})`);
    console.log(`   辞書対応設定: ${char.expression}/${char.action}/${char.facing}`);
    
    return {
      ...char,
      id: uniqueId,
      panelId: targetPanel.id,
      x: absoluteX,
      y: absoluteY,
      isGlobalPosition: true,
      // 🔧 辞書対応設定を確実に適用
      facing: char.facing || "at_viewer",
      expression: char.expression || "neutral_expression", 
      action: char.action || "standing",
      eyeState: char.eyeState || "",
      mouthState: char.mouthState || "",
      handGesture: char.handGesture || "",
    };
  });

  // 🔧 吹き出し生成（統一版）
  const newSpeechBubbles = template.speechBubbles.map((bubble, index) => {
    const uniqueId = `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${index}`;
    
    // 🔧 相対座標→絶対座標変換
    const absoluteX = targetPanel.x + (bubble.x * targetPanel.width);
    const absoluteY = targetPanel.y + (bubble.y * targetPanel.height);
    
    console.log(`💬 吹き出し統一生成: "${bubble.text}"`);
    console.log(`   相対座標: (${bubble.x}, ${bubble.y}) → 絶対座標: (${absoluteX.toFixed(1)}, ${absoluteY.toFixed(1)})`);
    
    return {
      ...bubble,
      id: uniqueId,
      panelId: targetPanel.id,
      x: absoluteX,
      y: absoluteY,
      isGlobalPosition: true,
    };
  });

  // 🔧 背景生成（統一版）
  const newBackgrounds = (template.backgrounds || []).map((bg, index) => {
    const uniqueId = `bg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${index}`;
    
    console.log(`🎨 背景統一生成: ${bg.type}`);
    console.log(`   相対座標: (${bg.x}, ${bg.y}, ${bg.width}, ${bg.height})`);
    
    return {
      ...bg,
      id: uniqueId,
      panelId: targetPanel.id,
      x: bg.x,
      y: bg.y,
      width: bg.width,
      height: bg.height,
      type: bg.type || 'solid',
      rotation: bg.rotation || 0,
      zIndex: bg.zIndex || -10,
      opacity: bg.opacity || 0.3,
      solidColor: bg.solidColor || '#CCCCCC',
      gradientType: bg.gradientType || 'linear',
      gradientColors: bg.gradientColors || ['#FFFFFF', '#CCCCCC'],
      gradientDirection: bg.gradientDirection || 90,
    };
  });

  // 🔧 効果線生成（統一版）
  const newEffects = (template.effects || []).map((effect, index) => {
    const uniqueId = `effect_${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${index}`;
    
    console.log(`⚡ 効果線統一生成: ${effect.type}`);
    console.log(`   パネル全体相対座標: (${effect.x}, ${effect.y}, ${effect.width}, ${effect.height})`);
    
    return {
      ...effect,
      id: uniqueId,
      panelId: targetPanel.id,
      x: effect.x,
      y: effect.y,
      width: effect.width,
      height: effect.height,
      type: effect.type || 'speed',
      direction: effect.direction || 'horizontal',
      intensity: effect.intensity || 0.6,
      density: effect.density || 0.7,
      length: effect.length || 30,
      angle: effect.angle || 0,
      color: effect.color || "#333333",
      opacity: effect.opacity || 0.6,
      blur: effect.blur || 0,
      selected: false,
      zIndex: effect.zIndex || 100,
      isGlobalPosition: false,
    };
  });

  // 🔧 トーン生成（統一版）
  const newTones = (template.tones || []).map((tone, index) => {
    const uniqueId = `tone_${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${index}`;
    
    console.log(`🎯 トーン統一生成: ${tone.pattern}`);
    console.log(`   パネル全体相対座標: (${tone.x}, ${tone.y}, ${tone.width}, ${tone.height})`);
    
    return {
      ...tone,
      id: uniqueId,
      panelId: targetPanel.id,
      x: tone.x,
      y: tone.y,
      width: tone.width,
      height: tone.height,
      type: tone.type || 'halftone',
      pattern: tone.pattern || 'dots_60',
      density: tone.density || 0.5,
      opacity: tone.opacity || 0.7,
      rotation: tone.rotation || 0,
      scale: tone.scale || 1.0,
      blendMode: tone.blendMode || 'multiply',
      contrast: tone.contrast || 1.0,
      brightness: tone.brightness || 0,
      invert: tone.invert || false,
      maskEnabled: tone.maskEnabled || false,
      maskShape: tone.maskShape || 'rectangle',
      maskFeather: tone.maskFeather || 0,
      selected: false,
      zIndex: tone.zIndex || 0,
      isGlobalPosition: false,
      visible: tone.visible ?? true,
    };
  });

  console.log(`✅ 辞書対応版で要素生成完了:`);
  console.log(`   キャラクター: ${newCharacters.length}個（絶対座標・辞書対応設定）`);
  console.log(`   吹き出し: ${newSpeechBubbles.length}個（絶対座標）`);
  console.log(`   背景: ${newBackgrounds.length}個（相対座標）`);
  console.log(`   効果線: ${newEffects.length}個（相対座標）`);
  console.log(`   トーン: ${newTones.length}個（相対座標）`);

  return {
    characters: [...filteredCharacters, ...newCharacters],
    speechBubbles: [...filteredBubbles, ...newSpeechBubbles], 
    backgrounds: [...filteredBackgrounds, ...newBackgrounds],
    effects: [...filteredEffects, ...newEffects],
    tones: [...filteredTones, ...newTones],
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
        x: 0.25,
        y: 0.6,
        scale: 2.0,
        // 🔧 辞書対応
        facing: "at_viewer",           // gazeカテゴリ
        expression: "neutral_expression", // expressionsカテゴリ
        action: "standing",           // pose_mangaカテゴリ
        viewType: "upper_body",
        isGlobalPosition: true,
        eyeState: "",
        mouthState: "",
        handGesture: "",
      }
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "普通",
        text: "こんにちは",
        x: 0.167,
        y: 0.167,
        scale: 1.0,
        width: 80,
        height: 60,
        vertical: true,
        isGlobalPosition: true,
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
        x: 0.333,
        y: 0.667,
        scale: 2.3,
        // 🔧 辞書対応
        facing: "to_side",            // gazeカテゴリ
        expression: "neutral_expression", // expressionsカテゴリ
        action: "running",            // pose_mangaカテゴリ
        viewType: "full_body",
        isGlobalPosition: true,
        eyeState: "",
        mouthState: "",
        handGesture: "",
      }
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "叫び",
        text: "行くぞ！",
        x: 0.167,
        y: 0.167,
        scale: 1.1,
        width: 70,
        height: 60,
        vertical: true,
        isGlobalPosition: true,
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
        x: 0.45,
        y: 0.6,
        scale: 2.2,
        // 🔧 辞書対応
        facing: "down",               // gazeカテゴリ
        expression: "worried_face",   // expressionsカテゴリ
        action: "standing",          // pose_mangaカテゴリ
        viewType: "upper_body",
        isGlobalPosition: true,
        eyeState: "",
        mouthState: "",
        handGesture: "",
      }
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "心の声",
        text: "どうしよう...",
        x: 0.667,
        y: 0.267,
        scale: 1.0,
        width: 90,
        height: 70,
        vertical: true,
        isGlobalPosition: true,
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
        x: 0.5,
        y: 0.6,
        scale: 2.5,
        // 🔧 辞書対応
        facing: "at_viewer",          // gazeカテゴリ
        expression: "surprised",      // expressionsカテゴリ
        action: "standing",          // pose_mangaカテゴリ
        viewType: "face",
        isGlobalPosition: true,
        eyeState: "",
        mouthState: "",
        handGesture: "",
      }
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "叫び",
        text: "えっ！？",
        x: 0.25,
        y: 0.167,
        scale: 1.2,
        width: 80,
        height: 70,
        vertical: true,
        isGlobalPosition: true,
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

  // 🔧 辞書対応版座標変換
  const newCharacters = template.characters.map((char) => ({
    ...char,
    id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: targetPanel.id,
    x: targetPanel.x + (char.x * targetPanel.width),
    y: targetPanel.y + (char.y * targetPanel.height),
    isGlobalPosition: true,
  }));

  const newSpeechBubbles = template.speechBubbles.map((bubble) => ({
    ...bubble,
    id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: targetPanel.id,
    x: targetPanel.x + (bubble.x * targetPanel.width),
    y: targetPanel.y + (bubble.y * targetPanel.height),
    isGlobalPosition: true,
  }));

  return {
    characters: [...existingCharacters, ...newCharacters],
    speechBubbles: [...existingSpeechBubbles, ...newSpeechBubbles],
  };
};