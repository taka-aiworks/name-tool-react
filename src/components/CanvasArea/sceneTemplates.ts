// src/components/CanvasArea/sceneTemplates.ts - シンプル版（4種類のみ）
import { Character, SpeechBubble, BackgroundElement, EffectElement, ToneElement } from "../../types";

export interface EnhancedSceneTemplate {
  name: string;
  description: string;
  category: 'basic' | 'emotion' | 'action';
  characters: Omit<Character, "id">[];
  speechBubbles: Omit<SpeechBubble, "id">[];
  backgrounds?: Omit<BackgroundElement, "id">[];
  effects?: Omit<EffectElement, "id">[];
  tones?: Omit<ToneElement, "id">[];
}

// ==========================================
// シンプルなシーンテンプレート（4種類のみ）
// ==========================================

// === 1. 基本会話シーン ===
export const basicDialogue: EnhancedSceneTemplate = {
  name: "💬 基本会話",
  description: "2人の会話シーン",
  category: 'basic',
  characters: [
    {
      panelId: 1,
      type: "hero",
      name: "主人公",
      x: 150, // 絶対座標（300×300想定の左側）
      y: 180,
      scale: 2.0,
      facing: "front",
      gaze: "right",
      pose: "standing",
      expression: "neutral",
      viewType: "halfBody",
      faceAngle: "right",
      eyeDirection: "right",
      isGlobalPosition: false,
      bodyDirection: "right",
      faceExpression: "normal",
      bodyPose: "standing",
    },
    {
      panelId: 1,
      type: "heroine",
      name: "ヒロイン",
      x: 450, // 絶対座標（300×300想定の右側）
      y: 180,
      scale: 2.0,
      facing: "front",
      gaze: "left",
      pose: "standing",
      expression: "neutral",
      viewType: "halfBody",
      faceAngle: "left",
      eyeDirection: "left",
      isGlobalPosition: false,
      bodyDirection: "left",
      faceExpression: "normal",
      bodyPose: "standing",
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
};

// === 2. 驚きシーン ===
export const surpriseScene: EnhancedSceneTemplate = {
  name: "😲 驚き",
  description: "驚いた瞬間のシーン",
  category: 'emotion',
  characters: [
    {
      panelId: 1,
      type: "hero",
      name: "主人公",
      x: 300, // 中央配置
      y: 180,
      scale: 2.5,
      facing: "front",
      gaze: "center",
      pose: "standing",
      expression: "neutral",
      viewType: "face",
      faceAngle: "front",
      eyeDirection: "front",
      isGlobalPosition: false,
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
      x: 150,
      y: 50,
      scale: 1.2,
      width: 80,
      height: 70,
      vertical: true,
      isGlobalPosition: false,
    },
  ],
  effects: [
    {
      panelId: 1,
      type: "focus",
      x: 200,
      y: 100,
      width: 200,
      height: 200,
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
};

// === 3. アクションシーン ===
export const actionScene: EnhancedSceneTemplate = {
  name: "💨 アクション",
  description: "動きのあるシーン",
  category: 'action',
  characters: [
    {
      panelId: 1,
      type: "hero", 
      name: "主人公",
      x: 200,
      y: 200,
      scale: 2.3,
      facing: "front",
      gaze: "right",
      pose: "standing",
      expression: "neutral",
      viewType: "fullBody",
      faceAngle: "right",
      eyeDirection: "front",
      isGlobalPosition: false,
      bodyDirection: "right",
      faceExpression: "normal",
      bodyPose: "running",
    },
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
    },
  ],
  effects: [
    {
      panelId: 1,
      type: "speed",
      x: 50,
      y: 150,
      width: 150,
      height: 100,
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
};

// === 4. 一人考えシーン ===
export const thoughtScene: EnhancedSceneTemplate = {
  name: "🤔 一人考え",
  description: "一人で考えるシーン",
  category: 'emotion',
  characters: [
    {
      panelId: 1,
      type: "heroine",
      name: "ヒロイン",
      x: 270,
      y: 180,
      scale: 2.2,
      facing: "front",
      gaze: "down",
      pose: "standing",
      expression: "neutral",
      viewType: "halfBody",
      faceAngle: "front",
      eyeDirection: "down",
      isGlobalPosition: false,
      bodyDirection: "front",
      faceExpression: "worried",
      bodyPose: "standing",
    },
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
    },
  ],
  tones: [
    {
      panelId: 1,
      type: "halftone",
      pattern: "dots_60",
      x: 0,
      y: 0,
      width: 600,
      height: 200,
      density: 0.3,
      opacity: 0.4,
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
};

// ==========================================
// 統合・管理関数
// ==========================================

// 全シーンテンプレート（4種類のみ）
export const getAllSceneTemplates = (): Record<string, EnhancedSceneTemplate> => {
  return {
    basic_dialogue: basicDialogue,
    surprise: surpriseScene,
    action: actionScene,
    thought: thoughtScene,
  };
};

// カテゴリ別取得
export const getTemplatesByCategory = (category: 'basic' | 'emotion' | 'action'): Record<string, EnhancedSceneTemplate> => {
  const allTemplates = getAllSceneTemplates();
  const filtered: Record<string, EnhancedSceneTemplate> = {};
  
  Object.entries(allTemplates).forEach(([key, template]) => {
    if (template.category === category) {
      filtered[key] = template;
    }
  });
  
  return filtered;
};

// シンプル版適用関数
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
  console.log(`🎭 シンプルテンプレート適用: ${template.name} → パネル${targetPanel.id}`);

  // キャラクター生成（シンプルな相対座標で配置）
  const newCharacters = template.characters.map((char) => ({
    ...char,
    id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: targetPanel.id,
    x: targetPanel.x + (char.x / 600) * targetPanel.width, // 0-1の相対座標に変換
    y: targetPanel.y + (char.y / 300) * targetPanel.height,
  }));

  // 吹き出し生成
  const newSpeechBubbles = template.speechBubbles.map((bubble) => ({
    ...bubble,
    id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: targetPanel.id,
    x: targetPanel.x + (bubble.x / 600) * targetPanel.width,
    y: targetPanel.y + (bubble.y / 300) * targetPanel.height,
  }));

  // 背景・効果線・トーン生成
  const newBackgrounds = (template.backgrounds || []).map((bg) => ({
    ...bg,
    id: `bg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: targetPanel.id,
  }));

  // 効果線生成
  const newEffects = (template.effects || []).map((effect) => ({
    ...effect,
    id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: targetPanel.id,
    x: targetPanel.x + (effect.x / 600) * targetPanel.width,
    y: targetPanel.y + (effect.y / 300) * targetPanel.height,
  }));

  const newTones = (template.tones || []).map((tone) => ({
    ...tone,
    id: `tone_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: targetPanel.id,
  }));

  console.log(`✅ 要素追加: キャラ${newCharacters.length}個、吹き出し${newSpeechBubbles.length}個、効果線${newEffects.length}個、トーン${newTones.length}個`);

  return {
    characters: [...existingCharacters, ...newCharacters],
    speechBubbles: [...existingSpeechBubbles, ...newSpeechBubbles], 
    backgrounds: [...existingBackgrounds, ...newBackgrounds],
    effects: [...existingEffects, ...newEffects],
    tones: [...existingTones, ...newTones],
  };
};

// 後方互換性のための既存テンプレート（シンプル版）
export interface SceneTemplate {
  characters: Omit<Character, "id">[];
  speechBubbles: Omit<SpeechBubble, "id">[];
}

export const sceneTemplates: Record<string, SceneTemplate> = {
  daily: {
    characters: [basicDialogue.characters[0], basicDialogue.characters[1]],
    speechBubbles: [basicDialogue.speechBubbles[0], basicDialogue.speechBubbles[1]],
  },
  action: {
    characters: [actionScene.characters[0]],
    speechBubbles: [actionScene.speechBubbles[0]],
  },
  emotional: {
    characters: [thoughtScene.characters[0]],
    speechBubbles: [thoughtScene.speechBubbles[0]],
  },
  surprise: {
    characters: [surpriseScene.characters[0]],
    speechBubbles: [surpriseScene.speechBubbles[0]],
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
  console.log(`🎭 シンプルテンプレート適用: ${sceneType} → パネル${targetPanel.id}`);

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