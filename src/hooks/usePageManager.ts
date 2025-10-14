// src/hooks/usePageManager.ts - ページ管理状態Hook

import { useState, useCallback, useMemo } from 'react';
import { 
  Page, 
  Panel, 
  Character, 
  SpeechBubble, 
  BackgroundElement, 
  EffectElement, 
  ToneElement,
  UsePageManagerReturn 
} from '../types';
import { BetaUtils } from '../config/betaConfig';

interface UsePageManagerProps {
  // 現在の単一ページデータ（既存システムから）
  panels: Panel[];
  characters: Character[];
  bubbles: SpeechBubble[];
  backgrounds: BackgroundElement[];
  effects: EffectElement[];
  tones: ToneElement[];
  
  // データ更新コールバック（既存システムへ）
  onDataUpdate: (pageData: {
    panels: Panel[];
    characters: Character[];
    bubbles: SpeechBubble[];
    backgrounds: BackgroundElement[];
    effects: EffectElement[];
    tones: ToneElement[];
  }) => void;
}

export const usePageManager = (props: UsePageManagerProps): UsePageManagerReturn => {
  const { panels, characters, bubbles, backgrounds, effects, tones, onDataUpdate } = props;

  // ページ配列の状態管理
  const [pages, setPages] = useState<Page[]>(() => [
    {
      id: generatePageId(),
      title: 'ページ 1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      panels: [],
      characters: [],
      bubbles: [],
      backgrounds: [],
      effects: [],
      tones: []
    }
  ]);

  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

  // 現在のページデータ（既存システムのデータを使用）
  const currentPage = useMemo((): Page => ({
    id: pages[currentPageIndex]?.id || generatePageId(),
    title: pages[currentPageIndex]?.title || `ページ ${currentPageIndex + 1}`,
    note: pages[currentPageIndex]?.note,
    createdAt: pages[currentPageIndex]?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    panels,
    characters,
    bubbles,
    backgrounds,
    effects,
    tones
  }), [pages, currentPageIndex, panels, characters, bubbles, backgrounds, effects, tones]);

  // ページ追加
  const addPage = useCallback(() => {
    // 🔒 ベータ版制限: ページ数制限チェック
    if (!BetaUtils.canAddPage(pages.length)) {
      alert('ベータ版では1ページのみ作成できます。\nフル版では複数ページが利用可能です！');
      return;
    }

    const newPage: Page = {
      id: generatePageId(),
      title: `ページ ${pages.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      panels: [],
      characters: [],
      bubbles: [],
      backgrounds: [],
      effects: [],
      tones: []
    };

    setPages(prev => [...prev, newPage]);
    
    // 新しいページに切り替え
    const newIndex = pages.length;
    setCurrentPageIndex(newIndex);
    
    // 既存システムを空のデータに更新
    onDataUpdate({
      panels: [],
      characters: [],
      bubbles: [],
      backgrounds: [],
      effects: [],
      tones: []
    });

    console.log(`📄 新しいページを追加: ${newPage.title}`);
  }, [pages.length, onDataUpdate]);

  // ページ削除
  const deletePage = useCallback((pageIndex: number) => {
    if (pages.length <= 1) {
      console.warn('⚠️ 最後のページは削除できません');
      return;
    }

    const pageToDelete = pages[pageIndex];
    if (!pageToDelete) return;

    if (window.confirm(`「${pageToDelete.title}」を削除しますか？`)) {
      const newPages = pages.filter((_, index) => index !== pageIndex);
      setPages(newPages);

      // 現在のページインデックスを調整
      const newCurrentIndex = Math.min(currentPageIndex, newPages.length - 1);
      setCurrentPageIndex(newCurrentIndex);

      // 調整後のページデータで既存システムを更新
      const targetPage = newPages[newCurrentIndex];
      if (targetPage) {
        onDataUpdate({
          panels: targetPage.panels,
          characters: targetPage.characters,
          bubbles: targetPage.bubbles,
          backgrounds: targetPage.backgrounds,
          effects: targetPage.effects,
          tones: targetPage.tones
        });
      }

      console.log(`🗑️ ページを削除: ${pageToDelete.title}`);
    }
  }, [pages, currentPageIndex, onDataUpdate]);

  // ページ複製
  const duplicatePage = useCallback((pageIndex: number) => {
    const pageToClone = pages[pageIndex];
    if (!pageToClone) return;

    const clonedPage: Page = {
      id: generatePageId(),
      title: `${pageToClone.title} のコピー`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      panels: JSON.parse(JSON.stringify(pageToClone.panels)),
      characters: JSON.parse(JSON.stringify(pageToClone.characters)),
      bubbles: JSON.parse(JSON.stringify(pageToClone.bubbles)),
      backgrounds: JSON.parse(JSON.stringify(pageToClone.backgrounds)),
      effects: JSON.parse(JSON.stringify(pageToClone.effects)),
      tones: JSON.parse(JSON.stringify(pageToClone.tones))
    };

    const newPages = [...pages];
    newPages.splice(pageIndex + 1, 0, clonedPage);
    setPages(newPages);

    // 複製したページに切り替え
    const newIndex = pageIndex + 1;
    setCurrentPageIndex(newIndex);
    
    // 既存システムを複製データで更新
    onDataUpdate({
      panels: clonedPage.panels,
      characters: clonedPage.characters,
      bubbles: clonedPage.bubbles,
      backgrounds: clonedPage.backgrounds,
      effects: clonedPage.effects,
      tones: clonedPage.tones
    });

    console.log(`📋 ページを複製: ${pageToClone.title} → ${clonedPage.title}`);
  }, [pages, onDataUpdate]);

  // ページ名前変更
  const renamePage = useCallback((pageIndex: number, newTitle: string) => {
    if (!newTitle.trim()) return;

    setPages(prev => prev.map((page, index) => 
      index === pageIndex 
        ? { ...page, title: newTitle.trim(), updatedAt: new Date().toISOString() }
        : page
    ));

    console.log(`✏️ ページ名を変更: ${pages[pageIndex]?.title} → ${newTitle}`);
  }, [pages]);

  // ページ切り替え
  const switchToPage = useCallback((pageIndex: number) => {
    if (pageIndex < 0 || pageIndex >= pages.length) return;

    // 現在のページデータを保存
    const updatedCurrentPage = { ...currentPage };
    setPages(prev => prev.map((page, index) => 
      index === currentPageIndex ? updatedCurrentPage : page
    ));

    // 新しいページに切り替え
    setCurrentPageIndex(pageIndex);
    
    // 切り替え先のページデータで既存システムを更新
    const targetPage = pages[pageIndex];
    onDataUpdate({
      panels: targetPage.panels,
      characters: targetPage.characters,
      bubbles: targetPage.bubbles,
      backgrounds: targetPage.backgrounds,
      effects: targetPage.effects,
      tones: targetPage.tones
    });

    console.log(`📄 ページ切り替え: ${targetPage.title} (${pageIndex + 1}/${pages.length})`);
  }, [currentPage, currentPageIndex, pages, onDataUpdate]);

  // ページ順序変更
  const reorderPages = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const newPages = [...pages];
    const [movedPage] = newPages.splice(fromIndex, 1);
    newPages.splice(toIndex, 0, movedPage);
    
    setPages(newPages);

    // 現在のページインデックスを調整
    let newCurrentIndex = currentPageIndex;
    if (currentPageIndex === fromIndex) {
      newCurrentIndex = toIndex;
    } else if (fromIndex < currentPageIndex && toIndex >= currentPageIndex) {
      newCurrentIndex = currentPageIndex - 1;
    } else if (fromIndex > currentPageIndex && toIndex <= currentPageIndex) {
      newCurrentIndex = currentPageIndex + 1;
    }
    
    setCurrentPageIndex(newCurrentIndex);

    console.log(`🔄 ページ順序変更: ${fromIndex} → ${toIndex}`);
  }, [pages, currentPageIndex]);

  // 現在ページデータ更新（既存システムから呼び出される）
  const updateCurrentPageData = useCallback((data: Partial<Page>) => {
    // pages配列の現在ページを更新
    setPages(prev => prev.map((page, index) => 
      index === currentPageIndex 
        ? { ...page, ...data, updatedAt: new Date().toISOString() }
        : page
    ));
  }, [currentPageIndex]);

  // 削除可能判定
  const canDeletePage = useMemo(() => pages.length > 1, [pages.length]);

  // 未保存変更の検知（簡易版）
  const hasUnsavedChanges = useMemo(() => {
    const savedPage = pages[currentPageIndex];
    if (!savedPage) return false;

    // 現在のデータと保存されたデータを比較
    return (
      JSON.stringify(savedPage.panels) !== JSON.stringify(panels) ||
      JSON.stringify(savedPage.characters) !== JSON.stringify(characters) ||
      JSON.stringify(savedPage.bubbles) !== JSON.stringify(bubbles) ||
      JSON.stringify(savedPage.backgrounds) !== JSON.stringify(backgrounds) ||
      JSON.stringify(savedPage.effects) !== JSON.stringify(effects) ||
      JSON.stringify(savedPage.tones) !== JSON.stringify(tones)
    );
  }, [pages, currentPageIndex, panels, characters, bubbles, backgrounds, effects, tones]);

  // プロジェクトロード用の関数
  const loadProjectPages = useCallback((loadedPages: Page[], pageIndex: number = 0) => {
    setPages(loadedPages);
    setCurrentPageIndex(Math.min(pageIndex, loadedPages.length - 1));
    console.log('📄 ページデータロード完了:', loadedPages.length, 'ページ');
  }, []);

  return {
    pages,
    currentPageIndex,
    currentPage,
    addPage,
    deletePage,
    duplicatePage,
    renamePage,
    switchToPage,
    reorderPages,
    updateCurrentPageData,
    canDeletePage,
    hasUnsavedChanges,
    loadProjectPages  // プロジェクトロード時に使用
  };
};

// ユニークID生成
const generatePageId = (): string => {
  return `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export default usePageManager;