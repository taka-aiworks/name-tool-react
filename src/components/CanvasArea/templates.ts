// src/components/CanvasArea/templates.ts - 座標統一修正版
import { Templates } from "../../types";

// 🔧 修正: 全テンプレートの座標を統一（800×1131キャンバス基準）
// KDP出版を考慮したマージン設定
// 上・左右: 20px、下: 35px（ページ番号用スペース確保）
// コマ間隔: 16px で統一
const MARGIN_TOP = 20;
const MARGIN_SIDES = 20;
const MARGIN_BOTTOM = 35;
const GAP = 16;
const CANVAS_W = 800;
const CANVAS_H = 600;
const USABLE_W = CANVAS_W - MARGIN_SIDES * 2; // 760
const USABLE_H = CANVAS_H - MARGIN_TOP - MARGIN_BOTTOM; // 545

export const templates: Templates = {
  // === 1コマテンプレート ===
  "single_impact": {
    panels: [
      { id: 1, x: MARGIN_SIDES, y: MARGIN_TOP, width: USABLE_W, height: USABLE_H },
    ],
  },

  // === 2コマテンプレート ===
  "split_horizontal": {
    panels: [
      { id: 2, x: MARGIN_SIDES, y: MARGIN_TOP, width: (USABLE_W - GAP) / 2, height: USABLE_H },  // 左コマは2番（後）
      { id: 1, x: MARGIN_SIDES + (USABLE_W - GAP) / 2 + GAP, y: MARGIN_TOP, width: (USABLE_W - GAP) / 2, height: USABLE_H }, // 右コマは1番（先）
    ],
  },
  "split_vertical": {
    panels: [
      { id: 1, x: MARGIN_SIDES, y: MARGIN_TOP, width: USABLE_W, height: (USABLE_H - GAP) / 2 },
      { id: 2, x: MARGIN_SIDES, y: MARGIN_TOP + (USABLE_H - GAP) / 2 + GAP, width: USABLE_W, height: (USABLE_H - GAP) / 2 },
    ],
  },
  "dialogue_2": {
    panels: [
      { id: 1, x: MARGIN_SIDES, y: MARGIN_TOP, width: USABLE_W, height: (USABLE_H - GAP) * 0.65 },  // メインコマ（65%）
      { id: 2, x: MARGIN_SIDES, y: MARGIN_TOP + (USABLE_H - GAP) * 0.65 + GAP, width: USABLE_W, height: (USABLE_H - GAP) * 0.35 }, // サブコマ（35%）
    ],
  },
  "main_sub": {
    panels: [
      { id: 2, x: MARGIN_SIDES, y: MARGIN_TOP, width: USABLE_W * 0.7, height: USABLE_H },  // 左の大コマは2番（70%に調整）
      { id: 1, x: MARGIN_SIDES + USABLE_W * 0.7 + GAP, y: MARGIN_TOP, width: USABLE_W * 0.3 - GAP, height: USABLE_H }, // 右の小コマは1番（30%に調整）
    ],
  },
  "custom": {
    panels: [
      { id: 1, x: MARGIN_SIDES, y: MARGIN_TOP, width: USABLE_W, height: (USABLE_H - GAP) / 2 },
      { id: 2, x: MARGIN_SIDES, y: MARGIN_TOP + (USABLE_H - GAP) / 2 + GAP, width: USABLE_W, height: (USABLE_H - GAP) / 2 },
    ],
  },

  // === 3コマテンプレート ===
  "three_vertical": {
    panels: [
      { id: 1, x: MARGIN_SIDES, y: MARGIN_TOP, width: USABLE_W, height: (USABLE_H - GAP * 2) / 3 },
      { id: 2, x: MARGIN_SIDES, y: MARGIN_TOP + (USABLE_H - GAP * 2) / 3 + GAP, width: USABLE_W, height: (USABLE_H - GAP * 2) / 3 },
      { id: 3, x: MARGIN_SIDES, y: MARGIN_TOP + (USABLE_H - GAP * 2) / 3 * 2 + GAP * 2, width: USABLE_W, height: (USABLE_H - GAP * 2) / 3 },
    ],
  },
  "t_shape": {
    panels: [
      { id: 1, x: MARGIN_SIDES, y: MARGIN_TOP, width: USABLE_W, height: (USABLE_H - GAP) * 0.4 },   // 上段は1番（40%に調整）
      { id: 3, x: MARGIN_SIDES, y: MARGIN_TOP + (USABLE_H - GAP) * 0.4 + GAP, width: (USABLE_W - GAP) / 2, height: (USABLE_H - GAP) * 0.6 },  // 左下は3番（60%に調整）
      { id: 2, x: MARGIN_SIDES + (USABLE_W - GAP) / 2 + GAP, y: MARGIN_TOP + (USABLE_H - GAP) * 0.4 + GAP, width: (USABLE_W - GAP) / 2, height: (USABLE_H - GAP) * 0.6 }, // 右下は2番（60%に調整）
    ],
  },
  "reverse_t": {
    panels: [
      { id: 2, x: MARGIN_SIDES, y: MARGIN_TOP, width: (USABLE_W - GAP) / 2, height: (USABLE_H - GAP) * 0.6 },  // 左上は2番（60%に調整）
      { id: 1, x: MARGIN_SIDES + (USABLE_W - GAP) / 2 + GAP, y: MARGIN_TOP, width: (USABLE_W - GAP) / 2, height: (USABLE_H - GAP) * 0.6 }, // 右上は1番（60%に調整）
      { id: 3, x: MARGIN_SIDES, y: MARGIN_TOP + (USABLE_H - GAP) * 0.6 + GAP, width: USABLE_W, height: (USABLE_H - GAP) * 0.4 }, // 下段は3番（40%に調整）
    ],
  },

  // === 4コマテンプレート ===
  "4koma": {
    panels: [
      { id: 1, x: MARGIN_SIDES, y: MARGIN_TOP, width: USABLE_W, height: (USABLE_H - GAP * 3) / 4 },
      { id: 2, x: MARGIN_SIDES, y: MARGIN_TOP + (USABLE_H - GAP * 3) / 4 + GAP, width: USABLE_W, height: (USABLE_H - GAP * 3) / 4 },
      { id: 3, x: MARGIN_SIDES, y: MARGIN_TOP + (USABLE_H - GAP * 3) / 4 * 2 + GAP * 2, width: USABLE_W, height: (USABLE_H - GAP * 3) / 4 },
      { id: 4, x: MARGIN_SIDES, y: MARGIN_TOP + (USABLE_H - GAP * 3) / 4 * 3 + GAP * 3, width: USABLE_W, height: (USABLE_H - GAP * 3) / 4 },
    ],
  },
  "grid_2x2": {
    panels: [
      { id: 2, x: MARGIN_SIDES, y: MARGIN_TOP, width: (USABLE_W - GAP) / 2, height: (USABLE_H - GAP) / 2 },  // 左上は2番
      { id: 1, x: MARGIN_SIDES + (USABLE_W - GAP) / 2 + GAP, y: MARGIN_TOP, width: (USABLE_W - GAP) / 2, height: (USABLE_H - GAP) / 2 }, // 右上は1番
      { id: 4, x: MARGIN_SIDES, y: MARGIN_TOP + (USABLE_H - GAP) / 2 + GAP, width: (USABLE_W - GAP) / 2, height: (USABLE_H - GAP) / 2 }, // 左下は4番
      { id: 3, x: MARGIN_SIDES + (USABLE_W - GAP) / 2 + GAP, y: MARGIN_TOP + (USABLE_H - GAP) / 2 + GAP, width: (USABLE_W - GAP) / 2, height: (USABLE_H - GAP) / 2 },// 右下は3番
    ],
  },
  "main_triple": {
    panels: [
      { id: 1, x: MARGIN_SIDES, y: MARGIN_TOP, width: USABLE_W, height: (USABLE_H - GAP) / 2 },  // 上段大コマは1番
      { id: 4, x: MARGIN_SIDES, y: MARGIN_TOP + (USABLE_H - GAP) / 2 + GAP, width: (USABLE_W - GAP * 2) / 3, height: (USABLE_H - GAP) / 2 }, // 左下は4番
      { id: 3, x: MARGIN_SIDES + (USABLE_W - GAP * 2) / 3 + GAP, y: MARGIN_TOP + (USABLE_H - GAP) / 2 + GAP, width: (USABLE_W - GAP * 2) / 3, height: (USABLE_H - GAP) / 2 },// 中下は3番
      { id: 2, x: MARGIN_SIDES + (USABLE_W - GAP * 2) / 3 * 2 + GAP * 2, y: MARGIN_TOP + (USABLE_H - GAP) / 2 + GAP, width: (USABLE_W - GAP * 2) / 3, height: (USABLE_H - GAP) / 2 },// 右下は2番
    ],
  },
  "triple_main": {
    panels: [
      { id: 3, x: MARGIN_SIDES, y: MARGIN_TOP, width: (USABLE_W - GAP * 2) / 3, height: (USABLE_H - GAP) / 2 },  // 左上は3番
      { id: 2, x: MARGIN_SIDES + (USABLE_W - GAP * 2) / 3 + GAP, y: MARGIN_TOP, width: (USABLE_W - GAP * 2) / 3, height: (USABLE_H - GAP) / 2 }, // 中上は2番
      { id: 1, x: MARGIN_SIDES + (USABLE_W - GAP * 2) / 3 * 2 + GAP * 2, y: MARGIN_TOP, width: (USABLE_W - GAP * 2) / 3, height: (USABLE_H - GAP) / 2 }, // 右上は1番
      { id: 4, x: MARGIN_SIDES, y: MARGIN_TOP + (USABLE_H - GAP) / 2 + GAP, width: USABLE_W, height: (USABLE_H - GAP) / 2 }, // 下段大コマは4番
    ],
  },
  "dialogue": {
    panels: [
      { id: 1, x: MARGIN_SIDES, y: MARGIN_TOP, width: USABLE_W, height: (USABLE_H - GAP * 2) * 0.25 },   // 上段は1番（25%）
      { id: 3, x: MARGIN_SIDES, y: MARGIN_TOP + (USABLE_H - GAP * 2) * 0.25 + GAP, width: (USABLE_W - GAP) / 2, height: (USABLE_H - GAP * 2) * 0.25 },  // 左中は3番（25%）
      { id: 2, x: MARGIN_SIDES + (USABLE_W - GAP) / 2 + GAP, y: MARGIN_TOP + (USABLE_H - GAP * 2) * 0.25 + GAP, width: (USABLE_W - GAP) / 2, height: (USABLE_H - GAP * 2) * 0.25 }, // 右中は2番（25%）
      { id: 4, x: MARGIN_SIDES, y: MARGIN_TOP + (USABLE_H - GAP * 2) * 0.5 + GAP * 2, width: USABLE_W, height: (USABLE_H - GAP * 2) * 0.5 },  // 下段は4番（50%）
    ],
  },
  "action": {
    panels: [
      { id: 3, x: MARGIN_SIDES, y: MARGIN_TOP, width: (USABLE_W - GAP) * 0.35, height: (USABLE_H - GAP) * 0.5 },  // 左は3番（35%に調整）
      { id: 1, x: MARGIN_SIDES + (USABLE_W - GAP) * 0.35 + GAP, y: MARGIN_TOP, width: (USABLE_W - GAP) * 0.65, height: ((USABLE_H - GAP) * 0.5 - GAP) / 2 }, // 右上は1番（65%に調整）
      { id: 2, x: MARGIN_SIDES + (USABLE_W - GAP) * 0.35 + GAP, y: MARGIN_TOP + ((USABLE_H - GAP) * 0.5 - GAP) / 2 + GAP, width: (USABLE_W - GAP) * 0.65, height: ((USABLE_H - GAP) * 0.5 - GAP) / 2 },// 右下は2番（65%に調整）
      { id: 4, x: MARGIN_SIDES, y: MARGIN_TOP + (USABLE_H - GAP) * 0.5 + GAP, width: USABLE_W, height: (USABLE_H - GAP) * 0.5 }, // 下段は4番
    ],
  },
  "emotional": {
    panels: [
      { id: 3, x: MARGIN_SIDES, y: MARGIN_TOP, width: USABLE_W * 0.65, height: USABLE_H * 0.5 },  // 左は3番（65%に調整）
      { id: 1, x: MARGIN_SIDES + USABLE_W * 0.65 + GAP, y: MARGIN_TOP, width: USABLE_W * 0.35 - GAP, height: (USABLE_H * 0.5 - GAP) / 2 }, // 右上は1番（35%に調整）
      { id: 2, x: MARGIN_SIDES + USABLE_W * 0.65 + GAP, y: MARGIN_TOP + (USABLE_H * 0.5 - GAP) / 2 + GAP, width: USABLE_W * 0.35 - GAP, height: (USABLE_H * 0.5 - GAP) / 2 },// 右下は2番（35%に調整）
      { id: 4, x: MARGIN_SIDES, y: MARGIN_TOP + USABLE_H * 0.5 + GAP, width: USABLE_W, height: USABLE_H * 0.5 - GAP }, // 下段は4番
    ],
  },

  // === 5コマテンプレート ===
  "gag": {
    panels: [
      { id: 1, x: MARGIN_SIDES, y: MARGIN_TOP, width: USABLE_W, height: USABLE_H * 0.25 },  // 上段は1番
      { id: 4, x: MARGIN_SIDES, y: MARGIN_TOP + USABLE_H * 0.25 + GAP, width: (USABLE_W - GAP * 2) / 3, height: USABLE_H * 0.35 }, // 左中は4番
      { id: 3, x: MARGIN_SIDES + (USABLE_W - GAP * 2) / 3 + GAP, y: MARGIN_TOP + USABLE_H * 0.25 + GAP, width: (USABLE_W - GAP * 2) / 3, height: USABLE_H * 0.35 },// 中中は3番
      { id: 2, x: MARGIN_SIDES + (USABLE_W - GAP * 2) / 3 * 2 + GAP * 2, y: MARGIN_TOP + USABLE_H * 0.25 + GAP, width: (USABLE_W - GAP * 2) / 3, height: USABLE_H * 0.35 },// 右中は2番
      { id: 5, x: MARGIN_SIDES, y: MARGIN_TOP + USABLE_H * 0.6 + GAP * 2, width: USABLE_W, height: USABLE_H * 0.4 - GAP * 2 }, // 下段は5番
    ],
  },
  "spread": {
    panels: [
      { id: 1, x: MARGIN_SIDES, y: MARGIN_TOP, width: USABLE_W, height: USABLE_H * 0.35 },  // 上段は1番
      { id: 4, x: MARGIN_SIDES, y: MARGIN_TOP + USABLE_H * 0.35 + GAP, width: (USABLE_W - GAP * 2) / 3, height: USABLE_H * 0.3 }, // 左中は4番
      { id: 3, x: MARGIN_SIDES + (USABLE_W - GAP * 2) / 3 + GAP, y: MARGIN_TOP + USABLE_H * 0.35 + GAP, width: (USABLE_W - GAP * 2) / 3, height: USABLE_H * 0.3 },// 中中は3番
      { id: 2, x: MARGIN_SIDES + (USABLE_W - GAP * 2) / 3 * 2 + GAP * 2, y: MARGIN_TOP + USABLE_H * 0.35 + GAP, width: (USABLE_W - GAP * 2) / 3, height: USABLE_H * 0.3 },// 右中は2番
      { id: 5, x: MARGIN_SIDES, y: MARGIN_TOP + USABLE_H * 0.65 + GAP * 2, width: USABLE_W, height: USABLE_H * 0.35 - GAP * 2 }, // 下段は5番
    ],
  },
  "web_standard": {
    panels: [
      { id: 1, x: MARGIN_SIDES, y: MARGIN_TOP, width: USABLE_W, height: (USABLE_H - GAP * 4) / 5 },
      { id: 2, x: MARGIN_SIDES, y: MARGIN_TOP + (USABLE_H - GAP * 4) / 5 + GAP, width: USABLE_W, height: (USABLE_H - GAP * 4) / 5 },
      { id: 3, x: MARGIN_SIDES, y: MARGIN_TOP + (USABLE_H - GAP * 4) / 5 * 2 + GAP * 2, width: USABLE_W, height: (USABLE_H - GAP * 4) / 5 },
      { id: 4, x: MARGIN_SIDES, y: MARGIN_TOP + (USABLE_H - GAP * 4) / 5 * 3 + GAP * 3, width: USABLE_W, height: (USABLE_H - GAP * 4) / 5 },
      { id: 5, x: MARGIN_SIDES, y: MARGIN_TOP + (USABLE_H - GAP * 4) / 5 * 4 + GAP * 4, width: USABLE_W, height: (USABLE_H - GAP * 4) / 5 },
    ],
  },

  // === 6コマ以上テンプレート ===
  "vertical": {
    panels: [
      { id: 1, x: 20, y: 20, width: 760, height: 90 },
      { id: 2, x: 20, y: 120, width: 760, height: 90 },
      { id: 3, x: 20, y: 220, width: 760, height: 90 },
      { id: 4, x: 20, y: 320, width: 760, height: 90 },
      { id: 5, x: 20, y: 420, width: 760, height: 90 },
      { id: 6, x: 20, y: 520, width: 760, height: 60 },
    ],
  },
  "oneshot": {
    panels: [
      { id: 1, x: 20, y: 20, width: 760, height: 80 },
      { id: 2, x: 20, y: 110, width: 370, height: 130 },
      { id: 3, x: 410, y: 110, width: 370, height: 130 },
      { id: 4, x: 20, y: 250, width: 760, height: 150 },
      { id: 5, x: 20, y: 410, width: 370, height: 170 },
      { id: 6, x: 410, y: 410, width: 370, height: 170 },
    ],
  },
  "manga_page": {
    panels: [
      { id: 1, x: 20, y: 20, width: 760, height: 90 },
      { id: 2, x: 20, y: 120, width: 370, height: 120 },
      { id: 3, x: 410, y: 120, width: 370, height: 120 },
      { id: 4, x: 20, y: 250, width: 240, height: 160 },
      { id: 5, x: 280, y: 250, width: 240, height: 160 },
      { id: 6, x: 540, y: 250, width: 240, height: 160 },
      { id: 7, x: 20, y: 420, width: 760, height: 160 },
    ],
  },
};

// テンプレート説明（UI表示用）
export const templateDescriptions: Record<string, string> = {
  // 1コマ
  "single_impact": "見開きインパクト - 迫力の全面1コマ",
  
  // 2コマ
  "split_horizontal": "左右分割 - 会話・対峙・比較",
  "split_vertical": "上下分割 - ビフォーアフター・時間経過", 
  "dialogue_2": "大小分割 - メイン+リアクション",
  "main_sub": "メイン+サブ - 主軸+補足・心境",
  "custom": "シンプル2分割 - 基本・カスタム用",
  
  // 3コマ
  "three_vertical": "縦3分割 - 時系列・手順・起承転",
  "t_shape": "T字型 - 導入+展開詳細",
  "reverse_t": "逆T字型 - 前振り+クライマックス（スタンダード）",
  
  // 4コマ
  "4koma": "4コマ漫画 - 起承転結の縦4分割",
  "grid_2x2": "2×2グリッド - 会話・平行進行・比較",
  "main_triple": "1大+3小 - 導入+詳細描写", 
  "triple_main": "3小+1大 - 前振り+オチ・結論",
  "dialogue": "会話レイアウト - 会話シーン・ドラマ",
  "action": "アクション - バトル・スポーツ",
  "emotional": "感情表現 - ドラマ・恋愛",
  
  // 5コマ
  "gag": "ギャグ構成 - コメディ・ギャグ",
  "spread": "見開き風 - 迫力・見せ場",
  "web_standard": "Web漫画 - Web連載・SNS",
  
  // 6コマ以上
  "vertical": "縦読み - SNS・縦スクロール",
  "oneshot": "1ページ完結 - 読み切り・短編",
  "manga_page": "商業誌風 - 商業・プロ仕様",
};

// コマ数別分類
export const templateCategories: Record<string, string[]> = {
  "1コマ": ["single_impact"],
  "2コマ": ["split_horizontal", "split_vertical", "dialogue_2", "main_sub", "custom"],
  "3コマ": ["three_vertical", "t_shape", "reverse_t"],
  "4コマ": ["4koma", "grid_2x2", "main_triple", "triple_main", "dialogue", "action", "emotional"],
  "5コマ": ["gag", "spread", "web_standard"],
  "6コマ以上": ["vertical", "oneshot", "manga_page"],
};

// 人気テンプレート
export const popularTemplates: string[] = [
  "single_impact",
  "split_horizontal", 
  "split_vertical",
  "dialogue_2",
  "main_sub",
  "three_vertical",
  "t_shape", 
  "reverse_t",
  "4koma",
  "grid_2x2",
  "main_triple",
  "triple_main",
  "manga_page",
  "web_standard",
  "vertical"
];