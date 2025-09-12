// src/components/CanvasComponent/hooks/useMouseEvents.ts
import { RefObject } from 'react';
import { Panel, Character, SpeechBubble, SnapSettings } from '../../../types';
import { CanvasState, CanvasStateActions } from './useCanvasState';
import { BubbleRenderer } from '../../CanvasArea/renderers/BubbleRenderer';
import { CharacterRenderer } from '../../CanvasArea/renderers/CharacterRenderer';
import { PanelManager } from '../../CanvasArea/PanelManager';
import { ContextMenuState, ContextMenuActions } from '../../CanvasArea/ContextMenuHandler';

export interface MouseEventHandlers {
  handleCanvasClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleCanvasMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleCanvasMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleCanvasMouseUp: () => void;
  handleCanvasContextMenu: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleCanvasDoubleClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
}

export interface MouseEventHookProps {
  canvasRef: RefObject<HTMLCanvasElement>;
  state: CanvasState;
  actions: CanvasStateActions;
  panels: Panel[];
  setPanels: (panels: Panel[]) => void;
  characters: Character[];
  setCharacters: (characters: Character[]) => void;
  speechBubbles: SpeechBubble[];
  setSpeechBubbles: (bubbles: SpeechBubble[]) => void;
  isPanelEditMode: boolean;
  snapSettings: SnapSettings;
  contextMenu: ContextMenuState;
  setContextMenu: (menu: ContextMenuState) => void;
  contextMenuActions: ContextMenuActions;
  onPanelSelect?: (panel: Panel | null) => void;
  onCharacterSelect?: (character: Character | null) => void;
  onPanelSplit?: (panelId: number, direction: 'horizontal' | 'vertical') => void;
}

/**
 * Canvas上のマウスイベント処理を管理するカスタムhook
 * 複雑なマウス操作ロジックを分離し、保守性を向上
 */
export const useMouseEvents = ({
  canvasRef,
  state,
  actions,
  panels,
  setPanels,
  characters,
  setCharacters,
  speechBubbles,
  setSpeechBubbles,
  isPanelEditMode,
  snapSettings,
  contextMenu,
  setContextMenu,
  contextMenuActions,
  onPanelSelect,
  onCharacterSelect,
  onPanelSplit,
}: MouseEventHookProps): MouseEventHandlers => {

  /**
   * Canvas クリック処理
   */
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setContextMenu({ ...contextMenu, visible: false });

    // 吹き出しクリック判定
    const clickedBubble = BubbleRenderer.findBubbleAt(x, y, speechBubbles, panels);
    if (clickedBubble) {
      actions.setSelectedBubble(clickedBubble);
      actions.setSelectedCharacter(null);
      actions.setSelectedPanel(null);
      if (onPanelSelect) onPanelSelect(null);
      if (onCharacterSelect) onCharacterSelect(null);
      return;
    }

    // キャラクタークリック判定
    const clickedCharacter = CharacterRenderer.findCharacterAt(x, y, characters, panels);
    if (clickedCharacter) {
      actions.setSelectedCharacter(clickedCharacter);
      actions.setSelectedBubble(null);
      actions.setSelectedPanel(null);
      if (onPanelSelect) onPanelSelect(null);
      if (onCharacterSelect) onCharacterSelect(clickedCharacter);
      return;
    }

    // パネルクリック判定
    const clickedPanel = PanelManager.findPanelAt(x, y, panels);
    actions.setSelectedPanel(clickedPanel || null);
    actions.setSelectedCharacter(null);
    actions.setSelectedBubble(null);
    if (onPanelSelect) onPanelSelect(clickedPanel || null);
    if (onCharacterSelect) onCharacterSelect(null);
  };

  /**
   * Canvas マウスダウン処理
   */
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setContextMenu({ ...contextMenu, visible: false });
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    console.log("🖱️ マウスダウン:", { mouseX, mouseY });

    // パネル編集モード時の操作
    if (isPanelEditMode && state.selectedPanel) {
      const panelHandle = PanelManager.getPanelHandleAt(mouseX, mouseY, state.selectedPanel);
      
      if (panelHandle) {
        if (panelHandle.type === "delete") {
          contextMenuActions.onDeletePanel(state.selectedPanel);
          e.preventDefault();
          return;
        } else if (panelHandle.type === "resize") {
          actions.setIsPanelResizing(true);
          actions.setResizeDirection(panelHandle.direction || "");
          actions.setDragOffset({ x: mouseX, y: mouseY });
          e.preventDefault();
          return;
        } else if (panelHandle.type === "move") {
          actions.setIsPanelMoving(true);
          actions.setDragOffset({
            x: mouseX - state.selectedPanel.x,
            y: mouseY - state.selectedPanel.y,
          });
          e.preventDefault();
          return;
        } else if (panelHandle.type === "split" && onPanelSplit) {
          const direction = window.confirm("水平分割（上下）しますか？\nキャンセルで垂直分割（左右）") 
            ? "horizontal" 
            : "vertical";
          onPanelSplit(state.selectedPanel.id, direction);
          e.preventDefault();
          return;
        }
      }
    }

    // 吹き出し操作
    const clickedBubble = BubbleRenderer.findBubbleAt(mouseX, mouseY, speechBubbles, panels);
    if (clickedBubble) {
      console.log("🎯 吹き出しクリック検出:", clickedBubble.text);
      
      actions.setSelectedBubble(clickedBubble);
      actions.setSelectedCharacter(null);
      actions.setSelectedPanel(null);
      
      const panel = panels.find(p => p.id === clickedBubble.panelId) || panels[0];
      if (!panel) {
        console.error("❌ パネルが見つかりません");
        return;
      }
      
      // リサイズハンドル判定
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
        actions.setIsBubbleResizing(true);
        actions.setResizeDirection(resizeResult.direction);
        actions.setDragOffset({ x: mouseX, y: mouseY });
        actions.setInitialBubbleBounds({
          x: clickedBubble.x,
          y: clickedBubble.y,
          width: clickedBubble.width,
          height: clickedBubble.height
        });
      } else {
        console.log("📱 吹き出しドラッグモード開始");
        actions.setIsDragging(true);
        actions.setDragOffset({
          x: mouseX - clickedBubble.x,
          y: mouseY - clickedBubble.y,
        });
      }
      e.preventDefault();
      return;
    }

    // キャラクター操作
    const clickedCharacter = CharacterRenderer.findCharacterAt(mouseX, mouseY, characters, panels);
    if (clickedCharacter) {
      console.log("👤 キャラクタークリック検出:", clickedCharacter.name);
      
      actions.setSelectedCharacter(clickedCharacter);
      actions.setSelectedBubble(null);
      actions.setSelectedPanel(null);
      
      const panel = panels.find(p => p.id === clickedCharacter.panelId);
      if (!panel) {
        console.error("❌ キャラクターのパネルが見つかりません");
        return;
      }
      
      // キャラクターリサイズハンドル判定
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
        actions.setIsCharacterResizing(true);
        actions.setResizeDirection(resizeResult.direction);
        actions.setDragOffset({ x: mouseX, y: mouseY });
        
        // 初期サイズを保存
        const currentWidth = CharacterRenderer.getCharacterWidth(clickedCharacter);
        const currentHeight = CharacterRenderer.getCharacterHeight(clickedCharacter);
        actions.setInitialCharacterBounds({
          x: clickedCharacter.x,
          y: clickedCharacter.y,
          width: currentWidth,
          height: currentHeight
        });
      } else {
        console.log("📱 キャラクタードラッグモード開始");
        actions.setIsDragging(true);
        actions.setDragOffset({
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
      actions.setSelectedPanel(clickedPanel);
      actions.setSelectedCharacter(null);
      actions.setSelectedBubble(null);
      if (onPanelSelect) onPanelSelect(clickedPanel);
      if (onCharacterSelect) onCharacterSelect(null);
    } else {
      // 背景クリック：すべて選択解除
      actions.setSelectedPanel(null);
      actions.setSelectedCharacter(null);
      actions.setSelectedBubble(null);
      if (onPanelSelect) onPanelSelect(null);
      if (onCharacterSelect) onCharacterSelect(null);
    }
  };

  /**
   * Canvas マウス移動処理
   */
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    console.log("🖱️ マウス移動イベント発生");
    console.log("🔍 状態確認:", {
      isDragging: state.isDragging,
      isBubbleResizing: state.isBubbleResizing,
      isCharacterResizing: state.isCharacterResizing,
      isPanelResizing: state.isPanelResizing,
      isPanelMoving: state.isPanelMoving,
      resizeDirection: state.resizeDirection
    });

    // 何も操作していない場合は早期リターン
    if (!state.isDragging && !state.isPanelResizing && !state.isPanelMoving && 
        !state.isCharacterResizing && !state.isBubbleResizing) {
      console.log("❌ 移動処理スキップ: 操作中のアイテムなし");
      return;
    }

    // 吹き出しリサイズ処理
    if (state.selectedBubble && state.isBubbleResizing && state.initialBubbleBounds) {
      console.log("🔧 吹き出しリサイズ実行中:", state.resizeDirection);
      
      const deltaX = mouseX - state.dragOffset.x;
      const deltaY = mouseY - state.dragOffset.y;
      
      console.log("🔍 リサイズデルタ:", { deltaX, deltaY });
      
      const resizedBubble = BubbleRenderer.resizeBubble(
        state.selectedBubble,
        state.resizeDirection,
        deltaX,
        deltaY,
        state.initialBubbleBounds
      );
      
      console.log("🔧 リサイズ結果:", {
        oldSize: { width: state.selectedBubble.width, height: state.selectedBubble.height },
        newSize: { width: resizedBubble.width, height: resizedBubble.height }
      });
      
      setSpeechBubbles(
        speechBubbles.map((bubble) =>
          bubble.id === state.selectedBubble!.id ? resizedBubble : bubble
        )
      );
      actions.setSelectedBubble(resizedBubble);
      return;
    }

    // キャラクターリサイズ処理
    if (state.selectedCharacter && state.isCharacterResizing && state.initialCharacterBounds) {
      console.log("🔧 キャラクターリサイズ実行中:", state.resizeDirection);
      
      const deltaX = mouseX - state.dragOffset.x;
      const deltaY = mouseY - state.dragOffset.y;
      
      console.log("🔍 リサイズデルタ:", { deltaX, deltaY });
      
      const resizedCharacter = CharacterRenderer.resizeCharacter(
        state.selectedCharacter,
        state.resizeDirection,
        deltaX,
        deltaY,
        state.initialCharacterBounds
      );
      
      console.log("🔧 キャラクターリサイズ結果:", {
        oldSize: { 
          width: CharacterRenderer.getCharacterWidth(state.selectedCharacter), 
          height: CharacterRenderer.getCharacterHeight(state.selectedCharacter) 
        },
        newSize: { 
          width: CharacterRenderer.getCharacterWidth(resizedCharacter), 
          height: CharacterRenderer.getCharacterHeight(resizedCharacter) 
        }
      });
      
      setCharacters(
        characters.map((char) =>
          char.id === state.selectedCharacter!.id ? resizedCharacter : char
        )
      );
      actions.setSelectedCharacter(resizedCharacter);
      if (onCharacterSelect) onCharacterSelect(resizedCharacter);
      return;
    }

    // パネルリサイズ
    if (state.selectedPanel && state.isPanelResizing) {
      const deltaX = mouseX - state.dragOffset.x;
      const deltaY = mouseY - state.dragOffset.y;
      
      const updatedPanel = PanelManager.resizePanel(
        state.selectedPanel,
        state.resizeDirection,
        deltaX,
        deltaY
      );
      
      setPanels(panels.map(p => p.id === state.selectedPanel!.id ? updatedPanel : p));
      actions.setSelectedPanel(updatedPanel);
      actions.setDragOffset({ x: mouseX, y: mouseY });
      return;
    }

    // パネル移動
    if (state.selectedPanel && state.isPanelMoving) {
      const deltaX = mouseX - state.dragOffset.x - state.selectedPanel.x;
      const deltaY = mouseY - state.dragOffset.y - state.selectedPanel.y;
      
      const moveResult = PanelManager.movePanel(
        state.selectedPanel,
        deltaX,
        deltaY,
        canvas.width,
        canvas.height,
        snapSettings,
        panels
      );
      
      setPanels(panels.map(p => p.id === state.selectedPanel!.id ? moveResult.panel : p));
      actions.setSelectedPanel(moveResult.panel);
      actions.setSnapLines(moveResult.snapLines);
      return;
    }

    // 吹き出し移動
    if (state.selectedBubble && state.isDragging) {
      console.log("🔧 吹き出し移動実行中");
      const newX = mouseX - state.dragOffset.x;
      const newY = mouseY - state.dragOffset.y;
      
      const updatedBubble = {
        ...state.selectedBubble,
        x: newX,
        y: newY,
      };
      
      setSpeechBubbles(
        speechBubbles.map((bubble) =>
          bubble.id === state.selectedBubble!.id ? updatedBubble : bubble
        )
      );
      actions.setSelectedBubble(updatedBubble);
      return;
    }

    // キャラクター移動
    if (state.selectedCharacter && state.isDragging) {
      console.log("🔧 キャラクター移動実行中");
      const newX = mouseX - state.dragOffset.x;
      const newY = mouseY - state.dragOffset.y;
      
      const updatedCharacter = {
        ...state.selectedCharacter,
        x: newX,
        y: newY,
      };
      
      setCharacters(
        characters.map((char) =>
          char.id === state.selectedCharacter!.id ? updatedCharacter : char
        )
      );
      actions.setSelectedCharacter(updatedCharacter);
      if (onCharacterSelect) onCharacterSelect(updatedCharacter);
    }
  };

  /**
   * Canvas マウスアップ処理
   */
  const handleCanvasMouseUp = () => {
    console.log("🖱️ マウスアップ: 全状態リセット");
    actions.resetDragStates();
    actions.setSnapLines([]);
    console.log("✅ 全状態リセット完了");
  };

  /**
   * Canvas 右クリックメニュー処理
   */
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

  /**
   * Canvas ダブルクリック処理
   */
  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickedBubble = BubbleRenderer.findBubbleAt(x, y, speechBubbles, panels);
    if (clickedBubble) {
      actions.setEditingBubble(clickedBubble);
      actions.setEditText(clickedBubble.text);
      console.log("✏️ 吹き出し編集開始:", clickedBubble.text);
    }
  };

  return {
    handleCanvasClick,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleCanvasContextMenu,
    handleCanvasDoubleClick,
  };
};