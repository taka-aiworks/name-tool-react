// src/components/CanvasArea/renderers/PanelRenderer.tsx
import React from 'react';
import { Panel } from '../../../types';

interface PanelRendererProps {
  panel: Panel;
  isSelected: boolean;
  isEditMode: boolean;
  onPanelSelect: (panel: Panel) => void;
  onPanelUpdate: (panel: Panel) => void;
  onPanelDelete: (panelId: string) => void;
  onPanelSplit: (panelId: string, direction: 'horizontal' | 'vertical') => void;
  onPanelAdd: (targetPanelId: string, position: 'above' | 'below' | 'left' | 'right') => void; // 🆕 追加
  onRightClick: (e: React.MouseEvent, panel: Panel) => void;
  isDarkMode: boolean;
}

export const PanelRenderer: React.FC<PanelRendererProps> = ({
  panel,
  isSelected,
  isEditMode,
  onPanelSelect,
  onPanelUpdate,
  onPanelDelete,
  onPanelSplit,
  onPanelAdd,
  onRightClick,
  isDarkMode
}) => {
  const [isResizing, setIsResizing] = React.useState(false);
  const [resizeType, setResizeType] = React.useState<string>('');
  const [startPos, setStartPos] = React.useState({ x: 0, y: 0 });
  const [startPanel, setStartPanel] = React.useState<Panel | null>(null);

  // 🆕 右クリックメニューの状態管理
  const [contextMenu, setContextMenu] = React.useState<{
    visible: boolean;
    x: number;
    y: number;
    panel: Panel | null;
  }>({ visible: false, x: 0, y: 0, panel: null });

  // リサイズハンドル描画
  const renderResizeHandles = () => {
    if (!isSelected || !isEditMode) return null;

    const handleStyle = {
      position: 'absolute' as const,
      width: '8px',
      height: '8px',
      backgroundColor: '#3b82f6',
      border: '2px solid #fff',
      borderRadius: '50%',
      cursor: 'nw-resize',
      zIndex: 1000
    };

    return (
      <>
        {/* 四隅のハンドル */}
        <div
          style={{ ...handleStyle, top: '-4px', left: '-4px', cursor: 'nw-resize' }}
          onMouseDown={(e) => handleResizeStart(e, 'nw')}
        />
        <div
          style={{ ...handleStyle, top: '-4px', right: '-4px', cursor: 'ne-resize' }}
          onMouseDown={(e) => handleResizeStart(e, 'ne')}
        />
        <div
          style={{ ...handleStyle, bottom: '-4px', left: '-4px', cursor: 'sw-resize' }}
          onMouseDown={(e) => handleResizeStart(e, 'sw')}
        />
        <div
          style={{ ...handleStyle, bottom: '-4px', right: '-4px', cursor: 'se-resize' }}
          onMouseDown={(e) => handleResizeStart(e, 'se')}
        />
        
        {/* 辺の中央のハンドル */}
        <div
          style={{ ...handleStyle, top: '-4px', left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' }}
          onMouseDown={(e) => handleResizeStart(e, 'n')}
        />
        <div
          style={{ ...handleStyle, bottom: '-4px', left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' }}
          onMouseDown={(e) => handleResizeStart(e, 's')}
        />
        <div
          style={{ ...handleStyle, left: '-4px', top: '50%', transform: 'translateY(-50%)', cursor: 'w-resize' }}
          onMouseDown={(e) => handleResizeStart(e, 'w')}
        />
        <div
          style={{ ...handleStyle, right: '-4px', top: '50%', transform: 'translateY(-50%)', cursor: 'e-resize' }}
          onMouseDown={(e) => handleResizeStart(e, 'e')}
        />

        {/* 🆕 コマ分割ボタン */}
        <div
          style={{
            position: 'absolute',
            bottom: '5px',
            right: '5px',
            width: '20px',
            height: '20px',
            backgroundColor: '#8b5cf6',
            color: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '12px',
            zIndex: 1001
          }}
          onClick={() => onPanelSplit(panel.id.toString(), 'horizontal')}
          title="コマを分割"
        >
          ✂️
        </div>
      </>
    );
  };

  // 🆕 右クリックメニュー表示
  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      panel: panel
    });

    // 他の右クリックメニューを閉じる
    document.addEventListener('click', closeContextMenu);
  };

  // 🆕 右クリックメニューを閉じる
  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, panel: null });
    document.removeEventListener('click', closeContextMenu);
  };

  // 🆕 右クリックメニューアクション
  const handleContextMenuAction = (action: string, position?: string) => {
    if (!contextMenu.panel) return;
    
    switch (action) {
      case 'select':
        onPanelSelect(contextMenu.panel);
        break;
      case 'delete':
        if (window.confirm(`コマ${contextMenu.panel.id}を削除しますか？`)) {
          onPanelDelete(contextMenu.panel.id.toString())
        }
        break;
      case 'split-horizontal':
        onPanelSplit(contextMenu.panel.id.toString(), 'horizontal');
        break;
      case 'split-vertical':
        onPanelSplit(contextMenu.panel.id.toString(), 'vertical');
        break;
      case 'add':
        if (position) {
          onPanelAdd(contextMenu.panel.id.toString(), position as 'above' | 'below' | 'left' | 'right');
        }
        break;
    }
    
    closeContextMenu();
  };

  // リサイズ開始
  const handleResizeStart = (e: React.MouseEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeType(type);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartPanel({ ...panel });

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  // リサイズ中
  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing || !startPanel) return;

    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    
    let newPanel = { ...startPanel };

    switch (resizeType) {
      case 'nw':
        newPanel.x = startPanel.x + deltaX;
        newPanel.y = startPanel.y + deltaY;
        newPanel.width = Math.max(50, startPanel.width - deltaX);
        newPanel.height = Math.max(50, startPanel.height - deltaY);
        break;
      case 'ne':
        newPanel.y = startPanel.y + deltaY;
        newPanel.width = Math.max(50, startPanel.width + deltaX);
        newPanel.height = Math.max(50, startPanel.height - deltaY);
        break;
      case 'sw':
        newPanel.x = startPanel.x + deltaX;
        newPanel.width = Math.max(50, startPanel.width - deltaX);
        newPanel.height = Math.max(50, startPanel.height + deltaY);
        break;
      case 'se':
        newPanel.width = Math.max(50, startPanel.width + deltaX);
        newPanel.height = Math.max(50, startPanel.height + deltaY);
        break;
      case 'n':
        newPanel.y = startPanel.y + deltaY;
        newPanel.height = Math.max(50, startPanel.height - deltaY);
        break;
      case 's':
        newPanel.height = Math.max(50, startPanel.height + deltaY);
        break;
      case 'w':
        newPanel.x = startPanel.x + deltaX;
        newPanel.width = Math.max(50, startPanel.width - deltaX);
        break;
      case 'e':
        newPanel.width = Math.max(50, startPanel.width + deltaX);
        break;
    }

    onPanelUpdate(newPanel);
  };

  // リサイズ終了
  const handleResizeEnd = () => {
    setIsResizing(false);
    setResizeType('');
    setStartPanel(null);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  const panelStyle = {
    position: 'absolute' as const,
    left: `${panel.x}px`,
    top: `${panel.y}px`,
    width: `${panel.width}px`,
    height: `${panel.height}px`,
    border: isSelected 
      ? '3px solid #3b82f6' 
      : isDarkMode 
        ? '2px solid #374151' 
        : '2px solid #d1d5db',
    backgroundColor: 'transparent',
    cursor: isEditMode ? 'move' : 'pointer',
    boxSizing: 'border-box' as const,
  };

  return (
    <>
      <div
        style={panelStyle}
        onClick={() => onPanelSelect(panel)}
        onContextMenu={handleRightClick}
        title={`コマ ${panel.id}`}
      >
        {/* パネル番号表示 */}
        <div
          style={{
            position: 'absolute',
            top: '2px',
            left: '2px',
            fontSize: '12px',
            fontWeight: 'bold',
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            pointerEvents: 'none'
          }}
        >
          {panel.id}
        </div>

        {renderResizeHandles()}
      </div>

      {/* 🆕 右クリックコンテキストメニュー */}
      {contextMenu.visible && (
        <div
          style={{
            position: 'fixed',
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            zIndex: 10000,
            minWidth: '160px',
            padding: '4px 0'
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* コマ選択 */}
          <div
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              color: isDarkMode ? '#f9fafb' : '#111827',
              borderBottom: '1px solid #e5e7eb'
            }}
            onClick={() => handleContextMenuAction('select')}
            // すべての onMouseEnter/onMouseLeave を以下に修正
            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
          >
            📍 コマを選択
          </div>

          {/* コマ追加メニュー */}
          <div
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              color: isDarkMode ? '#f9fafb' : '#111827',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
              // サブメニュー表示ロジック（簡易版）
            }}
            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
          >
            ➕ コマを追加 ▶
            
            {/* サブメニュー（簡易実装） */}
            <div
              style={{
                position: 'absolute',
                left: '100%',
                top: '0',
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                minWidth: '120px',
                display: 'none' // ホバー時に表示（CSS で制御）
              }}
              className="submenu"
            >
              <div onClick={() => handleContextMenuAction('add', 'above')} style={{ padding: '6px 12px', cursor: 'pointer' }}>⬆️ 上に追加</div>
              <div onClick={() => handleContextMenuAction('add', 'below')} style={{ padding: '6px 12px', cursor: 'pointer' }}>⬇️ 下に追加</div>
              <div onClick={() => handleContextMenuAction('add', 'left')} style={{ padding: '6px 12px', cursor: 'pointer' }}>⬅️ 左に追加</div>
              <div onClick={() => handleContextMenuAction('add', 'right')} style={{ padding: '6px 12px', cursor: 'pointer' }}>➡️ 右に追加</div>
            </div>
          </div>

          {/* コマ分割 */}
          <div
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              color: isDarkMode ? '#f9fafb' : '#111827'
            }}
            onClick={() => handleContextMenuAction('split-horizontal')}
            // すべての onMouseEnter/onMouseLeave を以下に修正
            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
          >
            ✂️ 横に分割
          </div>

          <div
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              color: isDarkMode ? '#f9fafb' : '#111827',
              borderBottom: '1px solid #e5e7eb'
            }}
            onClick={() => handleContextMenuAction('split-vertical')}
            // すべての onMouseEnter/onMouseLeave を以下に修正
            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
          >
            ✂️ 縦に分割
          </div>

          {/* コマ削除 */}
          <div
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              color: '#dc2626'
            }}
            onClick={() => handleContextMenuAction('delete')}
            // すべての onMouseEnter/onMouseLeave を以下に修正
            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
          >
            🗑️ コマを削除
          </div>
        </div>
      )}

      {/* CSS for submenu hover effect */}
      <style>{`
        .submenu {
          display: none !important;
        }
        div:hover > .submenu {
          display: block !important;
        }
      `}</style>
    </>
  );
};