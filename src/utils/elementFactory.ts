// src/utils/elementFactory.ts - 完全統合要素ファクトリーシステム v2.0

import { 
  Character, 
  SpeechBubble, 
  BackgroundElement, 
  EffectElement, 
  ToneElement 
} from '../types';

// ==========================================
// 🎭 キャラクターファクトリー（辞書対応完全版）
// ==========================================

export const createCharacter = (config: {
  // 基本情報
  characterId?: string;
  name?: string;
  type?: string;
  
  // 位置・サイズ（統一座標系）
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
  
  // 表示設定
  viewType?: "face" | "upper_body" | "full_body";
  
  // 🔧 辞書対応設定（未選択時は空文字でプロンプト除外）
  expression?: string;    // expressions カテゴリ
  action?: string;       // pose_manga カテゴリ  
  facing?: string;       // gaze カテゴリ
  eyeState?: string;     // 詳細設定
  mouthState?: string;   // 詳細設定
  handGesture?: string;  // 詳細設定
  
  // 🆕 座標系統一
  isGlobalPosition?: boolean;
}): Omit<Character, 'id' | 'panelId'> => ({
  characterId: config.characterId ?? "character_1",
  type: config.type ?? "character_1",
  name: config.name ?? "キャラクター",
  x: config.x ?? 0.5,
  y: config.y ?? 0.6,
  scale: config.scale ?? 2.0,
  rotation: config.rotation ?? 0,
  isGlobalPosition: config.isGlobalPosition ?? true,
  viewType: config.viewType ?? "upper_body",
  // 🔧 辞書対応設定（空文字はプロンプト出力で除外される）
  expression: config.expression ?? "",
  action: config.action ?? "", 
  facing: config.facing ?? "",
  eyeState: config.eyeState ?? "",
  mouthState: config.mouthState ?? "",
  handGesture: config.handGesture ?? "",
});

// 🎭 キャラクタープリセット（感情・行動別最適化）
export const characterPresets = {
  // ==========================================
  // 感情表現プリセット
  // ==========================================
  happy: (overrides?: Partial<Parameters<typeof createCharacter>[0]>) => 
    createCharacter({
      expression: "smiling",
      action: "standing", 
      facing: "at_viewer",
      viewType: "upper_body",
      scale: 2.0, // 手動追加と同じサイズに調整
      name: "主人公",
      ...overrides
    }),
    
  sad: (overrides?: Partial<Parameters<typeof createCharacter>[0]>) =>
    createCharacter({
      expression: "sad",
      action: "sitting",
      facing: "down", 
      viewType: "upper_body",
      scale: 2.0, // 手動追加と同じサイズに調整
      y: 0.65, // 少し下に配置
      name: "主人公",
      ...overrides
    }),
    
  angry: (overrides?: Partial<Parameters<typeof createCharacter>[0]>) =>
    createCharacter({
      expression: "angry_look",
      action: "arms_crossed",
      facing: "at_viewer",
      viewType: "upper_body", 
      scale: 2.0, // 手動追加と同じサイズに調整
      name: "主人公",
      ...overrides
    }),
    
  surprised: (overrides?: Partial<Parameters<typeof createCharacter>[0]>) =>
    createCharacter({
      expression: "surprised",
      action: "standing",
      facing: "at_viewer",
      viewType: "face",
      scale: 2.0, // 手動追加と同じサイズに調整
      name: "主人公",
      ...overrides
    }),
    
  worried: (overrides?: Partial<Parameters<typeof createCharacter>[0]>) =>
    createCharacter({
      expression: "worried_face",
      action: "standing", 
      facing: "away",
      viewType: "upper_body",
      scale: 2.0, // 手動追加と同じサイズに調整
      name: "主人公",
      ...overrides
    }),
    
  determined: (overrides?: Partial<Parameters<typeof createCharacter>[0]>) =>
    createCharacter({
      expression: "determined",
      action: "arms_crossed",
      facing: "at_viewer",
      viewType: "upper_body",
      scale: 2.0, // 手動追加と同じサイズに調整
      name: "主人公",
      ...overrides
    }),
    
  thoughtful: (overrides?: Partial<Parameters<typeof createCharacter>[0]>) =>
    createCharacter({
      expression: "thoughtful",
      action: "standing",
      facing: "away",
      viewType: "upper_body", 
      scale: 2.0, // 手動追加と同じサイズに調整
      name: "主人公",
      ...overrides
    }),
    
  // ==========================================
  // アクション表現プリセット
  // ==========================================
  running: (overrides?: Partial<Parameters<typeof createCharacter>[0]>) =>
    createCharacter({
      expression: "neutral_expression",
      action: "running",
      facing: "to_side",
      viewType: "full_body",
      scale: 2.0, // 手動追加と同じサイズに調整
      x: 0.4, // 少し左に配置
      y: 0.7,
      name: "主人公",
      ...overrides
    }),
    
  pointing: (overrides?: Partial<Parameters<typeof createCharacter>[0]>) =>
    createCharacter({
      expression: "surprised", 
      action: "pointing",
      facing: "to_side",
      viewType: "upper_body",
      scale: 2.0, // 手動追加と同じサイズに調整
      name: "主人公",
      ...overrides
    }),
    
  walking: (overrides?: Partial<Parameters<typeof createCharacter>[0]>) =>
    createCharacter({
      expression: "neutral_expression",
      action: "walking",
      facing: "to_side", 
      viewType: "full_body",
      scale: 2.0, // 手動追加と同じサイズに調整
      x: 0.4,
      y: 0.7,
      name: "主人公",
      ...overrides
    }),
    
  // ==========================================
  // 日常表現プリセット
  // ==========================================
  eating: (overrides?: Partial<Parameters<typeof createCharacter>[0]>) =>
    createCharacter({
      expression: "smiling",
      action: "sitting",
      facing: "down",
      viewType: "upper_body",
      scale: 2.0, // 手動追加と同じサイズに調整
      y: 0.65,
      name: "主人公",
      ...overrides
    }),
    
  phone: (overrides?: Partial<Parameters<typeof createCharacter>[0]>) =>
    createCharacter({
      expression: "neutral_expression",
      action: "standing",
      facing: "to_side",
      viewType: "upper_body",
      scale: 2.0, // 手動追加と同じサイズに調整
      name: "主人公",
      ...overrides
    }),
    
  // ==========================================
  // 対話用プリセット（2人用）
  // ==========================================
  dialogue_left: (overrides?: Partial<Parameters<typeof createCharacter>[0]>) =>
    createCharacter({
      expression: "smiling",
      action: "standing",
      facing: "to_side",
      viewType: "upper_body",
      scale: 2.0, // 手動追加と同じサイズに調整
      x: 0.3,
      y: 0.6,
      name: "主人公",
      ...overrides
    }),
    
  dialogue_right: (overrides?: Partial<Parameters<typeof createCharacter>[0]>) =>
    createCharacter({
      expression: "smiling",
      action: "standing",
      facing: "to_side",
      viewType: "upper_body",
      scale: 2.0, // 手動追加と同じサイズに調整
      x: 0.7,
      y: 0.6,
      name: "相手",
      ...overrides
    }),
};

// ==========================================
// 💬 吹き出しファクトリー（編集互換統一版）
// ==========================================

export const createSpeechBubble = (config: {
  // 基本情報
  type?: string;
  text?: string;
  
  // 🔧 位置・サイズ（統一座標系）
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  scale?: number;
  
  // 表示設定
  vertical?: boolean;
  
  // 🆕 座標系統一（手動作成との完全互換性）
  isGlobalPosition?: boolean;
}): Omit<SpeechBubble, 'id' | 'panelId'> => ({
  type: config.type ?? "普通",
  text: config.text ?? "",
  x: config.x ?? 0.15,
  y: config.y ?? 0.15,
  width: config.width ?? 160, // 80 → 160 に拡大
  height: config.height ?? 120, // 60 → 120 に拡大
  scale: config.scale ?? 1.0,
  vertical: config.vertical ?? true,
  // 🔧 編集互換性: 手動作成と同じ座標系を使用
  isGlobalPosition: config.isGlobalPosition ?? true,
});

// 💬 吹き出しプリセット（タイプ別最適化完全版）
export const bubblePresets = {
  normal: (text: string, overrides?: Partial<Parameters<typeof createSpeechBubble>[0]>) =>
    createSpeechBubble({
      type: "普通",
      text,
      width: 160, // 80 → 160 に拡大
      height: 120, // 60 → 120 に拡大
      vertical: true,
      ...overrides
    }),
    
  shout: (text: string, overrides?: Partial<Parameters<typeof createSpeechBubble>[0]>) =>
    createSpeechBubble({
      type: "叫び",
      text,
      // 🔧 叫び系は大きめ + 横書き推奨
      width: 200, // 100 → 200 に拡大
      height: 160, // 80 → 160 に拡大
      scale: 1.1,
      vertical: false, // 叫びは横書きが効果的
      ...overrides
    }),
    
  thought: (text: string, overrides?: Partial<Parameters<typeof createSpeechBubble>[0]>) =>
    createSpeechBubble({
      type: "心の声", 
      text,
      // 🔧 思考系は楕円に適したサイズ + 右上配置
      width: 180, // 90 → 180 に拡大
      height: 140, // 70 → 140 に拡大
      x: 0.65,      // 右上配置が一般的
      y: 0.15,
      vertical: true, // 思考は縦書きが自然
      ...overrides
    }),
    
  whisper: (text: string, overrides?: Partial<Parameters<typeof createSpeechBubble>[0]>) =>
    createSpeechBubble({
      type: "小声",
      text,
      // 🔧 小声は小さめ
      width: 140, // 70 → 140 に拡大
      height: 100, // 50 → 100 に拡大
      scale: 0.9,
      vertical: true,
      ...overrides
    }),
    
  // 🆕 新しいプリセット
  dialog: (text: string, overrides?: Partial<Parameters<typeof createSpeechBubble>[0]>) =>
    createSpeechBubble({
      type: "普通",
      text,
      width: 170, // 85 → 170 に拡大
      height: 130, // 65 → 130 に拡大
      vertical: true,
      ...overrides
    }),
    
  narration: (text: string, overrides?: Partial<Parameters<typeof createSpeechBubble>[0]>) =>
    createSpeechBubble({
      type: "普通",
      text,
      // 🔧 ナレーション用は横長 + 上部配置
      width: 240, // 120 → 240 に拡大
      height: 80, // 40 → 80 に拡大
      vertical: false, // ナレーションは横書き
      x: 0.1,
      y: 0.05,
      ...overrides
    }),
    
  // 🆕 位置別プリセット
  left: (text: string, overrides?: Partial<Parameters<typeof createSpeechBubble>[0]>) =>
    createSpeechBubble({
      type: "普通",
      text,
      x: 0.05,
      y: 0.15,
      width: 140, // 70 → 140 に拡大
      height: 100, // 50 → 100 に拡大
      ...overrides
    }),
    
  right: (text: string, overrides?: Partial<Parameters<typeof createSpeechBubble>[0]>) =>
    createSpeechBubble({
      type: "普通",
      text,
      x: 0.75,
      y: 0.15,
      width: 140, // 70 → 140 に拡大
      height: 100, // 50 → 100 に拡大
      ...overrides
    }),
};

// ==========================================
// 🎨 背景ファクトリー（統合版）
// ==========================================

export const createBackground = (config: {
  type: 'solid' | 'gradient' | 'pattern';
  // 位置・サイズ（相対座標 0-1）
  x?: number;
  y?: number; 
  width?: number;
  height?: number;
  opacity?: number;
  zIndex?: number;
  
  // 単色用
  solidColor?: string;
  
  // グラデーション用
  gradientType?: 'linear' | 'radial';
  gradientColors?: string[];
  gradientDirection?: number;
  
  // パターン用
  patternType?: 'dots' | 'lines' | 'grid';
  patternColor?: string;
  patternSize?: number;
  patternSpacing?: number;
}): Omit<BackgroundElement, 'id' | 'panelId'> => {
  
  const baseElement = {
    type: config.type,
    x: config.x ?? 0,
    y: config.y ?? 0,
    width: config.width ?? 1,
    height: config.height ?? 1,
    rotation: 0,
    zIndex: config.zIndex ?? -10,
    opacity: config.opacity ?? 1,
  };

  switch (config.type) {
    case 'solid':
      return {
        ...baseElement,
        solidColor: config.solidColor ?? '#CCCCCC'
      };
      
    case 'gradient':
      return {
        ...baseElement,
        gradientType: config.gradientType ?? 'linear',
        gradientColors: config.gradientColors ?? ['#FFFFFF', '#CCCCCC'],
        gradientDirection: config.gradientDirection ?? 90
      };
      
    case 'pattern':
      return {
        ...baseElement,
        patternType: config.patternType ?? 'dots',
        patternColor: config.patternColor ?? '#000000',
        patternSize: config.patternSize ?? 5,
        patternSpacing: config.patternSpacing ?? 10
      };
      
    default:
      return baseElement;
  }
};

// 🎨 背景プリセット（感情・シーン別）
export const backgroundPresets = {
  // 感情系背景
  happy: () => createBackground({
    type: 'gradient',
    gradientType: 'radial',
    gradientColors: ['#FFD700', '#FFF8DC'],
    opacity: 0.3
  }),
  
  sad: () => createBackground({
    type: 'solid',
    solidColor: '#E6F3FF',
    opacity: 0.4
  }),
  
  angry: () => createBackground({
    type: 'gradient',
    gradientType: 'linear',
    gradientColors: ['#FFE4E1', '#FFCCCB'],
    gradientDirection: 180,
    opacity: 0.4
  }),
  
  worried: () => createBackground({
    type: 'solid',
    solidColor: '#F0F8FF',
    opacity: 0.3
  }),
  
  // アクション系背景
  speed: () => createBackground({
    type: 'gradient',
    gradientType: 'linear',
    gradientColors: ['#F0FFFF', '#E0FFFF'],
    gradientDirection: 90,
    opacity: 0.2
  }),
  
  impact: () => createBackground({
    type: 'gradient',
    gradientType: 'radial', 
    gradientColors: ['#FFFFFF', '#F0F0F0'],
    opacity: 0.5
  }),
  
  // 日常系背景
  neutral: () => createBackground({
    type: 'solid',
    solidColor: '#FAFAFA',
    opacity: 0.3
  }),
  
  calm: () => createBackground({
    type: 'gradient',
    gradientType: 'linear',
    gradientColors: ['#FFFFFF', '#F8F8FF'],
    gradientDirection: 180,
    opacity: 0.3
  }),
  
  // 特殊系背景
  determination: () => createBackground({
    type: 'gradient',
    gradientType: 'linear',
    gradientColors: ['#FFFACD', '#FFD700'],
    gradientDirection: 180,
    opacity: 0.3
  }),
  
  idea: () => createBackground({
    type: 'gradient',
    gradientType: 'linear',
    gradientColors: ['#FFF8DC', '#FFFACD'],
    gradientDirection: 180,
    opacity: 0.4
  }),
  
  tired: () => createBackground({
    type: 'solid',
    solidColor: '#E6E6FA',
    opacity: 0.4
  }),
  
  effort: () => createBackground({
    type: 'gradient',
    gradientType: 'linear',
    gradientColors: ['#FFE4B5', '#FFD700'],
    gradientDirection: 180,
    opacity: 0.3
  })
};

// ==========================================
// ⚡ 効果線ファクトリー
// ==========================================

export const createEffect = (config: {
  // 基本情報
  type?: 'speed' | 'focus' | 'explosion' | 'flash';
  
  // 位置・サイズ（相対座標 0-1）
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  
  // 効果設定
  direction?: 'horizontal' | 'vertical' | 'radial' | 'custom';
  intensity?: number;    // 0.1-1.0
  density?: number;      // 0.1-1.0
  length?: number;       // 線の長さ
  angle?: number;        // 角度
  color?: string;
  opacity?: number;
  blur?: number;
  zIndex?: number;
}): Omit<EffectElement, 'id' | 'panelId'> => ({
  type: config.type ?? 'speed',
  x: config.x ?? 0,
  y: config.y ?? 0,
  width: config.width ?? 1,
  height: config.height ?? 1,
  direction: config.direction ?? 'horizontal',
  intensity: config.intensity ?? 0.6,
  density: config.density ?? 0.7,
  length: config.length ?? 30,
  angle: config.angle ?? 0,
  color: config.color ?? "#333333",
  opacity: config.opacity ?? 0.6,
  blur: config.blur ?? 0,
  selected: false,
  zIndex: config.zIndex ?? 100,
  isGlobalPosition: false,
});

// ⚡ 効果線プリセット（シーン別最適化）
export const effectPresets = {
  speed_horizontal: (overrides?: Partial<Parameters<typeof createEffect>[0]>) =>
    createEffect({
      type: 'speed',
      direction: 'horizontal',
      intensity: 0.8,
      density: 0.7,
      ...overrides
    }),
    
  speed_diagonal: (overrides?: Partial<Parameters<typeof createEffect>[0]>) =>
    createEffect({
      type: 'speed',
      direction: 'custom',
      angle: 45,
      intensity: 0.7,
      density: 0.5,
      ...overrides
    }),
    
  focus: (overrides?: Partial<Parameters<typeof createEffect>[0]>) =>
    createEffect({
      type: 'focus',
      direction: 'radial',
      intensity: 0.6,
      density: 0.5,
      ...overrides
    }),
    
  explosion: (overrides?: Partial<Parameters<typeof createEffect>[0]>) =>
    createEffect({
      type: 'explosion',
      direction: 'radial',
      intensity: 0.9,
      density: 0.8,
      ...overrides
    }),
    
  flash: (overrides?: Partial<Parameters<typeof createEffect>[0]>) =>
    createEffect({
      type: 'flash',
      direction: 'radial',
      intensity: 0.7,
      density: 0.6,
      ...overrides
    }),
};

// ==========================================
// 🎯 トーンファクトリー
// ==========================================

export const createTone = (config: {
  // 基本情報
  type?: 'halftone' | 'gradient' | 'crosshatch' | 'dots' | 'lines' | 'noise';
  pattern?: 'dots_60' | 'dots_85' | 'dots_100' | 'dots_120' | 'dots_150' | 'lines_horizontal' | 'lines_vertical' | 'lines_diagonal' | 'lines_cross' | 'gradient_linear' | 'gradient_radial' | 'gradient_diamond' | 'noise_fine' | 'noise_coarse' | 'noise_grain' | 'speed_lines' | 'focus_lines' | 'explosion';
  
  // 位置・サイズ（相対座標 0-1）
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  
  // 表示設定
  density?: number;      // 0-1
  opacity?: number;      // 0-1
  rotation?: number;     // 0-360
  scale?: number;        // 0.1-3.0
  
  // 高度な設定
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay';
  contrast?: number;     // 0-2
  brightness?: number;   // -1 to 1
  invert?: boolean;
  
  // マスク設定
  maskEnabled?: boolean;
  maskShape?: 'rectangle' | 'ellipse' | 'custom';
  maskFeather?: number;  // 0-20
  
  // その他
  zIndex?: number;
  visible?: boolean;
}): Omit<ToneElement, 'id' | 'panelId'> => ({
  type: config.type ?? 'halftone',
  pattern: config.pattern ?? 'dots_60',
  x: config.x ?? 0,
  y: config.y ?? 0,
  width: config.width ?? 1,
  height: config.height ?? 1,
  density: config.density ?? 0.5,
  opacity: config.opacity ?? 0.7,
  rotation: config.rotation ?? 0,
  scale: config.scale ?? 1.0,
  blendMode: config.blendMode ?? 'multiply',
  contrast: config.contrast ?? 1.0,
  brightness: config.brightness ?? 0,
  invert: config.invert ?? false,
  maskEnabled: config.maskEnabled ?? false,
  maskShape: config.maskShape ?? 'rectangle',
  maskFeather: config.maskFeather ?? 0,
  selected: false,
  zIndex: config.zIndex ?? 0,
  isGlobalPosition: false,
  visible: config.visible ?? true,
  // 🆕 描画用プロパティ
  color: '#000000',
  intensity: 0.5,
  angle: 0,
  direction: 'vertical'
});

// 🎯 トーンプリセット（用途別最適化）
export const tonePresets = {
  shadow: (overrides?: Partial<Parameters<typeof createTone>[0]>) =>
    createTone({
      pattern: 'dots_85' as const,
      density: 0.3,
      opacity: 0.4,
      blendMode: 'multiply',
      ...overrides
    }),
    
  highlight: (overrides?: Partial<Parameters<typeof createTone>[0]>) =>
    createTone({
      pattern: 'dots_120' as const,
      density: 0.15,
      opacity: 0.2,
      blendMode: 'screen',
      ...overrides
    }),
    
  texture: (overrides?: Partial<Parameters<typeof createTone>[0]>) =>
    createTone({
      pattern: 'lines_horizontal' as const,
      density: 0.1,
      opacity: 0.15,
      blendMode: 'overlay',
      ...overrides
    }),
    
  mood: (overrides?: Partial<Parameters<typeof createTone>[0]>) =>
    createTone({
      pattern: 'lines_diagonal' as const,
      density: 0.2,
      opacity: 0.3,
      blendMode: 'multiply',
      ...overrides
    }),
};

// ==========================================
// 🔧 統合シーンファクトリー（編集互換版）
// ==========================================

export interface UnifiedSceneConfig {
  characters?: Array<{
    preset: keyof typeof characterPresets;
    overrides?: Partial<Parameters<typeof createCharacter>[0]>;
  }>;
  bubbles?: Array<{
    preset: keyof typeof bubblePresets;
    text: string;
    overrides?: Partial<Parameters<typeof createSpeechBubble>[0]>;
  }>;
  background?: {
    preset: keyof typeof backgroundPresets;
    overrides?: Partial<Parameters<typeof createBackground>[0]>;
  };
  effects?: Array<{
    preset: keyof typeof effectPresets;
    overrides?: Partial<Parameters<typeof createEffect>[0]>;
  }>;
  tones?: Array<{
    preset: keyof typeof tonePresets;
    overrides?: Partial<Parameters<typeof createTone>[0]>;
  }>;
}

export const createUnifiedScene = (config: UnifiedSceneConfig) => {
  const characters = (config.characters ?? []).map(char => 
    characterPresets[char.preset](char.overrides)
  );
  
  const speechBubbles = (config.bubbles ?? []).map(bubble =>
    bubblePresets[bubble.preset](bubble.text, bubble.overrides)
  );
  
  const backgrounds = config.background ? 
    [backgroundPresets[config.background.preset]()] : [];
  
  const effects = (config.effects ?? []).map(effect =>
    effectPresets[effect.preset](effect.overrides)
  );
  
  const tones = (config.tones ?? []).map(tone =>
    tonePresets[tone.preset](tone.overrides)
  );
  
  return {
    characters,
    speechBubbles,
    backgrounds,
    effects,
    tones,
  };
};

// ==========================================
// 🎮 便利な組み合わせプリセット
// ==========================================

export const scenePresets = {
  // 😊 基本的な嬉しいシーン
  happy_basic: () => createUnifiedScene({
    characters: [{ preset: 'happy' }],
    bubbles: [{ preset: 'normal', text: 'やったー！' }],
    background: { preset: 'happy' },
    effects: [{ preset: 'flash' }]
  }),
  
  // 😢 悲しい・落ち込みシーン
  sad_basic: () => createUnifiedScene({
    characters: [{ 
      preset: 'sad',
      overrides: { y: 0.65 }
    }],
    bubbles: [{ preset: 'thought', text: 'つらい...' }],
    background: { preset: 'sad' },
    tones: [{ preset: 'shadow' }]
  }),
  
  // 😡 怒り・イライラシーン
  angry_basic: () => createUnifiedScene({
    characters: [{ preset: 'angry' }],
    bubbles: [{ preset: 'shout', text: 'もう！' }],
    background: { preset: 'angry' },
    effects: [{ preset: 'explosion' }]
  }),
  
  // 🏃 アクションシーン
  running_basic: () => createUnifiedScene({
    characters: [{ preset: 'running' }],
    bubbles: [{ preset: 'shout', text: '急がなきゃ！' }],
    effects: [{ preset: 'speed_horizontal' }]
  }),
  
  // 🤝 二人の対話シーン
  dialogue_basic: () => createUnifiedScene({
    characters: [
      { preset: 'dialogue_left' },
      { preset: 'dialogue_right' }
    ],
    bubbles: [
      { preset: 'left', text: 'こんにちは' },
      { preset: 'right', text: 'こんにちは！' }
    ],
    background: { preset: 'calm' }
  }),
  
  // 💭 思考・悩みシーン
  thinking_basic: () => createUnifiedScene({
    characters: [{ preset: 'thoughtful' }],
    bubbles: [{ preset: 'thought', text: 'うーん...' }],
    background: { preset: 'neutral' },
    tones: [{ preset: 'texture' }]
  }),
};

// ==========================================
// 🔧 レガシー変換関数（既存コードとの互換性）
// ==========================================

/**
 * 旧形式の背景設定を新形式に変換
 */
export const convertLegacyBackground = (legacyBg: any): Omit<BackgroundElement, 'id' | 'panelId'> => {
  if (legacyBg.colors && Array.isArray(legacyBg.colors)) {
    // 旧形式のシーンテンプレート背景を新形式に変換
    return createBackground({
      type: legacyBg.type,
      gradientType: legacyBg.type === 'gradient' ? 'linear' : undefined,
      gradientColors: legacyBg.colors,
      gradientDirection: 180,
      solidColor: legacyBg.type === 'solid' ? legacyBg.colors[0] : undefined,
      opacity: legacyBg.opacity ?? 1
    });
  }
  
  // 既に新形式の場合はそのまま返す
  return legacyBg;
};

/**
 * 背景テンプレート用の要素生成
 */
export const createBackgroundTemplateElements = (
  baseConfig: Parameters<typeof createBackground>[0],
  variations?: Array<Partial<Parameters<typeof createBackground>[0]>>
): Omit<BackgroundElement, 'id' | 'panelId'>[] => {
  const baseElement = createBackground(baseConfig);
  
  if (!variations) {
    return [baseElement];
  }
  
  return [
    baseElement,
    ...variations.map(variation => createBackground({
      ...baseConfig,
      ...variation
    }))
  ];
};

// ==========================================
// 🛠️ ID・パネルID付与ヘルパー関数
// ==========================================

/**
 * 要素にIDとパネルIDを付与
 */
export const addElementIds = <T extends Record<string, any>>(
  elements: T[],
  panelId: number,
  prefix: string
): (T & { id: string; panelId: number })[] => {
  return elements.map((element, index) => ({
    ...element,
    id: `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${index}`,
    panelId: panelId
  }));
};

/**
 * 座標変換ヘルパー（相対座標→絶対座標）
 */
export const convertToAbsolutePosition = <T extends { x: number; y: number; isGlobalPosition?: boolean }>(
  element: T,
  panel: { x: number; y: number; width: number; height: number }
): T => {
  if (element.isGlobalPosition) {
    // 既に絶対座標の場合は変換不要
    return element;
  }
  
  return {
    ...element,
    x: panel.x + (element.x * panel.width),
    y: panel.y + (element.y * panel.height),
    isGlobalPosition: true
  };
};

// ==========================================
// 📋 使用例・テストケース
// ==========================================

/*
// 🎭 キャラクター作成例
const happyCharacter = characterPresets.happy({
  name: "主人公",
  x: 0.3,
  y: 0.5
});

// 💬 吹き出し作成例
const normalBubble = bubblePresets.normal("こんにちは！", {
  x: 0.1,
  y: 0.2
});

// 🎨 背景作成例
const happyBackground = backgroundPresets.happy();

// ⚡ 効果線作成例
const speedEffect = effectPresets.speed_horizontal();

// 🎯 トーン作成例
const shadowTone = tonePresets.shadow();

// 🎮 統合シーン作成例
const completeScene = scenePresets.happy_basic();

// 🔧 カスタムシーン作成例
const customScene = createUnifiedScene({
  characters: [
    { 
      preset: 'happy',
      overrides: { name: "カスタムキャラ", scale: 2.5 }
    }
  ],
  bubbles: [
    { 
      preset: 'shout', 
      text: "カスタムセリフ！",
      overrides: { x: 0.2, y: 0.1 }
    }
  ],
  background: { preset: 'determination' },
  effects: [{ preset: 'flash' }],
  tones: [{ preset: 'highlight' }]
});
*/

// ==========================================
// 🎯 エクスポート
// ==========================================

export default {
  // ファクトリー関数
  createCharacter,
  createSpeechBubble,
  createBackground,
  createEffect,
  createTone,
  createUnifiedScene,
  
  // プリセット
  characterPresets,
  bubblePresets,
  backgroundPresets,
  effectPresets,
  tonePresets,
  scenePresets,
  
  // ヘルパー関数
  convertLegacyBackground,
  createBackgroundTemplateElements,
  addElementIds,
  convertToAbsolutePosition,
};