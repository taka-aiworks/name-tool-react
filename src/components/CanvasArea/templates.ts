// src/components/CanvasArea/templates.ts - 座標統一修正版
import { Templates } from "../../types";

// 🔧 修正: 全テンプレートの座標を統一（800×600キャンバス基準）
export const templates: Templates = {
  // === 1コマテンプレート ===
  "single_impact": {
    panels: [
      { id: 1, x: 20, y: 20, width: 760, height: 560 },
    ],
  },

  // === 2コマテンプレート ===
  "split_horizontal": {
    panels: [
      { id: 1, x: 20, y: 20, width: 370, height: 560 },
      { id: 2, x: 410, y: 20, width: 370, height: 560 },
    ],
  },
  "split_vertical": {
    panels: [
      { id: 1, x: 20, y: 20, width: 760, height: 270 },
      { id: 2, x: 20, y: 310, width: 760, height: 270 },
    ],
  },
  "dialogue_2": {
    panels: [
      { id: 1, x: 20, y: 20, width: 760, height: 400 },
      { id: 2, x: 20, y: 440, width: 760, height: 140 },
    ],
  },
  "main_sub": {
    panels: [
      { id: 1, x: 20, y: 20, width: 520, height: 560 },
      { id: 2, x: 560, y: 20, width: 220, height: 560 },
    ],
  },
  "custom": {
    panels: [
      { id: 1, x: 20, y: 20, width: 760, height: 270 },
      { id: 2, x: 20, y: 310, width: 760, height: 270 },
    ],
  },

  // === 3コマテンプレート ===
  "three_vertical": {
    panels: [
      { id: 1, x: 20, y: 20, width: 760, height: 150 },
      { id: 2, x: 20, y: 190, width: 760, height: 150 },
      { id: 3, x: 20, y: 360, width: 760, height: 150 },
    ],
  },
  "t_shape": {
    panels: [
      { id: 1, x: 20, y: 20, width: 760, height: 150 },
      { id: 2, x: 20, y: 190, width: 370, height: 300 },
      { id: 3, x: 410, y: 190, width: 370, height: 300 },
    ],
  },
  "reverse_t": {
    panels: [
      { id: 1, x: 20, y: 20, width: 370, height: 300 },
      { id: 2, x: 410, y: 20, width: 370, height: 300 },
      { id: 3, x: 20, y: 340, width: 760, height: 150 },
    ],
  },

  // === 4コマテンプレート ===
  "4koma": {
    panels: [
      { id: 1, x: 20, y: 20, width: 760, height: 120 },
      { id: 2, x: 20, y: 150, width: 760, height: 120 },
      { id: 3, x: 20, y: 280, width: 760, height: 120 },
      { id: 4, x: 20, y: 410, width: 760, height: 120 },
    ],
  },
  "grid_2x2": {
    panels: [
      { id: 1, x: 20, y: 20, width: 370, height: 250 },
      { id: 2, x: 410, y: 20, width: 370, height: 250 },
      { id: 3, x: 20, y: 290, width: 370, height: 250 },
      { id: 4, x: 410, y: 290, width: 370, height: 250 },
    ],
  },
  "main_triple": {
    panels: [
      { id: 1, x: 20, y: 20, width: 760, height: 270 },
      { id: 2, x: 20, y: 310, width: 240, height: 270 },
      { id: 3, x: 280, y: 310, width: 240, height: 270 },
      { id: 4, x: 540, y: 310, width: 240, height: 270 },
    ],
  },
  "triple_main": {
    panels: [
      { id: 1, x: 20, y: 20, width: 240, height: 270 },
      { id: 2, x: 280, y: 20, width: 240, height: 270 },
      { id: 3, x: 540, y: 20, width: 240, height: 270 },
      { id: 4, x: 20, y: 310, width: 760, height: 270 },
    ],
  },
  "dialogue": {
    panels: [
      { id: 1, x: 20, y: 20, width: 760, height: 160 },
      { id: 2, x: 20, y: 190, width: 370, height: 160 },
      { id: 3, x: 410, y: 190, width: 370, height: 160 },
      { id: 4, x: 20, y: 360, width: 760, height: 220 },
    ],
  },
  "action": {
    panels: [
      { id: 1, x: 20, y: 20, width: 240, height: 280 },
      { id: 2, x: 280, y: 20, width: 500, height: 130 },
      { id: 3, x: 280, y: 170, width: 500, height: 130 },
      { id: 4, x: 20, y: 320, width: 760, height: 260 },
    ],
  },
  "emotional": {
    panels: [
      { id: 1, x: 20, y: 20, width: 480, height: 280 },
      { id: 2, x: 520, y: 20, width: 260, height: 130 },
      { id: 3, x: 520, y: 170, width: 260, height: 130 },
      { id: 4, x: 20, y: 320, width: 760, height: 260 },
    ],
  },

  // === 5コマテンプレート ===
  "gag": {
    panels: [
      { id: 1, x: 20, y: 20, width: 760, height: 120 },
      { id: 2, x: 20, y: 150, width: 240, height: 180 },
      { id: 3, x: 280, y: 150, width: 240, height: 180 },
      { id: 4, x: 540, y: 150, width: 240, height: 180 },
      { id: 5, x: 20, y: 340, width: 760, height: 240 },
    ],
  },
  "spread": {
    panels: [
      { id: 1, x: 20, y: 20, width: 760, height: 200 },
      { id: 2, x: 20, y: 230, width: 240, height: 150 },
      { id: 3, x: 280, y: 230, width: 240, height: 150 },
      { id: 4, x: 540, y: 230, width: 240, height: 150 },
      { id: 5, x: 20, y: 390, width: 760, height: 190 },
    ],
  },
  "web_standard": {
    panels: [
      { id: 1, x: 20, y: 20, width: 760, height: 110 },
      { id: 2, x: 20, y: 140, width: 760, height: 110 },
      { id: 3, x: 20, y: 260, width: 760, height: 110 },
      { id: 4, x: 20, y: 380, width: 760, height: 110 },
      { id: 5, x: 20, y: 500, width: 760, height: 80 },
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