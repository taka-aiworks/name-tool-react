// src/components/CanvasArea/toneTemplates.ts - クリスタ実用版（8種類）
import { ToneTemplate, ToneElement, BlendMode } from '../../types';

// ==========================================
// 実用的なトーンテンプレート（8種類）
// ==========================================

// === 1. ドット60線（肌の影・最重要）===
export const tone_dot_60: ToneTemplate = {
  id: 'shadow_soft_60',
  name: 'ドット60線（肌の影）',
  type: 'halftone',
  pattern: 'dots_60',
  density: 0.4,
  opacity: 0.8,
  rotation: 45,
  scale: 1.0,
  blendMode: 'multiply',
  contrast: 1.1,
  brightness: 0,
  description: '肌の影表現（最重要）',
  category: 'shadow',
  preview: { backgroundColor: '#ffffff', showPattern: true }
};

// === 2. ドット80線（服の影）===
export const tone_dot_80: ToneTemplate = {
  id: 'shadow_medium_80',
  name: 'ドット80線（服の影）',
  type: 'halftone',
  pattern: 'dots_85',
  density: 0.5,
  opacity: 0.9,
  rotation: 45,
  scale: 1.0,
  blendMode: 'multiply',
  contrast: 1.2,
  brightness: -0.1,
  description: '服の影表現',
  category: 'shadow',
  preview: { backgroundColor: '#ffffff', showPattern: true }
};

// === 3. ドット100線（濃い影）===
export const tone_dot_100: ToneTemplate = {
  id: 'shadow_dark_100',
  name: 'ドット100線（濃い影）',
  type: 'halftone',
  pattern: 'dots_120',
  density: 0.7,
  opacity: 1.0,
  rotation: 45,
  scale: 1.0,
  blendMode: 'multiply',
  contrast: 1.3,
  brightness: -0.2,
  description: '濃い影表現',
  category: 'shadow',
  preview: { backgroundColor: '#ffffff', showPattern: true }
};

// === 4. 斜線トーン（髪の影）===
export const tone_line_diagonal: ToneTemplate = {
  id: 'shadow_diagonal_lines',
  name: '斜線トーン（髪の影）',
  type: 'lines',
  pattern: 'lines_cross',
  density: 0.6,
  opacity: 0.8,
  rotation: 0,
  scale: 0.8,
  blendMode: 'multiply',
  contrast: 1.0,
  brightness: 0,
  description: '髪の影表現',
  category: 'shadow',
  preview: { backgroundColor: '#ffffff', showPattern: true }
};

// === 5. グラデーション（空・背景）===
export const tone_gradient: ToneTemplate = {
  id: 'bg_sky_gradient',
  name: 'グラデーション（空・背景）',
  type: 'gradient',
  pattern: 'gradient_linear',
  density: 0.2,
  opacity: 0.3,
  rotation: 90,
  scale: 2.0,
  blendMode: 'multiply',
  contrast: 0.7,
  brightness: 0.2,
  description: '空・背景表現',
  category: 'background',
  preview: { backgroundColor: '#87ceeb', showPattern: true }
};

// === 6. ノイズトーン（質感）===
export const tone_noise: ToneTemplate = {
  id: 'texture_rough',
  name: 'ノイズトーン（質感）',
  type: 'noise',
  pattern: 'noise_coarse',
  density: 0.5,
  opacity: 0.6,
  rotation: 0,
  scale: 0.8,
  blendMode: 'multiply',
  contrast: 1.2,
  brightness: -0.1,
  description: '質感表現',
  category: 'texture',
  preview: { backgroundColor: '#ffffff', showPattern: true }
};

// === 7. ハイライト（光表現）===
export const tone_highlight: ToneTemplate = {
  id: 'highlight_soft',
  name: 'ハイライト（光表現）',
  type: 'gradient',
  pattern: 'gradient_radial',
  density: 0.3,
  opacity: 0.6,
  rotation: 0,
  scale: 1.2,
  blendMode: 'screen',
  contrast: 0.8,
  brightness: 0.3,
  description: '光・反射表現',
  category: 'highlight',
  preview: { backgroundColor: '#666666', showPattern: true }
};

// === 8. 効果線トーン（スピード）===
export const tone_speed_effect: ToneTemplate = {
  id: 'effect_speed',
  name: '効果線トーン（スピード）',
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
};

// ==========================================
// 全トーンテンプレート統合（8種類のみ）
// ==========================================
export const allToneTemplates: ToneTemplate[] = [
  tone_dot_60,
  tone_dot_80, 
  tone_dot_100,
  tone_line_diagonal,
  tone_gradient,
  tone_noise,
  tone_highlight,
  tone_speed_effect
];

// 影・陰影用（4種類）
export const shadowToneTemplates: ToneTemplate[] = [
  tone_dot_60,
  tone_dot_80,
  tone_dot_100,
  tone_line_diagonal
];

// 背景用（1種類）
export const backgroundToneTemplates: ToneTemplate[] = [
  tone_gradient
];

// 質感用（1種類）
export const textureToneTemplates: ToneTemplate[] = [
  tone_noise
];

// ハイライト用（1種類）
export const highlightToneTemplates: ToneTemplate[] = [
  tone_highlight
];

// 効果用（1種類）
export const effectToneTemplates: ToneTemplate[] = [
  tone_speed_effect
];

// カテゴリ別トーンテンプレート
export const toneTemplatesByCategory = {
  shadow: shadowToneTemplates,
  background: backgroundToneTemplates,
  texture: textureToneTemplates,
  highlight: highlightToneTemplates,
  effect: effectToneTemplates,
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
 * カテゴリ情報取得（実用5カテゴリ）
 */
export const getToneCategoryInfo = () => ({
  shadow: { name: '影・陰影', icon: '🌑', description: '影や陰影の表現' },
  background: { name: '背景', icon: '🌄', description: '背景の雰囲気作り' },
  texture: { name: '質感', icon: '🧱', description: '材質や質感の表現' },
  highlight: { name: 'ハイライト', icon: '✨', description: '光や反射の表現' },
  effect: { name: '特殊効果', icon: '⚡', description: '動きや効果の演出' },
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