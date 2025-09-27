// src/components/CanvasArea/CanvasDrawing.ts
import { Panel } from "../../types";

export class CanvasDrawing {
  /**
   * グリッド描画
   */
  static drawGrid(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    gridSize: number,
    isDarkMode: boolean
  ): void {
    ctx.strokeStyle = isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    for (let x = 0; x <= canvasWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }

    for (let y = 0; y <= canvasHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }
  }

  /**
   * 複数パネル描画
   */
  static drawPanels(
    ctx: CanvasRenderingContext2D,
    panels: Panel[],
    selectedPanel: Panel | null,
    isDarkMode: boolean,
    isEditMode: boolean
  ): void {
    panels.forEach((panel) => {
      CanvasDrawing.drawPanel(ctx, panel, panel === selectedPanel, isDarkMode, isEditMode);
    });
  }

  /**
   * 単一パネル描画
   */
  static drawPanel(
    ctx: CanvasRenderingContext2D,
    panel: Panel,
    isSelected: boolean,
    isDarkMode: boolean,
    isEditMode: boolean
  ): void {
    console.log('🎨 Drawing panel:', {
      id: panel.id,
      x: panel.x,
      y: panel.y,
      width: panel.width,
      height: panel.height,
      isSelected,
      canvasSize: { width: ctx.canvas.width, height: ctx.canvas.height },
      canvasDisplaySize: { width: ctx.canvas.offsetWidth, height: ctx.canvas.offsetHeight },
      displayScale: { 
        x: ctx.canvas.offsetWidth / ctx.canvas.width, 
        y: ctx.canvas.offsetHeight / ctx.canvas.height 
      }
    });
    
    // パネルがキャンバス内にあるかチェック
    const isPanelInCanvas = panel.x >= 0 && panel.y >= 0 && 
                           panel.x + panel.width <= ctx.canvas.width && 
                           panel.y + panel.height <= ctx.canvas.height;
    
    console.log('📐 Panel bounds check:', {
      panelId: panel.id,
      isInCanvas: isPanelInCanvas,
      panelBounds: {
        left: panel.x,
        top: panel.y,
        right: panel.x + panel.width,
        bottom: panel.y + panel.height
      },
      canvasBounds: {
        width: ctx.canvas.width,
        height: ctx.canvas.height
      }
    });
    
    // パネル背景
    if (isDarkMode) {
      ctx.fillStyle = "rgba(80, 80, 80, 0.9)";
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    }
    ctx.fillRect(panel.x, panel.y, panel.width, panel.height);

    // パネル枠線
    if (isSelected) {
      ctx.strokeStyle = "#ff8833";
      ctx.lineWidth = 4;
    } else {
      ctx.strokeStyle = isDarkMode ? "#ffffff" : "#333333";
      ctx.lineWidth = 3;
    }
    ctx.strokeRect(panel.x, panel.y, panel.width, panel.height);

    // パネル番号
    ctx.fillStyle = isSelected ? "#ff8833" : isDarkMode ? "#ffffff" : "#333333";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    
    const textX = panel.x + 12;
    const textY = panel.y + 12;
    const textWidth = 30;
    const textHeight = 25;
    
    ctx.fillStyle = isSelected ? "rgba(255, 136, 51, 0.8)" : isDarkMode ? "rgba(0, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.8)";
    ctx.fillRect(textX - 4, textY - 2, textWidth, textHeight);
    
    ctx.fillStyle = isSelected ? "#ffffff" : isDarkMode ? "#ffffff" : "#333333";
    ctx.fillText(`${panel.id}`, textX, textY);

    // 編集モード時のハンドル描画
    if (isSelected && isEditMode) {
      CanvasDrawing.drawPanelEditHandles(ctx, panel, isDarkMode);
    }
  }

  /**
   * パネル編集ハンドル描画
   */
  static drawPanelEditHandles(
    ctx: CanvasRenderingContext2D,
    panel: Panel,
    isDarkMode: boolean
  ): void {
    const handleSize = 20;
    const handleColor = "#ff8833";
    const handleBorder = "#ffffff";
    
    // 8方向のリサイズハンドル
    const resizeHandles = [
      { x: panel.x - handleSize/2, y: panel.y - handleSize/2, type: "nw" },
      { x: panel.x + panel.width/2 - handleSize/2, y: panel.y - handleSize/2, type: "n" },
      { x: panel.x + panel.width - handleSize/2, y: panel.y - handleSize/2, type: "ne" },
      { x: panel.x + panel.width - handleSize/2, y: panel.y + panel.height/2 - handleSize/2, type: "e" },
      { x: panel.x + panel.width - handleSize/2, y: panel.y + panel.height - handleSize/2, type: "se" },
      { x: panel.x + panel.width/2 - handleSize/2, y: panel.y + panel.height - handleSize/2, type: "s" },
      { x: panel.x - handleSize/2, y: panel.y + panel.height - handleSize/2, type: "sw" },
      { x: panel.x - handleSize/2, y: panel.y + panel.height/2 - handleSize/2, type: "w" },
    ];

    // リサイズハンドル描画
    resizeHandles.forEach((handle) => {
      if (["nw", "ne", "se", "sw"].includes(handle.type)) {
        ctx.fillStyle = handleColor;
        ctx.strokeStyle = handleBorder;
        ctx.lineWidth = 2;
        ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
        ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
      } else {
        ctx.fillStyle = "#4CAF50";
        ctx.strokeStyle = handleBorder;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(handle.x + handleSize/2, handle.y + handleSize/2, handleSize/2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
    });

    // 移動ハンドル（パネル中央）
    const moveHandleSize = 30;
    const moveX = panel.x + panel.width/2 - moveHandleSize/2;
    const moveY = panel.y + panel.height/2 - moveHandleSize/2;
    
    ctx.fillStyle = "#2196F3";
    ctx.strokeStyle = handleBorder;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(moveX + moveHandleSize/2, moveY + moveHandleSize/2, moveHandleSize/2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✋", moveX + moveHandleSize/2, moveY + moveHandleSize/2);

    // 分割ハンドル（右下角）
    const splitHandleSize = 24;
    const splitX = panel.x + panel.width - splitHandleSize - 5;
    const splitY = panel.y + panel.height - splitHandleSize - 5;
    
    ctx.fillStyle = "#9C27B0";
    ctx.strokeStyle = handleBorder;
    ctx.lineWidth = 2;
    ctx.fillRect(splitX, splitY, splitHandleSize, splitHandleSize);
    ctx.strokeRect(splitX, splitY, splitHandleSize, splitHandleSize);
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✂", splitX + splitHandleSize/2, splitY + splitHandleSize/2);

    // 削除ハンドル（左上角）
    const deleteHandleSize = 24;
    const deleteX = panel.x - deleteHandleSize/2;
    const deleteY = panel.y - deleteHandleSize/2;
    
    ctx.fillStyle = "#f44336";
    ctx.strokeStyle = handleBorder;
    ctx.lineWidth = 2;
    ctx.fillRect(deleteX, deleteY, deleteHandleSize, deleteHandleSize);
    ctx.strokeRect(deleteX, deleteY, deleteHandleSize, deleteHandleSize);
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("×", deleteX + deleteHandleSize/2, deleteY + deleteHandleSize/2);
  }

  /**
   * スナップライン描画
   */
  static drawSnapLines(
    ctx: CanvasRenderingContext2D,
    snapLines: Array<{x1: number, y1: number, x2: number, y2: number, type: 'vertical' | 'horizontal'}>,
    isDarkMode: boolean
  ): void {
    ctx.strokeStyle = isDarkMode ? "#00ff00" : "#ff0000";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 2]);
    
    snapLines.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.stroke();
    });
    
    ctx.setLineDash([]);
  }

  /**
   * Canvas背景描画
   */
  static drawBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    isDarkMode: boolean
  ): void {
    ctx.fillStyle = isDarkMode ? "#404040" : "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Canvas全体をクリア
   */
  static clearCanvas(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    ctx.clearRect(0, 0, width, height);
  }
}