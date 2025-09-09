// src/components/CanvasArea/ContextMenuHandler.ts
import React from "react";
import { Panel, Character, SpeechBubble } from "../../types";

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  target: 'character' | 'bubble' | 'panel' | null;
  targetElement: Character | SpeechBubble | Panel | null;
}

export interface ClipboardState {
  type: 'panel' | 'character' | 'bubble';
  data: Panel | Character | SpeechBubble;
}

export interface ContextMenuActions {
  onDuplicateCharacter: (character: Character) => void;
  onDuplicatePanel: (panel: Panel) => void;
  onCopyToClipboard: (type: 'panel' | 'character' | 'bubble', element: Panel | Character | SpeechBubble) => void;
  onPasteFromClipboard: () => void;
  onDeleteElement: (type: 'character' | 'bubble', element: Character | SpeechBubble) => void;
  onDeletePanel: (panel: Panel) => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onEditPanel: (panel: Panel) => void;
  onSplitPanel: (panel: Panel, direction: 'horizontal' | 'vertical') => void;
  onSelectElement: (type: 'character' | 'bubble' | 'panel', element: Character | SpeechBubble | Panel) => void;
  onOpenCharacterPanel: (character: Character) => void;
  onDeselectAll: () => void;
}

export class ContextMenuHandler {
  /**
   * 右クリックメニューのアクション処理
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

      case 'copy':
        if (target === 'panel' && targetElement) {
          actions.onCopyToClipboard('panel', targetElement as Panel);
        } else if (target === 'character' && targetElement) {
          actions.onCopyToClipboard('character', targetElement as Character);
        } else if (target === 'bubble' && targetElement) {
          actions.onCopyToClipboard('bubble', targetElement as SpeechBubble);
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
          actions.onDeleteElement(target as 'character' | 'bubble', targetElement as Character | SpeechBubble);
        }
        break;

      case 'select':
        if (target === 'character' && targetElement) {
          actions.onSelectElement('character', targetElement as Character);
        } else if (target === 'bubble' && targetElement) {
          actions.onSelectElement('bubble', targetElement as SpeechBubble);
        } else if (target === 'panel' && targetElement) {
          actions.onSelectElement('panel', targetElement as Panel);
        }
        break;

      case 'characterPanel':
        if (target === 'character' && targetElement) {
          actions.onOpenCharacterPanel(targetElement as Character);
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
   * 右クリックメニューコンポーネントの生成
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

    return (
      <div style={menuStyle} onClick={onStopPropagation}>
        {contextMenu.target === 'character' && (
          <>
            <div
              style={itemStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={() => onAction('characterPanel')}
            >
              詳細設定
            </div>
            <div
              style={itemStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={() => onAction('duplicateCharacter')}
            >
              👥 キャラクター複製
            </div>
            <div
              style={itemStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={() => onAction('copy')}
            >
              📋 コピー (Ctrl+C)
            </div>
            <div
              style={dangerItemStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={() => onAction('delete')}
            >
              削除
            </div>
          </>
        )}
        
        {contextMenu.target === 'bubble' && (
          <>
            <div
              style={itemStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={() => onAction('select')}
            >
              選択
            </div>
            <div
              style={itemStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={() => onAction('copy')}
            >
              📋 コピー (Ctrl+C)
            </div>
            <div
              style={dangerItemStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={() => onAction('delete')}
            >
              削除
            </div>
          </>
        )}
        
        {contextMenu.target === 'panel' && (
          <>
            {/* コマ編集（編集モードOFF時のみ表示） */}
            {!isPanelEditMode && (
              <div
                style={itemStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={() => onAction('editPanel')}
              >
                🔧 コマ編集
              </div>
            )}

            {/* コマ複製（常に表示） */}
            <div
              style={itemStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={() => onAction('duplicatePanel')}
            >
              📋 コマ複製
            </div>

            {/* コピー機能 */}
            <div
              style={itemStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={() => onAction('copy')}
            >
              📋 コピー (Ctrl+C)
            </div>

            {/* 反転メニュー（編集モード時のみ表示） */}
            {isPanelEditMode && (
              <>
                <div
                  style={itemStyle}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => onAction('flipHorizontal')}
                >
                  ↔️ 水平反転
                </div>

                <div
                  style={itemStyle}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => onAction('flipVertical')}
                >
                  ↕️ 垂直反転
                </div>
              </>
            )}

            {/* 分割メニュー（常に表示） */}
            <div
              style={itemStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={() => onAction('splitHorizontal')}
            >
              ✂️ 水平分割
            </div>

            <div
              style={itemStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={() => onAction('splitVertical')}
            >
              ✂️ 垂直分割
            </div>

            {/* 削除（常に表示・危険色） */}
            <div
              style={dangerItemStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={() => onAction('delete')}
            >
              🗑️ コマ削除
            </div>
          </>
        )}
        
        {!contextMenu.target && (
          <>
            {/* ペースト機能（クリップボードに何かあるときのみ表示） */}
            {clipboard && (
              <div
                style={itemStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={() => onAction('paste')}
              >
                📌 ペースト (Ctrl+V) - {clipboard.type}
              </div>
            )}
            
            <div
              style={itemStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={() => onAction('deselect')}
            >
              選択解除
            </div>
          </>
        )}
      </div>
    );
  }

  /**
   * クリップボード操作
   */
  static copyToClipboard(
    type: 'panel' | 'character' | 'bubble',
    element: Panel | Character | SpeechBubble
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
   * 反転処理
   */
  static flipElements(
    direction: 'horizontal' | 'vertical',
    panels: Panel[],
    characters: Character[],
    speechBubbles: SpeechBubble[],
    canvasWidth: number = 600,
    canvasHeight: number = 800
  ): {
    panels: Panel[];
    characters: Character[];
    speechBubbles: SpeechBubble[];
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
      
      console.log("↔️ 水平反転完了");
      return {
        panels: flippedPanels,
        characters: flippedCharacters,
        speechBubbles: flippedBubbles
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
      
      console.log("↕️ 垂直反転完了");
      return {
        panels: flippedPanels,
        characters: flippedCharacters,
        speechBubbles: flippedBubbles
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