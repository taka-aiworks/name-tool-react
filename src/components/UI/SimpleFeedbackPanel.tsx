/**
 * シンプルなGoogleフォーム埋め込みフィードバックパネル
 */

import React from 'react';

interface SimpleFeedbackPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onDarkMode?: boolean;
}

export const SimpleFeedbackPanel: React.FC<SimpleFeedbackPanelProps> = ({
  isVisible,
  onClose,
  onDarkMode = false
}) => {
  if (!isVisible) return null;

  return (
    <div className="feedback-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div className="feedback-panel" style={{
        backgroundColor: onDarkMode ? '#2a2a2a' : '#ffffff',
        border: `1px solid ${onDarkMode ? '#444' : '#ddd'}`,
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '800px', // 600px → 800px に拡大
        width: '95%', // 90% → 95% に拡大
        maxHeight: '85vh', // 80vh → 85vh に拡大
        overflowY: 'auto',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        {/* ヘッダー */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '12px',
          borderBottom: `1px solid ${onDarkMode ? '#444' : '#eee'}`
        }}>
          <h3 style={{
            margin: 0,
            color: onDarkMode ? '#fff' : '#333',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            🧪 ベータ版フィードバック
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: onDarkMode ? '#ccc' : '#666',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* Googleフォーム埋め込み */}
        <div style={{
          marginBottom: '16px',
          color: onDarkMode ? '#ccc' : '#666',
          fontSize: '14px'
        }}>
          以下のフォームからフィードバックをお送りください：
        </div>

        {/* 実際のGoogleフォームをここに埋め込み */}
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSdQ_xNifC7yQTWQ_81upspPF3gAT0TK2LktLSib7_db4X33Lg/viewform?embedded=true"
          width="100%"
          height="450" // 400px → 450px に拡大
          frameBorder="0"
          marginHeight={0}
          marginWidth={0}
          style={{
            border: 'none',
            borderRadius: '8px'
          }}
        >
          読み込んでいます...
        </iframe>

        {/* 注意事項 */}
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: onDarkMode ? '#333' : '#f5f5f5',
          borderRadius: '6px',
          fontSize: '12px',
          color: onDarkMode ? '#ccc' : '#666'
        }}>
          💡 フォーム送信後、このウィンドウを閉じてください
        </div>
      </div>
    </div>
  );
};
