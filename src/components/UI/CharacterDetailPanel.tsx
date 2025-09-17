// src/components/UI/CharacterDetailPanel.tsx - フル装備版
import React, { useEffect, useState } from "react";
import { Character } from "../../types";

// 辞書型定義
declare global {
  interface Window {
    DEFAULT_SFW_DICT: {
      SFW: {
        expressions: Array<{ tag: string; label: string }>;
        pose_manga: Array<{ tag: string; label: string }>;
        gaze: Array<{ tag: string; label: string }>;
        eye_state: Array<{ tag: string; label: string }>;
        mouth_state: Array<{ tag: string; label: string }>;
        hand_gesture: Array<{ tag: string; label: string }>;
      };
    };
  }
}

interface CharacterDetailPanelProps {
  selectedCharacter: Character | null;
  onCharacterUpdate: (character: Character) => void;
  onCharacterDelete?: (character: Character) => void;
  onClose?: () => void;
  characterNames?: Record<string, string>;
}

// 検索可能プルダウンコンポーネント
interface SearchableSelectProps {
  label: string;
  value: string;
  options: Array<{ tag: string; label: string }>;
  onChange: (value: string) => void;
  placeholder: string;
  isDarkMode: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder,
  isDarkMode
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    const filtered = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.tag.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const getCurrentLabel = () => {
    const current = options.find(opt => opt.tag === value);
    return current ? `${current.tag} (${current.label})` : value || placeholder;
  };

  const containerStyle = {
    position: 'relative' as const,
    marginBottom: '8px',
  };

  const selectButtonStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: `1px solid ${isDarkMode ? "#555" : "#ccc"}`,
    background: isDarkMode ? "#3d3d3d" : "white",
    color: isDarkMode ? "#fff" : "#333",
    fontSize: '12px',
    textAlign: 'left' as const,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const dropdownStyle = {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    background: isDarkMode ? "#2d2d2d" : "white",
    border: `1px solid ${isDarkMode ? "#555" : "#ccc"}`,
    borderRadius: '6px',
    maxHeight: '200px',
    overflowY: 'auto' as const,
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  };

  const searchInputStyle = {
    width: '100%',
    padding: '8px',
    border: 'none',
    borderBottom: `1px solid ${isDarkMode ? "#555" : "#ccc"}`,
    background: 'transparent',
    color: isDarkMode ? "#fff" : "#333",
    fontSize: '12px',
    outline: 'none',
  };

  const optionStyle = (isHovered: boolean) => ({
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '12px',
    background: isHovered ? (isDarkMode ? "#4d4d4d" : "#f0f0f0") : 'transparent',
    color: isDarkMode ? "#fff" : "#333",
  });

  return (
    <div style={containerStyle}>
      <button
        style={selectButtonStyle}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {getCurrentLabel()}
        </span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div style={dropdownStyle}>
          <input
            type="text"
            placeholder={`${label}を検索...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
            autoFocus
          />
          <div>
            {filteredOptions.slice(0, 20).map((option) => (
              <div
                key={option.tag}
                style={optionStyle(false)}
                onClick={() => handleSelect(option.tag)}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background = isDarkMode ? "#4d4d4d" : "#f0f0f0";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = 'transparent';
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{option.label}</div>
                <div style={{ fontSize: '10px', opacity: 0.7 }}>{option.tag}</div>
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div style={{ padding: '12px', textAlign: 'center', opacity: 0.5 }}>
                該当する項目が見つかりません
              </div>
            )}
            {filteredOptions.length > 20 && (
              <div style={{ padding: '8px', textAlign: 'center', fontSize: '11px', opacity: 0.7 }}>
                さらに絞り込んでください...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CharacterDetailPanel: React.FC<CharacterDetailPanelProps> = ({
  selectedCharacter,
  onCharacterUpdate,
  onCharacterDelete,
  onClose,
  characterNames = {}
}) => {
  const [dictData, setDictData] = useState<{
    expressions: Array<{ tag: string; label: string }>;
    poses: Array<{ tag: string; label: string }>;
    gazes: Array<{ tag: string; label: string }>;
    eyeStates: Array<{ tag: string; label: string }>;
    mouthStates: Array<{ tag: string; label: string }>;
    handGestures: Array<{ tag: string; label: string }>;
  }>({
    expressions: [],
    poses: [],
    gazes: [],
    eyeStates: [],
    mouthStates: [],
    handGestures: []
  });

  // 辞書データ読み込み
  useEffect(() => {
    if (typeof window !== 'undefined' && window.DEFAULT_SFW_DICT) {
      const dict = window.DEFAULT_SFW_DICT.SFW;
      setDictData({
        expressions: dict.expressions || [],
        poses: dict.pose_manga || [],
        gazes: dict.gaze || [],
        eyeStates: dict.eye_state || [],
        mouthStates: dict.mouth_state || [],
        handGestures: dict.hand_gesture || []
      });
    } else {
      // フォールバック辞書
      setDictData({
        expressions: [
          { tag: "smiling", label: "笑顔" },
          { tag: "sad", label: "悲しい" },
          { tag: "angry", label: "怒り" },
          { tag: "surprised", label: "驚き" },
          { tag: "neutral_expression", label: "普通" }
        ],
        poses: [
          { tag: "standing", label: "立ち" },
          { tag: "sitting", label: "座り" },
          { tag: "walking", label: "歩く" },
          { tag: "running", label: "走る" },
          { tag: "arms_crossed", label: "腕組み" }
        ],
        gazes: [
          { tag: "at_viewer", label: "正面" },
          { tag: "to_side", label: "横向き" },
          { tag: "away", label: "そっぽ向く" },
          { tag: "down", label: "下向き" }
        ],
        eyeStates: [
          { tag: "eyes_open", label: "目を開ける" },
          { tag: "eyes_closed", label: "目を閉じる" },
          { tag: "wink_left", label: "左ウインク" },
          { tag: "wink_right", label: "右ウインク" }
        ],
        mouthStates: [
          { tag: "mouth_closed", label: "口を閉じる" },
          { tag: "open_mouth", label: "口を開ける" },
          { tag: "slight_smile", label: "微笑み" },
          { tag: "grin", label: "歯を見せて笑う" }
        ],
        handGestures: [
          { tag: "peace_sign", label: "ピースサイン" },
          { tag: "pointing", label: "指差し" },
          { tag: "waving", label: "手を振る" },
          { tag: "thumbs_up", label: "サムズアップ" }
        ]
      });
    }
  }, []);

  if (!selectedCharacter) return null;

  const isDarkMode = document.documentElement.getAttribute("data-theme") === "dark";

  const getCharacterDisplayName = (character: Character) => {
    return characterNames[character.type] || character.name || 'キャラクター';
  };

  const displayName = getCharacterDisplayName(selectedCharacter);

  const handleUpdate = (updates: Partial<Character>) => {
    onCharacterUpdate({ ...selectedCharacter, ...updates });
  };

  const handleDelete = () => {
    if (window.confirm(`「${displayName}」を削除しますか？`)) {
      if (onCharacterDelete) {
        onCharacterDelete(selectedCharacter);
      }
    }
  };

  // スタイル定義
  const panelStyle = {
    position: "absolute" as const,
    top: "80px",
    right: "10px",
    background: isDarkMode ? "#2d2d2d" : "white",
    border: `2px solid ${isDarkMode ? "#555555" : "#0066ff"}`,
    borderRadius: "12px",
    padding: "18px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
    minWidth: "340px",
    maxWidth: "400px",
    zIndex: 1000,
    color: isDarkMode ? "#ffffff" : "#333333",
    maxHeight: "90vh",
    overflowY: "auto" as const,
  };

  const buttonStyle = (isActive: boolean) => ({
    padding: "8px 12px",
    fontSize: "12px",
    border: "2px solid",
    borderRadius: "6px",
    cursor: "pointer",
    textAlign: "center" as const,
    transition: "all 0.2s ease",
    fontWeight: isActive ? "bold" : "normal",
    minHeight: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    background: isActive 
      ? (isDarkMode ? "#ff8833" : "#0066ff")
      : (isDarkMode ? "#3d3d3d" : "white"),
    borderColor: isActive 
      ? (isDarkMode ? "#ff8833" : "#0066ff")
      : (isDarkMode ? "#666666" : "#cccccc"),
    color: isActive 
      ? "white" 
      : (isDarkMode ? "#ffffff" : "#333333"),
    transform: isActive ? "scale(1.02)" : "scale(1)",
  });

  const sectionStyle = {
    marginBottom: "16px",
    padding: "12px",
    background: isDarkMode ? "#1a1a1a" : "#f8f9fa",
    borderRadius: "8px",
    border: `1px solid ${isDarkMode ? "#444444" : "#e9ecef"}`,
  };

  const labelStyle = {
    fontSize: "13px",
    fontWeight: "bold" as const,
    color: isDarkMode ? "#ffffff" : "#333333",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  return (
    <div style={panelStyle}>
      {/* ヘッダー */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "16px",
        borderBottom: `2px solid ${isDarkMode ? "#ff8833" : "#0066ff"}`,
        paddingBottom: "8px",
      }}>
        <h4 style={{ 
          margin: "0", 
          color: isDarkMode ? "#ff8833" : "#0066ff",
          fontSize: "16px",
          fontWeight: "bold",
        }}>
          🎭 {displayName}
        </h4>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
              color: isDarkMode ? "#cccccc" : "#666",
              padding: "4px",
              borderRadius: "4px",
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* 📷 表示タイプ（ラジオボタン）*/}
      <div style={sectionStyle}>
        <label style={labelStyle}>📷 表示タイプ</label>
        <div style={{ display: "flex", gap: "6px" }}>
          {[
            { value: "face", label: "顔のみ", emoji: "👤" },
            { value: "upper_body", label: "上半身", emoji: "👔" },
            { value: "full_body", label: "全身", emoji: "🧍" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleUpdate({ viewType: option.value as any })}
              style={buttonStyle(selectedCharacter.viewType === option.value)}
            >
              <span>{option.emoji}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 🎭 詳細設定（プルダウン）*/}
      <div style={sectionStyle}>
        <label style={labelStyle}>🎭 詳細設定</label>
        
        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '11px', marginBottom: '4px', display: 'block' }}>😊 表情</label>
          <SearchableSelect
            label="表情"
            value={selectedCharacter.expression || ''}
            options={dictData.expressions}
            onChange={(value) => handleUpdate({ expression: value })}
            placeholder="表情を選択..."
            isDarkMode={isDarkMode}
          />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '11px', marginBottom: '4px', display: 'block' }}>🤸 動作・ポーズ</label>
          <SearchableSelect
            label="動作・ポーズ"
            value={selectedCharacter.action || ''}
            options={dictData.poses}
            onChange={(value) => handleUpdate({ action: value })}
            placeholder="動作を選択..."
            isDarkMode={isDarkMode}
          />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '11px', marginBottom: '4px', display: 'block' }}>🔄 体の向き</label>
          <SearchableSelect
            label="体の向き"
            value={selectedCharacter.facing || ''}
            options={dictData.gazes}
            onChange={(value) => handleUpdate({ facing: value })}
            placeholder="向きを選択..."
            isDarkMode={isDarkMode}
          />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '11px', marginBottom: '4px', display: 'block' }}>👀 目の状態</label>
          <SearchableSelect
            label="目の状態"
            value={(selectedCharacter as any).eyeState || ''}
            options={dictData.eyeStates}
            onChange={(value) => handleUpdate({ eyeState: value } as any)}
            placeholder="目の状態を選択..."
            isDarkMode={isDarkMode}
          />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '11px', marginBottom: '4px', display: 'block' }}>👄 口の状態</label>
          <SearchableSelect
            label="口の状態"
            value={(selectedCharacter as any).mouthState || ''}
            options={dictData.mouthStates}
            onChange={(value) => handleUpdate({ mouthState: value } as any)}
            placeholder="口の状態を選択..."
            isDarkMode={isDarkMode}
          />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '11px', marginBottom: '4px', display: 'block' }}>✋ 手の動作</label>
          <SearchableSelect
            label="手の動作"
            value={(selectedCharacter as any).handGesture || ''}
            options={dictData.handGestures}
            onChange={(value) => handleUpdate({ handGesture: value } as any)}
            placeholder="手の動作を選択..."
            isDarkMode={isDarkMode}
          />
        </div>
      </div>

      {/* 📏 サイズ設定 */}
      <div style={sectionStyle}>
        <label style={labelStyle}>📏 サイズ: {selectedCharacter.scale.toFixed(1)}倍</label>
        <input
          type="range"
          min="0.5"
          max="3.0"
          step="0.1"
          value={selectedCharacter.scale}
          onChange={(e) => handleUpdate({ scale: parseFloat(e.target.value) })}
          style={{
            width: "100%",
            height: "4px",
            background: isDarkMode ? "#3d3d3d" : "#e9ecef",
            borderRadius: "2px",
            outline: "none",
            cursor: "pointer",
          }}
        />
        <div style={{ 
          fontSize: "10px", 
          color: isDarkMode ? "#888" : "#666", 
          textAlign: "center",
          marginTop: "4px",
          display: "flex",
          justifyContent: "space-between",
        }}>
          <span>0.5倍</span>
          <span>標準</span>
          <span>3.0倍</span>
        </div>
      </div>

      {/* 📋 現在の設定 */}
      <div style={{
        ...sectionStyle,
        background: isDarkMode ? "#0d1117" : "#f0f8ff",
        border: `1px solid ${isDarkMode ? "#30363d" : "#b6e3ff"}`,
      }}>
        <label style={labelStyle}>📋 現在の設定</label>
        <div style={{ fontSize: "10px", color: isDarkMode ? "#8b949e" : "#666" }}>
          <div>表示: {selectedCharacter.viewType === "face" ? "顔のみ" : selectedCharacter.viewType === "upper_body" ? "上半身" : "全身"}</div>
          <div>表情: {selectedCharacter.expression || '未設定'}</div>
          <div>動作: {selectedCharacter.action || '未設定'}</div>
          <div>向き: {selectedCharacter.facing || '未設定'}</div>
          <div>目: {(selectedCharacter as any).eyeState || '未設定'}</div>
          <div>口: {(selectedCharacter as any).mouthState || '未設定'}</div>
          <div>手: {(selectedCharacter as any).handGesture || '未設定'}</div>
        </div>
      </div>

      {/* 🗑️ 削除ボタン */}
      {onCharacterDelete && (
        <div style={{ 
          borderTop: `1px solid ${isDarkMode ? "#555" : "#eee"}`, 
          paddingTop: "12px",
        }}>
          <button
            onClick={handleDelete}
            style={{
              width: "100%",
              padding: "8px",
              background: "#ff4444",
              color: "white",
              border: "2px solid #ff2222",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            🗑️ 削除
          </button>
        </div>
      )}
    </div>
  );
};

export default CharacterDetailPanel;