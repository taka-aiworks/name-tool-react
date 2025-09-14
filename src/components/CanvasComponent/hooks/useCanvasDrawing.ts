// src/components/CanvasComponent/hooks/useCanvasDrawing.ts - 効果線描画統合版
import { RefObject, useEffect } from 'react';
import { Panel, Character, SpeechBubble, BackgroundElement, EffectElement, SnapSettings } from '../../../types';
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
  backgrounds: BackgroundElement[];
  selectedBackground?: BackgroundElement | null;
  // 🆕 効果線関連追加
  effects: EffectElement[];
  selectedEffect?: EffectElement | null;
  isPanelEditMode: boolean;
  snapSettings: SnapSettings;
}

/**
 * Canvas描画処理を管理するカスタムhook（効果線描画対応版）
 * 描画順序: 背景色 → グリッド → パネル → 背景要素 → 効果線 → 吹き出し → キャラクター → UI要素
 */
export const useCanvasDrawing = ({
  canvasRef,
  state,
  panels,
  characters,
  speechBubbles,
  backgrounds,
  selectedBackground,
  // 🆕 効果線データ
  effects,
  selectedEffect,
  isPanelEditMode,
  snapSettings,
}: CanvasDrawingHookProps) => {

  /**
   * 背景を描画（パネル内で zIndex 順）
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
   * 🆕 効果線を描画（パネル内で zIndex 順）
   */
  const drawEffects = (ctx: CanvasRenderingContext2D) => {
    panels.forEach(panel => {
      // 各パネルの効果線要素を取得（zIndex順にソート）
      const panelEffects = effects
        .filter(effect => effect.panelId === panel.id)
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

      // パネル内の効果線を順番に描画
      panelEffects.forEach(effect => {
        const isSelected = selectedEffect?.id === effect.id;
        
        drawSingleEffect(ctx, effect, panel, isSelected);
      });
    });
  };

  /**
   * 🆕 単一効果線の描画関数
   */
  const drawSingleEffect = (
    ctx: CanvasRenderingContext2D,
    effect: EffectElement,
    panel: Panel,
    isSelected: boolean
  ) => {
    // パネル内の絶対座標を計算
    const absoluteX = panel.x + effect.x * panel.width;
    const absoluteY = panel.y + effect.y * panel.height;
    const absoluteWidth = effect.width * panel.width;
    const absoluteHeight = effect.height * panel.height;

    ctx.save();
    ctx.globalAlpha = effect.opacity;

    // 効果線のタイプ別描画
    switch (effect.type) {
      case 'speed':
        drawSpeedLines(ctx, effect, absoluteX, absoluteY, absoluteWidth, absoluteHeight);
        break;
      case 'focus':
        drawFocusLines(ctx, effect, absoluteX, absoluteY, absoluteWidth, absoluteHeight);
        break;
      case 'explosion':
        drawExplosionLines(ctx, effect, absoluteX, absoluteY, absoluteWidth, absoluteHeight);
        break;
      case 'flash':
        drawFlashLines(ctx, effect, absoluteX, absoluteY, absoluteWidth, absoluteHeight);
        break;
    }

    ctx.restore();

    // 選択状態の描画
    if (isSelected) {
      drawEffectSelection(ctx, absoluteX, absoluteY, absoluteWidth, absoluteHeight);
    }
  };

  /**
   * 🆕 スピード線描画
   */
  const drawSpeedLines = (
    ctx: CanvasRenderingContext2D,
    effect: EffectElement,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    ctx.strokeStyle = effect.color;
    ctx.lineWidth = Math.max(0.5, effect.intensity * 2);

    const lineCount = Math.floor(effect.density * 30);
    const lineLength = effect.length * Math.min(width, height) * 0.3;

    for (let i = 0; i < lineCount; i++) {
      let x1, y1, x2, y2;

      if (effect.direction === 'horizontal') {
        // 水平線
        y1 = y + Math.random() * height;
        x1 = x + Math.random() * (width - lineLength);
        x2 = x1 + lineLength;
        y2 = y1;
      } else if (effect.direction === 'vertical') {
        // 垂直線
        x1 = x + Math.random() * width;
        y1 = y + Math.random() * (height - lineLength);
        x2 = x1;
        y2 = y1 + lineLength;
      } else {
        // カスタム角度
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const randomX = x + Math.random() * width;
        const randomY = y + Math.random() * height;
        
        const angleRad = (effect.angle * Math.PI) / 180;
        const halfLength = lineLength / 2;
        
        x1 = randomX - Math.cos(angleRad) * halfLength;
        y1 = randomY - Math.sin(angleRad) * halfLength;
        x2 = randomX + Math.cos(angleRad) * halfLength;
        y2 = randomY + Math.sin(angleRad) * halfLength;
      }

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  };

  /**
   * 🆕 集中線描画
   */
  const drawFocusLines = (
    ctx: CanvasRenderingContext2D,
    effect: EffectElement,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    ctx.strokeStyle = effect.color;

    const lineCount = Math.floor(effect.density * 40);
    const centerX = effect.centerX ? x + effect.centerX * width : x + width / 2;
    const centerY = effect.centerY ? y + effect.centerY * height : y + height / 2;
    const maxRadius = Math.max(width, height) / 2 * effect.length;

    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * 2 * Math.PI;
      const radius = maxRadius * (0.7 + Math.random() * 0.3);
      
      const x1 = centerX + Math.cos(angle) * (maxRadius * 0.1);
      const y1 = centerY + Math.sin(angle) * (maxRadius * 0.1);
      const x2 = centerX + Math.cos(angle) * radius;
      const y2 = centerY + Math.sin(angle) * radius;

      // 中心が太く外側が細い
      const lineWidth = Math.max(0.3, effect.intensity * 3 * (1 - radius / maxRadius));
      ctx.lineWidth = lineWidth;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  };

  /**
   * 🆕 爆発線描画
   */
  const drawExplosionLines = (
    ctx: CanvasRenderingContext2D,
    effect: EffectElement,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    ctx.strokeStyle = effect.color;
    ctx.lineWidth = Math.max(0.5, effect.intensity * 3);

    const lineCount = Math.floor(effect.density * 50);
    const centerX = effect.centerX ? x + effect.centerX * width : x + width / 2;
    const centerY = effect.centerY ? y + effect.centerY * height : y + height / 2;
    const maxRadius = Math.max(width, height) / 2 * effect.length;

    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * 2 * Math.PI;
      const radius = maxRadius * (0.8 + Math.random() * 0.2);
      
      const x1 = centerX + Math.cos(angle) * (maxRadius * 0.2);
      const y1 = centerY + Math.sin(angle) * (maxRadius * 0.2);
      const x2 = centerX + Math.cos(angle) * radius;
      const y2 = centerY + Math.sin(angle) * radius;

      ctx.globalAlpha = effect.opacity * (0.7 + Math.random() * 0.3);
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  };

  /**
   * 🆕 フラッシュ線描画
   */
  const drawFlashLines = (
    ctx: CanvasRenderingContext2D,
    effect: EffectElement,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    ctx.strokeStyle = effect.color;
    ctx.lineWidth = Math.max(0.2, effect.intensity * 1.5);

    const lineCount = Math.floor(effect.density * 60);
    const centerX = effect.centerX ? x + effect.centerX * width : x + width / 2;
    const centerY = effect.centerY ? y + effect.centerY * height : y + height / 2;
    const maxRadius = Math.max(width, height) / 2 * effect.length;

    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * 2 * Math.PI;
      const radius = maxRadius * (0.9 + Math.random() * 0.1);
      
      const x1 = centerX;
      const y1 = centerY;
      const x2 = centerX + Math.cos(angle) * radius;
      const y2 = centerY + Math.sin(angle) * radius;

      ctx.globalAlpha = effect.opacity * (0.5 + Math.random() * 0.5);
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  };

  /**
   * 🆕 効果線選択状態の描画
   */
  const drawEffectSelection = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    ctx.save();
    ctx.globalAlpha = 0.8;
    
    // 選択枠
    ctx.strokeStyle = '#007AFF';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(x, y, width, height);
    
    // リサイズハンドル
    const handleSize = 8;
    const handles = [
      { x: x - handleSize/2, y: y - handleSize/2 }, // 左上
      { x: x + width - handleSize/2, y: y - handleSize/2 }, // 右上
      { x: x - handleSize/2, y: y + height - handleSize/2 }, // 左下
      { x: x + width - handleSize/2, y: y + height - handleSize/2 }, // 右下
    ];
    
    ctx.setLineDash([]);
    ctx.fillStyle = '#007AFF';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    
    handles.forEach(handle => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
      ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
    });
    
    ctx.restore();
  };

  /**
   * 選択された背景のハンドルを描画
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
   * Canvas描画関数（効果線描画統合版）
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
      
      // 5. 背景要素描画（パネル内で zIndex 順）
      drawBackgrounds(ctx);
      
      // 🆕 6. 効果線描画（背景の後、吹き出しの前）
      drawEffects(ctx);
      
      // 7. 吹き出し描画
      BubbleRenderer.drawBubbles(ctx, speechBubbles, panels, state.selectedBubble);
      
      // 8. キャラクター描画
      CharacterRenderer.drawCharacters(ctx, characters, panels, state.selectedCharacter);

      // 9. スナップライン描画
      if (state.snapLines.length > 0) {
        CanvasDrawing.drawSnapLines(ctx, state.snapLines, isDarkMode);
      }

      // 10. 背景ハンドル描画
      drawBackgroundHandles(ctx);

      console.log("✅ Canvas描画完了（効果線対応）");
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
   * 描画トリガー監視useEffect（効果線対応版）
   */
  useEffect(() => {
    drawCanvas();
    console.log("🔄 描画トリガー:", {
      panelsCount: panels.length,
      charactersCount: characters.length,
      bubblesCount: speechBubbles.length,
      backgroundsCount: backgrounds.length,
      effectsCount: effects.length, // 🆕 効果線数追加
      selectedPanel: state.selectedPanel?.id,
      selectedCharacter: state.selectedCharacter?.name,
      selectedBubble: state.selectedBubble?.text?.substring(0, 10),
      selectedBackground: selectedBackground?.type,
      selectedEffect: selectedEffect?.type, // 🆕 選択された効果線
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
    backgrounds.length,
    selectedBackground,
    effects.length, // 🆕 効果線の長さ監視
    selectedEffect, // 🆕 選択された効果線監視
    isPanelEditMode,
    state.snapLines.length,
    showGrid,
    snapSettings.gridSize,
    snapSettings.gridDisplay,
    // JSON.stringify も効果線対応
    JSON.stringify(panels.map(p => ({ id: p.id, x: p.x, y: p.y, width: p.width, height: p.height }))),
    JSON.stringify(characters.map(c => ({ id: c.id, x: c.x, y: c.y, scale: c.scale, width: c.width, height: c.height }))),
    JSON.stringify(speechBubbles.map(b => ({ id: b.id, x: b.x, y: b.y, width: b.width, height: b.height }))),
    JSON.stringify(backgrounds.map(bg => ({ id: bg.id, panelId: bg.panelId, type: bg.type, x: bg.x, y: bg.y, width: bg.width, height: bg.height, opacity: bg.opacity }))),
    JSON.stringify(effects.map(effect => ({ id: effect.id, panelId: effect.panelId, type: effect.type, x: effect.x, y: effect.y, width: effect.width, height: effect.height, opacity: effect.opacity }))), // 🆕 効果線データ監視
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