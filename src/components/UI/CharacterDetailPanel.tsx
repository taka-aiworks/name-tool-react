// src/components/UI/CharacterDetailPanel.tsx (レイアウト改善&斜め角度追加版)
import React from "react";
import { Character } from "../../types";

interface CharacterDetailPanelProps {
  selectedCharacter: Character | null;
  onCharacterUpdate: (character: Character) => void;
  onCharacterDelete?: (character: Character) => void;
  onClose?: () => void;
}

const CharacterDetailPanel: React.FC<CharacterDetailPanelProps> = ({
  selectedCharacter,
  onCharacterUpdate,
  onCharacterDelete,
  onClose,
}) => {
  if (!selectedCharacter) return null;

  // ダークモード判定
  const isDarkMode = document.documentElement.getAttribute("data-theme") === "dark";

  const handleUpdate = (updates: Partial<Character>) => {
    onCharacterUpdate({ ...selectedCharacter, ...updates });
  };

  const handleDelete = () => {
    if (window.confirm(`「${selectedCharacter.name}」を削除しますか？`)) {
      if (onCharacterDelete) {
        onCharacterDelete(selectedCharacter);
      }
    }
  };

  // ダークモード対応のスタイル
  const panelStyle = {
    position: "absolute" as const,
    top: "100px",
    right: "10px",
    background: isDarkMode ? "#2d2d2d" : "white",
    border: `2px solid ${isDarkMode ? "#555555" : "#0066ff"}`,
    borderRadius: "8px",
    padding: "15px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    minWidth: "220px",
    zIndex: 1000,
    color: isDarkMode ? "#ffffff" : "#333333",
  };

  const buttonStyle = (isActive: boolean) => ({
    padding: "6px 10px",
    fontSize: "11px",
    border: `1px solid ${isDarkMode ? "#555555" : "#ccc"}`,
    borderRadius: "4px",
    background: isActive 
      ? (isDarkMode ? "#ff8833" : "#0066ff")
      : (isDarkMode ? "#3d3d3d" : "white"),
    color: isActive 
      ? "white" 
      : (isDarkMode ? "#ffffff" : "#333"),
    cursor: "pointer",
    minWidth: "32px",
    textAlign: "center" as const,
    transition: "all 0.2s ease",
  });

  const labelStyle = {
    fontSize: "12px",
    fontWeight: "bold" as const,
    color: isDarkMode ? "#ffffff" : "#333333",
    marginBottom: "6px",
    display: "block",
  };

  const inputStyle = {
    width: "100%",
    marginTop: "5px",
    background: isDarkMode ? "#3d3d3d" : "white",
    border: `1px solid ${isDarkMode ? "#555555" : "#ccc"}`,
    color: isDarkMode ? "#ffffff" : "#333333",
  };

  return (
    <div style={panelStyle}>
      {/* ヘッダー */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "15px" 
      }}>
        <h4 style={{ 
          margin: "0", 
          color: isDarkMode ? "#ff8833" : "#0066ff" 
        }}>
          🎭 {selectedCharacter.name} 設定
        </h4>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "16px",
              cursor: "pointer",
              color: isDarkMode ? "#cccccc" : "#666",
            }}
            title="閉じる"
          >
            ✕
          </button>
        )}
      </div>

      {/* 表示タイプ */}
      <div style={{ marginBottom: "12px" }}>
        <label style={labelStyle}>📷 表示タイプ:</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px" }}>
          {[
            { value: "face", label: "顔" },
            { value: "halfBody", label: "半身" },
            { value: "fullBody", label: "全身" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleUpdate({ viewType: option.value as any })}
              style={buttonStyle(selectedCharacter.viewType === option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 顔の角度 - 斜め方向追加 */}
      <div style={{ marginBottom: "12px" }}>
        <label style={labelStyle}>🔄 顔の角度:</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "3px" }}>
          {[
            { value: "leftDiagonal", label: "↖" },
            { value: "left", label: "←" },
            { value: "leftBack", label: "↙" },
            { value: "front", label: "正面" },
            { value: "back", label: "後ろ" },
            { value: "rightDiagonal", label: "↗" },
            { value: "right", label: "→" },
            { value: "rightBack", label: "↘" },
          ].map((option, index) => (
            <button
              key={option.value}
              onClick={() => handleUpdate({ faceAngle: option.value as any })}
              style={{
                ...buttonStyle(selectedCharacter.faceAngle === option.value),
                gridColumn: index === 3 ? "1 / 3" : index === 4 ? "3" : "auto",
                fontSize: option.value === "front" || option.value === "back" ? "9px" : "11px",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 視線方向 - 整理されたレイアウト */}
      <div style={{ marginBottom: "12px" }}>
        <label style={labelStyle}>👀 視線方向:</label>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(3, 1fr)", 
          gap: "3px",
          maxWidth: "120px",
          margin: "0 auto"
        }}>
          <div></div>
          <button
            onClick={() => handleUpdate({ eyeDirection: "up" })}
            style={buttonStyle(selectedCharacter.eyeDirection === "up")}
          >
            ↑
          </button>
          <div></div>
          
          <button
            onClick={() => handleUpdate({ eyeDirection: "left" })}
            style={buttonStyle(selectedCharacter.eyeDirection === "left")}
          >
            ←
          </button>
          <button
            onClick={() => handleUpdate({ eyeDirection: "center" })}
            style={buttonStyle(selectedCharacter.eyeDirection === "center")}
          >
            ●
          </button>
          <button
            onClick={() => handleUpdate({ eyeDirection: "right" })}
            style={buttonStyle(selectedCharacter.eyeDirection === "right")}
          >
            →
          </button>
          
          <div></div>
          <button
            onClick={() => handleUpdate({ eyeDirection: "down" })}
            style={buttonStyle(selectedCharacter.eyeDirection === "down")}
          >
            ↓
          </button>
          <div></div>
        </div>
      </div>

      {/* 移動モード */}
      <div style={{ marginBottom: "12px" }}>
        <label style={{ 
          fontSize: "12px", 
          fontWeight: "bold",
          color: isDarkMode ? "#ffffff" : "#333333"
        }}>
          <input
            type="checkbox"
            checked={selectedCharacter.isGlobalPosition}
            onChange={(e) => handleUpdate({ isGlobalPosition: e.target.checked })}
            style={{ marginRight: "6px" }}
          />
          🆓 自由移動モード
        </label>
        <div style={{ 
          fontSize: "10px", 
          color: isDarkMode ? "#888888" : "#666", 
          marginTop: "3px",
          marginLeft: "20px"
        }}>
          パネル外への移動が可能
        </div>
      </div>

      {/* スケール調整 */}
      <div style={{ marginBottom: "15px" }}>
        <label style={labelStyle}>📏 サイズ: {selectedCharacter.scale.toFixed(1)}x</label>
        <input
          type="range"
          min="0.3"
          max="10.0"
          step="0.1"
          value={selectedCharacter.scale}
          onChange={(e) => handleUpdate({ scale: parseFloat(e.target.value) })}
          style={inputStyle}
        />
      </div>

      {/* 削除ボタン */}
      {onCharacterDelete && (
        <div style={{ 
          borderTop: `1px solid ${isDarkMode ? "#555555" : "#eee"}`, 
          paddingTop: "12px" 
        }}>
          <button
            onClick={handleDelete}
            style={{
              width: "100%",
              padding: "10px 12px",
              background: "#ff4444",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = "#ff2222";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = "#ff4444";
            }}
            title="このキャラクターを削除"
          >
            🗑️ キャラクターを削除
          </button>
        </div>
      )}
    </div>
  );
};

export default CharacterDetailPanel;