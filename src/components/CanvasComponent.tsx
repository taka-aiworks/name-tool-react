// src/components/CanvasComponent.tsx (リサイズ機能完全修正版)
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Panel, Character, SpeechBubble, CanvasComponentProps } from "../types";
import { BubbleRenderer } from "./CanvasArea/renderers/BubbleRenderer";
import { CharacterRenderer } from "./CanvasArea/renderers/CharacterRenderer";
import { PanelManager } from "./CanvasArea/PanelManager";
import { ContextMenuHandler, ContextMenuState, ClipboardState, ContextMenuActions } from "./CanvasArea/ContextMenuHandler";
import { CanvasDrawing } from "./CanvasArea/CanvasDrawing";
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
  
  // 🆕 ドラッグ&操作状態（詳細管理）
  const [isDragging, setIsDragging] = useState(false);
  const [isCharacterResizing, setIsCharacterResizing] = useState(false);
  const [isBubbleResizing, setIsBubbleResizing] = useState(false);
  const [isPanelResizing, setIsPanelResizing] = useState(false);
  const [isPanelMoving, setIsPanelMoving] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>("");
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // 🆕 リサイズ開始時の初期値保存
  const [initialBubbleBounds, setInitialBubbleBounds] = useState<{
    x: number; y: number; width: number; height: number;
  } | null>(null);
  const [initialCharacterScale, setInitialCharacterScale] = useState<number>(1.0);
  
  // UI状態
  const [snapLines, setSnapLines] = useState<Array<{x1: number, y1: number, x2: number, y2: number, type: 'vertical' | 'horizontal'}>>([]);
  const [editingBubble, setEditingBubble] = useState<SpeechBubble | null>(null);
  const [editText, setEditText] = useState("");

  // スナップ設定から動的に値を取得
  const showGrid = snapSettings.gridDisplay === 'always' || 
                  (snapSettings.gridDisplay === 'edit-only' && isPanelEditMode);
  const gridSize = snapSettings.gridSize;

  // ContextMenuHandler用の状態
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    target: null,
    targetElement: null,
  });

  const [clipboard, setClipboard] = useState<ClipboardState | null>(null);

  // ContextMenuHandler用のアクション定義
  const contextMenuActions: ContextMenuActions = {
    onDuplicateCharacter: (character: Character) => {
      const canvas = canvasRef.current;
      const newCharacter = {
        ...character,
        id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: `${character.name}(コピー)`,
        x: character.x + 30,
        y: character.y + 30,
      };
      setCharacters([...characters, newCharacter]);
      setSelectedCharacter(newCharacter);
      if (onCharacterSelect) onCharacterSelect(newCharacter);
    },

    onDuplicatePanel: (panel: Panel) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // 新しいパネルID生成
      const maxId = Math.max(...panels.map(p => p.id), 0);
      const newPanelId = maxId + 1;
      
      // パネルを右側に複製
      const newPanel: Panel = {
        ...panel,
        id: newPanelId,
        x: panel.x + panel.width + 10,
        y: panel.y
      };
      
      // キャンバス範囲チェック
      if (newPanel.x + newPanel.width > canvas.width) {
        newPanel.x = panel.x;
        newPanel.y = panel.y + panel.height + 10;
        
        if (newPanel.y + newPanel.height > canvas.height) {
          newPanel.x = Math.max(0, panel.x - panel.width - 10);
          newPanel.y = panel.y;
        }
      }
      
      // パネル内のキャラクターを複製
      const panelCharacters = characters.filter(char => char.panelId === panel.id);
      const newCharacters = panelCharacters.map(char => ({
        ...char,
        id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        panelId: newPanelId,
      }));
      
      // パネル内の吹き出しを複製
      const panelBubbles = speechBubbles.filter(bubble => bubble.panelId === panel.id);
      const newBubbles = panelBubbles.map(bubble => ({
        ...bubble,
        id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        panelId: newPanelId,
      }));
      
      setPanels([...panels, newPanel]);
      setCharacters([...characters, ...newCharacters]);
      setSpeechBubbles([...speechBubbles, ...newBubbles]);
      
      setSelectedPanel(newPanel);
      setSelectedCharacter(null);
      setSelectedBubble(null);
      if (onPanelSelect) onPanelSelect(newPanel);
      if (onCharacterSelect) onCharacterSelect(null);
    },

    onCopyToClipboard: (type: 'panel' | 'character' | 'bubble', element: Panel | Character | SpeechBubble) => {
      const newClipboard = { type, data: element };
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
          const newBubble = {
            ...data as SpeechBubble,
            id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            text: `${(data as SpeechBubble).text}(コピー)`,
            x: (data as SpeechBubble).x + 30,
            y: (data as SpeechBubble).y + 30,
          };
          setSpeechBubbles([...speechBubbles, newBubble]);
          setSelectedBubble(newBubble);
          break;
      }
      
      // ペースト後にクリップボードをクリア
      setClipboard(null);
    },

    onDeleteElement: (type: 'character' | 'bubble', element: Character | SpeechBubble) => {
      if (type === 'character') {
        const newCharacters = characters.filter(char => char.id !== element.id);
        setCharacters(newCharacters);
        setSelectedCharacter(null);
        if (onCharacterSelect) onCharacterSelect(null);
        console.log("キャラクター削除:", (element as Character).name);
      } else if (type === 'bubble') {
        const newBubbles = speechBubbles.filter(bubble => bubble.id !== element.id);
        setSpeechBubbles(newBubbles);
        setSelectedBubble(null);
        console.log("吹き出し削除:", (element as SpeechBubble).text);
      }
    },

    onDeletePanel: (panel: Panel) => {
      // 削除確認
      const panelCharacters = characters.filter(char => char.panelId === panel.id);
      const panelBubbles = speechBubbles.filter(bubble => bubble.panelId === panel.id);
      
      let confirmMessage = `コマ ${panel.id} を削除しますか？`;
      if (panelCharacters.length > 0 || panelBubbles.length > 0) {
        confirmMessage += `\n含まれる要素も一緒に削除されます:`;
        if (panelCharacters.length > 0) {
          confirmMessage += `\n・キャラクター: ${panelCharacters.length}体`;
        }
        if (panelBubbles.length > 0) {
          confirmMessage += `\n・吹き出し: ${panelBubbles.length}個`;
        }
      }
      
      if (!window.confirm(confirmMessage)) {
        return;
      }

      // 削除実行
      const newPanels = panels.filter(p => p.id !== panel.id);
      const newCharacters = characters.filter(char => char.panelId !== panel.id);
      const newBubbles = speechBubbles.filter(bubble => bubble.panelId !== panel.id);
      
      setPanels(newPanels);
      setCharacters(newCharacters);
      setSpeechBubbles(newBubbles);

      setSelectedPanel(null);
      setSelectedCharacter(null);
      setSelectedBubble(null);
      if (onPanelSelect) onPanelSelect(null);
      if (onCharacterSelect) onCharacterSelect(null);
      
      console.log(`コマ${panel.id}を削除しました`);
    },

    onFlipHorizontal: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // 水平反転処理
      const flippedPanels = panels.map(panel => ({
        ...panel,
        x: canvas.width - panel.x - panel.width
      }));
      const flippedCharacters = characters.map(char => ({
        ...char,
        x: char.isGlobalPosition ? canvas.width - char.x : 1 - char.x
      }));
      const flippedBubbles = speechBubbles.map(bubble => ({
        ...bubble,
        x: bubble.isGlobalPosition ? canvas.width - bubble.x : bubble.x
      }));

      setPanels(flippedPanels);
      setCharacters(flippedCharacters);
      setSpeechBubbles(flippedBubbles);
    },

    onFlipVertical: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // 垂直反転処理
      const flippedPanels = panels.map(panel => ({
        ...panel,
        y: canvas.height - panel.y - panel.height
      }));
      const flippedCharacters = characters.map(char => ({
        ...char,
        y: char.isGlobalPosition ? canvas.height - char.y : 1 - char.y
      }));
      const flippedBubbles = speechBubbles.map(bubble => ({
        ...bubble,
        y: bubble.isGlobalPosition ? canvas.height - bubble.y : bubble.y
      }));

      setPanels(flippedPanels);
      setCharacters(flippedCharacters);
      setSpeechBubbles(flippedBubbles);
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

  // ContextMenuHandler統合版のアクション処理
  const handleContextMenuAction = (action: string) => {
    ContextMenuHandler.handleAction(action, contextMenu, contextMenuActions);
    setContextMenu({ ...contextMenu, visible: false });
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
    
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      if (selectedPanel) {
        contextMenuActions.onDeletePanel(selectedPanel);
      } else if (selectedCharacter) {
        contextMenuActions.onDeleteElement('character', selectedCharacter);
      } else if (selectedBubble) {
        contextMenuActions.onDeleteElement('bubble', selectedBubble);
      }
    }

    // Escape: 選択解除＆クリップボードクリア
    if (e.key === 'Escape') {
      e.preventDefault();
      setSelectedPanel(null);
      setSelectedCharacter(null);
      setSelectedBubble(null);
      setClipboard(null);
      if (onPanelSelect) onPanelSelect(null);
      if (onCharacterSelect) onCharacterSelect(null);
    }
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

  // Canvas描画関数（CanvasDrawing使用版）
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDarkMode = document.documentElement.getAttribute("data-theme") === "dark";

    CanvasDrawing.clearCanvas(ctx, canvas.width, canvas.height);
    CanvasDrawing.drawBackground(ctx, canvas.width, canvas.height, isDarkMode);

    if (showGrid) {
      CanvasDrawing.drawGrid(ctx, canvas.width, canvas.height, gridSize, isDarkMode);
    }

    CanvasDrawing.drawPanels(ctx, panels, selectedPanel, isDarkMode, isPanelEditMode);
    BubbleRenderer.drawBubbles(ctx, speechBubbles, panels, selectedBubble);
    CharacterRenderer.drawCharacters(ctx, characters, panels, selectedCharacter);

    if (snapLines.length > 0) {
      CanvasDrawing.drawSnapLines(ctx, snapLines, isDarkMode);
    }
  };

  // 🆕 マウスイベント処理（完全修正版）
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

  // 🆕 マウスダウン処理（完全修正版）
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setContextMenu({ ...contextMenu, visible: false });
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    console.log("🖱️ マウスダウン:", { mouseX, mouseY });

    // パネル編集モード時の操作
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

    // 🔧 吹き出し操作（修正版）
    const clickedBubble = BubbleRenderer.findBubbleAt(mouseX, mouseY, speechBubbles, panels);
    if (clickedBubble) {
      console.log("🎯 吹き出しクリック検出:", clickedBubble.text);
      
      setSelectedBubble(clickedBubble);
      setSelectedCharacter(null);
      setSelectedPanel(null);
      
      // 🔧 パネル検索を確実に
      const panel = panels.find(p => p.id === clickedBubble.panelId) || panels[0];
      if (!panel) {
        console.error("❌ パネルが見つかりません");
        return;
      }
      
      // 🔧 リサイズハンドル判定（厳格版）
      const resizeResult = BubbleRenderer.isBubbleResizeHandleClicked(mouseX, mouseY, clickedBubble, panel);
      
      console.log("🔍 吹き出しリサイズハンドル判定:", {
        isClicked: resizeResult.isClicked,
        direction: resizeResult.direction,
        mousePos: { mouseX, mouseY },
        bubblePos: { x: clickedBubble.x, y: clickedBubble.y },
        bubbleSize: { width: clickedBubble.width, height: clickedBubble.height }
      });
      
      if (resizeResult.isClicked) {
        console.log("✅ 吹き出しリサイズモード開始:", resizeResult.direction);
        setIsBubbleResizing(true);
        setResizeDirection(resizeResult.direction);
        setDragOffset({ x: mouseX, y: mouseY });
        setInitialBubbleBounds({
          x: clickedBubble.x,
          y: clickedBubble.y,
          width: clickedBubble.width,
          height: clickedBubble.height
        });
      } else {
        console.log("📱 吹き出しドラッグモード開始");
        setIsDragging(true);
        setDragOffset({
          x: mouseX - clickedBubble.x,
          y: mouseY - clickedBubble.y,
        });
      }
      e.preventDefault();
      return;
    }

    // 🔧 キャラクター操作（修正版）
    const clickedCharacter = CharacterRenderer.findCharacterAt(mouseX, mouseY, characters, panels);
    if (clickedCharacter) {
      console.log("👤 キャラクタークリック検出:", clickedCharacter.name);
      
      setSelectedCharacter(clickedCharacter);
      setSelectedBubble(null);
      setSelectedPanel(null);
      
      // 🔧 パネル検索を確実に
      const panel = panels.find(p => p.id === clickedCharacter.panelId);
      if (!panel) {
        console.error("❌ キャラクターのパネルが見つかりません");
        return;
      }
      
      // 🔧 キャラクターリサイズハンドル判定（厳格版）
      const resizeResult = CharacterRenderer.isCharacterResizeHandleClicked(mouseX, mouseY, clickedCharacter, panel);
      
      console.log("🔍 キャラクターリサイズハンドル判定:", {
        isClicked: resizeResult.isClicked,
        direction: resizeResult.direction,
        mousePos: { mouseX, mouseY },
        characterPos: { x: clickedCharacter.x, y: clickedCharacter.y },
        scale: clickedCharacter.scale
      });
      
      if (resizeResult.isClicked) {
        console.log("✅ キャラクターリサイズモード開始:", resizeResult.direction);
        setIsCharacterResizing(true);
        setResizeDirection(resizeResult.direction);
        setDragOffset({ x: mouseX, y: mouseY });
        setInitialCharacterScale(clickedCharacter.scale);
      } else {
        console.log("📱 キャラクタードラッグモード開始");
        setIsDragging(true);
        setDragOffset({
          x: mouseX - clickedCharacter.x,
          y: mouseY - clickedCharacter.y,
        });
      }
      
      if (onCharacterSelect) onCharacterSelect(clickedCharacter);
      e.preventDefault();
      return;
    }

    // その他のクリック処理
    const clickedPanel = PanelManager.findPanelAt(mouseX, mouseY, panels);
    if (clickedPanel) {
      setSelectedPanel(clickedPanel);
      setSelectedCharacter(null);
      setSelectedBubble(null);
      if (onPanelSelect) onPanelSelect(clickedPanel);
      if (onCharacterSelect) onCharacterSelect(null);
    } else {
      // 背景クリック：すべて選択解除
      setSelectedPanel(null);
      setSelectedCharacter(null);
      setSelectedBubble(null);
      if (onPanelSelect) onPanelSelect(null);
      if (onCharacterSelect) onCharacterSelect(null);
    }
  };

  // 🆕 マウス移動処理（完全修正版）
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 🔧 状態確認ログ（デバッグ用）
    console.log("🖱️ マウス移動イベント発生");
    console.log("🔍 状態確認:", {
      isDragging,
      isBubbleResizing,
      isCharacterResizing,
      isPanelResizing,
      isPanelMoving,
      resizeDirection
    });

    // 何も操作していない場合は早期リターン
    if (!isDragging && !isPanelResizing && !isPanelMoving && !isCharacterResizing && !isBubbleResizing) {
      console.log("❌ 移動処理スキップ: 操作中のアイテムなし");
      return;
    }

    // 🆕 吹き出しリサイズ処理（8方向対応・完全修正版）
    if (selectedBubble && isBubbleResizing && initialBubbleBounds) {
      console.log("🔧 吹き出しリサイズ実行中:", resizeDirection);
      
      const deltaX = mouseX - dragOffset.x;
      const deltaY = mouseY - dragOffset.y;
      
      console.log("🔍 リサイズデルタ:", { deltaX, deltaY });
      
      // BubbleRenderer.resizeBubble を使用
      const resizedBubble = BubbleRenderer.resizeBubble(
        selectedBubble,
        resizeDirection,
        deltaX,
        deltaY,
        initialBubbleBounds
      );
      
      console.log("🔧 リサイズ結果:", {
        oldSize: { width: selectedBubble.width, height: selectedBubble.height },
        newSize: { width: resizedBubble.width, height: resizedBubble.height }
      });
      
      setSpeechBubbles(
        speechBubbles.map((bubble) =>
          bubble.id === selectedBubble.id ? resizedBubble : bubble
        )
      );
      setSelectedBubble(resizedBubble);
      return;
    }

    // 🆕 キャラクターリサイズ処理（8方向対応・完全修正版）
    if (selectedCharacter && isCharacterResizing) {
      console.log("🔧 キャラクターリサイズ実行中:", resizeDirection);
      
      const deltaX = mouseX - dragOffset.x;
      const deltaY = mouseY - dragOffset.y;
      
      // 🔧 キャラクターリサイズは主にスケール変更
      let scaleDelta = 0;
      
      switch (resizeDirection) {
        case "nw":
        case "sw":
          scaleDelta = -deltaX / 100; // 左側のハンドルは逆方向
          break;
        case "ne":
        case "se":
        case "e":
          scaleDelta = deltaX / 100; // 右側のハンドルは正方向
          break;
        case "n":
          scaleDelta = -deltaY / 100; // 上のハンドルは逆方向
          break;
        case "s":
          scaleDelta = deltaY / 100; // 下のハンドルは正方向
          break;
        case "w":
          scaleDelta = -deltaX / 100; // 左のハンドルは逆方向
          break;
        default:
          scaleDelta = (deltaX + deltaY) / 200; // デフォルト
      }
      
      const newScale = Math.max(0.5, Math.min(5.0, initialCharacterScale + scaleDelta));
      
      console.log("🔍 スケール変更:", {
        initial: initialCharacterScale,
        delta: scaleDelta,
        new: newScale
      });
      
      const updatedCharacter = {
        ...selectedCharacter,
        scale: newScale,
      };
      
      setCharacters(
        characters.map((char) =>
          char.id === selectedCharacter.id ? updatedCharacter : char
        )
      );
      setSelectedCharacter(updatedCharacter);
      if (onCharacterSelect) onCharacterSelect(updatedCharacter);
      return;
    }

    // パネルリサイズ
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

    // パネル移動
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
      console.log("🔧 吹き出し移動実行中");
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
      console.log("🔧 キャラクター移動実行中");
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

  // 🆕 マウスアップ処理（状態リセット強化版）
  const handleCanvasMouseUp = () => {
    console.log("🖱️ マウスアップ: 全状態リセット");
    
    setIsDragging(false);
    setIsBubbleResizing(false);
    setIsCharacterResizing(false);
    setIsPanelResizing(false);
    setIsPanelMoving(false);
    setResizeDirection("");
    setSnapLines([]);
    
    // 🆕 初期値もリセット
    setInitialBubbleBounds(null);
    setInitialCharacterScale(1.0);
    
    console.log("✅ 全状態リセット完了");
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
          cursor: isPanelResizing || isDragging || isBubbleResizing || isCharacterResizing ? "grabbing" : "pointer",
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

      {/* ContextMenuHandlerを使用した右クリックメニュー */}
      {ContextMenuHandler.renderContextMenu(
        contextMenu,
        clipboard,
        isPanelEditMode,
        handleContextMenuAction,
        (e: React.MouseEvent) => e.stopPropagation()
      )}

      {/* 🆕 選択状態表示（詳細版） */}
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
          {isCharacterResizing ? `リサイズ中 (${resizeDirection})` : 
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
          {isBubbleResizing ? `リサイズ中 (${resizeDirection})` : 
          isDragging ? "移動中" : 
          selectedBubble.text}
          <br/>
          <small>
            {selectedBubble.width}x{selectedBubble.height}px
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

      {/* 🆕 デバッグ情報表示 */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          background: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "6px 10px",
          borderRadius: "4px",
          fontSize: "10px",
          fontFamily: "monospace",
        }}
      >
        🔧 デバッグ情報<br/>
        ドラッグ: {isDragging ? "✅" : "❌"}<br/>
        吹き出しリサイズ: {isBubbleResizing ? "✅" : "❌"}<br/>
        キャラリサイズ: {isCharacterResizing ? "✅" : "❌"}<br/>
        方向: {resizeDirection || "なし"}
      </div>
    </div>
  );
});

CanvasComponent.displayName = 'CanvasComponent';
export default CanvasComponent;