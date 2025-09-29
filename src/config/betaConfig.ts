/**
 * ベータ版制限設定
 * ベータ版として無料公開する際の機能制限を定義
 */

export interface BetaConfig {
  // 基本制限
  isBetaVersion: boolean;
  maxPages: number;
  allowProjectSave: boolean;
  allowCloudSave: boolean;
  
  // エクスポート制限
  allowedExportFormats: string[];
  allowHighQualityExport: boolean;
  allowPSDExport: boolean;
  allowNanoBananaExport: boolean;
  
  // 機能制限
  allowAdvancedCharacterSettings: boolean; // 8カテゴリの拡張4項目
  allowDetailedStatistics: boolean;
  allowProjectSharing: boolean;
  
  // UI制限
  showUpgradePrompts: boolean;
  betaVersionMessage: string;
}

// ベータ版設定（1ページ制限のみ）
export const BETA_CONFIG: BetaConfig = {
  isBetaVersion: true,
  maxPages: 1, // 1ページのみ
  allowProjectSave: true, // ローカル保存は許可
  allowCloudSave: true, // クラウド保存も許可
  
  // エクスポート制限なし
  allowedExportFormats: ['pdf', 'png', 'psd'], // 全形式利用可能
  allowHighQualityExport: true, // 高品質エクスポート許可
  allowPSDExport: true, // PSD出力許可
  allowNanoBananaExport: true, // NanoBanana許可
  
  // 機能制限なし
  allowAdvancedCharacterSettings: true, // 8カテゴリ完全利用可能
  allowDetailedStatistics: true, // 詳細統計許可
  allowProjectSharing: true, // プロジェクト共有許可
  
  // UI制限
  showUpgradePrompts: true, // アップグレード促進メッセージ表示
  betaVersionMessage: 'ベータ版 - 1ページのみ利用可能（フル版では複数ページ対応）'
};

// フル版設定（制限なし）
export const FULL_CONFIG: BetaConfig = {
  isBetaVersion: false,
  maxPages: 50, // 最大50ページ
  allowProjectSave: true,
  allowCloudSave: true,
  
  // エクスポート制限
  allowedExportFormats: ['pdf', 'png', 'psd'],
  allowHighQualityExport: true,
  allowPSDExport: true,
  allowNanoBananaExport: true,
  
  // 機能制限
  allowAdvancedCharacterSettings: true,
  allowDetailedStatistics: true,
  allowProjectSharing: true,
  
  // UI制限
  showUpgradePrompts: false,
  betaVersionMessage: ''
};

// 現在の設定（環境変数で切り替え可能）
// 🔧 一時的にベータ版を有効化（本番では環境変数を使用）
export const CURRENT_CONFIG: BetaConfig = true // process.env.REACT_APP_BETA_VERSION === 'true' 
  ? BETA_CONFIG 
  : FULL_CONFIG;

// 設定チェック用ユーティリティ
export const BetaUtils = {
  /**
   * ページ数制限チェック
   */
  canAddPage: (currentPageCount: number): boolean => {
    return currentPageCount < CURRENT_CONFIG.maxPages;
  },
  
  /**
   * エクスポート形式チェック
   */
  canExportFormat: (format: string): boolean => {
    return CURRENT_CONFIG.allowedExportFormats.includes(format);
  },
  
  /**
   * 高品質エクスポートチェック
   */
  canUseHighQuality: (): boolean => {
    return CURRENT_CONFIG.allowHighQualityExport;
  },
  
  /**
   * NanoBananaエクスポートチェック
   */
  canUseNanoBanana: (): boolean => {
    return CURRENT_CONFIG.allowNanoBananaExport;
  },
  
  /**
   * 高度なキャラクター設定チェック
   */
  canUseAdvancedCharacterSettings: (): boolean => {
    return CURRENT_CONFIG.allowAdvancedCharacterSettings;
  },
  
  /**
   * アップグレード促進メッセージ取得
   */
  getUpgradeMessage: (): string => {
    if (!CURRENT_CONFIG.showUpgradePrompts) return '';
    
    return '🚀 フル版では複数ページが利用できます！';
  }
};
