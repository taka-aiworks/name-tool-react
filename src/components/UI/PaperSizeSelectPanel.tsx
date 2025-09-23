// src/components/UI/PaperSizeSelectPanel.tsx - カスタムサイズ対応完全版
import React, { useState } from 'react';
import { PaperSize, PAPER_SIZES, CanvasSettings } from '../../types';

interface PaperSizeSelectPanelProps {
  currentSettings: CanvasSettings;
  onSettingsChange: (settings: CanvasSettings) => void;
  isVisible: boolean;
  onToggle: () => void;
}

export const PaperSizeSelectPanel: React.FC<PaperSizeSelectPanelProps> = ({
  currentSettings,
  onSettingsChange,
  isVisible,
  onToggle
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('standard');
  // カスタムサイズ用のstate
  const [customWidth, setCustomWidth] = useState(210);
  const [customHeight, setCustomHeight] = useState(297);

  // カテゴリ別にサイズを分類
  const categorizedSizes = {
    standard: Object.values(PAPER_SIZES).filter(size => size.category === 'standard'),
    web: Object.values(PAPER_SIZES).filter(size => size.category === 'web'),
    custom: Object.values(PAPER_SIZES).filter(size => size.category === 'custom')
  };

  // 用紙サイズ変更ハンドラ
  const handleSizeChange = (newSize: PaperSize) => {
    onSettingsChange({
      ...currentSettings,
      paperSize: newSize
    });
  };

  // カスタムサイズ適用関数
  const applyCustomSize = () => {
    const customSize: PaperSize = {
      ...PAPER_SIZES.CUSTOM,
      width: customWidth,
      height: customHeight,
      pixelWidth: Math.round(customWidth * 11.811), // 300DPI換算
      pixelHeight: Math.round(customHeight * 11.811),
      aspectRatio: customHeight / customWidth,
      displayName: `カスタム（${customWidth}×${customHeight}mm）`,
      isPortrait: customHeight > customWidth
    };
    handleSizeChange(customSize);
  };

  return (
    <div className="ui-panel">
      {/* パネルヘッダー */}
      <div 
        className="panel-header" 
        onClick={onToggle}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 12px',
          cursor: 'pointer',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          marginBottom: isVisible ? '8px' : '0'
        }}
      >
        <h3 style={{ 
          margin: 0, 
          fontSize: '14px', 
          color: 'var(--text-primary)',
          fontWeight: 'bold'
        }}>
          📐 用紙サイズ
        </h3>
        <span style={{ 
          fontSize: '12px', 
          color: 'var(--text-muted)',
          transform: isVisible ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }}>
          ▶
        </span>
      </div>

      {isVisible && (
        <div style={{ 
          background: 'var(--bg-tertiary)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '6px', 
          padding: '12px' 
        }}>
          
          {/* 現在の設定表示 */}
          <div style={{ 
            background: 'var(--bg-secondary)', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '15px',
            fontSize: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ 
              marginBottom: '6px', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                現在: {currentSettings.paperSize.displayName}
              </span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
              {currentSettings.paperSize.pixelWidth} × {currentSettings.paperSize.pixelHeight}px
            </div>
          </div>

          {/* カテゴリ選択タブ */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
            {[
              { id: 'standard', name: '📄 標準' },
              { id: 'web', name: '🌐 Web' },
              { id: 'custom', name: '⚙️ カスタム' }
            ].map(tab => (
              <button
                key={tab.id}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  border: '1px solid var(--border-color)',
                  background: selectedCategory === tab.id ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                  color: selectedCategory === tab.id ? 'white' : 'var(--text-primary)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setSelectedCategory(tab.id)}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* サイズ選択グリッド */}
          {selectedCategory !== 'custom' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {categorizedSizes[selectedCategory as keyof typeof categorizedSizes].map(size => (
                <div
                  key={size.id}
                  style={{
                    border: currentSettings.paperSize.id === size.id ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '10px',
                    cursor: 'pointer',
                    background: currentSettings.paperSize.id === size.id ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                    fontSize: '12px',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                  onClick={() => handleSizeChange(size)}
                  onMouseEnter={(e) => {
                    if (currentSettings.paperSize.id !== size.id) {
                      e.currentTarget.style.borderColor = 'var(--accent-color)';
                      e.currentTarget.style.background = 'var(--bg-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentSettings.paperSize.id !== size.id) {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.background = 'var(--bg-tertiary)';
                    }
                  }}
                >
                  {/* サイズプレビュー */}
                  <div style={{
                    width: '40px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-primary)',
                    borderRadius: '3px',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div 
                      style={{
                        width: `${Math.min(size.width / 8, 30)}px`,
                        height: `${Math.min(size.height / 8, 40)}px`,
                        backgroundColor: currentSettings.paperSize.id === size.id ? 'var(--accent-color)' : 'var(--text-muted)',
                        borderRadius: '1px'
                      }}
                    />
                  </div>
                  
                  {/* サイズ情報 */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                      {size.name}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
                      {size.description}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '10px', marginTop: '2px' }}>
                      {size.width}×{size.height}mm
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* カスタムサイズ設定 */}
          {selectedCategory === 'custom' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ 
                    fontSize: '12px', 
                    fontWeight: 'bold', 
                    display: 'block', 
                    marginBottom: '4px',
                    color: 'var(--text-primary)'
                  }}>
                    幅 (mm)
                  </label>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Number(e.target.value))}
                    min="50"
                    max="1000"
                    step="1"
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '12px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    fontSize: '12px', 
                    fontWeight: 'bold', 
                    display: 'block', 
                    marginBottom: '4px',
                    color: 'var(--text-primary)'
                  }}>
                    高さ (mm)
                  </label>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Number(e.target.value))}
                    min="50"
                    max="1000"
                    step="1"
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '12px'
                    }}
                  />
                </div>
              </div>
              
              <button
                onClick={applyCustomSize}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'var(--accent-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                📐 カスタムサイズを適用
              </button>
              
              {/* プリセットボタン */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                <button 
                  onClick={() => { setCustomWidth(210); setCustomHeight(297); }}
                  style={{
                    padding: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '10px'
                  }}
                >
                  A4
                </button>
                <button 
                  onClick={() => { setCustomWidth(182); setCustomHeight(257); }}
                  style={{
                    padding: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '10px'
                  }}
                >
                  B5
                </button>
                <button 
                  onClick={() => { setCustomWidth(148); setCustomHeight(210); }}
                  style={{
                    padding: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '10px'
                  }}
                >
                  A5
                </button>
                <button 
                  onClick={() => { setCustomWidth(297); setCustomHeight(210); }}
                  style={{
                    padding: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '10px'
                  }}
                >
                  A4横
                </button>
              </div>
            </div>
          )}

          {/* 使用方法のヒント */}
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            padding: '8px',
            marginTop: '12px',
            fontSize: '11px',
            color: 'var(--text-muted)',
            lineHeight: '1.4'
          }}>
            💡 <strong>用紙サイズの活用:</strong><br/>
            • A4/B5: 印刷・同人誌用<br/>
            • Twitter: SNS投稿最適化<br/>
            • DPI300: 高品質印刷用
          </div>
        </div>
      )}
    </div>
  );
};