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
  characterId: string;    // 新：設定への参照
  
  // 配置（既存維持）
  x: number;
  y: number;
  width?: number;
  height?: number;
  scale: number;
  rotation?: number;
  isGlobalPosition: boolean;
  
  // シンプル化された状態
  name: string;           // そのまま残す
  type: string;          // そのまま残す  
  expression: string;     // 辞書対応
  action: string;        // 辞書対応（旧pose）
  facing: string;        // 辞書対応（旧gaze/bodyDirection統合）
  viewType: "face" | "upper_body" | "full_body";
  eyeState?: string;
  mouthState?: string; 
  handGesture?: string;
  // 🆕 新規追加8項目
  poses?: string;         // 漫画向けポーズ
  gaze?: string;         // 視線方向
  emotionPrimary?: string; // 基本感情
  physicalState?: string; // 体調・状態
}

// 新しく追加する設定型
export interface CharacterSettings {
  id: string;
  name: string;
  role: string;
  gender: 'male' | 'female' | 'other';
  basePrompt: string;
}

// 辞書エントリ
export interface DictionaryEntry {
  key: string;
  japanese: string;
  english: string;
}

// 辞書データ
export interface Dictionary {
  expressions: DictionaryEntry[];
  actions: DictionaryEntry[];
  facings: DictionaryEntry[];
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

// EditBubbleModalProps型定義（セリフ入力関連削除）
export interface EditBubbleModalProps {
  editingBubble: SpeechBubble | null;
  onComplete: () => void;
  onCancel: () => void;
  // 🔧 削除: editText, setEditText関連の型定義
}

// SpeechBubble型は既存のまま維持
export interface SpeechBubble {
  id: string;
  panelId: number;
  type: string;
  text: string;  // セリフテキストは維持（表示用）
  x: number;
  y: number;
  scale: number;
  width: number;
  height: number;
  vertical: boolean;
  isGlobalPosition: boolean;
}

// 🆕 テキスト描画設定の型定義（新規追加）
export interface BubbleTextSettings {
  fontSize?: number;           // 基本フォントサイズ
  fontFamily?: string;         // フォントファミリー
  lineHeight?: number;         // 行の高さ倍率
  padding?: number;           // 内側余白
  alignment?: 'center' | 'left' | 'right' | 'justify'; // テキスト整列
  verticalAlignment?: 'top' | 'middle' | 'bottom';     // 縦方向整列
  autoResize?: boolean;        // フォントサイズ自動調整
  minFontSize?: number;        // 最小フォントサイズ
  maxFontSize?: number;        // 最大フォントサイズ
  wordWrap?: 'character' | 'word' | 'smart';           // 折り返し方式
}

// 🆕 テキストセグメンテーション設定
export interface TextSegmentationOptions {
  enableJapaneseSegmentation?: boolean; // 日本語セグメント化有効
  respectPunctuation?: boolean;         // 句読点での改行を尊重
  preserveSpaces?: boolean;            // スペースの保持
  breakOnLanguageChange?: boolean;     // 言語変更時の改行
}

// 🆕 描画レイアウト情報
export interface TextLayoutInfo {
  lines: string[];             // 分割された行
  actualFontSize: number;      // 実際のフォントサイズ
  totalHeight: number;         // テキスト全体の高さ
  lineHeight: number;          // 行の高さ
  overflow: boolean;           // オーバーフロー発生
}

// マウスイベント関連（EditBubbleModal用）
export interface BubbleEditState {
  isEditing: boolean;
  editingBubbleId: string | null;
  modalPosition?: { x: number; y: number };
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

// src/types.ts - BackgroundElement修正版（nameをオプショナルに）

export interface BackgroundElement {
  id: string;
  panelId: number;  // 既存のPanel.idに対応（number型を維持）
  type: 'solid' | 'gradient' | 'pattern' | 'image';
  name?: string;    // 🔧 オプショナルに変更（既存システムと互換性保持）
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

// 🆕 キャラクター見た目設定の型定義（新規追加）
/*export interface CharacterAppearance {
  gender: 'male' | 'female' | 'other';
  hairColor: 'black' | 'brown' | 'blonde' | 'red' | 'blue' | 'green' | 'white' | 'silver';
  hairStyle: 'short' | 'medium' | 'long' | 'ponytail' | 'twintails' | 'bun';
  eyeColor: 'brown' | 'blue' | 'green' | 'gray' | 'black' | 'red' | 'purple';
  skinTone: 'light' | 'medium' | 'dark' | 'tan';
  clothing: 'school' | 'casual' | 'formal' | 'sports' | 'traditional' | 'fantasy';
  clothingColor: 'blue' | 'red' | 'green' | 'black' | 'white' | 'pink' | 'purple';
  accessories: string;
} */

// types.ts に追加する型定義（既存ファイルの末尾に追加）

// ==========================================
// ページ管理システム用型定義（新規追加）
// ==========================================

// ページ単位のデータ構造
export interface Page {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  panels: Panel[];
  characters: Character[];
  bubbles: SpeechBubble[];
  backgrounds: BackgroundElement[];
  effects: EffectElement[];
  tones: ToneElement[];
}

// プロジェクトデータ構造（ページ対応版）
export interface ProjectDataWithPages {
  id: string;
  name: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  currentPageIndex: number;
  pages: Page[];
  globalSettings: {
    canvasSize: { width: number; height: number };
    snapSettings: SnapSettings;
    darkMode: boolean;
    characterNames: Record<string, string>;
    characterSettings: Record<string, any>;
  };
}

// ページ管理コンポーネントのプロパティ
export interface PageManagerProps {
  // 現在のページデータ
  currentPage: Page;
  pages: Page[];
  currentPageIndex: number;
  
  // ページ操作コールバック
  onPageChange: (pageIndex: number) => void;
  onPageAdd: () => void;
  onPageDelete: (pageIndex: number) => void;
  onPageDuplicate: (pageIndex: number) => void;
  onPageRename: (pageIndex: number, newTitle: string) => void;
  onPageReorder: (fromIndex: number, toIndex: number) => void;
  
  // 現在のページデータ更新
  onCurrentPageUpdate: (pageData: Partial<Page>) => void;
  
  // UI設定
  isDarkMode: boolean;
  isCompact?: boolean;
}

// ページタブのプロパティ
export interface PageTabProps {
  page: Page;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  isDarkMode: boolean;
}

// ページ操作の種類
export type PageOperation = 
  | { type: 'ADD_PAGE' }
  | { type: 'DELETE_PAGE'; pageIndex: number }
  | { type: 'DUPLICATE_PAGE'; pageIndex: number }
  | { type: 'RENAME_PAGE'; pageIndex: number; title: string }
  | { type: 'REORDER_PAGE'; fromIndex: number; toIndex: number }
  | { type: 'SWITCH_PAGE'; pageIndex: number };

// ページ状態管理用のhook型
export interface UsePageManagerReturn {
  pages: Page[];
  currentPageIndex: number;
  currentPage: Page;
  
  // ページ操作関数
  addPage: () => void;
  deletePage: (pageIndex: number) => void;
  duplicatePage: (pageIndex: number) => void;
  renamePage: (pageIndex: number, newTitle: string) => void;
  switchToPage: (pageIndex: number) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  
  // 現在ページデータ更新
  updateCurrentPageData: (data: Partial<Page>) => void;
  
  // ページメタデータ
  canDeletePage: boolean;
  hasUnsavedChanges: boolean;
}

// バッチプロンプト生成用の型
export interface BatchPromptOptions {
  includePages: number[];
  outputFormat: 'individual' | 'combined' | 'structured';
  includeCharacterSettings: boolean;
  includePageTitles: boolean;
  customPrefix?: string;
  customSuffix?: string;
}