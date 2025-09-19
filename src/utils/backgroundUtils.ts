// src/utils/backgroundUtils.ts - 背景名統合管理ユーティリティ
import { BackgroundElement } from '../types';

/**
 * パネル内の背景要素から統合された背景名を推測する共通関数
 */
export const getIntegratedBackgroundName = (backgrounds: BackgroundElement[], panelId: number): string => {
  const panelBackgrounds = backgrounds.filter(bg => bg.panelId === panelId);
  if (panelBackgrounds.length === 0) return '';

  // 特徴的なパターンから背景を判定
  const hasGradientBlue = panelBackgrounds.some(bg => 
    bg.type === 'gradient' && 
    bg.gradientColors?.includes('#87CEEB')
  );
  
  const hasBlackboard = panelBackgrounds.some(bg => 
    bg.type === 'solid' && 
    bg.solidColor === '#2F4F2F'
  );
  
  const hasForestPattern = panelBackgrounds.some(bg => 
    bg.type === 'pattern' && 
    bg.patternColor === '#2D5016'
  );

  const hasSunsetGradient = panelBackgrounds.some(bg => 
    bg.type === 'gradient' && 
    bg.gradientColors?.includes('#FF6B6B')
  );

  const hasLivingRoomColor = panelBackgrounds.some(bg => 
    bg.type === 'solid' && 
    bg.solidColor === '#F5F5DC'
  );

  const hasBedroomGradient = panelBackgrounds.some(bg => 
    bg.type === 'gradient' && 
    bg.gradientColors?.includes('#FFB6C1')
  );

  const hasKitchenColor = panelBackgrounds.some(bg => 
    bg.type === 'solid' && 
    bg.solidColor === '#FFFAF0'
  );

  const hasClassroomColor = panelBackgrounds.some(bg => 
    bg.type === 'solid' && 
    bg.solidColor === '#F0F8FF'
  );

  const hasHallwayGradient = panelBackgrounds.some(bg => 
    bg.type === 'gradient' && 
    bg.gradientColors?.includes('#E6E6FA')
  );

  const hasLibraryColor = panelBackgrounds.some(bg => 
    bg.type === 'solid' && 
    bg.solidColor === '#FDF5E6'
  );

  const hasStreetGradient = panelBackgrounds.some(bg => 
    bg.type === 'gradient' && 
    bg.gradientColors?.includes('#87CEEB') && 
    panelBackgrounds.some(bg2 => bg2.solidColor === '#696969')
  );

  const hasParkGreen = panelBackgrounds.some(bg => 
    bg.type === 'solid' && 
    bg.solidColor === '#90EE90'
  );

  const hasHappyRadial = panelBackgrounds.some(bg => 
    bg.type === 'gradient' && 
    bg.gradientType === 'radial' &&
    bg.gradientColors?.includes('#FFD700')
  );

  const hasSadGradient = panelBackgrounds.some(bg => 
    bg.type === 'gradient' && 
    bg.gradientColors?.includes('#2F4F4F')
  );

  // 判定ロジック
  if (hasGradientBlue && panelBackgrounds.some(bg => bg.type === 'pattern')) return '青空';
  if (hasSunsetGradient) return '夕焼け';
  if (hasForestPattern) return '森';
  if (hasBlackboard) return '教室';
  if (hasLivingRoomColor && panelBackgrounds.length > 1) return 'リビング';
  if (hasBedroomGradient) return '寝室';
  if (hasKitchenColor && panelBackgrounds.some(bg => bg.type === 'pattern')) return 'キッチン';
  if (hasClassroomColor && hasBlackboard) return '教室';
  if (hasHallwayGradient) return '廊下';
  if (hasLibraryColor && panelBackgrounds.some(bg => bg.type === 'pattern')) return '図書館';
  if (hasStreetGradient) return '街並み';
  if (hasParkGreen) return '公園';
  if (hasHappyRadial) return '明るい';
  if (hasSadGradient) return '暗い';

  // 単色背景
  const firstBg = panelBackgrounds[0];
  if (panelBackgrounds.length === 1 && firstBg.type === 'solid') {
    if (firstBg.solidColor === '#FFFFFF') return '白背景';
    if (firstBg.solidColor === '#000000') return '黒背景';
  }

  // デフォルト
  return 'カスタム背景';
};

/**
 * 背景要素が同じ統合背景グループに属するかチェック
 */
export const isSameBackgroundGroup = (
  bg1: BackgroundElement, 
  bg2: BackgroundElement,
  backgrounds: BackgroundElement[]
): boolean => {
  // 同じパネル内で、同じタイムスタンプで作成された背景要素
  if (bg1.panelId !== bg2.panelId) return false;
  
  const timestamp1 = bg1.id.split('_')[1];
  const timestamp2 = bg2.id.split('_')[1];
  
  return timestamp1 === timestamp2;
};

/**
 * 背景要素のメイン要素（最初に作成された要素）を取得
 */
export const getMainBackgroundElement = (
  panelBackgrounds: BackgroundElement[]
): BackgroundElement | null => {
  if (panelBackgrounds.length === 0) return null;
  
  // IDからタイムスタンプとインデックスを抽出してソート
  const sorted = panelBackgrounds.sort((a, b) => {
    const aTimestamp = parseInt(a.id.split('_')[1]);
    const bTimestamp = parseInt(b.id.split('_')[1]);
    const aIndex = parseInt(a.id.split('_')[2]);
    const bIndex = parseInt(b.id.split('_')[2]);
    
    if (aTimestamp !== bTimestamp) {
      return aTimestamp - bTimestamp;
    }
    return aIndex - bIndex;
  });
  
  return sorted[0];
};

/**
 * キャンバス上での背景表示名を取得（統合名優先）
 */
export const getCanvasBackgroundDisplayName = (
  backgroundElement: BackgroundElement,
  allBackgrounds: BackgroundElement[]
): string => {
  const integratedName = getIntegratedBackgroundName(allBackgrounds, backgroundElement.panelId);
  
  if (integratedName && integratedName !== 'カスタム背景') {
    return integratedName;
  }
  
  // フォールバック: 従来の個別名
  switch (backgroundElement.type) {
    case 'solid': return '単色';
    case 'gradient': return 'グラデーション';
    case 'pattern': return 'パターン';
    case 'image': return '画像';
    default: return '背景';
  }
};

/**
 * 背景要素のプレビューカラーを取得
 */
export const getBackgroundPreviewColor = (backgroundElement: BackgroundElement): string => {
  if (backgroundElement.type === 'solid') {
    return backgroundElement.solidColor || '#CCCCCC';
  } else if (backgroundElement.type === 'gradient') {
    return backgroundElement.gradientColors?.[0] || '#CCCCCC';
  } else if (backgroundElement.type === 'pattern') {
    return backgroundElement.patternColor || '#CCCCCC';
  }
  return '#CCCCCC';
};