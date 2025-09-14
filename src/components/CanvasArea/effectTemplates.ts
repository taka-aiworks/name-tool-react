// src/components/CanvasArea/effectTemplates.ts - エラー修正版
import { EffectTemplate } from '../../types';

export const effectTemplates: EffectTemplate[] = [
  // === アクション系効果線 ===
  {
    id: 'speed_horizontal',
    name: '水平スピード線',
    type: 'speed',
    direction: 'horizontal',
    intensity: 0.8,
    density: 0.6,
    length: 0.9,
    angle: 0,
    color: '#000000',
    opacity: 0.7,
    blur: 1,
    description: '横方向の動きを表現',
    category: 'action'
  },
  {
    id: 'speed_vertical',
    name: '縦スピード線',
    type: 'speed',
    direction: 'vertical',
    intensity: 0.8,
    density: 0.6,
    length: 0.9,
    angle: 90,
    color: '#000000',
    opacity: 0.7,
    blur: 1,
    description: '縦方向の動きを表現',
    category: 'action'
  },
  {
    id: 'speed_diagonal',
    name: '斜めスピード線',
    type: 'speed',
    direction: 'custom',
    intensity: 0.8,
    density: 0.6,
    length: 0.9,
    angle: 45,
    color: '#000000',
    opacity: 0.7,
    blur: 1,
    description: '斜め方向の動きを表現',
    category: 'action'
  },

  // === 集中線 ===
  {
    id: 'focus_center',
    name: '中央集中線',
    type: 'focus',
    direction: 'radial',
    intensity: 0.9,
    density: 0.8,
    length: 0.8,
    angle: 0,
    color: '#000000',
    opacity: 0.6,
    blur: 0,
    description: '中央への注目を表現',
    category: 'emotion'
  },
  {
    id: 'focus_intense',
    name: '強烈集中線',
    type: 'focus',
    direction: 'radial',
    intensity: 1.0,
    density: 1.0,
    length: 1.0,
    angle: 0,
    color: '#000000',
    opacity: 0.8,
    blur: 0,
    description: '強い驚きや衝撃を表現',
    category: 'emotion'
  },
  {
    id: 'focus_soft',
    name: 'ソフト集中線',
    type: 'focus',
    direction: 'radial',
    intensity: 0.5,
    density: 0.4,
    length: 0.6,
    angle: 0,
    color: '#333333',
    opacity: 0.4,
    blur: 2,
    description: '穏やかな注目を表現',
    category: 'emotion'
  },

  // === 爆発線 ===
  {
    id: 'explosion_intense',
    name: '強烈爆発線',
    type: 'explosion',
    direction: 'radial',
    intensity: 1.0,
    density: 0.9,
    length: 1.0,
    angle: 0,
    color: '#000000',
    opacity: 0.9,
    blur: 0,
    description: '激しい爆発や衝撃を表現',
    category: 'action'
  },
  {
    id: 'explosion_medium',
    name: '中程度爆発線',
    type: 'explosion',
    direction: 'radial',
    intensity: 0.7,
    density: 0.6,
    length: 0.8,
    angle: 0,
    color: '#111111',
    opacity: 0.7,
    blur: 1,
    description: '中程度の衝撃を表現',
    category: 'action'
  },

  // === フラッシュ線 ===
  {
    id: 'flash_bright',
    name: '明るいフラッシュ',
    type: 'flash',
    direction: 'radial',
    intensity: 0.8,
    density: 0.3,
    length: 0.9,
    angle: 0,
    color: '#FFFFFF',
    opacity: 0.8,
    blur: 3,
    description: '強い光や閃光を表現',
    category: 'special'
  },
  {
    id: 'flash_soft',
    name: 'ソフトフラッシュ',
    type: 'flash',
    direction: 'radial',
    intensity: 0.5,
    density: 0.2,
    length: 0.7,
    angle: 0,
    color: '#F0F0F0',
    opacity: 0.6,
    blur: 4,
    description: '穏やかな光を表現',
    category: 'special'
  },

  // === 環境系効果線 ===
  {
    id: 'wind_horizontal',
    name: '風の線（横）',
    type: 'speed',
    direction: 'horizontal',
    intensity: 0.4,
    density: 0.3,
    length: 0.6,
    angle: 15,
    color: '#666666',
    opacity: 0.5,
    blur: 2,
    description: '風の流れを表現',
    category: 'environment'
  },
  {
    id: 'rain_lines',
    name: '雨の線',
    type: 'speed',
    direction: 'custom',
    intensity: 0.6,
    density: 0.8,
    length: 0.4,
    angle: 75,
    color: '#4A90E2',
    opacity: 0.6,
    blur: 1,
    description: '雨の表現',
    category: 'environment'
  }
];

// カテゴリ別効果線テンプレート取得
export const getEffectTemplatesByCategory = (category: EffectTemplate['category']): EffectTemplate[] => {
  return effectTemplates.filter(template => template.category === category);
};

// 効果線タイプ別テンプレート取得
export const getEffectTemplatesByType = (type: EffectTemplate['type']): EffectTemplate[] => {
  return effectTemplates.filter(template => template.type === type);
};

// 効果線テンプレートをEffectElementに変換（修正版）
export const createEffectFromTemplate = (
  template: EffectTemplate,
  x: number,
  y: number,
  panelId: number = 1, // 🔧 panelIdを必須パラメータに
  width: number = 200,
  height: number = 200
): import('../../types').EffectElement => {
  return {
    id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    panelId, // 🔧 panelIdを設定
    type: template.type,
    x,
    y,
    width,
    height,
    direction: template.direction,
    intensity: template.intensity,
    density: template.density,
    length: template.length,
    angle: template.angle,
    color: template.color,
    opacity: template.opacity,
    blur: template.blur,
    centerX: template.direction === 'radial' ? x + width / 2 : undefined,
    centerY: template.direction === 'radial' ? y + height / 2 : undefined,
    selected: false,
    zIndex: 10, // 🔧 zIndexを設定
    isGlobalPosition: false // 🔧 isGlobalPositionを設定
  };
};