// src/components/CanvasArea/renderers/ToneRenderer.tsx - パフォーマンス最適化版
import React from 'react';
import { ToneElement, Panel } from '../../../types';

/**
 * 漫画制作用トーン描画エンジン（パフォーマンス最適化版）
 * 重い処理を軽量化・無限ループ防止・描画制限
 */
export class ToneRenderer {
  
  /**
   * 単一トーンを描画（メイン関数）- パフォーマンス最適化版
   */
  static renderTone(
    ctx: CanvasRenderingContext2D,
    tone: ToneElement,
    panel: Panel,
    isSelected: boolean = false
  ): void {
    // パネル内の絶対座標を計算
    const absoluteX = panel.x + tone.x * panel.width;
    const absoluteY = panel.y + tone.y * panel.height;
    const absoluteWidth = tone.width * panel.width;
    const absoluteHeight = tone.height * panel.height;

    // 非表示または範囲外の場合は描画しない
    if (!tone.visible || absoluteWidth <= 0 || absoluteHeight <= 0) return;

    // 🚀 サイズ制限（パフォーマンス保護）
    const MAX_AREA = 50000; // 最大描画エリア
    if (absoluteWidth * absoluteHeight > MAX_AREA) {
      console.warn("⚠️ トーン描画エリアが大きすぎます。軽量描画モードに切り替えます。");
      this.renderSimpleTone(ctx, tone, panel, absoluteX, absoluteY, absoluteWidth, absoluteHeight);
      if (isSelected) {
        this.drawToneSelectionClipped(ctx, tone, panel, absoluteX, absoluteY, absoluteWidth, absoluteHeight);
      }
      return;
    }

    ctx.save();

    // パネル内にクリッピング
    ctx.beginPath();
    ctx.rect(panel.x, panel.y, panel.width, panel.height);
    ctx.clip();

    // ブレンドモード設定
    this.applyBlendMode(ctx, tone.blendMode);

    // グローバル透明度設定
    ctx.globalAlpha = Math.max(0.1, Math.min(1.0, tone.opacity));

    // トーンタイプ別描画（軽量版）
    switch (tone.type) {
      case 'halftone':
        this.renderHalftoneOptimized(ctx, tone, absoluteX, absoluteY, absoluteWidth, absoluteHeight);
        break;
      case 'gradient':
        this.renderGradientOptimized(ctx, tone, absoluteX, absoluteY, absoluteWidth, absoluteHeight);
        break;
      case 'crosshatch':
        this.renderCrosshatchOptimized(ctx, tone, absoluteX, absoluteY, absoluteWidth, absoluteHeight);
        break;
      case 'dots':
        this.renderDotsOptimized(ctx, tone, absoluteX, absoluteY, absoluteWidth, absoluteHeight);
        break;
      case 'lines':
        this.renderLinesOptimized(ctx, tone, absoluteX, absoluteY, absoluteWidth, absoluteHeight);
        break;
      case 'noise':
        this.renderNoiseOptimized(ctx, tone, absoluteX, absoluteY, absoluteWidth, absoluteHeight);
        break;
      default:
        this.renderSimpleTone(ctx, tone, panel, absoluteX, absoluteY, absoluteWidth, absoluteHeight);
        break;
    }

    ctx.restore();

    // 選択状態の描画
    if (isSelected) {
      this.drawToneSelectionClipped(ctx, tone, panel, absoluteX, absoluteY, absoluteWidth, absoluteHeight);
    }
  }

  /**
   * 🚀 簡易トーン描画（超軽量版）
   */
  private static renderSimpleTone(
    ctx: CanvasRenderingContext2D,
    tone: ToneElement,
    panel: Panel,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    ctx.save();
    ctx.globalAlpha = tone.opacity * 0.3;
    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(x, y, width, height);
    
    // 簡易パターン表示
    ctx.globalAlpha = tone.opacity * 0.6;
    ctx.strokeStyle = '#999999';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(x, y, width, height);
    
    ctx.restore();
  }

  /**
   * 🚀 網点トーン描画（最適化版）
   */
  private static renderHalftoneOptimized(
    ctx: CanvasRenderingContext2D,
    tone: ToneElement,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const density = Math.max(0.1, Math.min(1.0, tone.density));
    const scale = Math.max(0.5, Math.min(3.0, tone.scale || 1.0));
    
    // 🚀 最適化：スペーシングを制限
    const spacing = Math.max(3, Math.min(20, 8 * scale));
    const dotSize = Math.max(0.5, Math.min(spacing * 0.4, density * 4));
    
    ctx.save();
    ctx.fillStyle = tone.invert ? '#ffffff' : '#000000';
    
    // 🚀 描画範囲制限（無限ループ防止）
    const maxDots = 1000; // 最大ドット数
    let dotCount = 0;
    
    const startX = Math.floor(x / spacing) * spacing;
    const startY = Math.floor(y / spacing) * spacing;
    const endX = x + width;
    const endY = y + height;
    
    for (let px = startX; px < endX && dotCount < maxDots; px += spacing) {
      for (let py = startY; py < endY && dotCount < maxDots; py += spacing) {
        // チェッカーボードパターンでオフセット
        const offsetX = ((Math.floor(py / spacing) % 2) === 0) ? 0 : spacing / 2;
        const dotX = px + offsetX;
        const dotY = py;
        
        // 範囲内チェック
        if (dotX >= x - dotSize && dotX <= endX + dotSize &&
            dotY >= y - dotSize && dotY <= endY + dotSize) {
          
          ctx.beginPath();
          ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
          ctx.fill();
          dotCount++;
        }
      }
    }
    
    ctx.restore();
  }

  /**
   * 🚀 グラデーション描画（最適化版）
   */
  private static renderGradientOptimized(
    ctx: CanvasRenderingContext2D,
    tone: ToneElement,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    ctx.save();

    let gradient: CanvasGradient;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // 簡素化されたグラデーション
    gradient = ctx.createLinearGradient(x, y, x + width, y + height);

    // グラデーション色設定
    const baseOpacity = Math.max(0.1, Math.min(1.0, tone.density));
    const startColor = tone.invert ? 
      `rgba(255, 255, 255, ${baseOpacity})` : 
      `rgba(0, 0, 0, ${baseOpacity})`;
    const endColor = tone.invert ? 
      `rgba(0, 0, 0, 0.1)` : 
      `rgba(255, 255, 255, 0.1)`;

    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
    
    ctx.restore();
  }

  /**
   * 🚀 クロスハッチング描画（最適化版）
   */
  private static renderCrosshatchOptimized(
    ctx: CanvasRenderingContext2D,
    tone: ToneElement,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    ctx.save();

    const density = Math.max(0.1, Math.min(1.0, tone.density));
    const spacing = Math.max(4, Math.min(15, 8 / density));
    const lineWidth = Math.max(0.5, Math.min(3, density * 2));
    
    ctx.strokeStyle = tone.invert ? '#ffffff' : '#000000';
    ctx.lineWidth = lineWidth;

    // 🚀 線数制限（パフォーマンス保護）
    const maxLines = 50;
    const lineCount = Math.min(maxLines, Math.floor((width + height) / spacing));
    
    // 斜線描画（45度のみ、簡素化）
    ctx.beginPath();
    for (let i = 0; i < lineCount; i++) {
      const offset = (i * spacing) - Math.max(width, height);
      const startX = x + offset;
      const startY = y;
      const endX = x + offset + Math.max(width, height);
      const endY = y + Math.max(width, height);
      
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
    }
    ctx.stroke();

    ctx.restore();
  }

  /**
   * 🚀 ドット描画（最適化版）
   */
  private static renderDotsOptimized(
    ctx: CanvasRenderingContext2D,
    tone: ToneElement,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const density = Math.max(0.1, Math.min(1.0, tone.density));
    const scale = Math.max(0.5, Math.min(2.0, tone.scale || 1.0));
    const spacing = Math.max(5, 15 * scale);
    const dotRadius = Math.max(1, density * 3);

    ctx.save();
    ctx.fillStyle = tone.invert ? '#ffffff' : '#000000';

    // 🚀 ドット数制限
    const maxDots = 500;
    let dotCount = 0;

    for (let px = x; px < x + width && dotCount < maxDots; px += spacing) {
      for (let py = y; py < y + height && dotCount < maxDots; py += spacing) {
        ctx.beginPath();
        ctx.arc(px, py, dotRadius, 0, Math.PI * 2);
        ctx.fill();
        dotCount++;
      }
    }

    ctx.restore();
  }

  /**
   * 🚀 ライン描画（最適化版）
   */
  private static renderLinesOptimized(
    ctx: CanvasRenderingContext2D,
    tone: ToneElement,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    ctx.save();

    const density = Math.max(0.1, Math.min(1.0, tone.density));
    const spacing = Math.max(3, 8 / density);
    const lineWidth = Math.max(0.3, density * 1.5);
    
    ctx.strokeStyle = tone.invert ? '#ffffff' : '#000000';
    ctx.lineWidth = lineWidth;

    // 🚀 線数制限
    const maxLines = 100;
    const lineCount = Math.min(maxLines, Math.floor(height / spacing));

    // 水平線のみ（簡素化）
    ctx.beginPath();
    for (let i = 0; i < lineCount; i++) {
      const y_pos = y + (i * spacing);
      if (y_pos <= y + height) {
        ctx.moveTo(x, y_pos);
        ctx.lineTo(x + width, y_pos);
      }
    }
    ctx.stroke();

    ctx.restore();
  }

  /**
   * 🚀 ノイズ描画（最適化版）
   */
  private static renderNoiseOptimized(
    ctx: CanvasRenderingContext2D,
    tone: ToneElement,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    ctx.save();

    const density = Math.max(0.1, Math.min(1.0, tone.density));
    const noiseSize = Math.max(1, 2 * (tone.scale || 1.0));

    ctx.fillStyle = tone.invert ? '#ffffff' : '#000000';

    // 🚀 パーティクル数を大幅制限（無限ループ防止）
    const maxParticles = Math.min(200, Math.floor(width * height * density * 0.001));
    
    for (let i = 0; i < maxParticles; i++) {
      const px = x + Math.random() * width;
      const py = y + Math.random() * height;
      const size = Math.max(0.5, noiseSize * (0.5 + Math.random() * 0.5));

      ctx.globalAlpha = tone.opacity * (0.3 + Math.random() * 0.4);
      
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * ブレンドモード適用（軽量版）
   */
  private static applyBlendMode(ctx: CanvasRenderingContext2D, blendMode: string): void {
    // 重いブレンドモードを制限
    switch (blendMode) {
      case 'multiply':
        ctx.globalCompositeOperation = 'multiply';
        break;
      case 'screen':
        ctx.globalCompositeOperation = 'screen';
        break;
      case 'normal':
      default:
        ctx.globalCompositeOperation = 'source-over';
        break;
    }
  }

  /**
   * 🔧 トーン選択状態の描画（パネル境界対応版）
   */
  // 6️⃣ drawToneSelectionClipped関数を以下に置き換え（パネル境界対応版）
private static drawToneSelectionClipped(
  ctx: CanvasRenderingContext2D,
  tone: ToneElement,
  panel: Panel,
  absoluteX: number,
  absoluteY: number,
  absoluteWidth: number,
  absoluteHeight: number
): void {
  ctx.save();
  
  // パネル境界でクリッピングされた選択領域を計算
  const clippedX = Math.max(absoluteX, panel.x);
  const clippedY = Math.max(absoluteY, panel.y);
  const clippedRight = Math.min(absoluteX + absoluteWidth, panel.x + panel.width);
  const clippedBottom = Math.min(absoluteY + absoluteHeight, panel.y + panel.height);
  const clippedWidth = clippedRight - clippedX;
  const clippedHeight = clippedBottom - clippedY;
  
  // クリッピングされた領域が有効な場合のみ描画
  if (clippedWidth > 0 && clippedHeight > 0) {
    ctx.globalAlpha = 0.8;
    
    // 選択枠（パネル境界内のみ）
    ctx.strokeStyle = '#00a8ff';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(clippedX, clippedY, clippedWidth, clippedHeight);
    
    // 🔧 改良版リサイズハンドル（パネル境界内のみ）
    const handleSize = 8;
    const handles = [
      { x: clippedX - handleSize/2, y: clippedY - handleSize/2, direction: 'nw' },
      { x: clippedRight - handleSize/2, y: clippedY - handleSize/2, direction: 'ne' },
      { x: clippedX - handleSize/2, y: clippedBottom - handleSize/2, direction: 'sw' },
      { x: clippedRight - handleSize/2, y: clippedBottom - handleSize/2, direction: 'se' },
    ];
    
    ctx.setLineDash([]);
    ctx.fillStyle = '#00a8ff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    
    // パネル境界内にあるハンドルのみ描画
    handles.forEach(handle => {
      const handleCenterX = handle.x + handleSize/2;
      const handleCenterY = handle.y + handleSize/2;
      
      // ハンドルの中心がパネル境界内にある場合のみ描画
      if (handleCenterX >= panel.x && handleCenterX <= panel.x + panel.width &&
          handleCenterY >= panel.y && handleCenterY <= panel.y + panel.height) {
        
        // さらにハンドル領域をパネル境界でクリッピング
        const handleClippedX = Math.max(handle.x, panel.x);
        const handleClippedY = Math.max(handle.y, panel.y);
        const handleClippedRight = Math.min(handle.x + handleSize, panel.x + panel.width);
        const handleClippedBottom = Math.min(handle.y + handleSize, panel.y + panel.height);
        const handleClippedWidth = handleClippedRight - handleClippedX;
        const handleClippedHeight = handleClippedBottom - handleClippedY;
        
        if (handleClippedWidth > 0 && handleClippedHeight > 0) {
          ctx.fillRect(handleClippedX, handleClippedY, handleClippedWidth, handleClippedHeight);
          ctx.strokeRect(handleClippedX, handleClippedY, handleClippedWidth, handleClippedHeight);
        }
      }
    });

    // 🆕 パネル境界表示（トーンがパネルをはみ出している場合）
    if (absoluteX < panel.x || absoluteY < panel.y || 
        absoluteX + absoluteWidth > panel.x + panel.width ||
        absoluteY + absoluteHeight > panel.y + panel.height) {
      
      // はみ出し警告テキスト
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = '#ff4444';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ パネル外', clippedX + clippedWidth/2, clippedY - 5);
    }
  }
  
  ctx.restore();
}

  /**
   * 複数トーンの一括描画（zIndex順）
   */
  static renderTones(
    ctx: CanvasRenderingContext2D,
    tones: ToneElement[],
    panels: Panel[],
    selectedTone: ToneElement | null = null
  ): void {
    // 🚀 トーン数制限（パフォーマンス保護）
    const MAX_TONES_PER_PANEL = 10;
    
    panels.forEach(panel => {
      // パネル内のトーンを取得してzIndex順にソート
      const panelTones = tones
        .filter(tone => tone.panelId === panel.id && tone.visible)
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
        .slice(0, MAX_TONES_PER_PANEL); // 🚀 トーン数制限

      // パネル内のトーンを順番に描画
      panelTones.forEach(tone => {
        const isSelected = selectedTone?.id === tone.id;
        this.renderTone(ctx, tone, panel, isSelected);
      });
    });
  }
}