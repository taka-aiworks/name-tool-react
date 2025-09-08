// src/components/CanvasArea/sceneTemplates.ts
import { Character, SpeechBubble } from "../../types";

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
        x: 0.3,
        y: 0.7,
        scale: 1.0,
        facing: "front",
        gaze: "center",
        pose: "standing",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "front",
        eyeDirection: "center",
        isGlobalPosition: false,
      },
      {
        panelId: 1,
        type: "heroine",
        name: "ヒロイン",
        x: 0.7,
        y: 0.7,
        scale: 1.0,
        facing: "front",
        gaze: "left",
        pose: "standing",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "left",
        eyeDirection: "left",
        isGlobalPosition: false,
      },
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "普通",
        text: "おはよう！",
        x: 0.3,
        y: 0.2,
        scale: 1.0,
        width: 80,
        height: 60,
        vertical: true,
        isGlobalPosition: false,
      },
      {
        panelId: 1,
        type: "普通",
        text: "おはよう",
        x: 0.7,
        y: 0.3,
        scale: 1.0,
        width: 70,
        height: 50,
        vertical: true,
        isGlobalPosition: false,
      },
    ],
  },
  dialogue: {
    characters: [
      {
        panelId: 1,
        type: "hero",
        name: "主人公",
        x: 0.2,
        y: 0.6,
        scale: 1.2,
        facing: "front",
        gaze: "right",
        pose: "standing",
        expression: "neutral",
        viewType: "face",
        faceAngle: "right",
        eyeDirection: "right",
        isGlobalPosition: false,
      },
      {
        panelId: 1,
        type: "heroine",
        name: "ヒロイン",
        x: 0.8,
        y: 0.6,
        scale: 1.2,
        facing: "front",
        gaze: "left",
        pose: "standing",
        expression: "neutral",
        viewType: "face",
        faceAngle: "left",
        eyeDirection: "left",
        isGlobalPosition: false,
      },
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "普通",
        text: "何か話そうか",
        x: 0.2,
        y: 0.2,
        scale: 1.0,
        width: 90,
        height: 70,
        vertical: true,
        isGlobalPosition: false,
      },
      {
        panelId: 1,
        type: "普通",
        text: "そうね",
        x: 0.8,
        y: 0.3,
        scale: 1.0,
        width: 60,
        height: 50,
        vertical: true,
        isGlobalPosition: false,
      },
    ],
  },
  action: {
    characters: [
      {
        panelId: 1,
        type: "hero",
        name: "主人公",
        x: 0.5,
        y: 0.7,
        scale: 1.5,
        facing: "front",
        gaze: "center",
        pose: "standing",
        expression: "neutral",
        viewType: "fullBody",
        faceAngle: "front",
        eyeDirection: "center",
        isGlobalPosition: false,
      },
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "叫び",
        text: "いくぞ！",
        x: 0.3,
        y: 0.2,
        scale: 1.0,
        width: 80,
        height: 60,
        vertical: true,
        isGlobalPosition: false,
      },
    ],
  },
  emotional: {
    characters: [
      {
        panelId: 1,
        type: "heroine",
        name: "ヒロイン",
        x: 0.5,
        y: 0.6,
        scale: 1.3,
        facing: "front",
        gaze: "down",
        pose: "standing",
        expression: "neutral",
        viewType: "face",
        faceAngle: "front",
        eyeDirection: "down",
        isGlobalPosition: false,
      },
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "心の声",
        text: "どうしよう...",
        x: 0.7,
        y: 0.2,
        scale: 1.0,
        width: 90,
        height: 70,
        vertical: true,
        isGlobalPosition: false,
      },
    ],
  },
  comedy: {
    characters: [
      {
        panelId: 1,
        type: "hero",
        name: "主人公",
        x: 0.3,
        y: 0.7,
        scale: 1.2,
        facing: "front",
        gaze: "center",
        pose: "standing",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "front",
        eyeDirection: "center",
        isGlobalPosition: false,
      },
      {
        panelId: 1,
        type: "friend",
        name: "友人",
        x: 0.7,
        y: 0.7,
        scale: 1.2,
        facing: "front",
        gaze: "left",
        pose: "standing",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "left",
        eyeDirection: "left",
        isGlobalPosition: false,
      },
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "叫び",
        text: "なんてこった！",
        x: 0.3,
        y: 0.2,
        scale: 1.0,
        width: 100,
        height: 80,
        vertical: true,
        isGlobalPosition: false,
      },
      {
        panelId: 1,
        type: "普通",
        text: "まあまあ",
        x: 0.7,
        y: 0.3,
        scale: 1.0,
        width: 70,
        height: 50,
        vertical: true,
        isGlobalPosition: false,
      },
    ],
  },
};

// シーンテンプレート適用関数
export const applySceneTemplate = (
  sceneType: string,
  panels: any[],
  existingCharacters: Character[],
  existingSpeechBubbles: SpeechBubble[]
): { characters: Character[], speechBubbles: SpeechBubble[] } => {
  const template = sceneTemplates[sceneType];
  if (!template || panels.length === 0) {
    return { characters: existingCharacters, speechBubbles: existingSpeechBubbles };
  }

  // 新しいキャラクターを作成
  const newCharacters = template.characters.map((char) => ({
    ...char,
    id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: panels[0].id, // 最初のパネルに配置
  }));

  // 新しい吹き出しを作成
  const newSpeechBubbles = template.speechBubbles.map((bubble) => ({
    ...bubble,
    id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: panels[0].id, // 最初のパネルに配置
  }));

  return {
    characters: [...existingCharacters, ...newCharacters],
    speechBubbles: [...existingSpeechBubbles, ...newSpeechBubbles],
  };
};