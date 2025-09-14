// src/components/CanvasArea/ContextMenuHandler.ts - トーン対応版
import React from "react";
import { Panel, Character, SpeechBubble, BackgroundElement, EffectElement, ToneElement } from "../../types";

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  target: 'character' | 'bubble' | 'panel' | 'background' | 'effect' | 'tone' | null; // 🆕 tone追加
  targetElement: Character | SpeechBubble | Panel | BackgroundElement | EffectElement | ToneElement | null; // 🆕 ToneElement追加
}

export interface ClipboardState {
  type: 'panel' | 'character' | 'bubble' | 'background' | 'effect' | 'tone'; // 🆕 tone追加
  data: Panel | Character | SpeechBubble | BackgroundElement | EffectElement | ToneElement; // 🆕 ToneElement追加
}

export interface ContextMenuActions {
  onDuplicateCharacter: (character: Character) => void;
  onDuplicatePanel: (panel: Panel) => void;
  onDuplicateBackground?: (background: BackgroundElement) => void;
  onDuplicateEffect?: (effect: EffectElement) => void;
  onDuplicateTone?: (tone: ToneElement) => void; // 🆕 トーン複製アクション追加
  onCopyToClipboard: (type: 'panel' | 'character' | 'bubble' | 'background' | 'effect' | 'tone', element: Panel | Character | SpeechBubble | BackgroundElement | EffectElement | ToneElement) => void;
  onPasteFromClipboard: () => void;
  onDeleteElement: (type: 'character' | 'bubble' | 'background' | 'effect' | 'tone', element: Character | SpeechBubble | BackgroundElement | EffectElement | ToneElement) => void;
  onDeletePanel: (panel: Panel) => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onEditPanel: (panel: Panel) => void;
  onSplitPanel: (panel: Panel, direction: 'horizontal' | 'vertical') => void;
  onSelectElement: (type: 'character' | 'bubble' | 'panel' | 'background' | 'effect' | 'tone', element: Character | SpeechBubble | Panel | BackgroundElement | EffectElement | ToneElement) => void;
  onOpenCharacterPanel: (character: Character) => void;
  onOpenBackgroundPanel?: (background: BackgroundElement) => void;
  onOpenEffectPanel?: (effect: EffectElement) => void;
  onOpenTonePanel?: (tone: ToneElement) => void; // 🆕 トーン設定パネル
  onDeselectAll: () => void;
}

export class ContextMenuHandler {
  /**
   * 右クリックメニューのアクション処理（トーン対応版）
   */
  static handleAction(
    action: string,
    contextMenu: ContextMenuState,
    actions: ContextMenuActions
  ): void {
    console.log("🔍 右クリックアクション実行:", action);
    
    const { target, targetElement } = contextMenu;
    
    switch (action) {
      case 'duplicateCharacter':
        if (target === 'character' && targetElement) {
          actions.onDuplicateCharacter(targetElement as Character);
        }
        break;

      case 'duplicatePanel':
        if (target === 'panel' && targetElement) {
          actions.onDuplicatePanel(targetElement as Panel);
        }
        break;

      case 'duplicateBackground':
        if (target === 'background' && targetElement && actions.onDuplicateBackground) {
          actions.onDuplicateBackground(targetElement as BackgroundElement);
        }
        break;

      case 'duplicateEffect':
        if (target === 'effect' && targetElement && actions.onDuplicateEffect) {
          actions.onDuplicateEffect(targetElement as EffectElement);
        }
        break;

      // 🆕 トーン複製
      case 'duplicateTone':
        if (target === 'tone' && targetElement && actions.onDuplicateTone) {
          actions.onDuplicateTone(targetElement as ToneElement);
        }
        break;

      case 'copy':
        if (target === 'panel' && targetElement) {
          actions.onCopyToClipboard('panel', targetElement as Panel);
        } else if (target === 'character' && targetElement) {
          actions.onCopyToClipboard('character', targetElement as Character);
        } else if (target === 'bubble' && targetElement) {
          actions.onCopyToClipboard('bubble', targetElement as SpeechBubble);
        } else if (target === 'background' && targetElement) {
          actions.onCopyToClipboard('background', targetElement as BackgroundElement);
        } else if (target === 'effect' && targetElement) {
          actions.onCopyToClipboard('effect', targetElement as EffectElement);
        } else if (target === 'tone' && targetElement) {
          // 🆕 トーンコピー
          actions.onCopyToClipboard('tone', targetElement as ToneElement);
        }
        break;

      case 'paste':
        actions.onPasteFromClipboard();
        break;

      case 'flipHorizontal':
        actions.onFlipHorizontal();
        break;

      case 'flipVertical':
        actions.onFlipVertical();
        break;

      case 'editPanel':
        if (target === 'panel' && targetElement) {
          actions.onEditPanel(targetElement as Panel);
        }
        break;

      case 'delete':
        if (target === 'panel' && targetElement) {
          actions.onDeletePanel(targetElement as Panel);
        } else if (target && targetElement) {
          // 🆕 トーン削除対応
          actions.onDeleteElement(target as 'character' | 'bubble' | 'background' | 'effect' | 'tone', targetElement as Character | SpeechBubble | BackgroundElement | EffectElement | ToneElement);
        }
        break;

      case 'select':
        if (target === 'character' && targetElement) {
          actions.onSelectElement('character', targetElement as Character);
        } else if (target === 'bubble' && targetElement) {
          actions.onSelectElement('bubble', targetElement as SpeechBubble);
        } else if (target === 'panel' && targetElement) {
          actions.onSelectElement('panel', targetElement as Panel);
        } else if (target === 'background' && targetElement) {
          actions.onSelectElement('background', targetElement as BackgroundElement);
        } else if (target === 'effect' && targetElement) {
          actions.onSelectElement('effect', targetElement as EffectElement);
        } else if (target === 'tone' && targetElement) {
          // 🆕 トーン選択
          actions.onSelectElement('tone', targetElement as ToneElement);
        }
        break;

      case 'characterPanel':
        if (target === 'character' && targetElement) {
          actions.onOpenCharacterPanel(targetElement as Character);
        }
        break;

      case 'backgroundPanel':
        if (target === 'background' && targetElement && actions.onOpenBackgroundPanel) {
          actions.onOpenBackgroundPanel(targetElement as BackgroundElement);
        }
        break;

      case 'effectPanel':
        if (target === 'effect' && targetElement && actions.onOpenEffectPanel) {
          actions.onOpenEffectPanel(targetElement as EffectElement);
        }
        break;

      // 🆕 トーン設定パネル
      case 'tonePanel':
        if (target === 'tone' && targetElement && actions.onOpenTonePanel) {
          actions.onOpenTonePanel(targetElement as ToneElement);
        }
        break;

      case 'splitHorizontal':
        if (target === 'panel' && targetElement) {
          actions.onSplitPanel(targetElement as Panel, 'horizontal');
        }
        break;

      case 'splitVertical':
        if (target === 'panel' && targetElement) {
          actions.onSplitPanel(targetElement as Panel, 'vertical');
        }
        break;

      case 'deselect':
        actions.onDeselectAll();
        break;
    }
  }

  /**
   * 右クリックメニューコンポーネントの生成（トーン対応版）
   */
  static renderContextMenu(
    contextMenu: ContextMenuState,
    clipboard: ClipboardState | null,
    isPanelEditMode: boolean,
    onAction: (action: string) => void,
    onStopPropagation: (e: React.MouseEvent) => void
  ): React.ReactElement | null {
    if (!contextMenu.visible) return null;

    const isDarkMode = document.documentElement.getAttribute("data-theme") === "dark";
    
    const menuStyle: React.CSSProperties = {
      position: "fixed",
      top: contextMenu.y,
      left: contextMenu.x,
      background: isDarkMode ? "#2d2d2d" : "white",
      border: `1px solid ${isDarkMode ? "#555555" : "#ccc"}`,
      borderRadius: "4px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      zIndex: 1000,
      minWidth: "120px",
      color: isDarkMode ? "#ffffff" : "#333333",
    };

    const itemStyle: React.CSSProperties = {
      padding: "8px 12px",
      cursor: "pointer",
      borderBottom: `1px solid ${isDarkMode ? "#555555" : "#eee"}`,
      transition: "background-color 0.2s",
    };

    const dangerItemStyle: React.CSSProperties = {
      ...itemStyle,
      color: "#ff4444",
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      target.style.backgroundColor = isDarkMode ? "#3d3d3d" : "#f5f5f5";
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      target.style.backgroundColor = "transparent";
    };

    return React.createElement(
      'div',
      { 
        style: menuStyle, 
        onClick: onStopPropagation 
      },
      contextMenu.target === 'character' && [
        React.createElement(
          'div',
          {
            key: 'characterPanel',
            style: itemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('characterPanel')
          },
          '⚙️ 詳細設定'
        ),
        React.createElement(
          'div',
          {
            key: 'duplicateCharacter',
            style: itemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('duplicateCharacter')
          },
          '👥 キャラクター複製'
        ),
        React.createElement(
          'div',
          {
            key: 'copyCharacter',
            style: itemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('copy')
          },
          '📋 コピー (Ctrl+C)'
        ),
        React.createElement(
          'div',
          {
            key: 'deleteCharacter',
            style: dangerItemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('delete')
          },
          '🗑️ 削除'
        )
      ],
      
      contextMenu.target === 'bubble' && [
        React.createElement(
          'div',
          {
            key: 'selectBubble',
            style: itemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('select')
          },
          '👆 選択'
        ),
        React.createElement(
          'div',
          {
            key: 'copyBubble',
            style: itemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('copy')
          },
          '📋 コピー (Ctrl+C)'
        ),
        React.createElement(
          'div',
          {
            key: 'deleteBubble',
            style: dangerItemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('delete')
          },
          '🗑️ 削除'
        )
      ],

      contextMenu.target === 'background' && [
        React.createElement(
          'div',
          {
            key: 'backgroundPanel',
            style: itemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('backgroundPanel')
          },
          '🎨 背景設定'
        ),
        React.createElement(
          'div',
          {
            key: 'duplicateBackground',
            style: itemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('duplicateBackground')
          },
          '🎭 背景複製'
        ),
        React.createElement(
          'div',
          {
            key: 'copyBackground',
            style: itemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('copy')
          },
          '📋 コピー (Ctrl+C)'
        ),
        React.createElement(
          'div',
          {
            key: 'deleteBackground',
            style: dangerItemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('delete')
          },
          '🗑️ 削除'
        )
      ],

      contextMenu.target === 'effect' && [
        React.createElement(
          'div',
          {
            key: 'effectPanel',
            style: itemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('effectPanel')
          },
          '⚡ 効果線設定'
        ),
        React.createElement(
          'div',
          {
            key: 'duplicateEffect',
            style: itemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('duplicateEffect')
          },
          '⚡ 効果線複製'
        ),
        React.createElement(
          'div',
          {
            key: 'copyEffect',
            style: itemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('copy')
          },
          '📋 コピー (Ctrl+C)'
        ),
        React.createElement(
          'div',
          {
            key: 'deleteEffect',
            style: dangerItemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('delete')
          },
          '🗑️ 削除'
        )
      ],

      // 🆕 トーン右クリックメニュー
      contextMenu.target === 'tone' && [
        React.createElement(
          'div',
          {
            key: 'tonePanel',
            style: itemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('tonePanel')
          },
          '🎯 トーン設定'
        ),
        React.createElement(
          'div',
          {
            key: 'duplicateTone',
            style: itemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('duplicateTone')
          },
          '🎯 トーン複製'
        ),
        React.createElement(
          'div',
          {
            key: 'copyTone',
            style: itemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('copy')
          },
          '📋 コピー (Ctrl+C)'
        ),
        React.createElement(
          'div',
          {
            key: 'deleteTone',
            style: dangerItemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('delete')
          },
          '🗑️ 削除'
        )
      ],
      
      contextMenu.target === 'panel' && [
        !isPanelEditMode && React.createElement(
          'div',
          {
            key: 'editPanel',
            style: itemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('editPanel')
          },
          '🔧 コマ編集'
        ),
        React.createElement(
          'div',
          {
            key: 'duplicatePanel',
            style: itemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('duplicatePanel')
          },
          '📋 コマ複製'
        ),
        React.createElement(
          'div',
          {
            key: 'copyPanel',
            style: itemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('copy')
          },
          '📋 コピー (Ctrl+C)'
        ),
        isPanelEditMode && React.createElement(
          'div',
          {
            key: 'flipHorizontal',
            style: itemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('flipHorizontal')
          },
          '↔️ 水平反転'
        ),
        isPanelEditMode && React.createElement(
          'div',
          {
            key: 'flipVertical',
            style: itemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('flipVertical')
          },
          '↕️ 垂直反転'
        ),
        React.createElement(
          'div',
          {
            key: 'splitHorizontal',
            style: itemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('splitHorizontal')
          },
          '✂️ 水平分割'
        ),
        React.createElement(
          'div',
          {
            key: 'splitVertical',
            style: itemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('splitVertical')
          },
          '✂️ 垂直分割'
        ),
        React.createElement(
          'div',
          {
            key: 'deletePanel',
            style: dangerItemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('delete')
          },
          '🗑️ コマ削除'
        )
      ].filter(Boolean),
      
      !contextMenu.target && [
        clipboard && React.createElement(
          'div',
          {
            key: 'paste',
            style: itemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('paste')
          },
          `📌 ペースト (Ctrl+V) - ${clipboard.type}`
        ),
        React.createElement(
          'div',
          {
            key: 'deselect',
            style: itemStyle,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: () => onAction('deselect')
          },
          '❌ 選択解除'
        )
      ].filter(Boolean)
    );
  }

  /**
   * クリップボード操作（トーン対応版）
   */
  static copyToClipboard(
    type: 'panel' | 'character' | 'bubble' | 'background' | 'effect' | 'tone', // 🆕 tone追加
    element: Panel | Character | SpeechBubble | BackgroundElement | EffectElement | ToneElement // 🆕 ToneElement追加
  ): ClipboardState {
    console.log(`📋 ${type}をクリップボードにコピー:`, element);
    return { type, data: element };
  }

  /**
   * キャラクター複製
   */
  static duplicateCharacter(
    originalCharacter: Character,
    canvasWidth: number = 600,
    canvasHeight: number = 800
  ): Character {
    console.log("🔍 キャラクター複製開始:", originalCharacter.name);
    
    const newCharacter: Character = {
      ...originalCharacter,
      id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: `${originalCharacter.name}(コピー)`,
      x: originalCharacter.x + 50,
      y: originalCharacter.y + 20,
    };
    
    // キャンバス範囲チェック
    if (newCharacter.x + 60 > canvasWidth) {
      newCharacter.x = originalCharacter.x - 50;
      if (newCharacter.x < 0) {
        newCharacter.x = 20;
        newCharacter.y = originalCharacter.y + 60;
      }
    }
    if (newCharacter.y + 60 > canvasHeight) {
      newCharacter.y = Math.max(20, originalCharacter.y - 60);
    }
    
    console.log(`✅ キャラクター複製完了: ${originalCharacter.name} → ${newCharacter.name}`);
    return newCharacter;
  }

  /**
   * 背景複製
   */
  static duplicateBackground(
    originalBackground: BackgroundElement,
    canvasWidth: number = 600,
    canvasHeight: number = 800
  ): BackgroundElement {
    console.log("🎨 背景複製開始:", originalBackground.type);
    
    const newBackground: BackgroundElement = {
      ...originalBackground,
      id: `bg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      x: Math.min(originalBackground.x + 0.1, 0.9),
      y: Math.min(originalBackground.y + 0.1, 0.9),
    };
    
    console.log(`✅ 背景複製完了: ${originalBackground.type} → ${newBackground.id}`);
    return newBackground;
  }

  /**
   * 効果線複製
   */
  static duplicateEffect(
    originalEffect: EffectElement,
    canvasWidth: number = 600,
    canvasHeight: number = 800
  ): EffectElement {
    console.log("⚡ 効果線複製開始:", originalEffect.type);
    
    const newEffect: EffectElement = {
      ...originalEffect,
      id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      x: Math.min(originalEffect.x + 0.1, 0.9),
      y: Math.min(originalEffect.y + 0.1, 0.9),
    };
    
    console.log(`✅ 効果線複製完了: ${originalEffect.type} → ${newEffect.id}`);
    return newEffect;
  }

  /**
   * 🆕 トーン複製
   */
  static duplicateTone(
    originalTone: ToneElement,
    canvasWidth: number = 600,
    canvasHeight: number = 800
  ): ToneElement {
    console.log("🎯 トーン複製開始:", originalTone.type);
    
    const newTone: ToneElement = {
      ...originalTone,
      id: `tone_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      x: Math.min(originalTone.x + 0.1, 0.9),
      y: Math.min(originalTone.y + 0.1, 0.9),
    };
    
    console.log(`✅ トーン複製完了: ${originalTone.type} → ${newTone.id}`);
    return newTone;
  }

  /**
   * 反転処理（トーン対応版）
   */
  static flipElements(
    direction: 'horizontal' | 'vertical',
    panels: Panel[],
    characters: Character[],
    speechBubbles: SpeechBubble[],
    backgrounds: BackgroundElement[],
    effects: EffectElement[],
    tones: ToneElement[], // 🆕 tones追加
    canvasWidth: number = 600,
    canvasHeight: number = 800
  ): {
    panels: Panel[];
    characters: Character[];
    speechBubbles: SpeechBubble[];
    backgrounds: BackgroundElement[];
    effects: EffectElement[];
    tones: ToneElement[]; // 🆕 tones追加
  } {
    if (direction === 'horizontal') {
      const flippedPanels = panels.map(panel => ({
        ...panel,
        x: canvasWidth - panel.x - panel.width
      }));
      const flippedCharacters = characters.map(char => ({
        ...char,
        x: char.isGlobalPosition ? canvasWidth - char.x : char.x
      }));
      const flippedBubbles = speechBubbles.map(bubble => ({
        ...bubble,
        x: bubble.isGlobalPosition ? canvasWidth - bubble.x : bubble.x
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
      // 🆕 トーンも反転
      const flippedTones = tones.map(tone => ({
        ...tone,
        x: 1 - tone.x - tone.width,
        rotation: tone.rotation !== undefined ? 360 - tone.rotation : tone.rotation
      }));
      
      console.log("↔️ 水平反転完了（トーン含む）");
      return {
        panels: flippedPanels,
        characters: flippedCharacters,
        speechBubbles: flippedBubbles,
        backgrounds: flippedBackgrounds,
        effects: flippedEffects,
        tones: flippedTones
      };
    } else {
      const flippedPanels = panels.map(panel => ({
        ...panel,
        y: canvasHeight - panel.y - panel.height
      }));
      const flippedCharacters = characters.map(char => ({
        ...char,
        y: char.isGlobalPosition ? canvasHeight - char.y : char.y
      }));
      const flippedBubbles = speechBubbles.map(bubble => ({
        ...bubble,
        y: bubble.isGlobalPosition ? canvasHeight - bubble.y : bubble.y
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
      // 🆕 トーンも反転
      const flippedTones = tones.map(tone => ({
        ...tone,
        y: 1 - tone.y - tone.height,
        rotation: tone.rotation !== undefined ? -tone.rotation : tone.rotation
      }));
      
      console.log("↕️ 垂直反転完了（トーン含む）");
      return {
        panels: flippedPanels,
        characters: flippedCharacters,
        speechBubbles: flippedBubbles,
        backgrounds: flippedBackgrounds,
        effects: flippedEffects,
        tones: flippedTones
      };
    }
  }

  /**
   * 吹き出し複製
   */
  static duplicateBubble(originalBubble: SpeechBubble): SpeechBubble {
    return {
      ...originalBubble,
      id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      text: `${originalBubble.text}(コピー)`,
      x: originalBubble.x + 30,
      y: originalBubble.y + 30,
    };
  }
}