# 💰 有料版移行計画

## 🎯 概要

**目標**: ベータ版から有料サブスクリプションモデルへの移行  
**期間**: Phase 1を1-2日で実装、Phase 2は需要次第  
**方針**: 段階的実装で、まずは最小限の機能で収益化開始

---

## 📋 Phase 1: 簡易サブスク版（1-2日）

### 🎯 目標
- LocalStorageベースの簡易サブスク機能
- Stripe Payment Linkで決済
- トライアルコードシステム
- サービス終了時の安全な撤退プラン

### 💰 価格設定

```
📦 無料版（Free）
├─ AI生成: 1日10回まで
├─ プロジェクト保存: 無制限（ローカル）
├─ すべての基本機能: ✅
└─ 広告表示: なし

💎 ベーシック版（¥300/月）
├─ AI生成: 1日100回まで
├─ プロジェクト保存: 無制限（ローカル）
├─ すべての基本機能: ✅
├─ メールサポート: ✅
└─ 初回7日間無料

👑 プレミアム版（¥980/月）
├─ AI生成: 完全無制限
├─ プロジェクト保存: 無制限（ローカル）
├─ すべての基本機能: ✅
├─ 優先サポート: ✅
├─ ベータ機能先行アクセス: ✅
└─ 初回7日間無料
```

---

## ⚠️ 現状の問題点と修正（2025年10月16日）

### 問題点
現在の`UsageLimitService`と`OpenAIService`の実装を確認したところ、以下の不備が見つかりました：

**使用制限の適用状況:**
- ✅ **1ページ分生成** (`generatePanelContent`) - 制限チェック＋使用記録あり
- ✅ **1コマ生成** (`generateSinglePanel`) - 制限チェック＋使用記録あり
- ⚠️ **プロンプト生成** (`generateActionPrompt`) - 制限チェックのみ、**使用記録なし**

### 修正内容
`OpenAIService.ts`の`generateActionPrompt`メソッドに、使用回数記録を追加しました：

```typescript
// 490行目付近に追加
const result = JSON.parse(jsonMatch[0]);

// 使用回数を記録
await usageLimitService.recordUsage();

return result as { prompt: string; promptJa: string };
```

### 修正後の状態
すべてのAI生成機能で使用制限が正しく適用されるようになりました：
- ✅ 1ページ分生成 - 1回としてカウント
- ✅ 1コマ生成 - 1回としてカウント
- ✅ プロンプト生成 - 1回としてカウント

---

## 🛠️ 実装タスク

### 1. Stripe設定（30分）

#### やること
- [ ] Stripeアカウント作成（https://stripe.com）
- [ ] Payment Link作成
  - [ ] ベーシック版: ¥300/月
  - [ ] プレミアム版: ¥980/月
- [ ] Customer Portal有効化（顧客自身で解約可能に）
- [ ] テスト決済確認

#### 設定内容
```
製品名: AI漫画ネームメーカー - ベーシック
価格: ¥300/月（月次課金）
トライアル: 7日間無料
キャンセル: いつでも可能

製品名: AI漫画ネームメーカー - プレミアム
価格: ¥980/月（月次課金）
トライアル: 7日間無料
キャンセル: いつでも可能
```

---

### 2. SubscriptionService.ts 作成（2-3時間）

#### 機能
```typescript
export class SubscriptionService {
  // プレミアムコード機能
  activateTrial(code: string): boolean
  activatePremium(code: string, plan: 'basic' | 'premium'): boolean
  
  // ステータス確認
  getSubscriptionStatus(): SubscriptionStatus
  isFreeTier(): boolean
  isBasicTier(): boolean
  isPremiumTier(): boolean
  
  // AI使用制限チェック
  canUseAI(): boolean
  getAIUsageLimit(): number
  
  // 有効期限管理
  checkExpiration(): boolean
  getRemainingDays(): number
  
  // 解約
  cancelSubscription(): void
}
```

#### LocalStorageデータ構造
```typescript
interface SubscriptionData {
  plan: 'free' | 'basic' | 'premium'
  code: string | null
  activatedAt: string | null
  expiresAt: string | null
  isTrialMode: boolean
  stripeCustomerId?: string // Phase 2で使用
}
```

#### トライアルコード仕様
```
TRIAL7: 7日間無料トライアル（プレミアム機能）
BASIC30: ベーシック30日間（テスト用）
PREMIUM30: プレミアム30日間（テスト用）
```

---

### 3. SubscriptionPanel.tsx 作成（3-4時間）

#### UI構成
```
┌─────────────────────────────────┐
│ 💎 サブスクリプション管理        │
├─────────────────────────────────┤
│                                 │
│ 現在のプラン: 無料版             │
│ AI生成回数: 5/10 (今日)         │
│                                 │
│ ┌─────────────────────────┐    │
│ │ 🎁 トライアルコード入力  │    │
│ │ [TRIAL7__________] [適用] │    │
│ └─────────────────────────┘    │
│                                 │
│ ┌─────────────────────────┐    │
│ │ ベーシック版              │    │
│ │ ¥300/月                  │    │
│ │ ・AI生成 100回/日        │    │
│ │ ・メールサポート          │    │
│ │ [アップグレード]          │    │
│ └─────────────────────────┘    │
│                                 │
│ ┌─────────────────────────┐    │
│ │ プレミアム版              │    │
│ │ ¥980/月                  │    │
│ │ ・AI生成 無制限          │    │
│ │ ・優先サポート            │    │
│ │ ・ベータ機能アクセス      │    │
│ │ [アップグレード]          │    │
│ └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

#### プレミアム版UI（有効時）
```
┌─────────────────────────────────┐
│ 👑 プレミアム版アクティブ        │
├─────────────────────────────────┤
│                                 │
│ プラン: プレミアム版             │
│ AI生成回数: 無制限              │
│ 有効期限: 2025-11-15まで       │
│ 残り日数: 30日                  │
│                                 │
│ [サブスク管理] [解約する]       │
│                                 │
└─────────────────────────────────┘
```

---

### 4. UsageLimitService.ts 修正（1時間）

#### 追加機能
```typescript
export class UsageLimitService {
  // 既存機能
  canUseAI(): { allowed: boolean; reason?: string }
  recordUsage(): void
  
  // 新規追加
  getUsageLimit(): number {
    const subscription = subscriptionService.getStatus()
    if (subscription.plan === 'premium') return Infinity
    if (subscription.plan === 'basic') return 100
    return 10 // free tier
  }
  
  getUsagePercentage(): number
  getRemainingUsage(): number
}
```

---

### 5. ServiceStatusBanner.tsx 作成（2時間）

#### 表示パターン

```typescript
// 通常運用
<ServiceStatusBanner status="active" />
// → 何も表示しない

// サービス終了告知（2週間前〜）
<ServiceStatusBanner 
  status="ending" 
  endDate="2025-12-31" 
/>
// → 「⚠️ このサービスは2025年12月31日に終了します」

// メンテナンス中
<ServiceStatusBanner 
  status="maintenance"
  message="システムメンテナンス中です" 
/>
// → アプリ全体を使用不可に

// サービス終了後
<ServiceStatusBanner status="closed" />
// → 「このサービスは終了しました」画面のみ表示
```

#### 環境変数
```bash
REACT_APP_SERVICE_STATUS=active
REACT_APP_SERVICE_END_DATE=
REACT_APP_MAINTENANCE_MODE=false
REACT_APP_MAINTENANCE_MESSAGE=
```

---

### 6. 一括エクスポート機能（1時間）

#### ProjectPanel.tsx に追加

```typescript
// 全プロジェクトを一括エクスポート
const exportAllProjects = () => {
  const allProjects = saveService.getAllProjects()
  const exportData = {
    exportedAt: new Date().toISOString(),
    appVersion: '1.0.0',
    projectCount: allProjects.length,
    projects: allProjects
  }
  
  const blob = new Blob(
    [JSON.stringify(exportData, null, 2)], 
    { type: 'application/json' }
  )
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `all-projects-backup-${Date.now()}.json`
  a.click()
}
```

---

## 📁 ファイル構成

```
src/
├── components/
│   ├── ServiceStatusBanner.tsx       # 新規 - サービス状態表示
│   └── UI/
│       ├── SubscriptionPanel.tsx     # 新規 - サブスク管理UI
│       └── ProjectPanel.tsx          # 修正 - 一括エクスポート追加
│
├── services/
│   ├── SubscriptionService.ts        # 新規 - サブスク管理ロジック
│   └── UsageLimitService.ts          # 修正 - プレミアム連携
│
├── types.ts                          # 修正 - サブスク型定義追加
└── App.tsx                           # 修正 - ステータスチェック追加
```

---

## 🔄 実装手順

### Day 1（4-5時間）

#### 午前
1. **Stripe設定**（30分）
   ```bash
   1. Stripeアカウント作成
   2. Payment Link作成（ベーシック・プレミアム）
   3. Customer Portal有効化
   4. テスト決済
   ```

2. **SubscriptionService.ts 実装**（2-3時間）
   ```bash
   1. LocalStorageデータ構造定義
   2. トライアルコード検証ロジック
   3. 有効期限チェック機能
   4. プラン管理機能
   ```

#### 午後
3. **UsageLimitService.ts 修正**（1時間）
   ```bash
   1. サブスク連携追加
   2. プラン別制限追加
   3. テスト
   ```

4. **ServiceStatusBanner.tsx 作成**（1時間）
   ```bash
   1. ステータスバナーUI
   2. 環境変数連携
   3. メンテナンスモード実装
   ```

---

### Day 2（4-5時間）

#### 午前
5. **SubscriptionPanel.tsx 実装**（3-4時間）
   ```bash
   1. UI実装
   2. コード入力機能
   3. Stripe Payment Link連携
   4. プランステータス表示
   ```

#### 午後
6. **App.tsx 統合**（30分）
   ```bash
   1. ServiceStatusBanner追加
   2. サブスクパネル追加
   3. 全体動作確認
   ```

7. **一括エクスポート機能**（30分）
   ```bash
   1. ProjectPanel.tsx修正
   2. バックアップUI追加
   3. テスト
   ```

8. **テスト・デバッグ**（1時間）
   ```bash
   1. トライアルコード動作確認
   2. 有効期限切れ動作確認
   3. AI生成制限確認
   4. 一括エクスポート確認
   ```

---

## 🚀 デプロイ手順

### 1. 環境変数設定（Vercel Dashboard）
```bash
REACT_APP_SERVICE_STATUS=active
REACT_APP_SERVICE_END_DATE=
REACT_APP_MAINTENANCE_MODE=false
REACT_APP_MAINTENANCE_MESSAGE=
REACT_APP_STRIPE_BASIC_LINK=https://buy.stripe.com/xxx
REACT_APP_STRIPE_PREMIUM_LINK=https://buy.stripe.com/xxx
REACT_APP_STRIPE_PORTAL_URL=https://billing.stripe.com/p/login/xxx
REACT_APP_SUPPORT_EMAIL=support@example.com
```

### 2. デプロイ
```bash
git add .
git commit -m "🎉 Phase 1: サブスクリプション機能実装"
git push
vercel --prod
```

### 3. 動作確認
```
1. トライアルコード「TRIAL7」でアクティベーション
2. AI生成100回以上使用してみる
3. Stripe決済テスト
4. Customer Portalで解約テスト
```

---

## 💰 収益シミュレーション

### Phase 1（3ヶ月後の想定）

```
ユーザー数:
  無料版: 500人
  ベーシック: 100人
  プレミアム: 20人

売上:
  ベーシック: 100人 × ¥300 = ¥30,000/月
  プレミアム: 20人 × ¥980 = ¥19,600/月
  合計: ¥49,600/月

コスト:
  OpenAI API: 
    - ベーシック: 100人 × 30回/日 × ¥1.5/回 = ¥4,500/月
    - プレミアム: 20人 × 100回/日 × ¥1.5/回 = ¥3,000/月
  Stripe手数料: ¥49,600 × 3.6% = ¥1,786/月
  合計: ¥9,286/月

純利益: ¥40,314/月
```

### Phase 1（1年後の想定）

```
ユーザー数:
  無料版: 2,000人
  ベーシック: 500人
  プレミアム: 100人

売上:
  ベーシック: 500人 × ¥300 = ¥150,000/月
  プレミアム: 100人 × ¥980 = ¥98,000/月
  合計: ¥248,000/月

コスト:
  OpenAI API: ¥35,000/月
  Stripe手数料: ¥8,928/月
  合計: ¥43,928/月

純利益: ¥204,072/月
年間純利益: ¥2,448,864
```

---

## 🔄 サービス終了手順

### 2週間前
```bash
# Vercel環境変数を変更
REACT_APP_SERVICE_STATUS=ending
REACT_APP_SERVICE_END_DATE=2025-12-31

# デプロイ → 警告バナー表示
git commit -m "Enable service ending notice"
vercel --prod
```

### 1週間前
```
1. noteで終了告知記事
2. メール通知（プレミアムユーザー）
3. アプリ内で一括エクスポート促進
4. 返金対応（日割り計算）
```

### 終了日
```bash
# すべてのサブスクを停止（Stripe Dashboard）

# サービスを終了モードに
REACT_APP_SERVICE_STATUS=closed

# デプロイ → 終了画面のみ表示
vercel --prod
```

### 1ヶ月後（完全削除）
```
1. Vercel Project削除
2. Stripeデータエクスポート・アーカイブ
3. GitHub Archiveに移行
```

---

## 📋 Phase 2: 完全自動化版（2-3週間）

### 実装内容
- Firebase Authentication（ユーザー登録・ログイン）
- Stripe Webhook自動連携
- クラウド保存（Firestore）
- プレミアム専用機能

### タイミング
- Phase 1で3ヶ月運用
- 月間¥50,000以上の安定収益確認
- ユーザー数500人以上達成
- ユーザーからクラウド保存要望多数

### 投資判断
```
開発工数: 2-3週間
追加コスト: ¥5,000-10,000/月（Firebase + Vercel Pro）
回収期間: 3-4ヶ月

判断基準:
- Phase 1で月間¥100,000以上の売上
- 解約率10%以下
- ユーザー満足度が高い
```

---

## ✅ チェックリスト

### Phase 1 実装前
- [ ] Stripeアカウント作成
- [ ] Payment Link設定
- [ ] Customer Portal有効化
- [ ] サポートメールアドレス準備

### Phase 1 実装中
- [ ] SubscriptionService.ts 作成
- [ ] SubscriptionPanel.tsx 作成
- [ ] ServiceStatusBanner.tsx 作成
- [ ] UsageLimitService.ts 修正
- [ ] 一括エクスポート機能追加
- [ ] App.tsx 統合

### Phase 1 デプロイ前
- [ ] ローカルテスト（トライアルコード）
- [ ] ローカルテスト（有効期限切れ）
- [ ] ローカルテスト（AI生成制限）
- [ ] ローカルテスト（一括エクスポート）
- [ ] Stripe決済テスト
- [ ] 環境変数設定（Vercel）

### Phase 1 デプロイ後
- [ ] 本番環境テスト
- [ ] noteで販売開始告知
- [ ] トライアルコード配布
- [ ] ユーザーフィードバック収集

---

## 🎯 次のアクション

### 今すぐ
1. Stripeアカウント作成
2. Phase 1実装開始
3. テスト環境で動作確認

### 今週中
1. Phase 1完成
2. デプロイ
3. 動作確認

### 来週
1. noteで販売開始
2. トライアルコード配布
3. フィードバック収集

---

*作成日: 2025年10月16日*

