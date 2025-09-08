// src/components/CanvasArea/renderers/PanelRenderer.tsx (最適化版)
import { Panel } from "../../../types";

export class PanelRenderer {
  // パネル群描画（デバッグログ削除）
  static drawPanels(
    ctx: CanvasRenderingContext2D,
    panels: Panel[],
    selectedPanel: Panel | null,
    isDarkMode?: boolean,
    isEditMode: boolean = false
  ) {
    panels.forEach((panel) => {
      PanelRenderer.drawPanel(ctx, panel, panel === selectedPanel, isDarkMode, isEditMode);
    });
  }

  // パネル描画関数（デバッグログ削除）
  static drawPanel(
    ctx: CanvasRenderingContext2D,
    panel: Panel,
    isSelected: boolean,
    isDarkMode?: boolean,
    isEditMode: boolean = false
  ) {
    // ダークモード判定を確実にする
    const darkMode = isDarkMode !== undefined 
      ? isDarkMode 
      : document.documentElement.getAttribute("data-theme") === "dark";

    // パネル背景
    if (darkMode) {
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
      ctx.strokeStyle = darkMode ? "#ffffff" : "#333333";
      ctx.lineWidth = 3;
    }
    ctx.strokeRect(panel.x, panel.y, panel.width, panel.height);

    // パネル番号
    ctx.fillStyle = isSelected 
      ? "#ff8833" 
      : darkMode 
      ? "#ffffff"
      : "#333333";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    
    // テキスト背景
    const textX = panel.x + 12;
    const textY = panel.y + 12;
    const textWidth = 30;
    const textHeight = 25;
    
    ctx.fillStyle = isSelected 
      ? "rgba(255, 136, 51, 0.8)" 
      : darkMode 
      ? "rgba(0, 0, 0, 0.7)"
      : "rgba(255, 255, 255, 0.8)";
    ctx.fillRect(textX - 4, textY - 2, textWidth, textHeight);
    
    // テキスト
    ctx.fillStyle = isSelected 
      ? "#ffffff" 
      : darkMode 
      ? "#ffffff"
      : "#333333";
    ctx.fillText(`${panel.id}`, textX, textY);

    // 選択時の追加表示
    if (isSelected) {
      ctx.fillStyle = "#ff8833";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "right";
      
      // 選択中テキストの背景
      const selectTextX = panel.x + panel.width - 60;
      const selectTextY = panel.y + 12;
      ctx.fillStyle = "rgba(255, 136, 51, 0.9)";
      ctx.fillRect(selectTextX - 5, selectTextY - 2, 55, 20);
      
      // 選択中テキスト
      ctx.fillStyle = "#ffffff";
      ctx.fillText("選択中", panel.x + panel.width - 15, panel.y + 12);

      // コマ操作ハンドル描画（編集モード時）
      if (isEditMode) {
        PanelRenderer.drawPanelEditHandles(ctx, panel, darkMode);
      }
    }
  }

  // コマ操作ハンドル描画
  static drawPanelEditHandles(
    ctx: CanvasRenderingContext2D,
    panel: Panel,
    isDarkMode: boolean
  ) {
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
      // 角のハンドル：四角形
      if (["nw", "ne", "se", "sw"].includes(handle.type)) {
        ctx.fillStyle = handleColor;
        ctx.strokeStyle = handleBorder;
        ctx.lineWidth = 2;
        ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
        ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
      } 
      // 辺のハンドル：円形
      else {
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
    
    // 移動アイコン
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
    
    // 分割アイコン
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✂", splitX + splitHandleSize/2, splitY + splitHandleSize/2);
  }

  // パネル操作ハンドルのクリック判定
  static getPanelHandleAt(
    mouseX: number,
    mouseY: number,
    panel: Panel
  ): { type: string; direction?: string } | null {
    const handleSize = 20;
    const tolerance = 5;
    
    // リサイズハンドル判定
    const resizeHandles = [
      { x: panel.x - handleSize/2, y: panel.y - handleSize/2, type: "resize", direction: "nw" },
      { x: panel.x + panel.width/2 - handleSize/2, y: panel.y - handleSize/2, type: "resize", direction: "n" },
      { x: panel.x + panel.width - handleSize/2, y: panel.y - handleSize/2, type: "resize", direction: "ne" },
      { x: panel.x + panel.width - handleSize/2, y: panel.y + panel.height/2 - handleSize/2, type: "resize", direction: "e" },
      { x: panel.x + panel.width - handleSize/2, y: panel.y + panel.height - handleSize/2, type: "resize", direction: "se" },
      { x: panel.x + panel.width/2 - handleSize/2, y: panel.y + panel.height - handleSize/2, type: "resize", direction: "s" },
      { x: panel.x - handleSize/2, y: panel.y + panel.height - handleSize/2, type: "resize", direction: "sw" },
      { x: panel.x - handleSize/2, y: panel.y + panel.height/2 - handleSize/2, type: "resize", direction: "w" },
    ];

    for (const handle of resizeHandles) {
      if (
        mouseX >= handle.x - tolerance &&
        mouseX <= handle.x + handleSize + tolerance &&
        mouseY >= handle.y - tolerance &&
        mouseY <= handle.y + handleSize + tolerance
      ) {
        return { type: handle.type, direction: handle.direction };
      }
    }

    // 移動ハンドル判定
    const moveHandleSize = 30;
    const moveX = panel.x + panel.width/2 - moveHandleSize/2;
    const moveY = panel.y + panel.height/2 - moveHandleSize/2;
    
    if (
      mouseX >= moveX - tolerance &&
      mouseX <= moveX + moveHandleSize + tolerance &&
      mouseY >= moveY - tolerance &&
      mouseY <= moveY + moveHandleSize + tolerance
    ) {
      return { type: "move" };
    }

    // 分割ハンドル判定
    const splitHandleSize = 24;
    const splitX = panel.x + panel.width - splitHandleSize - 5;
    const splitY = panel.y + panel.height - splitHandleSize - 5;
    
    if (
      mouseX >= splitX - tolerance &&
      mouseX <= splitX + splitHandleSize + tolerance &&
      mouseY >= splitY - tolerance &&
      mouseY <= splitY + splitHandleSize + tolerance
    ) {
      return { type: "split" };
    }

    return null;
  }

  // パネルリサイズ処理
  static resizePanel(
    panel: Panel,
    direction: string,
    deltaX: number,
    deltaY: number,
    minSize: number = 50
  ): Panel {
    const newPanel = { ...panel };
    
    switch (direction) {
      case "nw":
        newPanel.x += deltaX;
        newPanel.y += deltaY;
        newPanel.width = Math.max(minSize, newPanel.width - deltaX);
        newPanel.height = Math.max(minSize, newPanel.height - deltaY);
        break;
      case "n":
        newPanel.y += deltaY;
        newPanel.height = Math.max(minSize, newPanel.height - deltaY);
        break;
      case "ne":
        newPanel.y += deltaY;
        newPanel.width = Math.max(minSize, newPanel.width + deltaX);
        newPanel.height = Math.max(minSize, newPanel.height - deltaY);
        break;
      case "e":
        newPanel.width = Math.max(minSize, newPanel.width + deltaX);
        break;
      case "se":
        newPanel.width = Math.max(minSize, newPanel.width + deltaX);
        newPanel.height = Math.max(minSize, newPanel.height + deltaY);
        break;
      case "s":
        newPanel.height = Math.max(minSize, newPanel.height + deltaY);
        break;
      case "sw":
        newPanel.x += deltaX;
        newPanel.width = Math.max(minSize, newPanel.width - deltaX);
        newPanel.height = Math.max(minSize, newPanel.height + deltaY);
        break;
      case "w":
        newPanel.x += deltaX;
        newPanel.width = Math.max(minSize, newPanel.width - deltaX);
        break;
    }
    
    return newPanel;
  }

  // パネル移動処理
  static movePanel(panel: Panel, deltaX: number, deltaY: number): Panel {
    return {
      ...panel,
      x: Math.max(0, panel.x + deltaX),
      y: Math.max(0, panel.y + deltaY),
    };
  }

  // パネル分割処理
  static splitPanel(panel: Panel, direction: "horizontal" | "vertical"): Panel[] {
    if (direction === "horizontal") {
      const topPanel: Panel = {
        ...panel,
        id: panel.id,
        height: panel.height / 2,
      };
      
      const bottomPanel: Panel = {
        ...panel,
        id: panel.id + 1000,
        y: panel.y + panel.height / 2,
        height: panel.height / 2,
      };
      
      return [topPanel, bottomPanel];
    } else {
      const leftPanel: Panel = {
        ...panel,
        id: panel.id,
        width: panel.width / 2,
      };
      
      const rightPanel: Panel = {
        ...panel,
        id: panel.id + 1000,
        x: panel.x + panel.width / 2,
        width: panel.width / 2,
      };
      
      return [leftPanel, rightPanel];
    }
  }

  // パネル検索
  static findPanelAt(
    mouseX: number,
    mouseY: number,
    panels: Panel[]
  ): Panel | null {
    return panels.find(
      (panel) =>
        mouseX >= panel.x &&
        mouseX <= panel.x + panel.width &&
        mouseY >= panel.y &&
        mouseY <= panel.y + panel.height
    ) || null;
  }
}