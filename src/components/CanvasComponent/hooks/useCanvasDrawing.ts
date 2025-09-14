// src/components/CanvasComponent/hooks/useCanvasDrawing.ts - 背景描画統合版
import { RefObject, useEffect } from 'react';
import { Panel, Character, SpeechBubble, BackgroundElement, SnapSettings } from '../../../types';
import { CanvasState } from './useCanvasState';
import { CanvasDrawing } from '../../CanvasArea/CanvasDrawing';
import { BubbleRenderer } from '../../CanvasArea/renderers/BubbleRenderer';
import { CharacterRenderer } from '../../CanvasArea/renderers/CharacterRenderer/CharacterRenderer';
import { BackgroundRenderer } from '../../CanvasArea/renderers/BackgroundRenderer';

export interface CanvasDrawingHookProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  state: CanvasState;
  panels: Panel[];
  characters: Character[];
  speechBubbles: SpeechBubble[];
  backgrounds: BackgroundElement[]; // 🆕 背景データ追加
  selectedBackground?: BackgroundElement | null; // 🆕 選択された背景
  isPanelEditMode: boolean;
  snapSettings: SnapSettings;
}

/**
 * Canvas描画処理を管理するカスタムhook（背景描画対応版）
 * 描画順序: 背景色 → グリッド → パネル → 背景要素 → 吹き出し → キャラクター → UI要素
 */
export const useCanvasDrawing = ({
  canvasRef,
  state,
  panels,
  characters,
  speechBubbles,
  backgrounds, // 🆕 背景データ
  selectedBackground, // 🆕 選択された背景
  isPanelEditMode,
  snapSettings,
}: CanvasDrawingHookProps) => {

  /**
   * 🆕 背景を描画（パネル内で zIndex 順）
   */
  const drawBackgrounds = (ctx: CanvasRenderingContext2D) => {
    panels.forEach(panel => {
      // 各パネルの背景要素を取得（zIndex順にソート）
      const panelBackgrounds = backgrounds
        .filter(bg => bg.panelId === panel.id)
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

      // パネル内の背景を順番に描画
      panelBackgrounds.forEach(background => {
        const isSelected = selectedBackground?.id === background.id;
        
        BackgroundRenderer.renderBackground(
          ctx,
          background,
          panel,
          isSelected
        );
      });
    });
  };

  /**
   * 🆕 選択された背景のハンドルを描画
   */
  const drawBackgroundHandles = (ctx: CanvasRenderingContext2D) => {
    if (!selectedBackground) return;

    const panel = panels.find(p => p.id === selectedBackground.panelId);
    if (!panel) return;

    BackgroundRenderer.drawBackgroundHandles(
      ctx,
      selectedBackground,
      panel
    );
  };

  /**
   * グリッド表示判定
   */
  const showGrid = snapSettings.gridDisplay === 'always' || 
                  (snapSettings.gridDisplay === 'edit-only' && isPanelEditMode);

  /**
   * Canvas描画関数（背景描画統合版）
   */
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn("⚠️ Canvas要素が見つかりません");
      return;
    }
    
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.warn("⚠️ Canvas 2Dコンテキストが取得できません");
      return;
    }

    // ダークモード判定
    const isDarkMode = document.documentElement.getAttribute("data-theme") === "dark";

    try {
      // 1. キャンバスクリア
      CanvasDrawing.clearCanvas(ctx, canvas.width, canvas.height);
      
      // 2. 背景描画（最初に描画）
      CanvasDrawing.drawBackground(ctx, canvas.width, canvas.height, isDarkMode);

      // 3. グリッド描画（設定に応じて）
      if (showGrid) {
        CanvasDrawing.drawGrid(ctx, canvas.width, canvas.height, snapSettings.gridSize, isDarkMode);
      }

      // 4. パネル描画
      CanvasDrawing.drawPanels(ctx, panels, state.selectedPanel, isDarkMode, isPanelEditMode);
      
      // 🆕 5. 背景要素描画（パネル内で zIndex 順）
      drawBackgrounds(ctx);
      
      // 6. 吹き出し描画
      BubbleRenderer.drawBubbles(ctx, speechBubbles, panels, state.selectedBubble);
      
      // 7. キャラクター描画
      CharacterRenderer.drawCharacters(ctx, characters, panels, state.selectedCharacter);

      // 8. スナップライン描画
      if (state.snapLines.length > 0) {
        CanvasDrawing.drawSnapLines(ctx, state.snapLines, isDarkMode);
      }

      // 🆕 9. 背景ハンドル描画（最後に描画）
      drawBackgroundHandles(ctx);

      console.log("✅ Canvas描画完了（背景対応）");
    } catch (error) {
      console.error("❌ Canvas描画エラー:", error);
    }
  };

  /**
   * テーマ変更監視
   */
  const observeThemeChange = () => {
    const handleThemeChange = () => {
      console.log("🎨 テーマ変更検出 - 再描画実行");
      drawCanvas();
    };
    
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    
    return () => {
      observer.disconnect();
      console.log("🎨 テーマ変更監視停止");
    };
  };

  /**
   * 描画トリガー監視useEffect（背景対応版）
   */
  useEffect(() => {
    drawCanvas();
    console.log("🔄 描画トリガー:", {
      panelsCount: panels.length,
      charactersCount: characters.length,
      bubblesCount: speechBubbles.length,
      backgroundsCount: backgrounds.length, // 🆕 背景数追加
      selectedPanel: state.selectedPanel?.id,
      selectedCharacter: state.selectedCharacter?.name,
      selectedBubble: state.selectedBubble?.text?.substring(0, 10),
      selectedBackground: selectedBackground?.type, // 🆕 選択された背景
      isPanelEditMode,
      snapLinesCount: state.snapLines.length,
      showGrid,
      gridSize: snapSettings.gridSize,
    });
  }, [
    panels.length,
    state.selectedPanel,
    characters.length,
    state.selectedCharacter,
    speechBubbles.length,
    state.selectedBubble,
    backgrounds.length, // 🆕 背景の長さ監視
    selectedBackground, // 🆕 選択された背景監視
    isPanelEditMode,
    state.snapLines.length,
    showGrid,
    snapSettings.gridSize,
    snapSettings.gridDisplay,
    // JSON.stringify も背景対応
    JSON.stringify(panels.map(p => ({ id: p.id, x: p.x, y: p.y, width: p.width, height: p.height }))),
    JSON.stringify(characters.map(c => ({ id: c.id, x: c.x, y: c.y, scale: c.scale, width: c.width, height: c.height }))),
    JSON.stringify(speechBubbles.map(b => ({ id: b.id, x: b.x, y: b.y, width: b.width, height: b.height }))),
    JSON.stringify(backgrounds.map(bg => ({ id: bg.id, panelId: bg.panelId, type: bg.type, x: bg.x, y: bg.y, width: bg.width, height: bg.height, opacity: bg.opacity }))), // 🆕 背景データ監視
  ]);

  /**
   * テーマ変更監視useEffect
   */
  useEffect(() => {
    return observeThemeChange();
  }, []);

  /**
   * 手動再描画関数を返す（必要に応じて外部から呼び出し可能）
   */
  return {
    drawCanvas,
    showGrid,
  };
};