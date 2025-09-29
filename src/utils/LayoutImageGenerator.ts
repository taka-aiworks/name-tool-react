// src/utils/LayoutImageGenerator.ts
// NanoBanana用レイアウト画像生成ユーティリティ

import { Panel, LayoutImageOptions, DEFAULT_LAYOUT_IMAGE_OPTIONS, PaperSize } from '../types';

/**
 * NanoBanana用のレイアウト画像を生成するクラス
 */
export class LayoutImageGenerator {
  private static instance: LayoutImageGenerator;

  public static getInstance(): LayoutImageGenerator {
    if (!LayoutImageGenerator.instance) {
      LayoutImageGenerator.instance = new LayoutImageGenerator();
    }
    return LayoutImageGenerator.instance;
  }

  /**
   * パネル配置からレイアウト画像を生成
   */
  public async generateLayoutImage(
    panels: Panel[],
    paperSize: PaperSize,
    options: Partial<LayoutImageOptions> = {}
  ): Promise<Blob> {
    const finalOptions = { ...DEFAULT_LAYOUT_IMAGE_OPTIONS, ...options };
    
    // Canvas要素を作成
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas context could not be created');
    }

    // キャンバスサイズを設定（用紙サイズに基づく）
    canvas.width = paperSize.pixelWidth;
    canvas.height = paperSize.pixelHeight;

    // 背景を塗りつぶし
    ctx.fillStyle = finalOptions.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // グリッド描画（オプション）
    if (finalOptions.showGrid) {
      this.drawGrid(ctx, canvas.width, canvas.height, finalOptions);
    }

    // パネル描画
    this.drawPanels(ctx, panels, finalOptions);

    // パネル番号描画（オプション）
    if (finalOptions.showPanelNumbers) {
      this.drawPanelNumbers(ctx, panels, finalOptions);
    }

    // Blobに変換して返す
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        },
        'image/png',
        finalOptions.quality
      );
    });
  }

  /**
   * グリッドを描画
   */
  private drawGrid(
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    options: LayoutImageOptions
  ): void {
    const gridSize = 20; // グリッドサイズ（ピクセル）
    
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 2]);

    // 縦線
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // 横線
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.setLineDash([]); // 点線リセット
  }

  /**
   * パネル枠を描画
   */
  private drawPanels(
    ctx: CanvasRenderingContext2D, 
    panels: Panel[], 
    options: LayoutImageOptions
  ): void {
    ctx.strokeStyle = options.borderColor;
    ctx.lineWidth = options.borderWidth;
    ctx.fillStyle = 'rgba(255, 255, 255, 0)'; // 透明

    panels.forEach(panel => {
      // パネル枠描画
      ctx.beginPath();
      ctx.rect(panel.x, panel.y, panel.width, panel.height);
      ctx.stroke();
      
      // 内側を透明で塗りつぶし（コマの境界を明確にする）
      ctx.fill();
    });
  }

  /**
   * パネル番号を描画
   */
  private drawPanelNumbers(
    ctx: CanvasRenderingContext2D, 
    panels: Panel[], 
    options: LayoutImageOptions
  ): void {
    ctx.fillStyle = options.fontColor;
    ctx.font = `bold ${options.fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 背景用の設定
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;

    panels.forEach((panel, index) => {
      const centerX = panel.x + panel.width / 2;
      const centerY = panel.y + panel.height / 2;
      const panelNumber = (index + 1).toString();

      // 文字の背景（白い縁取り）
      ctx.strokeText(panelNumber, centerX, centerY);
      
      // 文字本体
      ctx.fillText(panelNumber, centerX, centerY);
    });
  }

  /**
   * 高品質レイアウト画像を生成（デバッグ用詳細版）
   */
  public async generateDetailedLayoutImage(
    panels: Panel[],
    paperSize: PaperSize,
    options: Partial<LayoutImageOptions> = {}
  ): Promise<{ blob: Blob; debugInfo: string }> {
    const startTime = performance.now();
    
    const finalOptions = { ...DEFAULT_LAYOUT_IMAGE_OPTIONS, ...options };
    
    let debugInfo = "=== NanoBanana Layout Image Generation Debug ===\n\n";
    debugInfo += `📋 Generation Settings:\n`;
    debugInfo += `- Paper Size: ${paperSize.displayName}\n`;
    debugInfo += `- Canvas Size: ${paperSize.pixelWidth} x ${paperSize.pixelHeight}px\n`;
    debugInfo += `- Panel Count: ${panels.length}\n`;
    debugInfo += `- Show Numbers: ${finalOptions.showPanelNumbers}\n`;
    debugInfo += `- Show Grid: ${finalOptions.showGrid}\n`;
    debugInfo += `- Quality: ${finalOptions.quality}\n\n`;

    const blob = await this.generateLayoutImage(panels, paperSize, finalOptions);
    
    const endTime = performance.now();
    const generationTime = Math.round(endTime - startTime);
    
    debugInfo += `⏱️ Performance:\n`;
    debugInfo += `- Generation Time: ${generationTime}ms\n`;
    debugInfo += `- File Size: ${blob.size} bytes (${(blob.size / 1024).toFixed(1)} KB)\n`;
    debugInfo += `- Image Type: ${blob.type}\n\n`;

    debugInfo += `📐 Panel Details:\n`;
    panels.forEach((panel, index) => {
      debugInfo += `Panel ${index + 1}: (${panel.x}, ${panel.y}) ${panel.width}x${panel.height}\n`;
    });

    debugInfo += `\n✅ Layout image generated successfully!\n`;
    debugInfo += `Generated at: ${new Date().toISOString()}\n`;

    return { blob, debugInfo };
  }

  /**
   * レイアウト画像のプレビューを生成（小さいサイズ）
   */
  public async generatePreview(
    panels: Panel[],
    paperSize: PaperSize,
    maxWidth: number = 300,
    maxHeight: number = 400
  ): Promise<Blob> {
    // アスペクト比を維持してサイズを計算
    const aspectRatio = paperSize.pixelWidth / paperSize.pixelHeight;
    let previewWidth = maxWidth;
    let previewHeight = maxWidth / aspectRatio;

    if (previewHeight > maxHeight) {
      previewHeight = maxHeight;
      previewWidth = maxHeight * aspectRatio;
    }

    // プレビュー用の一時的な用紙サイズ
    const previewPaperSize: PaperSize = {
      ...paperSize,
      pixelWidth: Math.round(previewWidth),
      pixelHeight: Math.round(previewHeight)
    };

    // パネルサイズも比例して縮小
    const scaleX = previewWidth / paperSize.pixelWidth;
    const scaleY = previewHeight / paperSize.pixelHeight;

    const scaledPanels: Panel[] = panels.map(panel => ({
      ...panel,
      x: Math.round(panel.x * scaleX),
      y: Math.round(panel.y * scaleY),
      width: Math.round(panel.width * scaleX),
      height: Math.round(panel.height * scaleY)
    }));

    // プレビュー用オプション
    const previewOptions: LayoutImageOptions = {
      showPanelNumbers: true,
      showGrid: false,
      backgroundColor: '#ffffff',
      borderColor: '#333333',
      borderWidth: 1,
      fontSize: Math.max(8, Math.round(12 * Math.min(scaleX, scaleY))),
      fontColor: '#333333',
      quality: 0.8
    };

    return this.generateLayoutImage(scaledPanels, previewPaperSize, previewOptions);
  }

  /**
   * バッチ処理用：複数ページのレイアウト画像を生成
   */
  public async generateMultipleLayouts(
    pagesData: Array<{ panels: Panel[]; paperSize: PaperSize; title: string }>,
    options: Partial<LayoutImageOptions> = {}
  ): Promise<Array<{ blob: Blob; title: string; metadata: any }>> {
    const results = [];

    for (let index = 0; index < pagesData.length; index++) {
      const pageData = pagesData[index];
      const blob = await this.generateLayoutImage(
        pageData.panels, 
        pageData.paperSize, 
        options
      );
      
      results.push({
        blob,
        title: pageData.title || `Page ${index + 1}`,
        metadata: {
          pageIndex: index,
          panelCount: pageData.panels.length,
          paperSize: pageData.paperSize.displayName,
          generatedAt: new Date().toISOString()
        }
      });
    }

    return results;
  }
}

/**
 * 簡単にレイアウト画像を生成するヘルパー関数
 */
export const generateLayoutImage = async (
  panels: Panel[],
  paperSize: PaperSize,
  options?: Partial<LayoutImageOptions>
): Promise<Blob> => {
  const generator = LayoutImageGenerator.getInstance();
  return generator.generateLayoutImage(panels, paperSize, options);
};

export default LayoutImageGenerator;