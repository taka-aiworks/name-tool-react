import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
// 🔧 効果線対応: EffectElementを追加
import { Panel, Character, SpeechBubble, BackgroundElement, EffectElement } from '../types';

export interface ExportOptions {
  format: 'pdf' | 'png' | 'psd';
  quality: 'high' | 'medium' | 'low';
  resolution: number; // DPI
  includeBackground: boolean;
  separatePages: boolean; // PDFの場合、各コマを別ページにするか
}

export interface ExportProgress {
  step: string;
  progress: number; // 0-100
  message: string;
}

export class ExportService {
  private static instance: ExportService;
  
  private constructor() {}
  
  static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  /**
   * キャンバス全体をPDF出力
   */
  async exportToPDF(
    canvasElement: HTMLCanvasElement,
    panels: Panel[],
    options: ExportOptions,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<void> {
    try {
      onProgress?.({ step: 'initialize', progress: 0, message: 'PDF出力を開始...' });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      if (options.separatePages) {
        // 各コマを別ページで出力
        await this.exportPanelsSeparately(pdf, canvasElement, panels, options, onProgress);
      } else {
        // 全体を1ページで出力
        await this.exportCanvasAsSinglePage(pdf, canvasElement, options, onProgress);
      }

      onProgress?.({ step: 'saving', progress: 95, message: 'PDFファイルを保存中...' });
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      pdf.save(`ネーム_${timestamp}.pdf`);

      onProgress?.({ step: 'complete', progress: 100, message: 'PDF出力完了！' });
    } catch (error) {
      console.error('PDF出力エラー:', error);
      throw new Error('PDF出力に失敗しました');
    }
  }

  /**
   * 各コマを個別のPNGとして出力
   */
  async exportToPNG(
    canvasElement: HTMLCanvasElement,
    panels: Panel[],
    options: ExportOptions,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<void> {
    try {
      onProgress?.({ step: 'initialize', progress: 0, message: 'PNG出力を開始...' });

      // 全体画像の出力
      const fullCanvas = await this.captureCanvas(canvasElement, options);
      this.downloadImage(fullCanvas, 'ネーム_全体.png');

      onProgress?.({ step: 'panels', progress: 30, message: '各コマを出力中...' });

      // 各コマの個別出力
      for (let i = 0; i < panels.length; i++) {
        const panel = panels[i];
        const panelCanvas = await this.capturePanelArea(canvasElement, panel, options);
        this.downloadImage(panelCanvas, `ネーム_コマ${i + 1}.png`);
        
        const progress = 30 + (60 * (i + 1) / panels.length);
        onProgress?.({ step: 'panels', progress, message: `コマ ${i + 1}/${panels.length} 完了` });
      }

      onProgress?.({ step: 'complete', progress: 100, message: 'PNG出力完了！' });
    } catch (error) {
      console.error('PNG出力エラー:', error);
      throw new Error('PNG出力に失敗しました');
    }
  }

  /**
   * クリスタ用PSDデータの出力（効果線対応版）
   */
  async exportToPSD(
    canvasElement: HTMLCanvasElement,
    panels: Panel[],
    characters: Character[],
    bubbles: SpeechBubble[],
    backgrounds: BackgroundElement[], // 🆕 背景データ追加
    effects: EffectElement[], // 🆕 効果線データ追加
    options: ExportOptions,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<void> {
    try {
      onProgress?.({ step: 'initialize', progress: 0, message: 'クリスタ用データ準備中...' });

      // PSD形式は複雑なので、代替案として構造化されたデータを出力
      const layerData = this.createLayerStructure(panels, characters, bubbles, backgrounds, effects);
      
      onProgress?.({ step: 'layers', progress: 50, message: 'レイヤー情報を生成中...' });

      // JSONファイルとして出力（クリスタで読み込み可能）
      const jsonData = JSON.stringify(layerData, null, 2);
      this.downloadJSON(jsonData, 'ネーム_レイヤー構造.json');

      // 各要素を個別のPNGとして出力
      await this.exportLayersAsPNG(canvasElement, layerData, options, onProgress);

      onProgress?.({ step: 'complete', progress: 100, message: 'クリスタ用データ出力完了！' });
    } catch (error) {
      console.error('PSD出力エラー:', error);
      throw new Error('クリスタ用データ出力に失敗しました');
    }
  }

  /**
   * エクスポート設定のバリデーション
   */
  validateExportOptions(options: ExportOptions): string[] {
    const errors: string[] = [];

    if (options.resolution < 72 || options.resolution > 600) {
      errors.push('解像度は72-600DPIの範囲で設定してください');
    }

    if (!['pdf', 'png', 'psd'].includes(options.format)) {
      errors.push('サポートされていない出力形式です');
    }

    return errors;
  }

  // ============ プライベートメソッド ============

  private async exportPanelsSeparately(
    pdf: jsPDF,
    canvasElement: HTMLCanvasElement,
    panels: Panel[],
    options: ExportOptions,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<void> {
    for (let i = 0; i < panels.length; i++) {
      const panel = panels[i];
      
      onProgress?.({ 
        step: 'panels', 
        progress: 10 + (80 * i / panels.length), 
        message: `コマ ${i + 1}/${panels.length} を処理中...` 
      });

      const panelCanvas = await this.capturePanelArea(canvasElement, panel, options);
      
      if (i > 0) {
        pdf.addPage();
      }

      // A4サイズに合わせて配置
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;

      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (panelCanvas.height * imgWidth) / panelCanvas.width;

      pdf.addImage(
        panelCanvas.toDataURL('image/jpeg', 0.95),
        'JPEG',
        margin,
        margin,
        imgWidth,
        Math.min(imgHeight, pageHeight - (margin * 2))
      );
    }
  }

  private async exportCanvasAsSinglePage(
    pdf: jsPDF,
    canvasElement: HTMLCanvasElement,
    options: ExportOptions,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<void> {
    onProgress?.({ step: 'capture', progress: 20, message: 'キャンバスをキャプチャ中...' });

    const canvas = await this.captureCanvas(canvasElement, options);
    
    onProgress?.({ step: 'convert', progress: 60, message: 'PDF形式に変換中...' });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    const imgWidth = pageWidth - (margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(
      canvas.toDataURL('image/jpeg', 0.95),
      'JPEG',
      margin,
      margin,
      imgWidth,
      Math.min(imgHeight, pageHeight - (margin * 2))
    );
  }

  private async captureCanvas(
    canvasElement: HTMLCanvasElement,
    options: ExportOptions
  ): Promise<HTMLCanvasElement> {
    const scale = this.getScaleFromQuality(options.quality);
    
    return html2canvas(canvasElement, {
      scale: scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: options.includeBackground ? '#ffffff' : null
    });
  }

  private async capturePanelArea(
    canvasElement: HTMLCanvasElement,
    panel: Panel,
    options: ExportOptions
  ): Promise<HTMLCanvasElement> {
    const scale = this.getScaleFromQuality(options.quality);
    
    // パネル領域のみをキャプチャ
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    
    tempCanvas.width = panel.width * scale;
    tempCanvas.height = panel.height * scale;
    
    if (options.includeBackground) {
      tempCtx.fillStyle = '#ffffff';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    }

    // キャンバス要素から該当領域をコピー
    tempCtx.drawImage(
      canvasElement,
      panel.x, panel.y, panel.width, panel.height,
      0, 0, tempCanvas.width, tempCanvas.height
    );

    return tempCanvas;
  }

  // 🔧 効果線対応版レイヤー構造作成
  private createLayerStructure(
    panels: Panel[],
    characters: Character[],
    bubbles: SpeechBubble[],
    backgrounds: BackgroundElement[], // 🆕 背景データ追加
    effects: EffectElement[] // 🆕 効果線データ追加
  ): any {
    return {
      version: '1.0',
      createdAt: new Date().toISOString(),
      layers: {
        panels: panels.map((panel, index) => ({
          id: panel.id,
          name: `コマ${index + 1}`,
          x: panel.x,
          y: panel.y,
          width: panel.width,
          height: panel.height,
          visible: true
        })),
        characters: characters.map((char, index) => ({
          id: char.id,
          name: `キャラクター${index + 1}`,
          x: char.x,
          y: char.y,
          scale: char.scale,
          type: char.type,
          expression: char.faceExpression || char.expression,
          pose: char.bodyPose || char.pose,
          direction: char.bodyDirection || char.eyeDirection,
          gaze: char.eyeDirection,
          visible: true
        })),
        bubbles: bubbles.map((bubble, index) => ({
          id: bubble.id,
          name: `吹き出し${index + 1}`,
          x: bubble.x,
          y: bubble.y,
          width: bubble.width,
          height: bubble.height,
          text: bubble.text,
          type: bubble.type,
          visible: true
        })),
        // 🆕 背景レイヤー追加
        backgrounds: backgrounds.map((bg, index) => ({
          id: bg.id,
          name: `背景${index + 1}`,
          x: bg.x,
          y: bg.y,
          width: bg.width,
          height: bg.height,
          type: bg.type,
          opacity: bg.opacity,
          zIndex: bg.zIndex,
          visible: true
        })),
        // 🆕 効果線レイヤー追加
        effects: effects.map((effect, index) => ({
          id: effect.id,
          name: `効果線${index + 1}`,
          x: effect.x,
          y: effect.y,
          width: effect.width,
          height: effect.height,
          type: effect.type,
          direction: effect.direction,
          intensity: effect.intensity,
          density: effect.density,
          color: effect.color,
          opacity: effect.opacity,
          zIndex: effect.zIndex,
          visible: true
        }))
      }
    };
  }

  private async exportLayersAsPNG(
    canvasElement: HTMLCanvasElement,
    layerData: any,
    options: ExportOptions,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<void> {
    // 各レイヤーを個別のPNGファイルとして出力
    const allLayers = [
      ...layerData.layers.panels,
      ...layerData.layers.characters,
      ...layerData.layers.bubbles,
      ...layerData.layers.backgrounds, // 🆕 背景レイヤー追加
      ...layerData.layers.effects // 🆕 効果線レイヤー追加
    ];

    for (let i = 0; i < allLayers.length; i++) {
      const layer = allLayers[i];
      
      // レイヤー領域をキャプチャ（実装は簡略化）
      const layerCanvas = await this.captureLayerArea(canvasElement, layer, options);
      this.downloadImage(layerCanvas, `レイヤー_${layer.name}.png`);
      
      const progress = 60 + (35 * (i + 1) / allLayers.length);
      onProgress?.({ step: 'layers', progress, message: `レイヤー ${i + 1}/${allLayers.length} 出力中` });
    }
  }

  private async captureLayerArea(
    canvasElement: HTMLCanvasElement,
    layer: any,
    options: ExportOptions
  ): Promise<HTMLCanvasElement> {
    // 簡略化された実装
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    
    tempCanvas.width = layer.width;
    tempCanvas.height = layer.height;
    
    tempCtx.drawImage(
      canvasElement,
      layer.x, layer.y, layer.width, layer.height,
      0, 0, layer.width, layer.height
    );

    return tempCanvas;
  }

  private getScaleFromQuality(quality: string): number {
    switch (quality) {
      case 'high': return 3.0;
      case 'medium': return 2.0;
      case 'low': return 1.0;
      default: return 2.0;
    }
  }

  private downloadImage(canvas: HTMLCanvasElement, filename: string): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  private downloadJSON(data: string, filename: string): void {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }
}