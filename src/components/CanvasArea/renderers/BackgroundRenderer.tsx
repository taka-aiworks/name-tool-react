// src/components/CanvasArea/renderers/BackgroundRenderer.tsx
import React from 'react';
import { BackgroundElement, BackgroundRendererProps, BackgroundHandle } from '../../../types';

export class BackgroundRenderer {
  /**
   * 背景要素を描画
   */
  static renderBackground(
    ctx: CanvasRenderingContext2D,
    background: BackgroundElement,
    panelBounds: { x: number; y: number; width: number; height: number },
    isSelected: boolean = false
  ): void {
    ctx.save();
    
    // 絶対座標に変換
    const x = panelBounds.x + (background.x * panelBounds.width);
    const y = panelBounds.y + (background.y * panelBounds.height);
    const width = background.width * panelBounds.width;
    const height = background.height * panelBounds.height;
    
    // 回転処理
    if (background.rotation !== 0) {
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((background.rotation * Math.PI) / 180);
      ctx.translate(-width / 2, -height / 2);
    } else {
      ctx.translate(x, y);
    }
    
    // 透明度設定
    ctx.globalAlpha = background.opacity;
    
    // 背景タイプ別描画
    switch (background.type) {
      case 'solid':
        this.drawSolid(ctx, background, width, height);
        break;
      case 'gradient':
        this.drawGradient(ctx, background, width, height);
        break;
      case 'pattern':
        this.drawPattern(ctx, background, width, height);
        break;
      case 'image':
        this.drawImage(ctx, background, width, height);
        break;
    }
    
    // 選択状態の表示
    if (isSelected) {
      this.drawSelectionBorder(ctx, width, height);
    }
    
    ctx.restore();
  }
  
  /**
   * 単色背景を描画
   */
  private static drawSolid(
    ctx: CanvasRenderingContext2D,
    background: BackgroundElement,
    width: number,
    height: number
  ): void {
    ctx.fillStyle = background.solidColor || '#CCCCCC';
    ctx.fillRect(0, 0, width, height);
  }
  
  /**
   * グラデーション背景を描画
   */
  private static drawGradient(
    ctx: CanvasRenderingContext2D,
    background: BackgroundElement,
    width: number,
    height: number
  ): void {
    let gradient: CanvasGradient;
    
    if (background.gradientType === 'radial') {
      gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.min(width, height) / 2
      );
    } else {
      // linear gradient
      const angle = (background.gradientDirection || 0) * (Math.PI / 180);
      const x1 = width * 0.5 + Math.cos(angle + Math.PI) * width * 0.5;
      const y1 = height * 0.5 + Math.sin(angle + Math.PI) * height * 0.5;
      const x2 = width * 0.5 + Math.cos(angle) * width * 0.5;
      const y2 = height * 0.5 + Math.sin(angle) * height * 0.5;
      
      gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    }
    
    // グラデーション色設定
    const colors = background.gradientColors || ['#FFFFFF', '#CCCCCC'];
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color);
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  
  /**
   * パターン背景を描画
   */
  private static drawPattern(
    ctx: CanvasRenderingContext2D,
    background: BackgroundElement,
    width: number,
    height: number
  ): void {
    const patternColor = background.patternColor || '#000000';
    const patternSize = background.patternSize || 5;
    const spacing = background.patternSpacing || 10;
    
    ctx.strokeStyle = patternColor;
    ctx.fillStyle = patternColor;
    ctx.lineWidth = patternSize;
    
    switch (background.patternType) {
      case 'dots':
        this.drawDotsPattern(ctx, width, height, patternSize, spacing);
        break;
      case 'lines':
        this.drawLinesPattern(ctx, width, height, spacing, 'horizontal');
        break;
      case 'grid':
        this.drawGridPattern(ctx, width, height, spacing);
        break;
      case 'diagonal':
        this.drawDiagonalPattern(ctx, width, height, spacing);
        break;
      case 'crosshatch':
        this.drawCrosshatchPattern(ctx, width, height, spacing);
        break;
    }
  }
  
  /**
   * 画像背景を描画（将来実装予定）
   */
  private static drawImage(
    ctx: CanvasRenderingContext2D,
    background: BackgroundElement,
    width: number,
    height: number
  ): void {
    // TODO: 画像読み込みと描画
    // 現在は仮の灰色で表示
    ctx.fillStyle = '#E0E0E0';
    ctx.fillRect(0, 0, width, height);
    
    // 「画像」テキスト表示
    ctx.fillStyle = '#666666';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('画像', width / 2, height / 2);
  }
  
  /**
   * パターン描画: ドット
   */
  private static drawDotsPattern(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dotSize: number,
    spacing: number
  ): void {
    for (let x = spacing / 2; x < width; x += spacing) {
      for (let y = spacing / 2; y < height; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, dotSize / 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
  
  /**
   * パターン描画: 線
   */
  private static drawLinesPattern(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    spacing: number,
    direction: 'horizontal' | 'vertical'
  ): void {
    ctx.beginPath();
    
    if (direction === 'horizontal') {
      for (let y = spacing; y < height; y += spacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
    } else {
      for (let x = spacing; x < width; x += spacing) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
    }
    
    ctx.stroke();
  }
  
  /**
   * パターン描画: グリッド
   */
  private static drawGridPattern(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    spacing: number
  ): void {
    this.drawLinesPattern(ctx, width, height, spacing, 'horizontal');
    this.drawLinesPattern(ctx, width, height, spacing, 'vertical');
  }
  
  /**
   * パターン描画: 斜線
   */
  private static drawDiagonalPattern(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    spacing: number
  ): void {
    ctx.beginPath();
    
    // 右上がり斜線
    for (let i = -height; i < width; i += spacing) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
    }
    
    ctx.stroke();
  }
  
  /**
   * パターン描画: クロスハッチ
   */
  private static drawCrosshatchPattern(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    spacing: number
  ): void {
    ctx.beginPath();
    
    // 右上がり斜線
    for (let i = -height; i < width; i += spacing) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
    }
    
    // 左上がり斜線
    for (let i = 0; i < width + height; i += spacing) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i - height, height);
    }
    
    ctx.stroke();
  }
  
  /**
   * 選択境界線を描画
   */
  private static drawSelectionBorder(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    ctx.strokeStyle = '#FF8833';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(0, 0, width, height);
    ctx.setLineDash([]);
  }
  
  /**
   * 背景操作用ハンドルを描画
   */
  static drawBackgroundHandles(
    ctx: CanvasRenderingContext2D,
    background: BackgroundElement,
    panelBounds: { x: number; y: number; width: number; height: number }
  ): BackgroundHandle[] {
    const x = panelBounds.x + (background.x * panelBounds.width);
    const y = panelBounds.y + (background.y * panelBounds.height);
    const width = background.width * panelBounds.width;
    const height = background.height * panelBounds.height;
    
    const handles: BackgroundHandle[] = [];
    const handleSize = 8;
    
    // リサイズハンドル（8方向）
    const positions = [
      { dir: 'nw', x: x - handleSize/2, y: y - handleSize/2 },
      { dir: 'n', x: x + width/2 - handleSize/2, y: y - handleSize/2 },
      { dir: 'ne', x: x + width - handleSize/2, y: y - handleSize/2 },
      { dir: 'e', x: x + width - handleSize/2, y: y + height/2 - handleSize/2 },
      { dir: 'se', x: x + width - handleSize/2, y: y + height - handleSize/2 },
      { dir: 's', x: x + width/2 - handleSize/2, y: y + height - handleSize/2 },
      { dir: 'sw', x: x - handleSize/2, y: y + height - handleSize/2 },
      { dir: 'w', x: x - handleSize/2, y: y + height/2 - handleSize/2 }
    ];
    
    positions.forEach(pos => {
      ctx.fillStyle = '#FF8833';
      ctx.fillRect(pos.x, pos.y, handleSize, handleSize);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(pos.x, pos.y, handleSize, handleSize);
      
      handles.push({
        type: 'resize',
        direction: pos.dir as any,
        x: pos.x + handleSize/2,
        y: pos.y + handleSize/2
      });
    });
    
    // 移動ハンドル（中央）
    const centerX = x + width/2;
    const centerY = y + height/2;
    ctx.fillStyle = '#0066FF';
    ctx.beginPath();
    ctx.arc(centerX, centerY, handleSize/2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    handles.push({
      type: 'move',
      x: centerX,
      y: centerY
    });
    
    return handles;
  }
}

export default BackgroundRenderer;