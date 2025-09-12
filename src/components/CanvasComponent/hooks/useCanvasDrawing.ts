// src/components/CanvasComponent/hooks/useCanvasDrawing.ts
import { RefObject, useEffect } from 'react';
import { Panel, Character, SpeechBubble, SnapSettings } from '../../../types';
import { CanvasState } from './useCanvasState';
import { CanvasDrawing } from '../../CanvasArea/CanvasDrawing';
import { BubbleRenderer } from '../../CanvasArea/renderers/BubbleRenderer';
import { CharacterRenderer } from '../../CanvasArea/renderers/CharacterRenderer';

export interface CanvasDrawingHookProps {
  canvasRef: RefObject<HTMLCanvasElement>;
  state: CanvasState;
  panels: Panel[];
  characters: Character[];
  speechBubbles: SpeechBubble[];
  isPanelEditMode: boolean;
  snapSettings: SnapSettings;
}

/**
 * Canvas描画処理を管理するカスタムhook
 * 描画ロジックを分離し、描画関連の処理を一元化
 */
export const useCanvasDrawing = ({
  canvasRef,
  state,
  panels,
  characters,
  speechBubbles,
  isPanelEditMode,
  snapSettings,
}: CanvasDrawingHookProps) => {

  /**
   * グリッド表示判定
   */
  const showGrid = snapSettings.gridDisplay === 'always' || 
                  (snapSettings.gridDisplay === 'edit-only' && isPanelEditMode);

  /**
   * Canvas描画関数
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
      
      // 2. 背景描画
      CanvasDrawing.drawBackground(ctx, canvas.width, canvas.height, isDarkMode);

      // 3. グリッド描画（設定に応じて）
      if (showGrid) {
        CanvasDrawing.drawGrid(ctx, canvas.width, canvas.height, snapSettings.gridSize, isDarkMode);
      }

      // 4. パネル描画
      CanvasDrawing.drawPanels(ctx, panels, state.selectedPanel, isDarkMode, isPanelEditMode);
      
      // 5. 吹き出し描画
      BubbleRenderer.drawBubbles(ctx, speechBubbles, panels, state.selectedBubble);
      
      // 6. キャラクター描画
      CharacterRenderer.drawCharacters(ctx, characters, panels, state.selectedCharacter);

      // 7. スナップライン描画
      if (state.snapLines.length > 0) {
        CanvasDrawing.drawSnapLines(ctx, state.snapLines, isDarkMode);
      }

      console.log("✅ Canvas描画完了");
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
   * 描画トリガー監視useEffect
   */
  useEffect(() => {
    drawCanvas();
    console.log("🔄 描画トリガー:", {
      panelsCount: panels.length,
      charactersCount: characters.length,
      bubblesCount: speechBubbles.length,
      selectedPanel: state.selectedPanel?.id,
      selectedCharacter: state.selectedCharacter?.name,
      selectedBubble: state.selectedBubble?.text?.substring(0, 10),
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
    isPanelEditMode,
    state.snapLines.length,
    showGrid,
    snapSettings.gridSize,
    snapSettings.gridDisplay,
    // JSON.stringify を使って深い変更も検出
    JSON.stringify(panels.map(p => ({ id: p.id, x: p.x, y: p.y, width: p.width, height: p.height }))),
    JSON.stringify(characters.map(c => ({ id: c.id, x: c.x, y: c.y, scale: c.scale, width: c.width, height: c.height }))),
    JSON.stringify(speechBubbles.map(b => ({ id: b.id, x: b.x, y: b.y, width: b.width, height: b.height }))),
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