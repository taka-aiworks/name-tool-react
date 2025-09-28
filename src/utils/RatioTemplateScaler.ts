// src/utils/RatioTemplateScaler.ts - 比率ベーステンプレートスケーラー
import { Panel, CanvasSettings } from '../types';
import { ratioTemplates } from '../components/CanvasArea/ratioTemplates';

/**
 * 比率ベースのテンプレートを現在のキャンバスサイズに適用
 */
export const applyRatioTemplate = (
  templateKey: string, 
  canvasSettings: CanvasSettings
): Panel[] => {
  const template = ratioTemplates[templateKey];
  if (!template) {
    console.error(`Ratio template "${templateKey}" not found`);
    return [];
  }

  const { pixelWidth, pixelHeight } = canvasSettings.paperSize;
  
  // コンソールログは無効化
  
  // 比率を実際のピクセル座標に変換
  const scaledPanels = template.panels.map(panel => {
    const scaledPanel = {
      ...panel,
      x: Math.round(panel.x * pixelWidth),
      y: Math.round(panel.y * pixelHeight),
      width: Math.round(panel.width * pixelWidth),
      height: Math.round(panel.height * pixelHeight)
    };
    
    // コンソールログは無効化
    
    return scaledPanel;
  });
  
  // コンソールログは無効化
  // コンソールログは無効化
  
  return scaledPanels;
};

/**
 * テンプレート情報を取得
 */
export const getRatioTemplateInfo = (templateKey: string) => {
  const template = ratioTemplates[templateKey];
  if (!template) return null;
  
  return {
    key: templateKey,
    panelCount: template.panels.length,
    isRatioBased: true
  };
};

/**
 * 利用可能な比率テンプレート一覧を取得
 */
export const getAvailableRatioTemplates = () => {
  return Object.keys(ratioTemplates);
};
