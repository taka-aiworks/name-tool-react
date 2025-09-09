// src/components/CanvasArea/MouseEventHandler.ts
import React from "react";
import { Panel, Character, SpeechBubble, SnapSettings } from "../../types";
import { BubbleRenderer } from "./renderers/BubbleRenderer";
import { CharacterRenderer } from "./renderers/CharacterRenderer";
import { PanelManager } from "./PanelManager";

export interface MouseEventState {
  isDragging: boolean;
  isCharacterResizing: boolean;
  isBubbleResizing: boolean;
  isPanelResizing: boolean;
  isPanelMoving: boolean;
  resizeDirection: string;
  dragOffset: { x: number; y: number };
  snapLines: Array<{x1: number, y1: number, x2: number, y2: number, type: 'vertical' | 'horizontal'}>;
}

export interface MouseEventCallbacks {
  setSelectedPanel: (panel: Panel | null) => void;
  setSelectedCharacter: (character: Character | null) => void;
  setSelectedBubble: (bubble: SpeechBubble | null) => void;
  setEditingBubble: (bubble: SpeechBubble | null) => void;
  setEditText: (text: string) => void;
  setPanels: (panels: Panel[]) => void;
  setCharacters: (characters: Character[]) => void;
  setSpeechBubbles: (bubbles: SpeechBubble[]) => void;
  setMouseState: (state: Partial<MouseEventState>) => void;
  onPanelSelect?: (panel: Panel | null) => void;
  onCharacterSelect?: (character: Character | null) => void;
  onPanelSplit?: (panelId: string, direction: 'horizontal' | 'vertical') => void;
  onDeletePanel: (panel: Panel) => void;
}

export class MouseEventHandler {
  /**
   * Canvas クリックイベント処理
   */
  static handleCanvasClick(
    e: React.MouseEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement,
    panels: Panel[],
    characters: Character[],
    speechBubbles: SpeechBubble[],
    callbacks: MouseEventCallbacks,
    setContextMenu: (menu: any) => void
  ): void {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setContextMenu({ visible: false });

    const clickedBubble = BubbleRenderer.findBubbleAt(x, y, speechBubbles, panels);
    if (clickedBubble) {
      callbacks.setSelectedBubble(clickedBubble);
      callbacks.setSelectedCharacter(null);
      callbacks.setSelectedPanel(null);
      if (callbacks.onPanelSelect) callbacks.onPanelSelect(null);
      if (callbacks.onCharacterSelect) callbacks.onCharacterSelect(null);
      return;
    }

    const clickedCharacter = CharacterRenderer.findCharacterAt(x, y, characters, panels);
    if (clickedCharacter) {
      callbacks.setSelectedCharacter(clickedCharacter);
      callbacks.setSelectedBubble(null);
      callbacks.setSelectedPanel(null);
      if (callbacks.onPanelSelect) callbacks.onPanelSelect(null);
      if (callbacks.onCharacterSelect) callbacks.onCharacterSelect(clickedCharacter);
      return;
    }

    const clickedPanel = PanelManager.findPanelAt(x, y, panels);
    callbacks.setSelectedPanel(clickedPanel || null);
    callbacks.setSelectedCharacter(null);
    callbacks.setSelectedBubble(null);
    if (callbacks.onPanelSelect) callbacks.onPanelSelect(clickedPanel || null);
    if (callbacks.onCharacterSelect) callbacks.onCharacterSelect(null);
  }

  /**
   * Canvas マウスダウンイベント処理
   */
  static handleCanvasMouseDown(
    e: React.MouseEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement,
    selectedPanel: Panel | null,
    panels: Panel[],
    characters: Character[],
    speechBubbles: SpeechBubble[],
    isPanelEditMode: boolean,
    callbacks: MouseEventCallbacks,
    setContextMenu: (menu: any) => void
  ): void {
    setContextMenu({ visible: false });
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // パネル編集モード時の操作
    if (isPanelEditMode && selectedPanel) {
      const panelHandle = PanelManager.getPanelHandleAt(mouseX, mouseY, selectedPanel);
      
      if (panelHandle) {
        if (panelHandle.type === "delete") {
          callbacks.onDeletePanel(selectedPanel);
          e.preventDefault();
          return;
        } else if (panelHandle.type === "resize") {
          callbacks.setMouseState({
            isPanelResizing: true,
            resizeDirection: String(panelHandle.direction || ""),
            dragOffset: { x: mouseX, y: mouseY }
          });
          e.preventDefault();
          return;
        } else if (panelHandle.type === "move") {
          callbacks.setMouseState({
            isPanelMoving: true,
            dragOffset: {
              x: mouseX - selectedPanel.x,
              y: mouseY - selectedPanel.y,
            }
          });
          e.preventDefault();
          return;
        } else if (panelHandle.type === "split" && callbacks.onPanelSplit) {
          const direction = window.confirm("水平分割（上下）しますか？\nキャンセルで垂直分割（左右）") 
            ? "horizontal" 
            : "vertical";
          callbacks.onPanelSplit(String(selectedPanel.id), direction);
          e.preventDefault();
          return;
        }
      }
    }

    // 吹き出し操作
    const clickedBubble = BubbleRenderer.findBubbleAt(mouseX, mouseY, speechBubbles, panels);
    if (clickedBubble) {
      callbacks.setSelectedBubble(clickedBubble);
      callbacks.setMouseState({
        isDragging: true,
        dragOffset: {
          x: mouseX - clickedBubble.x,
          y: mouseY - clickedBubble.y,
        }
      });
      e.preventDefault();
      return;
    }

    // キャラクター操作
    const clickedCharacter = CharacterRenderer.findCharacterAt(mouseX, mouseY, characters, panels);
    if (clickedCharacter) {
      callbacks.setSelectedCharacter(clickedCharacter);
      callbacks.setMouseState({
        isDragging: true,
        dragOffset: {
          x: mouseX - clickedCharacter.x,
          y: mouseY - clickedCharacter.y,
        }
      });
      e.preventDefault();
    }
  }

  /**
   * Canvas マウス移動イベント処理
   */
  static handleCanvasMouseMove(
    e: React.MouseEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement,
    selectedPanel: Panel | null,
    selectedCharacter: Character | null,
    selectedBubble: SpeechBubble | null,
    panels: Panel[],
    characters: Character[],
    speechBubbles: SpeechBubble[],
    mouseState: MouseEventState,
    snapSettings: SnapSettings,
    callbacks: MouseEventCallbacks
  ): void {
    if (!mouseState.isDragging && !mouseState.isPanelResizing && !mouseState.isPanelMoving) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // パネルリサイズ
    if (selectedPanel && mouseState.isPanelResizing) {
      const deltaX = mouseX - mouseState.dragOffset.x;
      const deltaY = mouseY - mouseState.dragOffset.y;
      
      const updatedPanel = PanelManager.resizePanel(
        selectedPanel,
        String(mouseState.resizeDirection), // 明示的に文字列に変換
        deltaX,
        deltaY,
        50
      );
      
      callbacks.setPanels(panels.map(p => p.id === selectedPanel.id ? updatedPanel : p));
      callbacks.setSelectedPanel(updatedPanel);
      callbacks.setMouseState({ dragOffset: { x: mouseX, y: mouseY } });
      return;
    }

    // パネル移動
    if (selectedPanel && mouseState.isPanelMoving) {
      const deltaX = mouseX - mouseState.dragOffset.x - selectedPanel.x;
      const deltaY = mouseY - mouseState.dragOffset.y - selectedPanel.y;
      
      const moveResult = PanelManager.movePanel(
        selectedPanel,
        deltaX,
        deltaY,
        canvas.width,
        canvas.height,
        snapSettings,
        panels
      );
      
      callbacks.setPanels(panels.map(p => p.id === selectedPanel.id ? moveResult.panel : p));
      callbacks.setSelectedPanel(moveResult.panel);
      callbacks.setMouseState({ snapLines: moveResult.snapLines });
      return;
    }

    // 吹き出し移動
    if (selectedBubble && mouseState.isDragging) {
      const newX = mouseX - mouseState.dragOffset.x;
      const newY = mouseY - mouseState.dragOffset.y;
      
      const updatedBubble = {
        ...selectedBubble,
        x: newX,
        y: newY,
      };
      
      callbacks.setSpeechBubbles(
        speechBubbles.map((bubble) =>
          bubble.id === selectedBubble.id ? updatedBubble : bubble
        )
      );
      callbacks.setSelectedBubble(updatedBubble);
      return;
    }

    // キャラクター移動
    if (selectedCharacter && mouseState.isDragging) {
      const newX = mouseX - mouseState.dragOffset.x;
      const newY = mouseY - mouseState.dragOffset.y;
      
      const updatedCharacter = {
        ...selectedCharacter,
        x: newX,
        y: newY,
      };
      
      callbacks.setCharacters(
        characters.map((char) =>
          char.id === selectedCharacter.id ? updatedCharacter : char
        )
      );
      callbacks.setSelectedCharacter(updatedCharacter);
      if (callbacks.onCharacterSelect) callbacks.onCharacterSelect(updatedCharacter);
    }
  }

  /**
   * Canvas マウスアップイベント処理
   */
  static handleCanvasMouseUp(
    callbacks: MouseEventCallbacks
  ): void {
    callbacks.setMouseState({
      isDragging: false,
      isBubbleResizing: false,
      isCharacterResizing: false,
      isPanelResizing: false,
      isPanelMoving: false,
      resizeDirection: "",
      snapLines: []
    });
  }

  /**
   * Canvas ダブルクリックイベント処理
   */
  static handleCanvasDoubleClick(
    e: React.MouseEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement,
    speechBubbles: SpeechBubble[],
    panels: Panel[],
    callbacks: MouseEventCallbacks
  ): void {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickedBubble = BubbleRenderer.findBubbleAt(x, y, speechBubbles, panels);
    if (clickedBubble) {
      callbacks.setEditingBubble(clickedBubble);
      callbacks.setEditText(clickedBubble.text);
      console.log("✏️ 吹き出し編集開始:", clickedBubble.text);
    }
  }

  /**
   * Canvas 右クリックイベント処理
   */
  static handleCanvasContextMenu(
    e: React.MouseEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement,
    speechBubbles: SpeechBubble[],
    characters: Character[],
    panels: Panel[],
    setContextMenu: (menu: any) => void
  ): void {
    e.preventDefault();
    
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
  }
}