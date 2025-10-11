/**
 * アプリケーション全体の統一カラーパレット
 * 
 * 🎨 色分けルール（直感的で覚えやすい）:
 * 
 * 💚 緑色系統 = ファイル操作（保存、作成、読み込み）
 * 🔵 青色系統 = 出力・エクスポート（データを外に出す）
 * 🟠 オレンジ系統 = 編集・変更（何かを修正する）
 * 🔴 赤色系統 = 削除・危険操作（取り返しのつかない操作）
 * 🟣 紫色系統 = 設定・有効化（機能のON/OFF、設定変更）
 * ⚫ グレー系統 = 管理・一覧（情報を表示、管理画面）
 */

export const COLOR_PALETTE = {
  // === 基本色 ===
  primary: {
    blue: '#3b82f6',      // プライマリブルー（保存、メインアクション）
    purple: '#8b5cf6',    // プライマリパープル（出力、エクスポート）
    green: '#10b981',     // プライマリグリーン（成功、有効状態）
    orange: '#ff8833',    // プライマリオレンジ（アクセント、編集モード）
    red: '#ef4444',       // プライマリレッド（削除、警告）
  },

  // === 状態色 ===
  status: {
    success: '#10b981',   // 成功状態
    warning: '#f59e0b',   // 警告状態
    error: '#ef4444',     // エラー状態
    info: '#3b82f6',      // 情報状態
    processing: '#8b5cf6', // 処理中状態
  },

  // === 背景色 ===
  background: {
    // ダークモード
    dark: {
      primary: '#1a1a1a',     // メイン背景
      secondary: '#2d2d2d',   // セカンダリ背景
      tertiary: '#3a3a3a',    // サード背景
      card: '#1e1e1e',        // カード背景
      modal: '#1e1e1e',       // モーダル背景
      input: '#4b5563',       // 入力フィールド背景
    },
    // ライトモード
    light: {
      primary: '#ffffff',     // メイン背景
      secondary: '#f8f9fa',   // セカンダリ背景
      tertiary: '#e9ecef',    // サード背景
      card: '#ffffff',        // カード背景
      modal: '#ffffff',       // モーダル背景
      input: '#ffffff',       // 入力フィールド背景
    }
  },

  // === テキスト色 ===
  text: {
    // ダークモード
    dark: {
      primary: '#ffffff',     // メインテキスト
      secondary: '#cccccc',   // セカンダリテキスト
      muted: '#888888',       // ミュートテキスト
      inverse: '#1a1a1a',     // 反転テキスト
    },
    // ライトモード
    light: {
      primary: '#333333',     // メインテキスト
      secondary: '#555555',   // セカンダリテキスト
      muted: '#888888',       // ミュートテキスト
      inverse: '#ffffff',     // 反転テキスト
    }
  },

  // === ボーダー色 ===
  border: {
    // ダークモード
    dark: {
      primary: '#555555',     // メインボーダー
      secondary: '#333333',   // セカンダリボーダー
      focus: '#3b82f6',       // フォーカスボーダー
    },
    // ライトモード
    light: {
      primary: '#dddddd',     // メインボーダー
      secondary: '#e5e7eb',   // セカンダリボーダー
      focus: '#3b82f6',       // フォーカスボーダー
    }
  },

  // === 機能別ボタン色（直感的な色分けルール） ===
  buttons: {
    // ファイル操作系（緑系統）
    save: {
      primary: '#16a34a',     // 💾 保存（緑） - ファイルを保存する
      hover: '#15803d',       // 保存ボタンホバー
    },
    // 出力・エクスポート系（青系統）
    export: {
      primary: '#2563eb',     // 📤 出力（青） - データを出力する
      hover: '#1d4ed8',       // 出力ボタンホバー
    },
    // 編集・変更系（オレンジ系統）
    edit: {
      primary: '#ea580c',     // 🔧 編集（オレンジ） - 何かを編集・変更する
      hover: '#dc2626',       // 編集ボタンホバー
    },
    // 削除・危険系（赤系統）
    delete: {
      primary: '#dc2626',     // 🗑️ 削除（赤） - 危険な操作
      hover: '#b91c1c',       // 削除ボタンホバー
    },
    // 設定・有効化系（紫系統）
    success: {
      primary: '#9333ea',     // ⚙️ 設定・有効化（紫） - 機能のON/OFF
      hover: '#7c3aed',       // 設定ボタンホバー
    },
    // 管理・一覧系（グレー系統）
    manage: {
      primary: '#6b7280',     // 📁 管理（グレー） - 一覧・管理機能
      hover: '#4b5563',       // 管理ボタンホバー
    }
  },

  // === 特殊効果色 ===
  effects: {
    hover: {
      light: 'rgba(0, 0, 0, 0.1)',    // ライトモードホバー
      dark: 'rgba(255, 255, 255, 0.1)', // ダークモードホバー
    },
    shadow: {
      light: 'rgba(0, 0, 0, 0.1)',     // ライトモードシャドウ
      dark: 'rgba(0, 0, 0, 0.3)',      // ダークモードシャドウ
    },
    focus: {
      light: 'rgba(59, 130, 246, 0.2)', // フォーカスリング
      dark: 'rgba(59, 130, 246, 0.3)',  // フォーカスリング
    }
  }
} as const;

/**
 * 機能別のボタンスタイルを取得
 */
export const getButtonStyle = (type: keyof typeof COLOR_PALETTE.buttons, isDarkMode: boolean) => ({
  backgroundColor: COLOR_PALETTE.buttons[type].primary,
  color: COLOR_PALETTE.text[isDarkMode ? 'dark' : 'light'].inverse,
  border: `1px solid ${COLOR_PALETTE.buttons[type].primary}`,
  fontWeight: 'bold' as const,
  transition: 'all 0.3s ease',
  cursor: 'pointer' as const,
  '&:hover': {
    backgroundColor: COLOR_PALETTE.buttons[type].hover,
    borderColor: COLOR_PALETTE.buttons[type].hover,
  }
});

/**
 * テーマ別の色を取得
 */
export const getThemeColors = (isDarkMode: boolean) => ({
  background: COLOR_PALETTE.background[isDarkMode ? 'dark' : 'light'],
  text: COLOR_PALETTE.text[isDarkMode ? 'dark' : 'light'],
  border: COLOR_PALETTE.border[isDarkMode ? 'dark' : 'light'],
});

/**
 * 機能別の色を取得
 */
export const getFunctionalColors = () => ({
  save: COLOR_PALETTE.buttons.save,
  export: COLOR_PALETTE.buttons.export,
  edit: COLOR_PALETTE.buttons.edit,
  delete: COLOR_PALETTE.buttons.delete,
  success: COLOR_PALETTE.buttons.success,
  manage: COLOR_PALETTE.buttons.manage,
});
