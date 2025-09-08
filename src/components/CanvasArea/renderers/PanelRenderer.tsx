// src/components/CanvasArea/renderers/PanelRenderer.tsx
import { Panel } from "../../../types";

export class PanelRenderer {
  // パネル群描画
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

  // パネル描画関数
  static drawPanel(
    ctx: CanvasRenderingContext2D,
    panel: Panel,
    isSelected: boolean,
    isDarkMode?: boolean
  ) {
    const darkMode =
      isDarkMode ??
      document.documentElement.getAttribute("data-theme") === "dark";

    // パネル背景（ダークモード対応）
    ctx.fillStyle = darkMode
      ? "rgba(64, 64, 64, 0.8)"
      : "rgba(255, 255, 255, 0.8)";
    ctx.fillRect(panel.x, panel.y, panel.width, panel.height);

    // パネル枠線（ダークモード対応）
    ctx.strokeStyle = isSelected ? "#ff8833" : darkMode ? "#e0e0e0" : "#000000";
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.strokeRect(panel.x, panel.y, panel.width, panel.height);

    // パネル番号（ダークモード対応）
    ctx.fillStyle = isSelected ? "#ff8833" : darkMode ? "#b0b0b0" : "#666666";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`${panel.id}`, panel.x + 10, panel.y + 10);

    // 選択時の追加表示
    if (isSelected) {
      ctx.fillStyle = "#ff8833";
      ctx.font = "12px Arial";
      ctx.fillText("選択中", panel.x + panel.width - 50, panel.y + 10);
    }
  }

  // パネル検索機能
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