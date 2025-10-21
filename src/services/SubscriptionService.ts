// src/services/SubscriptionService.ts
// サブスクリプション管理サービス（Phase 1: LocalStorage版）

import { SubscriptionStatus, SubscriptionPlan } from '../types';

class SubscriptionService {
  private readonly STORAGE_KEY = 'subscription_status';
  
  // トライアルコード定義
  private readonly TRIAL_CODES: Record<string, { plan: SubscriptionPlan; days: number }> = {
    'TRIAL7': { plan: 'premium', days: 7 },
    'PRO30': { plan: 'pro', days: 30 },
    'PREMIUM30': { plan: 'premium', days: 30 },
  };

  /**
   * サブスクリプション状態を取得
   */
  public getStatus(): SubscriptionStatus {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // 初期状態
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
      case 'pro':
        return 100;
      case 'free':
      default:
        return 10;
    }
  }

  /**
   * エクスポート機能が利用可能かチェック
   */
  public canExport(): boolean {
    const status = this.getStatus();
    return status.plan !== 'free'; // 無料版ではエクスポート不可
  }

  /**
   * クラウド保存機能が利用可能かチェック
   */
  public canUseCloudSave(): boolean {
    const status = this.getStatus();
    return status.plan === 'premium'; // プレミアム版のみ
  }

  /**
   * ベータ機能が利用可能かチェック
   */
  public canUseBetaFeatures(): boolean {
    const status = this.getStatus();
    return status.plan === 'premium'; // プレミアム版のみ
  }

  /**
   * 各プランのチェック
   */
  public isFreeTier(): boolean {
    return this.getStatus().plan === 'free';
  }

  public isProTier(): boolean {
    return this.getStatus().plan === 'pro';
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
      case 'pro':
        return 'プロ版';
      case 'free':
      default:
        return '無料版';
    }
  }

  /**
   * 手動でプランを変更（テスト用）
   */
  public setPlan(plan: SubscriptionPlan): void {
    const status = this.getStatus();
    const newStatus: SubscriptionStatus = {
      ...status,
      plan: plan,
      activatedAt: new Date().toISOString(),
      expiresAt: plan === 'free' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30日後
      isTrialMode: false
    };
    this.saveStatus(newStatus);
  }

  /**
   * PayPal決済リンクを取得
   */
  public getPurchaseLink(plan: 'pro' | 'premium'): string {
    // PayPal決済リンク（正しいURL形式）
    if (plan === 'pro') {
      return process.env.REACT_APP_PAYPAL_PRO_LINK || 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-2XE8994072110444GND3TEJY';
    }
    return process.env.REACT_APP_PAYPAL_PREMIUM_LINK || 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-8J371319RP605241DND3TDBA';
  }

  public getNoteSubscriptionLink(): string {
    return 'https://note.com/your-username/m/magazine-id';
  }

  /**
   * PayPal顧客ポータルリンクを取得
   */
  public getPortalLink(): string {
    return process.env.REACT_APP_PAYPAL_PORTAL_URL || 'https://www.paypal.com/myaccount/autopay';
  }

  /**
   * サーバーからプラン状態を確認
   */
  public async checkServerSubscription(userId: string): Promise<{ success: boolean; plan: SubscriptionPlan; message: string }> {
    try {
      const response = await fetch(`/api/check-subscription?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        // サーバーから取得したプランでローカルを更新
        this.setPlan(data.plan as SubscriptionPlan);
        return {
          success: true,
          plan: data.plan as SubscriptionPlan,
          message: data.message
        };
      }
      
      return {
        success: false,
        plan: 'free',
        message: 'プラン確認に失敗しました'
      };
    } catch (error) {
      console.error('Server subscription check failed:', error);
      return {
        success: false,
        plan: 'free',
        message: 'サーバーとの通信に失敗しました'
      };
    }
  }
}

export const subscriptionService = new SubscriptionService();
export default SubscriptionService;

