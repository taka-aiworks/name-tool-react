import React from 'react';
import { SnapSettings } from '../../types';

interface SnapSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  snapSettings: SnapSettings;
  onSnapSettingsUpdate: (settings: SnapSettings) => void;
  isDarkMode?: boolean;
}

const SnapSettingsPanel: React.FC<SnapSettingsPanelProps> = ({
  isOpen,
  onClose,
  snapSettings,
  onSnapSettingsUpdate,
  isDarkMode = true
}) => {
  if (!isOpen) return null;

  const handleToggle = () => {
    onSnapSettingsUpdate({
      ...snapSettings,
      enabled: !snapSettings.enabled
    });
  };

  const handleGridSizeChange = (size: number) => {
    onSnapSettingsUpdate({
      ...snapSettings,
      gridSize: size
    });
  };

  const handleSensitivityChange = (sensitivity: 'weak' | 'medium' | 'strong') => {
    onSnapSettingsUpdate({
      ...snapSettings,
      sensitivity
    });
  };

  const handleGridDisplayChange = (gridDisplay: 'always' | 'edit-only' | 'hidden') => {
    onSnapSettingsUpdate({
      ...snapSettings,
      gridDisplay
    });
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
        className="modal-content snap-settings-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-primary)',
          border: '2px solid var(--border-color)',
          borderRadius: '12px',
          padding: '24px',
          width: '90%',
          maxWidth: '500px',
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
          marginBottom: '20px'
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '20px', 
            fontWeight: 'bold',
            color: 'var(--text-primary)'
          }}>
            ⚙️ スナップ設定
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* スナップ設定内容 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* スナップ機能のON/OFF */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            background: 'var(--bg-secondary)',
            borderRadius: '8px',
            border: `2px solid ${snapSettings.enabled ? '#4CAF50' : 'var(--border-color)'}`
          }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
                ✅ スナップ機能
              </h3>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.7 }}>
                要素をグリッドに合わせて配置します
              </p>
            </div>
            <button
              onClick={handleToggle}
              style={{
                background: snapSettings.enabled ? '#4CAF50' : '#666',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {snapSettings.enabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* スナップ設定（ON時のみ表示） */}
          {snapSettings.enabled && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* グリッドサイズ */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  fontWeight: '600' 
                }}>
                  📏 グリッドサイズ
                </label>
                <select 
                  value={snapSettings.gridSize}
                  onChange={(e) => handleGridSizeChange(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px'
                  }}
                >
                  <option value={10}>10px - 細かいグリッド</option>
                  <option value={20}>20px - 標準グリッド</option>
                  <option value={40}>40px - 粗いグリッド</option>
                </select>
              </div>

              {/* スナップ感度 */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  fontWeight: '600' 
                }}>
                  🎯 スナップ感度
                </label>
                <select 
                  value={snapSettings.sensitivity}
                  onChange={(e) => handleSensitivityChange(e.target.value as 'weak' | 'medium' | 'strong')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px'
                  }}
                >
                  <option value="weak">弱 - スナップしにくい</option>
                  <option value="medium">中 - 標準感度</option>
                  <option value="strong">強 - スナップしやすい</option>
                </select>
              </div>

              {/* グリッド表示 */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  fontWeight: '600' 
                }}>
                  📐 グリッド表示
                </label>
                <select 
                  value={snapSettings.gridDisplay}
                  onChange={(e) => handleGridDisplayChange(e.target.value as 'always' | 'edit-only' | 'hidden')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px'
                  }}
                >
                  <option value="always">常時表示 - 常にグリッドを表示</option>
                  <option value="edit-only">編集時のみ - 要素を移動中のみ表示</option>
                  <option value="hidden">非表示 - グリッドを表示しない</option>
                </select>
              </div>

              {/* 現在の設定プレビュー */}
              <div style={{
                padding: '12px',
                background: 'var(--bg-tertiary)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>
                  📊 現在の設定
                </h4>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  <div>グリッドサイズ: {snapSettings.gridSize}px</div>
                  <div>スナップ感度: {snapSettings.sensitivity === 'weak' ? '弱' : snapSettings.sensitivity === 'medium' ? '中' : '強'}</div>
                  <div>グリッド表示: {
                    snapSettings.gridDisplay === 'always' ? '常時' : 
                    snapSettings.gridDisplay === 'edit-only' ? '編集時のみ' : 
                    '非表示'
                  }</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div style={{ 
          marginTop: '24px', 
          paddingTop: '16px', 
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default SnapSettingsPanel;
