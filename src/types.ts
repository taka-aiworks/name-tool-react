// src/types.ts - 効果線完全対応版（CanvasComponentProps修正） + トーン型追加

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

// src/types.ts - CanvasComponentProps修正版
export interface CanvasComponentProps {
  selectedTemplate: string;
  panels: Panel[];
  setPanels: (panels: Panel[]) => void;
  characters: Character[];
  setCharacters: (characters: Character[]) => void;
  speechBubbles: SpeechBubble[];
  setSpeechBubbles: (speechBubbles: SpeechBubble[]) => void;
  
  // 背景関連プロパティ
  backgrounds: BackgroundElement[];
  setBackgrounds: (backgrounds: BackgroundElement[]) => void;
  
  // 効果線関連プロパティ
  effects: EffectElement[];
  setEffects: (effects: EffectElement[]) => void;
  selectedEffect?: EffectElement | null;
  onEffectSelect?: (effect: EffectElement | null) => void;
  onEffectRightClick?: (effect: EffectElement) => void;
  showEffectPanel?: boolean;
  onEffectPanelToggle?: () => void;
  
  // 🔧 トーン関連プロパティ（?を削除して必須にする）
  tones: ToneElement[];
  setTones: (tones: ToneElement[]) => void;
  selectedTone: ToneElement | null;
  onToneSelect: (tone: ToneElement | null) => void;
  showTonePanel: boolean;
  onTonePanelToggle: () => void;
  
  // 既存プロパティ
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
  type: "resize" | "move" | "split" | "delete";
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

// スナップ設定の型定義
export interface SnapSettings {
  enabled: boolean;
  gridSize: number;
  sensitivity: 'weak' | 'medium' | 'strong';
  gridDisplay: 'always' | 'edit-only' | 'hidden';
}

// ==========================================
// 背景機能用型定義
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

// ==========================================
// 効果線機能用型定義（新規追加）
// ==========================================

// 効果線の種類
export type EffectType = 'speed' | 'focus' | 'explosion' | 'flash';

// 効果線の方向
export type EffectDirection = 'horizontal' | 'vertical' | 'radial' | 'custom';

// 効果線要素の定義
export interface EffectElement {
  id: string;
  panelId: number;  // 既存のPanel.idに対応
  type: EffectType;
  x: number;
  y: number;
  width: number;
  height: number;
  direction: EffectDirection;
  intensity: number;        // 効果の強度 (0.1-1.0)
  density: number;          // 線の密度 (0.1-1.0)
  length: number;           // 線の長さ (0.1-1.0)
  angle: number;            // カスタム方向の角度 (0-360度)
  color: string;            // 効果線の色
  opacity: number;          // 透明度 (0-1)
  blur: number;             // ぼかし効果 (0-10)
  centerX?: number;         // 放射状効果の中心X (radial用)
  centerY?: number;         // 放射状効果の中心Y (radial用)
  selected: boolean;        // 選択状態
  zIndex: number;           // 重ね順
  isGlobalPosition: boolean; // グローバル座標かどうか
}

// 効果線テンプレートの定義
export interface EffectTemplate {
  id: string;
  name: string;
  type: EffectType;
  direction: EffectDirection;
  intensity: number;
  density: number;
  length: number;
  angle: number;
  color: string;
  opacity: number;
  blur: number;
  description: string;
  category: 'action' | 'emotion' | 'environment' | 'special';
}

// 効果線パネルのプロパティ
export interface EffectPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEffect: (effect: EffectElement) => void;
  selectedEffect: EffectElement | null;
  onUpdateEffect: (effect: EffectElement) => void;
  isDarkMode: boolean;
}

// 効果線レンダラーのプロパティ
export interface EffectRendererProps {
  effects: EffectElement[];
  canvasScale: number;
}

// 効果線操作のハンドル
export interface EffectHandle {
  type: "move" | "resize" | "rotate";
  direction?: "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";
  x: number;
  y: number;
  radius?: number;
}

// ==========================================
// トーンシステム用型定義（新規追加）
// ==========================================

// トーンの種類
export type ToneType = 'halftone' | 'gradient' | 'crosshatch' | 'dots' | 'lines' | 'noise';

// トーンパターンの種類
export type TonePattern = 
  // 網点系
  | 'dots_60' | 'dots_85' | 'dots_100' | 'dots_120' | 'dots_150'
  // 線系
  | 'lines_horizontal' | 'lines_vertical' | 'lines_diagonal' | 'lines_cross'
  // グラデーション系
  | 'gradient_linear' | 'gradient_radial' | 'gradient_diamond'
  // ノイズ系
  | 'noise_fine' | 'noise_coarse' | 'noise_grain'
  // 特殊効果
  | 'speed_lines' | 'focus_lines' | 'explosion';

// ブレンドモード
export type BlendMode = 
  | 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' 
  | 'hard-light' | 'darken' | 'lighten' | 'difference' | 'exclusion';

// ToneElement型定義 - 必要プロパティ追加版
// 現在のToneElementインターフェースに以下のプロパティを追加してください

export interface ToneElement {
  id: string;
  panelId: number;  // 既存のPanel.idに対応
  type: ToneType;
  pattern: TonePattern;
  x: number;        // パネル内相対座標 (0-1)
  y: number;        // パネル内相対座標 (0-1)
  width: number;    // パネル内相対サイズ (0-1)
  height: number;   // パネル内相対サイズ (0-1)
  
  // 基本設定
  density: number;          // 密度・濃度 (0-1)
  opacity: number;          // 透明度 (0-1)
  rotation: number;         // 回転角度 (0-360度)
  scale: number;            // パターンスケール (0.1-3.0)
  
  // 🆕 描画で使用されるプロパティを追加
  color?: string;           // 色（デフォルト: '#000000'）
  intensity?: number;       // 強度（デフォルト: 0.5）
  angle?: number;          // 角度（デフォルト: 0）
  direction?: 'horizontal' | 'vertical' | 'radial';  // 方向（デフォルト: 'vertical'）
  
  // 高度な設定
  blendMode: BlendMode;     // ブレンドモード
  contrast: number;         // コントラスト (0-2)
  brightness: number;       // 明度 (-1 to 1)
  invert: boolean;          // 反転
  
  // マスク設定
  maskEnabled: boolean;     // マスク有効
  maskShape: 'rectangle' | 'ellipse' | 'custom'; // マスク形状
  maskFeather: number;      // マスクのぼかし (0-20)
  
  // 選択・表示設定
  selected: boolean;        // 選択状態
  zIndex: number;           // 重ね順
  isGlobalPosition: boolean; // グローバル座標かどうか
  visible: boolean;         // 表示・非表示
}

// トーンテンプレートの定義
export interface ToneTemplate {
  id: string;
  name: string;
  type: ToneType;
  pattern: TonePattern;
  density: number;
  opacity: number;
  rotation: number;
  scale: number;
  blendMode: BlendMode;
  contrast: number;
  brightness: number;
  description: string;
  category: 'shadow' | 'highlight' | 'texture' | 'background' | 'effect' | 'mood';
  thumbnail?: string;       // プレビュー用サムネイル
  preview: {                // プレビュー設定
    backgroundColor: string;
    showPattern: boolean;
  };
}

// トーンパネルのプロパティ
export interface TonePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTone: (tone: ToneElement) => void;
  selectedTone: ToneElement | null;
  onUpdateTone: (tone: ToneElement) => void;
  isDarkMode: boolean;
  selectedPanel: Panel | null;
  tones: ToneElement[];
}

// トーンレンダラーのプロパティ
export interface ToneRendererProps {
  tones: ToneElement[];
  canvasScale: number;
}

// トーン操作のハンドル
export interface ToneHandle {
  type: "move" | "resize" | "rotate" | "mask";
  direction?: "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";
  x: number;
  y: number;
  radius?: number;
}

// Canvas要素の種類にトーンを追加
export type CanvasElementType = 'panel' | 'character' | 'bubble' | 'background' | 'effect' | 'tone';

// Canvas要素の統合型
export type CanvasElement = Panel | Character | SpeechBubble | BackgroundElement | EffectElement | ToneElement;