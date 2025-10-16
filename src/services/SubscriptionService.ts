// src/services/SubscriptionService.ts
// サブスクリプション管理サービス（Phase 1: LocalStorage版）

import { SubscriptionStatus, SubscriptionPlan } from '../types';

class SubscriptionService {
  private readonly STORAGE_KEY = 'subscription_status';
  
  // トライアルコード定義
  private readonly TRIAL_CODES: Record<string, { plan: SubscriptionPlan; days: number }> = {
    'TRIAL7': { plan: 'premium', days: 7 },
    'BASIC30': { plan: 'basic', days: 30 },
    'PREMIUM30': { plan: 'premium', days: 30 },
  };

  /**
   * サブスクリプション状態を取得
   */
  public getStatus(): SubscriptionStatus {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    
    if (!stored) {
      // 初回: 無料プラン
      const initialStatus: SubscriptionStatus = {
        plan: 'free',
        code: null,
        activatedAt: null,
        expiresAt: null,
        isTrialMode: false
      };
      this.saveStatus(initialStatus);
      return initialStatus;
    }
    
    const status: SubscriptionStatus = JSON.parse(stored);
    
    // 有効期限チェック
    if (status.expiresAt && this.isExpired(status.expiresAt)) {
      // 期限切れ → 無料プランに戻す
      status.plan = 'free';
      status.code = null;
      status.activatedAt = null;
      status.expiresAt = null;
      status.isTrialMode = false;
      this.saveStatus(status);
    }
    
    return status;
  }

  /**
   * サブスクリプション状態を保存
   */
  private saveStatus(status: SubscriptionStatus): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(status));
  }

  /**
   * プレミアムコードでアクティベーション
   */
  public activateCode(code: string): { success: boolean; message: string } {
    const upperCode = code.trim().toUpperCase();
    const codeInfo = this.TRIAL_CODES[upperCode];
    
    if (!codeInfo) {
      return {
        success: false,
        message: '無効なコードです'
      };
    }
    
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + codeInfo.days);
    
    const newStatus: SubscriptionStatus = {
      plan: codeInfo.plan,
      code: upperCode,
      activatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isTrialMode: upperCode === 'TRIAL7'
    };
    
    this.saveStatus(newStatus);
    
    const planName = codeInfo.plan === 'premium' ? 'プレミアム版' : 'ベーシック版';
    return {
      success: true,
      message: `${planName}を${codeInfo.days}日間アクティベートしました！`
    };
  }

  /**
   * 有効期限が切れているかチェック
   */
  private isExpired(expiresAt: string): boolean {
    return new Date() > new Date(expiresAt);
  }

  /**
   * 残り日数を取得
   */
  public getRemainingDays(): number {
    const status = this.getStatus();
    if (!status.expiresAt) return 0;
    
    const now = new Date();
    const expires = new Date(status.expiresAt);
    const diffTime = expires.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  /**
   * プラン別の制限値を取得
   */
  public getAIUsageLimit(): number {
    const status = this.getStatus();
    
    switch (status.plan) {
      case 'premium':
        return Infinity;
      case 'basic':
        return 100;
      case 'free':
      default:
        return 10;
    }
  }

  /**
   * 各プランのチェック
   */
  public isFreeTier(): boolean {
    return this.getStatus().plan === 'free';
  }

  public isBasicTier(): boolean {
    return this.getStatus().plan === 'basic';
  }

  public isPremiumTier(): boolean {
    return this.getStatus().plan === 'premium';
  }

  /**
   * サブスクリプション解約
   */
  public cancelSubscription(): void {
    const status: SubscriptionStatus = {
      plan: 'free',
      code: null,
      activatedAt: null,
      expiresAt: null,
      isTrialMode: false
    };
    this.saveStatus(status);
  }

  /**
   * プラン名を取得
   */
  public getPlanName(): string {
    const status = this.getStatus();
    switch (status.plan) {
      case 'premium':
        return 'プレミアム版';
      case 'basic':
        return 'ベーシック版';
      case 'free':
      default:
        return '無料版';
    }
  }

  /**
   * Stripe決済リンクを取得
   */
  public getStripePurchaseLink(plan: 'basic' | 'premium'): string {
    if (plan === 'basic') {
      return process.env.REACT_APP_STRIPE_BASIC_LINK || 'https://buy.stripe.com/test_basic';
    }
    return process.env.REACT_APP_STRIPE_PREMIUM_LINK || 'https://buy.stripe.com/test_premium';
  }

  /**
   * Stripe Customer Portalリンクを取得
   */
  public getStripePortalLink(): string {
    return process.env.REACT_APP_STRIPE_PORTAL_URL || 'https://billing.stripe.com/p/login/test';
  }
}

export const subscriptionService = new SubscriptionService();
export default SubscriptionService;

