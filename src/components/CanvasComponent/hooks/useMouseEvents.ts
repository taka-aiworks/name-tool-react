// src/components/CanvasComponent/hooks/useMouseEvents.ts
// 🎯 クリーン整理版：ハンドルのみ回転・キャラクター本体は移動のみ

import { RefObject } from 'react';
import { Panel, Character, SpeechBubble, SnapSettings } from '../../../types';
import { CanvasState, CanvasStateActions } from './useCanvasState';
import { BubbleRenderer } from '../../CanvasArea/renderers/BubbleRenderer';
import { CharacterRenderer } from '../../CanvasArea/renderers/CharacterRenderer/CharacterRenderer';
import { PanelManager } from '../../CanvasArea/PanelManager';
import { ContextMenuState, ContextMenuActions } from '../../CanvasArea/ContextMenuHandler';
import { CharacterUtils } from '../../CanvasArea/renderers/CharacterRenderer/utils/CharacterUtils';
import { CharacterBounds } from '../../CanvasArea/renderers/CharacterRenderer/utils/CharacterBounds';

export interface MouseEventHandlers {
  handleCanvasClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleCanvasMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleCanvasMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleCanvasMouseUp: () => void;
  handleCanvasContextMenu: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleCanvasDoubleClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
}

export interface MouseEventHookProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
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

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setContextMenu({ ...contextMenu, visible: false });
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    console.log("🖱️ [クリーン版] マウスダウン開始:", { mouseX, mouseY });

    // 🚨 手動キャラクター検索（クリーン版）
    let clickedCharacter: Character | null = null;
    for (let i = characters.length - 1; i >= 0; i--) {
      const character = characters[i];
      const panel = panels.find(p => p.id === character.panelId);
      
      if (panel) {
        // 拡張クリック範囲での判定（境界問題対応）
        const bounds = CharacterBounds.getCharacterBounds(character, panel);
        const expandedBounds = {
          x: bounds.x - 50,
          y: bounds.y - 50,
          width: bounds.width + 100,
          height: bounds.height + 100
        };
        
        const expandedClicked = (
          mouseX >= expandedBounds.x &&
          mouseX <= expandedBounds.x + expandedBounds.width &&
          mouseY >= expandedBounds.y &&
          mouseY <= expandedBounds.y + expandedBounds.height
        );
        
        if (expandedClicked) {
          clickedCharacter = character;
          console.log(`✅ [クリーン版] キャラクター発見: ${character.name}`);
          break;
        }
      }
    }

    if (clickedCharacter) {
      console.log("👤 [最適化版] キャラクター処理開始:", clickedCharacter.name);
      
      // 🚨 既に選択済みの場合は選択状態更新をスキップ
      const isAlreadySelected = state.selectedCharacter?.id === clickedCharacter.id;
      
      if (!isAlreadySelected) {
        // 選択状態を変更（未選択 → 選択の場合のみ）
        actions.setSelectedCharacter(clickedCharacter);
        actions.setSelectedBubble(null);
        actions.setSelectedPanel(null);
        if (onCharacterSelect) onCharacterSelect(clickedCharacter);
        console.log("📱 [最適化版] 選択状態変更実行");
      } else {
        console.log("📱 [最適化版] 既に選択済み - 選択状態更新スキップ");
      }
      
      const panel = panels.find(p => p.id === clickedCharacter.panelId);
      if (!panel) {
        console.error("❌ [最適化版] パネル未発見");
        e.preventDefault();
        return;
      }
      
      // 回転ハンドル判定
      const rotationClicked = CharacterBounds.isRotationHandleClicked(
        mouseX, mouseY, clickedCharacter, panel
      );
      
      if (rotationClicked) {
        console.log("🔄 [最適化版] 回転ハンドルクリック");
        actions.setIsCharacterRotating(true);
        
        const { centerX, centerY } = CharacterUtils.calculateCenterCoordinates(clickedCharacter, panel);
        const startAngle = CharacterUtils.calculateAngle(centerX, centerY, mouseX, mouseY);
        
        actions.setRotationStartAngle(startAngle);
        actions.setOriginalRotation(clickedCharacter.rotation || 0);
        
        e.preventDefault();
        return;
      }
      
      // リサイズハンドル判定
      const resizeResult = CharacterRenderer.isCharacterResizeHandleClicked(
        mouseX, mouseY, clickedCharacter, panel
      );
      
      if (resizeResult.isClicked) {
        console.log("📏 [最適化版] リサイズ開始:", resizeResult.direction);
        actions.setIsCharacterResizing(true);
        actions.setResizeDirection(resizeResult.direction);
        actions.setDragOffset({ x: mouseX, y: mouseY });
        
        const currentWidth = CharacterRenderer.getCharacterWidth(clickedCharacter);
        const currentHeight = CharacterRenderer.getCharacterHeight(clickedCharacter);
        actions.setInitialCharacterBounds({
          x: clickedCharacter.x,
          y: clickedCharacter.y,
          width: currentWidth,
          height: currentHeight
        });
        
        e.preventDefault();
        return;
      }
      
      // 通常ドラッグ（選択済みの場合のみ開始）
      if (isAlreadySelected) {
        console.log("📱 [最適化版] 通常ドラッグ開始");
        actions.setIsDragging(true);
        actions.setDragOffset({
          x: mouseX - clickedCharacter.x,
          y: mouseY - clickedCharacter.y,
        });
      }
      
      e.preventDefault();
      return;
    }


    console.log("❌ [クリーン版] キャラクター検出されず - 他の処理へ");

    // 🎯 吹き出し処理
    const clickedBubble = BubbleRenderer.findBubbleAt(mouseX, mouseY, speechBubbles, panels);
    if (clickedBubble) {
      console.log("🎯 [クリーン版] 吹き出しクリック:", clickedBubble.text);
      
      actions.setSelectedBubble(clickedBubble);
      actions.setSelectedCharacter(null);
      actions.setSelectedPanel(null);
      
      const panel = panels.find(p => p.id === clickedBubble.panelId) || panels[0];
      if (!panel) {
        console.error("❌ [クリーン版] 吹き出しパネル未発見");
        return;
      }
      
      const resizeResult = BubbleRenderer.isBubbleResizeHandleClicked(mouseX, mouseY, clickedBubble, panel);
      
      if (resizeResult.isClicked) {
        console.log("✅ [クリーン版] 吹き出しリサイズ開始:", resizeResult.direction);
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
        console.log("📱 [クリーン版] 吹き出しドラッグ開始");
        actions.setIsDragging(true);
        actions.setDragOffset({
          x: mouseX - clickedBubble.x,
          y: mouseY - clickedBubble.y,
        });
      }
      
      e.preventDefault();
      return;
    }

    // 🎯 パネル編集モード処理
    if (isPanelEditMode && state.selectedPanel) {
      const panelHandle = PanelManager.getPanelHandleAt(mouseX, mouseY, state.selectedPanel);
      
      if (panelHandle) {
        console.log("🔧 [クリーン版] パネル編集ハンドル:", panelHandle.type);
        
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

    // 🎯 通常パネル処理・背景クリック
    const clickedPanel = PanelManager.findPanelAt(mouseX, mouseY, panels);
    if (clickedPanel) {
      console.log("🎯 [クリーン版] パネルクリック:", clickedPanel.id);
      actions.setSelectedPanel(clickedPanel);
      actions.setSelectedCharacter(null);
      actions.setSelectedBubble(null);
      if (onPanelSelect) onPanelSelect(clickedPanel);
      if (onCharacterSelect) onCharacterSelect(null);
    } else {
      console.log("🎯 [クリーン版] 背景クリック - 全選択解除");
      actions.setSelectedPanel(null);
      actions.setSelectedCharacter(null);
      actions.setSelectedBubble(null);
      if (onPanelSelect) onPanelSelect(null);
      if (onCharacterSelect) onCharacterSelect(null);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 何も操作していない場合は早期リターン
    if (!state.isDragging && !state.isPanelResizing && !state.isPanelMoving && 
        !state.isCharacterResizing && !state.isBubbleResizing && !state.isCharacterRotating) {
      return;
    }

    // 🔄 キャラクター回転処理（ハンドルのみ）
    if (state.isCharacterRotating && state.selectedCharacter) {
      console.log("🔄 [クリーン版] 回転処理実行中（ハンドルのみ）:", {
        character: state.selectedCharacter.name,
        mousePos: { mouseX, mouseY }
      });
      
      const panel = panels.find(p => p.id === state.selectedCharacter!.panelId);
      if (panel && state.selectedCharacter) {
        const { centerX, centerY } = CharacterUtils.calculateCenterCoordinates(
          state.selectedCharacter, panel
        );
        const currentAngle = CharacterUtils.calculateAngle(centerX, centerY, mouseX, mouseY);
        
        // 角度差分計算
        const angleDiff = CharacterUtils.calculateAngleDifference(
          state.rotationStartAngle, currentAngle
        );
        const newRotation = CharacterUtils.normalizeAngle(
          state.originalRotation + angleDiff
        );
        
        // キャラクター更新
        const updatedCharacter = { 
          ...state.selectedCharacter,
          rotation: newRotation 
        };
        
        setCharacters(characters.map((char: Character) => 
          char.id === updatedCharacter.id ? updatedCharacter : char
        ));
        
        // 選択キャラクターも更新
        actions.setSelectedCharacter(updatedCharacter);
      }
      return;
    }

    // キャラクターリサイズ処理
    if (state.selectedCharacter && state.isCharacterResizing && state.initialCharacterBounds) {
      const deltaX = mouseX - state.dragOffset.x;
      const deltaY = mouseY - state.dragOffset.y;
      
      const resizedCharacter = CharacterRenderer.resizeCharacter(
        state.selectedCharacter,
        state.resizeDirection,
        deltaX,
        deltaY,
        state.initialCharacterBounds
      );
      
      setCharacters(
        characters.map((char) =>
          char.id === state.selectedCharacter!.id ? resizedCharacter : char
        )
      );
      actions.setSelectedCharacter(resizedCharacter);
      if (onCharacterSelect) onCharacterSelect(resizedCharacter);
      return;
    }

    // キャラクター移動（回転なし）
    if (state.selectedCharacter && state.isDragging) {
      console.log("📱 [クリーン版] キャラクター移動実行中（回転なし）");
      
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
      return;
    }

    // 吹き出しリサイズ処理
    if (state.selectedBubble && state.isBubbleResizing && state.initialBubbleBounds) {
      const deltaX = mouseX - state.dragOffset.x;
      const deltaY = mouseY - state.dragOffset.y;
      
      const resizedBubble = BubbleRenderer.resizeBubble(
        state.selectedBubble,
        state.resizeDirection,
        deltaX,
        deltaY,
        state.initialBubbleBounds
      );
      
      setSpeechBubbles(
        speechBubbles.map((bubble) =>
          bubble.id === state.selectedBubble!.id ? resizedBubble : bubble
        )
      );
      actions.setSelectedBubble(resizedBubble);
      return;
    }

    // 吹き出し移動
    if (state.selectedBubble && state.isDragging) {
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
  };

  const handleCanvasMouseUp = () => {
    console.log("⬆️ [クリーン版] マウスアップ - 操作終了処理");
    
    // 回転終了時の選択状態維持
    if (state.isCharacterRotating && state.selectedCharacter) {
      console.log("🔄 [クリーン版] 回転操作完了 - 選択状態維持:", state.selectedCharacter.name);
      const currentCharacter = state.selectedCharacter;
      
      // 状態リセット
      actions.resetDragStates();
      actions.setSnapLines([]);
      
      // 選択状態を明示的に再設定
      setTimeout(() => {
        actions.setSelectedCharacter(currentCharacter);
        if (onCharacterSelect) onCharacterSelect(currentCharacter);
        console.log("✅ [クリーン版] 回転後選択状態復元:", currentCharacter.name);
      }, 0);
      
      return;
    }
    
    // その他の操作終了処理
    actions.resetDragStates();
    actions.setSnapLines([]);
    console.log("✅ [クリーン版] 全状態リセット完了");
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