// src/components/CanvasComponent/hooks/useCanvasDrawing.ts - ToneRenderer統合修正版
import { RefObject, useEffect } from 'react';
import { Panel, Character, SpeechBubble, BackgroundElement, EffectElement, ToneElement, SnapSettings } from '../../../types';
import { CanvasState } from './useCanvasState';
import { CanvasDrawing } from '../../CanvasArea/CanvasDrawing';
import { BubbleRenderer } from '../../CanvasArea/renderers/BubbleRenderer';
import { CharacterRenderer } from '../../CanvasArea/renderers/CharacterRenderer/CharacterRenderer';
import { BackgroundRenderer } from '../../CanvasArea/renderers/BackgroundRenderer';
import { ToneRenderer } from '../../CanvasArea/renderers/ToneRenderer'; // 🆕 ToneRenderer追加

// 1. インターフェース修正 - getCharacterDisplayNameを追加
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
  // 🆕 トーン関連追加
  tones: ToneElement[];
  selectedTone?: ToneElement | null;
  isPanelEditMode: boolean;
  snapSettings: SnapSettings;
  // 🆕 キャラクター名前取得関数を追加
  getCharacterDisplayName?: (character: Character) => string;
}

/**
 * Canvas描画処理を管理するカスタムhook（効果線+トーン描画対応版）
 * 描画順序: 背景色 → グリッド → パネル → 背景要素 → トーン → 効果線 → 吹き出し → キャラクター → UI要素
 */
// 2. useCanvasDrawing関数の引数に追加
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
  // 🆕 トーンデータ
  tones,
  selectedTone,
  isPanelEditMode,
  snapSettings,
  getCharacterDisplayName, // 🆕 追加
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
   * 🆕 トーンを描画（背景の後、効果線の前）- ToneRenderer使用
   */
  const drawTones = (ctx: CanvasRenderingContext2D) => {
    panels.forEach(panel => {
      // 各パネルのトーン要素を取得（zIndex順にソート）
      const panelTones = tones
        .filter(tone => tone.panelId === panel.id && tone.visible)
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

      // パネル内のトーンを順番に描画（ToneRenderer使用）
      panelTones.forEach(tone => {
        const isSelected = selectedTone?.id === tone.id;
        
        // ✅ ToneRenderer.renderToneを使用（正しい実装）
        ToneRenderer.renderTone(ctx, tone, panel, isSelected);
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
   * 🆕 スピード線描画（コマ全体・端から自然に）
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

    const lineCount = Math.floor(effect.density * 50);
    const baseLength = Math.min(width, height) * effect.length * 0.6;

    // コマ枠内にクリッピング
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();

    for (let i = 0; i < lineCount; i++) {
      let x1, y1, x2, y2;

      if (effect.direction === 'horizontal') {
        // 水平線 - 左右の端から
        const isFromLeft = Math.random() > 0.5;
        const yPos = y + height * 0.1 + Math.random() * height * 0.8; // 端を避ける
        const lineLength = baseLength * (0.4 + Math.random() * 0.6);
        
        if (isFromLeft) {
          // 左端から右へ
          x1 = x - lineLength * 0.3; // 少し枠外から開始
          x2 = x1 + lineLength;
        } else {
          // 右端から左へ
          x1 = x + width + lineLength * 0.3; // 少し枠外から開始
          x2 = x1 - lineLength;
        }
        y1 = y2 = yPos;
      } else if (effect.direction === 'vertical') {
        // 垂直線 - 上下の端から
        const isFromTop = Math.random() > 0.5;
        const xPos = x + width * 0.1 + Math.random() * width * 0.8; // 端を避ける
        const lineLength = baseLength * (0.4 + Math.random() * 0.6);
        
        if (isFromTop) {
          // 上端から下へ
          y1 = y - lineLength * 0.3; // 少し枠外から開始
          y2 = y1 + lineLength;
        } else {
          // 下端から上へ
          y1 = y + height + lineLength * 0.3; // 少し枠外から開始
          y2 = y1 - lineLength;
        }
        x1 = x2 = xPos;
      } else {
        // カスタム角度 - 角度に応じた端から
        const angleRad = (effect.angle * Math.PI) / 180;
        const lineLength = baseLength * (0.5 + Math.random() * 0.5);
        
        // 角度の向きに応じて開始位置を決定
        let startX, startY;
        const normalizedAngle = ((effect.angle % 360) + 360) % 360;
        
        if (normalizedAngle >= 315 || normalizedAngle < 45) {
          // 右向き - 左端から
          startX = x - 20 + Math.random() * 40;
          startY = y + Math.random() * height;
        } else if (normalizedAngle >= 45 && normalizedAngle < 135) {
          // 下向き - 上端から
          startX = x + Math.random() * width;
          startY = y - 20 + Math.random() * 40;
        } else if (normalizedAngle >= 135 && normalizedAngle < 225) {
          // 左向き - 右端から
          startX = x + width - 20 + Math.random() * 40;
          startY = y + Math.random() * height;
        } else {
          // 上向き - 下端から
          startX = x + Math.random() * width;
          startY = y + height - 20 + Math.random() * 40;
        }
        
        x1 = startX;
        y1 = startY;
        x2 = startX + Math.cos(angleRad) * lineLength;
        y2 = startY + Math.sin(angleRad) * lineLength;
      }

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    
    ctx.restore();
  };

  /**
   * 🆕 集中線描画（コマ全体・四隅からの放射）
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

    const lineCount = Math.floor(effect.density * 60);
    // 集中点を設定（デフォルトは中央だが端寄りも可能）
    const focusX = x + width * (effect.centerX || 0.5);
    const focusY = y + height * (effect.centerY || 0.5);

    // コマ枠内にクリッピング
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();

    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * 2 * Math.PI;
      
      // 焦点から線を伸ばす方向のコマ端を計算
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      
      // 焦点からコマ端までの距離を計算
      let endX, endY;
      const t1 = cos > 0 ? (x + width - focusX) / cos : cos < 0 ? (x - focusX) / cos : Infinity;
      const t2 = sin > 0 ? (y + height - focusY) / sin : sin < 0 ? (y - focusY) / sin : Infinity;
      const t = Math.min(Math.abs(t1), Math.abs(t2)) * effect.length;
      
      endX = focusX + cos * t;
      endY = focusY + sin * t;
      
      // 焦点近くの開始点
      const startRadius = Math.min(width, height) * 0.05;
      const startX = focusX + cos * startRadius;
      const startY = focusY + sin * startRadius;

      // 距離に応じて線の太さを調整（中心が太く端が細い）
      const distance = Math.sqrt((endX - focusX) ** 2 + (endY - focusY) ** 2);
      const maxDistance = Math.sqrt(width ** 2 + height ** 2) / 2;
      const lineWidth = Math.max(0.3, effect.intensity * 3 * (1 - distance / maxDistance));
      ctx.lineWidth = lineWidth;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    ctx.restore();
  };

  /**
   * 🆕 爆発線描画（コマ全体・中心からの激しい放射）
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

    const lineCount = Math.floor(effect.density * 80);
    const centerX = x + width * (effect.centerX || 0.5);
    const centerY = y + height * (effect.centerY || 0.5);

    // コマ枠内にクリッピング
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();

    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * 2 * Math.PI;
      
      // より激しく不規則な爆発線
      const randomFactor = 0.7 + Math.random() * 0.6;
      const cos = Math.cos(angle) * randomFactor;
      const sin = Math.sin(angle) * randomFactor;
      
      // 中心からコマ端を超えて伸びる線
      const baseLength = Math.max(width, height) * effect.length;
      const length = baseLength * (0.8 + Math.random() * 0.5);
      
      const startRadius = Math.min(width, height) * 0.1 * Math.random();
      const x1 = centerX + cos * startRadius;
      const y1 = centerY + sin * startRadius;
      const x2 = centerX + cos * length;
      const y2 = centerY + sin * length;

      ctx.globalAlpha = effect.opacity * (0.6 + Math.random() * 0.4);
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.restore();
  };

  /**
   * 🆕 フラッシュ線描画（コマ全体・十字＋斜めの主要光線）
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

    const centerX = x + width * (effect.centerX || 0.5);
    const centerY = y + height * (effect.centerY || 0.5);

    // コマ枠内にクリッピング
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();

    // 主要な8方向の強い光線
    const mainDirections = [0, 45, 90, 135, 180, 225, 270, 315];
    mainDirections.forEach((angle) => {
      const angleRad = (angle * Math.PI) / 180;
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);
      
      // コマ端まで伸びる長い光線
      const length = Math.max(width, height) * effect.length * 1.2;
      const x2 = centerX + cos * length;
      const y2 = centerY + sin * length;
      
      ctx.globalAlpha = effect.opacity * 0.9;
      ctx.lineWidth = Math.max(1, effect.intensity * 3);
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    // 追加の細かい光線
    const subLineCount = Math.floor(effect.density * 40);
    for (let i = 0; i < subLineCount; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const length = Math.max(width, height) * effect.length * (0.3 + Math.random() * 0.4);
      const x2 = centerX + Math.cos(angle) * length;
      const y2 = centerY + Math.sin(angle) * length;

      ctx.globalAlpha = effect.opacity * (0.2 + Math.random() * 0.3);
      ctx.lineWidth = Math.max(0.5, effect.intensity * 1);
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.restore();
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
   * Canvas描画関数（効果線+トーン描画統合版）
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
      
      // 🆕 6. トーン描画（背景の後、効果線の前）- ToneRenderer使用
      drawTones(ctx);
      
      // 🆕 7. 効果線描画（トーンの後、吹き出しの前）
      drawEffects(ctx);
      
      // 8. 吹き出し描画
      BubbleRenderer.drawBubbles(ctx, speechBubbles, panels, state.selectedBubble);
      
      // 🔧 9. キャラクター描画 - getCharacterDisplayName を渡す
      CharacterRenderer.drawCharacters(ctx, characters, panels, state.selectedCharacter, getCharacterDisplayName);

      // 10. スナップライン描画
      if (state.snapLines.length > 0) {
        CanvasDrawing.drawSnapLines(ctx, state.snapLines, isDarkMode);
      }

      // 11. 背景ハンドル描画
      drawBackgroundHandles(ctx);

      console.log("✅ Canvas描画完了（効果線+トーン対応）");
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
   * 描画トリガー監視useEffect（効果線+トーン対応版）
   */
  useEffect(() => {
    drawCanvas();
    console.log("🔄 描画トリガー:", {
      panelsCount: panels.length,
      charactersCount: characters.length,
      bubblesCount: speechBubbles.length,
      backgroundsCount: backgrounds.length,
      effectsCount: effects.length, // 🆕 効果線数追加
      tonesCount: tones.length, // 🆕 トーン数追加
      selectedPanel: state.selectedPanel?.id,
      selectedCharacter: state.selectedCharacter?.name,
      selectedBubble: state.selectedBubble?.text?.substring(0, 10),
      selectedBackground: selectedBackground?.type,
      selectedEffect: selectedEffect?.type, // 🆕 選択された効果線
      selectedTone: selectedTone?.type, // 🆕 選択されたトーン
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
    tones.length, // 🆕 トーンの長さ監視
    selectedTone, // 🆕 選択されたトーン監視
    isPanelEditMode,
    state.snapLines.length,
    showGrid,
    snapSettings.gridSize,
    snapSettings.gridDisplay,
    // JSON.stringify も効果線+トーン対応
    JSON.stringify(panels.map(p => ({ id: p.id, x: p.x, y: p.y, width: p.width, height: p.height }))),
    JSON.stringify(characters.map(c => ({ id: c.id, x: c.x, y: c.y, scale: c.scale, width: c.width, height: c.height }))),
    JSON.stringify(speechBubbles.map(b => ({ id: b.id, x: b.x, y: b.y, width: b.width, height: b.height }))),
    JSON.stringify(backgrounds.map(bg => ({ id: bg.id, panelId: bg.panelId, type: bg.type, x: bg.x, y: bg.y, width: bg.width, height: bg.height, opacity: bg.opacity }))),
    JSON.stringify(effects.map(effect => ({ id: effect.id, panelId: effect.panelId, type: effect.type, x: effect.x, y: effect.y, width: effect.width, height: effect.height, opacity: effect.opacity }))), // 🆕 効果線データ監視
    JSON.stringify(tones.map(tone => ({ id: tone.id, panelId: tone.panelId, type: tone.type, x: tone.x, y: tone.y, width: tone.width, height: tone.height, opacity: tone.opacity }))), // 🆕 トーンデータ監視
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