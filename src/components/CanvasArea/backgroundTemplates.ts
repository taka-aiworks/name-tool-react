// src/components/CanvasArea/backgroundTemplates.ts
import { BackgroundTemplate } from '../../types';

export const backgroundTemplates: Record<string, BackgroundTemplate> = {
  // 自然系背景
  sky: {
    id: 'sky',
    name: '青空',
    category: 'nature',
    elements: [{
      type: 'gradient',
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      rotation: 0,
      zIndex: 1,
      opacity: 1.0,
      gradientType: 'linear',
      gradientColors: ['#87CEEB', '#87CEFA', '#B0E0E6'],
      gradientDirection: 0
    }]
  },
  
  sunset: {
    id: 'sunset',
    name: '夕焼け空',
    category: 'nature',
    elements: [{
      type: 'gradient',
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      rotation: 0,
      zIndex: 1,
      opacity: 1.0,
      gradientType: 'linear',
      gradientColors: ['#FF6B35', '#F7931E', '#FFD23F'],
      gradientDirection: 0
    }]
  },
  
  forest: {
    id: 'forest',
    name: '森',
    category: 'nature',
    elements: [
      {
        type: 'solid',
        x: 0,
        y: 0.6,
        width: 1,
        height: 0.4,
        rotation: 0,
        zIndex: 1,
        opacity: 1.0,
        solidColor: '#228B22'
      },
      {
        type: 'gradient',
        x: 0,
        y: 0,
        width: 1,
        height: 0.6,
        rotation: 0,
        zIndex: 0,
        opacity: 1.0,
        gradientType: 'linear',
        gradientColors: ['#87CEEB', '#98FB98'],
        gradientDirection: 0
      }
    ]
  }
};

// カテゴリ別の背景テンプレート取得
export const getBackgroundsByCategory = (category: BackgroundTemplate['category']): BackgroundTemplate[] => {
  return Object.values(backgroundTemplates).filter(bg => bg.category === category);
};

// 全カテゴリリスト
export const backgroundCategories = [
  { id: 'nature', name: '自然', icon: '🌲' },
  { id: 'indoor', name: '室内', icon: '🏠' },
  { id: 'school', name: '学校', icon: '🎓' },
  { id: 'city', name: '都市', icon: '🏙️' },
  { id: 'abstract', name: '抽象', icon: '🎨' },
  { id: 'emotion', name: '感情', icon: '💭' }
] as const;

// 背景テンプレートのプレビュー色を取得
export const getTemplatePreviewColor = (template: BackgroundTemplate): string => {
  const firstElement = template.elements[0];
  if (!firstElement) return '#CCCCCC';
  
  switch (firstElement.type) {
    case 'solid':
      return firstElement.solidColor || '#CCCCCC';
    case 'gradient':
      return firstElement.gradientColors?.[0] || '#CCCCCC';
    case 'pattern':
      return firstElement.patternColor || '#000000';
    default:
      return '#CCCCCC';
  }
};

// 背景タイプのアイコンを取得
export const getBackgroundTypeIcon = (type: string): string => {
  switch (type) {
    case 'solid': return '🎨';
    case 'gradient': return '🌈';
    case 'pattern': return '📐';
    case 'image': return '🖼️';
    default: return '❓';
  }
};

// 背景タイプの名前を取得
export const getBackgroundTypeName = (type: string): string => {
  switch (type) {
    case 'solid': return '単色';
    case 'gradient': return 'グラデーション';
    case 'pattern': return 'パターン';
    case 'image': return '画像';
    default: return '不明';
  }
};