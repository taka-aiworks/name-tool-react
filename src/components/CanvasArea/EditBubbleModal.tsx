// src/components/CanvasArea/EditBubbleModal.tsx
import React from "react";
import { SpeechBubble } from "../../types";

interface EditBubbleModalProps {
  editingBubble: SpeechBubble | null;
  editText: string;
  setEditText: (text: string) => void;
  onComplete: () => void;
  onCancel: () => void;
}

const EditBubbleModal: React.FC<EditBubbleModalProps> = ({
  editingBubble,
  editText,
  setEditText,
  onComplete,
  onCancel,
}) => {
  if (!editingBubble) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onComplete();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "white",
        border: "2px solid #333",
        borderRadius: "8px",
        padding: "20px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        zIndex: 1000,
      }}
    >
      <div style={{ marginBottom: "10px", fontWeight: "bold" }}>
        💬 吹き出し編集
      </div>
      <textarea
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="セリフを入力..."
        autoFocus
        style={{
          width: "200px",
          height: "80px",
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          resize: "none",
          fontFamily: "inherit",
        }}
      />
      <div style={{ marginTop: "10px", textAlign: "right" }}>
        <button
          onClick={onCancel}
          style={{
            marginRight: "8px",
            padding: "6px 12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            background: "white",
            cursor: "pointer",
          }}
        >
          キャンセル
        </button>
        <button
          onClick={onComplete}
          style={{
            padding: "6px 12px",
            border: "none",
            borderRadius: "4px",
            background: "#007bff",
            color: "white",
            cursor: "pointer",
          }}
        >
          完了
        </button>
      </div>
      <div style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>
        💡 Enter: 完了 / Escape: キャンセル
      </div>
    </div>
  );
};

export default EditBubbleModal;