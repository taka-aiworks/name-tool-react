// src/components/UI/CharacterSettingsPanel.tsx - 大幅シンプル化版
import React, { useState, useEffect } from 'react';
import { CharacterSettings } from '../../types';

interface CharacterSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  characterType: string;
  currentName?: string;
  currentSettings?: CharacterSettings;
  onCharacterUpdate: (characterData: any) => void;  // 🔧 型を any に変更
  isDarkMode?: boolean;
}

const DEFAULT_NAMES: Record<string, string> = {
  hero: '主人公',
  heroine: 'ヒロイン',
  rival: 'ライバル',
  friend: '友人'
};

export const CharacterSettingsPanel: React.FC<CharacterSettingsPanelProps> = ({
  isOpen,
  onClose,
  characterType,
  currentName,
  currentSettings,
  onCharacterUpdate,
  isDarkMode = true
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
  const [basePrompt, setBasePrompt] = useState('');

  // 初期化
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 CharacterSettingsPanel初期化:', {
        characterType,
        currentSettings,
        currentName
      });

      const defaultName = currentSettings?.name || currentName || DEFAULT_NAMES[characterType] || 'キャラクター';
      const defaultRole = currentSettings?.role || DEFAULT_NAMES[characterType] || '主人公';
      
      setName(defaultName);
      setRole(defaultRole);
      setGender(currentSettings?.gender || 'female');
      
      // 🔧 basePrompt の取得方法を修正（型安全）
      let initialBasePrompt = '';
      
      // 1. currentSettings.basePrompt から取得
      if (currentSettings?.basePrompt) {
        initialBasePrompt = currentSettings.basePrompt;
        console.log('📥 basePrompt取得（currentSettings）:', initialBasePrompt.substring(0, 50));
      }
      // 2. currentSettings を any として扱って appearance をチェック
      else if ((currentSettings as any)?.appearance?.basePrompt) {
        initialBasePrompt = (currentSettings as any).appearance.basePrompt;
        console.log('📥 basePrompt取得（appearance）:', initialBasePrompt.substring(0, 50));
      }
      // 3. デフォルト値
      else {
        initialBasePrompt = '';
        console.log('📥 basePrompt取得（デフォルト）: 空文字');
      }
      
      setBasePrompt(initialBasePrompt);
      
      console.log('✅ CharacterSettingsPanel初期化完了:', {
        name: defaultName,
        role: defaultRole,
        gender: currentSettings?.gender || 'female',
        basePrompt: initialBasePrompt.substring(0, 30) + (initialBasePrompt.length > 30 ? '...' : '')
      });
    }
  }, [isOpen, currentSettings, currentName, characterType]);

  const handleSave = () => {
    console.log('💾 CharacterSettingsPanel保存開始:', {
      characterType,
      name,
      role,
      gender,
      basePrompt: basePrompt.substring(0, 50) + (basePrompt.length > 50 ? '...' : '')
    });

    // 🔧 App.tsx の handleCharacterSettingsUpdate が期待する形式
    const characterData = {
      name,
      role,
      appearance: {
        gender,
        basePrompt
      }
    };

    console.log('📤 送信データ:', characterData);
    
    onCharacterUpdate(characterData);  // ✅ 型エラー解消
    onClose();
    
    console.log('✅ CharacterSettingsPanel保存完了');
  };

  const handleReset = () => {
    const defaultName = DEFAULT_NAMES[characterType] || 'キャラクター';
    const defaultRole = DEFAULT_NAMES[characterType] || '主人公';
    
    setName(defaultName);
    setRole(defaultRole);
    setGender('female');
    setBasePrompt('');
  };

  if (!isOpen) return null;

  const modalStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  const panelStyle: React.CSSProperties = {
    background: isDarkMode ? '#2d2d2d' : 'white',
    color: isDarkMode ? '#ffffff' : '#333333',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '500px',
    width: '90%',
    border: `1px solid ${isDarkMode ? '#555555' : '#ddd'}`,
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '20px',
    padding: '16px',
    background: isDarkMode ? '#3d3d3d' : '#f9f9f9',
    borderRadius: '8px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: `1px solid ${isDarkMode ? '#555555' : '#ccc'}`,
    background: isDarkMode ? '#4d4d4d' : 'white',
    color: isDarkMode ? '#ffffff' : '#333333',
    fontSize: '14px',
    marginBottom: '12px',
    boxSizing: 'border-box' as const,
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '100px',
    resize: 'vertical' as const,
    fontFamily: 'monospace',
  };

  const buttonStyle = {
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>
          👥 キャラクター設定
        </h2>

        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>📝 基本情報</h3>
          
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
            キャラクター名：
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="キャラクター名"
            style={inputStyle}
          />

          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
            役割：
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="主人公、ヒロインなど"
            style={inputStyle}
          />

          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
            性別：
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
            style={inputStyle}
          >
            <option value="female">女性</option>
            <option value="male">男性</option>
            <option value="other">その他</option>
          </select>
        </div>

        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>🤖 プロンプト設定</h3>
          
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
            基本プロンプト：
          </label>
          <textarea
            value={basePrompt}
            onChange={(e) => setBasePrompt(e.target.value)}
            placeholder="プロンプトメーカーで作成した英語プロンプトをここに貼り付けてください&#10;例: 1girl, long black hair, school uniform, blue eyes, detailed face"
            style={textareaStyle}
          />
          <div style={{ fontSize: '12px', color: isDarkMode ? '#aaa' : '#666', marginTop: '4px' }}>
            💡 プロンプトメーカーで作成した英語プロンプトをそのまま貼り付けられます
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button
            onClick={handleReset}
            style={{
              ...buttonStyle,
              background: '#ff9800',
              color: 'white',
            }}
          >
            リセット
          </button>
          <button
            onClick={onClose}
            style={{
              ...buttonStyle,
              background: isDarkMode ? '#555555' : '#cccccc',
              color: isDarkMode ? '#ffffff' : '#333333',
            }}
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            style={{
              ...buttonStyle,
              background: '#4CAF50',
              color: 'white',
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};