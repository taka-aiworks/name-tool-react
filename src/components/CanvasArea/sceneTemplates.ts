// src/components/CanvasArea/sceneTemplates.ts (エラー修正版)
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
        x: 120,
        y: 130,
        scale: 2.0,
        facing: "front",
        gaze: "center",
        pose: "standing",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "front",
        eyeDirection: "front", // center → front
        isGlobalPosition: true,
        // 新システム
        bodyDirection: "front",
        faceExpression: "normal",
        bodyPose: "standing",
      },
      {
        panelId: 1,
        type: "heroine",
        name: "ヒロイン",
        x: 430,
        y: 130,
        scale: 2.0,
        facing: "front",
        gaze: "left",
        pose: "standing",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "left",
        eyeDirection: "left",
        isGlobalPosition: true,
        // 新システム
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
        x: 80,
        y: 70,
        scale: 1.0,
        width: 80,
        height: 60,
        vertical: true,
        isGlobalPosition: true,
      },
      {
        panelId: 1,
        type: "普通",
        text: "おはよう",
        x: 480,
        y: 65,
        scale: 1.0,
        width: 70,
        height: 50,
        vertical: true,
        isGlobalPosition: true,
      },
    ],
  },
  dialogue: {
    characters: [
      {
        panelId: 1,
        type: "hero",
        name: "主人公",
        x: 100,
        y: 120,
        scale: 2.2,
        facing: "front",
        gaze: "right",
        pose: "standing",
        expression: "neutral",
        viewType: "face",
        faceAngle: "right",
        eyeDirection: "right",
        isGlobalPosition: true,
        // 新システム
        bodyDirection: "right",
        faceExpression: "normal",
        bodyPose: "standing",
      },
      {
        panelId: 1,
        type: "heroine",
        name: "ヒロイン",
        x: 480,
        y: 120,
        scale: 2.2,
        facing: "front",
        gaze: "left",
        pose: "standing",
        expression: "neutral",
        viewType: "face",
        faceAngle: "left",
        eyeDirection: "left",
        isGlobalPosition: true,
        // 新システム
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
        x: 60,
        y: 60,
        scale: 1.0,
        width: 90,
        height: 70,
        vertical: true,
        isGlobalPosition: true,
      },
      {
        panelId: 1,
        type: "普通",
        text: "そうね",
        x: 520,
        y: 55,
        scale: 1.0,
        width: 60,
        height: 50,
        vertical: true,
        isGlobalPosition: true,
      },
    ],
  },
  action: {
    characters: [
      {
        panelId: 1,
        type: "hero",
        name: "主人公",
        x: 300,
        y: 140,
        scale: 2.5,
        facing: "front",
        gaze: "center",
        pose: "standing",
        expression: "neutral",
        viewType: "fullBody",
        faceAngle: "front",
        eyeDirection: "front", // center → front
        isGlobalPosition: true,
        // 新システム
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
        x: 150,
        y: 60,
        scale: 1.0,
        width: 80,
        height: 60,
        vertical: true,
        isGlobalPosition: true,
      },
    ],
  },
  emotional: {
    characters: [
      {
        panelId: 1,
        type: "heroine",
        name: "ヒロイン",
        x: 250,
        y: 120,
        scale: 2.3,
        facing: "front",
        gaze: "down",
        pose: "standing",
        expression: "neutral",
        viewType: "face",
        faceAngle: "front",
        eyeDirection: "down",
        isGlobalPosition: true,
        // 新システム
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
        x: 380,
        y: 60,
        scale: 1.0,
        width: 90,
        height: 70,
        vertical: true,
        isGlobalPosition: true,
      },
    ],
  },
  comedy: {
    characters: [
      {
        panelId: 1,
        type: "hero",
        name: "主人公",
        x: 140,
        y: 130,
        scale: 2.2,
        facing: "front",
        gaze: "center",
        pose: "standing",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "front",
        eyeDirection: "front", // center → front
        isGlobalPosition: true,
        // 新システム
        bodyDirection: "front",
        faceExpression: "surprised",
        bodyPose: "standing",
      },
      {
        panelId: 1,
        type: "friend",
        name: "友人",
        x: 410,
        y: 130,
        scale: 2.2,
        facing: "front",
        gaze: "left",
        pose: "standing",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "left",
        eyeDirection: "left",
        isGlobalPosition: true,
        // 新システム
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
        x: 80,
        y: 60,
        scale: 1.0,
        width: 100,
        height: 80,
        vertical: true,
        isGlobalPosition: true,
      },
      {
        panelId: 1,
        type: "普通",
        text: "まあまあ",
        x: 460,
        y: 65,
        scale: 1.0,
        width: 70,
        height: 50,
        vertical: true,
        isGlobalPosition: true,
      },
    ],
  },
  // 新シーンテンプレート（新システム活用）
  romance: {
    characters: [
      {
        panelId: 1,
        type: "hero",
        name: "主人公",
        x: 150,
        y: 120,
        scale: 2.0,
        facing: "front",
        gaze: "right",
        pose: "standing",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "rightFront",
        eyeDirection: "down",
        isGlobalPosition: true,
        // 新システム
        bodyDirection: "rightFront",
        faceExpression: "embarrassed",
        bodyPose: "standing",
      },
      {
        panelId: 1,
        type: "heroine",
        name: "ヒロイン",
        x: 400,
        y: 120,
        scale: 2.0,
        facing: "front",
        gaze: "left",
        pose: "standing",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "leftFront",
        eyeDirection: "down",
        isGlobalPosition: true,
        // 新システム
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
        x: 100,
        y: 70,
        scale: 1.0,
        width: 60,
        height: 50,
        vertical: true,
        isGlobalPosition: true,
      },
      {
        panelId: 1,
        type: "心の声",
        text: "ドキドキ...",
        x: 450,
        y: 60,
        scale: 1.0,
        width: 70,
        height: 60,
        vertical: true,
        isGlobalPosition: true,
      },
    ],
  },
  tension: {
    characters: [
      {
        panelId: 1,
        type: "hero",
        name: "主人公",
        x: 200,
        y: 130,
        scale: 2.0,
        facing: "front",
        gaze: "center",
        pose: "standing",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "back",
        eyeDirection: "front",
        isGlobalPosition: true,
        // 新システム
        bodyDirection: "back",
        faceExpression: "worried",
        bodyPose: "standing",
      },
      {
        panelId: 1,
        type: "rival",
        name: "ライバル",
        x: 380,
        y: 120,
        scale: 2.2,
        facing: "front",
        gaze: "left",
        pose: "standing",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "leftBack",
        eyeDirection: "left",
        isGlobalPosition: true,
        // 新システム
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
        x: 120,
        y: 60,
        scale: 1.0,
        width: 80,
        height: 60,
        vertical: true,
        isGlobalPosition: true,
      },
      {
        panelId: 1,
        type: "普通",
        text: "フッ...",
        x: 450,
        y: 70,
        scale: 1.0,
        width: 60,
        height: 50,
        vertical: true,
        isGlobalPosition: true,
      },
    ],
  },
  surprise: {
    characters: [
      {
        panelId: 1,
        type: "heroine",
        name: "ヒロイン",
        x: 280,
        y: 120,
        scale: 2.5,
        facing: "front",
        gaze: "center",
        pose: "standing",
        expression: "neutral",
        viewType: "face",
        faceAngle: "front",
        eyeDirection: "up",
        isGlobalPosition: true,
        // 新システム
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
        x: 150,
        y: 60,
        scale: 1.0,
        width: 70,
        height: 60,
        vertical: true,
        isGlobalPosition: true,
      },
    ],
  },
};

// シーンテンプレート適用関数（変更なし）
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
  const panelOffsetX = targetPanel.x;
  const panelOffsetY = targetPanel.y;

  console.log(`🎭 シーンテンプレート適用: ${sceneType} → パネル${targetPanel.id}`);

  const newCharacters = template.characters.map((char) => ({
    ...char,
    id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: targetPanel.id,
    x: char.x + panelOffsetX,
    y: char.y + panelOffsetY,
  }));

  const newSpeechBubbles = template.speechBubbles.map((bubble) => ({
    ...bubble,
    id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: targetPanel.id,
    x: bubble.x + panelOffsetX,
    y: bubble.y + panelOffsetY,
  }));

  console.log(`✅ 新規要素追加: キャラクター${newCharacters.length}個、吹き出し${newSpeechBubbles.length}個`);

  return {
    characters: [...existingCharacters, ...newCharacters],
    speechBubbles: [...existingSpeechBubbles, ...newSpeechBubbles],
  };
};