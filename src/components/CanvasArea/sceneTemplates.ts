// src/components/CanvasArea/sceneTemplates.ts - 完全修正版
import { Character, SpeechBubble, BackgroundElement, EffectElement, ToneElement } from "../../types";

export interface EnhancedSceneTemplate {
  name: string;
  description: string;
  category: 'emotion' | 'action' | 'daily';
  characters: Omit<Character, "id">[];
  speechBubbles: Omit<SpeechBubble, "id">[];
  backgrounds?: Omit<BackgroundElement, "id">[];
  effects?: Omit<EffectElement, "id">[];
  tones?: Omit<ToneElement, "id">[];
}

// 🎭 感情系シーンテンプレート
export const emotionSceneTemplates: Record<string, EnhancedSceneTemplate> = {
  surprise_shock: {
    name: "😲 驚き・ショック",
    description: "大きく驚いた瞬間のシーン",
    category: 'emotion',
    characters: [
      {
        panelId: 1, // この値は後で選択されたパネルIDで上書きされる
        type: "hero",
        name: "主人公",
        x: 0.5, // 🔧 相対座標に変更（パネル中央）
        y: 0.6, // 🔧 相対座標に変更（パネル下寄り）
        scale: 2.5,
        facing: "front",
        gaze: "center",
        pose: "standing",
        expression: "neutral",
        viewType: "face",
        faceAngle: "front",
        eyeDirection: "front",
        isGlobalPosition: false, // 🔧 パネル内相対座標
        bodyDirection: "front",
        faceExpression: "surprised",
        bodyPose: "standing",
      },
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "叫び",
        text: "えっ！？",
        x: 0.25, // 🔧 相対座標に変更（パネル左上）
        y: 0.15, // 🔧 相対座標に変更
        scale: 1.2,
        width: 80,
        height: 70,
        vertical: true,
        isGlobalPosition: false, // 🔧 パネル内相対座標
      },
    ],
    effects: [
      {
        panelId: 1,
        type: "speed",
        x: 0.1,
        y: 0.1,
        width: 0.8,
        height: 0.8,
        direction: "radial",
        intensity: 0.8,
        density: 0.7,
        length: 30,
        angle: 0,
        color: "#333333",
        opacity: 0.6,
        blur: 0,
        selected: false,
        zIndex: 1,
        isGlobalPosition: false,
      },
    ],
    tones: [
      {
        panelId: 1,
        type: "dots",
        pattern: "dots_60",
        x: 0.0,
        y: 0.0,
        width: 1.0,
        height: 0.4,
        density: 0.5,
        opacity: 0.3,
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
        zIndex: 0,
        isGlobalPosition: false,
        visible: true,
      },
    ],
  },

  sadness_tears: {
    name: "😢 悲しみ・涙",
    description: "悲しみに暮れる感情表現",
    category: 'emotion',
    characters: [
      {
        panelId: 1,
        type: "heroine",
        name: "ヒロイン",
        x: 0.45, // 🔧 相対座標
        y: 0.6,  // 🔧 相対座標
        scale: 2.3,
        facing: "front",
        gaze: "down",
        pose: "sitting",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "front",
        eyeDirection: "down",
        isGlobalPosition: false, // 🔧 パネル内配置
        bodyDirection: "front",
        faceExpression: "sad",
        bodyPose: "sitting",
      },
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "心の声",
        text: "どうして...",
        x: 0.75, // 🔧 相対座標（パネル右上）
        y: 0.2,  // 🔧 相対座標
        scale: 1.0,
        width: 90,
        height: 70,
        vertical: true,
        isGlobalPosition: false, // 🔧 パネル内配置
      },
    ],
    backgrounds: [
      {
        panelId: 1,
        type: "gradient",
        x: 0.0,
        y: 0.0,
        width: 1.0,
        height: 1.0,
        rotation: 0,
        zIndex: -1,
        opacity: 0.4,
        gradientType: "linear",
        gradientColors: ["#cccccc", "#888888"],
        gradientDirection: 270,
      },
    ],
  },

  joy_happiness: {
    name: "😄 喜び・幸せ",
    description: "明るく楽しい瞬間",
    category: 'emotion',
    characters: [
      {
        panelId: 1,
        type: "heroine",
        name: "ヒロイン",
        x: 0.25, // 🔧 相対座標（パネル左側）
        y: 0.6,  // 🔧 相対座標
        scale: 2.0,
        facing: "front",
        gaze: "center",
        pose: "standing",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "front",
        eyeDirection: "front",
        isGlobalPosition: false, // 🔧 パネル内配置
        bodyDirection: "front",
        faceExpression: "smile",
        bodyPose: "waving",
      },
      {
        panelId: 1,
        type: "hero",
        name: "主人公",
        x: 0.75, // 🔧 相対座標（パネル右側）
        y: 0.6,  // 🔧 相対座標
        scale: 2.0,
        facing: "front",
        gaze: "left",
        pose: "standing",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "left",
        eyeDirection: "left",
        isGlobalPosition: false, // 🔧 パネル内配置
        bodyDirection: "left",
        faceExpression: "smile",
        bodyPose: "pointing",
      },
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "普通",
        text: "やったね！",
        x: 0.15, // 🔧 相対座標（左上）
        y: 0.2,  // 🔧 相対座標
        scale: 1.0,
        width: 80,
        height: 60,
        vertical: true,
        isGlobalPosition: false, // 🔧 パネル内配置
      },
      {
        panelId: 1,
        type: "普通",
        text: "うん♪",
        x: 0.85, // 🔧 相対座標（右上）
        y: 0.15, // 🔧 相対座標
        scale: 1.0,
        width: 70,
        height: 50,
        vertical: true,
        isGlobalPosition: false, // 🔧 パネル内配置
      },
    ],
    backgrounds: [
      {
        panelId: 1,
        type: "gradient",
        x: 0.0,
        y: 0.0,
        width: 1.0,
        height: 1.0,
        rotation: 0,
        zIndex: -1,
        opacity: 0.5,
        gradientType: "linear",
        gradientColors: ["#87CEEB", "#F0F8FF"],
        gradientDirection: 180,
      },
    ],
  },
};

// 🚀 アクション系シーンテンプレート
export const actionSceneTemplates: Record<string, EnhancedSceneTemplate> = {
  running_speed: {
    name: "💨 走る・スピード",
    description: "疾走感あふれるアクション",
    category: 'action',
    characters: [
      {
        panelId: 1,
        type: "hero",
        name: "主人公",
        x: 0.4, // 🔧 相対座標（パネル中央左）
        y: 0.7, // 🔧 相対座標（パネル下部）
        scale: 2.3,
        facing: "front",
        gaze: "right",
        pose: "running",
        expression: "neutral",
        viewType: "fullBody",
        faceAngle: "right",
        eyeDirection: "front",
        isGlobalPosition: false, // 🔧 パネル内配置
        bodyDirection: "right",
        faceExpression: "normal",
        bodyPose: "running",
      },
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "叫び",
        text: "急げ！",
        x: 0.15, // 🔧 相対座標（パネル左上）
        y: 0.15, // 🔧 相対座標
        scale: 1.1,
        width: 70,
        height: 60,
        vertical: true,
        isGlobalPosition: false, // 🔧 パネル内配置
      },
    ],
    effects: [
      {
        panelId: 1,
        type: "speed",
        x: 0.0,
        y: 0.3,
        width: 0.6,
        height: 0.4,
        direction: "horizontal",
        intensity: 0.8,
        density: 0.9,
        length: 40,
        angle: 10,
        color: "#666666",
        opacity: 0.7,
        blur: 1,
        selected: false,
        zIndex: 1,
        isGlobalPosition: false,
      },
    ],
  },

  battle_fight: {
    name: "✊ 戦闘・バトル",
    description: "激しい戦闘シーン",
    category: 'action',
    characters: [
      {
        panelId: 1,
        type: "hero",
        name: "主人公",
        x: 0.3, // 🔧 相対座標（パネル左側）
        y: 0.65, // 🔧 相対座標
        scale: 2.4,
        facing: "front",
        gaze: "right",
        pose: "standing",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "right",
        eyeDirection: "right",
        isGlobalPosition: false, // 🔧 パネル内配置
        bodyDirection: "right",
        faceExpression: "angry",
        bodyPose: "pointing",
      },
      {
        panelId: 1,
        type: "rival",
        name: "ライバル",
        x: 0.75, // 🔧 相対座標（パネル右側）
        y: 0.6, // 🔧 相対座標
        scale: 2.2,
        facing: "front",
        gaze: "left",
        pose: "standing",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "left",
        eyeDirection: "left",
        isGlobalPosition: false, // 🔧 パネル内配置
        bodyDirection: "left",
        faceExpression: "angry",
        bodyPose: "arms_crossed",
      },
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "叫び",
        text: "行くぞ！",
        x: 0.15, // 🔧 相対座標（左上）
        y: 0.15, // 🔧 相対座標
        scale: 1.2,
        width: 80,
        height: 70,
        vertical: true,
        isGlobalPosition: false, // 🔧 パネル内配置
      },
      {
        panelId: 1,
        type: "叫び",
        text: "来い！",
        x: 0.85, // 🔧 相対座標（右上）
        y: 0.2, // 🔧 相対座標
        scale: 1.1,
        width: 70,
        height: 60,
        vertical: true,
        isGlobalPosition: false, // 🔧 パネル内配置
      },
    ],
  },
};

// 🏠 日常系シーンテンプレート
export const dailySceneTemplates: Record<string, EnhancedSceneTemplate> = {
  school_classroom: {
    name: "🏫 学校・教室",
    description: "学校での日常シーン",
    category: 'daily',
    characters: [
      {
        panelId: 1,
        type: "hero",
        name: "主人公",
        x: 0.25, // 🔧 相対座標（パネル左側）
        y: 0.65, // 🔧 相対座標
        scale: 2.0,
        facing: "front",
        gaze: "right",
        pose: "sitting",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "right",
        eyeDirection: "right",
        isGlobalPosition: false, // 🔧 パネル内配置
        bodyDirection: "right",
        faceExpression: "normal",
        bodyPose: "sitting",
      },
      {
        panelId: 1,
        type: "friend",
        name: "友人",
        x: 0.75, // 🔧 相対座標（パネル右側）
        y: 0.65, // 🔧 相対座標
        scale: 2.0,
        facing: "front",
        gaze: "left",
        pose: "sitting",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "left",
        eyeDirection: "left",
        isGlobalPosition: false, // 🔧 パネル内配置
        bodyDirection: "left",
        faceExpression: "smile",
        bodyPose: "sitting",
      },
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "普通",
        text: "宿題やった？",
        x: 0.15, // 🔧 相対座標（左上）
        y: 0.2, // 🔧 相対座標
        scale: 1.0,
        width: 80,
        height: 60,
        vertical: true,
        isGlobalPosition: false, // 🔧 パネル内配置
      },
      {
        panelId: 1,
        type: "普通",
        text: "やばい...",
        x: 0.85, // 🔧 相対座標（右上）
        y: 0.18, // 🔧 相対座標
        scale: 1.0,
        width: 70,
        height: 50,
        vertical: true,
        isGlobalPosition: false, // 🔧 パネル内配置
      },
    ],
    backgrounds: [
      {
        panelId: 1,
        type: "pattern",
        x: 0.0,
        y: 0.0,
        width: 1.0,
        height: 1.0,
        rotation: 0,
        zIndex: -1,
        opacity: 0.6,
        patternType: "grid",
        patternColor: "#cccccc",
        patternSize: 20,
        patternSpacing: 5,
      },
    ],
  },

  eating_meal: {
    name: "🍕 食事・グルメ",
    description: "美味しい食事のシーン",
    category: 'daily',
    characters: [
      {
        panelId: 1,
        type: "heroine",
        name: "ヒロイン",
        x: 0.5, // 🔧 相対座標（パネル中央）
        y: 0.6, // 🔧 相対座標
        scale: 2.2,
        facing: "front",
        gaze: "down",
        pose: "sitting",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "front",
        eyeDirection: "down",
        isGlobalPosition: false, // 🔧 パネル内配置
        bodyDirection: "front",
        faceExpression: "smile",
        bodyPose: "sitting",
      },
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "普通",
        text: "美味しい♪",
        x: 0.25, // 🔧 相対座標（左上）
        y: 0.15, // 🔧 相対座標
        scale: 1.0,
        width: 80,
        height: 60,
        vertical: true,
        isGlobalPosition: false, // 🔧 パネル内配置
      },
    ],
  },
};

// 🎯 統合関数群
export const getAllSceneTemplates = (): Record<string, EnhancedSceneTemplate> => {
  return {
    ...emotionSceneTemplates,
    ...actionSceneTemplates,
    ...dailySceneTemplates,
  };
};

export const getTemplatesByCategory = (category: 'emotion' | 'action' | 'daily'): Record<string, EnhancedSceneTemplate> => {
  const allTemplates = getAllSceneTemplates();
  const filtered: Record<string, EnhancedSceneTemplate> = {};
  
  Object.entries(allTemplates).forEach(([key, template]) => {
    if (template.category === category) {
      filtered[key] = template;
    }
  });
  
  return filtered;
};

// 🚀 修正版: 統合シーンテンプレート適用関数
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
  console.log(`🎭 統合シーンテンプレート適用: ${template.name} → パネル${targetPanel.id}`);

  // 🔧 修正: オフセット計算を削除（相対座標なのでそのまま使用）
  const newCharacters = template.characters.map((char) => ({
    ...char,
    id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: targetPanel.id, // 🔧 選択されたパネルのID
    // x, y はそのまま（相対座標として使用）
  }));

  const newSpeechBubbles = template.speechBubbles.map((bubble) => ({
    ...bubble,
    id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: targetPanel.id, // 🔧 選択されたパネルのID
    // x, y はそのまま（相対座標として使用）
  }));

  const newBackgrounds = (template.backgrounds || []).map((bg) => ({
    ...bg,
    id: `bg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: targetPanel.id, // 🔧 選択されたパネルのID
  }));

  const newEffects = (template.effects || []).map((effect) => ({
    ...effect,
    id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: targetPanel.id, // 🔧 選択されたパネルのID
  }));

  const newTones = (template.tones || []).map((tone) => ({
    ...tone,
    id: `tone_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: targetPanel.id, // 🔧 選択されたパネルのID
  }));

  console.log(`✅ 統合要素追加: キャラ${newCharacters.length}個、吹き出し${newSpeechBubbles.length}個、背景${newBackgrounds.length}個、効果線${newEffects.length}個、トーン${newTones.length}個`);

  return {
    characters: [...existingCharacters, ...newCharacters],
    speechBubbles: [...existingSpeechBubbles, ...newSpeechBubbles],
    backgrounds: [...existingBackgrounds, ...newBackgrounds],
    effects: [...existingEffects, ...newEffects],
    tones: [...existingTones, ...newTones],
  };
};

// 既存のシーンテンプレート（後方互換性のため残す）
export interface SceneTemplate {
  characters: Omit<Character, "id">[];
  speechBubbles: Omit<SpeechBubble, "id">[];
}

export const sceneTemplates: Record<string, SceneTemplate> = {
  daily: {
    characters: [
      {
        panelId: 1,
        type: "hero",
        name: "主人公",
        x: 0.25, // 🔧 相対座標に変更
        y: 0.65, // 🔧 相対座標に変更
        scale: 2.0,
        facing: "front",
        gaze: "center",
        pose: "standing",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "front",
        eyeDirection: "front",
        isGlobalPosition: false, // 🔧 パネル内配置
        bodyDirection: "front",
        faceExpression: "normal",
        bodyPose: "standing",
      },
      {
        panelId: 1,
        type: "heroine",
        name: "ヒロイン",
        x: 0.75, // 🔧 相対座標に変更
        y: 0.65, // 🔧 相対座標に変更
        scale: 2.0,
        facing: "front",
        gaze: "left",
        pose: "standing",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "left",
        eyeDirection: "left",
        isGlobalPosition: false, // 🔧 パネル内配置
        bodyDirection: "left",
        faceExpression: "normal",
        bodyPose: "standing",
      },
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "普通",
        text: "おはよう！",
        x: 0.15, // 🔧 相対座標に変更
        y: 0.2,  // 🔧 相対座標に変更
        scale: 1.0,
        width: 80,
        height: 60,
        vertical: true,
        isGlobalPosition: false, // 🔧 パネル内配置
      },
      {
        panelId: 1,
        type: "普通",
        text: "おはよう",
        x: 0.85, // 🔧 相対座標に変更
        y: 0.18, // 🔧 相対座標に変更
        scale: 1.0,
        width: 70,
        height: 50,
        vertical: true,
        isGlobalPosition: false, // 🔧 パネル内配置
      },
    ],
  },
  dialogue: {
    characters: [
      {
        panelId: 1,
        type: "hero",
        name: "主人公",
        x: 0.2, // 🔧 相対座標に変更
        y: 0.6, // 🔧 相対座標に変更
        scale: 2.2,
        facing: "front",
        gaze: "right",
        pose: "standing",
        expression: "neutral",
        viewType: "face",
        faceAngle: "right",
        eyeDirection: "right",
        isGlobalPosition: false, // 🔧 パネル内配置
        bodyDirection: "right",
        faceExpression: "normal",
        bodyPose: "standing",
      },
      {
        panelId: 1,
        type: "heroine",
        name: "ヒロイン",
        x: 0.8, // 🔧 相対座標に変更
        y: 0.6, // 🔧 相対座標に変更
        scale: 2.2,
        facing: "front",
        gaze: "left",
        pose: "standing",
        expression: "neutral",
        viewType: "face",
        faceAngle: "left",
        eyeDirection: "left",
        isGlobalPosition: false, // 🔧 パネル内配置
        bodyDirection: "left",
        faceExpression: "normal",
        bodyPose: "standing",
      },
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "普通",
        text: "何か話そうか",
        x: 0.1, // 🔧 相対座標に変更
        y: 0.15, // 🔧 相対座標に変更
        scale: 1.0,
        width: 90,
        height: 70,
        vertical: true,
        isGlobalPosition: false, // 🔧 パネル内配置
      },
      {
        panelId: 1,
        type: "普通",
        text: "そうね",
        x: 0.9, // 🔧 相対座標に変更
        y: 0.12, // 🔧 相対座標に変更
        scale: 1.0,
        width: 60,
        height: 50,
        vertical: true,
        isGlobalPosition: false, // 🔧 パネル内配置
      },
    ],
  },
  action: {
    characters: [
      {
        panelId: 1,
        type: "hero",
        name: "主人公",
        x: 0.5, // 🔧 相対座標に変更
        y: 0.7, // 🔧 相対座標に変更
        scale: 2.5,
        facing: "front",
        gaze: "center",
        pose: "standing",
        expression: "neutral",
        viewType: "fullBody",
        faceAngle: "front",
        eyeDirection: "front",
        isGlobalPosition: false, // 🔧 パネル内配置
        bodyDirection: "front",
        faceExpression: "normal",
        bodyPose: "standing",
      },
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "叫び",
        text: "いくぞ！",
        x: 0.25, // 🔧 相対座標に変更
        y: 0.15, // 🔧 相対座標に変更
        scale: 1.0,
        width: 80,
        height: 60,
        vertical: true,
        isGlobalPosition: false, // 🔧 パネル内配置
      },
    ],
  },
  emotional: {
    characters: [
      {
        panelId: 1,
        type: "heroine",
        name: "ヒロイン",
        x: 0.45, // 🔧 相対座標に変更
        y: 0.6, // 🔧 相対座標に変更
        scale: 2.3,
        facing: "front",
        gaze: "down",
        pose: "standing",
        expression: "neutral",
        viewType: "face",
        faceAngle: "front",
        eyeDirection: "down",
        isGlobalPosition: false, // 🔧 パネル内配置
        bodyDirection: "front",
        faceExpression: "sad",
        bodyPose: "standing",
      },
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "心の声",
        text: "どうしよう...",
        x: 0.75, // 🔧 相対座標に変更
        y: 0.15, // 🔧 相対座標に変更
        scale: 1.0,
        width: 90,
        height: 70,
        vertical: true,
        isGlobalPosition: false, // 🔧 パネル内配置
      },
    ],
  },
  comedy: {
    characters: [
      {
        panelId: 1,
        type: "hero",
        name: "主人公",
        x: 0.3, // 🔧 相対座標に変更
        y: 0.65, // 🔧 相対座標に変更
        scale: 2.2,
        facing: "front",
        gaze: "center",
        pose: "standing",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "front",
        eyeDirection: "front",
        isGlobalPosition: false, // 🔧 パネル内配置
        bodyDirection: "front",
        faceExpression: "surprised",
        bodyPose: "standing",
      },
      {
        panelId: 1,
        type: "friend",
        name: "友人",
        x: 0.7, // 🔧 相対座標に変更
        y: 0.65, // 🔧 相対座標に変更
        scale: 2.2,
        facing: "front",
        gaze: "left",
        pose: "standing",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "left",
        eyeDirection: "left",
        isGlobalPosition: false, // 🔧 パネル内配置
        bodyDirection: "left",
        faceExpression: "smile",
        bodyPose: "standing",
      },
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "叫び",
        text: "なんてこった！",
        x: 0.15, // 🔧 相対座標に変更
        y: 0.15, // 🔧 相対座標に変更
        scale: 1.0,
        width: 100,
        height: 80,
        vertical: true,
        isGlobalPosition: false, // 🔧 パネル内配置
      },
      {
        panelId: 1,
        type: "普通",
        text: "まあまあ",
        x: 0.8, // 🔧 相対座標に変更
        y: 0.18, // 🔧 相対座標に変更
        scale: 1.0,
        width: 70,
        height: 50,
        vertical: true,
        isGlobalPosition: false, // 🔧 パネル内配置
      },
    ],
  },
  romance: {
    characters: [
      {
        panelId: 1,
        type: "hero",
        name: "主人公",
        x: 0.3, // 🔧 相対座標に変更
        y: 0.6, // 🔧 相対座標に変更
        scale: 2.0,
        facing: "front",
        gaze: "right",
        pose: "standing",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "rightFront",
        eyeDirection: "down",
        isGlobalPosition: false, // 🔧 パネル内配置
        bodyDirection: "rightFront",
        faceExpression: "embarrassed",
        bodyPose: "standing",
      },
      {
        panelId: 1,
        type: "heroine",
        name: "ヒロイン",
        x: 0.7, // 🔧 相対座標に変更
        y: 0.6, // 🔧 相対座標に変更
        scale: 2.0,
        facing: "front",
        gaze: "left",
        pose: "standing",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "leftFront",
        eyeDirection: "down",
        isGlobalPosition: false, // 🔧 パネル内配置
        bodyDirection: "leftFront",
        faceExpression: "embarrassed",
        bodyPose: "standing",
      },
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "小声",
        text: "あの...",
        x: 0.2, // 🔧 相対座標に変更
        y: 0.2, // 🔧 相対座標に変更
        scale: 1.0,
        width: 60,
        height: 50,
        vertical: true,
        isGlobalPosition: false, // 🔧 パネル内配置
      },
      {
        panelId: 1,
        type: "心の声",
        text: "ドキドキ...",
        x: 0.8, // 🔧 相対座標に変更
        y: 0.15, // 🔧 相対座標に変更
        scale: 1.0,
        width: 70,
        height: 60,
        vertical: true,
        isGlobalPosition: false, // 🔧 パネル内配置
      },
    ],
  },
  tension: {
    characters: [
      {
        panelId: 1,
        type: "hero",
        name: "主人公",
        x: 0.35, // 🔧 相対座標に変更
        y: 0.65, // 🔧 相対座標に変更
        scale: 2.0,
        facing: "front",
        gaze: "center",
        pose: "standing",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "back",
        eyeDirection: "front",
        isGlobalPosition: false, // 🔧 パネル内配置
        bodyDirection: "back",
        faceExpression: "worried",
        bodyPose: "standing",
      },
      {
        panelId: 1,
        type: "rival",
        name: "ライバル",
        x: 0.65, // 🔧 相対座標に変更
        y: 0.6, // 🔧 相対座標に変更
        scale: 2.2,
        facing: "front",
        gaze: "left",
        pose: "standing",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "leftBack",
        eyeDirection: "left",
        isGlobalPosition: false, // 🔧 パネル内配置
        bodyDirection: "leftBack",
        faceExpression: "angry",
        bodyPose: "arms_crossed",
      },
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "心の声",
        text: "気配が...",
        x: 0.2, // 🔧 相対座標に変更
        y: 0.15, // 🔧 相対座標に変更
        scale: 1.0,
        width: 80,
        height: 60,
        vertical: true,
        isGlobalPosition: false, // 🔧 パネル内配置
      },
      {
        panelId: 1,
        type: "普通",
        text: "フッ...",
        x: 0.8, // 🔧 相対座標に変更
        y: 0.2, // 🔧 相対座標に変更
        scale: 1.0,
        width: 60,
        height: 50,
        vertical: true,
        isGlobalPosition: false, // 🔧 パネル内配置
      },
    ],
  },
  surprise: {
    characters: [
      {
        panelId: 1,
        type: "heroine",
        name: "ヒロイン",
        x: 0.5, // 🔧 相対座標に変更
        y: 0.6, // 🔧 相対座標に変更
        scale: 2.5,
        facing: "front",
        gaze: "center",
        pose: "standing",
        expression: "neutral",
        viewType: "face",
        faceAngle: "front",
        eyeDirection: "up",
        isGlobalPosition: false, // 🔧 パネル内配置
        bodyDirection: "front",
        faceExpression: "surprised",
        bodyPose: "pointing",
      },
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "叫び",
        text: "えっ！？",
        x: 0.25, // 🔧 相対座標に変更
        y: 0.15, // 🔧 相対座標に変更
        scale: 1.0,
        width: 70,
        height: 60,
        vertical: true,
        isGlobalPosition: false, // 🔧 パネル内配置
      },
    ],
  },
};

// 🔧 修正版: 既存のapplySceneTemplate関数（後方互換性のため残す）
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
  console.log(`🎭 シーンテンプレート適用: ${sceneType} → パネル${targetPanel.id}`);

  // 🔧 修正: 相対座標なのでオフセット計算を削除
  const newCharacters = template.characters.map((char) => ({
    ...char,
    id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: targetPanel.id, // 🔧 選択されたパネルのID
    // x, y はそのまま（相対座標として使用）
  }));

  const newSpeechBubbles = template.speechBubbles.map((bubble) => ({
    ...bubble,
    id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: targetPanel.id, // 🔧 選択されたパネルのID
    // x, y はそのまま（相対座標として使用）
  }));

  console.log(`✅ 新規要素追加: キャラクター${newCharacters.length}個、吹き出し${newSpeechBubbles.length}個`);

  return {
    characters: [...existingCharacters, ...newCharacters],
    speechBubbles: [...existingSpeechBubbles, ...newSpeechBubbles],
  };
};