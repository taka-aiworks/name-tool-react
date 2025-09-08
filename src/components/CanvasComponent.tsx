// src/components/CanvasComponent.tsx (キャラクター絶対座標対応版)
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
  const [isCharacterResizing, setIsCharacterResizing] = useState(false);
  const [isBubbleResizing, setIsBubbleResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>("");
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // 編集モーダル管理
  const [editingBubble, setEditingBubble] = useState<SpeechBubble | null>(null);
  const [editText, setEditText] = useState("");
  
  // キャラクター追加機能（絶対座標対応）
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

    // 絶対座標で作成（パネル中央下）
    const absoluteX = selectedPanel.x + selectedPanel.width * 0.5;
    const absoluteY = selectedPanel.y + selectedPanel.height * 0.7;

    const newCharacter: Character = {
      id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      panelId: selectedPanel.id,
      type: type,
      name: characterNames[type] || "キャラクター",
      x: absoluteX,  // 絶対座標
      y: absoluteY,  // 絶対座標
      scale: 1.0,
      facing: "front",
      gaze: "center",
      pose: "standing",
      expression: "neutral",
      viewType: "halfBody",
      faceAngle: "front",
      eyeDirection: "center",
      isGlobalPosition: true,  // 新規キャラクターは自由移動
    };

    setCharacters([...characters, newCharacter]);
    setSelectedCharacter(newCharacter);
    console.log("✅ キャラクター追加（絶対座標）:", newCharacter.name, "位置:", absoluteX, absoluteY);
  };

  // 吹き出し追加機能（変更なし）
  const addBubble = (type: string, text: string) => {
    if (!selectedPanel) {
      console.log("⚠️ パネルが選択されていません");
      return;
    }

    const textLength = text.length;
    const baseWidth = Math.max(60, textLength * 8 + 20);
    const baseHeight = Math.max(80, Math.ceil(textLength / 4) * 20 + 40);

    const absoluteX = selectedPanel.x + selectedPanel.width * 0.5;
    const absoluteY = selectedPanel.y + selectedPanel.height * 0.3;

    const newBubble: SpeechBubble = {
      id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      panelId: selectedPanel.id,
      type: type,
      text: text || "ダブルクリックで編集",
      x: absoluteX,
      y: absoluteY,
      scale: 1.0,
      width: baseWidth,
      height: baseHeight,
      vertical: true,
      isGlobalPosition: true,
    };

    setSpeechBubbles([...speechBubbles, newBubble]);
    console.log("✅ 吹き出し追加:", type, text, "絶対座標:", absoluteX, absoluteY);
  };

  // 編集機能（変更なし）
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

  // Canvas描画関数（変更なし）
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDarkMode = document.documentElement.getAttribute("data-theme") === "dark";

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = isDarkMode ? "#404040" : "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    PanelRenderer.drawPanels(ctx, panels, selectedPanel, isDarkMode);
    CharacterRenderer.drawCharacters(ctx, characters, panels, selectedCharacter);
    BubbleRenderer.drawBubbles(ctx, speechBubbles, panels, selectedBubble);
  };

  // マウスイベント処理（変更なし）
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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

  // マウスダウン処理（キャラクター対応強化）
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 吹き出し操作チェック
    const clickedBubble = BubbleRenderer.findBubbleAt(mouseX, mouseY, speechBubbles, panels);
    if (clickedBubble) {
      setSelectedBubble(clickedBubble);
      setSelectedCharacter(null);
      setSelectedPanel(null);
      
      const bubbleX = clickedBubble.x - clickedBubble.width / 2;
      const bubbleY = clickedBubble.y - clickedBubble.height / 2;
      
      const isTopBottom = mouseY < bubbleY + 20 || mouseY > bubbleY + clickedBubble.height - 20;
      const isLeftRight = mouseX < bubbleX + 20 || mouseX > bubbleX + clickedBubble.width - 20;
      
      if (isTopBottom && !isLeftRight) {
        setIsBubbleResizing(true);
        setResizeDirection("vertical");
        console.log("吹き出し縦リサイズ開始");
      } else if (isLeftRight && !isTopBottom) {
        setIsBubbleResizing(true);
        setResizeDirection("horizontal");
        console.log("吹き出し横リサイズ開始");
      } else if (isTopBottom && isLeftRight) {
        setIsBubbleResizing(true);
        setResizeDirection("proportional");
        console.log("吹き出し比例リサイズ開始");
      } else {
        setIsDragging(true);
        setDragOffset({
          x: mouseX - clickedBubble.x,
          y: mouseY - clickedBubble.y,
        });
        console.log("吹き出し移動開始");
      }
      e.preventDefault();
      return;
    }

    // キャラクター操作チェック（改良版）
    const clickedCharacter = CharacterRenderer.findCharacterAt(mouseX, mouseY, characters, panels);
    if (clickedCharacter) {
      console.log("キャラクタークリック検出:", clickedCharacter.name);
      setSelectedCharacter(clickedCharacter);
      setSelectedBubble(null);
      setSelectedPanel(null);
      
      const panel = panels.find((p) => p.id === clickedCharacter.panelId);
      if (!panel) return;
      
      // リサイズハンドルチェック（新しい方式）
      const resizeResult = CharacterRenderer.isCharacterResizeHandleClicked(mouseX, mouseY, clickedCharacter, panel);
      
      if (resizeResult.isClicked) {
        setIsCharacterResizing(true);
        setResizeDirection(resizeResult.direction);
        console.log("キャラクターリサイズ開始:", resizeResult.direction);
      } else {
        setIsDragging(true);
        
        // 絶対座標か相対座標かで分岐
        if (clickedCharacter.isGlobalPosition) {
          setDragOffset({
            x: mouseX - clickedCharacter.x,
            y: mouseY - clickedCharacter.y,
          });
        } else {
          // 相対座標の場合の従来処理
          const charWidth = CharacterRenderer.getCharacterWidth(clickedCharacter);
          const charHeight = CharacterRenderer.getCharacterHeight(clickedCharacter);
          const charX = panel.x + panel.width * clickedCharacter.x - charWidth / 2;
          const charY = panel.y + panel.height * clickedCharacter.y - charHeight / 2;
          setDragOffset({
            x: mouseX - charX,
            y: mouseY - charY,
          });
        }
        console.log("キャラクタードラッグ開始:", clickedCharacter.name);
      }
      e.preventDefault();
    }
  };

  // マウス移動処理（キャラクター対応強化）
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging && !isCharacterResizing && !isBubbleResizing) {
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 吹き出しリサイズ処理
    if (selectedBubble && isBubbleResizing) {
      const bubbleCenterX = selectedBubble.x;
      const bubbleCenterY = selectedBubble.y;
      
      const distanceX = Math.abs(mouseX - bubbleCenterX);
      const distanceY = Math.abs(mouseY - bubbleCenterY);
      
      const newWidth = Math.max(30, distanceX * 2);
      const newHeight = Math.max(20, distanceY * 2);
      
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

    // 吹き出しドラッグ処理
    if (selectedBubble && isDragging) {
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

    // キャラクターリサイズ処理（新方式）
    if (selectedCharacter && isCharacterResizing) {
      const panel = panels.find((p) => p.id === selectedCharacter.panelId);
      if (!panel) return;

      let charCenterX, charCenterY;
      
      if (selectedCharacter.isGlobalPosition) {
        charCenterX = selectedCharacter.x;
        charCenterY = selectedCharacter.y;
      } else {
        charCenterX = panel.x + panel.width * selectedCharacter.x;
        charCenterY = panel.y + panel.height * selectedCharacter.y;
      }

      // 方向に応じたリサイズ
      let newScale = selectedCharacter.scale;
      
      if (resizeDirection.includes("e") || resizeDirection.includes("w")) {
        // 横方向のリサイズ
        const distance = Math.abs(mouseX - charCenterX);
        newScale = Math.max(0.3, Math.min(3.0, distance / 50));
      } else if (resizeDirection.includes("n") || resizeDirection.includes("s")) {
        // 縦方向のリサイズ
        const distance = Math.abs(mouseY - charCenterY);
        newScale = Math.max(0.3, Math.min(3.0, distance / 50));
      } else {
        // 対角線方向（比例リサイズ）
        const distance = Math.sqrt(
          Math.pow(mouseX - charCenterX, 2) + Math.pow(mouseY - charCenterY, 2)
        );
        newScale = Math.max(0.3, Math.min(3.0, distance / 50));
      }
      
      const updatedCharacter = { ...selectedCharacter, scale: newScale };
      setCharacters(
        characters.map((char) =>
          char.id === selectedCharacter.id ? updatedCharacter : char
        )
      );
      setSelectedCharacter(updatedCharacter);
      return;
    }

    // キャラクタードラッグ処理（絶対座標対応）
    if (selectedCharacter && isDragging) {
      const panel = panels.find((p) => p.id === selectedCharacter.panelId);
      if (!panel) return;

      if (selectedCharacter.isGlobalPosition) {
        // 絶対座標での移動（自由移動）
        const newX = mouseX - dragOffset.x;
        const newY = mouseY - dragOffset.y;
        
        const updatedCharacter = {
          ...selectedCharacter,
          x: newX,
          y: newY,
        };
        
        setCharacters(
          characters.map((char) =>
            char.id === selectedCharacter.id ? updatedCharacter : char
          )
        );
        setSelectedCharacter(updatedCharacter);
      } else {
        // 相対座標での移動（パネル内制限）
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
    }
  };

  // マウスアップ処理（状態リセット）
  const handleCanvasMouseUp = () => {
    if (isDragging) {
      console.log("ドラッグ終了");
    }
    if (isBubbleResizing) {
      console.log("吹き出しリサイズ終了");
    }
    if (isCharacterResizing) {
      console.log("キャラクターリサイズ終了");
    }
    
    setIsDragging(false);
    setIsBubbleResizing(false);
    setIsCharacterResizing(false);
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
    <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "100vh", padding: "20px" }}>
      <canvas
        ref={canvasRef}
        width={600}
        height={800}
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        style={{
          border: "2px solid #ddd",
          background: "white",
          cursor: isBubbleResizing || isCharacterResizing
            ? "nw-resize"
            : isDragging 
            ? "grabbing"
            : "pointer",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          borderRadius: "8px", // 角を少し丸く
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
            background: isCharacterResizing 
              ? "rgba(255, 0, 0, 0.9)"
              : isDragging 
              ? "rgba(0, 150, 255, 0.9)"
              : "rgba(0, 102, 255, 0.9)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          {isCharacterResizing ? "🔧 サイズ変更中" : 
          isDragging ? "🚀 移動中" : 
          "👤 " + selectedCharacter.name}
          <br/>
          <small>
            {selectedCharacter.isGlobalPosition ? "🆓 自由移動" : "📐 パネル内"}
            {" | "}
            {selectedCharacter.viewType}
            {" | "}
            {selectedCharacter.scale.toFixed(1)}x
          </small>
        </div>
      )}
      
      {selectedBubble && (
        <div
          style={{
            position: "absolute",
            top: "70px",
            right: "10px",
            background: isBubbleResizing 
              ? "rgba(255, 0, 0, 0.9)"
              : isDragging 
              ? "rgba(0, 150, 255, 0.9)"
              : "rgba(255, 20, 147, 0.9)",
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