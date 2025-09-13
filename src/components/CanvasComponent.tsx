// src/components/CanvasComponent.tsx - 動作版（エラー修正）
import React, { useRef, useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { Panel, Character, SpeechBubble, BackgroundElement, CanvasComponentProps } from "../types";
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

/**
 * Canvas操作の中核となるコンポーネント（背景機能統合・動作版）
 */
const CanvasComponent = forwardRef<HTMLCanvasElement, CanvasComponentProps>((props, ref) => {
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

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  useImperativeHandle(ref, () => canvasRef.current!, []);

  // 状態管理hook使用
  const [state, actions] = useCanvasState();

  // 背景選択状態
  const [selectedBackground, setSelectedBackground] = useState<BackgroundElement | null>(null);
  const [isBackgroundDragging, setIsBackgroundDragging] = useState<boolean>(false);
  const [isBackgroundResizing, setIsBackgroundResizing] = useState<boolean>(false);

  // ContextMenu & Clipboard 状態
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    target: null,
    targetElement: null,
  });
  const [clipboard, setClipboard] = useState<ClipboardState | null>(null);

  // ContextMenuActions実装（背景対応版）
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
      
      setPanels([...panels, newPanel]);
      setCharacters([...characters, ...newCharacters]);
      setSpeechBubbles([...speechBubbles, ...newBubbles]);
      setBackgrounds([...backgrounds, ...newBackgrounds]);
      
      actions.setSelectedPanel(newPanel);
      actions.setSelectedCharacter(null);
      actions.setSelectedBubble(null);
      setSelectedBackground(null);
      if (onPanelSelect) onPanelSelect(newPanel);
      if (onCharacterSelect) onCharacterSelect(null);
    },

    onCopyToClipboard: (type: 'panel' | 'character' | 'bubble' | 'background', element: Panel | Character | SpeechBubble | BackgroundElement) => {
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
      }
      
      setClipboard(null);
    },

    onDeleteElement: (type: 'character' | 'bubble' | 'background', element: Character | SpeechBubble | BackgroundElement) => {
      if (type === 'character') {
        const newCharacters = characters.filter(char => char.id !== element.id);
        setCharacters(newCharacters);
        actions.setSelectedCharacter(null);
        if (onCharacterSelect) onCharacterSelect(null);
        console.log("キャラクター削除:", (element as Character).name);
      } else if (type === 'bubble') {
        const newBubbles = speechBubbles.filter(bubble => bubble.id !== element.id);
        setSpeechBubbles(newBubbles);
        actions.setSelectedBubble(null);
        console.log("吹き出し削除:", (element as SpeechBubble).text);
      } else if (type === 'background') {
        const newBackgrounds = backgrounds.filter(bg => bg.id !== element.id);
        setBackgrounds(newBackgrounds);
        setSelectedBackground(null);
        console.log("背景削除:", (element as BackgroundElement).type);
      }
    },

    onDeletePanel: (panel: Panel) => {
      const panelCharacters = characters.filter(char => char.panelId === panel.id);
      const panelBubbles = speechBubbles.filter(bubble => bubble.panelId === panel.id);
      const panelBackgrounds = backgrounds.filter(bg => bg.panelId === panel.id);
      
      let confirmMessage = `コマ ${panel.id} を削除しますか？`;
      if (panelCharacters.length > 0 || panelBubbles.length > 0 || panelBackgrounds.length > 0) {
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
      }
      
      if (!window.confirm(confirmMessage)) {
        return;
      }

      const newPanels = panels.filter(p => p.id !== panel.id);
      const newCharacters = characters.filter(char => char.panelId !== panel.id);
      const newBubbles = speechBubbles.filter(bubble => bubble.panelId !== panel.id);
      const newBackgrounds = backgrounds.filter(bg => bg.panelId !== panel.id);
      
      setPanels(newPanels);
      setCharacters(newCharacters);
      setSpeechBubbles(newBubbles);
      setBackgrounds(newBackgrounds);

      actions.setSelectedPanel(null);
      actions.setSelectedCharacter(null);
      actions.setSelectedBubble(null);
      setSelectedBackground(null);
      if (onPanelSelect) onPanelSelect(null);
      if (onCharacterSelect) onCharacterSelect(null);
      
      console.log(`コマ${panel.id}を削除しました`);
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

      setPanels(flippedPanels);
      setCharacters(flippedCharacters);
      setSpeechBubbles(flippedBubbles);
      setBackgrounds(flippedBackgrounds);
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

      setPanels(flippedPanels);
      setCharacters(flippedCharacters);
      setSpeechBubbles(flippedBubbles);
      setBackgrounds(flippedBackgrounds);
    },

    onEditPanel: (panel: Panel) => {
      actions.setSelectedPanel(panel);
      actions.setSelectedCharacter(null);
      actions.setSelectedBubble(null);
      setSelectedBackground(null);
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

    onSelectElement: (type: 'character' | 'bubble' | 'panel' | 'background', element: Character | SpeechBubble | Panel | BackgroundElement) => {
      if (type === 'character') {
        actions.setSelectedCharacter(element as Character);
        actions.setSelectedBubble(null);
        actions.setSelectedPanel(null);
        setSelectedBackground(null);
        if (onCharacterSelect) onCharacterSelect(element as Character);
        if (onPanelSelect) onPanelSelect(null);
      } else if (type === 'bubble') {
        actions.setSelectedBubble(element as SpeechBubble);
        actions.setSelectedCharacter(null);
        actions.setSelectedPanel(null);
        setSelectedBackground(null);
        if (onCharacterSelect) onCharacterSelect(null);
        if (onPanelSelect) onPanelSelect(null);
      } else if (type === 'panel') {
        actions.setSelectedPanel(element as Panel);
        actions.setSelectedCharacter(null);
        actions.setSelectedBubble(null);
        setSelectedBackground(null);
        if (onPanelSelect) onPanelSelect(element as Panel);
        if (onCharacterSelect) onCharacterSelect(null);
      } else if (type === 'background') {
        setSelectedBackground(element as BackgroundElement);
        actions.setSelectedCharacter(null);
        actions.setSelectedBubble(null);
        actions.setSelectedPanel(null);
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

    onOpenBackgroundPanel: (background: BackgroundElement) => {
      console.log("背景設定パネルを開く:", background.type);
      // TODO: 背景設定パネルの実装
    },

    onDeselectAll: () => {
      actions.setSelectedCharacter(null);
      actions.setSelectedBubble(null);
      actions.setSelectedPanel(null);
      setSelectedBackground(null);
      if (onCharacterSelect) onCharacterSelect(null);
      if (onPanelSelect) onPanelSelect(null);
    },
  };

  // マウスイベントhook使用（背景対応版）
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
    // 背景関連プロパティ
    backgrounds,
    setBackgrounds,
    selectedBackground,
    setSelectedBackground,
    isPanelEditMode,
    snapSettings,
    contextMenu,
    setContextMenu,
    contextMenuActions,
    onPanelSelect,
    onCharacterSelect,
    onPanelSplit,
  });

  // 一時的なキーボードイベント処理
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'c':
            if (selectedBackground) {
              contextMenuActions.onCopyToClipboard('background', selectedBackground);
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
      
      if (e.key === 'Delete' && selectedBackground) {
        contextMenuActions.onDeleteElement('background', selectedBackground);
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedBackground, clipboard]);

  // Canvas描画hook使用
  const { drawCanvas } = useCanvasDrawing({
    canvasRef,
    state,
    panels,
    characters,
    speechBubbles,
    isPanelEditMode,
    snapSettings,
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

  // テンプレート変更時の処理
  useEffect(() => {
    if (templates[selectedTemplate]) {
      setPanels([...templates[selectedTemplate].panels]);
      actions.setSelectedPanel(null);
      actions.setSelectedCharacter(null);
      actions.setSelectedBubble(null);
      setSelectedBackground(null);
      if (onPanelSelect) onPanelSelect(null);
      if (onCharacterSelect) onCharacterSelect(null);
    }
  }, [selectedTemplate, setPanels]);

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
    <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "100vh", padding: "0px" }}>
      {/* Canvas要素 */}
      <canvas
        ref={canvasRef}
        width={600}
        height={800}
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
          cursor: state.isPanelResizing || state.isDragging || state.isBubbleResizing || state.isCharacterResizing || isBackgroundDragging || isBackgroundResizing ? "grabbing" : "pointer",
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

      {/* 選択状態表示 */}
      {state.selectedPanel && (
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
          パネル{state.selectedPanel.id}選択中
          {isPanelEditMode && <span> | 編集モード</span>}
          {state.isPanelMoving && <span> | 移動中</span>}
          {state.isPanelResizing && <span> | リサイズ中</span>}
        </div>
      )}
      
      {state.selectedCharacter && (
        <div
          style={{
            position: "absolute",
            top: "40px",
            right: "10px",
            background: state.isCharacterResizing 
              ? "rgba(255, 0, 0, 0.9)"
              : state.isDragging 
              ? "rgba(0, 150, 255, 0.9)"
              : "rgba(0, 102, 255, 0.9)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          {state.isCharacterResizing ? `リサイズ中 (${state.resizeDirection})` : 
          state.isDragging ? "移動中" : 
          state.selectedCharacter.name}
          <br/>
          <small>
            {state.selectedCharacter.isGlobalPosition ? "自由移動" : "パネル内"}
            {" | "}
            {state.selectedCharacter.viewType}
            {" | "}
            {state.selectedCharacter.scale.toFixed(1)}x
          </small>
        </div>
      )}
      
      {state.selectedBubble && (
        <div
          style={{
            position: "absolute",
            top: "70px",
            right: "10px",
            background: state.isBubbleResizing 
              ? "rgba(255, 0, 0, 0.9)"
              : state.isDragging 
              ? "rgba(0, 150, 255, 0.9)"
              : "rgba(255, 20, 147, 0.9)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          {state.isBubbleResizing ? `リサイズ中 (${state.resizeDirection})` : 
          state.isDragging ? "移動中" : 
          state.selectedBubble.text}
          <br/>
          <small>
            {state.selectedBubble.width}x{state.selectedBubble.height}px
          </small>
        </div>
      )}

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
          <small>
            {selectedBackground.type} | 透明度: {Math.round(selectedBackground.opacity * 100)}%
          </small>
        </div>
      )}

      {/* クリップボード状態表示 */}
      {clipboard && (
        <div
          style={{
            position: "absolute",
            top: "130px",
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
            top: "160px",
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

      {/* デバッグ情報表示 */}
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
        ドラッグ: {state.isDragging || isBackgroundDragging ? "✅" : "❌"}<br/>
        吹き出しリサイズ: {state.isBubbleResizing ? "✅" : "❌"}<br/>
        キャラリサイズ: {state.isCharacterResizing ? "✅" : "❌"}<br/>
        背景操作: {selectedBackground ? "✅" : "❌"}<br/>
        背景数: {backgrounds.length}個
      </div>
    </div>
  );
});

CanvasComponent.displayName = 'CanvasComponent';
export default CanvasComponent;