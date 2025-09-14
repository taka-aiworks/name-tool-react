// src/components/CanvasArea/toneTemplates.ts - トーンテンプレート定義
import { ToneTemplate, ToneElement, BlendMode } from '../../types';

/**
 * 漫画制作用トーンテンプレート集
 * カテゴリ別に整理された高品質なトーンパターン
 */

// ==========================================
// 影・陰影用トーン (shadow)
// ==========================================
export const shadowToneTemplates: ToneTemplate[] = [
  {
    id: 'shadow_soft_60',
    name: '柔らかい影（60線）',
    type: 'halftone',
    pattern: 'dots_60',
    density: 0.4,
    opacity: 0.8,
    rotation: 45,
    scale: 1.0,
    blendMode: 'multiply',
    contrast: 1.1,
    brightness: 0,
    description: 'やわらかな陰影表現に最適な60線網点',
    category: 'shadow',
    preview: { backgroundColor: '#ffffff', showPattern: true }
  },
  {
    id: 'shadow_medium_85',
    name: '標準影（85線）',
    type: 'halftone',
    pattern: 'dots_85',
    density: 0.5,
    opacity: 0.9,
    rotation: 45,
    scale: 1.0,
    blendMode: 'multiply',
    contrast: 1.2,
    brightness: -0.1,
    description: '一般的な影表現の85線網点',
    category: 'shadow',
    preview: { backgroundColor: '#ffffff', showPattern: true }
  },
  {
    id: 'shadow_dark_120',
    name: '濃い影（120線）',
    type: 'halftone',
    pattern: 'dots_120',
    density: 0.7,
    opacity: 1.0,
    rotation: 45,
    scale: 1.0,
    blendMode: 'multiply',
    contrast: 1.3,
    brightness: -0.2,
    description: '濃い陰影用の120線網点',
    category: 'shadow',
    preview: { backgroundColor: '#ffffff', showPattern: true }
  },
  {
    id: 'shadow_crosshatch',
    name: 'クロスハッチ影',
    type: 'crosshatch',
    pattern: 'lines_cross',
    density: 0.6,
    opacity: 0.8,
    rotation: 0,
    scale: 0.8,
    blendMode: 'multiply',
    contrast: 1.0,
    brightness: 0,
    description: 'ペン画風のクロスハッチング',
    category: 'shadow',
    preview: { backgroundColor: '#ffffff', showPattern: true }
  }
];

// ==========================================
// ハイライト・光表現用トーン (highlight)
// ==========================================
export const highlightToneTemplates: ToneTemplate[] = [
  {
    id: 'highlight_soft',
    name: '柔らかい光',
    type: 'gradient',
    pattern: 'gradient_radial',
    density: 0.3,
    opacity: 0.6,
    rotation: 0,
    scale: 1.2,
    blendMode: 'screen',
    contrast: 0.8,
    brightness: 0.3,
    description: '柔らかな光の表現',
    category: 'highlight',
    preview: { backgroundColor: '#666666', showPattern: true }
  },
  {
    id: 'highlight_flash',
    name: 'フラッシュ光',
    type: 'lines',
    pattern: 'focus_lines',
    density: 0.5,
    opacity: 0.7,
    rotation: 0,
    scale: 1.0,
    blendMode: 'screen',
    contrast: 1.5,
    brightness: 0.4,
    description: '強いフラッシュ光の表現',
    category: 'highlight',
    preview: { backgroundColor: '#666666', showPattern: true }
  },
  {
    id: 'highlight_glow',
    name: '発光効果',
    type: 'gradient',
    pattern: 'gradient_diamond',
    density: 0.4,
    opacity: 0.5,
    rotation: 45,
    scale: 1.5,
    blendMode: 'overlay',
    contrast: 0.9,
    brightness: 0.2,
    description: '発光・グロー効果',
    category: 'highlight',
    preview: { backgroundColor: '#666666', showPattern: true }
  }
];

// ==========================================
// 質感・テクスチャ用トーン (texture)
// ==========================================
export const textureToneTemplates: ToneTemplate[] = [
  {
    id: 'texture_fabric',
    name: '布地テクスチャ',
    type: 'lines',
    pattern: 'lines_cross',
    density: 0.3,
    opacity: 0.4,
    rotation: 15,
    scale: 0.6,
    blendMode: 'multiply',
    contrast: 0.8,
    brightness: 0.1,
    description: '衣服の質感表現',
    category: 'texture',
    preview: { backgroundColor: '#ffffff', showPattern: true }
  },
  {
    id: 'texture_metal',
    name: '金属テクスチャ',
    type: 'lines',
    pattern: 'lines_horizontal',
    density: 0.6,
    opacity: 0.7,
    rotation: 0,
    scale: 0.4,
    blendMode: 'overlay',
    contrast: 1.4,
    brightness: 0,
    description: '金属の質感表現',
    category: 'texture',
    preview: { backgroundColor: '#cccccc', showPattern: true }
  },
  {
    id: 'texture_wood',
    name: '木目テクスチャ',
    type: 'lines',
    pattern: 'lines_vertical',
    density: 0.4,
    opacity: 0.5,
    rotation: 5,
    scale: 1.2,
    blendMode: 'multiply',
    contrast: 1.1,
    brightness: 0.05,
    description: '木材の質感表現',
    category: 'texture',
    preview: { backgroundColor: '#f5f5dc', showPattern: true }
  },
  {
    id: 'texture_rough',
    name: '粗い表面',
    type: 'noise',
    pattern: 'noise_coarse',
    density: 0.5,
    opacity: 0.6,
    rotation: 0,
    scale: 0.8,
    blendMode: 'multiply',
    contrast: 1.2,
    brightness: -0.1,
    description: '岩や壁などの粗い表面',
    category: 'texture',
    preview: { backgroundColor: '#ffffff', showPattern: true }
  }
];

// ==========================================
// 背景用トーン (background)
// ==========================================
export const backgroundToneTemplates: ToneTemplate[] = [
  {
    id: 'bg_sky_gradient',
    name: '空のグラデーション',
    type: 'gradient',
    pattern: 'gradient_linear',
    density: 0.2,
    opacity: 0.3,
    rotation: 90,
    scale: 2.0,
    blendMode: 'multiply',
    contrast: 0.7,
    brightness: 0.2,
    description: '空の表現用グラデーション',
    category: 'background',
    preview: { backgroundColor: '#87ceeb', showPattern: true }
  },
  {
    id: 'bg_pattern_fine',
    name: '細かい背景パターン',
    type: 'dots',
    pattern: 'dots_150',
    density: 0.2,
    opacity: 0.3,
    rotation: 0,
    scale: 0.6,
    blendMode: 'multiply',
    contrast: 0.8,
    brightness: 0.1,
    description: '細かい背景パターン',
    category: 'background',
    preview: { backgroundColor: '#ffffff', showPattern: true }
  },
  {
    id: 'bg_mood_dark',
    name: 'ダーク背景',
    type: 'gradient',
    pattern: 'gradient_radial',
    density: 0.8,
    opacity: 0.6,
    rotation: 0,
    scale: 2.5,
    blendMode: 'multiply',
    contrast: 1.5,
    brightness: -0.4,
    description: 'ダークムード演出用',
    category: 'background',
    preview: { backgroundColor: '#ffffff', showPattern: true }
  }
];

// ==========================================
// 特殊効果用トーン (effect)
// ==========================================
export const effectToneTemplates: ToneTemplate[] = [
  {
    id: 'effect_speed',
    name: 'スピード効果',
    type: 'lines',
    pattern: 'speed_lines',
    density: 0.7,
    opacity: 0.8,
    rotation: 0,
    scale: 1.0,
    blendMode: 'multiply',
    contrast: 1.3,
    brightness: 0,
    description: 'スピード感の演出',
    category: 'effect',
    preview: { backgroundColor: '#ffffff', showPattern: true }
  },
  {
    id: 'effect_focus',
    name: '集中線効果',
    type: 'lines',
    pattern: 'focus_lines',
    density: 0.6,
    opacity: 0.7,
    rotation: 0,
    scale: 1.0,
    blendMode: 'multiply',
    contrast: 1.2,
    brightness: 0,
    description: '注目・驚きの演出',
    category: 'effect',
    preview: { backgroundColor: '#ffffff', showPattern: true }
  },
  {
    id: 'effect_explosion',
    name: '爆発効果',
    type: 'lines',
    pattern: 'explosion',
    density: 0.8,
    opacity: 0.9,
    rotation: 0,
    scale: 0.8,
    blendMode: 'multiply',
    contrast: 1.4,
    brightness: 0,
    description: '爆発・衝撃の演出',
    category: 'effect',
    preview: { backgroundColor: '#ffffff', showPattern: true }
  }
];

// ==========================================
// 雰囲気・ムード用トーン (mood)
// ==========================================
export const moodToneTemplates: ToneTemplate[] = [
  {
    id: 'mood_romantic',
    name: 'ロマンチック',
    type: 'dots',
    pattern: 'dots_100',
    density: 0.3,
    opacity: 0.4,
    rotation: 0,
    scale: 1.5,
    blendMode: 'soft-light',
    contrast: 0.6,
    brightness: 0.2,
    description: 'ロマンチックな雰囲気演出',
    category: 'mood',
    preview: { backgroundColor: '#ffb6c1', showPattern: true }
  },
  {
    id: 'mood_mysterious',
    name: 'ミステリアス',
    type: 'noise',
    pattern: 'noise_fine',
    density: 0.4,
    opacity: 0.6,
    rotation: 0,
    scale: 0.8,
    blendMode: 'overlay',
    contrast: 1.3,
    brightness: -0.2,
    description: '神秘的・不気味な雰囲気演出',
    category: 'mood',
    preview: { backgroundColor: '#4b0082', showPattern: true }
  },
  {
    id: 'mood_dreamy',
    name: 'ドリーミー',
    type: 'gradient',
    pattern: 'gradient_radial',
    density: 0.3,
    opacity: 0.5,
    rotation: 45,
    scale: 2.0,
    blendMode: 'soft-light',
    contrast: 0.7,
    brightness: 0.3,
    description: '夢のような雰囲気演出',
    category: 'mood',
    preview: { backgroundColor: '#e6e6fa', showPattern: true }
  }
];

// ==========================================
// 全トーンテンプレート統合
// ==========================================
export const allToneTemplates: ToneTemplate[] = [
  ...shadowToneTemplates,
  ...highlightToneTemplates,
  ...textureToneTemplates,
  ...backgroundToneTemplates,
  ...effectToneTemplates,
  ...moodToneTemplates,
];

// カテゴリ別トーンテンプレート
export const toneTemplatesByCategory = {
  shadow: shadowToneTemplates,
  highlight: highlightToneTemplates,
  texture: textureToneTemplates,
  background: backgroundToneTemplates,
  effect: effectToneTemplates,
  mood: moodToneTemplates,
};

/**
 * テンプレートからトーン要素を作成する関数
 */
export const createToneFromTemplate = (
  template: ToneTemplate,
  panelId: number,
  x: number = 0,
  y: number = 0,
  width: number = 1,
  height: number = 1
): ToneElement => {
  return {
    id: `tone_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId,
    type: template.type,
    pattern: template.pattern,
    x,
    y,
    width,
    height,
    density: template.density,
    opacity: template.opacity,
    rotation: template.rotation,
    scale: template.scale,
    blendMode: template.blendMode,
    contrast: template.contrast,
    brightness: template.brightness,
    invert: false,
    maskEnabled: false,
    maskShape: 'rectangle',
    maskFeather: 0,
    selected: false,
    zIndex: 0,
    isGlobalPosition: false,
    visible: true,
  };
};

/**
 * カテゴリ情報取得
 */
export const getToneCategoryInfo = () => ({
  shadow: { name: '影・陰影', icon: '🌑', description: '影や陰影の表現' },
  highlight: { name: 'ハイライト', icon: '✨', description: '光や反射の表現' },
  texture: { name: '質感', icon: '🧱', description: '材質や質感の表現' },
  background: { name: '背景', icon: '🌄', description: '背景の雰囲気作り' },
  effect: { name: '特殊効果', icon: '⚡', description: '動きや効果の演出' },
  mood: { name: '雰囲気', icon: '🎭', description: 'ムードや情感の演出' },
});

/**
 * デフォルトトーン設定
 */
export const getDefaultToneSettings = () => ({
  density: 0.5,
  opacity: 0.7,
  rotation: 0,
  scale: 1.0,
  blendMode: 'multiply' as BlendMode,
  contrast: 1.0,
  brightness: 0,
  invert: false,
  maskEnabled: false,
  maskShape: 'rectangle' as const,
  maskFeather: 0,
});