// src/components/UI/TonePanel.tsx - BackgroundPanel/EffectPanelと同じモーダル実装パターンに統合
import React, { useState, useCallback, useMemo } from 'react';
import { ToneElement, ToneTemplate, Panel, BlendMode } from '../../types';
import { 
  allToneTemplates, 
  toneTemplatesByCategory, 
  createToneFromTemplate,
  getToneCategoryInfo,
  getDefaultToneSettings
} from '../CanvasArea/toneTemplates';

/**
 * BackgroundPanel/EffectPanelと同じプロパティ構造
 */
interface TonePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTone: (tone: ToneElement) => void;
  selectedTone?: ToneElement | null;
  onUpdateTone?: (tone: ToneElement) => void;
  isDarkMode?: boolean;
  selectedPanel?: Panel | null;
  tones?: ToneElement[];
  // 互換性用（削除予定）
  selectedPanelId?: number;
  darkMode?: boolean;
}

/**
 * トーン選択・設定パネル（BackgroundPanel/EffectPanelと同じモーダル実装）
 */
const TonePanel: React.FC<TonePanelProps> = ({
  isOpen,
  onClose,
  onAddTone,
  selectedTone,
  onUpdateTone,
  isDarkMode = false,
  selectedPanel,
  tones = [],
  selectedPanelId,
  darkMode
}) => {
  // BackgroundPanel/EffectPanelと同じモーダル表示判定
  if (!isOpen) return null;

  // ダークモード統一
  const isThemeDark = isDarkMode || darkMode || false;

  // UI状態管理
  const [activeTab, setActiveTab] = useState<'shadow' | 'highlight' | 'texture' | 'background' | 'effect' | 'mood'>('shadow');
  const [selectedTemplate, setSelectedTemplate] = useState<ToneTemplate | null>(null);
  const [previewTone, setPreviewTone] = useState<ToneElement | null>(null);

  // 🔧 利用可能なパネルを取得（BackgroundPanelと同じ方式）
  const getAvailablePanels = () => {
    if (selectedPanel) return [selectedPanel];
    
    const panelsWithTones = tones.map(tone => tone.panelId);
    const uniquePanelIds: number[] = [];
    panelsWithTones.forEach(id => {
      if (uniquePanelIds.indexOf(id) === -1) {
        uniquePanelIds.push(id);
      }
    });
    
    return uniquePanelIds.map(id => ({ id, x: 0, y: 0, width: 100, height: 100 }));
  };

  const availablePanels = getAvailablePanels();
  const currentPanel = selectedPanel || availablePanels[0] || null;

  // トーン追加処理（BackgroundPanelのapplyBackgroundTemplateと同じ構造）
  const applyToneTemplate = (template: ToneTemplate) => {
    if (!currentPanel) {
      alert('パネルを選択するか、既存のトーンがあるパネルから選択してください');
      return;
    }

    // createToneFromTemplateを使用してトーンを作成
    if (createToneFromTemplate && typeof createToneFromTemplate === 'function') {
      try {
        const newTone = createToneFromTemplate(
          template,
          currentPanel.id,
          0.1, // デフォルト位置
          0.1,
          0.8, // デフォルトサイズ
          0.8
        );
        onAddTone(newTone);
        console.log(`✨ トーン「${template.name}」をパネル${currentPanel.id}に適用しました`);
      } catch (error) {
        console.error('トーン追加エラー:', error);
        alert('トーンの追加に失敗しました');
      }
    } else {
      // フォールバック: 手動でトーンを作成
      const newTone: ToneElement = {
        id: `tone_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        panelId: currentPanel.id,
        type: template.type,
        pattern: template.pattern,
        x: 0.1,
        y: 0.1,
        width: 0.8,
        height: 0.8,
        density: template.density,
        opacity: template.opacity,
        rotation: template.rotation || 0,
        scale: template.scale || 1,
        blendMode: template.blendMode,
        contrast: template.contrast || 1,
        brightness: template.brightness || 0,
        invert: false,
        maskEnabled: false,
        maskShape: 'rectangle',
        maskFeather: 0,
        selected: false,
        zIndex: 0,
        isGlobalPosition: false,
        visible: true,
        // 描画用プロパティ
        color: '#000000',
        intensity: 0.5,
        angle: 0,
        direction: 'vertical'
      };
      onAddTone(newTone);
    }
  };

  // トーン削除（BackgroundPanelと同じ構造）
  const deleteTone = (toneId: string) => {
    if (window.confirm('このトーンを削除しますか？')) {
      // 削除処理はCanvasComponentで実装されているため、ここでは何もしない
      console.log('トーン削除:', toneId);
      // 実際の削除はcontextMenuActionsで処理される
    }
  };

  // 現在のパネルのトーン取得（BackgroundPanelと同じ構造）
  const panelTones = currentPanel 
    ? tones.filter(tone => tone.panelId === currentPanel.id)
    : [];

  // カテゴリ情報取得
  const categoryInfo = getToneCategoryInfo ? getToneCategoryInfo() : {
    shadow: { icon: '🌑', name: '影・陰影', description: 'シャドウトーン' },
    highlight: { icon: '✨', name: 'ハイライト', description: '光・反射' },
    texture: { icon: '🎨', name: 'テクスチャ', description: '質感表現' },
    background: { icon: '🖼️', name: '背景', description: '背景パターン' },
    effect: { icon: '💫', name: '効果', description: '特殊効果' },
    mood: { icon: '🌈', name: '雰囲気', description: 'ムード演出' }
  };

  // トーンタイプのアイコン取得
  const getToneTypeIcon = (type: string) => {
    switch (type) {
      case 'halftone': return '⚫';
      case 'gradient': return '🌈';
      case 'crosshatch': return '❌';
      case 'dots': return '⚪';
      case 'lines': return '📏';
      case 'noise': return '🌪️';
      default: return '🎨';
    }
  };

  // トーンタイプ名取得
  const getToneTypeName = (type: string) => {
    switch (type) {
      case 'halftone': return 'ハーフトーン';
      case 'gradient': return 'グラデーション';
      case 'crosshatch': return 'クロスハッチ';
      case 'dots': return 'ドット';
      case 'lines': return 'ライン';
      case 'noise': return 'ノイズ';
      default: return type;
    }
  };

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
        className="modal-content tone-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-primary)',
          border: '2px solid var(--border-color)',
          borderRadius: '12px',
          padding: '24px',
          width: '90%',
          maxWidth: '900px',
          maxHeight: '80vh',
          overflow: 'auto',
          color: 'var(--text-primary)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* ヘッダー（BackgroundPanel/EffectPanelと同じ構造） */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '16px'
        }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
            🎨 トーン設定
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

        {/* パネル選択状況の表示（BackgroundPanelと同じ構造） */}
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
            📢 トーンを設定するパネルを先に選択してください
            {availablePanels.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <small style={{ display: 'block', marginBottom: '8px' }}>
                  または、既存のトーンがあるパネルから選択:
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
            {/* カテゴリタブ（BackgroundPanelと同じ構造） */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                flexWrap: 'wrap',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '12px'
              }}>
                {Object.entries(categoryInfo).map(([category, info]) => (
                  <button
                    key={category}
                    onClick={() => setActiveTab(category as any)}
                    style={{
                      background: activeTab === category ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                      color: activeTab === category ? 'white' : 'var(--text-primary)',
                      border: `1px solid ${activeTab === category ? 'var(--accent-color)' : 'var(--border-color)'}`,
                      borderRadius: '6px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: activeTab === category ? 'bold' : 'normal'
                    }}
                  >
                    {info.icon} {info.name}
                  </button>
                ))}
              </div>
            </div>

            {/* トーンテンプレート一覧（BackgroundPanelと同じ構造） */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '18px',
                color: 'var(--text-primary)'
              }}>
                📋 テンプレート ({(toneTemplatesByCategory[activeTab] || []).length}個)
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '12px',
                padding: '12px',
                background: 'var(--bg-secondary)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                {(toneTemplatesByCategory[activeTab] || []).map(template => (
                  <div
                    key={template.id}
                    onClick={() => applyToneTemplate(template)}
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
                    {/* トーンプレビュー */}
                    <div style={{
                      width: '100%',
                      height: '60px',
                      margin: '0 auto 8px',
                      background: template.preview?.backgroundColor || '#f0f0f0',
                      borderRadius: '4px',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}>
                      {getToneTypeIcon(template.type)}
                    </div>
                    
                    <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {template.name}
                    </div>
                    
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      {template.description}
                    </div>
                    
                    {/* パラメータ表示 */}
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <span style={{
                        background: 'var(--bg-tertiary)',
                        padding: '2px 4px',
                        borderRadius: '8px',
                        fontSize: '9px',
                        color: 'var(--text-muted)'
                      }}>
                        密度: {Math.round(template.density * 100)}%
                      </span>
                      <span style={{
                        background: 'var(--bg-tertiary)',
                        padding: '2px 4px',
                        borderRadius: '8px',
                        fontSize: '9px',
                        color: 'var(--text-muted)'
                      }}>
                        透明度: {Math.round(template.opacity * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 現在のトーン一覧（BackgroundPanelと同じ構造） */}
            {panelTones.length > 0 && (
              <div>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: '18px',
                  color: 'var(--text-primary)'
                }}>
                  🎯 現在のトーン ({panelTones.length}個)
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
                  {panelTones.map(tone => (
                    <div
                      key={tone.id}
                      onClick={() => {
                        // トーン選択（実際の選択はCanvasComponentで処理）
                        console.log('トーン選択:', tone.id);
                      }}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: selectedTone?.id === tone.id ? 'var(--accent-color)' : 'var(--bg-primary)',
                        color: selectedTone?.id === tone.id ? 'white' : 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      <div>
                        <strong>{getToneTypeIcon(tone.type)} {getToneTypeName(tone.type)}</strong>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>
                          密度: {Math.round(tone.density * 100)}% | 透明度: {Math.round(tone.opacity * 100)}% | {tone.pattern}
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTone(tone.id);
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

            {/* 選択中のトーン編集エリア（EffectPanelと同じ構造） */}
            {selectedTone && onUpdateTone && (
              <div style={{
                marginTop: '20px',
                padding: '16px',
                background: 'var(--bg-secondary)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <h4 style={{
                  margin: '0 0 12px 0',
                  fontSize: '16px',
                  color: 'var(--text-primary)'
                }}>
                  🎯 選択中のトーン: {getToneTypeIcon(selectedTone.type)} {getToneTypeName(selectedTone.type)}
                </h4>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      marginBottom: '4px'
                    }}>
                      密度: {Math.round(selectedTone.density * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={selectedTone.density}
                      onChange={(e) => {
                        const updatedTone = {
                          ...selectedTone,
                          density: parseFloat(e.target.value)
                        };
                        onUpdateTone(updatedTone);
                      }}
                      style={{
                        width: '100%',
                        accentColor: 'var(--accent-color)'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      marginBottom: '4px'
                    }}>
                      透明度: {Math.round(selectedTone.opacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={selectedTone.opacity}
                      onChange={(e) => {
                        const updatedTone = {
                          ...selectedTone,
                          opacity: parseFloat(e.target.value)
                        };
                        onUpdateTone(updatedTone);
                      }}
                      style={{
                        width: '100%',
                        accentColor: 'var(--accent-color)'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 操作ガイド（BackgroundPanel/EffectPanelと同じ構造） */}
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
              • テンプレートをクリックしてトーンを適用<br/>
              • トーン要素をクリックして選択・編集<br/>
              • キャンバス上でトーンをクリックして選択<br/>
              • パネルを選択してからトーン設定パネルを開く<br/>
              • Ctrl+T でトーンパネル開閉<br/>
              • 🔧 BackgroundPanel/EffectPanelと同じモーダル実装に統合済み
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TonePanel;