// src/components/CanvasArea/templates.ts - 即座修正版
import { Templates } from "../../types";

// 🎯 実用性重視のパネルテンプレート（固定値版に戻す）
export const templates: Templates = {
  // === 1コマテンプレート ===
  "single_impact": {
    panels: [
      { id: 1, x: 20, y: 20, width: 560, height: 710 },
    ],
  },

  // === 2コマテンプレート ===
  "split_horizontal": {
    panels: [
      { id: 1, x: 20, y: 20, width: 275, height: 710 },
      { id: 2, x: 305, y: 20, width: 275, height: 710 },
    ],
  },
  "split_vertical": {
    panels: [
      { id: 1, x: 20, y: 20, width: 560, height: 350 },
      { id: 2, x: 20, y: 380, width: 560, height: 350 },
    ],
  },
  "dialogue_2": {
    panels: [
      { id: 1, x: 20, y: 20, width: 560, height: 500 },
      { id: 2, x: 20, y: 530, width: 560, height: 200 },
    ],
  },
  "main_sub": {
    panels: [
      { id: 1, x: 20, y: 20, width: 390, height: 710 },
      { id: 2, x: 420, y: 20, width: 160, height: 710 },
    ],
  },
  "custom": {
    panels: [
      { id: 1, x: 20, y: 20, width: 560, height: 350 },
      { id: 2, x: 20, y: 380, width: 560, height: 350 },
    ],
  },

  // === 3コマテンプレート ===
  "three_vertical": {
    panels: [
      { id: 1, x: 20, y: 20, width: 560, height: 230 },
      { id: 2, x: 20, y: 260, width: 560, height: 230 },
      { id: 3, x: 20, y: 500, width: 560, height: 230 },
    ],
  },
  "t_shape": {
    panels: [
      { id: 1, x: 20, y: 20, width: 560, height: 240 },
      { id: 2, x: 20, y: 270, width: 275, height: 460 },
      { id: 3, x: 305, y: 270, width: 275, height: 460 },
    ],
  },
  "reverse_t": {
    panels: [
      { id: 1, x: 20, y: 20, width: 275, height: 460 },
      { id: 2, x: 305, y: 20, width: 275, height: 460 },
      { id: 3, x: 20, y: 490, width: 560, height: 240 },
    ],
  },

  // === 4コマテンプレート ===
  "4koma": {
    panels: [
      { id: 1, x: 20, y: 20, width: 560, height: 170 },
      { id: 2, x: 20, y: 200, width: 560, height: 170 },
      { id: 3, x: 20, y: 380, width: 560, height: 170 },
      { id: 4, x: 20, y: 560, width: 560, height: 170 },
    ],
  },
  "grid_2x2": {
    panels: [
      { id: 1, x: 20, y: 20, width: 275, height: 350 },
      { id: 2, x: 305, y: 20, width: 275, height: 350 },
      { id: 3, x: 20, y: 380, width: 275, height: 350 },
      { id: 4, x: 305, y: 380, width: 275, height: 350 },
    ],
  },
  "main_triple": {
    panels: [
      { id: 1, x: 20, y: 20, width: 560, height: 350 },
      { id: 2, x: 20, y: 380, width: 180, height: 350 },
      { id: 3, x: 210, y: 380, width: 180, height: 350 },
      { id: 4, x: 400, y: 380, width: 180, height: 350 },
    ],
  },
  "triple_main": {
    panels: [
      { id: 1, x: 20, y: 20, width: 180, height: 350 },
      { id: 2, x: 210, y: 20, width: 180, height: 350 },
      { id: 3, x: 400, y: 20, width: 180, height: 350 },
      { id: 4, x: 20, y: 380, width: 560, height: 350 },
    ],
  },
  "dialogue": {
    panels: [
      { id: 1, x: 20, y: 20, width: 560, height: 200 },
      { id: 2, x: 20, y: 230, width: 275, height: 200 },
      { id: 3, x: 305, y: 230, width: 275, height: 200 },
      { id: 4, x: 20, y: 440, width: 560, height: 290 },
    ],
  },
  "action": {
    panels: [
      { id: 1, x: 20, y: 20, width: 200, height: 300 },
      { id: 2, x: 230, y: 20, width: 350, height: 145 },
      { id: 3, x: 230, y: 175, width: 350, height: 145 },
      { id: 4, x: 20, y: 330, width: 560, height: 400 },
    ],
  },
  "emotional": {
    panels: [
      { id: 1, x: 20, y: 20, width: 360, height: 300 },
      { id: 2, x: 390, y: 20, width: 190, height: 145 },
      { id: 3, x: 390, y: 175, width: 190, height: 145 },
      { id: 4, x: 20, y: 330, width: 560, height: 400 },
    ],
  },

  // === 5コマテンプレート ===
  "gag": {
    panels: [
      { id: 1, x: 20, y: 20, width: 560, height: 150 },
      { id: 2, x: 20, y: 180, width: 180, height: 200 },
      { id: 3, x: 210, y: 180, width: 180, height: 200 },
      { id: 4, x: 400, y: 180, width: 180, height: 200 },
      { id: 5, x: 20, y: 390, width: 560, height: 340 },
    ],
  },
  "spread": {
    panels: [
      { id: 1, x: 20, y: 20, width: 560, height: 300 },
      { id: 2, x: 20, y: 330, width: 180, height: 180 },
      { id: 3, x: 210, y: 330, width: 180, height: 180 },
      { id: 4, x: 400, y: 330, width: 180, height: 180 },
      { id: 5, x: 20, y: 520, width: 560, height: 210 },
    ],
  },
  "web_standard": {
    panels: [
      { id: 1, x: 20, y: 20, width: 560, height: 140 },
      { id: 2, x: 20, y: 170, width: 560, height: 140 },
      { id: 3, x: 20, y: 320, width: 560, height: 140 },
      { id: 4, x: 20, y: 470, width: 560, height: 140 },
      { id: 5, x: 20, y: 620, width: 560, height: 110 },
    ],
  },

  // === 6コマ以上テンプレート ===
  "vertical": {
    panels: [
      { id: 1, x: 20, y: 20, width: 560, height: 120 },
      { id: 2, x: 20, y: 150, width: 560, height: 120 },
      { id: 3, x: 20, y: 280, width: 560, height: 120 },
      { id: 4, x: 20, y: 410, width: 560, height: 120 },
      { id: 5, x: 20, y: 540, width: 560, height: 120 },
      { id: 6, x: 20, y: 670, width: 560, height: 120 },
    ],
  },
  "oneshot": {
    panels: [
      { id: 1, x: 20, y: 20, width: 560, height: 100 },
      { id: 2, x: 20, y: 130, width: 275, height: 180 },
      { id: 3, x: 305, y: 130, width: 275, height: 180 },
      { id: 4, x: 20, y: 320, width: 560, height: 200 },
      { id: 5, x: 20, y: 530, width: 275, height: 160 },
      { id: 6, x: 305, y: 530, width: 275, height: 160 },
    ],
  },
  "manga_page": {
    panels: [
      { id: 1, x: 20, y: 20, width: 560, height: 120 },
      { id: 2, x: 20, y: 150, width: 275, height: 160 },
      { id: 3, x: 305, y: 150, width: 275, height: 160 },
      { id: 4, x: 20, y: 320, width: 180, height: 200 },
      { id: 5, x: 210, y: 320, width: 180, height: 200 },
      { id: 6, x: 400, y: 320, width: 180, height: 200 },
      { id: 7, x: 20, y: 530, width: 560, height: 200 },
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