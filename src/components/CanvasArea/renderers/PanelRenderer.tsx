// src/components/CanvasArea/renderers/PanelRenderer.tsx (コマ移動・削除機能追加版)
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

    // 🆕 削除ハンドル（左上角）
    const deleteHandleSize = 24;
    const deleteX = panel.x - deleteHandleSize/2;
    const deleteY = panel.y - deleteHandleSize/2;
    
    ctx.fillStyle = "#f44336";
    ctx.strokeStyle = handleBorder;
    ctx.lineWidth = 2;
    ctx.fillRect(deleteX, deleteY, deleteHandleSize, deleteHandleSize);
    ctx.strokeRect(deleteX, deleteY, deleteHandleSize, deleteHandleSize);
    
    // 削除アイコン
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("×", deleteX + deleteHandleSize/2, deleteY + deleteHandleSize/2);
  }

  // パネル操作ハンドルのクリック判定
  static getPanelHandleAt(
    mouseX: number,
    mouseY: number,
    panel: Panel
  ): { type: string; direction?: string } | null {
    const handleSize = 20;
    const tolerance = 5;
    
    // 🆕 削除ハンドル判定（最優先）
    const deleteHandleSize = 24;
    const deleteX = panel.x - deleteHandleSize/2;
    const deleteY = panel.y - deleteHandleSize/2;
    
    if (
      mouseX >= deleteX - tolerance &&
      mouseX <= deleteX + deleteHandleSize + tolerance &&
      mouseY >= deleteY - tolerance &&
      mouseY <= deleteY + deleteHandleSize + tolerance
    ) {
      return { type: "delete" };
    }

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

  // パネルリサイズ処理（🔧 感度調整・安定化版）
  static resizePanel(
    panel: Panel,
    direction: string,
    deltaX: number,
    deltaY: number,
    minSize: number = 50
  ): Panel {
    const newPanel = { ...panel };
    
    // 🔧 感度調整（変化量を縮小）
    const sensitivityFactor = 0.5; // 感度を半分に
    const adjustedDeltaX = deltaX * sensitivityFactor;
    const adjustedDeltaY = deltaY * sensitivityFactor;
    
    switch (direction) {
      case "nw":
        // 左上角：位置とサイズ両方変更
        const newNwWidth = Math.max(minSize, newPanel.width - adjustedDeltaX);
        const newNwHeight = Math.max(minSize, newPanel.height - adjustedDeltaY);
        newPanel.x = newPanel.x + newPanel.width - newNwWidth;
        newPanel.y = newPanel.y + newPanel.height - newNwHeight;
        newPanel.width = newNwWidth;
        newPanel.height = newNwHeight;
        break;
      case "n":
        // 上辺：高さのみ変更
        const newNHeight = Math.max(minSize, newPanel.height - adjustedDeltaY);
        newPanel.y = newPanel.y + newPanel.height - newNHeight;
        newPanel.height = newNHeight;
        break;
      case "ne":
        // 右上角
        const newNeWidth = Math.max(minSize, newPanel.width + adjustedDeltaX);
        const newNeHeight = Math.max(minSize, newPanel.height - adjustedDeltaY);
        newPanel.y = newPanel.y + newPanel.height - newNeHeight;
        newPanel.width = newNeWidth;
        newPanel.height = newNeHeight;
        break;
      case "e":
        // 右辺：幅のみ変更
        newPanel.width = Math.max(minSize, newPanel.width + adjustedDeltaX);
        break;
      case "se":
        // 右下角：サイズのみ変更
        newPanel.width = Math.max(minSize, newPanel.width + adjustedDeltaX);
        newPanel.height = Math.max(minSize, newPanel.height + adjustedDeltaY);
        break;
      case "s":
        // 下辺：高さのみ変更
        newPanel.height = Math.max(minSize, newPanel.height + adjustedDeltaY);
        break;
      case "sw":
        // 左下角
        const newSwWidth = Math.max(minSize, newPanel.width - adjustedDeltaX);
        newPanel.x = newPanel.x + newPanel.width - newSwWidth;
        newPanel.width = newSwWidth;
        newPanel.height = Math.max(minSize, newPanel.height + adjustedDeltaY);
        break;
      case "w":
        // 左辺：幅のみ変更
        const newWWidth = Math.max(minSize, newPanel.width - adjustedDeltaX);
        newPanel.x = newPanel.x + newPanel.width - newWWidth;
        newPanel.width = newWWidth;
        break;
    }
    
    return newPanel;
  }

  // 🆕 パネル移動処理（改良版・スナップ機能付き）
  static movePanel(
    panel: Panel,
    deltaX: number,
    deltaY: number,
    canvasWidth: number = 1200,
    canvasHeight: number = 800,
    snapThreshold: number = 10,
    allPanels: Panel[] = [] // 🆕 他のパネルとのスナップ用
  ): { panel: Panel; snapLines: Array<{x1: number, y1: number, x2: number, y2: number, type: 'vertical' | 'horizontal'}> } {
    let newX = panel.x + deltaX;
    let newY = panel.y + deltaY;
    
    // キャンバス範囲制限
    newX = Math.max(0, Math.min(canvasWidth - panel.width, newX));
    newY = Math.max(0, Math.min(canvasHeight - panel.height, newY));
    
    const snapLines: Array<{x1: number, y1: number, x2: number, y2: number, type: 'vertical' | 'horizontal'}> = [];
    
    // 🆕 他のパネルとのスナップ判定
    const otherPanels = allPanels.filter(p => p.id !== panel.id);
    
    for (const otherPanel of otherPanels) {
      // 水平方向のスナップ（左端、右端、中央）
      const leftToLeft = Math.abs(newX - otherPanel.x);
      const leftToRight = Math.abs(newX - (otherPanel.x + otherPanel.width));
      const rightToLeft = Math.abs((newX + panel.width) - otherPanel.x);
      const rightToRight = Math.abs((newX + panel.width) - (otherPanel.x + otherPanel.width));
      const centerToCenter = Math.abs((newX + panel.width/2) - (otherPanel.x + otherPanel.width/2));
      
      if (leftToLeft < snapThreshold) {
        newX = otherPanel.x;
        snapLines.push({
          x1: otherPanel.x + 0.5, y1: Math.min(newY, otherPanel.y) - 20,
          x2: otherPanel.x + 0.5, y2: Math.max(newY + panel.height, otherPanel.y + otherPanel.height) + 20,
          type: 'vertical'
        });
      } else if (leftToRight < snapThreshold) {
        newX = otherPanel.x + otherPanel.width;
        snapLines.push({
          x1: otherPanel.x + otherPanel.width + 0.5, y1: Math.min(newY, otherPanel.y) - 20,
          x2: otherPanel.x + otherPanel.width + 0.5, y2: Math.max(newY + panel.height, otherPanel.y + otherPanel.height) + 20,
          type: 'vertical'
        });
      } else if (rightToLeft < snapThreshold) {
        newX = otherPanel.x - panel.width;
        snapLines.push({
          x1: otherPanel.x + 0.5, y1: Math.min(newY, otherPanel.y) - 20,
          x2: otherPanel.x + 0.5, y2: Math.max(newY + panel.height, otherPanel.y + otherPanel.height) + 20,
          type: 'vertical'
        });
      } else if (rightToRight < snapThreshold) {
        newX = otherPanel.x + otherPanel.width - panel.width;
        snapLines.push({
          x1: otherPanel.x + otherPanel.width + 0.5, y1: Math.min(newY, otherPanel.y) - 20,
          x2: otherPanel.x + otherPanel.width + 0.5, y2: Math.max(newY + panel.height, otherPanel.y + otherPanel.height) + 20,
          type: 'vertical'
        });
      } else if (centerToCenter < snapThreshold) {
        newX = otherPanel.x + otherPanel.width/2 - panel.width/2;
        const centerX = otherPanel.x + otherPanel.width/2;
        snapLines.push({
          x1: centerX + 0.5, y1: Math.min(newY, otherPanel.y) - 20,
          x2: centerX + 0.5, y2: Math.max(newY + panel.height, otherPanel.y + otherPanel.height) + 20,
          type: 'vertical'
        });
      }
      
      // 垂直方向のスナップ（上端、下端、中央）
      const topToTop = Math.abs(newY - otherPanel.y);
      const topToBottom = Math.abs(newY - (otherPanel.y + otherPanel.height));
      const bottomToTop = Math.abs((newY + panel.height) - otherPanel.y);
      const bottomToBottom = Math.abs((newY + panel.height) - (otherPanel.y + otherPanel.height));
      const centerToCenterV = Math.abs((newY + panel.height/2) - (otherPanel.y + otherPanel.height/2));
      
      if (topToTop < snapThreshold) {
        newY = otherPanel.y;
        snapLines.push({
          x1: Math.min(newX, otherPanel.x) - 20, y1: otherPanel.y,
          x2: Math.max(newX + panel.width, otherPanel.x + otherPanel.width) + 20, y2: otherPanel.y,
          type: 'horizontal'
        });
      } else if (topToBottom < snapThreshold) {
        newY = otherPanel.y + otherPanel.height;
        snapLines.push({
          x1: Math.min(newX, otherPanel.x) - 20, y1: otherPanel.y + otherPanel.height,
          x2: Math.max(newX + panel.width, otherPanel.x + otherPanel.width) + 20, y2: otherPanel.y + otherPanel.height,
          type: 'horizontal'
        });
      } else if (bottomToTop < snapThreshold) {
        newY = otherPanel.y - panel.height;
        snapLines.push({
          x1: Math.min(newX, otherPanel.x) - 20, y1: otherPanel.y,
          x2: Math.max(newX + panel.width, otherPanel.x + otherPanel.width) + 20, y2: otherPanel.y,
          type: 'horizontal'
        });
      } else if (bottomToBottom < snapThreshold) {
        newY = otherPanel.y + otherPanel.height - panel.height;
        snapLines.push({
          x1: Math.min(newX, otherPanel.x) - 20, y1: otherPanel.y + otherPanel.height,
          x2: Math.max(newX + panel.width, otherPanel.x + otherPanel.width) + 20, y2: otherPanel.y + otherPanel.height,
          type: 'horizontal'
        });
      } else if (centerToCenterV < snapThreshold) {
        newY = otherPanel.y + otherPanel.height/2 - panel.height/2;
        const centerY = otherPanel.y + otherPanel.height/2;
        snapLines.push({
          x1: Math.min(newX, otherPanel.x) - 20, y1: centerY,
          x2: Math.max(newX + panel.width, otherPanel.x + otherPanel.width) + 20, y2: centerY,
          type: 'horizontal'
        });
      }
    }
    
    // グリッドスナップ（オプション）
    const gridSize = 20;
    if (Math.abs(newX % gridSize) < snapThreshold) {
      newX = Math.round(newX / gridSize) * gridSize;
    }
    if (Math.abs(newY % gridSize) < snapThreshold) {
      newY = Math.round(newY / gridSize) * gridSize;
    }
    
    return {
      panel: {
        ...panel,
        x: newX,
        y: newY,
      },
      snapLines
    };
  }


    static drawSnapLines(
    ctx: CanvasRenderingContext2D,
    snapLines: Array<{x1: number, y1: number, x2: number, y2: number, type: 'vertical' | 'horizontal'}>,
    isDarkMode: boolean
  ) {
    ctx.strokeStyle = isDarkMode ? "#00ff00" : "#ff0000";
    ctx.lineWidth = 1; // 細い線
    ctx.setLineDash([4, 2]); // 短い破線
    
    snapLines.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.stroke();
    });
    
    ctx.setLineDash([]);
  }

  // 🆕 グリッド描画機能
  static drawGrid(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    gridSize: number = 20,
    isDarkMode: boolean = false
  ) {
    ctx.strokeStyle = isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    // 垂直線
    for (let x = 0; x <= canvasWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }

    // 水平線
    for (let y = 0; y <= canvasHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }
  }

  // 🆕 パネル移動処理（シンプル版）
  static movePanelSimple(panel: Panel, deltaX: number, deltaY: number): Panel {
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

  // 🆕 コマ削除時の確認ダイアログ
  static showDeleteConfirmation(panelId: number): boolean {
    return window.confirm(
      `コマ ${panelId} を削除しますか？\n` +
      `コマ内のキャラクターと吹き出しも一緒に削除されます。\n\n` +
      `この操作は取り消せません。`
    );
  }

  // 🆕 パネル削除処理（子要素のIDリストを返す）
  static deletePanelAndGetChildIds(
    panel: Panel,
    characters: any[],
    bubbles: any[]
  ): {
    characterIdsToDelete: string[];
    bubbleIdsToDelete: string[];
  } {
    // パネル内のキャラクターを検索
    const characterIdsToDelete = characters
      .filter(char => 
        char.x >= panel.x && 
        char.x <= panel.x + panel.width &&
        char.y >= panel.y && 
        char.y <= panel.y + panel.height
      )
      .map(char => char.id);

    // パネル内の吹き出しを検索
    const bubbleIdsToDelete = bubbles
      .filter(bubble => 
        bubble.x >= panel.x && 
        bubble.x <= panel.x + panel.width &&
        bubble.y >= panel.y && 
        bubble.y <= panel.y + panel.height
      )
      .map(bubble => bubble.id);

    return {
      characterIdsToDelete,
      bubbleIdsToDelete
    };
  }

  // 🆕 右クリックメニュー表示判定
  static shouldShowContextMenu(
    mouseX: number,
    mouseY: number,
    panel: Panel,
    isEditMode: boolean
  ): boolean {
    // 編集モード時のみ右クリックメニューを表示
    if (!isEditMode) return false;
    
    // パネル内でのクリックかチェック
    return (
      mouseX >= panel.x &&
      mouseX <= panel.x + panel.width &&
      mouseY >= panel.y &&
      mouseY <= panel.y + panel.height
    );
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