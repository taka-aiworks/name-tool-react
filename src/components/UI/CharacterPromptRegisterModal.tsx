// src/components/UI/CharacterPromptRegisterModal.tsx
// キャラプロンプト登録専用モーダル（シンプル版）

import React, { useState, useEffect } from 'react';

interface CharacterPromptRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterId: string;
  characterName: string;
  currentPrompt?: string;
  onSave: (characterId: string, name: string, prompt: string) => void;
  isDarkMode?: boolean;
}

export const CharacterPromptRegisterModal: React.FC<CharacterPromptRegisterModalProps> = ({
  isOpen,
  onClose,
  characterId,
  characterName,
  currentPrompt = '',
  onSave,
  isDarkMode = false
}) => {
  const [name, setName] = useState(characterName);
  const [prompt, setPrompt] = useState(currentPrompt);

  useEffect(() => {
    if (isOpen) {
      setName(characterName);
      setPrompt(currentPrompt);
    }
  }, [isOpen, characterName, currentPrompt]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) {
      alert('キャラクター名を入力してください');
      return;
    }
    if (!prompt.trim()) {
      alert('プロンプトを入力してください');
      return;
    }
    onSave(characterId, name.trim(), prompt.trim());
    onClose();
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
          zIndex: 9998
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
          minWidth: '500px',
          maxWidth: '600px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ 
          marginBottom: '20px', 
          fontWeight: 'bold', 
          fontSize: '18px',
          color: isDarkMode ? '#fff' : '#333'
        }}>
          👤 キャラクタープロンプト登録
        </div>

        {/* キャラクター名 */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            fontSize: '13px',
            color: isDarkMode ? '#fff' : '#333'
          }}>
            📝 キャラクター名
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: リナ、サユ"
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${isDarkMode ? '#555' : '#ccc'}`,
              borderRadius: '6px',
              background: isDarkMode ? '#404040' : 'white',
              color: isDarkMode ? '#fff' : '#333',
              fontSize: '14px'
            }}
          />
        </div>

        {/* プロンプト */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            fontSize: '13px',
            color: isDarkMode ? '#fff' : '#333'
          }}>
            🎨 キャラクタープロンプト
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="AI Prompt Makerで生成したプロンプトを貼り付け"
            autoFocus
            style={{
              width: '100%',
              minHeight: '150px',
              padding: '12px',
              border: `1px solid ${isDarkMode ? '#555' : '#ccc'}`,
              borderRadius: '6px',
              background: isDarkMode ? '#404040' : 'white',
              color: isDarkMode ? '#fff' : '#333',
              fontSize: '12px',
              fontFamily: 'monospace',
              lineHeight: '1.5',
              resize: 'vertical'
            }}
          />
        </div>

        {/* 使い方ガイド */}
        <div style={{
          marginBottom: '20px',
          padding: '12px',
          background: isDarkMode ? '#404040' : '#f0f9ff',
          border: `1px solid ${isDarkMode ? '#555' : '#93c5fd'}`,
          borderRadius: '6px',
          fontSize: '11px',
          color: isDarkMode ? '#93c5fd' : '#1e40af'
        }}>
          <strong>📖 使い方:</strong>
          <ol style={{ marginTop: '6px', marginBottom: '6px', paddingLeft: '20px', lineHeight: '1.6' }}>
            <li>
              <a 
                href="https://aipromptmaker-free.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: isDarkMode ? '#60a5fa' : '#2563eb', fontWeight: 'bold', textDecoration: 'underline' }}
              >
                AI Prompt Maker Web版 ↗
              </a>
              {' '}でキャラプロンプト生成
            </li>
            <li>「プロンプトをコピー」でコピー</li>
            <li>ここに貼り付けて保存</li>
            <li>次回からキャラ選択で自動入力されます</li>
          </ol>
        </div>

        {/* ボタンエリア */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
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
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !prompt.trim()}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              background: !name.trim() || !prompt.trim() ? '#999' : '#10b981',
              color: 'white',
              cursor: !name.trim() || !prompt.trim() ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            💾 登録
          </button>
        </div>
      </div>
    </>
  );
};

