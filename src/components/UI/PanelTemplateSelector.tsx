// src/components/UI/PanelTemplateSelector.tsx - v1.1.5 シンプル修正版
import React, { useState } from 'react';
import { templates, templateDescriptions, templateCategories, popularTemplates } from '../CanvasArea/templates';

interface PanelTemplateSelectorProps {
  onTemplateSelect: (templateId: string) => void;
  onClose?: () => void;
  isDarkMode: boolean;
  isVisible: boolean;
}

export const PanelTemplateSelector: React.FC<PanelTemplateSelectorProps> = ({
  onTemplateSelect,
  onClose,
  isDarkMode,
  isVisible
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('人気');

  if (!isVisible) return null;

  const categories = ['人気', ...Object.keys(templateCategories)];

  const getCurrentTemplates = (): string[] => {
    if (activeCategory === '人気') {
      return popularTemplates;
    }
    return templateCategories[activeCategory] || [];
  };

  // 🔧 修正: プレビューSVG生成の見切れ問題を解決
  const generatePreview = (templateId: string): string => {
    const template = templates[templateId];
    if (!template || !template.panels) return '<svg viewBox="0 0 100 120"></svg>';

    const strokeColor = isDarkMode ? '#6b7280' : '#d1d5db';
    const textColor = isDarkMode ? '#9ca3af' : '#6b7280';
    const fillColor = isDarkMode ? '#1f2937' : '#f9fafb';
    
    // 🔧 解決策: 全パネルの範囲を正確に計算
    const allX = template.panels.map(p => [p.x, p.x + p.width]).flat();
    const allY = template.panels.map(p => [p.y, p.y + p.height]).flat();
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);
    
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    
    // 🔧 適切なマージンとビューポート
    const margin = 5;
    const viewWidth = 100;
    const viewHeight = 120;
    const availableWidth = viewWidth - (margin * 2);
    const availableHeight = viewHeight - (margin * 2);
    
    // 🔧 アスペクト比を維持したスケール計算
    const scaleX = availableWidth / contentWidth;
    const scaleY = availableHeight / contentHeight;
    const scale = Math.min(scaleX, scaleY);
    
    // 🔧 中央配置のためのオフセット
    const scaledWidth = contentWidth * scale;
    const scaledHeight = contentHeight * scale;
    const offsetX = (viewWidth - scaledWidth) / 2 - (minX * scale);
    const offsetY = (viewHeight - scaledHeight) / 2 - (minY * scale);
    
    const panels = template.panels.map(panel => {
      const x = panel.x * scale + offsetX;
      const y = panel.y * scale + offsetY;
      const width = panel.width * scale;
      const height = panel.height * scale;
      
      const fontSize = Math.min(width, height) * 0.12;
      const textX = x + width / 2;
      const textY = y + height / 2;
      
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" 
               width="${width.toFixed(1)}" height="${height.toFixed(1)}" 
               fill="${fillColor}" stroke="${strokeColor}" stroke-width="1"/>
               <text x="${textX.toFixed(1)}" y="${textY.toFixed(1)}" 
               text-anchor="middle" dominant-baseline="middle" 
               fill="${textColor}" font-size="${fontSize.toFixed(1)}" 
               font-family="sans-serif" font-weight="500">${panel.id}</text>`;
    }).join('');

    return `<svg viewBox="0 0 ${viewWidth} ${viewHeight}" width="100%" height="100%">${panels}</svg>`;
  };

  const getTabStyle = (category: string) => ({
    padding: '8px 16px',
    margin: '0 4px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: activeCategory === category ? '600' : '400',
    backgroundColor: activeCategory === category 
      ? (isDarkMode ? '#3b82f6' : '#3b82f6')
      : 'transparent',
    color: activeCategory === category 
      ? '#ffffff'
      : (isDarkMode ? '#d1d5db' : '#374151'),
    border: `1px solid ${activeCategory === category ? '#3b82f6' : (isDarkMode ? '#374151' : '#d1d5db')}`,
    transition: 'all 0.2s ease'
  });

  // 🔧 修正: カードサイズを少し拡大して見切れを防止
  const getCardStyle = (templateId: string) => ({
    width: '130px',   // 120px → 130px
    height: '110px',  // 100px → 110px
    margin: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    border: `2px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    boxShadow: isDarkMode ? '0 2px 4px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  });

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '850px',    // 800px → 850px
      maxHeight: '650px', // 600px → 650px
      backgroundColor: isDarkMode ? '#111827' : '#ffffff',
      border: `1px solid ${isDarkMode ? '#374151' : '#d1d5db'}`,
      borderRadius: '12px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      {/* ヘッダー */}
      <div style={{
        padding: '20px 24px 16px',
        borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
        backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb'
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: isDarkMode ? '#f9fafb' : '#111827'
        }}>
          📐 コマ割りテンプレート選択
        </h3>
        
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px'
        }}>
          {categories.map(category => (
            <div
              key={category}
              style={getTabStyle(category)}
              onClick={() => setActiveCategory(category)}
            >
              {category}
              {category === '人気' && ' ⭐'}
              {category !== '人気' && ` (${templateCategories[category]?.length || 0})`}
            </div>
          ))}
        </div>
      </div>

      {/* テンプレート一覧 */}
      <div style={{
        padding: '20px',
        maxHeight: '450px',  // 400px → 450px
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', // 120px → 130px
          gap: '16px',
          justifyContent: 'center'
        }}>
          {getCurrentTemplates().map(templateId => (
            <div
              key={templateId}
              style={getCardStyle(templateId)}
              onClick={() => onTemplateSelect(templateId)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = isDarkMode 
                  ? '0 4px 8px rgba(0, 0, 0, 0.4)' 
                  : '0 4px 8px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = isDarkMode 
                  ? '0 2px 4px rgba(0, 0, 0, 0.3)' 
                  : '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
            >
              {/* 🔧 修正: プレビューエリアを拡大 */}
              <div style={{
                height: '70px',    // 60px → 70px
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div 
                  style={{ width: '100%', height: '100%' }}
                  dangerouslySetInnerHTML={{ __html: generatePreview(templateId) }}
                />
              </div>
              
              <div style={{
                padding: '8px',
                borderTop: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: isDarkMode ? '#f9fafb' : '#111827',
                  marginBottom: '2px'
                }}>
                  {templateDescriptions[templateId]?.split(' - ')[0] || templateId}
                </div>
                <div style={{
                  fontSize: '10px',
                  color: isDarkMode ? '#9ca3af' : '#6b7280'
                }}>
                  {templates[templateId]?.panels.length}コマ
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* フッター */}
      <div style={{
        padding: '12px 24px',
        borderTop: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
        backgroundColor: isDarkMode ? '#111827' : '#ffffff',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '12px',
          color: isDarkMode ? '#6b7280' : '#9ca3af'
        }}>
          💡 テンプレートをクリックして適用 • 全{Object.keys(templates).length}種類のコマ割りパターン
        </div>
      </div>

      {/* 閉じるボタン */}
      <button
        onClick={() => {
          setActiveCategory('人気');
          if (onClose) {
            onClose();
          } else {
            onTemplateSelect('');
          }
        }}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
          color: isDarkMode ? '#d1d5db' : '#6b7280',
          cursor: 'pointer',
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="閉じる"
      >
        ×
      </button>
    </div>
  );
};

export default PanelTemplateSelector;