// src/components/CanvasArea/sceneTemplates.ts (間隔調整版)
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
        x: 120, // 左に移動
        y: 130, // 下に移動
        scale: 2.0,
        facing: "front",
        gaze: "center",
        pose: "standing",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "front",
        eyeDirection: "center",
        isGlobalPosition: true,
      },
      {
        panelId: 1,
        type: "heroine",
        name: "ヒロイン",
        x: 430, // 右に移動
        y: 130, // 下に移動
        scale: 2.0,
        facing: "front",
        gaze: "left",
        pose: "standing",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "left",
        eyeDirection: "left",
        isGlobalPosition: true,
      },
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "普通",
        text: "おはよう！",
        x: 80, // 左キャラから離す
        y: 70, // 上に配置
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
        x: 480, // 右キャラから離す
        y: 65, // 上に配置
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
        x: 100, // 左端寄り
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
      },
      {
        panelId: 1,
        type: "heroine",
        name: "ヒロイン",
        x: 480, // 右端寄り
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
      },
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "普通",
        text: "何か話そうか",
        x: 60, // 左キャラから離す
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
        x: 520, // 右キャラから離す
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
        x: 300, // 中央
        y: 140, // 下寄り
        scale: 2.5,
        facing: "front",
        gaze: "center",
        pose: "standing",
        expression: "neutral",
        viewType: "fullBody",
        faceAngle: "front",
        eyeDirection: "center",
        isGlobalPosition: true,
      },
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "叫び",
        text: "いくぞ！",
        x: 150, // 中央キャラから大きく離す
        y: 60, // 上に配置
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
        x: 250, // 中央左寄り
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
      },
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "心の声",
        text: "どうしよう...",
        x: 380, // キャラから離す
        y: 60, // 上に配置
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
        x: 140, // 左寄り
        y: 130,
        scale: 2.2,
        facing: "front",
        gaze: "center",
        pose: "standing",
        expression: "neutral",
        viewType: "halfBody",
        faceAngle: "front",
        eyeDirection: "center",
        isGlobalPosition: true,
      },
      {
        panelId: 1,
        type: "friend",
        name: "友人",
        x: 410, // 右寄り
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
      },
    ],
    speechBubbles: [
      {
        panelId: 1,
        type: "叫び",
        text: "なんてこった！",
        x: 80, // 左キャラから離す
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
        x: 460, // 右キャラから離す
        y: 65,
        scale: 1.0,
        width: 70,
        height: 50,
        vertical: true,
        isGlobalPosition: true,
      },
    ],
  },
};

// シーンテンプレート適用関数（選択パネル対応・絶対座標調整）
export const applySceneTemplate = (
  sceneType: string,
  panels: any[],
  existingCharacters: Character[],
  existingSpeechBubbles: SpeechBubble[],
  selectedPanel?: any // 選択パネル情報を追加
): { characters: Character[], speechBubbles: SpeechBubble[] } => {
  const template = sceneTemplates[sceneType];
  if (!template || panels.length === 0) {
    return { characters: existingCharacters, speechBubbles: existingSpeechBubbles };
  }

  // 配置先パネルの決定（選択パネル優先、なければ最初のパネル）
  const targetPanel = selectedPanel || panels[0];
  const panelOffsetX = targetPanel.x;
  const panelOffsetY = targetPanel.y;

  console.log(`🎭 シーンテンプレート適用: ${sceneType} → パネル${targetPanel.id}`);

  // 新しいキャラクターを作成（選択パネルの座標に調整）
  const newCharacters = template.characters.map((char) => ({
    ...char,
    id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: targetPanel.id, // 選択パネルに配置
    x: char.x + panelOffsetX, // パネル位置に合わせて調整
    y: char.y + panelOffsetY, // パネル位置に合わせて調整
  }));

  // 新しい吹き出しを作成（選択パネルの座標に調整）
  const newSpeechBubbles = template.speechBubbles.map((bubble) => ({
    ...bubble,
    id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: targetPanel.id, // 選択パネルに配置
    x: bubble.x + panelOffsetX, // パネル位置に合わせて調整
    y: bubble.y + panelOffsetY, // パネル位置に合わせて調整
  }));

  console.log(`✅ 新規要素追加: キャラクター${newCharacters.length}個、吹き出し${newSpeechBubbles.length}個`);

  return {
    characters: [...existingCharacters, ...newCharacters],
    speechBubbles: [...existingSpeechBubbles, ...newSpeechBubbles],
  };
};