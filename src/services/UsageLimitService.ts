// src/services/UsageLimitService.ts
// AI生成の使用回数制限サービス

import { subscriptionService } from './SubscriptionService';

export interface UsageLimit {
  dailyLimit: number;
  totalLimit: number;
  currentDailyUsage: number;
  currentTotalUsage: number;
  lastResetDate: string;
  isLimitEnabled: boolean;
}

class UsageLimitService {
  private readonly STORAGE_KEY = 'ai_usage_limit';
  
  /**
   * プラン別の日次制限を取得
   */
  private getDailyLimit(): number {
    return subscriptionService.getAIUsageLimit();
  }
  
  /**
   * 累計制限を取得（無料版のみ）
   */
  private getTotalLimit(): number {
    // 無料版のみ累計制限あり
    if (subscriptionService.isFreeTier()) {
      return 100;
    }
    return Infinity; // 有料版は累計制限なし
  }

  /**
   * 使用状況を取得
   */
  public async getUsageStatus(): Promise<UsageLimit> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const today = new Date().toISOString().split('T')[0];
    
    // IPアドレスベースのキーを生成（簡易的なフィンガープリント）
    const fingerprint = await this.generateFingerprint();
    const ipKey = `${this.STORAGE_KEY}_${fingerprint}`;
    const ipStored = localStorage.getItem(ipKey);
    
    // IPベースのデータがあればそれを優先
    const dataSource = ipStored || stored;
    
    if (!dataSource) {
      // 初回使用
      const initialData: UsageLimit = {
        dailyLimit: this.getDailyLimit(),
        totalLimit: this.getTotalLimit(),
        currentDailyUsage: 0,
        currentTotalUsage: 0,
        lastResetDate: today,
        isLimitEnabled: this.isLimitEnabled()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialData));
      localStorage.setItem(ipKey, JSON.stringify(initialData));
      return initialData;
    }
    
    const data: UsageLimit = JSON.parse(dataSource);
    
    // 日付が変わっていたら日次使用回数をリセット
    if (data.lastResetDate !== today) {
      data.currentDailyUsage = 0;
      data.lastResetDate = today;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(ipKey, JSON.stringify(data));
    }
    
    // プラン変更を反映
    data.dailyLimit = this.getDailyLimit();
    data.totalLimit = this.getTotalLimit();
    data.isLimitEnabled = this.isLimitEnabled();
    return data;
  }

  /**
   * ブラウザフィンガープリント生成（簡易版）
   */
  private async generateFingerprint(): Promise<string> {
    // eslint-disable-next-line no-restricted-globals
    const screenWidth = typeof window !== 'undefined' ? window.screen.width : 0;
    // eslint-disable-next-line no-restricted-globals
    const screenHeight = typeof window !== 'undefined' ? window.screen.height : 0;
    // eslint-disable-next-line no-restricted-globals
    const screenColorDepth = typeof window !== 'undefined' ? window.screen.colorDepth : 0;
    
    const components = [
      navigator.userAgent,
      navigator.language,
      screenWidth,
      screenHeight,
      screenColorDepth,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 0,
      navigator.platform
    ];
    
    const fingerprint = components.join('|');
    
    // 簡易的なハッシュ生成
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * 制限が有効かチェック（環境変数で制御）
   */
  private isLimitEnabled(): boolean {
    // 常に制限を有効にする（デバッグ用の強制無効化を削除）
    return true;
  }

  /**
   * 使用可能かチェック
   */
  public async canUseAI(): Promise<{ allowed: boolean; reason?: string; remaining?: { daily: number; total: number } }> {
    const status = await this.getUsageStatus();
    
    // 制限が無効の場合は常に許可
    if (!status.isLimitEnabled) {
      return { allowed: true };
    }
    
    // 累計制限チェック
    if (status.currentTotalUsage >= status.totalLimit) {
      return {
        allowed: false,
        reason: `累計使用回数の上限（${status.totalLimit}回）に達しました。\n\n有料版をご検討ください。`
      };
    }
    
    // 日次制限チェック
    if (status.currentDailyUsage >= status.dailyLimit) {
      return {
        allowed: false,
        reason: `本日の使用回数上限（${status.dailyLimit}回）に達しました。\n\n明日またお試しください。`
      };
    }
    
    return {
      allowed: true,
      remaining: {
        daily: status.dailyLimit - status.currentDailyUsage,
        total: status.totalLimit - status.currentTotalUsage
      }
    };
  }

  /**
   * 使用回数を記録
   */
  public async recordUsage(): Promise<void> {
    const status = await this.getUsageStatus();
    
    // 制限が無効の場合は記録しない
    if (!status.isLimitEnabled) {
      return;
    }
    
    status.currentDailyUsage += 1;
    status.currentTotalUsage += 1;
    
    // 両方のキーに保存
    const fingerprint = await this.generateFingerprint();
    const ipKey = `${this.STORAGE_KEY}_${fingerprint}`;
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(status));
    localStorage.setItem(ipKey, JSON.stringify(status));
  }

  /**
   * 使用状況をリセット（管理者用）
   */
  public resetUsage(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * 使用状況の表示用テキスト
   */
  public async getUsageStatusText(): Promise<string> {
    const status = await this.getUsageStatus();
    
    if (!status.isLimitEnabled) {
      return '制限なし';
    }
    
    return `本日: ${status.currentDailyUsage}/${status.dailyLimit}回 | 累計: ${status.currentTotalUsage}/${status.totalLimit}回`;
  }

  /**
   * 残り回数を取得
   */
  public async getRemainingUsage(): Promise<{ daily: number; total: number }> {
    const status = await this.getUsageStatus();
    return {
      daily: Math.max(0, status.dailyLimit - status.currentDailyUsage),
      total: Math.max(0, status.totalLimit - status.currentTotalUsage)
    };
  }
}

export const usageLimitService = new UsageLimitService();
export default UsageLimitService;

