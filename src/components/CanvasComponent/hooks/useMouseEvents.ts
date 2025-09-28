// src/components/CanvasComponent/hooks/useMouseEvents.ts - 効果線+トーン対応版
import { RefObject } from 'react';
import { Panel, Character, SpeechBubble, BackgroundElement, EffectElement, ToneElement, SnapSettings } from '../../../types';
import { CanvasState, CanvasStateActions } from './useCanvasState';
import { BubbleRenderer } from '../../CanvasArea/renderers/BubbleRenderer';
import { CharacterRenderer } from '../../CanvasArea/renderers/CharacterRenderer/CharacterRenderer';
import { PanelManager } from '../../CanvasArea/PanelManager';
import { ContextMenuState, ContextMenuActions } from '../../CanvasArea/ContextMenuHandler';
import { CharacterUtils } from '../../CanvasArea/renderers/CharacterRenderer/utils/CharacterUtils';
import { CharacterBounds } from '../../CanvasArea/renderers/CharacterRenderer/utils/CharacterBounds';
import { BackgroundRenderer } from '../../CanvasArea/renderers/BackgroundRenderer';

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
  // 背景関連のprops
  backgrounds?: BackgroundElement[];
  setBackgrounds?: (backgrounds: BackgroundElement[]) => void;
  selectedBackground?: BackgroundElement | null;
  setSelectedBackground?: (background: BackgroundElement | null) => void;
  // 🆕 効果線関連のprops追加
  effects?: EffectElement[];
  setEffects?: (effects: EffectElement[]) => void;
  selectedEffect?: EffectElement | null;
  setSelectedEffect?: (effect: EffectElement | null) => void;
  // 🆕 トーン関連のprops追加
  tones?: ToneElement[];
  setTones?: (tones: ToneElement[]) => void;
  selectedTone?: ToneElement | null;
  setSelectedTone?: (tone: ToneElement | null) => void;
  isPanelEditMode: boolean;
  snapSettings: SnapSettings;
  contextMenu: ContextMenuState;
  setContextMenu: (menu: ContextMenuState) => void;
  contextMenuActions: ContextMenuActions;
  onPanelSelect?: (panel: Panel | null) => void;
  onCharacterSelect?: (character: Character | null) => void;
  onPanelSplit?: (panelId: number, direction: 'horizontal' | 'vertical') => void;
}

// 簡易的な背景クリック判定ヘルパー
const findBackgroundAt = (
  x: number, 
  y: number, 
  backgrounds: BackgroundElement[], 
  panels: Panel[]
): BackgroundElement | null => {
  for (let i = backgrounds.length - 1; i >= 0; i--) {
    const background = backgrounds[i];
    const panel = panels.find(p => p.id === background.panelId);
    if (panel) {
      const absoluteX = panel.x + background.x * panel.width;
      const absoluteY = panel.y + background.y * panel.height;
      const absoluteWidth = background.width * panel.width;
      const absoluteHeight = background.height * panel.height;
      
      if (x >= absoluteX && x <= absoluteX + absoluteWidth &&
          y >= absoluteY && y <= absoluteY + absoluteHeight) {
        return background;
      }
    }
  }
  return null;
};

// 🆕 効果線クリック判定ヘルパー
const findEffectAt = (
  x: number, 
  y: number, 
  effects: EffectElement[], 
  panels: Panel[]
): EffectElement | null => {
  for (let i = effects.length - 1; i >= 0; i--) {
    const effect = effects[i];
    const panel = panels.find(p => p.id === effect.panelId);
    if (panel) {
      const absoluteX = panel.x + effect.x * panel.width;
      const absoluteY = panel.y + effect.y * panel.height;
      const absoluteWidth = effect.width * panel.width;
      const absoluteHeight = effect.height * panel.height;
      
      if (x >= absoluteX && x <= absoluteX + absoluteWidth &&
          y >= absoluteY && y <= absoluteY + absoluteHeight) {
        return effect;
      }
    }
  }
  return null;
};

// 1️⃣ findToneAt関数を以下に置き換え（パネル境界対応版）
const findToneAt = (
  x: number, 
  y: number, 
  tones: ToneElement[], 
  panels: Panel[]
): ToneElement | null => {
  // Z-index降順でクリック判定（上のレイヤーから）
  const sortedTones = [...tones].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
  
  for (const tone of sortedTones) {
    if (!tone.visible) continue; // 非表示トーンはスキップ
    
    const panel = panels.find(p => p.id === tone.panelId);
    if (!panel) continue;

    // パネル内相対座標から絶対座標に変換
    const absoluteX = panel.x + tone.x * panel.width;
    const absoluteY = panel.y + tone.y * panel.height;
    const absoluteWidth = tone.width * panel.width;
    const absoluteHeight = tone.height * panel.height;
    
    // 🔧 パネル境界でクリッピングされた実際の表示領域を計算
    const clippedX = Math.max(absoluteX, panel.x);
    const clippedY = Math.max(absoluteY, panel.y);
    const clippedRight = Math.min(absoluteX + absoluteWidth, panel.x + panel.width);
    const clippedBottom = Math.min(absoluteY + absoluteHeight, panel.y + panel.height);
    
    // クリッピングされた領域が有効で、その中にクリック位置がある場合
    if (clippedRight > clippedX && clippedBottom > clippedY &&
        x >= clippedX && x <= clippedRight &&
        y >= clippedY && y <= clippedBottom) {
      console.log("🎨 トーンクリック判定成功:", {
        id: tone.id,
        type: tone.type,
        panelId: tone.panelId,
        clippedArea: { x: clippedX, y: clippedY, width: clippedRight - clippedX, height: clippedBottom - clippedY }
      });
      return tone;
    }
  }
  return null;
};

// 🆕 効果線リサイズハンドル判定ヘルパー
const isEffectResizeHandleClicked = (
  mouseX: number,
  mouseY: number,
  effect: EffectElement,
  panel: Panel
): { isClicked: boolean; direction: string } => {
  const absoluteX = panel.x + effect.x * panel.width;
  const absoluteY = panel.y + effect.y * panel.height;
  const absoluteWidth = effect.width * panel.width;
  const absoluteHeight = effect.height * panel.height;
  
  const handleSize = 8;
  const tolerance = 5;
  
  // 4つの角のハンドル判定
  const handles = [
    { x: absoluteX - handleSize/2, y: absoluteY - handleSize/2, direction: 'nw' },
    { x: absoluteX + absoluteWidth - handleSize/2, y: absoluteY - handleSize/2, direction: 'ne' },
    { x: absoluteX - handleSize/2, y: absoluteY + absoluteHeight - handleSize/2, direction: 'sw' },
    { x: absoluteX + absoluteWidth - handleSize/2, y: absoluteY + absoluteHeight - handleSize/2, direction: 'se' },
  ];
  
  for (const handle of handles) {
    if (mouseX >= handle.x - tolerance && mouseX <= handle.x + handleSize + tolerance &&
        mouseY >= handle.y - tolerance && mouseY <= handle.y + handleSize + tolerance) {
      return { isClicked: true, direction: handle.direction };
    }
  }
  
  return { isClicked: false, direction: '' };
};

// 2️⃣ isToneResizeHandleClicked関数を以下に置き換え（パネル境界対応版）
const isToneResizeHandleClicked = (
  mouseX: number,
  mouseY: number,
  tone: ToneElement,
  panel: Panel
): { isClicked: boolean; direction: string } => {
  const absoluteX = panel.x + tone.x * panel.width;
  const absoluteY = panel.y + tone.y * panel.height;
  const absoluteWidth = tone.width * panel.width;
  const absoluteHeight = tone.height * panel.height;
  
  // 🔧 パネル境界でクリッピングされた実際のハンドル位置を計算
  const clippedX = Math.max(absoluteX, panel.x);
  const clippedY = Math.max(absoluteY, panel.y);
  const clippedRight = Math.min(absoluteX + absoluteWidth, panel.x + panel.width);
  const clippedBottom = Math.min(absoluteY + absoluteHeight, panel.y + panel.height);
  
  const handleSize = 8;
  const tolerance = 5;
  
  // 🔧 パネル境界内にあるハンドルのみ判定
  const handles = [
    { x: clippedX - handleSize/2, y: clippedY - handleSize/2, direction: 'nw' },
    { x: clippedRight - handleSize/2, y: clippedY - handleSize/2, direction: 'ne' },
    { x: clippedX - handleSize/2, y: clippedBottom - handleSize/2, direction: 'sw' },
    { x: clippedRight - handleSize/2, y: clippedBottom - handleSize/2, direction: 'se' },
  ];
  
  for (const handle of handles) {
    // ハンドルの中心がパネル境界内にあるかチェック
    const handleCenterX = handle.x + handleSize/2;
    const handleCenterY = handle.y + handleSize/2;
    
    if (handleCenterX >= panel.x && handleCenterX <= panel.x + panel.width &&
        handleCenterY >= panel.y && handleCenterY <= panel.y + panel.height &&
        mouseX >= handle.x - tolerance && mouseX <= handle.x + handleSize + tolerance &&
        mouseY >= handle.y - tolerance && mouseY <= handle.y + handleSize + tolerance) {
      console.log("🎨 トーンリサイズハンドルクリック:", {
        direction: handle.direction,
        handlePos: { x: handle.x, y: handle.y },
        panelBounds: { x: panel.x, y: panel.y, width: panel.width, height: panel.height }
      });
      return { isClicked: true, direction: handle.direction };
    }
  }
  
  return { isClicked: false, direction: '' };
};

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
  // 背景関連（オプショナル）
  backgrounds = [],
  setBackgrounds,
  selectedBackground = null,
  setSelectedBackground,
  // 🆕 効果線関連（オプショナル）
  effects = [],
  setEffects,
  selectedEffect = null,
  setSelectedEffect,
  // 🆕 トーン関連（オプショナル）
  tones = [],
  setTones,
  selectedTone = null,
  setSelectedTone,
  isPanelEditMode,
  snapSettings,
  contextMenu,
  setContextMenu,
  contextMenuActions,
  onPanelSelect,
  onCharacterSelect,
  onPanelSplit,
}: MouseEventHookProps): MouseEventHandlers => {

  // 座標変換ヘルパー関数
  const convertMouseToCanvasCoordinates = (mouseX: number, mouseY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: mouseX, y: mouseY };
    
    const actualWidth = canvas.width;
    const displayWidth = canvas.offsetWidth;
    const displayScale = actualWidth > 0 && displayWidth > 0 ? displayWidth / actualWidth : 1;
    
    return {
      x: Math.round(mouseX / displayScale),
      y: Math.round(mouseY / displayScale)
    };
  };

  // 🔧 修正版 handleCanvasClick - 効果線+トーン追加（優先順位調整）
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 座標変換を適用
    const { x, y } = convertMouseToCanvasCoordinates(mouseX, mouseY);

    console.log('🖱️ Mouse click coordinate conversion:', {
      mouseX,
      mouseY,
      canvasX: x,
      canvasY: y
    });

    setContextMenu({ ...contextMenu, visible: false });

    // クリック判定の優先順位（効果線+トーン追加版）
    // 1. 吹き出しクリック判定（最優先）
    const clickedBubble = BubbleRenderer.findBubbleAt(x, y, speechBubbles, panels);
    if (clickedBubble) {
      actions.setSelectedBubble(clickedBubble);
      actions.setSelectedCharacter(null);
      actions.setSelectedPanel(null);
      if (setSelectedBackground) setSelectedBackground(null);
      if (setSelectedEffect) setSelectedEffect(null);
      if (setSelectedTone) setSelectedTone(null);
      if (onPanelSelect) onPanelSelect(null);
      if (onCharacterSelect) onCharacterSelect(null);
      console.log("💬 吹き出し選択:", clickedBubble.text);
      return;
    }

    // 2. キャラクタークリック判定（2番目の優先度 - パネルより優先）
    console.log('🔍 キャラクタークリック判定開始:', { x, y, charactersCount: characters.length });
    const clickedCharacter = CharacterRenderer.findCharacterAt(x, y, characters, panels);
    if (clickedCharacter) {
      console.log('✅ キャラクタークリック検出:', clickedCharacter.name);
      actions.setSelectedCharacter(clickedCharacter);
      actions.setSelectedBubble(null);
      actions.setSelectedPanel(null);
      if (setSelectedBackground) setSelectedBackground(null);
      if (setSelectedEffect) setSelectedEffect(null);
      if (setSelectedTone) setSelectedTone(null);
      if (onPanelSelect) onPanelSelect(null);
      if (onCharacterSelect) onCharacterSelect(clickedCharacter);
      console.log("👤 キャラクター選択:", clickedCharacter.name);
      return;
    } else {
      console.log('❌ キャラクタークリック検出なし');
    }

    // 🆕 3. 効果線クリック判定（3番目の優先度）
    if (effects.length > 0 && setSelectedEffect) {
      const clickedEffect = findEffectAt(x, y, effects, panels);
      if (clickedEffect) {
        setSelectedEffect(clickedEffect);
        actions.setSelectedBubble(null);
        actions.setSelectedCharacter(null);
        actions.setSelectedPanel(null);
        if (setSelectedBackground) setSelectedBackground(null);
        if (setSelectedTone) setSelectedTone(null);
        if (onPanelSelect) onPanelSelect(null);
        if (onCharacterSelect) onCharacterSelect(null);
        console.log("⚡ 効果線選択:", clickedEffect.type);
        return;
      }
    }

    // 🆕 4. トーンクリック判定（4番目の優先度）
    if (tones.length > 0 && setSelectedTone) {
      const clickedTone = findToneAt(x, y, tones, panels);
      if (clickedTone) {
        setSelectedTone(clickedTone);
        actions.setSelectedBubble(null);
        actions.setSelectedCharacter(null);
        actions.setSelectedPanel(null);
        if (setSelectedBackground) setSelectedBackground(null);
        if (setSelectedEffect) setSelectedEffect(null);
        if (onPanelSelect) onPanelSelect(null);
        if (onCharacterSelect) onCharacterSelect(null);
        console.log("🎨 トーン選択:", clickedTone.type);
        return;
      }
    }

    // 5. パネルクリック判定（背景より優先）
    const clickedPanel = PanelManager.findPanelAt(x, y, panels);
    if (clickedPanel) {
      actions.setSelectedPanel(clickedPanel);
      actions.setSelectedCharacter(null);
      actions.setSelectedBubble(null);
      if (setSelectedBackground) setSelectedBackground(null);
      if (setSelectedEffect) setSelectedEffect(null);
      if (setSelectedTone) setSelectedTone(null);
      if (onPanelSelect) onPanelSelect(clickedPanel);
      if (onCharacterSelect) onCharacterSelect(null);
      console.log("📐 パネル選択:", clickedPanel.id);
      return;
    }

    // 6. 背景クリック判定（最後の優先度）
    if (backgrounds.length > 0 && setSelectedBackground) {
      const clickedBackground = findBackgroundAt(x, y, backgrounds, panels);
      if (clickedBackground) {
        setSelectedBackground(clickedBackground);
        actions.setSelectedBubble(null);
        actions.setSelectedCharacter(null);
        actions.setSelectedPanel(null);
        if (setSelectedEffect) setSelectedEffect(null);
        if (setSelectedTone) setSelectedTone(null);
        if (onPanelSelect) onPanelSelect(null);
        if (onCharacterSelect) onCharacterSelect(null);
        console.log("🎨 背景選択:", clickedBackground.type);
        return;
      }
    }

    // 7. 空白クリック（全選択解除）
    console.log("🎯 空白クリック - 全選択解除");
    actions.setSelectedPanel(null);
    actions.setSelectedCharacter(null);
    actions.setSelectedBubble(null);
    if (setSelectedBackground) setSelectedBackground(null);
    if (setSelectedEffect) setSelectedEffect(null);
    if (setSelectedTone) setSelectedTone(null);
    if (onPanelSelect) onPanelSelect(null);
    if (onCharacterSelect) onCharacterSelect(null);
  };

  // 🔧 修正版 handleCanvasMouseDown - 効果線+トーン操作追加
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setContextMenu({ ...contextMenu, visible: false });
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 座標変換を適用
    const { x, y } = convertMouseToCanvasCoordinates(mouseX, mouseY);

    console.log("🖱️ マウスダウン開始:", { 
      mouseX, 
      mouseY, 
      canvasX: x,
      canvasY: y
    });

    // 優先順位1: パネル編集モードのハンドル判定（最優先）
    if (isPanelEditMode && state.selectedPanel) {
      const panelHandle = PanelManager.getPanelHandleAt(x, y, state.selectedPanel);
      
      if (panelHandle) {
        console.log("🔧 パネル編集ハンドル:", panelHandle.type);
        
        if (panelHandle.type === "delete") {
          contextMenuActions.onDeletePanel(state.selectedPanel);
          e.preventDefault();
          return;
        } else if (panelHandle.type === "resize") {
          actions.setIsPanelResizing(true);
          actions.setResizeDirection(panelHandle.direction || "");
          actions.setDragOffset({ x, y });
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

    // 優先順位2: キャラクター操作判定
    let clickedCharacter: Character | null = null;
    for (let i = characters.length - 1; i >= 0; i--) {
      const character = characters[i];
      const panel = panels.find(p => p.id === character.panelId);
      
      if (panel) {
        const bounds = CharacterBounds.getCharacterBounds(character, panel);
        const expandedBounds = {
          x: bounds.x - 50,
          y: bounds.y - 50,
          width: bounds.width + 100,
          height: bounds.height + 100
        };
        
        const expandedClicked = (
          x >= expandedBounds.x &&
          x <= expandedBounds.x + expandedBounds.width &&
          y >= expandedBounds.y &&
          y <= expandedBounds.y + expandedBounds.height
        );
        
        if (expandedClicked) {
          clickedCharacter = character;
          console.log(`✅ キャラクター発見: ${character.name}`);
          break;
        }
      }
    }

    if (clickedCharacter) {
      console.log("👤 キャラクター処理開始:", clickedCharacter.name);
      
      // 常にキャラクターを選択状態にする（既に選択済みでも）
      actions.setSelectedCharacter(clickedCharacter);
      actions.setSelectedBubble(null);
      actions.setSelectedPanel(null);
      if (setSelectedBackground) setSelectedBackground(null);
      if (setSelectedEffect) setSelectedEffect(null);
      if (setSelectedTone) setSelectedTone(null);
      if (onCharacterSelect) onCharacterSelect(clickedCharacter);
      console.log("📱 キャラクター選択状態確定");
      
      const panel = panels.find(p => p.id === clickedCharacter!.panelId);
      if (!panel) {
        console.error("❌ パネル未発見");
        e.preventDefault();
        return;
      }
      
      // 回転ハンドル判定
      const rotationClicked = CharacterBounds.isRotationHandleClicked(
        x, y, clickedCharacter, panel
      );
      
      if (rotationClicked) {
        console.log("🔄 回転ハンドルクリック");
        actions.setIsCharacterRotating(true);
        
        const { centerX, centerY } = CharacterUtils.calculateCenterCoordinates(clickedCharacter, panel);
        const startAngle = CharacterUtils.calculateAngle(centerX, centerY, x, y);
        
        actions.setRotationStartAngle(startAngle);
        actions.setOriginalRotation(clickedCharacter.rotation || 0);
        
        e.preventDefault();
        return;
      }
      
      // リサイズハンドル判定
      const resizeResult = CharacterRenderer.isCharacterResizeHandleClicked(
        x, y, clickedCharacter, panel
      );
      
      if (resizeResult.isClicked) {
        console.log("📏 キャラクターリサイズ開始:", resizeResult.direction);
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
      
      // 通常ドラッグ開始
      console.log("📱 キャラクター通常ドラッグ開始");
      actions.setIsDragging(true);
      actions.setDragOffset({
        x: x - clickedCharacter.x,
        y: y - clickedCharacter.y,
      });
      
      e.preventDefault();
      return;
    }

    // 優先順位3: 吹き出し操作判定
    const clickedBubble = BubbleRenderer.findBubbleAt(x, y, speechBubbles, panels);
    if (clickedBubble) {
      console.log("🎯 吹き出しクリック:", clickedBubble.text);
      
      actions.setSelectedBubble(clickedBubble);
      actions.setSelectedCharacter(null);
      actions.setSelectedPanel(null);
      if (setSelectedBackground) setSelectedBackground(null);
      if (setSelectedEffect) setSelectedEffect(null);
      if (setSelectedTone) setSelectedTone(null);
      
      const panel = panels.find(p => p.id === clickedBubble.panelId) || panels[0];
      if (!panel) {
        console.error("❌ 吹き出しパネル未発見");
        return;
      }
      
      const resizeResult = BubbleRenderer.isBubbleResizeHandleClicked(x, y, clickedBubble, panel);
      
      if (resizeResult.isClicked) {
        console.log("✅ 吹き出しリサイズ開始:", resizeResult.direction);
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
        console.log("📱 吹き出しドラッグ開始");
        actions.setIsDragging(true);
        actions.setDragOffset({
          x: mouseX - clickedBubble.x,
          y: mouseY - clickedBubble.y,
        });
      }
      
      e.preventDefault();
      return;
    }

    // 🆕 優先順位4: 効果線操作判定
    if (effects.length > 0 && setSelectedEffect) {
      const clickedEffect = findEffectAt(x, y, effects, panels);
      if (clickedEffect) {
        console.log("⚡ 効果線クリック:", clickedEffect.type);
        
        const isAlreadySelected = selectedEffect?.id === clickedEffect.id;
        
        if (!isAlreadySelected) {
          setSelectedEffect(clickedEffect);
          actions.setSelectedCharacter(null);
          actions.setSelectedBubble(null);
          actions.setSelectedPanel(null);
          if (setSelectedBackground) setSelectedBackground(null);
          if (setSelectedTone) setSelectedTone(null);
          if (onCharacterSelect) onCharacterSelect(null);
          if (onPanelSelect) onPanelSelect(null);
          console.log("⚡ 効果線選択状態変更実行");
        }
        
        const panel = panels.find(p => p.id === clickedEffect.panelId);
        if (!panel) {
          console.error("❌ 効果線パネル未発見");
          e.preventDefault();
          return;
        }
        
        // 効果線リサイズハンドル判定
        const resizeResult = isEffectResizeHandleClicked(x, y, clickedEffect, panel);
        
        if (resizeResult.isClicked) {
          console.log("⚡ 効果線リサイズ開始:", resizeResult.direction);
          actions.setIsCharacterResizing(true); // 既存のリサイズフラグを使用
          actions.setResizeDirection(resizeResult.direction);
          actions.setDragOffset({ x, y });
          actions.setInitialCharacterBounds({
            x: clickedEffect.x,
            y: clickedEffect.y,
            width: clickedEffect.width,
            height: clickedEffect.height
          });
        } else if (isAlreadySelected) {
          // 通常ドラッグ（選択済みの場合のみ開始）
          console.log("⚡ 効果線ドラッグ開始");
          actions.setIsDragging(true);
          actions.setDragOffset({
            x: mouseX - (panel.x + clickedEffect.x * panel.width),
            y: mouseY - (panel.y + clickedEffect.y * panel.height),
          });
        }
        
        e.preventDefault();
        return;
      }
    }

    // 🔧 優先順位5: トーン操作判定（パネル内統合版）
if (tones.length > 0 && setSelectedTone) {
  const clickedTone = findToneAt(x, y, tones, panels);
  if (clickedTone) {
    console.log("🎨 トーンクリック:", clickedTone.type, "パネル:", clickedTone.panelId);
    
    const isAlreadySelected = selectedTone?.id === clickedTone.id;
    
    if (!isAlreadySelected) {
      setSelectedTone(clickedTone);
      actions.setSelectedCharacter(null);
      actions.setSelectedBubble(null);
      actions.setSelectedPanel(null);
      if (setSelectedBackground) setSelectedBackground(null);
      if (setSelectedEffect) setSelectedEffect(null);
      if (onCharacterSelect) onCharacterSelect(null);
      if (onPanelSelect) onPanelSelect(null);
      console.log("🎨 トーン選択状態変更実行");
    }
    
    const panel = panels.find(p => p.id === clickedTone.panelId);
    if (!panel) {
      console.error("❌ トーンパネル未発見");
      e.preventDefault();
      return;
    }
    
    // 🔧 トーンリサイズハンドル判定（パネル境界対応）
    const resizeResult = isToneResizeHandleClicked(x, y, clickedTone, panel);
    
    if (resizeResult.isClicked) {
      console.log("🎨 トーンリサイズ開始:", resizeResult.direction);
      actions.setIsCharacterResizing(true); // 既存のリサイズフラグを使用
      actions.setResizeDirection(resizeResult.direction);
      actions.setDragOffset({ x: mouseX, y: mouseY });
      actions.setInitialCharacterBounds({
        x: clickedTone.x,
        y: clickedTone.y,
        width: clickedTone.width,
        height: clickedTone.height
      });
    } else if (isAlreadySelected) {
      // 🔧 パネル内相対座標でのドラッグ開始
      console.log("🎨 トーンドラッグ開始（パネル内相対座標）");
      actions.setIsDragging(true);
      
      // パネル内相対座標でドラッグオフセットを計算
      const absoluteX = panel.x + clickedTone.x * panel.width;
      const absoluteY = panel.y + clickedTone.y * panel.height;
      
      actions.setDragOffset({
        x: mouseX - absoluteX,
        y: mouseY - absoluteY,
      });
    }
    
    e.preventDefault();
    return;
  }
}

    // 優先順位6: 通常パネル処理（背景より優先）
    const clickedPanel = PanelManager.findPanelAt(x, y, panels);
    if (clickedPanel) {
      console.log("🎯 パネルクリック:", clickedPanel.id);
      actions.setSelectedPanel(clickedPanel);
      actions.setSelectedCharacter(null);
      actions.setSelectedBubble(null);
      if (setSelectedBackground) setSelectedBackground(null);
      if (setSelectedEffect) setSelectedEffect(null);
      if (setSelectedTone) setSelectedTone(null);
      if (onPanelSelect) onPanelSelect(clickedPanel);
      if (onCharacterSelect) onCharacterSelect(null);
      return;
    }

    // 優先順位7: 背景クリック判定（最後）
    if (backgrounds.length > 0 && setSelectedBackground) {
      const clickedBackground = findBackgroundAt(x, y, backgrounds, panels);
      if (clickedBackground) {
        console.log("🎨 背景クリック:", clickedBackground.type);
        setSelectedBackground(clickedBackground);
        actions.setSelectedCharacter(null);
        actions.setSelectedBubble(null);
        actions.setSelectedPanel(null);
        if (setSelectedEffect) setSelectedEffect(null);
        if (setSelectedTone) setSelectedTone(null);
        if (onPanelSelect) onPanelSelect(null);
        if (onCharacterSelect) onCharacterSelect(null);
        e.preventDefault();
        return;
      }
    }

    // 最後: 空白クリック
    console.log("🎯 空白クリック - 全選択解除");
    actions.setSelectedPanel(null);
    actions.setSelectedCharacter(null);
    actions.setSelectedBubble(null);
    if (setSelectedBackground) setSelectedBackground(null);
    if (setSelectedEffect) setSelectedEffect(null);
    if (setSelectedTone) setSelectedTone(null);
    if (onPanelSelect) onPanelSelect(null);
    if (onCharacterSelect) onCharacterSelect(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 座標変換を適用
    const { x, y } = convertMouseToCanvasCoordinates(mouseX, mouseY);

    // 何も操作していない場合は早期リターン
    if (!state.isDragging && !state.isPanelResizing && !state.isPanelMoving && 
        !state.isCharacterResizing && !state.isBubbleResizing && !state.isCharacterRotating) {
      return;
    }

    // キャラクター回転処理（ハンドルのみ）
    if (state.isCharacterRotating && state.selectedCharacter) {
      console.log("🔄 回転処理実行中（ハンドルのみ）:", {
        character: state.selectedCharacter.name,
        mousePos: { mouseX, mouseY },
        canvasPos: { x, y }
      });
      
      const panel = panels.find(p => p.id === state.selectedCharacter!.panelId);
      if (panel && state.selectedCharacter) {
        const { centerX, centerY } = CharacterUtils.calculateCenterCoordinates(
          state.selectedCharacter, panel
        );
        const currentAngle = CharacterUtils.calculateAngle(centerX, centerY, x, y);
        
        const angleDiff = CharacterUtils.calculateAngleDifference(
          state.rotationStartAngle, currentAngle
        );
        const newRotation = CharacterUtils.normalizeAngle(
          state.originalRotation + angleDiff
        );
        
        const updatedCharacter = { 
          ...state.selectedCharacter,
          rotation: newRotation 
        };
        
        setCharacters(characters.map((char: Character) => 
          char.id === updatedCharacter.id ? updatedCharacter : char
        ));
        
        actions.setSelectedCharacter(updatedCharacter);
      }
      return;
    }

    // 🆕 効果線リサイズ処理（キャラクターリサイズフラグを流用）
    if (selectedEffect && state.isCharacterResizing && state.initialCharacterBounds && setEffects) {
      const deltaX = mouseX - state.dragOffset.x;
      const deltaY = mouseY - state.dragOffset.y;
      
      const panel = panels.find(p => p.id === selectedEffect.panelId);
      if (!panel) return;
      
      // パネル内の相対座標でリサイズ計算
      const relativeScaleX = deltaX / panel.width;
      const relativeScaleY = deltaY / panel.height;
      
      let newWidth = state.initialCharacterBounds.width;
      let newHeight = state.initialCharacterBounds.height;
      let newX = state.initialCharacterBounds.x;
      let newY = state.initialCharacterBounds.y;
      
      switch (state.resizeDirection) {
        case 'se': // 右下
          newWidth = Math.max(0.1, state.initialCharacterBounds.width + relativeScaleX);
          newHeight = Math.max(0.1, state.initialCharacterBounds.height + relativeScaleY);
          break;
        case 'sw': // 左下
          newWidth = Math.max(0.1, state.initialCharacterBounds.width - relativeScaleX);
          newHeight = Math.max(0.1, state.initialCharacterBounds.height + relativeScaleY);
          newX = state.initialCharacterBounds.x + relativeScaleX;
          break;
        case 'ne': // 右上
          newWidth = Math.max(0.1, state.initialCharacterBounds.width + relativeScaleX);
          newHeight = Math.max(0.1, state.initialCharacterBounds.height - relativeScaleY);
          newY = state.initialCharacterBounds.y + relativeScaleY;
          break;
        case 'nw': // 左上
          newWidth = Math.max(0.1, state.initialCharacterBounds.width - relativeScaleX);
          newHeight = Math.max(0.1, state.initialCharacterBounds.height - relativeScaleY);
          newX = state.initialCharacterBounds.x + relativeScaleX;
          newY = state.initialCharacterBounds.y + relativeScaleY;
          break;
      }
      
      const updatedEffect = {
        ...selectedEffect,
        x: Math.max(0, Math.min(newX, 1 - newWidth)),
        y: Math.max(0, Math.min(newY, 1 - newHeight)),
        width: newWidth,
        height: newHeight,
      };
      
      if (setEffects) {
        setEffects(effects.map(effect => 
          effect.id === selectedEffect.id ? updatedEffect : effect
        ));
      }
      if (setSelectedEffect) {
        setSelectedEffect(updatedEffect);
      }
      return;
    }

    // 🔧 トーンリサイズ処理（パネル内統合版）
if (selectedTone && state.isCharacterResizing && state.initialCharacterBounds && setTones) {
  const deltaX = mouseX - state.dragOffset.x;
  const deltaY = mouseY - state.dragOffset.y;
  
  const panel = panels.find(p => p.id === selectedTone.panelId);
  if (!panel) return;
  
  // パネル内の相対座標でリサイズ計算
  const relativeScaleX = deltaX / panel.width;
  const relativeScaleY = deltaY / panel.height;
  
  let newWidth = state.initialCharacterBounds.width;
  let newHeight = state.initialCharacterBounds.height;
  let newX = state.initialCharacterBounds.x;
  let newY = state.initialCharacterBounds.y;
  
  switch (state.resizeDirection) {
    case 'se': // 右下
      newWidth = Math.max(0.05, state.initialCharacterBounds.width + relativeScaleX);
      newHeight = Math.max(0.05, state.initialCharacterBounds.height + relativeScaleY);
      break;
    case 'sw': // 左下
      newWidth = Math.max(0.05, state.initialCharacterBounds.width - relativeScaleX);
      newHeight = Math.max(0.05, state.initialCharacterBounds.height + relativeScaleY);
      newX = state.initialCharacterBounds.x + relativeScaleX;
      break;
    case 'ne': // 右上
      newWidth = Math.max(0.05, state.initialCharacterBounds.width + relativeScaleX);
      newHeight = Math.max(0.05, state.initialCharacterBounds.height - relativeScaleY);
      newY = state.initialCharacterBounds.y + relativeScaleY;
      break;
    case 'nw': // 左上
      newWidth = Math.max(0.05, state.initialCharacterBounds.width - relativeScaleX);
      newHeight = Math.max(0.05, state.initialCharacterBounds.height - relativeScaleY);
      newX = state.initialCharacterBounds.x + relativeScaleX;
      newY = state.initialCharacterBounds.y + relativeScaleY;
      break;
  }
  
  // 🔧 パネル境界でクランプ（重要）
  const updatedTone = {
    ...selectedTone,
    x: Math.max(0, Math.min(newX, 1 - newWidth)),
    y: Math.max(0, Math.min(newY, 1 - newHeight)),
    width: Math.min(newWidth, 1 - Math.max(0, newX)),
    height: Math.min(newHeight, 1 - Math.max(0, newY)),
  };
  
  setTones(tones.map(tone => 
    tone.id === selectedTone.id ? updatedTone : tone
  ));
  setSelectedTone?.(updatedTone);
  console.log("🎨 トーンリサイズ実行:", {
    direction: state.resizeDirection,
    newBounds: { x: updatedTone.x, y: updatedTone.y, width: updatedTone.width, height: updatedTone.height }
  });
  return;
}

    // 🆕 効果線移動処理
    if (selectedEffect && state.isDragging && setEffects) {
      const panel = panels.find(p => p.id === selectedEffect.panelId);
      if (!panel) return;
      
      // パネル内の相対座標で移動計算
      const absoluteX = mouseX - state.dragOffset.x;
      const absoluteY = mouseY - state.dragOffset.y;
      const relativeX = (absoluteX - panel.x) / panel.width;
      const relativeY = (absoluteY - panel.y) / panel.height;
      
      const updatedEffect = {
        ...selectedEffect,
        x: Math.max(0, Math.min(relativeX, 1 - selectedEffect.width)),
        y: Math.max(0, Math.min(relativeY, 1 - selectedEffect.height)),
      };
      
      if (setEffects) {
        setEffects(effects.map(effect => 
          effect.id === selectedEffect.id ? updatedEffect : effect
        ));
      }
      if (setSelectedEffect) {
        setSelectedEffect(updatedEffect);
      }
      return;
    }

    // 🆕 トーン移動処理
    if (selectedTone && state.isDragging && setTones) {
      const panel = panels.find(p => p.id === selectedTone.panelId);
      if (!panel) return;
      
      // パネル内の相対座標で移動計算
      const absoluteX = mouseX - state.dragOffset.x;
      const absoluteY = mouseY - state.dragOffset.y;
      const relativeX = (absoluteX - panel.x) / panel.width;
      const relativeY = (absoluteY - panel.y) / panel.height;
      
      const updatedTone = {
        ...selectedTone,
        x: Math.max(0, Math.min(relativeX, 1 - selectedTone.width)),
        y: Math.max(0, Math.min(relativeY, 1 - selectedTone.height)),
      };
      
      if (setTones) {
        setTones(tones.map(tone => 
          tone.id === selectedTone.id ? updatedTone : tone
        ));
      }
      if (setSelectedTone) {
        setSelectedTone(updatedTone);
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
      console.log("📱 キャラクター移動実行中（回転なし）");
      
      const newX = x - state.dragOffset.x;
      const newY = y - state.dragOffset.y;
      
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
      const deltaX = x - state.dragOffset.x;
      const deltaY = y - state.dragOffset.y;
      
      const updatedPanel = PanelManager.resizePanel(
        state.selectedPanel,
        state.resizeDirection,
        deltaX,
        deltaY
      );
      
      setPanels(panels.map(p => p.id === state.selectedPanel!.id ? updatedPanel : p));
      actions.setSelectedPanel(updatedPanel);
      actions.setDragOffset({ x, y });
      return;
    }

    // パネル移動
    if (state.selectedPanel && state.isPanelMoving) {
      const deltaX = x - state.dragOffset.x - state.selectedPanel.x;
      const deltaY = y - state.dragOffset.y - state.selectedPanel.y;
      
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
    console.log("⬆️ マウスアップ - 操作終了処理");
    
    // 回転終了時の選択状態維持
    if (state.isCharacterRotating && state.selectedCharacter) {
      console.log("🔄 回転操作完了 - 選択状態維持:", state.selectedCharacter.name);
      const currentCharacter = state.selectedCharacter;
      
      // 状態リセット
      actions.resetDragStates();
      actions.setSnapLines([]);
      
      // 選択状態を明示的に再設定
      setTimeout(() => {
        actions.setSelectedCharacter(currentCharacter);
        if (onCharacterSelect) onCharacterSelect(currentCharacter);
        console.log("✅ 回転後選択状態復元:", currentCharacter.name);
      }, 0);
      
      return;
    }
    
    // 🆕 効果線操作終了時の選択状態維持
    if ((state.isDragging || state.isCharacterResizing) && selectedEffect && setSelectedEffect) {
      console.log("⚡ 効果線操作完了 - 選択状態維持:", selectedEffect.type);
      const currentEffect = selectedEffect;
      
      // 状態リセット
      actions.resetDragStates();
      actions.setSnapLines([]);
      
      // 選択状態を明示的に再設定
      setTimeout(() => {
        if (setSelectedEffect) {
          setSelectedEffect(currentEffect);
        }
        console.log("✅ 効果線操作後選択状態復元:", currentEffect.type);
      }, 0);
      
      return;
    }

    // 🆕 トーン操作終了時の選択状態維持
    if ((state.isDragging || state.isCharacterResizing) && selectedTone && setSelectedTone) {
      console.log("🎨 トーン操作完了 - 選択状態維持:", selectedTone.type);
      const currentTone = selectedTone;
      
      // 状態リセット
      actions.resetDragStates();
      actions.setSnapLines([]);
      
      // 選択状態を明示的に再設定
      setTimeout(() => {
        if (setSelectedTone) {
          setSelectedTone(currentTone);
        }
        console.log("✅ トーン操作後選択状態復元:", currentTone.type);
      }, 0);
      
      return;
    }

    // 🆕 キャラクタードラッグ操作終了時の選択状態維持
    if ((state.isDragging || state.isCharacterResizing) && state.selectedCharacter) {
      console.log("👤 キャラクター操作完了 - 選択状態維持:", state.selectedCharacter.name);
      const currentCharacter = state.selectedCharacter;
      
      // 状態リセット
      actions.resetDragStates();
      actions.setSnapLines([]);
      
      // 選択状態を明示的に再設定
      setTimeout(() => {
        actions.setSelectedCharacter(currentCharacter);
        if (onCharacterSelect) onCharacterSelect(currentCharacter);
        console.log("✅ キャラクター操作後選択状態復元:", currentCharacter.name);
      }, 0);
      
      return;
    }
    
    // その他の操作終了処理
    actions.resetDragStates();
    actions.setSnapLines([]);
    console.log("✅ 全状態リセット完了");
  };

  const handleCanvasContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 座標変換を適用
    const { x, y } = convertMouseToCanvasCoordinates(mouseX, mouseY);

    // 右クリックメニューでも優先順位を調整（効果線+トーン追加）
    // 1. 吹き出し右クリック判定（最優先）
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

    // 2. キャラクター右クリック判定（2番目の優先度）
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

    // 🆕 3. 効果線右クリック判定（3番目の優先度）
    if (effects.length > 0) {
      const clickedEffect = findEffectAt(x, y, effects, panels);
      if (clickedEffect) {
        setContextMenu({
          visible: true,
          x: e.clientX,
          y: e.clientY,
          target: 'effect',
          targetElement: clickedEffect,
        });
        return;
      }
    }

    // 🆕 4. トーン右クリック判定（4番目の優先度）
    if (tones.length > 0) {
      const clickedTone = findToneAt(x, y, tones, panels);
      if (clickedTone) {
        setContextMenu({
          visible: true,
          x: e.clientX,
          y: e.clientY,
          target: 'tone',
          targetElement: clickedTone,
        });
        return;
      }
    }

    // 5. パネル右クリック判定（背景より優先）
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

    // 6. 背景右クリック判定（最後の優先度）
    if (backgrounds.length > 0) {
      const clickedBackground = findBackgroundAt(x, y, backgrounds, panels);
      if (clickedBackground) {
        setContextMenu({
          visible: true,
          x: e.clientX,
          y: e.clientY,
          target: 'background',
          targetElement: clickedBackground,
        });
        return;
      }
    }

    // 7. 空白右クリック
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
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 座標変換を適用
    const { x, y } = convertMouseToCanvasCoordinates(mouseX, mouseY);
    
    // 🆕 効果線ダブルクリック処理
    if (effects.length > 0) {
      const clickedEffect = findEffectAt(x, y, effects, panels);
      if (clickedEffect && contextMenuActions.onOpenEffectPanel) {
        contextMenuActions.onOpenEffectPanel(clickedEffect);
        console.log("⚡ 効果線設定パネル開く:", clickedEffect.type);
        return;
      }
    }

    // 🆕 トーンダブルクリック処理
    if (tones.length > 0) {
      const clickedTone = findToneAt(x, y, tones, panels);
      if (clickedTone && contextMenuActions.onOpenTonePanel) {
        contextMenuActions.onOpenTonePanel(clickedTone);
        console.log("🎨 トーン設定パネル開く:", clickedTone.type);
        return;
      }
    }
    
    // 背景ダブルクリック処理
    if (backgrounds.length > 0) {
      const clickedBackground = findBackgroundAt(x, y, backgrounds, panels);
      if (clickedBackground && contextMenuActions.onOpenBackgroundPanel) {
        contextMenuActions.onOpenBackgroundPanel(clickedBackground);
        console.log("🎨 背景設定パネル開く:", clickedBackground.type);
        return;
      }
    }
    
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