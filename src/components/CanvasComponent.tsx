// src/components/CanvasComponent.tsx (PanelRenderer互換修正版)
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Panel, Character, SpeechBubble, CanvasComponentProps } from "../types";
import { BubbleRenderer } from "./CanvasArea/renderers/BubbleRenderer";
import { CharacterRenderer } from "./CanvasArea/renderers/CharacterRenderer";
import { PanelRenderer } from "./CanvasArea/renderers/PanelRenderer";
import EditBubbleModal from "./CanvasArea/EditBubbleModal";
import { templates } from "./CanvasArea/templates";

const CanvasComponent = forwardRef<HTMLCanvasElement, CanvasComponentProps>((props, ref) => {
  const {
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
    onCharacterSelect,
    onCharacterRightClick,
    isPanelEditMode = false,
    onPanelSplit,
    onPanelEditModeToggle,
  } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  useImperativeHandle(ref, () => canvasRef.current!, []);

  // 基本選択状態
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedBubble, setSelectedBubble] = useState<SpeechBubble | null>(null);
  
  // ドラッグ&操作状態
  const [isDragging, setIsDragging] = useState(false);
  const [isCharacterResizing, setIsCharacterResizing] = useState(false);
  const [isBubbleResizing, setIsBubbleResizing] = useState(false);
  const [isPanelResizing, setIsPanelResizing] = useState(false);
  const [isPanelMoving, setIsPanelMoving] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>("");
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // UI状態
  const [snapLines, setSnapLines] = useState<Array<{x1: number, y1: number, x2: number, y2: number, type: 'vertical' | 'horizontal'}>>([]);
  const [editingBubble, setEditingBubble] = useState<SpeechBubble | null>(null);
  const [editText, setEditText] = useState("");
  const [showGrid] = useState(true);
  const [gridSize] = useState(20);
  const [snapSensitivity] = useState(12);

  // 右クリックメニュー状態
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    target: 'character' | 'bubble' | 'panel' | null;
    targetElement: Character | SpeechBubble | Panel | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    target: null,
    targetElement: null,
  });

  // 🆕 パネル操作用のヘルパー関数（staticメソッドの代替）

  // グリッド描画
  const drawGrid = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, gridSize: number, isDarkMode: boolean) => {
    ctx.strokeStyle = isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    // 垂直線
    for (let x = 0; x <= canvasWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }

    // 水平線
    for (let y = 0; y <= canvasHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }
  };

  // パネル描画
  const drawPanels = (ctx: CanvasRenderingContext2D, panels: Panel[], selectedPanel: Panel | null, isDarkMode: boolean, isEditMode: boolean) => {
    panels.forEach((panel) => {
      drawPanel(ctx, panel, panel === selectedPanel, isDarkMode, isEditMode);
    });
  };

  // 単一パネル描画
  const drawPanel = (ctx: CanvasRenderingContext2D, panel: Panel, isSelected: boolean, isDarkMode: boolean, isEditMode: boolean) => {
    // パネル背景
    if (isDarkMode) {
      ctx.fillStyle = "rgba(80, 80, 80, 0.9)";
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    }
    ctx.fillRect(panel.x, panel.y, panel.width, panel.height);

    // パネル枠線
    if (isSelected) {
      ctx.strokeStyle = "#ff8833";
      ctx.lineWidth = 4;
    } else {
      ctx.strokeStyle = isDarkMode ? "#ffffff" : "#333333";
      ctx.lineWidth = 3;
    }
    ctx.strokeRect(panel.x, panel.y, panel.width, panel.height);

    // パネル番号
    ctx.fillStyle = isSelected ? "#ff8833" : isDarkMode ? "#ffffff" : "#333333";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    
    const textX = panel.x + 12;
    const textY = panel.y + 12;
    const textWidth = 30;
    const textHeight = 25;
    
    ctx.fillStyle = isSelected ? "rgba(255, 136, 51, 0.8)" : isDarkMode ? "rgba(0, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.8)";
    ctx.fillRect(textX - 4, textY - 2, textWidth, textHeight);
    
    ctx.fillStyle = isSelected ? "#ffffff" : isDarkMode ? "#ffffff" : "#333333";
    ctx.fillText(`${panel.id}`, textX, textY);

    // 編集モード時のハンドル描画
    if (isSelected && isEditMode) {
      drawPanelEditHandles(ctx, panel, isDarkMode);
    }
  };

  // パネル編集ハンドル描画
  const drawPanelEditHandles = (ctx: CanvasRenderingContext2D, panel: Panel, isDarkMode: boolean) => {
    const handleSize = 20;
    const handleColor = "#ff8833";
    const handleBorder = "#ffffff";
    
    // 8方向のリサイズハンドル
    const resizeHandles = [
      { x: panel.x - handleSize/2, y: panel.y - handleSize/2, type: "nw" },
      { x: panel.x + panel.width/2 - handleSize/2, y: panel.y - handleSize/2, type: "n" },
      { x: panel.x + panel.width - handleSize/2, y: panel.y - handleSize/2, type: "ne" },
      { x: panel.x + panel.width - handleSize/2, y: panel.y + panel.height/2 - handleSize/2, type: "e" },
      { x: panel.x + panel.width - handleSize/2, y: panel.y + panel.height - handleSize/2, type: "se" },
      { x: panel.x + panel.width/2 - handleSize/2, y: panel.y + panel.height - handleSize/2, type: "s" },
      { x: panel.x - handleSize/2, y: panel.y + panel.height - handleSize/2, type: "sw" },
      { x: panel.x - handleSize/2, y: panel.y + panel.height/2 - handleSize/2, type: "w" },
    ];

    // リサイズハンドル描画
    resizeHandles.forEach((handle) => {
      if (["nw", "ne", "se", "sw"].includes(handle.type)) {
        ctx.fillStyle = handleColor;
        ctx.strokeStyle = handleBorder;
        ctx.lineWidth = 2;
        ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
        ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
      } else {
        ctx.fillStyle = "#4CAF50";
        ctx.strokeStyle = handleBorder;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(handle.x + handleSize/2, handle.y + handleSize/2, handleSize/2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
    });

    // 移動ハンドル（パネル中央）
    const moveHandleSize = 30;
    const moveX = panel.x + panel.width/2 - moveHandleSize/2;
    const moveY = panel.y + panel.height/2 - moveHandleSize/2;
    
    ctx.fillStyle = "#2196F3";
    ctx.strokeStyle = handleBorder;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(moveX + moveHandleSize/2, moveY + moveHandleSize/2, moveHandleSize/2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✋", moveX + moveHandleSize/2, moveY + moveHandleSize/2);

    // 分割ハンドル（右下角）
    const splitHandleSize = 24;
    const splitX = panel.x + panel.width - splitHandleSize - 5;
    const splitY = panel.y + panel.height - splitHandleSize - 5;
    
    ctx.fillStyle = "#9C27B0";
    ctx.strokeStyle = handleBorder;
    ctx.lineWidth = 2;
    ctx.fillRect(splitX, splitY, splitHandleSize, splitHandleSize);
    ctx.strokeRect(splitX, splitY, splitHandleSize, splitHandleSize);
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✂", splitX + splitHandleSize/2, splitY + splitHandleSize/2);

    // 削除ハンドル（左上角）
    const deleteHandleSize = 24;
    const deleteX = panel.x - deleteHandleSize/2;
    const deleteY = panel.y - deleteHandleSize/2;
    
    ctx.fillStyle = "#f44336";
    ctx.strokeStyle = handleBorder;
    ctx.lineWidth = 2;
    ctx.fillRect(deleteX, deleteY, deleteHandleSize, deleteHandleSize);
    ctx.strokeRect(deleteX, deleteY, deleteHandleSize, deleteHandleSize);
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("×", deleteX + deleteHandleSize/2, deleteY + deleteHandleSize/2);
  };

  // スナップライン描画
  const drawSnapLines = (ctx: CanvasRenderingContext2D, snapLines: Array<{x1: number, y1: number, x2: number, y2: number, type: 'vertical' | 'horizontal'}>, isDarkMode: boolean) => {
    ctx.strokeStyle = isDarkMode ? "#00ff00" : "#ff0000";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 2]);
    
    snapLines.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.stroke();
    });
    
    ctx.setLineDash([]);
  };

  // パネル検索
  const findPanelAt = (mouseX: number, mouseY: number, panels: Panel[]): Panel | null => {
    return panels.find(
      (panel) =>
        mouseX >= panel.x &&
        mouseX <= panel.x + panel.width &&
        mouseY >= panel.y &&
        mouseY <= panel.y + panel.height
    ) || null;
  };

  // パネルハンドル判定
  const getPanelHandleAt = (mouseX: number, mouseY: number, panel: Panel): { type: string; direction?: string } | null => {
    const handleSize = 20;
    const tolerance = 5;
    
    // 削除ハンドル判定
    const deleteHandleSize = 24;
    const deleteX = panel.x - deleteHandleSize/2;
    const deleteY = panel.y - deleteHandleSize/2;
    
    if (
      mouseX >= deleteX - tolerance &&
      mouseX <= deleteX + deleteHandleSize + tolerance &&
      mouseY >= deleteY - tolerance &&
      mouseY <= deleteY + deleteHandleSize + tolerance
    ) {
      return { type: "delete" };
    }

    // リサイズハンドル判定
    const resizeHandles = [
      { x: panel.x - handleSize/2, y: panel.y - handleSize/2, type: "resize", direction: "nw" },
      { x: panel.x + panel.width/2 - handleSize/2, y: panel.y - handleSize/2, type: "resize", direction: "n" },
      { x: panel.x + panel.width - handleSize/2, y: panel.y - handleSize/2, type: "resize", direction: "ne" },
      { x: panel.x + panel.width - handleSize/2, y: panel.y + panel.height/2 - handleSize/2, type: "resize", direction: "e" },
      { x: panel.x + panel.width - handleSize/2, y: panel.y + panel.height - handleSize/2, type: "resize", direction: "se" },
      { x: panel.x + panel.width/2 - handleSize/2, y: panel.y + panel.height - handleSize/2, type: "resize", direction: "s" },
      { x: panel.x - handleSize/2, y: panel.y + panel.height - handleSize/2, type: "resize", direction: "sw" },
      { x: panel.x - handleSize/2, y: panel.y + panel.height/2 - handleSize/2, type: "resize", direction: "w" },
    ];

    for (const handle of resizeHandles) {
      if (
        mouseX >= handle.x - tolerance &&
        mouseX <= handle.x + handleSize + tolerance &&
        mouseY >= handle.y - tolerance &&
        mouseY <= handle.y + handleSize + tolerance
      ) {
        return { type: handle.type, direction: handle.direction };
      }
    }

    // 移動ハンドル判定
    const moveHandleSize = 30;
    const moveX = panel.x + panel.width/2 - moveHandleSize/2;
    const moveY = panel.y + panel.height/2 - moveHandleSize/2;
    
    if (
      mouseX >= moveX - tolerance &&
      mouseX <= moveX + moveHandleSize + tolerance &&
      mouseY >= moveY - tolerance &&
      mouseY <= moveY + moveHandleSize + tolerance
    ) {
      return { type: "move" };
    }

    // 分割ハンドル判定
    const splitHandleSize = 24;
    const splitX = panel.x + panel.width - splitHandleSize - 5;
    const splitY = panel.y + panel.height - splitHandleSize - 5;
    
    if (
      mouseX >= splitX - tolerance &&
      mouseX <= splitX + splitHandleSize + tolerance &&
      mouseY >= splitY - tolerance &&
      mouseY <= splitY + splitHandleSize + tolerance
    ) {
      return { type: "split" };
    }

    return null;
  };

  // パネルリサイズ
  const resizePanel = (panel: Panel, direction: string, deltaX: number, deltaY: number, minSize: number = 50): Panel => {
    const newPanel = { ...panel };
    const sensitivityFactor = 0.5;
    const adjustedDeltaX = deltaX * sensitivityFactor;
    const adjustedDeltaY = deltaY * sensitivityFactor;
    
    switch (direction) {
      case "nw":
        const newNwWidth = Math.max(minSize, newPanel.width - adjustedDeltaX);
        const newNwHeight = Math.max(minSize, newPanel.height - adjustedDeltaY);
        newPanel.x = newPanel.x + newPanel.width - newNwWidth;
        newPanel.y = newPanel.y + newPanel.height - newNwHeight;
        newPanel.width = newNwWidth;
        newPanel.height = newNwHeight;
        break;
      case "n":
        const newNHeight = Math.max(minSize, newPanel.height - adjustedDeltaY);
        newPanel.y = newPanel.y + newPanel.height - newNHeight;
        newPanel.height = newNHeight;
        break;
      case "ne":
        const newNeWidth = Math.max(minSize, newPanel.width + adjustedDeltaX);
        const newNeHeight = Math.max(minSize, newPanel.height - adjustedDeltaY);
        newPanel.y = newPanel.y + newPanel.height - newNeHeight;
        newPanel.width = newNeWidth;
        newPanel.height = newNeHeight;
        break;
      case "e":
        newPanel.width = Math.max(minSize, newPanel.width + adjustedDeltaX);
        break;
      case "se":
        newPanel.width = Math.max(minSize, newPanel.width + adjustedDeltaX);
        newPanel.height = Math.max(minSize, newPanel.height + adjustedDeltaY);
        break;
      case "s":
        newPanel.height = Math.max(minSize, newPanel.height + adjustedDeltaY);
        break;
      case "sw":
        const newSwWidth = Math.max(minSize, newPanel.width - adjustedDeltaX);
        newPanel.x = newPanel.x + newPanel.width - newSwWidth;
        newPanel.width = newSwWidth;
        newPanel.height = Math.max(minSize, newPanel.height + adjustedDeltaY);
        break;
      case "w":
        const newWWidth = Math.max(minSize, newPanel.width - adjustedDeltaX);
        newPanel.x = newPanel.x + newPanel.width - newWWidth;
        newPanel.width = newWWidth;
        break;
    }
    
    return newPanel;
  };

  // パネル移動
  const movePanel = (
    panel: Panel,
    deltaX: number,
    deltaY: number,
    canvasWidth: number = 1200,
    canvasHeight: number = 800,
    snapThreshold: number = 10,
    allPanels: Panel[] = []
  ): { panel: Panel; snapLines: Array<{x1: number, y1: number, x2: number, y2: number, type: 'vertical' | 'horizontal'}> } => {
    let newX = panel.x + deltaX;
    let newY = panel.y + deltaY;
    
    newX = Math.max(0, Math.min(canvasWidth - panel.width, newX));
    newY = Math.max(0, Math.min(canvasHeight - panel.height, newY));
    
    const snapLines: Array<{x1: number, y1: number, x2: number, y2: number, type: 'vertical' | 'horizontal'}> = [];
    const otherPanels = allPanels.filter(p => p.id !== panel.id);
    
    // スナップ判定（簡略化）
    for (const otherPanel of otherPanels) {
      if (Math.abs(newX - otherPanel.x) < snapThreshold) {
        newX = otherPanel.x;
        snapLines.push({
          x1: otherPanel.x + 0.5, y1: Math.min(newY, otherPanel.y) - 20,
          x2: otherPanel.x + 0.5, y2: Math.max(newY + panel.height, otherPanel.y + otherPanel.height) + 20,
          type: 'vertical'
        });
        break;
      }
    }
    
    for (const otherPanel of otherPanels) {
      if (Math.abs(newY - otherPanel.y) < snapThreshold) {
        newY = otherPanel.y;
        snapLines.push({
          x1: Math.min(newX, otherPanel.x) - 20, y1: otherPanel.y + 0.5,
          x2: Math.max(newX + panel.width, otherPanel.x + otherPanel.width) + 20, y2: otherPanel.y + 0.5,
          type: 'horizontal'
        });
        break;
      }
    }
    
    return {
      panel: { ...panel, x: newX, y: newY },
      snapLines
    };
  };

  // 🆕 キャラクター追加機能
  const addCharacter = (type: string) => {
    let availablePanels = panels;
    if (availablePanels.length === 0 && selectedTemplate && templates[selectedTemplate]) {
      availablePanels = templates[selectedTemplate].panels;
    }
    
    const targetPanel = selectedPanel || availablePanels[0];
    if (!targetPanel) {
      console.log("⚠️ 利用可能なパネルがありません");
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
      panelId: targetPanel.id,
      type: type,
      name: characterNames[type] || "キャラクター",
      x: targetPanel.x + targetPanel.width * 0.5,
      y: targetPanel.y + targetPanel.height * 0.7,
      scale: 2.0,
      facing: "front",
      gaze: "center",
      pose: "standing",
      expression: "neutral",
      faceAngle: "front",
      bodyDirection: "front",
      faceExpression: "normal",
      bodyPose: "standing",
      eyeDirection: "front",
      viewType: "halfBody",
      isGlobalPosition: true,
    };

    setCharacters([...characters, newCharacter]);
    setSelectedCharacter(newCharacter);
    if (onCharacterSelect) onCharacterSelect(newCharacter);
    console.log("✅ キャラクター追加:", newCharacter.name);
  };

  // 🆕 吹き出し追加機能
  const addBubble = (type: string, text: string) => {
    let availablePanels = panels;
    if (availablePanels.length === 0 && selectedTemplate && templates[selectedTemplate]) {
      availablePanels = templates[selectedTemplate].panels;
    }
    
    const targetPanel = selectedPanel || availablePanels[0];
    if (!targetPanel) {
      console.log("⚠️ 利用可能なパネルがありません");
      return;
    }

    const textLength = text.length;
    const baseWidth = Math.max(60, textLength * 8 + 20);
    const baseHeight = Math.max(80, Math.ceil(textLength / 4) * 20 + 40);

    const newBubble: SpeechBubble = {
      id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      panelId: targetPanel.id,
      type: type,
      text: text || "ダブルクリックで編集",
      x: targetPanel.x + targetPanel.width * 0.5,
      y: targetPanel.y + targetPanel.height * 0.3,
      scale: 1.0,
      width: baseWidth,
      height: baseHeight,
      vertical: true,
      isGlobalPosition: true,
    };

    setSpeechBubbles([...speechBubbles, newBubble]);
    console.log("✅ 吹き出し追加:", type);
  };

  // 🆕 要素削除機能
  const deleteElement = (type: 'character' | 'bubble', element: Character | SpeechBubble) => {
    if (type === 'character') {
      const newCharacters = characters.filter(char => char.id !== element.id);
      setCharacters(newCharacters);
      setSelectedCharacter(null);
      if (onCharacterSelect) onCharacterSelect(null);
      console.log("🗑️ キャラクター削除:", (element as Character).name);
    } else if (type === 'bubble') {
      const newBubbles = speechBubbles.filter(bubble => bubble.id !== element.id);
      setSpeechBubbles(newBubbles);
      setSelectedBubble(null);
      console.log("🗑️ 吹き出し削除:", (element as SpeechBubble).text);
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

  // 🆕 パネル削除機能
  const deletePanelWithConfirmation = (panel: Panel) => {
    const confirmed = window.confirm(
      `コマ ${panel.id} を削除しますか？\n` +
      `コマ内のキャラクターと吹き出しも一緒に削除されます。\n\n` +
      `この操作は取り消せません。`
    );
    
    if (!confirmed) {
      setContextMenu({ ...contextMenu, visible: false });
      return;
    }

    // パネル内の要素を検索して削除
    const characterIdsToDelete = characters
      .filter(char => 
        char.x >= panel.x && 
        char.x <= panel.x + panel.width &&
        char.y >= panel.y && 
        char.y <= panel.y + panel.height
      )
      .map(char => char.id);

    const bubbleIdsToDelete = speechBubbles
      .filter(bubble => 
        bubble.x >= panel.x && 
        bubble.x <= panel.x + panel.width &&
        bubble.y >= panel.y && 
        bubble.y <= panel.y + panel.height
      )
      .map(bubble => bubble.id);

    // 子要素削除
    if (characterIdsToDelete.length > 0) {
      const newCharacters = characters.filter(char => !characterIdsToDelete.includes(char.id));
      setCharacters(newCharacters);
    }

    if (bubbleIdsToDelete.length > 0) {
      const newBubbles = speechBubbles.filter(bubble => !bubbleIdsToDelete.includes(bubble.id));
      setSpeechBubbles(newBubbles);
    }

    // パネル削除
    const newPanels = panels.filter(p => p.id !== panel.id);
    setPanels(newPanels);

    // 選択状態クリア
    setSelectedPanel(null);
    setSelectedCharacter(null);
    setSelectedBubble(null);
    if (onPanelSelect) onPanelSelect(null);
    if (onCharacterSelect) onCharacterSelect(null);

    console.log(`🗑️ パネル ${panel.id} 削除完了`);
    setContextMenu({ ...contextMenu, visible: false });
  };

  // 🆕 右クリックメニュー処理
  const handleContextMenuAction = (action: string) => {
    const { target, targetElement } = contextMenu;
    
    switch (action) {
      case 'flipHorizontal':
        if (canvasRef.current) {
          const flippedPanels = panels.map(panel => ({
            ...panel,
            x: canvasRef.current!.width - panel.x - panel.width
          }));
          const flippedCharacters = characters.map(char => ({
            ...char,
            x: char.isGlobalPosition ? canvasRef.current!.width - char.x : char.x
          }));
          const flippedBubbles = speechBubbles.map(bubble => ({
            ...bubble,
            x: bubble.isGlobalPosition ? canvasRef.current!.width - bubble.x : bubble.x
          }));
          setPanels(flippedPanels);
          setCharacters(flippedCharacters);
          setSpeechBubbles(flippedBubbles);
          console.log("↔️ 水平反転完了");
        }
        break;

      case 'flipVertical':
        if (canvasRef.current) {
          const flippedPanels = panels.map(panel => ({
            ...panel,
            y: canvasRef.current!.height - panel.y - panel.height
          }));
          const flippedCharacters = characters.map(char => ({
            ...char,
            y: char.isGlobalPosition ? canvasRef.current!.height - char.y : char.y
          }));
          const flippedBubbles = speechBubbles.map(bubble => ({
            ...bubble,
            y: bubble.isGlobalPosition ? canvasRef.current!.height - bubble.y : bubble.y
          }));
          setPanels(flippedPanels);
          setCharacters(flippedCharacters);
          setSpeechBubbles(flippedBubbles);
          console.log("↕️ 垂直反転完了");
        }
        break;

      case 'editPanel':
        if (target === 'panel' && targetElement) {
          setSelectedPanel(targetElement as Panel);
          setSelectedCharacter(null);
          setSelectedBubble(null);
          if (onPanelSelect) onPanelSelect(targetElement as Panel);
          if (onCharacterSelect) onCharacterSelect(null);
          if (onPanelEditModeToggle) onPanelEditModeToggle(true);
          console.log("コマ編集モード開始:", (targetElement as Panel).id);
        }
        break;

      case 'delete':
        if (target === 'panel' && targetElement) {
          deletePanelWithConfirmation(targetElement as Panel);
        } else if (target && targetElement) {
          deleteElement(target as 'character' | 'bubble', targetElement as Character | SpeechBubble);
        }
        break;

      case 'select':
        if (target === 'character' && targetElement) {
          setSelectedCharacter(targetElement as Character);
          setSelectedBubble(null);
          setSelectedPanel(null);
          if (onCharacterSelect) onCharacterSelect(targetElement as Character);
          if (onPanelSelect) onPanelSelect(null);
        } else if (target === 'bubble' && targetElement) {
          setSelectedBubble(targetElement as SpeechBubble);
          setSelectedCharacter(null);
          setSelectedPanel(null);
          if (onCharacterSelect) onCharacterSelect(null);
          if (onPanelSelect) onPanelSelect(null);
        } else if (target === 'panel' && targetElement) {
          setSelectedPanel(targetElement as Panel);
          setSelectedCharacter(null);
          setSelectedBubble(null);
          if (onPanelSelect) onPanelSelect(targetElement as Panel);
          if (onCharacterSelect) onCharacterSelect(null);
        }
        break;

      case 'characterPanel':
        if (target === 'character' && targetElement && onCharacterRightClick) {
          onCharacterRightClick(targetElement as Character);
        }
        break;

      case 'splitHorizontal':
        if (target === 'panel' && targetElement && onPanelSplit) {
          onPanelSplit((targetElement as Panel).id, 'horizontal');
        }
        break;

      case 'splitVertical':
        if (target === 'panel' && targetElement && onPanelSplit) {
          onPanelSplit((targetElement as Panel).id, 'vertical');
        }
        break;

      case 'deselect':
        setSelectedCharacter(null);
        setSelectedBubble(null);
        setSelectedPanel(null);
        if (onCharacterSelect) onCharacterSelect(null);
        if (onPanelSelect) onPanelSelect(null);
        break;
    }
    
    setContextMenu({ ...contextMenu, visible: false });
  };

  // 🆕 編集機能
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

  // 🎨 Canvas描画関数
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDarkMode = document.documentElement.getAttribute("data-theme") === "dark";

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = isDarkMode ? "#404040" : "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // グリッド描画（編集モード時のみ）
    if (showGrid && isPanelEditMode) {
      drawGrid(ctx, canvas.width, canvas.height, gridSize, isDarkMode);
    }

    // 要素描画
    drawPanels(ctx, panels, selectedPanel, isDarkMode, isPanelEditMode);
    BubbleRenderer.drawBubbles(ctx, speechBubbles, panels, selectedBubble);
    CharacterRenderer.drawCharacters(ctx, characters, panels, selectedCharacter);

    // スナップライン描画
    if (snapLines.length > 0) {
      drawSnapLines(ctx, snapLines, isDarkMode);
    }
  };

  // 🖱️ マウスイベント処理
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setContextMenu({ ...contextMenu, visible: false });

    const clickedBubble = BubbleRenderer.findBubbleAt(x, y, speechBubbles, panels);
    if (clickedBubble) {
      setSelectedBubble(clickedBubble);
      setSelectedCharacter(null);
      setSelectedPanel(null);
      if (onPanelSelect) onPanelSelect(null);
      if (onCharacterSelect) onCharacterSelect(null);
      return;
    }

    const clickedCharacter = CharacterRenderer.findCharacterAt(x, y, characters, panels);
    if (clickedCharacter) {
      setSelectedCharacter(clickedCharacter);
      setSelectedBubble(null);
      setSelectedPanel(null);
      if (onPanelSelect) onPanelSelect(null);
      if (onCharacterSelect) onCharacterSelect(clickedCharacter);
      return;
    }

    const clickedPanel = findPanelAt(x, y, panels);
    setSelectedPanel(clickedPanel || null);
    setSelectedCharacter(null);
    setSelectedBubble(null);
    if (onPanelSelect) onPanelSelect(clickedPanel || null);
    if (onCharacterSelect) onCharacterSelect(null);
  };

  const handleCanvasContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedBubble = BubbleRenderer.findBubbleAt(x, y, speechBubbles, panels);
    if (clickedBubble) {
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        target: 'bubble',
        targetElement: clickedBubble,
      });
      return;
    }

    const clickedCharacter = CharacterRenderer.findCharacterAt(x, y, characters, panels);
    if (clickedCharacter) {
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        target: 'character',
        targetElement: clickedCharacter,
      });
      return;
    }

    const clickedPanel = findPanelAt(x, y, panels);
    if (clickedPanel) {
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        target: 'panel',
        targetElement: clickedPanel,
      });
      return;
    }

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      target: null,
      targetElement: null,
    });
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

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setContextMenu({ ...contextMenu, visible: false });
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // パネル編集モード時の操作
    if (isPanelEditMode && selectedPanel) {
      const panelHandle = getPanelHandleAt(mouseX, mouseY, selectedPanel);
      
      if (panelHandle) {
        if (panelHandle.type === "delete") {
          deletePanelWithConfirmation(selectedPanel);
          e.preventDefault();
          return;
        } else if (panelHandle.type === "resize") {
          setIsPanelResizing(true);
          setResizeDirection(panelHandle.direction || "");
          setDragOffset({ x: mouseX, y: mouseY });
          e.preventDefault();
          return;
        } else if (panelHandle.type === "move") {
          setIsPanelMoving(true);
          setDragOffset({
            x: mouseX - selectedPanel.x,
            y: mouseY - selectedPanel.y,
          });
          e.preventDefault();
          return;
        } else if (panelHandle.type === "split" && onPanelSplit) {
          const direction = window.confirm("水平分割（上下）しますか？\nキャンセルで垂直分割（左右）") 
            ? "horizontal" 
            : "vertical";
          onPanelSplit(selectedPanel.id, direction);
          e.preventDefault();
          return;
        }
      }
    }

    // 吹き出し操作
    const clickedBubble = BubbleRenderer.findBubbleAt(mouseX, mouseY, speechBubbles, panels);
    if (clickedBubble) {
      setSelectedBubble(clickedBubble);
      setIsDragging(true);
      setDragOffset({
        x: mouseX - clickedBubble.x,
        y: mouseY - clickedBubble.y,
      });
      e.preventDefault();
      return;
    }

    // キャラクター操作
    const clickedCharacter = CharacterRenderer.findCharacterAt(mouseX, mouseY, characters, panels);
    if (clickedCharacter) {
      setSelectedCharacter(clickedCharacter);
      setIsDragging(true);
      setDragOffset({
        x: mouseX - clickedCharacter.x,
        y: mouseY - clickedCharacter.y,
      });
      e.preventDefault();
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging && !isPanelResizing && !isPanelMoving) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // パネルリサイズ
    if (selectedPanel && isPanelResizing) {
      const deltaX = mouseX - dragOffset.x;
      const deltaY = mouseY - dragOffset.y;
      
      const updatedPanel = resizePanel(
        selectedPanel,
        resizeDirection,
        deltaX,
        deltaY
      );
      
      setPanels(panels.map(p => p.id === selectedPanel.id ? updatedPanel : p));
      setSelectedPanel(updatedPanel);
      setDragOffset({ x: mouseX, y: mouseY });
      return;
    }

    // パネル移動
    if (selectedPanel && isPanelMoving) {
      const deltaX = mouseX - dragOffset.x - selectedPanel.x;
      const deltaY = mouseY - dragOffset.y - selectedPanel.y;
      
      const moveResult = movePanel(
        selectedPanel,
        deltaX,
        deltaY,
        canvas.width,
        canvas.height,
        snapSensitivity,
        panels
      );
      
      setPanels(panels.map(p => p.id === selectedPanel.id ? moveResult.panel : p));
      setSelectedPanel(moveResult.panel);
      setSnapLines(moveResult.snapLines);
      return;
    }

    // 吹き出し移動
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

    // キャラクター移動
    if (selectedCharacter && isDragging) {
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
      if (onCharacterSelect) onCharacterSelect(updatedCharacter);
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setIsBubbleResizing(false);
    setIsCharacterResizing(false);
    setIsPanelResizing(false);
    setIsPanelMoving(false);
    setResizeDirection("");
    setSnapLines([]);
  };

  // 🔧 機能提供用useEffect
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
      if (onCharacterSelect) onCharacterSelect(null);
    }
  }, [selectedTemplate, setPanels]);

  // 再描画
  useEffect(() => {
    drawCanvas();
  }, [panels, selectedPanel, characters, selectedCharacter, speechBubbles, selectedBubble, isPanelEditMode, snapLines.length, showGrid]);

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

  // 外部クリックでコンテキストメニューを閉じる
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu({ ...contextMenu, visible: false });
    };

    if (contextMenu.visible) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu.visible]);

  return (
    <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "100vh", padding: "0px" }}>
      <canvas
        ref={canvasRef}
        width={600}
        height={800}
        onClick={handleCanvasClick}
        onContextMenu={handleCanvasContextMenu}
        onDoubleClick={handleCanvasDoubleClick}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        style={{
          border: "2px solid #ddd",
          background: "white",
          cursor: isPanelResizing || isDragging ? "grabbing" : "pointer",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          borderRadius: "8px",
          marginTop: "0px",
        }}
      />

      {/* 🆕 右クリックコンテキストメニュー */}
      {contextMenu.visible && (
        <div
          style={{
            position: "fixed",
            top: contextMenu.y,
            left: contextMenu.x,
            background: document.documentElement.getAttribute("data-theme") === "dark" ? "#2d2d2d" : "white",
            border: `1px solid ${document.documentElement.getAttribute("data-theme") === "dark" ? "#555555" : "#ccc"}`,
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            zIndex: 1000,
            minWidth: "120px",
            color: document.documentElement.getAttribute("data-theme") === "dark" ? "#ffffff" : "#333333",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.target === 'character' && (
            <>
              <div
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  borderBottom: `1px solid ${document.documentElement.getAttribute("data-theme") === "dark" ? "#555555" : "#eee"}`,
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = document.documentElement.getAttribute("data-theme") === "dark" ? "#3d3d3d" : "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = "transparent";
                }}
                onClick={() => handleContextMenuAction('characterPanel')}
              >
                詳細設定
              </div>
              <div
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  color: "#ff4444",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = document.documentElement.getAttribute("data-theme") === "dark" ? "#3d3d3d" : "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = "transparent";
                }}
                onClick={() => handleContextMenuAction('delete')}
              >
                削除
              </div>
            </>
          )}
          
          {contextMenu.target === 'bubble' && (
            <>
              <div
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  borderBottom: `1px solid ${document.documentElement.getAttribute("data-theme") === "dark" ? "#555555" : "#eee"}`,
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = document.documentElement.getAttribute("data-theme") === "dark" ? "#3d3d3d" : "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = "transparent";
                }}
                onClick={() => handleContextMenuAction('select')}
              >
                選択
              </div>
              <div
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  color: "#ff4444",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = document.documentElement.getAttribute("data-theme") === "dark" ? "#3d3d3d" : "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = "transparent";
                }}
                onClick={() => handleContextMenuAction('delete')}
              >
                削除
              </div>
            </>
          )}
          
          {contextMenu.target === 'panel' && (
            <>
              {/* コマ編集（編集モードOFF時のみ表示） */}
              {!isPanelEditMode && (
                <div
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    borderBottom: `1px solid ${document.documentElement.getAttribute("data-theme") === "dark" ? "#555555" : "#eee"}`,
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.backgroundColor = document.documentElement.getAttribute("data-theme") === "dark" ? "#3d3d3d" : "#f5f5f5";
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.backgroundColor = "transparent";
                  }}
                  onClick={() => handleContextMenuAction('editPanel')}
                >
                  🔧 コマ編集
                </div>
              )}

              {/* 🆕 コマ複製（常に表示） */}
              <div
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  borderBottom: `1px solid ${document.documentElement.getAttribute("data-theme") === "dark" ? "#555555" : "#eee"}`,
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = document.documentElement.getAttribute("data-theme") === "dark" ? "#3d3d3d" : "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = "transparent";
                }}
                onClick={() => handleContextMenuAction('duplicate')}
              >
                📋 コマ複製
              </div>

              {/* 反転メニュー（編集モード時のみ表示） */}
              {isPanelEditMode && (
                <>
                  <div
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      borderBottom: `1px solid ${document.documentElement.getAttribute("data-theme") === "dark" ? "#555555" : "#eee"}`,
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.backgroundColor = document.documentElement.getAttribute("data-theme") === "dark" ? "#3d3d3d" : "#f5f5f5";
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.backgroundColor = "transparent";
                    }}
                    onClick={() => handleContextMenuAction('flipHorizontal')}
                  >
                    ↔️ 水平反転
                  </div>

                  <div
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      borderBottom: `1px solid ${document.documentElement.getAttribute("data-theme") === "dark" ? "#555555" : "#eee"}`,
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.backgroundColor = document.documentElement.getAttribute("data-theme") === "dark" ? "#3d3d3d" : "#f5f5f5";
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.backgroundColor = "transparent";
                    }}
                    onClick={() => handleContextMenuAction('flipVertical')}
                  >
                    ↕️ 垂直反転
                  </div>
                </>
              )}

              {/* 分割メニュー（常に表示） */}
              <div
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  borderBottom: `1px solid ${document.documentElement.getAttribute("data-theme") === "dark" ? "#555555" : "#eee"}`,
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = document.documentElement.getAttribute("data-theme") === "dark" ? "#3d3d3d" : "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = "transparent";
                }}
                onClick={() => handleContextMenuAction('splitHorizontal')}
              >
                ✂️ 水平分割
              </div>

              <div
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  borderBottom: `1px solid ${document.documentElement.getAttribute("data-theme") === "dark" ? "#555555" : "#eee"}`,
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = document.documentElement.getAttribute("data-theme") === "dark" ? "#3d3d3d" : "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = "transparent";
                }}
                onClick={() => handleContextMenuAction('splitVertical')}
              >
                ✂️ 垂直分割
              </div>

              {/* 削除（常に表示・危険色） */}
              <div
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  color: "#ff4444",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = document.documentElement.getAttribute("data-theme") === "dark" ? "#3d3d3d" : "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = "transparent";
                }}
                onClick={() => handleContextMenuAction('delete')}
              >
                🗑️ コマ削除
              </div>
            </>
          )}
          
          {!contextMenu.target && (
            <>
              <div
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = document.documentElement.getAttribute("data-theme") === "dark" ? "#3d3d3d" : "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = "transparent";
                }}
                onClick={() => handleContextMenuAction('deselect')}
              >
                選択解除
              </div>
            </>
          )}
        </div>
      )}

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
          {isPanelEditMode && <span> | 編集モード</span>}
          {isPanelMoving && <span> | 移動中</span>}
          {isPanelResizing && <span> | リサイズ中</span>}
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
          {isCharacterResizing ? "サイズ変更中" : 
          isDragging ? "移動中" : 
          selectedCharacter.name}
          <br/>
          <small>
            {selectedCharacter.isGlobalPosition ? "自由移動" : "パネル内"}
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
          {isBubbleResizing ? "サイズ変更中" : 
          isDragging ? "移動中" : 
          selectedBubble.text}
          <br/>
          <small>
            右クリックで編集・削除
          </small>
        </div>
      )}
    </div>
  );
});

CanvasComponent.displayName = 'CanvasComponent';
export default CanvasComponent;