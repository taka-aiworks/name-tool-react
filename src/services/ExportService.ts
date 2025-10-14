import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
// 🔧 トーン対応: ToneElementを追加
import { Panel, Character, SpeechBubble, BackgroundElement, EffectElement, ToneElement } from '../types';

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

  // プロジェクト名をファイル名用に取得（localStorageに保存されている想定）
  private getSafeProjectName(): string {
    try {
      const name = localStorage.getItem('currentProjectName') || 'untitled';
      // 日本語・英数字以外をハイフンに置換（記号など）
      return name.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '-');
    } catch {
      return 'untitled';
    }
  }

  private buildFilename(suffix: string): string {
    const project = this.getSafeProjectName();
    return `${project}-${suffix}`;
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
      pdf.save(this.buildFilename(`export-${timestamp}.pdf`));

      onProgress?.({ step: 'complete', progress: 100, message: 'PDF出力完了！' });
    } catch (error) {
      console.error('PDF出力エラー:', error);
      throw new Error('PDF出力に失敗しました');
    }
  }

  /**
   * 全体画像をPNGとして出力
   */
  async exportToPNG(
    canvasElement: HTMLCanvasElement,
    panels: Panel[],
    options: ExportOptions,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<void> {
    try {
      onProgress?.({ step: 'initialize', progress: 0, message: 'PNG出力を開始...' });

      // 描画完了を待つ
      await new Promise(resolve => setTimeout(resolve, 100));

      // 全体画像の出力のみ
      const fullCanvas = await this.captureCanvas(canvasElement, options);
      this.downloadImage(fullCanvas, this.buildFilename('full.png'));

      onProgress?.({ step: 'complete', progress: 100, message: 'PNG出力完了！' });
    } catch (error) {
      console.error('PNG出力エラー:', error);
      throw new Error('PNG出力に失敗しました');
    }
  }

  /**
   * クリスタ用PSDデータの出力（トーン対応版）
   */
  async exportToPSD(
    canvasElement: HTMLCanvasElement,
    panels: Panel[],
    characters: Character[],
    bubbles: SpeechBubble[],
    backgrounds: BackgroundElement[],
    effects: EffectElement[],
    tones: ToneElement[], // 🆕 トーンデータ追加
    options: ExportOptions,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<void> {
    try {
      onProgress?.({ step: 'initialize', progress: 0, message: 'クリスタ用データ準備中...' });

      // PSD形式は複雑なので、代替案として構造化されたデータを出力
      const layerData = this.createLayerStructure(panels, characters, bubbles, backgrounds, effects, tones);
      
      onProgress?.({ step: 'layers', progress: 50, message: 'レイヤー情報を生成中...' });

      // JSONファイルとして出力（クリスタで読み込み可能）
      const jsonData = JSON.stringify(layerData, null, 2);
      this.downloadJSON(jsonData, this.buildFilename('layers.json'));

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
    
    // デバッグ: キャンバス情報をログ出力
    console.log('🔍 captureCanvas デバッグ:');
    console.log('  originalWidth:', canvasElement.width);
    console.log('  originalHeight:', canvasElement.height);
    console.log('  clientWidth:', canvasElement.clientWidth);
    console.log('  clientHeight:', canvasElement.clientHeight);
    console.log('  scale:', scale);
    console.log('  outputWidth:', canvasElement.width * scale);
    console.log('  outputHeight:', canvasElement.height * scale);
    
    // キャンバスの2Dコンテキストを取得
    const originalCtx = canvasElement.getContext('2d');
    if (!originalCtx) {
      throw new Error('キャンバスの2Dコンテキストが取得できません');
    }
    
    // キャンバスの内容をより詳しくチェック
    const imageData = originalCtx.getImageData(0, 0, canvasElement.width, canvasElement.height);
    const hasContent = imageData.data.some((value, index) => index % 4 === 3 && value > 0); // alpha channel check
    
    // 非透明ピクセル数をカウント
    const nonTransparentPixels = imageData.data.filter((value, index) => index % 4 === 3 && value > 0).length;
    const totalPixels = canvasElement.width * canvasElement.height;
    const contentRatio = (nonTransparentPixels / totalPixels * 100).toFixed(2);
    
    console.log('  hasContent:', hasContent);
    console.log('  nonTransparentPixels:', nonTransparentPixels);
    console.log('  totalPixels:', totalPixels);
    console.log('  contentRatio:', contentRatio + '%');
    
    // Canvasを直接コピー（html2canvasを使わない）
    const outputCanvas = document.createElement('canvas');
    const ctx = outputCanvas.getContext('2d')!;
    
    outputCanvas.width = canvasElement.width * scale;
    outputCanvas.height = canvasElement.height * scale;
    
    if (options.includeBackground) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
    }
    
    ctx.drawImage(canvasElement, 0, 0, outputCanvas.width, outputCanvas.height);
    
    // 出力キャンバスの内容もチェック
    const outputImageData = ctx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    const outputHasContent = outputImageData.data.some((value, index) => index % 4 === 3 && value > 0);
    const outputNonTransparentPixels = outputImageData.data.filter((value, index) => index % 4 === 3 && value > 0).length;
    const outputContentRatio = (outputNonTransparentPixels / (outputCanvas.width * outputCanvas.height) * 100).toFixed(2);
    
    console.log('  outputHasContent:', outputHasContent);
    console.log('  outputNonTransparentPixels:', outputNonTransparentPixels);
    console.log('  outputContentRatio:', outputContentRatio + '%');
    
    return outputCanvas;
  }

  private async capturePanelArea(
    canvasElement: HTMLCanvasElement,
    panel: Panel,
    options: ExportOptions
  ): Promise<HTMLCanvasElement> {
    const scale = this.getScaleFromQuality(options.quality);
    
    // スケール比率を計算
    const scaleX = canvasElement.width / canvasElement.clientWidth;
    const scaleY = canvasElement.height / canvasElement.clientHeight;
    
    // パネル領域のみをキャプチャ
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    
    tempCanvas.width = panel.width * scaleX * scale;
    tempCanvas.height = panel.height * scaleY * scale;
    
    if (options.includeBackground) {
      tempCtx.fillStyle = '#ffffff';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    }

    // スケールを考慮してキャンバス要素から該当領域をコピー
    tempCtx.drawImage(
      canvasElement,
      panel.x * scaleX, panel.y * scaleY, panel.width * scaleX, panel.height * scaleY,
      0, 0, tempCanvas.width, tempCanvas.height
    );

    return tempCanvas;
  }

  // 🔧 トーン対応版レイヤー構造作成（types.ts対応修正版）
  private createLayerStructure(
    panels: Panel[],
    characters: Character[],
    bubbles: SpeechBubble[],
    backgrounds: BackgroundElement[],
    effects: EffectElement[],
    tones: ToneElement[] // 🆕 トーンデータ追加
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
          // 🔧 types.tsの実際のプロパティに修正
          expression: char.expression || "normal",           // faceExpression → expression
          pose: char.action || "standing",                   // bodyPose → action  
          direction: char.facing || "front",                 // bodyDirection → facing
          gaze: char.eyeState || "front",                    // eyeDirection → eyeState
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
        })),
        // 🆕 トーンレイヤー追加
        tones: tones.map((tone, index) => ({
          id: tone.id,
          name: `トーン${index + 1}`,
          x: tone.x,
          y: tone.y,
          width: tone.width,
          height: tone.height,
          type: tone.type,
          pattern: tone.pattern,
          density: tone.density,
          opacity: tone.opacity,
          rotation: tone.rotation,
          scale: tone.scale,
          blendMode: tone.blendMode,
          contrast: tone.contrast,
          brightness: tone.brightness,
          invert: tone.invert,
          zIndex: tone.zIndex,
          visible: tone.visible
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
      ...layerData.layers.backgrounds,
      ...layerData.layers.effects,
      ...layerData.layers.tones // 🆕 トーンレイヤー追加
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
    // 品質設定を削除し、標準的な2倍スケールに固定
    return 2.0;
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

  /**
   * テンプレート画像のみを出力（レイアウト枠＋番号）
   */
  async exportTemplatePNG(
    canvasElement: HTMLCanvasElement,
    panels: Panel[],
    options: ExportOptions,
    onProgress?: (progress: ExportProgress) => void,
    redrawTemplateOnly?: () => Promise<void>
  ): Promise<void> {
    try {
      onProgress?.({ step: 'initialize', progress: 0, message: 'テンプレート画像を生成中...' });

      // キャンバスをテンプレートのみで再描画
      if (redrawTemplateOnly) {
        await redrawTemplateOnly();
        // 再描画を待つ
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // 実際のキャンバスから直接コピー
      const outputCanvas = await this.captureCanvas(canvasElement, options);

      onProgress?.({ step: 'saving', progress: 90, message: 'テンプレート画像を保存中...' });
      this.downloadImage(outputCanvas, this.buildFilename('template.png'));

      onProgress?.({ step: 'complete', progress: 100, message: 'テンプレート画像出力完了！' });
    } catch (error) {
      console.error('テンプレート画像出力エラー:', error);
      throw new Error('テンプレート画像出力に失敗しました');
    }
  }

  /**
   * テンプレート画像をPDFとして出力
   */
  async exportTemplatePDF(
    canvasElement: HTMLCanvasElement,
    panels: Panel[],
    options: ExportOptions,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<void> {
    try {
      onProgress?.({ step: 'initialize', progress: 0, message: 'テンプレートPDFを生成中...' });

      const scale = this.getScaleFromQuality(options.quality);
      const outputCanvas = document.createElement('canvas');
      const ctx = outputCanvas.getContext('2d')!;
      
      outputCanvas.width = canvasElement.width * scale;
      outputCanvas.height = canvasElement.height * scale;
      
      // 白背景
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
      
      // パネル枠のみを描画
      const scaleX = canvasElement.width / canvasElement.clientWidth;
      const scaleY = canvasElement.height / canvasElement.clientHeight;
      
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      
      panels.forEach((panel, index) => {
        const x = panel.x * scaleX * scale;
        const y = panel.y * scaleY * scale;
        const width = panel.width * scaleX * scale;
        const height = panel.height * scaleY * scale;
        
        // パネル枠
        ctx.strokeRect(x, y, width, height);
        
        // パネル番号
        ctx.fillStyle = '#000000';
        ctx.font = `${16 * scale}px Arial`;
        ctx.fillText(`${index + 1}`, x + 5, y + 20);
      });

      onProgress?.({ step: 'convert', progress: 80, message: 'PDF形式に変換中...' });

      // PDFとして出力
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;

      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (outputCanvas.height * imgWidth) / outputCanvas.width;

      pdf.addImage(
        outputCanvas.toDataURL('image/jpeg', 0.95),
        'JPEG',
        margin,
        margin,
        imgWidth,
        Math.min(imgHeight, pageHeight - (margin * 2))
      );

      onProgress?.({ step: 'saving', progress: 95, message: 'PDFファイルを保存中...' });
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      pdf.save(`ネーム_テンプレート_${timestamp}.pdf`);

      onProgress?.({ step: 'complete', progress: 100, message: 'テンプレートPDF出力完了！' });
    } catch (error) {
      console.error('テンプレートPDF出力エラー:', error);
      throw new Error('テンプレートPDF出力に失敗しました');
    }
  }

  /**
   * プロジェクトデータ一式をJSONで出力
   */
  async exportProjectDataJSON(
    pages: any[],
    currentPageIndex: number,
    projectName: string,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<void> {
    try {
      onProgress?.({ step: 'initialize', progress: 0, message: 'プロジェクトデータを準備中...' });

      const projectData = {
        version: '1.0',
        projectName,
        exportDate: new Date().toISOString(),
        currentPageIndex,
        pages: pages.map((page, pageIndex) => ({
          pageNumber: pageIndex + 1,
          note: page.note || '',
          panels: page.panels.map((panel: any, panelIndex: number) => ({
            panelNumber: panelIndex + 1,
            id: panel.id,
            x: panel.x,
            y: panel.y,
            width: panel.width,
            height: panel.height,
            importance: panel.importance || 'normal',
            memo: panel.memo || '',
            characters: panel.characters?.map((char: any) => ({
              id: char.id,
              name: char.name,
              expression: char.expression,
              action: char.action,
              facing: char.facing,
              eyeState: char.eyeState,
              scale: char.scale,
              x: char.x,
              y: char.y
            })) || [],
            bubbles: panel.bubbles?.map((bubble: any) => ({
              id: bubble.id,
              text: bubble.text,
              type: bubble.type,
              x: bubble.x,
              y: bubble.y,
              width: bubble.width,
              height: bubble.height,
              fontSize: bubble.fontSize,
              vertical: bubble.vertical
            })) || [],
            backgrounds: panel.backgrounds || [],
            effects: panel.effects || [],
            tones: panel.tones || []
          }))
        }))
      };

      onProgress?.({ step: 'saving', progress: 90, message: 'データファイルを保存中...' });
      
      const jsonData = JSON.stringify(projectData, null, 2);
      this.downloadJSON(jsonData, `${projectName}_データ.json`);

      onProgress?.({ step: 'complete', progress: 100, message: 'プロジェクトデータ出力完了！' });
    } catch (error) {
      console.error('プロジェクトデータ出力エラー:', error);
      throw new Error('プロジェクトデータ出力に失敗しました');
    }
  }
}