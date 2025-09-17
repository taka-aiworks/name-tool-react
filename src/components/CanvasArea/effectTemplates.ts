// src/components/CanvasArea/effectTemplates.ts - クリスタ実用版（5種類）
import { EffectTemplate } from '../../types';

export const effectTemplates: EffectTemplate[] = [
  // === 1. スピード線（最重要）===
  {
    id: 'speed_horizontal',
    name: 'スピード線',
    type: 'speed',
    direction: 'horizontal',
    intensity: 0.8,
    density: 0.6,
    length: 0.9,
    angle: 0,
    color: '#000000',
    opacity: 0.7,
    blur: 1,
    description: '動きの表現（最重要）',
    category: 'action'
  },

  // === 2. 集中線（最重要）===
  {
    id: 'focus_center',
    name: '集中線',
    type: 'focus',
    direction: 'radial',
    intensity: 0.9,
    density: 0.8,
    length: 0.8,
    angle: 0,
    color: '#000000',
    opacity: 0.6,
    blur: 0,
    description: '注目・驚きの表現（最重要）',
    category: 'emotion'
  },

  // === 3. 爆発線 ===
  {
    id: 'explosion_intense',
    name: '爆発線',
    type: 'explosion',
    direction: 'radial',
    intensity: 1.0,
    density: 0.9,
    length: 1.0,
    angle: 0,
    color: '#000000',
    opacity: 0.9,
    blur: 0,
    description: '衝撃・爆発シーン',
    category: 'action'
  },

  // === 4. フラッシュ線 ===
  {
    id: 'flash_bright',
    name: 'フラッシュ線',
    type: 'flash',
    direction: 'radial',
    intensity: 0.8,
    density: 0.3,
    length: 0.9,
    angle: 0,
    color: '#FFFFFF',
    opacity: 0.8,
    blur: 3,
    description: '強い光・閃光の表現',
    category: 'special'
  },

  // === 5. 背景効果線 ===
  {
    id: 'wind_horizontal',
    name: '背景効果線',
    type: 'speed',
    direction: 'horizontal',
    intensity: 0.4,
    density: 0.3,
    length: 0.6,
    angle: 15,
    color: '#666666',
    opacity: 0.5,
    blur: 2,
    description: '雰囲気・環境表現',
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

// 効果線テンプレートをEffectElementに変換
export const createEffectFromTemplate = (
  template: EffectTemplate,
  x: number,
  y: number,
  panelId: number = 1,
  width: number = 200,
  height: number = 200
): import('../../types').EffectElement => {
  return {
    id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    panelId,
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
    zIndex: 10,
    isGlobalPosition: false
  };
};