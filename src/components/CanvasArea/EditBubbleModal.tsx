// src/components/CanvasArea/EditBubbleModal.tsx - 実際のセリフ編集版
import React from "react";
import { SpeechBubble } from "../../types";

interface EditBubbleModalProps {
  editingBubble: SpeechBubble | null;
  editText: string;
  setEditText: (text: string) => void;
  onComplete: () => void;
  onCancel: () => void;
  onUpdateBubble?: (bubble: SpeechBubble) => void;
}

const EditBubbleModal: React.FC<EditBubbleModalProps> = ({
  editingBubble,
  editText,
  setEditText,
  onComplete,
  onCancel,
  onUpdateBubble,
}) => {
  if (!editingBubble) return null;

  const handleVerticalToggle = () => {
    if (onUpdateBubble) {
      onUpdateBubble({
        ...editingBubble,
        vertical: !editingBubble.vertical
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 編集モーダル内でのキーイベントをグローバルに伝播させない
    e.stopPropagation();
    
    if (e.key === "Enter" && e.ctrlKey) {
      // Ctrl+Enterで完了
      e.preventDefault();
      onComplete();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
    // バックスペースキーは通常のテキスト編集として処理（何もしない）
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
        minWidth: "300px",
      }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div style={{ marginBottom: "15px", fontWeight: "bold", fontSize: "16px" }}>
        💬 セリフ編集
      </div>

      {/* 縦書き/横書き切り替え */}
      <div style={{ 
        marginBottom: "12px",
        display: "flex",
        gap: "8px",
        alignItems: "center"
      }}>
        <button
          onClick={handleVerticalToggle}
          style={{
            padding: "6px 12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            background: editingBubble.vertical ? "#007bff" : "white",
            color: editingBubble.vertical ? "white" : "#333",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          {editingBubble.vertical ? "📖 縦書き" : "📄 横書き"}
        </button>
        <span style={{ fontSize: "11px", color: "#666" }}>
          {editingBubble.vertical ? "右→左で表示" : "左→右で表示"}
        </span>
      </div>

      {/* セリフ編集エリア */}
      <textarea
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="セリフを入力してください..."
        autoFocus
        style={{
          width: "100%",
          height: "120px",
          padding: "12px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          resize: "vertical",
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "14px",
          lineHeight: "1.5",
          minHeight: "80px",
          maxHeight: "200px",
          writingMode: editingBubble.vertical ? "vertical-rl" : "horizontal-tb",
        }}
      />

      {/* ボタンエリア */}
      <div style={{ marginTop: "15px", textAlign: "right" }}>
        <button
          onClick={onCancel}
          style={{
            marginRight: "10px",
            padding: "8px 16px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            background: "white",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          キャンセル
        </button>
        <button
          onClick={onComplete}
          style={{
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            background: "#007bff",
            color: "white",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          完了
        </button>
      </div>

      {/* 操作説明 */}
      <div style={{ 
        marginTop: "10px", 
        fontSize: "12px", 
        color: "#666",
        textAlign: "center",
        borderTop: "1px solid #eee",
        paddingTop: "8px"
      }}>
        💡 Ctrl+Enter: 完了 / Escape: キャンセル
      </div>
    </div>
  );
};

export default EditBubbleModal;