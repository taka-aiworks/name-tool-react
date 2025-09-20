// src/components/UI/PanelTemplateSelector.tsx - エラー修正完全版
import React, { useState } from 'react';
import { templates, templateDescriptions, templateCategories, popularTemplates } from '../CanvasArea/templates';

interface PanelTemplateSelectorProps {
  onTemplateSelect: (templateId: string) => void;
  onClose?: () => void; // 🆕 閉じる専用のコールバック追加
  isDarkMode: boolean;
  isVisible: boolean;
}

export const PanelTemplateSelector: React.FC<PanelTemplateSelectorProps> = ({
  onTemplateSelect,
  onClose,
  isDarkMode,
  isVisible
}) => {
  // ✅ フックを必ず最初に呼ぶ
  const [activeCategory, setActiveCategory] = useState<string>('人気');

  // ✅ 条件分岐はフックの後
  if (!isVisible) return null;

  // カテゴリ一覧（人気を最初に追加）
  const categories = ['人気', ...Object.keys(templateCategories)];

  // 現在選択されているカテゴリのテンプレート取得
  const getCurrentTemplates = (): string[] => {
    if (activeCategory === '人気') {
      return popularTemplates;
    }
    return templateCategories[activeCategory] || [];
  };

  // テンプレートプレビューSVG生成（最適化版）
  const generatePreview = (templateId: string): string => {
    const template = templates[templateId];
    if (!template || !template.panels) return '<svg viewBox="0 0 60 75"></svg>';

    // 簡単なキャッシュ（再描画を減らす）
    const cacheKey = `${templateId}-${isDarkMode}`;
    if ((window as any).svgCache && (window as any).svgCache[cacheKey]) {
      return (window as any).svgCache[cacheKey];
    }

    const strokeColor = isDarkMode ? '#6b7280' : '#d1d5db';
    const textColor = isDarkMode ? '#9ca3af' : '#6b7280';
    
    const panels = template.panels.map(panel => 
      `<rect x="${panel.x * 0.1}" y="${panel.y * 0.1}" width="${panel.width * 0.1}" height="${panel.height * 0.1}" 
       fill="none" stroke="${strokeColor}" stroke-width="1"/>
       <text x="${(panel.x + panel.width/2) * 0.1}" y="${(panel.y + panel.height/2) * 0.1}" 
       text-anchor="middle" dominant-baseline="middle" 
       fill="${textColor}" font-size="8" font-family="sans-serif">${panel.id}</text>`
    ).join('');

    const svg = `<svg viewBox="0 0 60 75" width="100%" height="100%">${panels}</svg>`;
    
    // 簡単なキャッシュに保存
    if (!(window as any).svgCache) (window as any).svgCache = {};
    (window as any).svgCache[cacheKey] = svg;
    
    return svg;
  };

  // カテゴリタブのスタイル
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

  // テンプレートカードのスタイル（ホバー効果削除版）
  const getCardStyle = (templateId: string) => ({
    width: '120px',
    height: '100px',
    margin: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    border: `2px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    boxShadow: isDarkMode ? '0 2px 4px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
  });

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '800px',
      maxHeight: '600px',
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
        
        {/* カテゴリタブ */}
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
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '16px',
          justifyContent: 'center'
        }}>
          {getCurrentTemplates().map(templateId => (
            <div
              key={templateId}
              style={getCardStyle(templateId)}
              onClick={() => onTemplateSelect(templateId)}
            >
              {/* プレビューエリア */}
              <div style={{
                height: '60px',
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
              
              {/* テンプレート名 */}
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

      {/* フッター - 詳細表示削除版 */}
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

      {/* 閉じるボタン - 動作修正版 */}
      <button
        onClick={() => {
          setActiveCategory('人気');
          if (onClose) {
            onClose(); // 🆕 専用の閉じる関数を呼ぶ
          } else {
            onTemplateSelect(''); // フォールバック
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