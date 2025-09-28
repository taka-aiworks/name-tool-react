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
  
  console.group('📐 Ratio Template Applied');
  console.log('Template:', templateKey);
  console.log('Canvas size:', { width: pixelWidth, height: pixelHeight });
  
  // 比率を実際のピクセル座標に変換
  const scaledPanels = template.panels.map(panel => {
    const scaledPanel = {
      ...panel,
      x: Math.round(panel.x * pixelWidth),
      y: Math.round(panel.y * pixelHeight),
      width: Math.round(panel.width * pixelWidth),
      height: Math.round(panel.height * pixelHeight)
    };
    
    console.log(`Panel ${panel.id}:`, {
      ratio: { x: panel.x, y: panel.y, width: panel.width, height: panel.height },
      pixels: { x: scaledPanel.x, y: scaledPanel.y, width: scaledPanel.width, height: scaledPanel.height }
    });
    
    return scaledPanel;
  });
  
  console.log(`✅ Applied ${scaledPanels.length} panels for ratio template "${templateKey}"`);
  console.groupEnd();
  
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
