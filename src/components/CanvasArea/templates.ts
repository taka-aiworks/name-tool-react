// src/components/CanvasArea/templates.ts - A4サイズ対応修正版
import { Templates } from "../../types";

// 🎯 A4サイズ（2480×3508px）用に座標を4倍スケール修正
export const templates: Templates = {
  // === 1コマテンプレート ===
  "single_impact": {
    panels: [
      { id: 1, x: 80, y: 80, width: 2240, height: 2840 },
    ],
  },

  // === 2コマテンプレート ===
  "split_horizontal": {
    panels: [
      { id: 1, x: 80, y: 80, width: 1100, height: 2840 },
      { id: 2, x: 1220, y: 80, width: 1100, height: 2840 },
    ],
  },
  "split_vertical": {
    panels: [
      { id: 1, x: 80, y: 80, width: 2240, height: 1400 },
      { id: 2, x: 80, y: 1520, width: 2240, height: 1400 },
    ],
  },
  "dialogue_2": {
    panels: [
      { id: 1, x: 80, y: 80, width: 2240, height: 2000 },
      { id: 2, x: 80, y: 2120, width: 2240, height: 800 },
    ],
  },
  "main_sub": {
    panels: [
      { id: 1, x: 80, y: 80, width: 1560, height: 2840 },
      { id: 2, x: 1680, y: 80, width: 640, height: 2840 },
    ],
  },
  "custom": {
    panels: [
      { id: 1, x: 80, y: 80, width: 2240, height: 1400 },
      { id: 2, x: 80, y: 1520, width: 2240, height: 1400 },
    ],
  },

  // === 3コマテンプレート ===
  "three_vertical": {
    panels: [
      { id: 1, x: 80, y: 80, width: 2240, height: 920 },
      { id: 2, x: 80, y: 1040, width: 2240, height: 920 },
      { id: 3, x: 80, y: 2000, width: 2240, height: 920 },
    ],
  },
  "t_shape": {
    panels: [
      { id: 1, x: 80, y: 80, width: 2240, height: 960 },
      { id: 2, x: 80, y: 1080, width: 1100, height: 1840 },
      { id: 3, x: 1220, y: 1080, width: 1100, height: 1840 },
    ],
  },
  "reverse_t": {
    panels: [
      { id: 1, x: 80, y: 80, width: 1100, height: 1840 },
      { id: 2, x: 1220, y: 80, width: 1100, height: 1840 },
      { id: 3, x: 80, y: 1960, width: 2240, height: 960 },
    ],
  },

  // === 4コマテンプレート ===
  "4koma": {
    panels: [
      { id: 1, x: 80, y: 80, width: 2240, height: 680 },
      { id: 2, x: 80, y: 800, width: 2240, height: 680 },
      { id: 3, x: 80, y: 1520, width: 2240, height: 680 },
      { id: 4, x: 80, y: 2240, width: 2240, height: 680 },
    ],
  },
  "grid_2x2": {
    panels: [
      { id: 1, x: 80, y: 80, width: 1100, height: 1400 },
      { id: 2, x: 1220, y: 80, width: 1100, height: 1400 },
      { id: 3, x: 80, y: 1520, width: 1100, height: 1400 },
      { id: 4, x: 1220, y: 1520, width: 1100, height: 1400 },
    ],
  },
  "main_triple": {
    panels: [
      { id: 1, x: 80, y: 80, width: 2240, height: 1400 },
      { id: 2, x: 80, y: 1520, width: 720, height: 1400 },
      { id: 3, x: 840, y: 1520, width: 720, height: 1400 },
      { id: 4, x: 1600, y: 1520, width: 720, height: 1400 },
    ],
  },
  "triple_main": {
    panels: [
      { id: 1, x: 80, y: 80, width: 720, height: 1400 },
      { id: 2, x: 840, y: 80, width: 720, height: 1400 },
      { id: 3, x: 1600, y: 80, width: 720, height: 1400 },
      { id: 4, x: 80, y: 1520, width: 2240, height: 1400 },
    ],
  },
  "dialogue": {
    panels: [
      { id: 1, x: 80, y: 80, width: 2240, height: 800 },
      { id: 2, x: 80, y: 920, width: 1100, height: 800 },
      { id: 3, x: 1220, y: 920, width: 1100, height: 800 },
      { id: 4, x: 80, y: 1760, width: 2240, height: 1160 },
    ],
  },
  "action": {
    panels: [
      { id: 1, x: 80, y: 80, width: 800, height: 1200 },
      { id: 2, x: 920, y: 80, width: 1400, height: 580 },
      { id: 3, x: 920, y: 700, width: 1400, height: 580 },
      { id: 4, x: 80, y: 1320, width: 2240, height: 1600 },
    ],
  },
  "emotional": {
    panels: [
      { id: 1, x: 80, y: 80, width: 1440, height: 1200 },
      { id: 2, x: 1560, y: 80, width: 760, height: 580 },
      { id: 3, x: 1560, y: 700, width: 760, height: 580 },
      { id: 4, x: 80, y: 1320, width: 2240, height: 1600 },
    ],
  },

  // === 5コマテンプレート ===
  "gag": {
    panels: [
      { id: 1, x: 80, y: 80, width: 2240, height: 600 },
      { id: 2, x: 80, y: 720, width: 720, height: 800 },
      { id: 3, x: 840, y: 720, width: 720, height: 800 },
      { id: 4, x: 1600, y: 720, width: 720, height: 800 },
      { id: 5, x: 80, y: 1560, width: 2240, height: 1360 },
    ],
  },
  "spread": {
    panels: [
      { id: 1, x: 80, y: 80, width: 2240, height: 1200 },
      { id: 2, x: 80, y: 1320, width: 720, height: 720 },
      { id: 3, x: 840, y: 1320, width: 720, height: 720 },
      { id: 4, x: 1600, y: 1320, width: 720, height: 720 },
      { id: 5, x: 80, y: 2080, width: 2240, height: 840 },
    ],
  },
  "web_standard": {
    panels: [
      { id: 1, x: 80, y: 80, width: 2240, height: 560 },
      { id: 2, x: 80, y: 680, width: 2240, height: 560 },
      { id: 3, x: 80, y: 1280, width: 2240, height: 560 },
      { id: 4, x: 80, y: 1880, width: 2240, height: 560 },
      { id: 5, x: 80, y: 2480, width: 2240, height: 440 },
    ],
  },

  // === 6コマ以上テンプレート ===
  "vertical": {
    panels: [
      { id: 1, x: 80, y: 80, width: 2240, height: 480 },
      { id: 2, x: 80, y: 600, width: 2240, height: 480 },
      { id: 3, x: 80, y: 1120, width: 2240, height: 480 },
      { id: 4, x: 80, y: 1640, width: 2240, height: 480 },
      { id: 5, x: 80, y: 2160, width: 2240, height: 480 },
      { id: 6, x: 80, y: 2680, width: 2240, height: 480 },
    ],
  },
  "oneshot": {
    panels: [
      { id: 1, x: 80, y: 80, width: 2240, height: 400 },
      { id: 2, x: 80, y: 520, width: 1100, height: 720 },
      { id: 3, x: 1220, y: 520, width: 1100, height: 720 },
      { id: 4, x: 80, y: 1280, width: 2240, height: 800 },
      { id: 5, x: 80, y: 2120, width: 1100, height: 640 },
      { id: 6, x: 1220, y: 2120, width: 1100, height: 640 },
    ],
  },
  "manga_page": {
    panels: [
      { id: 1, x: 80, y: 80, width: 2240, height: 480 },
      { id: 2, x: 80, y: 600, width: 1100, height: 640 },
      { id: 3, x: 1220, y: 600, width: 1100, height: 640 },
      { id: 4, x: 80, y: 1280, width: 720, height: 800 },
      { id: 5, x: 840, y: 1280, width: 720, height: 800 },
      { id: 6, x: 1600, y: 1280, width: 720, height: 800 },
      { id: 7, x: 80, y: 2120, width: 2240, height: 800 },
    ],
  },
};

// templates.tsファイルの最後に追加

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
  "reverse_t": "逆T字型 - 前振り+クライマックス",
  
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