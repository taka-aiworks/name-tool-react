// src/components/CanvasArea/renderers/PanelRenderer.tsx (ダークモード切替バグ修正版)
import { Panel } from "../../../types";

export class PanelRenderer {
  // パネル群描画（ダークモード切替バグ修正）
  static drawPanels(
    ctx: CanvasRenderingContext2D,
    panels: Panel[],
    selectedPanel: Panel | null,
    isDarkMode?: boolean
  ) {
    panels.forEach((panel) => {
      PanelRenderer.drawPanel(ctx, panel, panel === selectedPanel, isDarkMode);
    });
  }

  // パネル描画関数（強制的なダークモード判定修正）
  static drawPanel(
    ctx: CanvasRenderingContext2D,
    panel: Panel,
    isSelected: boolean,
    isDarkMode?: boolean
  ) {
    // ダークモード判定を確実にする
    const darkMode = isDarkMode !== undefined 
      ? isDarkMode 
      : document.documentElement.getAttribute("data-theme") === "dark";

    // パネル背景（より明確な色分け）
    if (darkMode) {
      ctx.fillStyle = "rgba(80, 80, 80, 0.9)";  // ダークモード：濃いグレー
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";  // ライトモード：ほぼ白
    }
    ctx.fillRect(panel.x, panel.y, panel.width, panel.height);

    // パネル枠線（より強調）
    if (isSelected) {
      ctx.strokeStyle = "#ff8833";
      ctx.lineWidth = 4;  // 選択時は太く
    } else {
      ctx.strokeStyle = darkMode ? "#ffffff" : "#333333";  // より明確なコントラスト
      ctx.lineWidth = 3;  // 通常時も少し太く
    }
    ctx.strokeRect(panel.x, panel.y, panel.width, panel.height);

    // パネル番号（より見やすく）
    ctx.fillStyle = isSelected 
      ? "#ff8833" 
      : darkMode 
      ? "#ffffff"   // ダークモード：白文字
      : "#333333";  // ライトモード：黒文字
    ctx.font = "bold 18px Arial";  // サイズを大きく
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    
    // 背景付きテキスト（視認性向上）
    const textX = panel.x + 12;
    const textY = panel.y + 12;
    const textWidth = 30;
    const textHeight = 25;
    
    // テキスト背景
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

    // 選択時の追加表示（より目立つように）
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
    }

    // デバッグ用：描画確認
    console.log(`Panel ${panel.id} 描画完了 - ダークモード: ${darkMode}`);
  }

  // パネル検索機能（変更なし）
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