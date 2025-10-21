# 🚀 デプロイ運用ガイド

## 📋 概要
AI漫画ネームメーカーの本番デプロイ運用方法をまとめたガイドです。

## 🎯 環境構成

### 開発環境
- **URL**: http://localhost:3000
- **用途**: 開発・テスト
- **状態**: ローカル動作中

### 本番環境
- **URL**: https://your-app.vercel.app
- **用途**: 一般公開
- **状態**: デプロイ準備完了

## 🛠️ デプロイ手順

### 1. 事前準備
```bash
# Vercel CLIインストール（初回のみ）
npm install -g vercel

# Vercelログイン（初回のみ）
vercel login
```

### 2. 開発環境でのテスト
```bash
# 通常のReact開発サーバー（Serverless Functions無し）
npm start

# フル機能開発（Serverless Functions含む）
vercel dev
```

### 3. 本番デプロイ
```bash
# 本番環境にデプロイ
vercel --prod
```

### 4. 環境分離の重要性
- **`npm start`** → フロントエンドのみ（Serverless Functions無し）
- **`vercel dev`** → フル機能開発（Serverless Functions含む）
- **`vercel --prod`** → 本番環境（稼働中アプリに影響なし）

### 5. 環境変数設定
Vercel Dashboardで以下の環境変数を設定：

```bash
# PayPal設定
REACT_APP_PAYPAL_PRO_LINK=https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=実際のプロ版ID
REACT_APP_PAYPAL_PREMIUM_LINK=https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=実際のプレミアム版ID
REACT_APP_PAYPAL_PORTAL_URL=https://www.paypal.com/myaccount/autopay

# サービス設定
REACT_APP_SERVICE_STATUS=active
REACT_APP_SERVICE_END_DATE=2025-12-31
```

## 🔄 運用フロー

### 日常開発
1. **ローカル開発** → http://localhost:3000
2. **機能実装・テスト**
3. **動作確認**

### 本番公開
1. **最終テスト** → ローカル環境
2. **デプロイ実行** → `vercel --prod`
3. **動作確認** → 本番URL
4. **公開完了** → 🎉

## 📊 環境分離

### 開発環境
- **PayPal**: サンドボックス環境
- **決済**: テスト用
- **データ**: ローカルストレージ

### 本番環境
- **PayPal**: 本番環境
- **決済**: 実際の決済
- **データ**: 本格運用

## 🚨 注意事項

### デプロイ前チェックリスト
- [ ] ローカル環境で動作確認済み
- [ ] PayPal設定完了
- [ ] 環境変数設定済み
- [ ] 決済テスト完了

### 緊急時対応
```bash
# デプロイ停止（緊急時）
vercel --prod --confirm

# ロールバック
vercel rollback
```

## 📞 サポート

### 技術サポート
- **メール**: guidajiben3@gmail.com
- **対応時間**: 平日 9:00-18:00

### よくある問題
1. **デプロイ失敗** → 環境変数確認
2. **決済エラー** → PayPal設定確認
3. **アクセス不可** → Vercel Dashboard確認

## 🎉 成功指標

### デプロイ成功
- [ ] 本番URLにアクセス可能
- [ ] サブスクリプション機能動作
- [ ] PayPal決済リンク動作
- [ ] AI生成制限機能動作

### 運用開始
- [ ] ユーザー登録開始
- [ ] 決済処理開始
- [ ] サポート体制開始

---

**最終更新**: 2024年12月
**バージョン**: 1.0.0
