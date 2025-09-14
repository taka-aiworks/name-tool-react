// src/components/UI/BackgroundPanel.tsx - 完全修正版
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

  // 🆕 利用可能なパネルを取得（背景があるパネルも含める）
  const getAvailablePanels = () => {
    // selectedPanelがある場合はそれを優先
    if (selectedPanel) return [selectedPanel];
    
    // selectedPanelがない場合、背景があるパネルから選択可能にする
    const panelsWithBackgrounds = backgrounds.map(bg => bg.panelId);
    
    // 🔧 TypeScriptエラー修正: Setのスプレッド演算子を避ける
    const uniquePanelIds: number[] = [];
    panelsWithBackgrounds.forEach(id => {
      if (uniquePanelIds.indexOf(id) === -1) {
        uniquePanelIds.push(id);
      }
    });
    
    // 背景があるパネルIDから擬似的なパネルオブジェクトを作成
    return uniquePanelIds.map(id => ({ id, x: 0, y: 0, width: 100, height: 100 }));
  };

  const availablePanels = getAvailablePanels();
  const currentPanel = selectedPanel || availablePanels[0] || null;

  // 🔧 背景テンプレート適用（修正版）
  const applyBackgroundTemplate = (template: BackgroundTemplate) => {
    if (!currentPanel) {
      alert('パネルを選択するか、既存の背景があるパネルから選択してください');
      return;
    }

    // 既存の背景を削除（同じパネル内）
    const filteredBackgrounds = backgrounds.filter(bg => bg.panelId !== currentPanel.id);
    
    // 新しい背景要素を作成
    const newBackgrounds = template.elements.map((element, index) => {
      const backgroundElement: BackgroundElement = {
        id: `bg_${Date.now()}_${index}`,
        panelId: currentPanel.id,
        ...element
      };
      return backgroundElement;
    });

    setBackgrounds([...filteredBackgrounds, ...newBackgrounds]);
    onBackgroundAdd(template);
    console.log(`背景テンプレート「${template.name}」をパネル${currentPanel.id}に適用しました`);
  };

  // 背景要素削除
  const deleteBackground = (backgroundId: string) => {
    if (window.confirm('この背景を削除しますか？')) {
      const filteredBackgrounds = backgrounds.filter(bg => bg.id !== backgroundId);
      setBackgrounds(filteredBackgrounds);
      setSelectedBackground(null);
    }
  };

  // 🔧 現在のパネルの背景取得（修正版）
  const panelBackgrounds = currentPanel 
    ? backgrounds.filter(bg => bg.panelId === currentPanel.id)
    : [];

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
                パネル{currentPanel.id}
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

        {/* 🔧 パネル選択状況の表示（修正版） */}
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
            {availablePanels.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <small style={{ display: 'block', marginBottom: '8px' }}>
                  または、既存の背景があるパネルから選択:
                </small>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {availablePanels.map(panel => (
                    <button 
                      key={panel.id}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: 'var(--accent-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                      onClick={() => {
                        // パネル選択の代替処理
                        console.log(`パネル${panel.id}を選択`);
                      }}
                    >
                      パネル{panel.id}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
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

            {/* 現在の背景一覧 */}
            {panelBackgrounds.length > 0 && (
              <div>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: '18px',
                  color: 'var(--text-primary)'
                }}>
                  🎯 現在の背景 ({panelBackgrounds.length}個)
                </h3>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}>
                  {panelBackgrounds.map(bg => (
                    <div
                      key={bg.id}
                      onClick={() => setSelectedBackground(bg)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: selectedBackground?.id === bg.id ? 'var(--accent-color)' : 'var(--bg-primary)',
                        color: selectedBackground?.id === bg.id ? 'white' : 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      <div>
                        <strong>{getBackgroundTypeIcon(bg.type)} {getBackgroundTypeName(bg.type)}</strong>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>
                          透明度: {Math.round(bg.opacity * 100)}% | Z: {bg.zIndex}
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBackground(bg.id);
                        }}
                        style={{
                          background: '#ff4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 🆕 操作ガイド（拡張版） */}
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
              • 背景要素をクリックして選択・削除<br/>
              • キャンバス上で背景をクリックして選択<br/>
              • パネルを選択してから背景設定パネルを開く<br/>
              • 🔧 不具合修正: クリック優先順位を調整済み
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BackgroundPanel;