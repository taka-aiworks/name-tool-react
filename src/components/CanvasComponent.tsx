// src/components/CanvasComponent.tsx (分割後・簡潔版)
import React, { useRef, useEffect, useState } from "react";
import { Panel, Character, SpeechBubble, CanvasComponentProps } from "../types";
import { BubbleRenderer } from "./CanvasArea/renderers/BubbleRenderer";
import { CharacterRenderer } from "./CanvasArea/renderers/CharacterRenderer";
import { PanelRenderer } from "./CanvasArea/renderers/PanelRenderer";
import EditBubbleModal from "./CanvasArea/EditBubbleModal";
import { templates } from "./CanvasArea/templates";

const CanvasComponent: React.FC<CanvasComponentProps> = ({
  selectedTemplate,
  panels,
  setPanels,
  characters,
  setCharacters,
  speechBubbles,
  setSpeechBubbles,
  onCharacterAdd,
  onBubbleAdd,
  onPanelSelect,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 選択状態管理
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedBubble, setSelectedBubble] = useState<SpeechBubble | null>(null);
  
  // ドラッグ&リサイズ管理
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // 編集モーダル管理
  const [editingBubble, setEditingBubble] = useState<SpeechBubble | null>(null);
  const [editText, setEditText] = useState("");

  const [isBubbleResizing, setIsBubbleResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>(""); // この行を追加
  
  // キャラクター追加機能
  const addCharacter = (type: string) => {
    if (!selectedPanel) {
      console.log("⚠️ パネルが選択されていません");
      return;
    }

    const characterNames: Record<string, string> = {
      hero: "主人公",
      heroine: "ヒロイン",
      rival: "ライバル",
      friend: "友人",
    };

    const newCharacter: Character = {
      id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      panelId: selectedPanel.id,
      type: type,
      name: characterNames[type] || "キャラクター",
      x: 0.5,
      y: 0.6,
      scale: 0.8,
      facing: "front",
      gaze: "center",
      pose: "standing",
      expression: "neutral",
      // 新機能のデフォルト値
      viewType: "halfBody",
      faceAngle: "front",
      eyeDirection: "center",
      isGlobalPosition: false,
    };

    setCharacters([...characters, newCharacter]);
    setSelectedCharacter(newCharacter);
    console.log("✅ キャラクター追加:", newCharacter.name, "パネル", selectedPanel.id);
  };

  // 吹き出し追加機能
  const addBubble = (type: string, text: string) => {
  if (!selectedPanel) {
    console.log("⚠️ パネルが選択されていません");
    return;
  }

  const textLength = text.length;
  const baseWidth = Math.max(60, textLength * 8 + 20);
  const baseHeight = Math.max(80, Math.ceil(textLength / 4) * 20 + 40);

  // 絶対座標で作成
  const absoluteX = selectedPanel.x + selectedPanel.width * 0.5;
  const absoluteY = selectedPanel.y + selectedPanel.height * 0.3;

  const newBubble: SpeechBubble = {
    id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    panelId: selectedPanel.id,
    type: type,
    text: text || "ダブルクリックで編集",
    x: absoluteX,  // 絶対座標
    y: absoluteY,  // 絶対座標
    scale: 1.0,
    width: baseWidth,
    height: baseHeight,
    vertical: true,
    isGlobalPosition: true,  // 常に自由移動
  };

  setSpeechBubbles([...speechBubbles, newBubble]);
  console.log("✅ 吹き出し追加:", type, text, "絶対座標:", absoluteX, absoluteY);
};

  // 編集機能
  const handleEditComplete = () => {
    if (editingBubble && editText.trim()) {
      const textLength = editText.length;
      const newWidth = Math.max(60, textLength * 8 + 20);
      const newHeight = Math.max(80, Math.ceil(textLength / 4) * 20 + 40);
      
      const updatedBubble = {
        ...editingBubble,
        text: editText,
        width: newWidth,
        height: newHeight,
      };
      
      setSpeechBubbles(
        speechBubbles.map((bubble) =>
          bubble.id === editingBubble.id ? updatedBubble : bubble
        )
      );
      
      console.log("✅ 吹き出し編集完了:", editText);
    }
    
    setEditingBubble(null);
    setEditText("");
  };

  const handleEditCancel = () => {
    setEditingBubble(null);
    setEditText("");
    console.log("❌ 吹き出し編集キャンセル");
  };

  // Canvas描画関数
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDarkMode = document.documentElement.getAttribute("data-theme") === "dark";

    // キャンバスクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = isDarkMode ? "#404040" : "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 各要素を描画
    PanelRenderer.drawPanels(ctx, panels, selectedPanel, isDarkMode);
    CharacterRenderer.drawCharacters(ctx, characters, panels, selectedCharacter);
    BubbleRenderer.drawBubbles(ctx, speechBubbles, panels, selectedBubble);
  };

  // マウスイベント処理
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 優先順位: 吹き出し > キャラクター > パネル
    const clickedBubble = BubbleRenderer.findBubbleAt(x, y, speechBubbles, panels);
    if (clickedBubble) {
      setSelectedBubble(clickedBubble);
      setSelectedCharacter(null);
      setSelectedPanel(null);
      if (onPanelSelect) onPanelSelect(null);
      console.log("💬 吹き出し選択:", clickedBubble.text);
      return;
    }

    const clickedCharacter = CharacterRenderer.findCharacterAt(x, y, characters, panels);
    if (clickedCharacter) {
      setSelectedCharacter(clickedCharacter);
      setSelectedBubble(null);
      setSelectedPanel(null);
      if (onPanelSelect) onPanelSelect(null);
      console.log("👤 キャラクター選択:", clickedCharacter.name);
      return;
    }

    const clickedPanel = PanelRenderer.findPanelAt(x, y, panels);
    setSelectedPanel(clickedPanel || null);
    setSelectedCharacter(null);
    setSelectedBubble(null);
    if (onPanelSelect) onPanelSelect(clickedPanel || null);
    console.log("📐 パネル選択:", clickedPanel?.id || "なし");
  };

  // ダブルクリック処理
  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickedBubble = BubbleRenderer.findBubbleAt(x, y, speechBubbles, panels);
    if (clickedBubble) {
      setEditingBubble(clickedBubble);
      setEditText(clickedBubble.text);
      console.log("✏️ 吹き出し編集開始:", clickedBubble.text);
    }
  };

  // マウスダウン処理（ドラッグ開始）
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    console.log("マウスダウン開始時の状態:", { isDragging, isBubbleResizing, isResizing });
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;


    // 吹き出し操作チェック（シンプル版）
    const clickedBubble = BubbleRenderer.findBubbleAt(mouseX, mouseY, speechBubbles, panels);
    if (clickedBubble) {
      console.log("吹き出しクリック検出:", clickedBubble.text);
      
      setSelectedBubble(clickedBubble);
      setSelectedCharacter(null);
      setSelectedPanel(null);
      
      const bubbleX = clickedBubble.x - clickedBubble.width / 2;
      const bubbleY = clickedBubble.y - clickedBubble.height / 2;
      
      // 簡単な領域判定
      const isTopBottom = mouseY < bubbleY + 20 || mouseY > bubbleY + clickedBubble.height - 20;
      const isLeftRight = mouseX < bubbleX + 20 || mouseX > bubbleX + clickedBubble.width - 20;
      
      if (isTopBottom && !isLeftRight) {
        // 上下の端：縦リサイズ
        setIsBubbleResizing(true);
        setResizeDirection("vertical");
        console.log("縦リサイズ開始");
      } else if (isLeftRight && !isTopBottom) {
        // 左右の端：横リサイズ
        setIsBubbleResizing(true);
        setResizeDirection("horizontal");
        console.log("横リサイズ開始");
      } else if (isTopBottom && isLeftRight) {
        // 角：比例リサイズ
        setIsBubbleResizing(true);
        setResizeDirection("proportional");
        console.log("比例リサイズ開始");
      } else {
        // 中央：移動
        setIsDragging(true);
        setDragOffset({
          x: mouseX - clickedBubble.x,
          y: mouseY - clickedBubble.y,
        });
        console.log("移動開始");
      }
      
      e.preventDefault();
      return;
    }

    // キャラクター操作チェック
    const clickedCharacter = CharacterRenderer.findCharacterAt(mouseX, mouseY, characters, panels);
    if (clickedCharacter) {
      console.log("キャラクタークリック検出:", clickedCharacter.name);
      setSelectedCharacter(clickedCharacter);
      setSelectedBubble(null);
      const panel = panels.find((p) => p.id === clickedCharacter.panelId);
      
      if (panel) {
        const isResizeHandle = CharacterRenderer.isResizeHandleClicked(mouseX, mouseY, clickedCharacter, panel);
        console.log("キャラクターリサイズハンドル判定:", isResizeHandle);
        
        if (isResizeHandle) {
          setIsResizing(true);
          console.log("キャラクターリサイズ開始:", clickedCharacter.name);
        } else {
          setIsDragging(true);
          // ドラッグ処理...
          console.log("キャラクタードラッグ開始:", clickedCharacter.name);
        }
      }
      e.preventDefault();
    }
  };

   // マウス移動処理
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    console.log("🖱️ マウス移動イベント発生");
    
    if (!isDragging && !isResizing && !isBubbleResizing) {
      console.log("❌ 移動処理スキップ:", { isDragging, isResizing, isBubbleResizing });
      return;
    }
    
    console.log("✅ マウス移動処理中:", { isDragging, isResizing, isBubbleResizing });
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 吹き出しリサイズ処理（感度向上版）
    if (selectedBubble && isBubbleResizing) {
      console.log("吹き出しリサイズ処理中:", mouseX, mouseY);
      
      const bubbleCenterX = selectedBubble.x;
      const bubbleCenterY = selectedBubble.y;
      
      // より敏感な計算：距離を直接使用
      const distanceX = Math.abs(mouseX - bubbleCenterX);
      const distanceY = Math.abs(mouseY - bubbleCenterY);
      
      const newWidth = Math.max(30, distanceX * 2);
      const newHeight = Math.max(20, distanceY * 2);
      
      console.log("新しいサイズ:", { newWidth, newHeight, distanceX, distanceY });
      
      const updatedBubble = {
        ...selectedBubble,
        width: newWidth,
        height: newHeight,
      };
      
      setSpeechBubbles(
        speechBubbles.map((bubble) =>
          bubble.id === selectedBubble.id ? updatedBubble : bubble
        )
      );
      setSelectedBubble(updatedBubble);
      return;
    }

    // 吹き出しドラッグ処理（絶対座標に簡素化）
    if (selectedBubble && isDragging) {
      console.log("吹き出しドラッグ処理中:", mouseX, mouseY);
      
      const newX = mouseX - dragOffset.x;
      const newY = mouseY - dragOffset.y;
      
      const updatedBubble = {
        ...selectedBubble,
        x: newX,
        y: newY,
      };
      
      setSpeechBubbles(
        speechBubbles.map((bubble) =>
          bubble.id === selectedBubble.id ? updatedBubble : bubble
        )
      );
      setSelectedBubble(updatedBubble);
      return;
    }

    // キャラクター操作
    if (selectedCharacter) {
      const panel = panels.find((p) => p.id === selectedCharacter.panelId);
      if (!panel) return;

      if (isDragging) {
        const newX = (mouseX - dragOffset.x - panel.x) / panel.width;
        const newY = (mouseY - dragOffset.y - panel.y) / panel.height;
        
        const updatedCharacter = {
          ...selectedCharacter,
          x: Math.max(0, Math.min(1, newX)),
          y: Math.max(0, Math.min(1, newY)),
        };
        
        setCharacters(
          characters.map((char) =>
            char.id === selectedCharacter.id ? updatedCharacter : char
          )
        );
        setSelectedCharacter(updatedCharacter);
      }

      if (isResizing) {
        const charCenterX = panel.x + panel.width * selectedCharacter.x;
        const charCenterY = panel.y + panel.height * selectedCharacter.y;
        const distance = Math.sqrt(
          Math.pow(mouseX - charCenterX, 2) + Math.pow(mouseY - charCenterY, 2)
        );
        const newScale = Math.max(0.3, Math.min(2.0, distance / 50));
        
        const updatedCharacter = { ...selectedCharacter, scale: newScale };
        setCharacters(
          characters.map((char) =>
            char.id === selectedCharacter.id ? updatedCharacter : char
          )
        );
        setSelectedCharacter(updatedCharacter);
      }
    }
  };


  // マウスアップ処理
  const handleCanvasMouseUp = () => {
    if (isDragging) {
      console.log("ドラッグ終了");
    }
    if (isBubbleResizing) {
      console.log("吹き出しリサイズ終了");
    }
    if (isResizing) {
      console.log("キャラクターリサイズ終了");
    }
    
    // 全ての状態を確実にリセット
    setIsDragging(false);
    setIsBubbleResizing(false);
    setIsResizing(false);
    setResizeDirection("");
  };

  // 機能提供用useEffect
  useEffect(() => {
    onCharacterAdd(addCharacter);
  }, [selectedPanel, characters]);

  useEffect(() => {
    onBubbleAdd(addBubble);
  }, [selectedPanel, speechBubbles]);

  // テンプレート変更時
  useEffect(() => {
    if (templates[selectedTemplate]) {
      setPanels([...templates[selectedTemplate].panels]);
      setSelectedPanel(null);
      setSelectedCharacter(null);
      setSelectedBubble(null);
      if (onPanelSelect) onPanelSelect(null);
    }
  }, [selectedTemplate, setPanels]);

  // 再描画
  useEffect(() => {
    drawCanvas();
  }, [panels, selectedPanel, characters, selectedCharacter, speechBubbles, selectedBubble]);

  // ダークモード監視
  useEffect(() => {
    const handleThemeChange = () => drawCanvas();
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <canvas
      ref={canvasRef}
      width={600}
      height={800}
      onClick={handleCanvasClick}
      onDoubleClick={handleCanvasDoubleClick}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onMouseLeave={handleCanvasMouseUp} // マウスがキャンバス外に出た時も状態リセット
      style={{
        border: "2px solid #ddd",
        background: "white",
        cursor: isBubbleResizing 
          ? "nw-resize"     // リサイズ中
          : isDragging 
          ? "grabbing"      // ドラッグ中
          : (selectedBubble && "Shift+クリックでリサイズ")
          ? "crosshair"     // 吹き出し選択中（リサイズ可能）
          : "pointer",      // 通常
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
    />

      {/* 編集モーダル */}
      <EditBubbleModal
        editingBubble={editingBubble}
        editText={editText}
        setEditText={setEditText}
        onComplete={handleEditComplete}
        onCancel={handleEditCancel}
      />

      {/* 選択状態表示 */}
      {selectedPanel && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "rgba(255, 136, 51, 0.9)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          パネル{selectedPanel.id}選択中
        </div>
      )}
      
      {selectedCharacter && (
        <div
          style={{
            position: "absolute",
            top: "40px",
            right: "10px",
            background: "rgba(0, 102, 255, 0.9)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          {selectedCharacter.name}選択中
        </div>
      )}
      
      {selectedBubble && (
        <div
          style={{
            position: "absolute",
            top: "70px",
            right: "10px",
            background: isBubbleResizing 
              ? "rgba(255, 0, 0, 0.9)"      // リサイズ中は赤
              : isDragging 
              ? "rgba(0, 150, 255, 0.9)"    // 移動中は青
              : "rgba(255, 20, 147, 0.9)",  // 待機中はピンク
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          {isBubbleResizing ? "🔧 サイズ変更中" : 
          isDragging ? "🚀 移動中" : 
          "💬 " + selectedBubble.text}
          <br/>
          <small>
          {isBubbleResizing ? "ドラッグでサイズ変更" : 
          isDragging ? "ドラッグで移動" : 
          "四隅でリサイズ・中央で移動"}
          </small>
        </div>
      )}
    </div>
  );
};

export default CanvasComponent;