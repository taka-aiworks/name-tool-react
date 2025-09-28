// src/components/CanvasComponent/hooks/useKeyboardEvents.ts
import { useEffect } from 'react';
import { Panel, Character, SpeechBubble } from '../../../types';
import { CanvasState, CanvasStateActions } from './useCanvasState';
import { ClipboardState, ContextMenuActions } from '../../CanvasArea/ContextMenuHandler';

export interface KeyboardEventHookProps {
  state: CanvasState;
  actions: CanvasStateActions;
  clipboard: ClipboardState | null;
  setClipboard: (clipboard: ClipboardState | null) => void;
  contextMenuActions: ContextMenuActions;
  onPanelSelect?: (panel: Panel | null) => void;
  onCharacterSelect?: (character: Character | null) => void;
}

/**
 * キーボードイベント処理を管理するカスタムhook
 * ショートカットキーの処理を一元化
 */
export const useKeyboardEvents = ({
  state,
  actions,
  clipboard,
  setClipboard,
  contextMenuActions,
  onPanelSelect,
  onCharacterSelect,
}: KeyboardEventHookProps) => {

  /**
   * キーボードイベントハンドラー
   */
  const handleKeyDown = (e: KeyboardEvent) => {
    // コピー操作 (Ctrl+C)
    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      if (state.selectedPanel) {
        contextMenuActions.onCopyToClipboard('panel', state.selectedPanel);
        console.log("📋 パネルをクリップボードにコピー");
      } else if (state.selectedCharacter) {
        contextMenuActions.onCopyToClipboard('character', state.selectedCharacter);
        console.log("📋 キャラクターをクリップボードにコピー");
      } else if (state.selectedBubble) {
        contextMenuActions.onCopyToClipboard('bubble', state.selectedBubble);
        console.log("📋 吹き出しをクリップボードにコピー");
      }
    }
    
    // ペースト操作 (Ctrl+V)
    if (e.ctrlKey && e.key === 'v') {
      e.preventDefault();
      contextMenuActions.onPasteFromClipboard();
      console.log("📌 クリップボードからペースト");
    }
    
    // 削除操作 (Delete / Backspace) - 吹き出し編集中は完全無効化
    if ((e.key === 'Delete' || e.key === 'Backspace') && !state.editingBubble) {
      e.preventDefault();
      if (state.selectedPanel) {
        contextMenuActions.onDeletePanel(state.selectedPanel);
        // コンソールログは無効化
      } else if (state.selectedCharacter) {
        contextMenuActions.onDeleteElement('character', state.selectedCharacter);
        // コンソールログは無効化
      } else if (state.selectedBubble) {
        contextMenuActions.onDeleteElement('bubble', state.selectedBubble);
        // コンソールログは無効化
      }
    }

    // 選択解除・クリップボードクリア (Escape)
    if (e.key === 'Escape') {
      e.preventDefault();
      actions.setSelectedPanel(null);
      actions.setSelectedCharacter(null);
      actions.setSelectedBubble(null);
      setClipboard(null);
      if (onPanelSelect) onPanelSelect(null);
      if (onCharacterSelect) onCharacterSelect(null);
      console.log("❌ すべての選択を解除・クリップボードクリア");
    }

    // 全選択 (Ctrl+A) - 将来的な拡張用
    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
      // 全選択機能は将来実装予定
      console.log("🔄 全選択（未実装）");
    }

    // アンドゥ (Ctrl+Z) - 将来的な拡張用
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      // アンドゥ機能は将来実装予定
      console.log("↶ アンドゥ（未実装）");
    }

    // リドゥ (Ctrl+Shift+Z または Ctrl+Y) - 将来的な拡張用
    if ((e.ctrlKey && e.shiftKey && e.key === 'Z') || (e.ctrlKey && e.key === 'y')) {
      e.preventDefault();
      // リドゥ機能は将来実装予定
      console.log("↷ リドゥ（未実装）");
    }

    // デバッグ用：現在の状態を出力 (Ctrl+Shift+D)
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      console.log("🔍 デバッグ情報:", {
        selectedPanel: state.selectedPanel?.id,
        selectedCharacter: state.selectedCharacter?.name,
        selectedBubble: state.selectedBubble?.text,
        isDragging: state.isDragging,
        isResizing: state.isBubbleResizing || state.isCharacterResizing,
        clipboard: clipboard?.type,
      });
    }
  };

  /**
   * useEffectでイベントリスナーを登録・解除
   */
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    state.selectedPanel, 
    state.selectedCharacter, 
    state.selectedBubble, 
    state.editingBubble, // 🆕 吹き出し編集状態を監視
    clipboard,
    // その他の依存関係は関数内で参照されているため含める
  ]);

  // このhookはイベントハンドラーのみ提供し、戻り値は不要
  return null;
};