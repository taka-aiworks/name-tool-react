// src/components/CanvasArea/renderers/ToneRenderer.tsx - トーン描画エンジン
import React from 'react';
import { ToneElement, Panel } from '../../../types';

/**
 * 漫画制作用トーン描画エンジン
 * SVGベース高性能レンダリング・ブレンドモード対応
 */
export class ToneRenderer {
  
  /**
   * 単一トーンを描画（メイン関数）
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

    // 非表示の場合は描画しない
    if (!tone.visible) return;

    ctx.save();

    // パネル内にクリッピング
    ctx.beginPath();
    ctx.rect(panel.x, panel.y, panel.width, panel.height);
    ctx.clip();

    // ブレンドモード設定
    this.applyBlendMode(ctx, tone.blendMode);

    // グローバル透明度設定
    ctx.globalAlpha = tone.opacity;

    // マスク適用（有効な場合）
    if (tone.maskEnabled) {
      this.applyMask(ctx, tone, absoluteX, absoluteY, absoluteWidth, absoluteHeight);
    }

    // トーンタイプ別描画
    switch (tone.type) {
      case 'halftone':
        this.renderHalftone(ctx, tone, absoluteX, absoluteY, absoluteWidth, absoluteHeight);
        break;
      case 'gradient':
        this.renderGradient(ctx, tone, absoluteX, absoluteY, absoluteWidth, absoluteHeight);
        break;
      case 'crosshatch':
        this.renderCrosshatch(ctx, tone, absoluteX, absoluteY, absoluteWidth, absoluteHeight);
        break;
      case 'dots':
        this.renderDots(ctx, tone, absoluteX, absoluteY, absoluteWidth, absoluteHeight);
        break;
      case 'lines':
        this.renderLines(ctx, tone, absoluteX, absoluteY, absoluteWidth, absoluteHeight);
        break;
      case 'noise':
        this.renderNoise(ctx, tone, absoluteX, absoluteY, absoluteWidth, absoluteHeight);
        break;
    }

    ctx.restore();

    // 選択状態の描画
    if (isSelected) {
      this.drawToneSelection(ctx, absoluteX, absoluteY, absoluteWidth, absoluteHeight);
    }
  }

  /**
   * 網点トーン描画（60線・85線・100線・120線・150線）
   */
  private static renderHalftone(
    ctx: CanvasRenderingContext2D,
    tone: ToneElement,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const lineFreq = this.getLineFrequency(tone.pattern);
    const dotSize = (tone.scale * tone.density * 4) / lineFreq;
    const spacing = 8 / lineFreq * tone.scale;

    ctx.save();
    
    // 回転変換
    if (tone.rotation !== 0) {
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((tone.rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
    }

    // コントラスト・明度調整
    this.applyColorAdjustments(ctx, tone);

    // 網点描画
    ctx.fillStyle = tone.invert ? '#ffffff' : '#000000';
    
    const startX = Math.floor(x / spacing) * spacing;
    const startY = Math.floor(y / spacing) * spacing;
    
    for (let px = startX; px < x + width + spacing; px += spacing) {
      for (let py = startY; py < y + height + spacing; py += spacing) {
        // チェッカーボードパターンでオフセット
        const offsetX = ((Math.floor(py / spacing) % 2) === 0) ? 0 : spacing / 2;
        const dotX = px + offsetX;
        const dotY = py;
        
        // 範囲内チェック
        if (dotX >= x - dotSize && dotX <= x + width + dotSize &&
            dotY >= y - dotSize && dotY <= y + height + dotSize) {
          
          // 網点サイズの微調整（自然なバリエーション）
          const variation = (Math.sin(dotX * 0.1) + Math.cos(dotY * 0.1)) * 0.1;
          const actualDotSize = Math.max(0.1, dotSize * (1 + variation));
          
          ctx.beginPath();
          ctx.arc(dotX, dotY, actualDotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    
    ctx.restore();
  }

  /**
   * グラデーション描画（線形・放射・ダイヤモンド）
   */
  private static renderGradient(
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

    switch (tone.pattern) {
      case 'gradient_linear':
        const angle = tone.rotation * Math.PI / 180;
        const length = Math.max(width, height);
        const x1 = centerX - Math.cos(angle) * length / 2;
        const y1 = centerY - Math.sin(angle) * length / 2;
        const x2 = centerX + Math.cos(angle) * length / 2;
        const y2 = centerY + Math.sin(angle) * length / 2;
        gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        break;

      case 'gradient_radial':
        const radius = Math.max(width, height) * tone.scale / 2;
        gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        break;

      case 'gradient_diamond':
      default:
        // ダイヤモンド形は放射グラデーションで近似
        const diagRadius = Math.sqrt(width * width + height * height) * tone.scale / 2;
        gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, diagRadius);
        break;
    }

    // グラデーション色設定
    const baseOpacity = tone.density;
    const startColor = tone.invert ? 
      `rgba(255, 255, 255, ${baseOpacity})` : 
      `rgba(0, 0, 0, ${baseOpacity})`;
    const endColor = tone.invert ? 
      `rgba(0, 0, 0, 0)` : 
      `rgba(255, 255, 255, 0)`;

    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);

    // コントラスト・明度調整
    this.applyColorAdjustments(ctx, tone);

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
    
    ctx.restore();
  }

  /**
   * クロスハッチング描画（十字線・ペン画風）
   */
  private static renderCrosshatch(
    ctx: CanvasRenderingContext2D,
    tone: ToneElement,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    ctx.save();

    const lineSpacing = 6 * tone.scale;
    const lineWidth = Math.max(0.5, tone.density * 2);
    
    ctx.strokeStyle = tone.invert ? '#ffffff' : '#000000';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';

    // コントラスト・明度調整
    this.applyColorAdjustments(ctx, tone);

    // 第1レイヤー：基本斜線（45度）
    this.drawHatchLines(ctx, x, y, width, height, tone.rotation + 45, lineSpacing, tone.density);

    // 第2レイヤー：交差線（-45度）
    if (tone.pattern === 'lines_cross') {
      ctx.globalAlpha *= 0.7; // 交差部分の濃度調整
      this.drawHatchLines(ctx, x, y, width, height, tone.rotation - 45, lineSpacing, tone.density * 0.8);
    }

    ctx.restore();
  }

  /**
   * ドット描画（規則的ドットパターン）
   */
  private static renderDots(
    ctx: CanvasRenderingContext2D,
    tone: ToneElement,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const lineFreq = this.getLineFrequency(tone.pattern);
    const dotRadius = tone.scale * tone.density * 2;
    const spacing = 10 * tone.scale;

    ctx.save();

    // 回転変換
    if (tone.rotation !== 0) {
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((tone.rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
    }

    // コントラスト・明度調整
    this.applyColorAdjustments(ctx, tone);

    ctx.fillStyle = tone.invert ? '#ffffff' : '#000000';

    // 規則的ドット描画
    for (let px = x - spacing; px < x + width + spacing; px += spacing) {
      for (let py = y - spacing; py < y + height + spacing; py += spacing) {
        if (px >= x - dotRadius && px <= x + width + dotRadius &&
            py >= y - dotRadius && py <= y + height + dotRadius) {
          ctx.beginPath();
          ctx.arc(px, py, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.restore();
  }

  /**
   * ライン描画（水平・垂直・斜線）
   */
  private static renderLines(
    ctx: CanvasRenderingContext2D,
    tone: ToneElement,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    ctx.save();

    const lineSpacing = 4 * tone.scale;
    const lineWidth = Math.max(0.3, tone.density * 1.5);
    
    ctx.strokeStyle = tone.invert ? '#ffffff' : '#000000';
    ctx.lineWidth = lineWidth;

    // コントラスト・明度調整
    this.applyColorAdjustments(ctx, tone);

    let angle = tone.rotation;
    switch (tone.pattern) {
      case 'lines_horizontal':
        angle += 0;
        break;
      case 'lines_vertical':
        angle += 90;
        break;
      case 'lines_diagonal':
        angle += 45;
        break;
      case 'speed_lines':
        this.drawSpeedLines(ctx, x, y, width, height, tone);
        ctx.restore();
        return;
      case 'focus_lines':
        this.drawFocusLines(ctx, x, y, width, height, tone);
        ctx.restore();
        return;
      case 'explosion':
        this.drawExplosionLines(ctx, x, y, width, height, tone);
        ctx.restore();
        return;
    }

    // 通常のライン描画
    this.drawHatchLines(ctx, x, y, width, height, angle, lineSpacing, tone.density);

    ctx.restore();
  }

  /**
   * ノイズ描画（粗い・細かい・粒子）
   */
  private static renderNoise(
    ctx: CanvasRenderingContext2D,
    tone: ToneElement,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    ctx.save();

    // コントラスト・明度調整
    this.applyColorAdjustments(ctx, tone);

    const noiseIntensity = tone.density;
    let noiseSize: number;

    switch (tone.pattern) {
      case 'noise_fine':
        noiseSize = 1 * tone.scale;
        break;
      case 'noise_coarse':
        noiseSize = 3 * tone.scale;
        break;
      case 'noise_grain':
      default:
        noiseSize = 2 * tone.scale;
        break;
    }

    ctx.fillStyle = tone.invert ? '#ffffff' : '#000000';

    // ノイズ粒子をランダム配置
    const particleCount = Math.floor((width * height / (noiseSize * noiseSize)) * noiseIntensity * 0.1);
    
    for (let i = 0; i < particleCount; i++) {
      const px = x + Math.random() * width;
      const py = y + Math.random() * height;
      const size = noiseSize * (0.5 + Math.random() * 0.5);

      ctx.globalAlpha = tone.opacity * (0.3 + Math.random() * 0.7);
      
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * ヘルパー関数群
   */

  /**
   * 線周波数取得（網点の密度指定）
   */
  private static getLineFrequency(pattern: string): number {
    switch (pattern) {
      case 'dots_60': return 60;
      case 'dots_85': return 85;
      case 'dots_100': return 100;
      case 'dots_120': return 120;
      case 'dots_150': return 150;
      default: return 85;
    }
  }

  /**
   * ハッチング線描画
   */
  private static drawHatchLines(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    angle: number,
    spacing: number,
    density: number
  ): void {
    const angleRad = (angle * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    
    // 線の数を密度で調整
    const lineCount = Math.floor((Math.max(width, height) / spacing) * density);
    
    for (let i = 0; i < lineCount; i++) {
      const offset = (i / lineCount - 0.5) * Math.max(width, height) * 1.5;
      
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      
      const startX = centerX + offset * (-sin) - cos * Math.max(width, height);
      const startY = centerY + offset * cos - sin * Math.max(width, height);
      const endX = centerX + offset * (-sin) + cos * Math.max(width, height);
      const endY = centerY + offset * cos + sin * Math.max(width, height);
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  }

  /**
   * スピード線描画
   */
  private static drawSpeedLines(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    tone: ToneElement
  ): void {
    const lineCount = Math.floor(tone.density * 30);
    const lineLength = Math.min(width, height) * tone.scale;

    for (let i = 0; i < lineCount; i++) {
      const startX = x + Math.random() * width;
      const startY = y + Math.random() * height;
      const length = lineLength * (0.5 + Math.random() * 0.5);
      
      const angle = (tone.rotation * Math.PI) / 180;
      const endX = startX + Math.cos(angle) * length;
      const endY = startY + Math.sin(angle) * length;

      ctx.globalAlpha = tone.opacity * (0.5 + Math.random() * 0.5);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  }

  /**
   * 集中線描画
   */
  private static drawFocusLines(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    tone: ToneElement
  ): void {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const lineCount = Math.floor(tone.density * 40);

    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * 2 * Math.PI;
      const length = Math.max(width, height) * tone.scale * (0.3 + Math.random() * 0.4);
      
      const startRadius = Math.min(width, height) * 0.1;
      const startX = centerX + Math.cos(angle) * startRadius;
      const startY = centerY + Math.sin(angle) * startRadius;
      const endX = centerX + Math.cos(angle) * length;
      const endY = centerY + Math.sin(angle) * length;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  }

  /**
   * 爆発線描画
   */
  private static drawExplosionLines(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    tone: ToneElement
  ): void {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const lineCount = Math.floor(tone.density * 50);

    for (let i = 0; i < lineCount; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const length = Math.max(width, height) * tone.scale * (0.4 + Math.random() * 0.6);
      const irregularity = 0.8 + Math.random() * 0.4;
      
      const startX = centerX + Math.cos(angle) * Math.min(width, height) * 0.05;
      const startY = centerY + Math.sin(angle) * Math.min(width, height) * 0.05;
      const endX = centerX + Math.cos(angle) * length * irregularity;
      const endY = centerY + Math.sin(angle) * length * irregularity;

      ctx.globalAlpha = tone.opacity * (0.4 + Math.random() * 0.6);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  }

  /**
   * ブレンドモード適用
   */
  private static applyBlendMode(ctx: CanvasRenderingContext2D, blendMode: string): void {
    switch (blendMode) {
      case 'multiply':
        ctx.globalCompositeOperation = 'multiply';
        break;
      case 'screen':
        ctx.globalCompositeOperation = 'screen';
        break;
      case 'overlay':
        ctx.globalCompositeOperation = 'overlay';
        break;
      case 'soft-light':
        ctx.globalCompositeOperation = 'soft-light';
        break;
      case 'hard-light':
        ctx.globalCompositeOperation = 'hard-light';
        break;
      case 'darken':
        ctx.globalCompositeOperation = 'darken';
        break;
      case 'lighten':
        ctx.globalCompositeOperation = 'lighten';
        break;
      case 'difference':
        ctx.globalCompositeOperation = 'difference';
        break;
      case 'exclusion':
        ctx.globalCompositeOperation = 'exclusion';
        break;
      case 'normal':
      default:
        ctx.globalCompositeOperation = 'source-over';
        break;
    }
  }

  /**
   * 色調整適用
   */
  private static applyColorAdjustments(ctx: CanvasRenderingContext2D, tone: ToneElement): void {
    // Canvas Filter API を使用（対応ブラウザでのみ）
    if (tone.contrast !== 1.0 || tone.brightness !== 0) {
      const contrast = tone.contrast * 100;
      const brightness = tone.brightness * 100;
      ctx.filter = `contrast(${contrast}%) brightness(${100 + brightness}%)`;
    }
  }

  /**
   * マスク適用
   */
  private static applyMask(
    ctx: CanvasRenderingContext2D,
    tone: ToneElement,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    ctx.save();
    
    ctx.beginPath();
    switch (tone.maskShape) {
      case 'ellipse':
        ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
        break;
      case 'custom':
        // カスタムマスクは将来実装
        ctx.rect(x, y, width, height);
        break;
      case 'rectangle':
      default:
        ctx.rect(x, y, width, height);
        break;
    }
    ctx.clip();
    
    // マスクのぼかし効果（featherは将来実装）
    
    ctx.restore();
  }

  /**
   * トーン選択状態の描画
   */
  private static drawToneSelection(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    ctx.save();
    ctx.globalAlpha = 0.8;
    
    // 選択枠
    ctx.strokeStyle = '#00a8ff';
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
      { x: x + width/2 - handleSize/2, y: y - handleSize/2 }, // 上中央
      { x: x + width/2 - handleSize/2, y: y + height - handleSize/2 }, // 下中央
      { x: x - handleSize/2, y: y + height/2 - handleSize/2 }, // 左中央
      { x: x + width - handleSize/2, y: y + height/2 - handleSize/2 }, // 右中央
    ];
    
    ctx.setLineDash([]);
    ctx.fillStyle = '#00a8ff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    
    handles.forEach(handle => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
      ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
    });
    
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
    panels.forEach(panel => {
      // パネル内のトーンを取得してzIndex順にソート
      const panelTones = tones
        .filter(tone => tone.panelId === panel.id && tone.visible)
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

      // パネル内のトーンを順番に描画
      panelTones.forEach(tone => {
        const isSelected = selectedTone?.id === tone.id;
        this.renderTone(ctx, tone, panel, isSelected);
      });
    });
  }
}

// React コンポーネントとしてのエクスポート
export const ToneRendererComponent: React.FC<{
  tones: ToneElement[];
  panels: Panel[];
  selectedTone?: ToneElement | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}> = ({ tones, panels, selectedTone, canvasRef }) => {
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // トーン描画実行
    ToneRenderer.renderTones(ctx, tones, panels, selectedTone);
    
  }, [tones, panels, selectedTone]);

  return null; // このコンポーネントは描画のみ行う
};