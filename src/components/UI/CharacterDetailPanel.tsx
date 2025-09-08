// src/components/UI/CharacterDetailPanel.tsx
import React from "react";
import { Character } from "../../types";

interface CharacterDetailPanelProps {
  selectedCharacter: Character | null;
  onCharacterUpdate: (character: Character) => void;
}

const CharacterDetailPanel: React.FC<CharacterDetailPanelProps> = ({
  selectedCharacter,
  onCharacterUpdate,
}) => {
  if (!selectedCharacter) return null;

  const handleUpdate = (updates: Partial<Character>) => {
    onCharacterUpdate({ ...selectedCharacter, ...updates });
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "100px",
        right: "10px",
        background: "white",
        border: "2px solid #0066ff",
        borderRadius: "8px",
        padding: "15px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        minWidth: "200px",
        zIndex: 1000,
      }}
    >
      <h4 style={{ margin: "0 0 10px", color: "#0066ff" }}>
        🎭 {selectedCharacter.name} 設定
      </h4>

      {/* 表示タイプ */}
      <div style={{ marginBottom: "10px" }}>
        <label style={{ fontSize: "12px", fontWeight: "bold" }}>📷 表示タイプ:</label>
        <div style={{ display: "flex", gap: "5px", marginTop: "5px" }}>
          {[
            { value: "face", label: "顔アップ" },
            { value: "halfBody", label: "半身" },
            { value: "fullBody", label: "全身" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleUpdate({ viewType: option.value as any })}
              style={{
                padding: "4px 8px",
                fontSize: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                background: selectedCharacter.viewType === option.value ? "#0066ff" : "white",
                color: selectedCharacter.viewType === option.value ? "white" : "#333",
                cursor: "pointer",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 顔の角度 */}
      <div style={{ marginBottom: "10px" }}>
        <label style={{ fontSize: "12px", fontWeight: "bold" }}>🔄 顔の角度:</label>
        <div style={{ display: "flex", gap: "5px", marginTop: "5px" }}>
          {[
            { value: "left", label: "←" },
            { value: "front", label: "正面" },
            { value: "right", label: "→" },
            { value: "back", label: "後ろ" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleUpdate({ faceAngle: option.value as any })}
              style={{
                padding: "4px 8px",
                fontSize: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                background: selectedCharacter.faceAngle === option.value ? "#0066ff" : "white",
                color: selectedCharacter.faceAngle === option.value ? "white" : "#333",
                cursor: "pointer",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 視線方向 */}
      <div style={{ marginBottom: "10px" }}>
        <label style={{ fontSize: "12px", fontWeight: "bold" }}>👀 視線方向:</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "3px", marginTop: "5px" }}>
          {[
            { value: "up", label: "↑" },
            { value: "left", label: "←" },
            { value: "center", label: "●" },
            { value: "right", label: "→" },
            { value: "down", label: "↓" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleUpdate({ eyeDirection: option.value as any })}
              style={{
                padding: "4px",
                fontSize: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                background: selectedCharacter.eyeDirection === option.value ? "#0066ff" : "white",
                color: selectedCharacter.eyeDirection === option.value ? "white" : "#333",
                cursor: "pointer",
                gridColumn: option.value === "up" ? "2" : option.value === "down" ? "2" : "auto",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 移動モード */}
      <div style={{ marginBottom: "10px" }}>
        <label style={{ fontSize: "12px", fontWeight: "bold" }}>
          <input
            type="checkbox"
            checked={selectedCharacter.isGlobalPosition}
            onChange={(e) => handleUpdate({ isGlobalPosition: e.target.checked })}
            style={{ marginRight: "5px" }}
          />
          🆓 自由移動モード
        </label>
        <div style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}>
          パネル外への移動が可能
        </div>
      </div>

      {/* スケール調整 */}
      <div style={{ marginBottom: "10px" }}>
        <label style={{ fontSize: "12px", fontWeight: "bold" }}>📏 サイズ: {selectedCharacter.scale.toFixed(1)}x</label>
        <input
          type="range"
          min="0.3"
          max="3.0"
          step="0.1"
          value={selectedCharacter.scale}
          onChange={(e) => handleUpdate({ scale: parseFloat(e.target.value) })}
          style={{ width: "100%", marginTop: "5px" }}
        />
      </div>
    </div>
  );
};

export default CharacterDetailPanel;