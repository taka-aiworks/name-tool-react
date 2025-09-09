// src/components/CanvasComponent.tsx (パネル移動・削除機能修正版)
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
  onCharacterSelect,
  onCharacterRightClick,
  isPanelEditMode = false, // 🆕 コマ編集モード
  onPanelSplit, // 🆕 分割ハンドラー
  onPanelEditModeToggle, // 🆕 この行を追加
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
  const [isPanelResizing, setIsPanelResizing] = useState(false); // 🆕
  const [isPanelMoving, setIsPanelMoving] = useState(false); // 🆕
  const [resizeDirection, setResizeDirection] = useState<string>("");
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  // 🆕 スナップライン管理
  const [snapLines, setSnapLines] = useState<Array<{x1: number, y1: number, x2: number, y2: number, type: 'vertical' | 'horizontal'}>>([]);
  
  // 編集モーダル管理
  const [editingBubble, setEditingBubble] = useState<SpeechBubble | null>(null);
  const [editText, setEditText] = useState("");
  
  // 🆕 グリッド表示とスナップ設定
  const [showGrid, setShowGrid] = useState(true); // グリッド表示フラグ
  const [gridSize] = useState(20); // グリッドサイズ
  const [snapSensitivity] = useState(12); // スナップ感度（以前は15px）

  // 右クリックメニュー管理
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

  // キャラクター追加機能（新システム対応）
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

    const absoluteX = targetPanel.x + targetPanel.width * 0.5;
    const absoluteY = targetPanel.y + targetPanel.height * 0.7;

    const newCharacter: Character = {
      id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      panelId: targetPanel.id,
      type: type,
      name: characterNames[type] || "キャラクター",
      x: absoluteX,
      y: absoluteY,
      scale: 2.0,
      
      // 旧システム（後方互換性）
      facing: "front",
      gaze: "center",
      pose: "standing",
      expression: "neutral",
      faceAngle: "front",
      
      // 新システム
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
    console.log("✅ キャラクター追加成功:", newCharacter.name, "パネル:", targetPanel.id);
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

    const absoluteX = targetPanel.x + targetPanel.width * 0.5;
    const absoluteY = targetPanel.y + targetPanel.height * 0.3;

    const newBubble: SpeechBubble = {
      id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      panelId: targetPanel.id,
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
    console.log("✅ 吹き出し追加成功:", type, text, "パネル:", targetPanel.id);
  };

  // 削除機能
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
    // 削除確認ダイアログ
    const confirmed = PanelRenderer.showDeleteConfirmation(panel.id);
    if (!confirmed) {
      setContextMenu({ ...contextMenu, visible: false });
      return;
    }

    // 子要素（キャラクター・吹き出し）のIDを取得
    const { characterIdsToDelete, bubbleIdsToDelete } = PanelRenderer.deletePanelAndGetChildIds(
      panel,
      characters,
      speechBubbles
    );

    // 子要素を削除
    if (characterIdsToDelete.length > 0) {
      const newCharacters = characters.filter(char => !characterIdsToDelete.includes(char.id));
      setCharacters(newCharacters);
      console.log(`🗑️ キャラクター ${characterIdsToDelete.length} 個削除`);
    }

    if (bubbleIdsToDelete.length > 0) {
      const newBubbles = speechBubbles.filter(bubble => !bubbleIdsToDelete.includes(bubble.id));
      setSpeechBubbles(newBubbles);
      console.log(`🗑️ 吹き出し ${bubbleIdsToDelete.length} 個削除`);
    }

    // パネルを削除
    const newPanels = panels.filter(p => p.id !== panel.id);
    setPanels(newPanels);

    // 選択状態をクリア
    setSelectedPanel(null);
    setSelectedCharacter(null);
    setSelectedBubble(null);
    if (onPanelSelect) onPanelSelect(null);
    if (onCharacterSelect) onCharacterSelect(null);

    console.log(`🗑️ パネル ${panel.id} を削除（子要素含む）`);
    setContextMenu({ ...contextMenu, visible: false });
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

  // 右クリックメニューの処理
  const handleContextMenuAction = (action: string) => {
    const { target, targetElement } = contextMenu;
    
    switch (action) {
      case 'editPanel':
      if (target === 'panel' && targetElement) {
        setSelectedPanel(targetElement as Panel);
        setSelectedCharacter(null);
        setSelectedBubble(null);
        if (onPanelSelect) onPanelSelect(targetElement as Panel);
        if (onCharacterSelect) onCharacterSelect(null);
        
        // 🆕 編集モードを自動でONにする
        if (onPanelEditModeToggle) {
          onPanelEditModeToggle(true);
        }
        
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

  // 🆕 グリッド描画（編集モード時のみ）
  if (showGrid && isPanelEditMode) {
    PanelRenderer.drawGrid(ctx, canvas.width, canvas.height, gridSize, isDarkMode);
  }

  // 🆕 パネル描画でコマ編集モードを渡す
  PanelRenderer.drawPanels(ctx, panels, selectedPanel, isDarkMode, isPanelEditMode);
  
  // 🔥 ★★★ この行を追加 ★★★
  CharacterRenderer.drawCharacters(ctx, characters, panels, selectedCharacter);
  
  BubbleRenderer.drawBubbles(ctx, speechBubbles, panels, selectedBubble);
  // 🆕 スナップライン描画
  if (snapLines.length > 0) {
    PanelRenderer.drawSnapLines(ctx, snapLines, isDarkMode);
  }
};

  // 左クリック処理
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
      console.log("💬 吹き出し選択:", clickedBubble.text);
      return;
    }

    const clickedCharacter = CharacterRenderer.findCharacterAt(x, y, characters, panels);
    if (clickedCharacter) {
      setSelectedCharacter(clickedCharacter);
      setSelectedBubble(null);
      setSelectedPanel(null);
      if (onPanelSelect) onPanelSelect(null);
      if (onCharacterSelect) onCharacterSelect(clickedCharacter);
      console.log("👤 キャラクター選択:", clickedCharacter.name);
      return;
    }

    const clickedPanel = PanelRenderer.findPanelAt(x, y, panels);
    setSelectedPanel(clickedPanel || null);
    setSelectedCharacter(null);
    setSelectedBubble(null);
    if (onPanelSelect) onPanelSelect(clickedPanel || null);
    if (onCharacterSelect) onCharacterSelect(null);
    console.log("📐 パネル選択:", clickedPanel?.id || "なし");
  };

  // 右クリック処理（🆕 パネル削除メニュー追加）
  const handleCanvasContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 🔧 デバッグ用ログ追加
    console.log("右クリック座標:", x, y);
    console.log("編集モード:", isPanelEditMode);

    const clickedBubble = BubbleRenderer.findBubbleAt(x, y, speechBubbles, panels);
    if (clickedBubble) {
      console.log("吹き出しを右クリック"); // 🔧 デバッグ用
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
      console.log("キャラクターを右クリック"); // 🔧 デバッグ用
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        target: 'character',
        targetElement: clickedCharacter,
      });
      return;
    }

    const clickedPanel = PanelRenderer.findPanelAt(x, y, panels);
    console.log("パネル判定結果:", clickedPanel); // 🔧 デバッグ用
    console.log("shouldShowContextMenu:", clickedPanel ? PanelRenderer.shouldShowContextMenu(x, y, clickedPanel, isPanelEditMode) : false); // 🔧 デバッグ用
    
    if (clickedPanel) {
    // 編集モードOFFでも右クリックメニューは表示（編集開始用）
      console.log("パネルを右クリック - メニュー表示"); // 🔧 デバッグ用
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        target: 'panel',
        targetElement: clickedPanel,
      });
      return;
    }

    console.log("どの要素でもない箇所を右クリック"); // 🔧 デバッグ用
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

  // マウスダウン処理（🆕 パネル削除ハンドル対応）
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setContextMenu({ ...contextMenu, visible: false });
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 🆕 パネル編集モード時のパネル操作チェック
    if (isPanelEditMode && selectedPanel) {
      const panelHandle = PanelRenderer.getPanelHandleAt(mouseX, mouseY, selectedPanel);
      
      if (panelHandle) {
        if (panelHandle.type === "delete") {
          // 🆕 削除ハンドルクリック
          deletePanelWithConfirmation(selectedPanel);
          e.preventDefault();
          return;
        } else if (panelHandle.type === "resize") {
          setIsPanelResizing(true);
          setResizeDirection(panelHandle.direction || "");
          setDragOffset({ x: mouseX, y: mouseY }); // 🔧 開始位置を記録
          console.log(`🔧 パネルリサイズ開始: ${panelHandle.direction}`);
          e.preventDefault();
          return;
        } else if (panelHandle.type === "move") {
          setIsPanelMoving(true);
          setDragOffset({
            x: mouseX - selectedPanel.x,
            y: mouseY - selectedPanel.y,
          });
          console.log("🚀 パネル移動開始");
          e.preventDefault();
          return;
        } else if (panelHandle.type === "split" && onPanelSplit) {
          // 🆕 分割ハンドルクリック（修正版）
          const direction = window.confirm("水平分割（上下）しますか？\nキャンセルで垂直分割（左右）") 
            ? "horizontal" 
            : "vertical";
          onPanelSplit(selectedPanel.id, direction);
          console.log(`✂️ パネル分割: ${direction}`);
          e.preventDefault();
          return;
        }
      }
    }

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

    // キャラクター操作チェック
    const clickedCharacter = CharacterRenderer.findCharacterAt(mouseX, mouseY, characters, panels);
    if (clickedCharacter) {
      setSelectedCharacter(clickedCharacter);
      setSelectedBubble(null);
      setSelectedPanel(null);
      
      const panel = panels.find((p) => p.id === clickedCharacter.panelId);
      if (!panel) return;
      
      const resizeResult = CharacterRenderer.isCharacterResizeHandleClicked(mouseX, mouseY, clickedCharacter, panel);
      
      if (resizeResult.isClicked) {
        setIsCharacterResizing(true);
        setResizeDirection(resizeResult.direction);
        console.log("キャラクターリサイズ開始:", resizeResult.direction);
      } else {
        setIsDragging(true);
        
        if (clickedCharacter.isGlobalPosition) {
          setDragOffset({
            x: mouseX - clickedCharacter.x,
            y: mouseY - clickedCharacter.y,
          });
        } else {
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

  // マウス移動処理（🔧 完全修正版）
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging && !isCharacterResizing && !isBubbleResizing && !isPanelResizing && !isPanelMoving) {
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 🔧 パネルリサイズ処理（感度調整・安定化版）
    if (selectedPanel && isPanelResizing) {
      const startX = dragOffset.x;
      const startY = dragOffset.y;
      
      // 🔧 移動量を制限して感度を下げる
      let deltaX = mouseX - startX;
      let deltaY = mouseY - startY;
      
      // 大きな変化量を制限（安定性向上）
      const maxDelta = 100;
      deltaX = Math.max(-maxDelta, Math.min(maxDelta, deltaX));
      deltaY = Math.max(-maxDelta, Math.min(maxDelta, deltaY));
      
      const updatedPanel = PanelRenderer.resizePanel(
        selectedPanel,
        resizeDirection,
        deltaX,
        deltaY
      );
      
      setPanels(panels.map(p => p.id === selectedPanel.id ? updatedPanel : p));
      setSelectedPanel(updatedPanel);
      
      // 🔧 開始位置を更新（連続的なリサイズのため）
      setDragOffset({ x: mouseX, y: mouseY });
      return;
    }

    // 🚀 パネル移動処理（スナップ機能付き）
    if (selectedPanel && isPanelMoving) {
      const deltaX = mouseX - dragOffset.x - selectedPanel.x;
      const deltaY = mouseY - dragOffset.y - selectedPanel.y;
      
      // スナップ機能付き移動
      const moveResult = PanelRenderer.movePanel(
        selectedPanel,
        deltaX,
        deltaY,
        canvas.width,
        canvas.height,
        snapSensitivity, // スナップ感度
        panels // 他のパネル情報
      );
      
      setPanels(panels.map(p => p.id === selectedPanel.id ? moveResult.panel : p));
      setSelectedPanel(moveResult.panel);
      setSnapLines(moveResult.snapLines); // スナップライン更新
      return;
    }

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

    // キャラクターリサイズ処理
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

      let newScale = selectedCharacter.scale;
      
      if (resizeDirection.includes("e") || resizeDirection.includes("w")) {
        const distance = Math.abs(mouseX - charCenterX);
        newScale = Math.max(0.3, Math.min(10.0, distance / 50));
      } else if (resizeDirection.includes("n") || resizeDirection.includes("s")) {
        const distance = Math.abs(mouseY - charCenterY);
        newScale = Math.max(0.3, Math.min(10.0, distance / 50));
      } else {
        const distance = Math.sqrt(
          Math.pow(mouseX - charCenterX, 2) + Math.pow(mouseY - charCenterY, 2)
        );
        newScale = Math.max(0.3, Math.min(10.0, distance / 50));
      }
      
      const updatedCharacter = { ...selectedCharacter, scale: newScale };
      setCharacters(
        characters.map((char) =>
          char.id === selectedCharacter.id ? updatedCharacter : char
        )
      );
      setSelectedCharacter(updatedCharacter);
      if (onCharacterSelect) onCharacterSelect(updatedCharacter);
      return;
    }

    // キャラクタードラッグ処理
    if (selectedCharacter && isDragging) {
      const panel = panels.find((p) => p.id === selectedCharacter.panelId);
      if (!panel) return;

      if (selectedCharacter.isGlobalPosition) {
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
      } else {
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
        if (onCharacterSelect) onCharacterSelect(updatedCharacter);
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setIsBubbleResizing(false);
    setIsCharacterResizing(false);
    setIsPanelResizing(false); // 🆕
    setIsPanelMoving(false); // 🆕
    setResizeDirection("");
    setSnapLines([]); // 🆕 スナップラインをクリア
  };

  // 🆕 キーボードイベント処理（パネル削除対応）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        if (selectedPanel && isPanelEditMode) {
          // パネル削除（編集モード時のみ）
          deletePanelWithConfirmation(selectedPanel);
        } else if (selectedCharacter) {
          deleteElement('character', selectedCharacter);
        } else if (selectedBubble) {
          deleteElement('bubble', selectedBubble);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCharacter, selectedBubble, selectedPanel, isPanelEditMode]);

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
    <div style={{ 
      position: "relative", 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "flex-start", 
      minHeight: "100vh", 
      padding: "0px"
    }}>
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
          cursor: isBubbleResizing || isCharacterResizing || isPanelResizing
            ? "nw-resize"
            : isDragging || isPanelMoving
            ? "grabbing"
            : "pointer",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          borderRadius: "8px",
          marginTop: "0px",
        }}
      />

      {/* 右クリックコンテキストメニュー - ダークモード対応 */}
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
                onClick={() => handleContextMenuAction('edit')}
              >
                編集
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
              {/* 🆕 コマ編集メニュー項目 */}
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
                コマ編集
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
                onClick={() => handleContextMenuAction('splitHorizontal')}
              >
                水平分割
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
                垂直分割
              </div>
              {/* 🆕 パネル削除メニュー項目 */}
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
          {/* 🆕 移動状態表示 */}
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
};

export default CanvasComponent;