// src/components/UI/CharacterSettingsPanel.tsx - 名前入力修正版
import React, { useState, useEffect } from 'react';

// キャラクター見た目設定の型定義
export interface CharacterAppearance {
  gender: 'male' | 'female' | 'other';
  hairColor: 'black' | 'brown' | 'blonde' | 'red' | 'blue' | 'green' | 'white' | 'silver';
  hairStyle: 'short' | 'medium' | 'long' | 'ponytail' | 'twintails' | 'bun';
  eyeColor: 'brown' | 'blue' | 'green' | 'gray' | 'black' | 'red' | 'purple';
  skinTone: 'light' | 'medium' | 'dark' | 'tan';
  clothing: 'school' | 'casual' | 'formal' | 'sports' | 'traditional' | 'fantasy';
  clothingColor: 'blue' | 'red' | 'green' | 'black' | 'white' | 'pink' | 'purple';
  accessories: string; // 自由記述
}

// 拡張Character型（既存のCharacterに追加）
export interface ExtendedCharacter {
  id: string;
  name: string;
  displayName: string;
  role: string;
  type: string;
  appearance: CharacterAppearance;
  // 既存のCharacterプロパティも含む
  x: number;
  y: number;
  scale: number;
  panelId: number;
  direction: string;
  gaze: string;
  expression: string;
  displayType: string;
  isGlobalPosition: boolean;
}

interface CharacterSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  characterType: string;
  currentName?: string;
  currentSettings?: any;
  onCharacterUpdate: (characterData: Partial<ExtendedCharacter>) => void;
  isDarkMode?: boolean;
}

// デフォルト設定
const DEFAULT_APPEARANCES: Record<string, CharacterAppearance> = {
  hero: {
    gender: 'male',
    hairColor: 'brown',
    hairStyle: 'short',
    eyeColor: 'brown',
    skinTone: 'light',
    clothing: 'school',
    clothingColor: 'blue',
    accessories: ''
  },
  heroine: {
    gender: 'female',
    hairColor: 'black',
    hairStyle: 'long',
    eyeColor: 'brown',
    skinTone: 'light',
    clothing: 'school',
    clothingColor: 'blue',
    accessories: 'リボン'
  },
  rival: {
    gender: 'male',
    hairColor: 'blonde',
    hairStyle: 'medium',
    eyeColor: 'blue',
    skinTone: 'light',
    clothing: 'casual',
    clothingColor: 'black',
    accessories: ''
  },
  friend: {
    gender: 'female',
    hairColor: 'red',
    hairStyle: 'ponytail',
    eyeColor: 'green',
    skinTone: 'light',
    clothing: 'casual',
    clothingColor: 'pink',
    accessories: 'メガネ'
  }
};

const CHARACTER_NAMES: Record<string, string> = {
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
  const [characterName, setCharacterName] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [appearance, setAppearance] = useState<CharacterAppearance>(
    DEFAULT_APPEARANCES[characterType] || DEFAULT_APPEARANCES.hero
  );
  // 🔧 初期化完了フラグを追加
  const [isInitialized, setIsInitialized] = useState(false);

  // 🔧 修正: 初期化処理を一度だけ実行
  useEffect(() => {
    if (isOpen && !isInitialized) {
      console.log(`🔧 初期化開始: ${characterType}`, { currentName, currentSettings });
      
      // 現在の名前を使用、なければデフォルト
      const defaultName = currentName || CHARACTER_NAMES[characterType] || 'キャラクター';
      setCharacterName(defaultName);
      
      // 現在の役割を使用、なければデフォルト  
      const defaultRole = currentSettings?.role || CHARACTER_NAMES[characterType] || 'キャラクター';
      setCustomRole(defaultRole);
      
      // 現在の外見を使用、なければデフォルト
      const defaultAppearance = currentSettings?.appearance || DEFAULT_APPEARANCES[characterType] || DEFAULT_APPEARANCES.hero;
      setAppearance(defaultAppearance);
      
      setIsInitialized(true);
      console.log(`✅ 初期化完了: ${defaultName}`);
    }
    
    // パネルが閉じられた時に初期化フラグをリセット
    if (!isOpen) {
      setIsInitialized(false);
    }
  }, [isOpen, characterType, currentName, currentSettings, isInitialized]);

  // 性別変更時の自動調整
  const handleGenderChange = (gender: 'male' | 'female' | 'other') => {
    const newAppearance = { ...appearance, gender };
    
    // 性別に応じてデフォルト値を調整
    if (gender === 'male') {
      newAppearance.hairStyle = 'short';
      newAppearance.clothing = 'school';
    } else if (gender === 'female') {
      if (newAppearance.hairStyle === 'short') {
        newAppearance.hairStyle = 'long';
      }
      newAppearance.clothing = 'school';
    }
    
    setAppearance(newAppearance);
  };

  // 保存処理
  const handleSave = () => {
    const characterData: Partial<ExtendedCharacter> = {
      name: characterName,
      displayName: characterName,
      role: customRole,
      appearance: appearance
    };
    
    console.log(`💾 保存データ:`, characterData);
    onCharacterUpdate(characterData);
    onClose();
  };

  // リセット処理 - デフォルトに戻す
  const handleReset = () => {
    const defaultName = CHARACTER_NAMES[characterType] || 'キャラクター';
    const defaultRole = CHARACTER_NAMES[characterType] || 'キャラクター';
    const defaultAppearance = DEFAULT_APPEARANCES[characterType] || DEFAULT_APPEARANCES.hero;
    
    setCharacterName(defaultName);
    setCustomRole(defaultRole);
    setAppearance(defaultAppearance);
    console.log(`🔄 リセット完了: ${defaultName}`);
  };

  // プロンプト生成
  const generatePrompt = () => {
    const { gender, hairColor, hairStyle, eyeColor, skinTone, clothing, clothingColor, accessories } = appearance;
    
    const parts = [
      `${gender === 'male' ? 'young man' : gender === 'female' ? 'young woman' : 'person'}`,
      `${hairColor} hair`,
      `${hairStyle} hair`,
      `${eyeColor} eyes`,
      `${skinTone} skin`,
      `${clothing} uniform` || 'clothing',
      `${clothingColor} clothing`
    ];
    
    if (accessories.trim()) {
      parts.push(accessories);
    }
    
    return parts.join(', ');
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
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    border: `1px solid ${isDarkMode ? '#555555' : '#ddd'}`,
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '20px',
    padding: '16px',
    background: isDarkMode ? '#3d3d3d' : '#f9f9f9',
    borderRadius: '8px',
    border: `1px solid ${isDarkMode ? '#555555' : '#eee'}`,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: `1px solid ${isDarkMode ? '#555555' : '#ccc'}`,
    background: isDarkMode ? '#4d4d4d' : 'white',
    color: isDarkMode ? '#ffffff' : '#333333',
    fontSize: '14px',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: '#4CAF50',
    color: 'white',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: isDarkMode ? '#555555' : '#cccccc',
    color: isDarkMode ? '#ffffff' : '#333333',
  };

  const resetButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: '#ff9800',
    color: 'white',
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>
          👥 キャラクター設定 - {currentName || CHARACTER_NAMES[characterType]}
        </h2>

        {/* 現在の設定状態表示 */}
        <div style={{
          background: isDarkMode ? '#1a1a1a' : '#f0f0f0',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '16px',
          fontSize: '12px',
          color: isDarkMode ? '#aaa' : '#666'
        }}>
          <strong>現在の設定:</strong> {currentName || CHARACTER_NAMES[characterType]} ({currentSettings?.role || CHARACTER_NAMES[characterType]})
          {currentSettings?.appearance && ' | 見た目設定済み'}
        </div>

        {/* 🔧 デバッグ情報（開発中のみ表示） */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            background: '#1a3d5c',
            padding: '8px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '11px',
            color: '#88ccff'
          }}>
            <strong>🔧 デバッグ:</strong> type={characterType}, initialized={isInitialized.toString()}, currentName={characterName}
          </div>
        )}

        {/* 基本情報 */}
        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>📝 基本情報</h3>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
              キャラクター名：
            </label>
            <input
              type="text"
              value={characterName}
              onChange={(e) => {
                console.log(`📝 名前変更: ${e.target.value}`);
                setCharacterName(e.target.value);
              }}
              placeholder="キャラクター名を入力"
              style={inputStyle}
              // 🔧 追加: オートフォーカスを防止
              autoComplete="off"
            />
            <div style={{ fontSize: '11px', color: isDarkMode ? '#aaa' : '#666', marginTop: '4px' }}>
              この名前がツール全体で表示されます
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
              役割・設定：
            </label>
            <input
              type="text"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder="主人公、ヒロイン、など"
              style={inputStyle}
              autoComplete="off"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
              性別：
            </label>
            <select
              value={appearance.gender}
              onChange={(e) => handleGenderChange(e.target.value as 'male' | 'female' | 'other')}
              style={selectStyle}
            >
              <option value="male">男性</option>
              <option value="female">女性</option>
              <option value="other">その他</option>
            </select>
          </div>
        </div>

        {/* 外見設定 */}
        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>🎨 外見設定</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                髪色：
              </label>
              <select
                value={appearance.hairColor}
                onChange={(e) => setAppearance({...appearance, hairColor: e.target.value as any})}
                style={selectStyle}
              >
                <option value="black">黒</option>
                <option value="brown">茶色</option>
                <option value="blonde">金髪</option>
                <option value="red">赤</option>
                <option value="blue">青</option>
                <option value="green">緑</option>
                <option value="white">白</option>
                <option value="silver">銀</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                髪型：
              </label>
              <select
                value={appearance.hairStyle}
                onChange={(e) => setAppearance({...appearance, hairStyle: e.target.value as any})}
                style={selectStyle}
              >
                <option value="short">ショート</option>
                <option value="medium">ミディアム</option>
                <option value="long">ロング</option>
                <option value="ponytail">ポニーテール</option>
                <option value="twintails">ツインテール</option>
                <option value="bun">お団子</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                瞳の色：
              </label>
              <select
                value={appearance.eyeColor}
                onChange={(e) => setAppearance({...appearance, eyeColor: e.target.value as any})}
                style={selectStyle}
              >
                <option value="brown">茶色</option>
                <option value="blue">青</option>
                <option value="green">緑</option>
                <option value="gray">灰色</option>
                <option value="black">黒</option>
                <option value="red">赤</option>
                <option value="purple">紫</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                肌の色：
              </label>
              <select
                value={appearance.skinTone}
                onChange={(e) => setAppearance({...appearance, skinTone: e.target.value as any})}
                style={selectStyle}
              >
                <option value="light">明るい</option>
                <option value="medium">普通</option>
                <option value="tan">日焼け</option>
                <option value="dark">暗い</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                服装：
              </label>
              <select
                value={appearance.clothing}
                onChange={(e) => setAppearance({...appearance, clothing: e.target.value as any})}
                style={selectStyle}
              >
                <option value="school">学生服</option>
                <option value="casual">カジュアル</option>
                <option value="formal">フォーマル</option>
                <option value="sports">スポーツ</option>
                <option value="traditional">和服</option>
                <option value="fantasy">ファンタジー</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                服の色：
              </label>
              <select
                value={appearance.clothingColor}
                onChange={(e) => setAppearance({...appearance, clothingColor: e.target.value as any})}
                style={selectStyle}
              >
                <option value="blue">青</option>
                <option value="red">赤</option>
                <option value="green">緑</option>
                <option value="black">黒</option>
                <option value="white">白</option>
                <option value="pink">ピンク</option>
                <option value="purple">紫</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
              アクセサリー・特徴：
            </label>
            <input
              type="text"
              value={appearance.accessories}
              onChange={(e) => setAppearance({...appearance, accessories: e.target.value})}
              placeholder="メガネ、リボン、帽子など"
              style={inputStyle}
              autoComplete="off"
            />
          </div>
        </div>

        {/* プロンプトプレビュー */}
        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>🤖 AI画像生成プロンプト</h3>
          <div style={{
            background: isDarkMode ? '#1a1a1a' : '#f0f0f0',
            padding: '12px',
            borderRadius: '6px',
            border: `1px solid ${isDarkMode ? '#444444' : '#ddd'}`,
            fontSize: '13px',
            fontFamily: 'monospace',
            lineHeight: '1.4',
          }}>
            {generatePrompt()}
          </div>
          <div style={{ fontSize: '12px', color: isDarkMode ? '#aaa' : '#666', marginTop: '8px' }}>
            💡 この設定でAI画像生成用のプロンプトが自動生成されます
          </div>
        </div>

        {/* ボタン */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button
            onClick={handleReset}
            style={resetButtonStyle}
            title="デフォルト設定に戻す"
          >
            リセット
          </button>
          <button
            onClick={onClose}
            style={secondaryButtonStyle}
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            style={primaryButtonStyle}
          >
            保存して適用
          </button>
        </div>
      </div>
    </div>
  );
};