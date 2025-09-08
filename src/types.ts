// src/types.ts - 共通型定義

export interface Panel {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpeechBubble {
  id: string;
  panelId: number;
  type: string;
  text: string;
  x: number;
  y: number;
  scale: number;
  width: number;
  height: number;
  vertical: boolean;
}

// CanvasComponent のプロパティ型
export interface CanvasComponentProps {
  selectedTemplate: string;
  panels: Panel[];
  setPanels: (panels: Panel[]) => void;
  characters: Character[];
  setCharacters: (characters: Character[]) => void;
  speechBubbles: SpeechBubble[];
  setSpeechBubbles: (speechBubbles: SpeechBubble[]) => void;
  onCharacterAdd: (func: (type: string) => void) => void;
  onBubbleAdd: (func: (type: string, text: string) => void) => void;
  onPanelSelect?: (panel: Panel | null) => void;
  onCharacterSelect?: (character: Character | null) => void;
  onCharacterRightClick?: (character: Character) => void; // 新追加
}

// テンプレート定義の型
export interface Template {
  panels: Panel[];
}


// シーン情報の型
export interface SceneInfo {
  id: string;
  icon: string;
  name: string;
}

// キャラクター情報の型
export interface CharacterInfo {
  id: string;
  icon: string;
  name: string;
}

// 吹き出し情報の型
export interface BubbleInfo {
  id: string;
  icon: string;
  name: string;
}

// テンプレート情報の型
export interface TemplateInfo {
  id: string;
  title: string;
  desc: string;
}

// src/types.ts - 共通型定義

export interface Panel {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Character {
  id: string;
  panelId: number;
  type: string;
  name: string;
  x: number; // パネル内の相対位置 (0-1) または絶対座標
  y: number; // パネル内の相対位置 (0-1) または絶対座標
  scale: number;
  facing: string;
  gaze: string;
  pose: string;
  expression: string;
  // 新機能追加
  viewType: "face" | "halfBody" | "fullBody"; // 顔アップ/半身/全身
  faceAngle: "front" | "left" | "right" | "back" | "leftFront" | "rightFront" | "leftBack" | "rightBack"; // 8方向に拡張
  eyeDirection: "center" | "left" | "right" | "up" | "down" | "leftUp" | "rightUp" | "leftDown" | "rightDown"; // 9方向に拡張
  isGlobalPosition: boolean; // 自由移動モード（パネル外移動可能）
}

export interface SpeechBubble {
  id: string;
  panelId: number;
  type: string;
  text: string;
  x: number;
  y: number;
  scale: number;
  width: number;
  height: number;
  vertical: boolean;
  // 新機能追加
  isGlobalPosition: boolean; // 自由移動モード（パネル外移動可能）
}

// CanvasComponent のプロパティ型
export interface CanvasComponentProps {
  selectedTemplate: string;
  panels: Panel[];
  setPanels: (panels: Panel[]) => void;
  characters: Character[];
  setCharacters: (characters: Character[]) => void;
  onCharacterAdd: (addCharacterFunc: (type: string) => void) => void;
  onPanelSelect?: (panel: Panel | null) => void;
  speechBubbles: SpeechBubble[];
  setSpeechBubbles: (bubbles: SpeechBubble[]) => void;
  onBubbleAdd: (addBubbleFunc: (type: string, text: string) => void) => void;
}

// テンプレート定義の型
export interface Template {
  panels: Panel[];
}

export type Templates = Record<string, Template>;

// シーン情報の型
export interface SceneInfo {
  id: string;
  icon: string;
  name: string;
}

// キャラクター情報の型
export interface CharacterInfo {
  id: string;
  icon: string;
  name: string;
}

// 吹き出し情報の型
export interface BubbleInfo {
  id: string;
  icon: string;
  name: string;
}

// テンプレート情報の型
export interface TemplateInfo {
  id: string;
  title: string;
  desc: string;
}

export interface CanvasComponentProps {
  selectedTemplate: string;
  panels: Panel[];
  setPanels: (panels: Panel[]) => void;
  characters: Character[];
  setCharacters: (characters: Character[]) => void;
  onCharacterAdd: (addCharacterFunc: (type: string) => void) => void;
  onPanelSelect?: (panel: Panel | null) => void;
  speechBubbles: SpeechBubble[];
  setSpeechBubbles: (bubbles: SpeechBubble[]) => void;
  onBubbleAdd: (addBubbleFunc: (type: string, text: string) => void) => void;
  onCharacterSelect?: (character: Character | null) => void; // この行を追加
}