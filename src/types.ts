// src/types.ts - キャラクターリサイズ対応版

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
  
  // 🆕 縦横自由リサイズ用プロパティ追加
  width?: number;  // 幅（省略時はscaleから計算）
  height?: number; // 高さ（省略時はscaleから計算）
  // 🆕 2D回転機能追加
  rotation?: number; // 回転角度（度数、0-360）デフォルト: 0
  
  // 旧システム（一時的に残す）
  facing: string;
  gaze: string;
  pose: string;
  expression: string;
  
  // 新システム
  bodyDirection: "front" | "left" | "right" | "back" | "leftFront" | "rightFront" | "leftBack" | "rightBack";
  faceExpression: "normal" | "smile" | "sad" | "angry" | "surprised" | "embarrassed" | "worried" | "sleepy";
  bodyPose: "standing" | "sitting" | "walking" | "running" | "pointing" | "waving" | "thinking" | "arms_crossed";
  eyeDirection: "front" | "left" | "right" | "up" | "down"; // 5方向に簡略化
  
  viewType: "face" | "halfBody" | "fullBody";
  
  // 後方互換性のため残す（将来削除予定）
  faceAngle: "front" | "left" | "right" | "back" | "leftFront" | "rightFront" | "leftBack" | "rightBack";
  
  isGlobalPosition: boolean;
}


// 🆕 新しい型定義を追加
export interface CharacterBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export interface RotationHandle {
  type: "rotation";
  x: number;
  y: number;
  radius: number;
}

export type CharacterInteractionMode = "none" | "move" | "resize" | "rotate";

export interface CharacterInteractionState {
  mode: CharacterInteractionMode;
  resizeDirection?: string;
  rotationStartAngle?: number;
  originalRotation?: number;
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
  isGlobalPosition: boolean;
}

// CanvasComponent のプロパティ型（スナップ設定対応）
// src/types.ts - CanvasComponentProps背景対応更新部分

// 🔧 既存のCanvasComponentPropsを以下に置き換え
export interface CanvasComponentProps {
  selectedTemplate: string;
  panels: Panel[];
  setPanels: (panels: Panel[]) => void;
  characters: Character[];
  setCharacters: (characters: Character[]) => void;
  speechBubbles: SpeechBubble[];
  setSpeechBubbles: (speechBubbles: SpeechBubble[]) => void;
  
  // 🆕 背景関連プロパティ追加
  backgrounds: BackgroundElement[];
  setBackgrounds: (backgrounds: BackgroundElement[]) => void;
  
  onCharacterAdd: (func: (type: string) => void) => void;
  onBubbleAdd: (func: (type: string, text: string) => void) => void;
  onPanelSelect?: (panel: Panel | null) => void;
  onCharacterSelect?: (character: Character | null) => void;
  onCharacterRightClick?: (character: Character) => void;
  isPanelEditMode?: boolean;
  onPanelSplit?: (panelId: number, direction: "horizontal" | "vertical") => void;
  onPanelEditModeToggle?: (enabled: boolean) => void;
  onPanelAdd?: (targetPanelId: string, position: 'above' | 'below' | 'left' | 'right') => void;
  onPanelDelete?: (panelId: string) => void;
  snapSettings?: SnapSettings;
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

// パネル操作関連の型
export interface PanelHandle {
  type: "resize" | "move" | "split" | "delete"; // 🔧 delete追加
  direction?: "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";
  x: number;
  y: number;
}

export interface PanelOperation {
  type: "move" | "resize" | "split";
  panelId: number;
  data: any;
}

// 履歴管理の型
export interface OperationHistory {
  characters: Character[][];
  speechBubbles: SpeechBubble[][];
  panels: Panel[][];
  currentIndex: number;
}

// 🆕 スナップ設定の型定義
export interface SnapSettings {
  enabled: boolean;
  gridSize: number;
  sensitivity: 'weak' | 'medium' | 'strong';
  gridDisplay: 'always' | 'edit-only' | 'hidden';
}

// types.ts - 背景機能型定義追加部分
// 既存のtypes.tsの最後に以下を追加してください（既存の型定義は一切変更しない）

// ==========================================
// 背景機能用型定義（新規追加）
// ==========================================

export interface BackgroundElement {
  id: string;
  panelId: number;  // 既存のPanel.idに対応（number型を維持）
  type: 'solid' | 'gradient' | 'pattern' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  opacity: number;
  
  // 単色背景用
  solidColor?: string;
  
  // グラデーション背景用
  gradientType?: 'linear' | 'radial';
  gradientColors?: string[];
  gradientDirection?: number; // 角度（度数）
  
  // パターン背景用
  patternType?: 'dots' | 'lines' | 'grid' | 'diagonal' | 'crosshatch';
  patternColor?: string;
  patternSize?: number;
  patternSpacing?: number;
  
  // 画像背景用
  imageUrl?: string;
  imageMode?: 'fit' | 'fill' | 'stretch' | 'tile';
  imageBrightness?: number;
  imageContrast?: number;
}

// 背景テンプレート定義
export interface BackgroundTemplate {
  id: string;
  name: string;
  category: 'nature' | 'indoor' | 'school' | 'city' | 'abstract' | 'emotion';
  thumbnail?: string;
  elements: Omit<BackgroundElement, 'id' | 'panelId'>[];
}

// 背景管理用の型
export interface BackgroundManager {
  backgrounds: BackgroundElement[];
  selectedBackground: BackgroundElement | null;
  isDragging: boolean;
  isResizing: boolean;
  resizeDirection: string;
}

// 背景コンポーネントのプロパティ
export interface BackgroundPanelProps {
  isOpen: boolean;
  onClose: () => void;
  backgrounds: BackgroundElement[];
  setBackgrounds: (backgrounds: BackgroundElement[]) => void;
  selectedPanel: Panel | null;
  onBackgroundAdd: (template: BackgroundTemplate) => void;
}

// 背景レンダラーのプロパティ
export interface BackgroundRendererProps {
  backgrounds: BackgroundElement[];
  panelId: number;
  panelBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  ctx: CanvasRenderingContext2D;
  isSelected?: boolean;
  selectedBackground?: BackgroundElement | null;
}

// 背景操作のハンドル
export interface BackgroundHandle {
  type: "move" | "resize" | "rotate";
  direction?: "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";
  x: number;
  y: number;
  radius?: number;
}