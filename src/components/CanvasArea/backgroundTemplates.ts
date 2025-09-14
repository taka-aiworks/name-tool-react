// src/components/CanvasArea/backgroundTemplates.ts - 修正版
import { BackgroundTemplate } from '../../types';

// 背景カテゴリ定義
export const backgroundCategories = [
  { id: 'nature', icon: '🌲', name: '自然' },
  { id: 'indoor', icon: '🏠', name: '室内' },
  { id: 'school', icon: '🏫', name: '学校' },
  { id: 'city', icon: '🏙️', name: '街' },
  { id: 'abstract', icon: '🎨', name: '抽象' },
  { id: 'emotion', icon: '💭', name: '感情' },
];

// 背景テンプレート定義
export const backgroundTemplates: BackgroundTemplate[] = [
  // 自然系
  {
    id: 'sky_blue',
    name: '青空',
    category: 'nature',
    elements: [{
      type: 'gradient',
      x: 0, y: 0, width: 1, height: 1,
      rotation: 0, zIndex: 0, opacity: 1,
      gradientType: 'linear',
      gradientColors: ['#87CEEB', '#E0F6FF'],
      gradientDirection: 180
    }]
  },
  {
    id: 'sunset',
    name: '夕焼け',
    category: 'nature',
    elements: [{
      type: 'gradient',
      x: 0, y: 0, width: 1, height: 1,
      rotation: 0, zIndex: 0, opacity: 1,
      gradientType: 'linear',
      gradientColors: ['#FF6B6B', '#FFE66D', '#FF8E53'],
      gradientDirection: 180
    }]
  },
  {
    id: 'forest',
    name: '森',
    category: 'nature',
    elements: [{
      type: 'gradient',
      x: 0, y: 0, width: 1, height: 1,
      rotation: 0, zIndex: 0, opacity: 1,
      gradientType: 'linear',
      gradientColors: ['#2D5016', '#228B22'],
      gradientDirection: 180
    }]
  },

  // 室内系
  {
    id: 'living_room',
    name: 'リビング',
    category: 'indoor',
    elements: [{
      type: 'solid',
      x: 0, y: 0, width: 1, height: 1,
      rotation: 0, zIndex: 0, opacity: 1,
      solidColor: '#F5F5DC'
    }]
  },
  {
    id: 'bedroom',
    name: '寝室',
    category: 'indoor',
    elements: [{
      type: 'gradient',
      x: 0, y: 0, width: 1, height: 1,
      rotation: 0, zIndex: 0, opacity: 1,
      gradientType: 'linear',
      gradientColors: ['#FFB6C1', '#FFF0F5'],
      gradientDirection: 180
    }]
  },
  {
    id: 'kitchen',
    name: 'キッチン',
    category: 'indoor',
    elements: [{
      type: 'solid',
      x: 0, y: 0, width: 1, height: 1,
      rotation: 0, zIndex: 0, opacity: 1,
      solidColor: '#FFFAF0'
    }]
  },

  // 学校系
  {
    id: 'classroom',
    name: '教室',
    category: 'school',
    elements: [{
      type: 'solid',
      x: 0, y: 0, width: 1, height: 1,
      rotation: 0, zIndex: 0, opacity: 1,
      solidColor: '#F0F8FF'
    }]
  },
  {
    id: 'hallway',
    name: '廊下',
    category: 'school',
    elements: [{
      type: 'gradient',
      x: 0, y: 0, width: 1, height: 1,
      rotation: 0, zIndex: 0, opacity: 1,
      gradientType: 'linear',
      gradientColors: ['#E6E6FA', '#F8F8FF'],
      gradientDirection: 90
    }]
  },
  {
    id: 'library',
    name: '図書館',
    category: 'school',
    elements: [{
      type: 'solid',
      x: 0, y: 0, width: 1, height: 1,
      rotation: 0, zIndex: 0, opacity: 1,
      solidColor: '#FDF5E6'
    }]
  },

  // 街系
  {
    id: 'street',
    name: '街並み',
    category: 'city',
    elements: [{
      type: 'gradient',
      x: 0, y: 0, width: 1, height: 1,
      rotation: 0, zIndex: 0, opacity: 1,
      gradientType: 'linear',
      gradientColors: ['#696969', '#D3D3D3'],
      gradientDirection: 180
    }]
  },
  {
    id: 'park',
    name: '公園',
    category: 'city',
    elements: [{
      type: 'gradient',
      x: 0, y: 0, width: 1, height: 1,
      rotation: 0, zIndex: 0, opacity: 1,
      gradientType: 'linear',
      gradientColors: ['#90EE90', '#F0FFF0'],
      gradientDirection: 180
    }]
  },

  // 抽象系
  {
    id: 'white',
    name: '白背景',
    category: 'abstract',
    elements: [{
      type: 'solid',
      x: 0, y: 0, width: 1, height: 1,
      rotation: 0, zIndex: 0, opacity: 1,
      solidColor: '#FFFFFF'
    }]
  },
  {
    id: 'black',
    name: '黒背景',
    category: 'abstract',
    elements: [{
      type: 'solid',
      x: 0, y: 0, width: 1, height: 1,
      rotation: 0, zIndex: 0, opacity: 1,
      solidColor: '#000000'
    }]
  },

  // 感情系
  {
    id: 'happy',
    name: '明るい',
    category: 'emotion',
    elements: [{
      type: 'gradient',
      x: 0, y: 0, width: 1, height: 1,
      rotation: 0, zIndex: 0, opacity: 1,
      gradientType: 'radial',
      gradientColors: ['#FFD700', '#FFF8DC'],
      gradientDirection: 0
    }]
  },
  {
    id: 'sad',
    name: '暗い',
    category: 'emotion',
    elements: [{
      type: 'gradient',
      x: 0, y: 0, width: 1, height: 1,
      rotation: 0, zIndex: 0, opacity: 1,
      gradientType: 'linear',
      gradientColors: ['#2F4F4F', '#708090'],
      gradientDirection: 180
    }]
  }
];

// カテゴリ別の背景取得
export const getBackgroundsByCategory = (category: string): BackgroundTemplate[] => {
  return backgroundTemplates.filter(template => template.category === category);
};

// テンプレートプレビュー色を取得
export const getTemplatePreviewColor = (template: BackgroundTemplate): string => {
  const firstElement = template.elements[0];
  if (!firstElement) return '#CCCCCC';
  
  if (firstElement.type === 'solid') {
    return firstElement.solidColor || '#CCCCCC';
  } else if (firstElement.type === 'gradient') {
    return firstElement.gradientColors?.[0] || '#CCCCCC';
  }
  return '#CCCCCC';
};

// 背景タイプのアイコン
export const getBackgroundTypeIcon = (type: string): string => {
  switch (type) {
    case 'solid': return '🎨';
    case 'gradient': return '🌈';
    case 'pattern': return '🔳';
    case 'image': return '🖼️';
    default: return '❓';
  }
};

// 背景タイプの名前
export const getBackgroundTypeName = (type: string): string => {
  switch (type) {
    case 'solid': return '単色';
    case 'gradient': return 'グラデーション';
    case 'pattern': return 'パターン';
    case 'image': return '画像';
    default: return '不明';
  }
};