// src/components/UI/CharacterDetailPanel.tsx (動的名前表示版)
import React from "react";
import { Character } from "../../types";

interface CharacterDetailPanelProps {
  selectedCharacter: Character | null;
  onCharacterUpdate: (character: Character) => void;
  onCharacterDelete?: (character: Character) => void;
  onClose?: () => void;
  // 🆕 キャラクター名前管理を追加
  characterNames?: Record<string, string>;
}

const CharacterDetailPanel: React.FC<CharacterDetailPanelProps> = ({
  selectedCharacter,
  onCharacterUpdate,
  onCharacterDelete,
  onClose,
  characterNames = {} // 🆕 デフォルト値を設定
}) => {
  if (!selectedCharacter) return null;

  const isDarkMode = document.documentElement.getAttribute("data-theme") === "dark";

  // 🆕 動的名前取得 - characterNames から取得、なければ既存の名前
  const getCharacterDisplayName = (character: Character) => {
    return characterNames[character.type] || character.name || character.displayName || 'キャラクター';
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
    top: "100px",
    right: "10px",
    background: isDarkMode ? "#2d2d2d" : "white",
    border: `2px solid ${isDarkMode ? "#555555" : "#0066ff"}`,
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
    minWidth: "300px",
    maxWidth: "320px",
    zIndex: 1000,
    color: isDarkMode ? "#ffffff" : "#333333",
    maxHeight: "85vh",
    overflowY: "auto" as const,
  };

  const buttonStyle = (isActive: boolean, variant: "primary" | "secondary" | "small" = "primary") => {
    const baseStyle = {
      padding: variant === "small" ? "8px 10px" : "10px 14px",
      fontSize: variant === "small" ? "11px" : "12px",
      border: "2px solid",
      borderRadius: "8px",
      cursor: "pointer",
      textAlign: "center" as const,
      transition: "all 0.3s ease",
      fontWeight: isActive ? "bold" : "normal",
      minHeight: variant === "small" ? "36px" : "42px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "4px",
    };

    if (isActive) {
      return {
        ...baseStyle,
        background: isDarkMode ? "#ff8833" : "#0066ff",
        borderColor: isDarkMode ? "#ff8833" : "#0066ff",
        color: "white",
        transform: "scale(1.05)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      };
    } else {
      return {
        ...baseStyle,
        background: isDarkMode ? "#3d3d3d" : "white",
        borderColor: isDarkMode ? "#666666" : "#cccccc",
        color: isDarkMode ? "#ffffff" : "#333333",
      };
    }
  };

  const labelStyle = {
    fontSize: "13px",
    fontWeight: "bold" as const,
    color: isDarkMode ? "#ffffff" : "#333333",
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  const sectionStyle = {
    marginBottom: "20px",
    padding: "16px",
    background: isDarkMode ? "#1a1a1a" : "#f8f9fa",
    borderRadius: "10px",
    border: `2px solid ${isDarkMode ? "#444444" : "#e9ecef"}`,
  };

  // 表情の絵文字マッピング
  const expressionEmojis = {
    normal: "😐",
    smile: "😊",
    sad: "😢",
    angry: "😠",
    surprised: "😲",
    embarrassed: "😳",
    worried: "😰",
    sleepy: "😴"
  };

  // ポーズの絵文字マッピング
  const poseEmojis = {
    standing: "🧍",
    sitting: "🪑",
    walking: "🚶",
    pointing: "👉",
    waving: "👋",
    arms_crossed: "🤝",
    thinking: "🤔"
  };

  // 向きの絵文字マッピング
  const directionEmojis = {
    front: "👤",
    left: "👈",
    right: "👉",
    back: "🔙"
  };

  return (
    <div style={panelStyle}>
      {/* ヘッダー - 🆕 動的名前表示 */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "20px",
        borderBottom: `3px solid ${isDarkMode ? "#ff8833" : "#0066ff"}`,
        paddingBottom: "12px",
      }}>
        <h4 style={{ 
          margin: "0", 
          color: isDarkMode ? "#ff8833" : "#0066ff",
          fontSize: "18px",
          fontWeight: "bold",
        }}>
          {/* 🆕 動的名前表示 */}
          🎭 {displayName}の設定
        </h4>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: isDarkMode ? "#cccccc" : "#666",
              padding: "4px",
              borderRadius: "4px",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = isDarkMode ? "#444444" : "#f0f0f0";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = "transparent";
            }}
            title="閉じる"
          >
            ✕
          </button>
        )}
      </div>

      {/* 表示タイプ */}
      <div style={sectionStyle}>
        <label style={labelStyle}>
          📷 表示タイプ
        </label>
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { value: "face", label: "顔のみ", emoji: "👤" },
            { value: "halfBody", label: "半身", emoji: "👔" },
            { value: "fullBody", label: "全身", emoji: "🧍" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleUpdate({ viewType: option.value as any })}
              style={buttonStyle(selectedCharacter.viewType === option.value, "small")}
              title={option.label}
            >
              <span>{option.emoji}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 体の向き */}
      <div style={sectionStyle}>
        <label style={labelStyle}>
          🔄 体の向き
        </label>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(3, 1fr)", 
          gap: "8px",
          maxWidth: "180px",
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
            {directionEmojis.front}
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
            {directionEmojis.left}
          </button>
          <div style={{ 
            background: isDarkMode ? "#444444" : "#e9ecef", 
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            minHeight: "36px",
            border: `2px solid ${isDarkMode ? "#666666" : "#cccccc"}`,
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
            {directionEmojis.right}
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
            {directionEmojis.back}
          </button>
          <div></div>
        </div>
      </div>

      {/* 表情 */}
      <div style={sectionStyle}>
        <label style={labelStyle}>
          😊 表情
        </label>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(2, 1fr)", 
          gap: "6px",
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
              <span>{expressionEmojis[expr.value as keyof typeof expressionEmojis]}</span>
              <span>{expr.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ポーズ */}
      <div style={sectionStyle}>
        <label style={labelStyle}>
          🤸 ポーズ
        </label>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(2, 1fr)", 
          gap: "6px",
        }}>
          {[
            { value: "standing", label: "立ってる" },
            { value: "sitting", label: "座ってる" },
            { value: "walking", label: "歩いてる" },
            { value: "pointing", label: "指さし" },
            { value: "waving", label: "手を振る" },
            { value: "arms_crossed", label: "腕くみ" },
            { value: "thinking", label: "考えてる" },
          ].map((pose) => (
            <button
              key={pose.value}
              onClick={() => handleUpdate({ bodyPose: pose.value as any })}
              style={buttonStyle(selectedCharacter.bodyPose === pose.value, "small")}
              title={pose.label}
            >
              <span>{poseEmojis[pose.value as keyof typeof poseEmojis]}</span>
              <span>{pose.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 視線方向 */}
      <div style={sectionStyle}>
        <label style={labelStyle}>
          👀 視線の方向
        </label>
        <div style={{ 
          display: "flex", 
          justifyContent: "center",
          gap: "6px",
          flexWrap: "wrap",
        }}>
          {[
            { value: "left", label: "左", emoji: "⬅️" },
            { value: "front", label: "正面", emoji: "⚫" },
            { value: "right", label: "右", emoji: "➡️" },
            { value: "up", label: "上", emoji: "⬆️" },
            { value: "down", label: "下", emoji: "⬇️" },
          ].map((eye) => (
            <button
              key={eye.value}
              onClick={() => handleUpdate({ eyeDirection: eye.value as any })}
              style={{
                ...buttonStyle(selectedCharacter.eyeDirection === eye.value, "small"),
                minWidth: "50px",
              }}
              title={eye.label}
            >
              <span>{eye.emoji}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 設定 */}
      <div style={sectionStyle}>
        <label style={labelStyle}>
          ⚙️ その他の設定
        </label>
        
        <label style={{ 
          fontSize: "12px", 
          fontWeight: "normal",
          color: isDarkMode ? "#ffffff" : "#333333",
          display: "flex",
          alignItems: "center",
          marginBottom: "12px",
          cursor: "pointer",
          background: isDarkMode ? "#2d2d2d" : "#f8f9fa",
          padding: "8px 10px",
          borderRadius: "6px",
          border: `1px solid ${isDarkMode ? "#555555" : "#dee2e6"}`,
        }}>
          <input
            type="checkbox"
            checked={selectedCharacter.isGlobalPosition}
            onChange={(e) => handleUpdate({ isGlobalPosition: e.target.checked })}
            style={{ 
              marginRight: "8px",
              transform: "scale(1.2)",
            }}
          />
          🆓 自由移動モード（パネルの外も移動可能）
        </label>
        
        <label style={{...labelStyle, marginBottom: "6px", fontSize: "12px"}}>
          📏 サイズ: {selectedCharacter.scale.toFixed(1)}倍
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
            height: "6px",
            marginTop: "4px",
            background: isDarkMode ? "#3d3d3d" : "#e9ecef",
            borderRadius: "3px",
            outline: "none",
            cursor: "pointer",
          }}
        />
        <div style={{ 
          fontSize: "10px", 
          color: isDarkMode ? "#888888" : "#666", 
          textAlign: "center",
          marginTop: "4px",
          display: "flex",
          justifyContent: "space-between",
        }}>
          <span>0.5倍</span>
          <span>標準</span>
          <span>4.0倍</span>
        </div>
      </div>

      {/* プレビュー */}
      <div style={{
        ...sectionStyle,
        textAlign: "center",
        background: isDarkMode ? "#0d1117" : "#ffffff",
        border: `2px dashed ${isDarkMode ? "#30363d" : "#e1e4e8"}`,
      }}>
        <label style={labelStyle}>
          👁️ プレビュー
        </label>
        <div style={{
          fontSize: "11px",
          color: isDarkMode ? "#8b949e" : "#656d76",
          marginBottom: "8px",
        }}>
          キャンバスで実際の見た目を確認してください
        </div>
        <div style={{
          fontSize: "24px",
          marginBottom: "8px",
        }}>
          {expressionEmojis[selectedCharacter.faceExpression as keyof typeof expressionEmojis]} {poseEmojis[selectedCharacter.bodyPose as keyof typeof poseEmojis]}
        </div>
        <div style={{
          fontSize: "10px",
          color: isDarkMode ? "#8b949e" : "#656d76",
        }}>
          {selectedCharacter.viewType} • {selectedCharacter.scale.toFixed(1)}倍 • {selectedCharacter.isGlobalPosition ? "自由移動" : "パネル内"}
        </div>
      </div>

      {/* 削除ボタン */}
      {onCharacterDelete && (
        <div style={{ 
          borderTop: `2px solid ${isDarkMode ? "#555555" : "#eee"}`, 
          paddingTop: "16px",
        }}>
          <button
            onClick={handleDelete}
            style={{
              width: "100%",
              padding: "12px",
              background: "#ff4444",
              color: "white",
              border: "2px solid #ff2222",
              borderRadius: "8px",
              fontSize: "13px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
            onMouseEnter={(e) => {
              const btn = e.target as HTMLButtonElement;
              btn.style.backgroundColor = "#ff2222";
              btn.style.transform = "scale(1.02)";
              btn.style.boxShadow = "0 4px 12px rgba(255, 68, 68, 0.3)";
            }}
            onMouseLeave={(e) => {
              const btn = e.target as HTMLButtonElement;
              btn.style.backgroundColor = "#ff4444";
              btn.style.transform = "scale(1)";
              btn.style.boxShadow = "none";
            }}
            title="このキャラクターを削除"
          >
            <span>🗑️</span>
            <span>キャラクターを削除</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CharacterDetailPanel;