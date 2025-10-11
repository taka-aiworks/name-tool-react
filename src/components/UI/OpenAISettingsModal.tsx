// src/components/UI/OpenAISettingsModal.tsx
import React, { useState, useEffect } from 'react';
import { openAIService } from '../../services/OpenAIService';

interface OpenAISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

export const OpenAISettingsModal: React.FC<OpenAISettingsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode = false
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const existingKey = openAIService.getApiKey();
      setApiKey(existingKey || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (apiKey.trim()) {
      openAIService.setApiKey(apiKey.trim());
      alert('APIキーを保存しました');
      onClose();
    } else {
      alert('APIキーを入力してください');
    }
  };

  const handleClear = () => {
    if (window.confirm('APIキーを削除しますか？')) {
      openAIService.clearApiKey();
      setApiKey('');
      alert('APIキーを削除しました');
    }
  };

  return (
    <>
      {/* オーバーレイ */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={onClose}
      />

      {/* モーダル */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: isDarkMode ? '#2d2d2d' : 'white',
          border: `2px solid ${isDarkMode ? '#555' : '#333'}`,
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 9999,
          minWidth: '450px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ 
          marginBottom: '20px', 
          fontWeight: 'bold', 
          fontSize: '18px',
          color: isDarkMode ? '#fff' : '#333'
        }}>
          🔑 OpenAI API設定
        </div>

        {/* APIキー入力 */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            fontSize: '13px',
            color: isDarkMode ? '#fff' : '#333'
          }}>
            APIキー
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              style={{
                width: '100%',
                padding: '10px',
                paddingRight: '60px',
                border: `1px solid ${isDarkMode ? '#555' : '#ccc'}`,
                borderRadius: '6px',
                background: isDarkMode ? '#404040' : 'white',
                color: isDarkMode ? '#fff' : '#333',
                fontSize: '13px',
                fontFamily: 'monospace'
              }}
            />
            <button
              onClick={() => setShowKey(!showKey)}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '4px 8px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {showKey ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* 取得方法 */}
        <div style={{
          marginBottom: '20px',
          padding: '12px',
          background: isDarkMode ? '#404040' : '#f0f0f0',
          borderRadius: '6px',
          fontSize: '11px',
          color: isDarkMode ? '#ccc' : '#666'
        }}>
          <strong>APIキーの取得方法:</strong>
          <ol style={{ marginTop: '8px', marginBottom: '0', paddingLeft: '20px' }}>
            <li>OpenAI Platform (<a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>platform.openai.com</a>) にアクセス</li>
            <li>「Create new secret key」でAPIキーを生成</li>
            <li>生成されたキーをここに貼り付け</li>
          </ol>
        </div>

        {/* セキュリティ注意 */}
        <div style={{
          marginBottom: '20px',
          padding: '12px',
          background: isDarkMode ? '#3d2a2a' : '#fff3cd',
          border: `1px solid ${isDarkMode ? '#665' : '#ffc107'}`,
          borderRadius: '6px',
          fontSize: '11px',
          color: isDarkMode ? '#fbbf24' : '#856404'
        }}>
          ⚠️ <strong>セキュリティ注意:</strong>
          <ul style={{ marginTop: '6px', marginBottom: '0', paddingLeft: '20px' }}>
            <li>APIキーはブラウザのローカルストレージに保存されます</li>
            <li>共用PCでは使用後に削除してください</li>
            <li>キーは外部に送信されません（OpenAI APIへの通信のみ）</li>
          </ul>
        </div>

        {/* ボタンエリア */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <button
            onClick={handleClear}
            disabled={!openAIService.hasApiKey()}
            style={{
              padding: '10px 16px',
              border: `1px solid ${isDarkMode ? '#555' : '#ccc'}`,
              borderRadius: '6px',
              background: isDarkMode ? '#404040' : 'white',
              color: '#dc2626',
              cursor: openAIService.hasApiKey() ? 'pointer' : 'not-allowed',
              fontSize: '13px',
              opacity: openAIService.hasApiKey() ? 1 : 0.5
            }}
          >
            🗑️ キーを削除
          </button>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: `1px solid ${isDarkMode ? '#555' : '#ccc'}`,
                borderRadius: '6px',
                background: isDarkMode ? '#404040' : 'white',
                color: isDarkMode ? '#fff' : '#333',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              閉じる
            </button>
            <button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                background: !apiKey.trim() ? '#999' : '#10b981',
                color: 'white',
                cursor: !apiKey.trim() ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              💾 保存
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

