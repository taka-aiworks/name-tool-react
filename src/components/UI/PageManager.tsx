// src/components/UI/PageManager.tsx - 完全版（エラー修正済み）

import React, { useState, useRef, useEffect } from 'react';
import { PageManagerProps, Page } from '../../types';

interface PageTabProps {
  page: Page;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  isDarkMode: boolean;
  canDelete: boolean;
}

const PageTab: React.FC<PageTabProps> = ({
  page,
  index,
  isActive,
  onClick,
  onRename,
  onDelete,
  onDuplicate,
  isDarkMode,
  canDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(page.title);
  const [showMenu, setShowMenu] = useState(false);
  // 🆕 メニュー位置の状態を追加
  const [menuPosition, setMenuPosition] = useState<'above' | 'below'>('below');
  // 🆕 メニュー座標の状態を追加
  const [menuCoords, setMenuCoords] = useState<{ top?: number; bottom?: number; left: number }>({ left: 0 });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handleSubmitEdit = () => {
    if (editTitle.trim() && editTitle !== page.title) {
      onRename(editTitle.trim());
    } else {
      setEditTitle(page.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitEdit();
    } else if (e.key === 'Escape') {
      setEditTitle(page.title);
      setIsEditing(false);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // 🔧 メニュー位置を判定（より厳密に）
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = canDelete ? 120 : 80; // 削除ボタンがある場合は高さを増やす
    const shouldShowAbove = rect.bottom + menuHeight > window.innerHeight - 20;
    
    // 🆕 座標も保存
    setMenuCoords({
      ...(shouldShowAbove 
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }
      ),
      left: rect.left
    });
    
    setMenuPosition(shouldShowAbove ? 'above' : 'below');
    setShowMenu(true);
  };

  return (
    <div
      className={`page-tab ${isActive ? 'active' : ''}`}
      onClick={!isEditing ? onClick : undefined}
      onContextMenu={handleContextMenu}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        minWidth: '120px',
        maxWidth: '200px',
        cursor: isEditing ? 'text' : 'pointer',
        border: '1px solid var(--border-color)',
        borderRadius: '6px 6px 0 0',
        background: isActive 
          ? 'var(--bg-primary)' 
          : 'var(--bg-secondary)',
        borderBottom: isActive ? '1px solid var(--bg-primary)' : '1px solid var(--border-color)',
        marginRight: '2px',
        transition: 'all 0.2s ease',
        fontSize: '13px',
        fontWeight: isActive ? '600' : '400',
      }}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSubmitEdit}
          onKeyDown={handleKeyDown}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: '600',
            width: '100%',
          }}
        />
      ) : (
        <span 
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}
        >
          {page.title}
        </span>
      )}

      {/* 🔧 修正された右クリックメニュー */}
      {showMenu && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed', // absolute から fixed に変更
            // 🆕 保存された座標を使用
            top: menuCoords.top,
            bottom: menuCoords.bottom,
            left: menuCoords.left,
            zIndex: 10000, // より高いz-index
            background: 'var(--bg-primary)',
            border: '2px solid var(--border-color)', // 境界線を太く
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)', // より強いシャドウ
            minWidth: '160px',
            padding: '8px 0',
            maxHeight: '200px',
            overflow: 'visible',
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
              setShowMenu(false);
            }}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 12px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '13px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            📝 名前を変更
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
              setShowMenu(false);
            }}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 12px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '13px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            📋 複製
          </button>
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                setShowMenu(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 16px', // パディングを増やす
                border: 'none',
                background: 'transparent',
                color: '#ff4444', // より目立つ赤色
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px', // フォントサイズを大きく
                fontWeight: '600', // 太字に
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 68, 68, 0.15)';
                e.currentTarget.style.color = '#ff0000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#ff4444';
              }}
            >
              🗑️ ページを削除
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const PageManager: React.FC<PageManagerProps> = ({
  currentPage,
  pages,
  currentPageIndex,
  onPageChange,
  onPageAdd,
  onPageDelete,
  onPageDuplicate,
  onPageRename,
  onPageReorder,
  isDarkMode,
  isCompact = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setIsDragging(true);
    setDragFromIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    
    if (dragFromIndex !== null && dragFromIndex !== toIndex) {
      onPageReorder(dragFromIndex, toIndex);
    }
    
    setIsDragging(false);
    setDragFromIndex(null);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragFromIndex(null);
  };

  return (
    <div 
      className="page-manager"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: isCompact ? '4px 8px' : '8px 12px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        overflowX: 'auto',
        minHeight: isCompact ? '36px' : '44px',
        // 🔧 スクロールバーのスタイル改善
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--border-color) transparent',
      }}
    >
      {/* ページタブ一覧 */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          flex: '1 1 auto', // 🔧 flex設定を調整
          minWidth: 0,
          overflowX: 'auto', // 🔧 タブエリアもスクロール可能に
          paddingRight: '8px', // 🔧 右側に余白を追加
        }}
      >
        {pages.map((page, index) => (
          <div
            key={page.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            style={{
              opacity: isDragging && dragFromIndex === index ? 0.5 : 1,
            }}
          >
            <PageTab
              page={page}
              index={index}
              isActive={index === currentPageIndex}
              onClick={() => onPageChange(index)}
              onRename={(newTitle) => onPageRename(index, newTitle)}
              onDelete={() => onPageDelete(index)}
              onDuplicate={() => onPageDuplicate(index)}
              isDarkMode={isDarkMode}
              canDelete={pages.length > 1}
            />
          </div>
        ))}
      </div>

      {/* ページ追加ボタン */}
      <div style={{ 
        flexShrink: 0, // 🔧 縮小禁止
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      }}>
        <button
          onClick={onPageAdd}
          title="新しいページを追加"
          style={{
            padding: '6px 12px',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease',
            minWidth: 'auto', // 🔧 最小幅を設定
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--accent-color)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-tertiary)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
        >
          ➕ ページ追加
        </button>

        {/* ページ情報表示 */}
        <div
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
            padding: '0 4px',
            minWidth: 'auto', // 🔧 最小幅を設定
          }}
        >
          {currentPageIndex + 1} / {pages.length}
        </div>
      </div>
    </div>
  );
};

export default PageManager;