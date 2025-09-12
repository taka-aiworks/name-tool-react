// src/components/CanvasComponent/hooks/useMouseEvents.ts
// 🔍 完全デバッグ統合版：キャラクター検出問題解決・2D回転機能完全実装・TypeScript修正版

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

    console.log("🖱️ [完全版] マウスダウン開始:", { mouseX, mouseY });

    // 🔍 詳細デバッグ：キャラクター判定
    console.log("🔍 [完全版] キャラクター数:", characters.length);
    console.log("🔍 [完全版] キャラクター一覧:", characters.map(c => ({
      name: c.name,
      id: c.id,
      x: c.x,
      y: c.y,
      rotation: c.rotation || 0,
      panelId: c.panelId
    })));

    // 🚨 手動キャラクター検索（デバッグ強化版）
    let clickedCharacter: Character | null = null;
    for (let i = characters.length - 1; i >= 0; i--) {
      const character = characters[i];
      const panel = panels.find(p => p.id === character.panelId);
      
      console.log(`🔍 [完全版] ${character.name} 判定開始:`, {
        character: { x: character.x, y: character.y, rotation: character.rotation || 0 },
        panel: panel ? { id: panel.id, x: panel.x, y: panel.y, width: panel.width, height: panel.height } : "なし",
        mousePos: { mouseX, mouseY }
      });
      
      if (panel) {
        // 境界計算
        const bounds = CharacterBounds.getCharacterBounds(character, panel);
        console.log(`🔍 [完全版] ${character.name} 境界:`, {
          x: Math.round(bounds.x),
          y: Math.round(bounds.y),
          width: Math.round(bounds.width),
          height: Math.round(bounds.height),
          centerX: Math.round(bounds.centerX),
          centerY: Math.round(bounds.centerY)
        });
        
        // クリック判定実行
        const isClicked = CharacterBounds.isCharacterClicked(mouseX, mouseY, character, panel);
        console.log(`🔍 [完全版] ${character.name} クリック判定:`, isClicked);
        
        if (isClicked) {
          clickedCharacter = character;
          console.log(`✅ [完全版] キャラクター発見: ${character.name}`);
          break;
        }
      }
    }

    // 🚨 キャラクターが見つかった場合の処理
    if (clickedCharacter) {
      console.log("👤 [完全版] キャラクター処理開始:", clickedCharacter.name);
      
      // 🚨 選択状態を最優先で設定
      actions.setSelectedCharacter(clickedCharacter);
      actions.setSelectedBubble(null);
      actions.setSelectedPanel(null);
      if (onCharacterSelect) onCharacterSelect(clickedCharacter);
      
      const panel = panels.find(p => p.id === clickedCharacter.panelId);
      if (!panel) {
        console.error("❌ [完全版] パネル未発見");
        e.preventDefault();
        return; // 🚨 即座にreturn
      }
      
      // 🔄 回転ハンドル判定
      const rotationClicked = CharacterBounds.isRotationHandleClicked(
        mouseX, mouseY, clickedCharacter, panel
      );
      
      console.log("🔍 [完全版] 回転ハンドル判定:", rotationClicked);
      
      if (rotationClicked) {
        console.log("🔄 [完全版] 回転開始!");
        actions.setIsCharacterRotating(true);
        
        const { centerX, centerY } = CharacterUtils.calculateCenterCoordinates(clickedCharacter, panel);
        const startAngle = CharacterUtils.calculateAngle(centerX, centerY, mouseX, mouseY);
        
        actions.setRotationStartAngle(startAngle);
        actions.setOriginalRotation(clickedCharacter.rotation || 0);
        
        console.log("🔄 [完全版] 回転設定完了:", {
          startAngle: Math.round(startAngle),
          originalRotation: clickedCharacter.rotation || 0,
          character: clickedCharacter.name
        });
        
        console.log("🚨 [完全版] 回転処理完了 - return実行");
        e.preventDefault();
        return; // 🚨 CRITICAL: 回転処理後は完全終了
      }
      
      // 📏 リサイズハンドル判定
      const resizeResult = CharacterRenderer.isCharacterResizeHandleClicked(
        mouseX, mouseY, clickedCharacter, panel
      );
      
      console.log("🔍 [完全版] リサイズハンドル判定:", resizeResult);
      
      if (resizeResult.isClicked) {
        console.log("📏 [完全版] リサイズ開始:", resizeResult.direction);
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
      } else {
        // 📱 通常ドラッグ
        console.log("📱 [完全版] 通常ドラッグ開始");
        actions.setIsDragging(true);
        actions.setDragOffset({
          x: mouseX - clickedCharacter.x,
          y: mouseY - clickedCharacter.y,
        });
      }
      
      console.log("🚨 [完全版] キャラクター処理完了 - return実行");
      e.preventDefault();
      return; // 🚨 ULTRA CRITICAL: この return が絶対に必要！
    }

    console.log("❌ [完全版] キャラクター検出されず - 他の処理へ");

    // 🎯 吹き出し処理（キャラクターの次の優先度）
    const clickedBubble = BubbleRenderer.findBubbleAt(mouseX, mouseY, speechBubbles, panels);
    if (clickedBubble) {
      console.log("🎯 [完全版] 吹き出しクリック:", clickedBubble.text);
      
      actions.setSelectedBubble(clickedBubble);
      actions.setSelectedCharacter(null);
      actions.setSelectedPanel(null);
      
      const panel = panels.find(p => p.id === clickedBubble.panelId) || panels[0];
      if (!panel) {
        console.error("❌ [完全版] 吹き出しパネル未発見");
        return;
      }
      
      const resizeResult = BubbleRenderer.isBubbleResizeHandleClicked(mouseX, mouseY, clickedBubble, panel);
      
      if (resizeResult.isClicked) {
        console.log("✅ [完全版] 吹き出しリサイズ開始:", resizeResult.direction);
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
        console.log("📱 [完全版] 吹き出しドラッグ開始");
        actions.setIsDragging(true);
        actions.setDragOffset({
          x: mouseX - clickedBubble.x,
          y: mouseY - clickedBubble.y,
        });
      }
      
      e.preventDefault();
      return; // 🚨 吹き出し処理後も完全終了
    }

    // 🎯 パネル編集モード処理
    if (isPanelEditMode && state.selectedPanel) {
      const panelHandle = PanelManager.getPanelHandleAt(mouseX, mouseY, state.selectedPanel);
      
      if (panelHandle) {
        console.log("🔧 [完全版] パネル編集ハンドル:", panelHandle.type);
        
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

    // 🎯 通常パネル処理・背景クリック（最後の処理）
    const clickedPanel = PanelManager.findPanelAt(mouseX, mouseY, panels);
    if (clickedPanel) {
      console.log("🎯 [完全版] パネルクリック:", clickedPanel.id);
      actions.setSelectedPanel(clickedPanel);
      actions.setSelectedCharacter(null);
      actions.setSelectedBubble(null);
      if (onPanelSelect) onPanelSelect(clickedPanel);
      if (onCharacterSelect) onCharacterSelect(null);
    } else {
      console.log("🎯 [完全版] 背景クリック - 全選択解除");
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

    // 🔄 キャラクター回転処理（最優先）
    if (state.isCharacterRotating && state.selectedCharacter) {
      console.log("🔄 [完全版] 回転処理実行中:", {
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
        
        console.log("🔄 [完全版] 回転計算:", {
          startAngle: Math.round(state.rotationStartAngle),
          currentAngle: Math.round(currentAngle),
          angleDiff: Math.round(angleDiff),
          newRotation: Math.round(newRotation)
        });
        
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
      console.log("📏 [完全版] キャラクターリサイズ実行中");
      
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

    // キャラクター移動
    if (state.selectedCharacter && state.isDragging) {
      console.log("📱 [完全版] キャラクター移動実行中");
      
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
    console.log("⬆️ [完全版] マウスアップ - 操作終了処理");
    
    // 🔄 回転終了時の選択状態維持（最重要）
    if (state.isCharacterRotating && state.selectedCharacter) {
      console.log("🔄 [完全版] 回転操作完了 - 選択状態維持:", state.selectedCharacter.name);
      const currentCharacter = state.selectedCharacter;
      
      // 状態リセット
      actions.resetDragStates();
      actions.setSnapLines([]);
      
      // 選択状態を明示的に再設定
      setTimeout(() => {
        actions.setSelectedCharacter(currentCharacter);
        if (onCharacterSelect) onCharacterSelect(currentCharacter);
        console.log("✅ [完全版] 回転後選択状態復元:", currentCharacter.name);
      }, 0);
      
      return;
    }
    
    // その他の操作終了処理
    actions.resetDragStates();
    actions.setSnapLines([]);
    console.log("✅ [完全版] 全状態リセット完了");
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