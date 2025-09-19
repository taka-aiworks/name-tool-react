// src/components/UI/BackgroundPanel.tsx - 共通ユーティリティ使用版
import React, { useState } from 'react';
import { BackgroundPanelProps, BackgroundTemplate, BackgroundElement } from '../../types';
import { 
  backgroundTemplates, 
  backgroundCategories, 
  getBackgroundsByCategory,
  getTemplatePreviewColor,
  getBackgroundTypeIcon,
  getBackgroundTypeName
} from '../CanvasArea/backgroundTemplates';
import { getIntegratedBackgroundName, getBackgroundPreviewColor } from '../../utils/backgroundUtils';

const BackgroundPanel: React.FC<BackgroundPanelProps> = ({
  isOpen,
  onClose,
  backgrounds,
  setBackgrounds,
  selectedPanel,
  onBackgroundAdd
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('nature');
  const [selectedBackground, setSelectedBackground] = useState<BackgroundElement | null>(null);

  if (!isOpen) return null;

  // 利用可能なパネルを取得
  const getAvailablePanels = () => {
    if (selectedPanel) return [selectedPanel];
    
    const panelsWithBackgrounds = backgrounds.map(bg => bg.panelId);
    const uniquePanelIds: number[] = [];
    panelsWithBackgrounds.forEach(id => {
      if (uniquePanelIds.indexOf(id) === -1) {
        uniquePanelIds.push(id);
      }
    });
    
    return uniquePanelIds.map(id => ({ id, x: 0, y: 0, width: 100, height: 100 }));
  };

  const availablePanels = getAvailablePanels();
  const currentPanel = selectedPanel || availablePanels[0] || null;

  // 背景テンプレート適用
  const applyBackgroundTemplate = (template: BackgroundTemplate) => {
    if (!currentPanel) {
      alert('パネルを選択するか、既存の背景があるパネルから選択してください');
      return;
    }

    const filteredBackgrounds = backgrounds.filter(bg => bg.panelId !== currentPanel.id);
    
    const newBackgrounds = template.elements.map((element, index) => {
      const backgroundElement: BackgroundElement = {
        id: `bg_${Date.now()}_${index}`,
        panelId: currentPanel.id,
        name: template.name,  // この行を追加
        ...element
      };
      return backgroundElement;
    });

    setBackgrounds([...filteredBackgrounds, ...newBackgrounds]);
    onBackgroundAdd(template);
    console.log(`背景テンプレート「${template.name}」をパネル${currentPanel.id}に適用しました`);
  };

  // 🔧 現在のパネルの背景情報を取得
  const panelBackgrounds = currentPanel 
    ? backgrounds.filter(bg => bg.panelId === currentPanel.id)
    : [];

  // 🔧 共通ユーティリティを使用（重複コード削除）
  const backgroundName = currentPanel 
    ? getIntegratedBackgroundName(backgrounds, currentPanel.id)
    : '';

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div 
        className="modal-content background-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-primary)',
          border: '2px solid var(--border-color)',
          borderRadius: '12px',
          padding: '24px',
          width: '90%',
          maxWidth: '800px',
          maxHeight: '80vh',
          overflow: 'auto',
          color: 'var(--text-primary)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* ヘッダー */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '16px'
        }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
            🎨 背景設定
            {currentPanel && (
              <span style={{ fontSize: '16px', fontWeight: 'normal', marginLeft: '12px', color: 'var(--text-muted)' }}>
                パネル{currentPanel.id} ({panelBackgrounds.length})
              </span>
            )}
          </h2>
          
          <button 
            onClick={onClose}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '8px 12px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ✕ 閉じる
          </button>
        </div>

        {/* パネル選択状況の表示 */}
        {!currentPanel ? (
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--accent-color)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
            textAlign: 'center',
            color: 'var(--accent-color)'
          }}>
            📢 背景を設定するパネルを先に選択してください
          </div>
        ) : (
          <>
            {/* 🆕 デバッグ情報表示 */}
            <div style={{
              background: '#f0f8ff',
              border: '1px solid #4dabf7',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              fontSize: '12px',
              color: '#1971c2'
            }}>
              <strong>🔍 デバッグ情報:</strong><br/>
              • パネルID: {currentPanel.id}<br/>
              • 背景要素数: {panelBackgrounds.length}<br/>
              • 検出された背景名: {backgroundName || '(未検出)'}<br/>
              • 背景要素: {panelBackgrounds.map(bg => `${bg.type}(${bg.id})`).join(', ')}<br/>
            </div>

            {/* カテゴリタブ */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                flexWrap: 'wrap',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '12px'
              }}>
                {backgroundCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    style={{
                      background: activeCategory === category.id ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                      color: activeCategory === category.id ? 'white' : 'var(--text-primary)',
                      border: `1px solid ${activeCategory === category.id ? 'var(--accent-color)' : 'var(--border-color)'}`,
                      borderRadius: '6px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: activeCategory === category.id ? 'bold' : 'normal'
                    }}
                  >
                    {category.icon} {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 背景テンプレート一覧 */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '18px',
                color: 'var(--text-primary)'
              }}>
                📋 テンプレート ({getBackgroundsByCategory(activeCategory as any).length}個)
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '12px',
                padding: '12px',
                background: 'var(--bg-secondary)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                {getBackgroundsByCategory(activeCategory as any).map(template => (
                  <div
                    key={template.id}
                    onClick={() => applyBackgroundTemplate(template)}
                    style={{
                      background: 'var(--bg-primary)',
                      border: '2px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '12px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      fontSize: '12px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-color)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      width: '80px',
                      height: '60px',
                      margin: '0 auto 8px',
                      background: getTemplatePreviewColor(template),
                      borderRadius: '4px',
                      border: '1px solid var(--border-color)'
                    }} />
                    <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                      {template.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 🆕 強制統合表示（必ず表示） */}
            {panelBackgrounds.length > 0 && (
              <div>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: '18px',
                  color: 'var(--text-primary)'
                }}>
                  🎯 現在の背景
                </h3>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    {/* プレビューカラー */}
                    <div style={{
                      width: '40px',
                      height: '30px',
                      background: panelBackgrounds[0] ? getBackgroundPreviewColor(panelBackgrounds[0]) : '#CCCCCC',
                      borderRadius: '4px',
                      border: '1px solid var(--border-color)'
                    }} />
                    
                    {/* 背景名と詳細 */}
                    <div>
                      <div style={{ 
                        fontWeight: 'bold', 
                        fontSize: '18px',
                        color: 'var(--text-primary)'
                      }}>
                        📍 {backgroundName || 'カスタム背景'}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: 'var(--text-muted)' 
                      }}>
                        統合表示 ({panelBackgrounds.length}個の要素)
                      </div>
                    </div>
                  </div>
                  
                  {/* 削除ボタン */}
                  <button
                    onClick={() => {
                      if (window.confirm(`背景「${backgroundName}」を削除しますか？`)) {
                        const filteredBackgrounds = backgrounds.filter(bg => bg.panelId !== currentPanel.id);
                        setBackgrounds(filteredBackgrounds);
                      }
                    }}
                    style={{
                      background: '#ff4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    🗑️ 削除
                  </button>
                </div>
                
                {/* 成功メッセージ */}
                <div style={{
                  marginTop: '8px',
                  padding: '8px',
                  background: '#e8f5e8',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#2e7d32',
                  border: '1px solid #c8e6c9'
                }}>
                  ✅ 統合表示ON: 個別要素は統合されています
                </div>
              </div>
            )}

            {/* 操作ガイド */}
            <div style={{
              marginTop: '20px',
              padding: '12px',
              background: 'var(--bg-secondary)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              fontSize: '12px',
              color: 'var(--text-muted)'
            }}>
              <strong>💡 操作ガイド:</strong><br/>
              • テンプレートをクリックして背景を適用<br/>
              • 🔧 修正版: 統合表示で背景名のみ表示<br/>
              • デバッグ情報で動作確認可能<br/>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BackgroundPanel;