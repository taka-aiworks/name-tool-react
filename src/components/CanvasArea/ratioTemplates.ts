// src/components/CanvasArea/ratioTemplates.ts - 比率ベーステンプレートシステム
import { Templates } from "../../types";

/**
 * 比率ベースのテンプレート定義
 * 座標は0-1の範囲で指定（キャンバスサイズに対する比率）
 */
export const ratioTemplates: Templates = {
  // === 1コマテンプレート ===
  "single_impact": {
    panels: [
      { id: 1, x: 0.025, y: 0.025, width: 0.95, height: 0.95 },
    ],
  },

  // === 2コマテンプレート ===
  "split_horizontal": {
    panels: [
      { id: 1, x: 0.025, y: 0.025, width: 0.4625, height: 0.95 },
      { id: 2, x: 0.5125, y: 0.025, width: 0.4625, height: 0.95 },
    ],
  },
  "split_vertical": {
    panels: [
      { id: 1, x: 0.025, y: 0.025, width: 0.95, height: 0.45 },
      { id: 2, x: 0.025, y: 0.525, width: 0.95, height: 0.45 },
    ],
  },
  "dialogue_2": {
    panels: [
      { id: 1, x: 0.025, y: 0.025, width: 0.95, height: 0.7 },
      { id: 2, x: 0.025, y: 0.75, width: 0.95, height: 0.225 },
    ],
  },
  "main_sub": {
    panels: [
      { id: 1, x: 0.025, y: 0.025, width: 0.65, height: 0.95 },
      { id: 2, x: 0.7, y: 0.025, width: 0.275, height: 0.95 },
    ],
  },
  "custom": {
    panels: [
      { id: 1, x: 0.025, y: 0.025, width: 0.95, height: 0.45 },
      { id: 2, x: 0.025, y: 0.525, width: 0.95, height: 0.45 },
    ],
  },

  // === 3コマテンプレート ===
  "three_vertical": {
    panels: [
      { id: 1, x: 0.025, y: 0.025, width: 0.95, height: 0.3 },
      { id: 2, x: 0.025, y: 0.35, width: 0.95, height: 0.3 },
      { id: 3, x: 0.025, y: 0.675, width: 0.95, height: 0.3 },
    ],
  },
  "t_shape": {
    panels: [
      { id: 1, x: 0.025, y: 0.025, width: 0.95, height: 0.3 },
      { id: 2, x: 0.025, y: 0.35, width: 0.4625, height: 0.6 },
      { id: 3, x: 0.5125, y: 0.35, width: 0.4625, height: 0.6 },
    ],
  },
  "reverse_t": {
    panels: [
      { id: 1, x: 0.025, y: 0.025, width: 0.4625, height: 0.6 },
      { id: 2, x: 0.5125, y: 0.025, width: 0.4625, height: 0.6 },
      { id: 3, x: 0.025, y: 0.65, width: 0.95, height: 0.325 },
    ],
  },

  // === 4コマテンプレート ===
  "4koma": {
    panels: [
      { id: 1, x: 0.025, y: 0.025, width: 0.95, height: 0.225 },
      { id: 2, x: 0.025, y: 0.275, width: 0.95, height: 0.225 },
      { id: 3, x: 0.025, y: 0.525, width: 0.95, height: 0.225 },
      { id: 4, x: 0.025, y: 0.775, width: 0.95, height: 0.2 },
    ],
  },
  "grid_2x2": {
    panels: [
      { id: 1, x: 0.025, y: 0.025, width: 0.4625, height: 0.45 },
      { id: 2, x: 0.5125, y: 0.025, width: 0.4625, height: 0.45 },
      { id: 3, x: 0.025, y: 0.525, width: 0.4625, height: 0.45 },
      { id: 4, x: 0.5125, y: 0.525, width: 0.4625, height: 0.45 },
    ],
  },
  "main_triple": {
    panels: [
      { id: 1, x: 0.025, y: 0.025, width: 0.95, height: 0.45 },
      { id: 2, x: 0.025, y: 0.525, width: 0.3, height: 0.45 },
      { id: 3, x: 0.35, y: 0.525, width: 0.3, height: 0.45 },
      { id: 4, x: 0.675, y: 0.525, width: 0.3, height: 0.45 },
    ],
  },
  "emotional": {
    panels: [
      { id: 1, x: 0.025, y: 0.025, width: 0.6, height: 0.5 },
      { id: 2, x: 0.65, y: 0.025, width: 0.325, height: 0.225 },
      { id: 3, x: 0.65, y: 0.275, width: 0.325, height: 0.225 },
      { id: 4, x: 0.025, y: 0.55, width: 0.95, height: 0.425 },
    ],
  },
  "triple_main": {
    panels: [
      { id: 1, x: 0.025, y: 0.025, width: 0.3, height: 0.45 },
      { id: 2, x: 0.35, y: 0.025, width: 0.3, height: 0.45 },
      { id: 3, x: 0.675, y: 0.025, width: 0.3, height: 0.45 },
      { id: 4, x: 0.025, y: 0.525, width: 0.95, height: 0.45 },
    ],
  },
  "dialogue": {
    panels: [
      { id: 1, x: 0.025, y: 0.025, width: 0.6, height: 0.5 },
      { id: 2, x: 0.65, y: 0.025, width: 0.325, height: 0.225 },
      { id: 3, x: 0.65, y: 0.275, width: 0.325, height: 0.225 },
      { id: 4, x: 0.025, y: 0.55, width: 0.95, height: 0.425 },
    ],
  },
  "action": {
    panels: [
      { id: 1, x: 0.025, y: 0.025, width: 0.3, height: 0.467 },
      { id: 2, x: 0.35, y: 0.025, width: 0.625, height: 0.217 },
      { id: 3, x: 0.35, y: 0.267, width: 0.625, height: 0.217 },
      { id: 4, x: 0.025, y: 0.533, width: 0.95, height: 0.433 },
    ],
  },

  // === 5コマテンプレート ===
  "gag": {
    panels: [
      { id: 1, x: 0.025, y: 0.025, width: 0.95, height: 0.2 },
      { id: 2, x: 0.025, y: 0.25, width: 0.3, height: 0.35 },
      { id: 3, x: 0.35, y: 0.25, width: 0.3, height: 0.35 },
      { id: 4, x: 0.675, y: 0.25, width: 0.3, height: 0.35 },
      { id: 5, x: 0.025, y: 0.65, width: 0.95, height: 0.325 },
    ],
  },
  "spread": {
    panels: [
      { id: 1, x: 0.025, y: 0.025, width: 0.95, height: 0.35 },
      { id: 2, x: 0.025, y: 0.4, width: 0.3, height: 0.25 },
      { id: 3, x: 0.35, y: 0.4, width: 0.3, height: 0.25 },
      { id: 4, x: 0.675, y: 0.4, width: 0.3, height: 0.25 },
      { id: 5, x: 0.025, y: 0.7, width: 0.95, height: 0.275 },
    ],
  },
  "web_standard": {
    panels: [
      { id: 1, x: 0.025, y: 0.025, width: 0.95, height: 0.18 },
      { id: 2, x: 0.025, y: 0.225, width: 0.95, height: 0.18 },
      { id: 3, x: 0.025, y: 0.425, width: 0.95, height: 0.18 },
      { id: 4, x: 0.025, y: 0.625, width: 0.95, height: 0.18 },
      { id: 5, x: 0.025, y: 0.825, width: 0.95, height: 0.15 },
    ],
  },

  // === 6コマ以上テンプレート ===
  "vertical": {
    panels: [
      { id: 1, x: 0.025, y: 0.025, width: 0.95, height: 0.15 },
      { id: 2, x: 0.025, y: 0.2, width: 0.95, height: 0.15 },
      { id: 3, x: 0.025, y: 0.375, width: 0.95, height: 0.15 },
      { id: 4, x: 0.025, y: 0.55, width: 0.95, height: 0.15 },
      { id: 5, x: 0.025, y: 0.725, width: 0.95, height: 0.15 },
      { id: 6, x: 0.025, y: 0.9, width: 0.95, height: 0.075 },
    ],
  },
  "oneshot": {
    panels: [
      { id: 1, x: 0.025, y: 0.025, width: 0.95, height: 0.133 },
      { id: 2, x: 0.025, y: 0.183, width: 0.4625, height: 0.217 },
      { id: 3, x: 0.5125, y: 0.183, width: 0.4625, height: 0.217 },
      { id: 4, x: 0.025, y: 0.417, width: 0.95, height: 0.25 },
      { id: 5, x: 0.025, y: 0.683, width: 0.4625, height: 0.283 },
      { id: 6, x: 0.5125, y: 0.683, width: 0.4625, height: 0.283 },
    ],
  },
  "manga_page": {
    panels: [
      { id: 1, x: 0.025, y: 0.025, width: 0.95, height: 0.15 },
      { id: 2, x: 0.025, y: 0.2, width: 0.4625, height: 0.2 },
      { id: 3, x: 0.5125, y: 0.2, width: 0.4625, height: 0.2 },
      { id: 4, x: 0.025, y: 0.425, width: 0.3, height: 0.267 },
      { id: 5, x: 0.35, y: 0.425, width: 0.3, height: 0.267 },
      { id: 6, x: 0.675, y: 0.425, width: 0.3, height: 0.267 },
      { id: 7, x: 0.025, y: 0.7, width: 0.95, height: 0.275 },
    ],
  },
};
