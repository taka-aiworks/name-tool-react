// src/components/CanvasComponent.tsx (PanelManager使用版)
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Panel, Character, SpeechBubble, CanvasComponentProps } from "../types";
import { BubbleRenderer } from "./CanvasArea/renderers/BubbleRenderer";
import { CharacterRenderer } from "./CanvasArea/renderers/CharacterRenderer";
import { PanelRenderer } from "./CanvasArea/renderers/PanelRenderer";
import { PanelManager } from "./CanvasArea/PanelManager"; // 🆕 追加
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
    snapSettings = {
      enabled: true,
      gridSize: 20,
      sensitivity: 'medium',
      gridDisplay: 'edit-only'
    }
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

  // スナップ設定から動的に値を取得
  const showGrid = snapSettings.gridDisplay === 'always' || 
                  (snapSettings.gridDisplay === 'edit-only' && isPanelEditMode);
  const gridSize = snapSettings.gridSize;

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

  // クリップボード状態
  const [clipboard, setClipboard] = useState<{
    type: 'panel' | 'character' | 'bubble';
    data: Panel | Character | SpeechBubble;
  } | null>(null);

  // 🆕 コマ複製機能（PanelManager使用版）
  const duplicatePanel = (originalPanel: Panel) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const result = PanelManager.duplicatePanel(
      originalPanel,
      panels,
      characters,
      speechBubbles,
      canvas.width,
      canvas.height
    );
    
    // 状態更新
    setPanels([...panels, result.newPanel]);
    setCharacters([...characters, ...result.newCharacters]);
    setSpeechBubbles([...speechBubbles, ...result.newBubbles]);
    
    // 新しいパネルを選択
    setSelectedPanel(result.newPanel);
    setSelectedCharacter(null);
    setSelectedBubble(null);
    if (onPanelSelect) onPanelSelect(result.newPanel);
    if (onCharacterSelect) onCharacterSelect(null);
    
    setContextMenu({ ...contextMenu, visible: false });
  };

  // キャラクター複製機能
  const duplicateCharacter = (originalCharacter: Character) => {
    console.log("🔍 キャラクター複製開始:", originalCharacter.name);
    
    const newCharacter: Character = {
      ...originalCharacter,
      id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: `${originalCharacter.name}(コピー)`,
      x: originalCharacter.x + 50,
      y: originalCharacter.y + 20,
    };
    
    // キャンバス範囲チェック
    const canvas = canvasRef.current;
    if (canvas && newCharacter.x + 60 > canvas.width) {
      newCharacter.x = originalCharacter.x - 50;
      if (newCharacter.x < 0) {
        newCharacter.x = 20;
        newCharacter.y = originalCharacter.y + 60;
      }
    }
    if (canvas && newCharacter.y + 60 > canvas.height) {
      newCharacter.y = Math.max(20, originalCharacter.y - 60);
    }
    
    setCharacters([...characters, newCharacter]);
    setSelectedCharacter(newCharacter);
    if (onCharacterSelect) onCharacterSelect(newCharacter);
    
    console.log(`✅ キャラクター複製完了: ${originalCharacter.name} → ${newCharacter.name}`);
    setContextMenu({ ...contextMenu, visible: false });
  };

  // グリッド描画（設定対応版）
  const drawGrid = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, gridSize: number, isDarkMode: boolean) => {
    if (!showGrid) return;
    
    ctx.strokeStyle = isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    for (let x = 0; x <= canvasWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }

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

  // キャラクター追加機能
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

  // 吹き出し追加機能
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

  // 要素削除機能
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

  // 🆕 パネル削除機能（PanelManager使用版）
  const deletePanelWithConfirmation = (panel: Panel) => {
    if (!PanelManager.confirmPanelDeletion(panel, characters, speechBubbles)) {
      setContextMenu({ ...contextMenu, visible: false });
      return;
    }

    const result = PanelManager.deletePanel(panel, panels, characters, speechBubbles);
    
    setPanels(result.newPanels);
    setCharacters(result.newCharacters);
    setSpeechBubbles(result.newBubbles);

    setSelectedPanel(null);
    setSelectedCharacter(null);
    setSelectedBubble(null);
    if (onPanelSelect) onPanelSelect(null);
    if (onCharacterSelect) onCharacterSelect(null);

    setContextMenu({ ...contextMenu, visible: false });
  };

  // 右クリックメニュー処理（簡略版 - 主要部分のみ残す）
  const handleContextMenuAction = (action: string) => {
    console.log("🔍 右クリックアクション実行:", action);
    
    const { target, targetElement } = contextMenu;
    
    switch (action) {
      case 'duplicateCharacter':
        if (target === 'character' && targetElement) {
          duplicateCharacter(targetElement as Character);
        }
        break;

      case 'copy':
        if (target === 'panel' && targetElement) {
          copyToClipboard('panel', targetElement as Panel);
        } else if (target === 'character' && targetElement) {
          copyToClipboard('character', targetElement as Character);
        } else if (target === 'bubble' && targetElement) {
          copyToClipboard('bubble', targetElement as SpeechBubble);
        }
        break;

      case 'paste':
        pasteFromClipboard();
        break;
        
      case 'duplicate':
        if (target === 'panel' && targetElement) {
          duplicatePanel(targetElement as Panel);
        }
        break;

      case 'delete':
        if (target === 'panel' && targetElement) {
          deletePanelWithConfirmation(targetElement as Panel);
        } else if (target && targetElement) {
          deleteElement(target as 'character' | 'bubble', targetElement as Character | SpeechBubble);
        }
        break;

      // その他のアクションは省略（必要に応じて後で追加）
    }
    
    setContextMenu({ ...contextMenu, visible: false });
  };

  // コピー機能
  const copyToClipboard = (type: 'panel' | 'character' | 'bubble', element: Panel | Character | SpeechBubble) => {
    setClipboard({ type, data: element });
    console.log(`📋 ${type}をクリップボードにコピー:`, element);
  };

  // ペースト機能
  const pasteFromClipboard = () => {
    if (!clipboard) {
      console.log("❌ クリップボードが空です");
      return;
    }

    const { type, data } = clipboard;
    
    switch (type) {
      case 'panel':
        duplicatePanel(data as Panel);
        break;
        
      case 'character':
        duplicateCharacter(data as Character);
        break;
        
      case 'bubble':
        const originalBubble = data as SpeechBubble;
        const newBubble: SpeechBubble = {
          ...originalBubble,
          id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          text: `${originalBubble.text}(コピー)`,
          x: originalBubble.x + 30,
          y: originalBubble.y + 30,
        };
        
        setSpeechBubbles([...speechBubbles, newBubble]);
        setSelectedBubble(newBubble);
        console.log(`✅ 吹き出し複製完了: ${originalBubble.text} → ${newBubble.text}`);
        break;
    }
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

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = isDarkMode ? "#404040" : "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height, gridSize, isDarkMode);
    }

    drawPanels(ctx, panels, selectedPanel, isDarkMode, isPanelEditMode);
    BubbleRenderer.drawBubbles(ctx, speechBubbles, panels, selectedBubble);
    CharacterRenderer.drawCharacters(ctx, characters, panels, selectedCharacter);

    if (snapLines.length > 0) {
      drawSnapLines(ctx, snapLines, isDarkMode);
    }
  };

  // キーボードイベントハンドラー
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      if (selectedPanel) {
        copyToClipboard('panel', selectedPanel);
      } else if (selectedCharacter) {
        copyToClipboard('character', selectedCharacter);
      } else if (selectedBubble) {
        copyToClipboard('bubble', selectedBubble);
      }
    }
    
    if (e.ctrlKey && e.key === 'v') {
      e.preventDefault();
      pasteFromClipboard();
    }
    
    if (e.key === 'Delete') {
      e.preventDefault();
      if (selectedPanel) {
        deletePanelWithConfirmation(selectedPanel);
      } else if (selectedCharacter) {
        deleteElement('character', selectedCharacter);
      } else if (selectedBubble) {
        deleteElement('bubble', selectedBubble);
      }
    }
  };

  // マウスイベント処理（主要部分のみ - PanelManager使用版）
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

    const clickedPanel = PanelManager.findPanelAt(x, y, panels); // 🆕 PanelManager使用
    setSelectedPanel(clickedPanel || null);
    setSelectedCharacter(null);
    setSelectedBubble(null);
    if (onPanelSelect) onPanelSelect(clickedPanel || null);
    if (onCharacterSelect) onCharacterSelect(null);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setContextMenu({ ...contextMenu, visible: false });
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 🆕 パネル編集モード時の操作（PanelManager使用版）
    if (isPanelEditMode && selectedPanel) {
      const panelHandle = PanelManager.getPanelHandleAt(mouseX, mouseY, selectedPanel);
      
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

    // 🆕 パネルリサイズ（PanelManager使用版）
    if (selectedPanel && isPanelResizing) {
      const deltaX = mouseX - dragOffset.x;
      const deltaY = mouseY - dragOffset.y;
      
      const updatedPanel = PanelManager.resizePanel(
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

    // 🆕 パネル移動（PanelManager使用版）
    if (selectedPanel && isPanelMoving) {
      const deltaX = mouseX - dragOffset.x - selectedPanel.x;
      const deltaY = mouseY - dragOffset.y - selectedPanel.y;
      
      const moveResult = PanelManager.movePanel(
        selectedPanel,
        deltaX,
        deltaY,
        canvas.width,
        canvas.height,
        snapSettings,
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

    const clickedPanel = PanelManager.findPanelAt(x, y, panels); // 🆕 PanelManager使用
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

  // useEffect群
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedPanel, selectedCharacter, selectedBubble, clipboard]);

  useEffect(() => {
    onCharacterAdd(addCharacter);
  }, [selectedPanel, characters]);

  useEffect(() => {
    onBubbleAdd(addBubble);
  }, [selectedPanel, speechBubbles]);

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

  useEffect(() => {
    drawCanvas();
  }, [panels, selectedPanel, characters, selectedCharacter, speechBubbles, selectedBubble, isPanelEditMode, snapLines.length, showGrid, snapSettings]);

  useEffect(() => {
    const handleThemeChange = () => drawCanvas();
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

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

      {/* クリップボード状態表示 */}
      {clipboard && (
        <div
          style={{
            position: "absolute",
            top: "100px",
            right: "10px",
            background: "rgba(128, 128, 128, 0.9)",
            color: "white",
            padding: "6px 10px",
            borderRadius: "4px",
            fontSize: "11px",
            fontWeight: "bold",
          }}
        >
          📋 クリップボード: {clipboard.type}
          <br/>
          <small>Ctrl+Vでペースト</small>
        </div>
      )}

      {/* スナップ設定状態表示 */}
      {snapSettings.enabled && (
        <div
          style={{
            position: "absolute",
            top: "130px",
            right: "10px",
            background: "rgba(76, 175, 80, 0.9)",
            color: "white",
            padding: "6px 10px",
            borderRadius: "4px",
            fontSize: "11px",
            fontWeight: "bold",
          }}
        >
          ⚙️ スナップ: {snapSettings.gridSize}px ({snapSettings.sensitivity})
          <br/>
          <small>グリッド: {snapSettings.gridDisplay === 'always' ? '常時' : snapSettings.gridDisplay === 'edit-only' ? '編集時' : '非表示'}</small>
        </div>
      )}

      {/* 右クリックコンテキストメニュー（簡略版） */}
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
              <div onClick={() => handleContextMenuAction('duplicateCharacter')} style={{ padding: "8px 12px", cursor: "pointer" }}>
                👥 キャラクター複製
              </div>
              <div onClick={() => handleContextMenuAction('copy')} style={{ padding: "8px 12px", cursor: "pointer" }}>
                📋 コピー (Ctrl+C)
              </div>
              <div onClick={() => handleContextMenuAction('delete')} style={{ padding: "8px 12px", cursor: "pointer", color: "#ff4444" }}>
                削除
              </div>
            </>
          )}
          
          {contextMenu.target === 'bubble' && (
            <>
              <div onClick={() => handleContextMenuAction('copy')} style={{ padding: "8px 12px", cursor: "pointer" }}>
                📋 コピー (Ctrl+C)
              </div>
              <div onClick={() => handleContextMenuAction('delete')} style={{ padding: "8px 12px", cursor: "pointer", color: "#ff4444" }}>
                削除
              </div>
            </>
          )}
          
          {contextMenu.target === 'panel' && (
            <>
              <div onClick={() => handleContextMenuAction('duplicate')} style={{ padding: "8px 12px", cursor: "pointer" }}>
                📋 コマ複製
              </div>
              <div onClick={() => handleContextMenuAction('copy')} style={{ padding: "8px 12px", cursor: "pointer" }}>
                📋 コピー (Ctrl+C)
              </div>
              <div onClick={() => handleContextMenuAction('delete')} style={{ padding: "8px 12px", cursor: "pointer", color: "#ff4444" }}>
                🗑️ コマ削除
              </div>
            </>
          )}
          
          {!contextMenu.target && clipboard && (
            <div onClick={() => handleContextMenuAction('paste')} style={{ padding: "8px 12px", cursor: "pointer" }}>
              📌 ペースト (Ctrl+V) - {clipboard.type}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

CanvasComponent.displayName = 'CanvasComponent';
export default CanvasComponent;// src/components/CanvasComponent.tsx (ContextMenuHandler統合版)
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Panel, Character, SpeechBubble, CanvasComponentProps } from "../types";
import { BubbleRenderer } from "./CanvasArea/renderers/BubbleRenderer";
import { CharacterRenderer } from "./CanvasArea/renderers/CharacterRenderer";
import { PanelRenderer } from "./CanvasArea/renderers/PanelRenderer";
import { PanelManager } from "./CanvasArea/PanelManager";
import { ContextMenuHandler, ContextMenuState, ClipboardState, ContextMenuActions } from "./CanvasArea/ContextMenuHandler"; // 🆕 追加
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
    snapSettings = {
      enabled: true,
      gridSize: 20,
      sensitivity: 'medium',
      gridDisplay: 'edit-only'
    }
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

  // スナップ設定から動的に値を取得
  const showGrid = snapSettings.gridDisplay === 'always' || 
                  (snapSettings.gridDisplay === 'edit-only' && isPanelEditMode);
  const gridSize = snapSettings.gridSize;

  // 🆕 ContextMenuHandler用の状態
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    target: null,
    targetElement: null,
  });

  const [clipboard, setClipboard] = useState<ClipboardState | null>(null);

  // 🆕 ContextMenuHandler用のアクション定義
  const contextMenuActions: ContextMenuActions = {
    onDuplicateCharacter: (character: Character) => {
      const canvas = canvasRef.current;
      const newCharacter = ContextMenuHandler.duplicateCharacter(
        character,
        canvas?.width || 600,
        canvas?.height || 800
      );
      setCharacters([...characters, newCharacter]);
      setSelectedCharacter(newCharacter);
      if (onCharacterSelect) onCharacterSelect(newCharacter);
    },

    onDuplicatePanel: (panel: Panel) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const result = PanelManager.duplicatePanel(
        panel,
        panels,
        characters,
        speechBubbles,
        canvas.width,
        canvas.height
      );
      
      setPanels([...panels, result.newPanel]);
      setCharacters([...characters, ...result.newCharacters]);
      setSpeechBubbles([...speechBubbles, ...result.newBubbles]);
      
      setSelectedPanel(result.newPanel);
      setSelectedCharacter(null);
      setSelectedBubble(null);
      if (onPanelSelect) onPanelSelect(result.newPanel);
      if (onCharacterSelect) onCharacterSelect(null);
    },

    onCopyToClipboard: (type: 'panel' | 'character' | 'bubble', element: Panel | Character | SpeechBubble) => {
      const newClipboard = ContextMenuHandler.copyToClipboard(type, element);
      setClipboard(newClipboard);
    },

    onPasteFromClipboard: () => {
      if (!clipboard) return;

      const { type, data } = clipboard;
      
      switch (type) {
        case 'panel':
          contextMenuActions.onDuplicatePanel(data as Panel);
          break;
          
        case 'character':
          contextMenuActions.onDuplicateCharacter(data as Character);
          break;
          
        case 'bubble':
          const newBubble = ContextMenuHandler.duplicateBubble(data as SpeechBubble);
          setSpeechBubbles([...speechBubbles, newBubble]);
          setSelectedBubble(newBubble);
          break;
      }
    },

    onDeleteElement: (type: 'character' | 'bubble', element: Character | SpeechBubble) => {
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
    },

    onDeletePanel: (panel: Panel) => {
      if (!PanelManager.confirmPanelDeletion(panel, characters, speechBubbles)) {
        return;
      }

      const result = PanelManager.deletePanel(panel, panels, characters, speechBubbles);
      
      setPanels(result.newPanels);
      setCharacters(result.newCharacters);
      setSpeechBubbles(result.newBubbles);

      setSelectedPanel(null);
      setSelectedCharacter(null);
      setSelectedBubble(null);
      if (onPanelSelect) onPanelSelect(null);
      if (onCharacterSelect) onCharacterSelect(null);
    },

    onFlipHorizontal: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const result = ContextMenuHandler.flipElements(
        'horizontal',
        panels,
        characters,
        speechBubbles,
        canvas.width,
        canvas.height
      );

      setPanels(result.panels);
      setCharacters(result.characters);
      setSpeechBubbles(result.speechBubbles);
    },

    onFlipVertical: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const result = ContextMenuHandler.flipElements(
        'vertical',
        panels,
        characters,
        speechBubbles,
        canvas.width,
        canvas.height
      );

      setPanels(result.panels);
      setCharacters(result.characters);
      setSpeechBubbles(result.speechBubbles);
    },

    onEditPanel: (panel: Panel) => {
      setSelectedPanel(panel);
      setSelectedCharacter(null);
      setSelectedBubble(null);
      if (onPanelSelect) onPanelSelect(panel);
      if (onCharacterSelect) onCharacterSelect(null);
      if (onPanelEditModeToggle) onPanelEditModeToggle(true);
      console.log("コマ編集モード開始:", panel.id);
    },

    onSplitPanel: (panel: Panel, direction: 'horizontal' | 'vertical') => {
      if (onPanelSplit) {
        onPanelSplit(panel.id, direction);
      }
    },

    onSelectElement: (type: 'character' | 'bubble' | 'panel', element: Character | SpeechBubble | Panel) => {
      if (type === 'character') {
        setSelectedCharacter(element as Character);
        setSelectedBubble(null);
        setSelectedPanel(null);
        if (onCharacterSelect) onCharacterSelect(element as Character);
        if (onPanelSelect) onPanelSelect(null);
      } else if (type === 'bubble') {
        setSelectedBubble(element as SpeechBubble);
        setSelectedCharacter(null);
        setSelectedPanel(null);
        if (onCharacterSelect) onCharacterSelect(null);
        if (onPanelSelect) onPanelSelect(null);
      } else if (type === 'panel') {
        setSelectedPanel(element as Panel);
        setSelectedCharacter(null);
        setSelectedBubble(null);
        if (onPanelSelect) onPanelSelect(element as Panel);
        if (onCharacterSelect) onCharacterSelect(null);
      }
    },

    onOpenCharacterPanel: (character: Character) => {
      if (onCharacterRightClick) {
        onCharacterRightClick(character);
      }
    },

    onDeselectAll: () => {
      setSelectedCharacter(null);
      setSelectedBubble(null);
      setSelectedPanel(null);
      if (onCharacterSelect) onCharacterSelect(null);
      if (onPanelSelect) onPanelSelect(null);
    },
  };

  // 🆕 ContextMenuHandler統合版のアクション処理
  const handleContextMenuAction = (action: string) => {
    ContextMenuHandler.handleAction(action, contextMenu, contextMenuActions);
    setContextMenu({ ...contextMenu, visible: false });
  };

  // グリッド描画
  const drawGrid = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, gridSize: number, isDarkMode: boolean) => {
    if (!showGrid) return;
    
    ctx.strokeStyle = isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    for (let x = 0; x <= canvasWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }

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

  // キャラクター追加機能
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

  // 吹き出し追加機能
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

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = isDarkMode ? "#404040" : "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height, gridSize, isDarkMode);
    }

    drawPanels(ctx, panels, selectedPanel, isDarkMode, isPanelEditMode);
    BubbleRenderer.drawBubbles(ctx, speechBubbles, panels, selectedBubble);
    CharacterRenderer.drawCharacters(ctx, characters, panels, selectedCharacter);

    if (snapLines.length > 0) {
      drawSnapLines(ctx, snapLines, isDarkMode);
    }
  };

  // キーボードイベントハンドラー
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      if (selectedPanel) {
        contextMenuActions.onCopyToClipboard('panel', selectedPanel);
      } else if (selectedCharacter) {
        contextMenuActions.onCopyToClipboard('character', selectedCharacter);
      } else if (selectedBubble) {
        contextMenuActions.onCopyToClipboard('bubble', selectedBubble);
      }
    }
    
    if (e.ctrlKey && e.key === 'v') {
      e.preventDefault();
      contextMenuActions.onPasteFromClipboard();
    }
    
    if (e.key === 'Delete') {
      e.preventDefault();
      if (selectedPanel) {
        contextMenuActions.onDeletePanel(selectedPanel);
      } else if (selectedCharacter) {
        contextMenuActions.onDeleteElement('character', selectedCharacter);
      } else if (selectedBubble) {
        contextMenuActions.onDeleteElement('bubble', selectedBubble);
      }
    }
  };

  // マウスイベント処理（PanelManager使用版）
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

    const clickedPanel = PanelManager.findPanelAt(x, y, panels);
    setSelectedPanel(clickedPanel || null);
    setSelectedCharacter(null);
    setSelectedBubble(null);
    if (onPanelSelect) onPanelSelect(clickedPanel || null);
    if (onCharacterSelect) onCharacterSelect(null);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setContextMenu({ ...contextMenu, visible: false });
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // パネル編集モード時の操作（PanelManager使用版）
    if (isPanelEditMode && selectedPanel) {
      const panelHandle = PanelManager.getPanelHandleAt(mouseX, mouseY, selectedPanel);
      
      if (panelHandle) {
        if (panelHandle.type === "delete") {
          contextMenuActions.onDeletePanel(selectedPanel);
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

    // パネルリサイズ（PanelManager使用版）
    if (selectedPanel && isPanelResizing) {
      const deltaX = mouseX - dragOffset.x;
      const deltaY = mouseY - dragOffset.y;
      
      const updatedPanel = PanelManager.resizePanel(
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

    // パネル移動（PanelManager使用版）
    if (selectedPanel && isPanelMoving) {
      const deltaX = mouseX - dragOffset.x - selectedPanel.x;
      const deltaY = mouseY - dragOffset.y - selectedPanel.y;
      
      const moveResult = PanelManager.movePanel(
        selectedPanel,
        deltaX,
        deltaY,
        canvas.width,
        canvas.height,
        snapSettings,
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

    const clickedPanel = PanelManager.findPanelAt(x, y, panels);
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

  // useEffect群
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedPanel, selectedCharacter, selectedBubble, clipboard]);

  useEffect(() => {
    onCharacterAdd(addCharacter);
  }, [selectedPanel, characters]);

  useEffect(() => {
    onBubbleAdd(addBubble);
  }, [selectedPanel, speechBubbles]);

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

  useEffect(() => {
    drawCanvas();
  }, [panels, selectedPanel, characters, selectedCharacter, speechBubbles, selectedBubble, isPanelEditMode, snapLines.length, showGrid, snapSettings]);

  useEffect(() => {
    const handleThemeChange = () => drawCanvas();
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

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

      {/* 編集モーダル */}
      <EditBubbleModal
        editingBubble={editingBubble}
        editText={editText}
        setEditText={setEditText}
        onComplete={handleEditComplete}
        onCancel={handleEditCancel}
      />

      {/* 🆕 ContextMenuHandlerを使用した右クリックメニュー */}
      {ContextMenuHandler.renderContextMenu(
        contextMenu,
        clipboard,
        isPanelEditMode,
        handleContextMenuAction,
        (e: React.MouseEvent) => e.stopPropagation()
      )}

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

      {/* クリップボード状態表示 */}
      {clipboard && (
        <div
          style={{
            position: "absolute",
            top: "100px",
            right: "10px",
            background: "rgba(128, 128, 128, 0.9)",
            color: "white",
            padding: "6px 10px",
            borderRadius: "4px",
            fontSize: "11px",
            fontWeight: "bold",
          }}
        >
          📋 クリップボード: {clipboard.type}
          <br/>
          <small>Ctrl+Vでペースト</small>
        </div>
      )}

      {/* スナップ設定状態表示 */}
      {snapSettings.enabled && (
        <div
          style={{
            position: "absolute",
            top: "130px",
            right: "10px",
            background: "rgba(76, 175, 80, 0.9)",
            color: "white",
            padding: "6px 10px",
            borderRadius: "4px",
            fontSize: "11px",
            fontWeight: "bold",
          }}
        >
          ⚙️ スナップ: {snapSettings.gridSize}px ({snapSettings.sensitivity})
          <br/>
          <small>グリッド: {snapSettings.gridDisplay === 'always' ? '常時' : snapSettings.gridDisplay === 'edit-only' ? '編集時' : '非表示'}</small>
        </div>
      )}
    </div>
  );
});

CanvasComponent.displayName = 'CanvasComponent';
export default CanvasComponent;