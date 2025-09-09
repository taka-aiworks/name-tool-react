// src/components/CanvasArea/templates.ts (シンプル化版)
import { Templates } from "../../types";

export const templates: Templates = {
  "4koma": {
    panels: [
      { id: 1, x: 50, y: 50, width: 500, height: 170 },
      { id: 2, x: 50, y: 240, width: 500, height: 170 },
      { id: 3, x: 50, y: 430, width: 500, height: 170 },
      { id: 4, x: 50, y: 620, width: 500, height: 170 },
    ],
  },
  dialogue: {
    panels: [
      { id: 1, x: 50, y: 50, width: 500, height: 200 },
      { id: 2, x: 50, y: 270, width: 240, height: 200 },
      { id: 3, x: 310, y: 270, width: 240, height: 200 },
      { id: 4, x: 50, y: 490, width: 500, height: 260 },
    ],
  },
  // templates.ts のアクションテンプレート修正版

  action: {
    panels: [
      { id: 1, x: 50, y: 50, width: 200, height: 300 },
      { id: 2, x: 270, y: 50, width: 280, height: 170 }, // 高さを170に縮小
      { id: 3, x: 270, y: 240, width: 280, height: 110 }, // y位置を240に移動（20px隙間）
      { id: 4, x: 50, y: 370, width: 500, height: 380 },
    ],
  },
  emotional: {
    panels: [
      { id: 1, x: 50, y: 50, width: 320, height: 300 },
      { id: 2, x: 390, y: 50, width: 160, height: 140 },
      { id: 3, x: 390, y: 210, width: 160, height: 140 },
      { id: 4, x: 50, y: 370, width: 500, height: 380 },
    ],
  },
  gag: {
    panels: [
      { id: 1, x: 50, y: 50, width: 500, height: 150 },
      { id: 2, x: 50, y: 220, width: 160, height: 200 },
      { id: 3, x: 230, y: 220, width: 160, height: 200 },
      { id: 4, x: 410, y: 220, width: 140, height: 200 },
      { id: 5, x: 50, y: 440, width: 500, height: 310 },
    ],
  },
  custom: {
    panels: [
      { id: 1, x: 100, y: 100, width: 400, height: 300 },
      { id: 2, x: 100, y: 450, width: 400, height: 300 },
    ],
  },
  // 🆕 新テンプレート追加
  vertical: {
    panels: [
      { id: 1, x: 50, y: 50, width: 500, height: 120 },
      { id: 2, x: 50, y: 180, width: 500, height: 120 },
      { id: 3, x: 50, y: 310, width: 500, height: 120 },
      { id: 4, x: 50, y: 440, width: 500, height: 120 },
      { id: 5, x: 50, y: 570, width: 500, height: 120 },
      { id: 6, x: 50, y: 700, width: 500, height: 120 },
    ],
  },
  oneshot: {
    panels: [
      { id: 1, x: 50, y: 50, width: 500, height: 100 }, // タイトル
      { id: 2, x: 50, y: 170, width: 240, height: 180 }, // 導入
      { id: 3, x: 310, y: 170, width: 240, height: 180 }, // 展開
      { id: 4, x: 50, y: 370, width: 500, height: 200 }, // クライマックス
      { id: 5, x: 50, y: 590, width: 240, height: 160 }, // 結末
      { id: 6, x: 310, y: 590, width: 240, height: 160 }, // オチ
    ],
  },
  spread: {
    panels: [
      { id: 1, x: 50, y: 50, width: 500, height: 300 }, // 大ゴマ見開き風
      { id: 2, x: 50, y: 370, width: 160, height: 180 }, // 小ゴマ1
      { id: 3, x: 220, y: 370, width: 160, height: 180 }, // 小ゴマ2
      { id: 4, x: 390, y: 370, width: 160, height: 180 }, // 小ゴマ3
      { id: 5, x: 50, y: 570, width: 500, height: 180 }, // 締めゴマ
    ],
  },
};

// 🗑️ 自動配置機能削除
// - applyTemplateDefaults 関数削除
// - generateUniqueId 関数削除  
// - templateDefaults オブジェクト削除

// 🆕 テンプレート説明（UI表示用）
export const templateDescriptions: Record<string, string> = {
  "4koma": "4コマ漫画の基本構成（起承転結）",
  "dialogue": "会話重視のレイアウト（全体→アップ→結論）",
  "action": "アクション・ダイナミックな構成",
  "emotional": "感情表現重視の構成",
  "gag": "ギャグ・コメディのテンポ重視",
  "custom": "シンプルなカスタム用",
  "vertical": "縦読み（SNS・Webコミック用）",
  "oneshot": "1ページ完結（読み切り用）",
  "spread": "見開き風（迫力重視）",
};

// 🆕 テンプレートカテゴリ（将来の拡張用）
export const templateCategories: Record<string, string[]> = {
  "基本": ["4koma", "dialogue", "custom"],
  "表現特化": ["action", "emotional", "gag"],
  "現代的": ["vertical", "oneshot", "spread"],
};