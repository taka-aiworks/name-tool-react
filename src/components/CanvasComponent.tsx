// src/components/CanvasComponent.tsx - 型エラー完全修正版
import React, { useRef, useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { Panel, Character, SpeechBubble, BackgroundElement, EffectElement, ToneElement, CanvasComponentProps } from "../types";
import { templates } from "./CanvasArea/templates";

// Hooks import
import { useCanvasState } from "./CanvasComponent/hooks/useCanvasState";
import { useMouseEvents } from "./CanvasComponent/hooks/useMouseEvents";
import { useKeyboardEvents } from "./CanvasComponent/hooks/useKeyboardEvents";
import { useCanvasDrawing } from "./CanvasComponent/hooks/useCanvasDrawing";
import { useElementActions } from "./CanvasComponent/hooks/useElementActions";

// Components
import EditBubbleModal from "./CanvasArea/EditBubbleModal";
import { BackgroundRenderer } from "./CanvasArea/renderers/BackgroundRenderer";
import { ContextMenuHandler, ContextMenuState, ContextMenuActions, ClipboardState } from "./CanvasArea/ContextMenuHandler";

// 1. インポートを追加
import ElementLabelRenderer from "./CanvasArea/renderers/ElementLabelRenderer";

import { getCanvasBackgroundDisplayName } from '../utils/backgroundUtils';

/**
 * 🔧 ExtendedCanvasComponentProps - 型競合修正版
 * selectedTone, onToneSelectはCanvasComponentPropsで既に必須として定義済み
 * 新規プロパティのみ追加
 */
// CanvasComponent.tsx - 順番修正版

interface ExtendedCanvasComponentProps extends CanvasComponentProps {
  characterNames?: Record<string, string>; // 🆕 追加
}

/**
 * Canvas操作の中核となるコンポーネント（型エラー完全修正版）
 */
const CanvasComponent = forwardRef<HTMLCanvasElement, ExtendedCanvasComponentProps>((props, ref) => {
  const {
    selectedTemplate,
    panels,
    setPanels,
    characters,
    setCharacters,
    speechBubbles,
    setSpeechBubbles,
    backgrounds,
    setBackgrounds,
    effects,
    setEffects,
    // 🔧 トーン関連（CanvasComponentPropsから継承・必須プロパティ）
    tones,
    setTones,
    selectedTone,      // 🔧 必須プロパティとして直接使用
    onToneSelect,      // 🔧 必須プロパティとして直接使用
    showTonePanel,     // 🔧 必須プロパティとして直接使用
    // 🆕 新規プロパティ（拡張分）
    onTonePanelToggle,
    characterNames, // 🆕 ここに追加
    // 既存のprops
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
    },
    // 🆕 入れ替え選択状態
    swapPanel1,
    swapPanel2
  } = props;

  // 🆕 キャラクター表示名取得関数（関数内に移動）
  const getCharacterDisplayName = (character: Character) => {
    return characterNames?.[character.type] || character.name || 'キャラクター';
  };

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  useImperativeHandle(ref, () => canvasRef.current!, []);

  // 状態管理hook使用
  const [state, actions] = useCanvasState();

  // 背景選択状態
  const [selectedBackground, setSelectedBackground] = useState<BackgroundElement | null>(null);
  const [isBackgroundDragging, setIsBackgroundDragging] = useState<boolean>(false);
  const [isBackgroundResizing, setIsBackgroundResizing] = useState<boolean>(false);
  
  // 効果線選択状態
  const [selectedEffect, setSelectedEffect] = useState<EffectElement | null>(null);
  const [isEffectDragging, setIsEffectDragging] = useState<boolean>(false);
  const [isEffectResizing, setIsEffectResizing] = useState<boolean>(false);

  // 🔧 トーン操作状態（selectedToneはpropsから直接使用）
  const [isToneDragging, setIsToneDragging] = useState<boolean>(false);
  const [isToneResizing, setIsToneResizing] = useState<boolean>(false);

  // 🔧 トーン選択ハンドラー（必須プロパティとして扱う）
  const handleToneSelect = (tone: ToneElement | null) => {
    onToneSelect(tone);  // 🔧 必須プロパティのため直接呼び出し
  };

  // ContextMenu & Clipboard 状態
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    target: null,
    targetElement: null,
  });
  const [clipboard, setClipboard] = useState<ClipboardState | null>(null);

  // ContextMenuActions実装（トーン対応版）
  const contextMenuActions: ContextMenuActions = {
    onDuplicateCharacter: (character: Character) => {
      const newCharacter = {
        ...character,
        id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: `${character.name}(コピー)`,
        x: character.x + 30,
        y: character.y + 30,
      };
      setCharacters([...characters, newCharacter]);
      actions.setSelectedCharacter(newCharacter);
      if (onCharacterSelect) onCharacterSelect(newCharacter);
    },

    onDuplicatePanel: (panel: Panel) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const maxId = Math.max(...panels.map(p => p.id), 0);
      const newPanelId = maxId + 1;
      
      const newPanel: Panel = {
        ...panel,
        id: newPanelId,
        x: panel.x + panel.width + 10,
        y: panel.y
      };
      
      if (newPanel.x + newPanel.width > canvas.width) {
        newPanel.x = panel.x;
        newPanel.y = panel.y + panel.height + 10;
        
        if (newPanel.y + newPanel.height > canvas.height) {
          newPanel.x = Math.max(0, panel.x - panel.width - 10);
          newPanel.y = panel.y;
        }
      }
      
      const panelCharacters = characters.filter(char => char.panelId === panel.id);
      const newCharacters = panelCharacters.map(char => ({
        ...char,
        id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        panelId: newPanelId,
      }));
      
      const panelBubbles = speechBubbles.filter(bubble => bubble.panelId === panel.id);
      const newBubbles = panelBubbles.map(bubble => ({
        ...bubble,
        id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        panelId: newPanelId,
      }));

      // 背景も複製
      const panelBackgrounds = backgrounds.filter(bg => bg.panelId === panel.id);
      const newBackgrounds = panelBackgrounds.map(bg => ({
        ...bg,
        id: `bg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        panelId: newPanelId,
      }));

      // 効果線も複製
      const panelEffects = effects.filter(effect => effect.panelId === panel.id);
      const newEffects = panelEffects.map(effect => ({
        ...effect,
        id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        panelId: newPanelId,
      }));

      // トーンも複製
      const panelTones = tones.filter(tone => tone.panelId === panel.id);
      const newTones = panelTones.map(tone => ({
        ...tone,
        id: `tone_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        panelId: newPanelId,
      }));
      
      setPanels([...panels, newPanel]);
      setCharacters([...characters, ...newCharacters]);
      setSpeechBubbles([...speechBubbles, ...newBubbles]);
      setBackgrounds([...backgrounds, ...newBackgrounds]);
      setEffects([...effects, ...newEffects]);
      setTones([...tones, ...newTones]);
      
      actions.setSelectedPanel(newPanel);
      actions.setSelectedCharacter(null);
      actions.setSelectedBubble(null);
      setSelectedBackground(null);
      setSelectedEffect(null);
      handleToneSelect(null);
      if (onPanelSelect) onPanelSelect(newPanel);
      if (onCharacterSelect) onCharacterSelect(null);
    },

    onCopyToClipboard: (type: 'panel' | 'character' | 'bubble' | 'background' | 'effect' | 'tone', element: Panel | Character | SpeechBubble | BackgroundElement | EffectElement | ToneElement) => {
      const newClipboard: ClipboardState = { type, data: element };
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
          actions.setSelectedBubble(newBubble);
          break;

        case 'background':
          const newBackground = {
            ...data as BackgroundElement,
            id: `bg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            x: (data as BackgroundElement).x + 0.1,
            y: (data as BackgroundElement).y + 0.1,
          };
          setBackgrounds([...backgrounds, newBackground]);
          setSelectedBackground(newBackground);
          break;

        case 'effect':
          const newEffect = {
            ...data as EffectElement,
            id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            x: (data as EffectElement).x + 0.1,
            y: (data as EffectElement).y + 0.1,
          };
          setEffects([...effects, newEffect]);
          setSelectedEffect(newEffect);
          break;

        // トーンペースト
        case 'tone':
          const newTone = {
            ...data as ToneElement,
            id: `tone_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            x: (data as ToneElement).x + 0.1,
            y: (data as ToneElement).y + 0.1,
          };
          setTones([...tones, newTone]);
          handleToneSelect(newTone);
          break;
      }
      
      setClipboard(null);
    },

    onDeleteElement: (type: 'character' | 'bubble' | 'background' | 'effect' | 'tone', element: Character | SpeechBubble | BackgroundElement | EffectElement | ToneElement) => {
      if (type === 'character') {
        const newCharacters = characters.filter(char => char.id !== element.id);
        setCharacters(newCharacters);
        actions.setSelectedCharacter(null);
        if (onCharacterSelect) onCharacterSelect(null);
        // コンソールログは無効化
      } else if (type === 'bubble') {
        const newBubbles = speechBubbles.filter(bubble => bubble.id !== element.id);
        setSpeechBubbles(newBubbles);
        actions.setSelectedBubble(null);
        // コンソールログは無効化
      } else if (type === 'background') {
        const newBackgrounds = backgrounds.filter(bg => bg.id !== element.id);
        setBackgrounds(newBackgrounds);
        setSelectedBackground(null);
        // コンソールログは無効化
      } else if (type === 'effect') {
        const newEffects = effects.filter(effect => effect.id !== element.id);
        setEffects(newEffects);
        setSelectedEffect(null);
        // コンソールログは無効化
      } else if (type === 'tone') {
        // トーン削除
        const newTones = tones.filter(tone => tone.id !== element.id);
        setTones(newTones);
        handleToneSelect(null);
        // コンソールログは無効化
      }
    },

    onDeletePanel: (panel: Panel) => {
      const panelCharacters = characters.filter(char => char.panelId === panel.id);
      const panelBubbles = speechBubbles.filter(bubble => bubble.panelId === panel.id);
      const panelBackgrounds = backgrounds.filter(bg => bg.panelId === panel.id);
      const panelEffects = effects.filter(effect => effect.panelId === panel.id);
      const panelTones = tones.filter(tone => tone.panelId === panel.id);
      
      let confirmMessage = `コマ ${panel.id} を削除しますか？`;
      if (panelCharacters.length > 0 || panelBubbles.length > 0 || panelBackgrounds.length > 0 || panelEffects.length > 0 || panelTones.length > 0) {
        confirmMessage += `\n含まれる要素も一緒に削除されます:`;
        if (panelCharacters.length > 0) {
          confirmMessage += `\n・キャラクター: ${panelCharacters.length}体`;
        }
        if (panelBubbles.length > 0) {
          confirmMessage += `\n・吹き出し: ${panelBubbles.length}個`;
        }
        if (panelBackgrounds.length > 0) {
          confirmMessage += `\n・背景: ${panelBackgrounds.length}個`;
        }
        if (panelEffects.length > 0) {
          confirmMessage += `\n・効果線: ${panelEffects.length}個`;
        }
        if (panelTones.length > 0) {
          confirmMessage += `\n・トーン: ${panelTones.length}個`;
        }
      }
      
      if (!window.confirm(confirmMessage)) {
        return;
      }

      const newPanels = panels.filter(p => p.id !== panel.id);
      const newCharacters = characters.filter(char => char.panelId !== panel.id);
      const newBubbles = speechBubbles.filter(bubble => bubble.panelId !== panel.id);
      const newBackgrounds = backgrounds.filter(bg => bg.panelId !== panel.id);
      const newEffects = effects.filter(effect => effect.panelId !== panel.id);
      const newTones = tones.filter(tone => tone.panelId !== panel.id);
      
      setPanels(newPanels);
      setCharacters(newCharacters);
      setSpeechBubbles(newBubbles);
      setBackgrounds(newBackgrounds);
      setEffects(newEffects);
      setTones(newTones);

      actions.setSelectedPanel(null);
      actions.setSelectedCharacter(null);
      actions.setSelectedBubble(null);
      setSelectedBackground(null);
      setSelectedEffect(null);
      handleToneSelect(null);
      if (onPanelSelect) onPanelSelect(null);
      if (onCharacterSelect) onCharacterSelect(null);
      
      // コンソールログは無効化
    },

    onFlipHorizontal: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

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
      const flippedBackgrounds = backgrounds.map(bg => ({
        ...bg,
        x: 1 - bg.x - bg.width
      }));
      const flippedEffects = effects.map(effect => ({
        ...effect,
        x: 1 - effect.x - effect.width,
        angle: effect.type === 'speed' ? 180 - effect.angle : effect.angle
      }));
      // トーンも反転
      const flippedTones = tones.map(tone => ({
        ...tone,
        x: 1 - tone.x - tone.width,
        rotation: tone.rotation !== undefined ? 360 - tone.rotation : tone.rotation
      }));

      setPanels(flippedPanels);
      setCharacters(flippedCharacters);
      setSpeechBubbles(flippedBubbles);
      setBackgrounds(flippedBackgrounds);
      setEffects(flippedEffects);
      setTones(flippedTones);
    },

    onFlipVertical: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

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
      const flippedBackgrounds = backgrounds.map(bg => ({
        ...bg,
        y: 1 - bg.y - bg.height
      }));
      const flippedEffects = effects.map(effect => ({
        ...effect,
        y: 1 - effect.y - effect.height,
        angle: effect.type === 'speed' ? -effect.angle : effect.angle
      }));
      // トーンも反転
      const flippedTones = tones.map(tone => ({
        ...tone,
        y: 1 - tone.y - tone.height,
        rotation: tone.rotation !== undefined ? -tone.rotation : tone.rotation
      }));

      setPanels(flippedPanels);
      setCharacters(flippedCharacters);
      setSpeechBubbles(flippedBubbles);
      setBackgrounds(flippedBackgrounds);
      setEffects(flippedEffects);
      setTones(flippedTones);
    },

    onEditPanel: (panel: Panel) => {
      actions.setSelectedPanel(panel);
      actions.setSelectedCharacter(null);
      actions.setSelectedBubble(null);
      setSelectedBackground(null);
      setSelectedEffect(null);
      handleToneSelect(null);
      if (onPanelSelect) onPanelSelect(panel);
      if (onCharacterSelect) onCharacterSelect(null);
      if (onPanelEditModeToggle) onPanelEditModeToggle(true);
      // コンソールログは無効化
    },

    onSplitPanel: (panel: Panel, direction: 'horizontal' | 'vertical') => {
      if (onPanelSplit) {
        onPanelSplit(panel.id, direction);
      }
    },

    onSelectElement: (type: 'character' | 'bubble' | 'panel' | 'background' | 'effect' | 'tone', element: Character | SpeechBubble | Panel | BackgroundElement | EffectElement | ToneElement) => {
      if (type === 'character') {
        actions.setSelectedCharacter(element as Character);
        actions.setSelectedBubble(null);
        actions.setSelectedPanel(null);
        setSelectedBackground(null);
        setSelectedEffect(null);
        handleToneSelect(null);
        if (onCharacterSelect) onCharacterSelect(element as Character);
        if (onPanelSelect) onPanelSelect(null);
      } else if (type === 'bubble') {
        actions.setSelectedBubble(element as SpeechBubble);
        actions.setSelectedCharacter(null);
        actions.setSelectedPanel(null);
        setSelectedBackground(null);
        setSelectedEffect(null);
        handleToneSelect(null);
        if (onCharacterSelect) onCharacterSelect(null);
        if (onPanelSelect) onPanelSelect(null);
      } else if (type === 'panel') {
        actions.setSelectedPanel(element as Panel);
        actions.setSelectedCharacter(null);
        actions.setSelectedBubble(null);
        setSelectedBackground(null);
        setSelectedEffect(null);
        handleToneSelect(null);
        if (onPanelSelect) onPanelSelect(element as Panel);
        if (onCharacterSelect) onCharacterSelect(null);
      } else if (type === 'background') {
        setSelectedBackground(element as BackgroundElement);
        actions.setSelectedCharacter(null);
        actions.setSelectedBubble(null);
        actions.setSelectedPanel(null);
        setSelectedEffect(null);
        handleToneSelect(null);
        if (onCharacterSelect) onCharacterSelect(null);
        if (onPanelSelect) onPanelSelect(null);
      } else if (type === 'effect') {
        setSelectedEffect(element as EffectElement);
        actions.setSelectedCharacter(null);
        actions.setSelectedBubble(null);
        actions.setSelectedPanel(null);
        setSelectedBackground(null);
        handleToneSelect(null);
        if (onCharacterSelect) onCharacterSelect(null);
        if (onPanelSelect) onPanelSelect(null);
      } else if (type === 'tone') {
        // トーン選択
        handleToneSelect(element as ToneElement);
        actions.setSelectedCharacter(null);
        actions.setSelectedBubble(null);
        actions.setSelectedPanel(null);
        setSelectedBackground(null);
        setSelectedEffect(null);
        if (onCharacterSelect) onCharacterSelect(null);
        if (onPanelSelect) onPanelSelect(null);
      }
    },

    onOpenCharacterPanel: (character: Character) => {
      if (onCharacterRightClick) {
        onCharacterRightClick(character);
      }
    },

    onDuplicateBackground: (background: BackgroundElement) => {
      const newBackground = {
        ...background,
        id: `bg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        x: Math.min(background.x + 0.1, 0.9),
        y: Math.min(background.y + 0.1, 0.9),
      };
      setBackgrounds([...backgrounds, newBackground]);
      setSelectedBackground(newBackground);
    },

    onDuplicateEffect: (effect: EffectElement) => {
      const newEffect = {
        ...effect,
        id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        x: Math.min(effect.x + 0.1, 0.9),
        y: Math.min(effect.y + 0.1, 0.9),
      };
      setEffects([...effects, newEffect]);
      setSelectedEffect(newEffect);
    },

    // トーン複製
    onDuplicateTone: (tone: ToneElement) => {
      const newTone = {
        ...tone,
        id: `tone_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        x: Math.min(tone.x + 0.1, 0.9),
        y: Math.min(tone.y + 0.1, 0.9),
      };
      setTones([...tones, newTone]);
      handleToneSelect(newTone);
    },

    onOpenBackgroundPanel: (background: BackgroundElement) => {
      // コンソールログは無効化
    },

    onOpenEffectPanel: (effect: EffectElement) => {
      // コンソールログは無効化
    },

    // トーン設定パネル
    onOpenTonePanel: (tone: ToneElement) => {
      if (onTonePanelToggle) {
        onTonePanelToggle();
      }
      // コンソールログは無効化
    },

    onDeselectAll: () => {
      actions.setSelectedCharacter(null);
      actions.setSelectedBubble(null);
      actions.setSelectedPanel(null);
      setSelectedBackground(null);
      setSelectedEffect(null);
      handleToneSelect(null);
      if (onCharacterSelect) onCharacterSelect(null);
      if (onPanelSelect) onPanelSelect(null);
    },
  };

  // マウスイベントhook使用（トーン対応版）
  const mouseEventHandlers = useMouseEvents({
    canvasRef,
    state,
    actions,
    panels,
    setPanels,
    characters,
    setCharacters,
    speechBubbles,
    setSpeechBubbles,
    backgrounds,
    setBackgrounds,
    selectedBackground,
    setSelectedBackground,
    effects,
    setEffects,
    selectedEffect,
    setSelectedEffect,
    // トーン関連プロパティ
    tones,
    setTones,
    selectedTone,
    setSelectedTone: handleToneSelect,
    isPanelEditMode,
    snapSettings,
    contextMenu,
    setContextMenu,
    contextMenuActions,
    onPanelSelect,
    onCharacterSelect,
    onPanelSplit,
  });

  // キーボードイベント処理（トーンパネル表示制御追加）
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl+T でトーンパネル開閉
      if (e.ctrlKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        if (onTonePanelToggle) {
          onTonePanelToggle();
        }
        return;
      }

      // Ctrl+C, Ctrl+V処理
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'c':
            // コピー処理（優先順位順）
            if (state.selectedBubble) {
              contextMenuActions.onCopyToClipboard('bubble', state.selectedBubble);
              e.preventDefault();
            } else if (state.selectedCharacter) {
              contextMenuActions.onCopyToClipboard('character', state.selectedCharacter);
              e.preventDefault();
            } else if (selectedTone) {
              // トーンコピー
              contextMenuActions.onCopyToClipboard('tone', selectedTone);
              e.preventDefault();
            } else if (selectedEffect) {
              contextMenuActions.onCopyToClipboard('effect', selectedEffect);
              e.preventDefault();
            } else if (selectedBackground) {
              contextMenuActions.onCopyToClipboard('background', selectedBackground);
              e.preventDefault();
            } else if (state.selectedPanel) {
              contextMenuActions.onCopyToClipboard('panel', state.selectedPanel);
              e.preventDefault();
            }
            break;
          case 'v':
            if (clipboard) {
              contextMenuActions.onPasteFromClipboard();
              e.preventDefault();
            }
            break;
        }
      }
      
      // Delete/Backspace処理（トーン対応・優先順位順）
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedBubble) {
          contextMenuActions.onDeleteElement('bubble', state.selectedBubble);
          // コンソールログは無効化
          e.preventDefault();
        } else if (state.selectedCharacter) {
          contextMenuActions.onDeleteElement('character', state.selectedCharacter);
          // コンソールログは無効化
          e.preventDefault();
        } else if (selectedTone) {
          // トーン削除
          contextMenuActions.onDeleteElement('tone', selectedTone);
          // コンソールログは無効化
          e.preventDefault();
        } else if (selectedEffect) {
          contextMenuActions.onDeleteElement('effect', selectedEffect);
          // コンソールログは無効化
          e.preventDefault();
        } else if (selectedBackground) {
          contextMenuActions.onDeleteElement('background', selectedBackground);
          // コンソールログは無効化
          e.preventDefault();
        } else if (state.selectedPanel && isPanelEditMode) {
          contextMenuActions.onDeletePanel(state.selectedPanel);
          // コンソールログは無効化
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    state.selectedBubble,
    state.selectedCharacter, 
    state.selectedPanel,
    selectedBackground,
    selectedEffect,
    selectedTone, // トーン選択状態
    clipboard,
    contextMenuActions,
    onTonePanelToggle, // トーンパネル開閉
    isPanelEditMode
  ]);

  // Canvas描画hook使用
  const { drawCanvas } = useCanvasDrawing({
    canvasRef,
    state,
    panels,
    characters,
    speechBubbles,
    backgrounds,
    selectedBackground,
    effects,
    selectedEffect,
    tones,
    selectedTone,
    isPanelEditMode,
    snapSettings,
    getCharacterDisplayName, // 🔧 この行が重要！確実に渡す
    swapPanel1, // 🆕 入れ替え選択1
    swapPanel2, // 🆕 入れ替え選択2
  });

  // 要素追加・編集hook使用
  const { handleEditComplete, handleEditCancel } = useElementActions({
    state,
    actions,
    selectedTemplate,
    panels,
    characters,
    setCharacters,
    speechBubbles,
    setSpeechBubbles,
    onCharacterAdd,
    onBubbleAdd,
    onCharacterSelect,
  });

  // テンプレート変更時の処理（App.tsxで処理されるため、ここでは選択状態のみリセット）
  useEffect(() => {
    if (selectedTemplate) {
      // コンソールログは無効化
      
      // 選択状態をリセット
      actions.setSelectedPanel(null);
      actions.setSelectedCharacter(null);
      actions.setSelectedBubble(null);
      setSelectedBackground(null);
      setSelectedEffect(null);
      handleToneSelect(null);
      if (onPanelSelect) onPanelSelect(null);
      if (onCharacterSelect) onCharacterSelect(null);
    }
  }, [selectedTemplate]);

  // ContextMenu外クリック処理
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
    <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "0px", minWidth: "fit-content" }}>
      {/* Canvas要素 */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onClick={mouseEventHandlers.handleCanvasClick}
        onContextMenu={mouseEventHandlers.handleCanvasContextMenu}
        onDoubleClick={mouseEventHandlers.handleCanvasDoubleClick}
        onMouseDown={mouseEventHandlers.handleCanvasMouseDown}
        onMouseMove={mouseEventHandlers.handleCanvasMouseMove}
        onMouseUp={mouseEventHandlers.handleCanvasMouseUp}
        onMouseLeave={mouseEventHandlers.handleCanvasMouseUp}
        style={{
          border: "2px solid #ddd",
          background: "white",
          cursor: state.isPanelResizing || state.isDragging || state.isBubbleResizing || state.isCharacterResizing || isBackgroundDragging || isBackgroundResizing || isEffectDragging || isEffectResizing || isToneDragging || isToneResizing ? "grabbing" : "pointer",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          borderRadius: "8px",
          marginTop: "0px",
        }}
      />

      {/* 編集モーダル */}
      <EditBubbleModal
        editingBubble={state.editingBubble}
        editText={state.editText}
        setEditText={actions.setEditText}
        onComplete={handleEditComplete}
        onCancel={handleEditCancel}
        onUpdateBubble={(updatedBubble) => {
          const updatedBubbles = speechBubbles.map(b =>
            b.id === updatedBubble.id ? updatedBubble : b
          );
          setSpeechBubbles(updatedBubbles);
          actions.setEditingBubble(updatedBubble);
        }}
      />

      {/* 右クリックメニュー */}
      {ContextMenuHandler.renderContextMenu(
        contextMenu,
        clipboard,
        isPanelEditMode,
        (action: string) => {
          ContextMenuHandler.handleAction(action, contextMenu, contextMenuActions);
          setContextMenu({ ...contextMenu, visible: false });
        },
        (e: React.MouseEvent) => e.stopPropagation()
      )}

      {/* 選択状態表示を削除 */}
    
        {/* キャラクター選択状態表示を削除 */}
      
      {/* 吹き出し選択状態表示を削除 */}

      {/* 背景選択状態表示 */}
      {selectedBackground && (
        <div
          style={{
            position: "absolute",
            top: "100px",
            right: "10px",
            background: isBackgroundResizing 
              ? "rgba(156, 39, 176, 0.9)"
              : isBackgroundDragging 
              ? "rgba(103, 58, 183, 0.9)"
              : "rgba(156, 39, 176, 0.9)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          {isBackgroundResizing ? "背景リサイズ中" : 
          isBackgroundDragging ? "背景移動中" : 
          `背景選択中`}
          <br/>
          // ✅ 修正後
            <small>
              {getCanvasBackgroundDisplayName(selectedBackground, backgrounds)} | 透明度: {Math.round(selectedBackground.opacity * 100)}%
            </small>
        </div>
      )}

      {/* 効果線選択状態表示 */}
      {/* 効果線選択状態表示を削除 */}

      {/* 🔧 トーン選択状態表示（型安全版） */}
      {selectedTone && (
        <div
          style={{
            position: "absolute",
            top: "160px",
            right: "10px",
            background: isToneResizing 
              ? "rgba(121, 85, 72, 0.9)"
              : isToneDragging 
              ? "rgba(141, 110, 99, 0.9)"
              : "rgba(121, 85, 72, 0.9)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          {isToneResizing ? "トーンリサイズ中" : 
          isToneDragging ? "トーン移動中" : 
          `トーン選択中`}
          <br/>
          <small>
            {selectedTone.type} | 密度: {selectedTone.density} | 透明度: {Math.round(selectedTone.opacity * 100)}%
          </small>
        </div>
      )}

      {/* トーンパネル表示状態は無効化 */}

      {/* クリップボード状態表示は無効化 */}

      {/* スナップ設定状態表示 - 表示を無効化
      {snapSettings.enabled && (
        ...
      )}
      */}

      {/* デバッグ情報は無効化 */}
    </div>
  );
});

CanvasComponent.displayName = 'CanvasComponent';
export default CanvasComponent;