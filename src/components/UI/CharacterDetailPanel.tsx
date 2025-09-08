// src/components/UI/CharacterDetailPanel.tsx (簡略化版)
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

  // スタイル定義
  const panelStyle = {
    position: "absolute" as const,
    top: "100px",
    right: "10px",
    background: isDarkMode ? "#2d2d2d" : "white",
    border: `2px solid ${isDarkMode ? "#555555" : "#0066ff"}`,
    borderRadius: "8px",
    padding: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    minWidth: "260px",
    maxWidth: "280px",
    zIndex: 1000,
    color: isDarkMode ? "#ffffff" : "#333333",
    maxHeight: "80vh",
    overflowY: "auto" as const,
  };

  const buttonStyle = (isActive: boolean, size: "small" | "medium" = "medium") => ({
    padding: size === "small" ? "6px 8px" : "8px 12px",
    fontSize: size === "small" ? "10px" : "11px",
    border: `1px solid ${isDarkMode ? "#555555" : "#ccc"}`,
    borderRadius: "4px",
    background: isActive 
      ? (isDarkMode ? "#ff8833" : "#0066ff")
      : (isDarkMode ? "#3d3d3d" : "white"),
    color: isActive 
      ? "white" 
      : (isDarkMode ? "#ffffff" : "#333"),
    cursor: "pointer",
    textAlign: "center" as const,
    transition: "all 0.2s ease",
    fontWeight: isActive ? "bold" : "normal",
    minHeight: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  const labelStyle = {
    fontSize: "12px",
    fontWeight: "bold" as const,
    color: isDarkMode ? "#ffffff" : "#333333",
    marginBottom: "8px",
    display: "block",
  };

  const sectionStyle = {
    marginBottom: "16px",
    padding: "12px",
    background: isDarkMode ? "#1a1a1a" : "#f8f9fa",
    borderRadius: "6px",
    border: `1px solid ${isDarkMode ? "#444444" : "#e9ecef"}`,
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
          fontSize: "15px",
        }}>
          🎭 {selectedCharacter.name}
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
              padding: "4px",
            }}
            title="閉じる"
          >
            ✕
          </button>
        )}
      </div>

      {/* 表示タイプ */}
      <div style={sectionStyle}>
        <label style={labelStyle}>📷 表示タイプ</label>
        <div style={{ display: "flex", gap: "6px" }}>
          {[
            { value: "face", label: "顔のみ" },
            { value: "halfBody", label: "半身" },
            { value: "fullBody", label: "全身" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleUpdate({ viewType: option.value as any })}
              style={buttonStyle(selectedCharacter.viewType === option.value)}
              title={option.label}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 体の向き（4方向に簡略化） */}
      <div style={sectionStyle}>
        <label style={labelStyle}>🔄 体の向き</label>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(3, 1fr)", 
          gap: "6px",
          maxWidth: "150px",
          margin: "0 auto",
        }}>
          {/* 上段 */}
          <div></div>
          <button
            onClick={() => handleUpdate({ 
              bodyDirection: "front" as any, 
              faceAngle: "front" as any 
            })}
            style={buttonStyle(selectedCharacter.bodyDirection === "front", "small")}
            title="正面"
          >
            正面
          </button>
          <div></div>
          
          {/* 中段 */}
          <button
            onClick={() => handleUpdate({ 
              bodyDirection: "left" as any, 
              faceAngle: "left" as any 
            })}
            style={buttonStyle(selectedCharacter.bodyDirection === "left", "small")}
            title="左向き"
          >
            左
          </button>
          <div style={{ 
            background: isDarkMode ? "#444444" : "#e9ecef", 
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            minHeight: "32px",
          }}>
            🧍
          </div>
          <button
            onClick={() => handleUpdate({ 
              bodyDirection: "right" as any, 
              faceAngle: "right" as any 
            })}
            style={buttonStyle(selectedCharacter.bodyDirection === "right", "small")}
            title="右向き"
          >
            右
          </button>
          
          {/* 下段 */}
          <div></div>
          <button
            onClick={() => handleUpdate({ 
              bodyDirection: "back" as any, 
              faceAngle: "back" as any 
            })}
            style={buttonStyle(selectedCharacter.bodyDirection === "back", "small")}
            title="後ろ向き"
          >
            後ろ
          </button>
          <div></div>
        </div>
      </div>

      {/* 表情（わかりやすい名前に変更） */}
      <div style={sectionStyle}>
        <label style={labelStyle}>😊 表情</label>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(2, 1fr)", 
          gap: "4px",
        }}>
          {[
            { value: "normal", label: "ふつう" },
            { value: "smile", label: "にっこり" },
            { value: "sad", label: "かなしい" },
            { value: "angry", label: "おこってる" },
            { value: "surprised", label: "びっくり" },
            { value: "embarrassed", label: "てれてる" },
            { value: "worried", label: "こまった" },
            { value: "sleepy", label: "ねむい" },
          ].map((expr) => (
            <button
              key={expr.value}
              onClick={() => handleUpdate({ faceExpression: expr.value as any })}
              style={buttonStyle(selectedCharacter.faceExpression === expr.value, "small")}
              title={expr.label}
            >
              {expr.label}
            </button>
          ))}
        </div>
      </div>

      {/* ポーズ（わかりやすい名前に変更） */}
      <div style={sectionStyle}>
        <label style={labelStyle}>🤸 ポーズ</label>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(2, 1fr)", 
          gap: "4px",
        }}>
          {[
            { value: "standing", label: "立ってる" },
            { value: "sitting", label: "座ってる" },
            { value: "walking", label: "歩いてる" },
            { value: "pointing", label: "指さし" },
            { value: "waving", label: "手を振る" },
            { value: "arms_crossed", label: "腕くみ" },
          ].map((pose) => (
            <button
              key={pose.value}
              onClick={() => handleUpdate({ bodyPose: pose.value as any })}
              style={buttonStyle(selectedCharacter.bodyPose === pose.value, "small")}
              title={pose.label}
            >
              {pose.label}
            </button>
          ))}
        </div>
      </div>

      {/* 視線方向（シンプルに） */}
      <div style={sectionStyle}>
        <label style={labelStyle}>👀 視線</label>
        <div style={{ 
          display: "flex", 
          justifyContent: "center",
          gap: "4px",
        }}>
          {[
            { value: "left", label: "←" },
            { value: "front", label: "●" },
            { value: "right", label: "→" },
            { value: "up", label: "↑" },
            { value: "down", label: "↓" },
          ].map((eye) => (
            <button
              key={eye.value}
              onClick={() => handleUpdate({ eyeDirection: eye.value as any })}
              style={{
                ...buttonStyle(selectedCharacter.eyeDirection === eye.value, "small"),
                minWidth: "32px",
              }}
              title={eye.value === "front" ? "正面" : eye.value}
            >
              {eye.label}
            </button>
          ))}
        </div>
      </div>

      {/* 設定 */}
      <div style={sectionStyle}>
        <label style={labelStyle}>⚙️ 設定</label>
        
        <label style={{ 
          fontSize: "11px", 
          fontWeight: "normal",
          color: isDarkMode ? "#ffffff" : "#333333",
          display: "flex",
          alignItems: "center",
          marginBottom: "10px",
          cursor: "pointer",
        }}>
          <input
            type="checkbox"
            checked={selectedCharacter.isGlobalPosition}
            onChange={(e) => handleUpdate({ isGlobalPosition: e.target.checked })}
            style={{ marginRight: "8px" }}
          />
          🆓 自由移動モード
        </label>
        
        <label style={{...labelStyle, marginBottom: "4px", fontSize: "11px"}}>
          📏 サイズ: {selectedCharacter.scale.toFixed(1)}x
        </label>
        <input
          type="range"
          min="0.5"
          max="4.0"
          step="0.1"
          value={selectedCharacter.scale}
          onChange={(e) => handleUpdate({ scale: parseFloat(e.target.value) })}
          style={{
            width: "100%",
            marginTop: "4px",
            background: isDarkMode ? "#3d3d3d" : "white",
          }}
        />
        <div style={{ 
          fontSize: "9px", 
          color: isDarkMode ? "#888888" : "#666", 
          textAlign: "center",
          marginTop: "2px",
        }}>
          0.5x ～ 4.0x
        </div>
      </div>

      {/* 削除ボタン */}
      {onCharacterDelete && (
        <div style={{ 
          borderTop: `1px solid ${isDarkMode ? "#555555" : "#eee"}`, 
          paddingTop: "12px",
        }}>
          <button
            onClick={handleDelete}
            style={{
              width: "100%",
              padding: "10px",
              background: "#ff4444",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "11px",
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
            🗑️ 削除
          </button>
        </div>
      )}
    </div>
  );
};

export default CharacterDetailPanel;