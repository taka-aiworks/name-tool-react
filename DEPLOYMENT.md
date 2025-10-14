# 🚀 デプロイメントガイド

## 環境変数設定

このアプリは2つのモードで動作します：

### 📝 開発モード（デフォルト）
ユーザーが自分のAPIキーを入力して使用します。

### 🌐 公開モード
あなたのAPIキーを埋め込んで、ユーザーはAPIキー不要で使用できます。

---

## 🔧 公開モードの設定方法

### 1. `.env`ファイルを作成

プロジェクトルートに`.env`ファイルを作成：

```bash
# OpenAI API設定
REACT_APP_OPENAI_API_KEY=sk-your-actual-api-key-here

# 公開モード有効化
REACT_APP_USE_ENV_API_KEY=true
```

### 2. `.env`ファイルをGit管理から除外

`.gitignore`に以下が含まれていることを確認：

```
.env
.env.local
.env.production
```

**⚠️ 重要**: `.env`ファイルは絶対にGitにコミットしないでください！

### 3. ビルド

```bash
npm run build
```

ビルド時に環境変数が埋め込まれます。

---

## 🌐 Vercelでのデプロイ（推奨）

### 1. Vercelプロジェクトを作成

1. https://vercel.com にアクセス
2. **New Project** をクリック
3. GitHubリポジトリを選択
4. Framework Preset: **Create React App** を選択

### 2. 環境変数を設定

Vercel Dashboard → Settings → Environment Variables で以下を設定：

```
REACT_APP_OPENAI_API_KEY=sk-your-actual-api-key-here
REACT_APP_USE_ENV_API_KEY=true
REACT_APP_APP_NAME=AI漫画ネームメーカー（ベータ版）
```

**重要**: Environment は **Production**, **Preview**, **Development** すべてに適用してください。

### 3. デプロイ

**Deploy** ボタンをクリックすると、自動的にビルド・デプロイされます。

以降、`main` ブランチへのpushで自動デプロイされます。

### 4. ドメイン設定（オプション）

Vercelが自動的に `your-project.vercel.app` のようなURLを提供します。
カスタムドメインを設定する場合は、Settings → Domains から設定できます。

---

### 4. その他の方法でデプロイ

#### Netlify / Vercel の場合:
管理画面で環境変数を設定：
- `REACT_APP_OPENAI_API_KEY`: あなたのAPIキー
- `REACT_APP_USE_ENV_API_KEY`: `true`

#### GitHub Pages の場合:
1. ビルド前に`.env`を設定
2. `npm run build`
3. `build`フォルダをデプロイ

---

## 🔄 モード切り替え

### 開発モード（ユーザーがAPIキー入力）:
```bash
# .env
REACT_APP_USE_ENV_API_KEY=false
```

### 公開モード（あなたのAPIキー使用）:
```bash
# .env
REACT_APP_OPENAI_API_KEY=sk-xxxxx
REACT_APP_USE_ENV_API_KEY=true
```

---

## 💰 コスト管理

公開モードでは**あなたのAPIキー**が使われるため：

1. **使用量監視**: OpenAIダッシュボードで監視
2. **レート制限**: 必要に応じてバックエンドプロキシを実装
3. **使用上限設定**: OpenAIアカウントで月額上限を設定

---

## 🔒 セキュリティ注意事項

### ⚠️ フロントエンドの制限:
Reactアプリはクライアントサイドで動作するため、環境変数は**ビルド時にバンドルに埋め込まれます**。

つまり：
- ✅ ユーザーはAPIキー入力不要
- ❌ 技術的にはブラウザの開発者ツールでAPIキーを見ることが可能

### 🛡️ より安全な方法:
本格的な公開には**バックエンドプロキシ**を推奨：

```
ユーザー → あなたのサーバー → OpenAI API
```

これにより：
- APIキーがクライアントに露出しない
- レート制限・使用量制御が可能
- 不正利用を防止

---

## 📋 デプロイチェックリスト

- [ ] `.env`ファイルを作成
- [ ] APIキーを設定
- [ ] `REACT_APP_USE_ENV_API_KEY=true`に設定
- [ ] `.gitignore`に`.env`が含まれているか確認
- [ ] `npm run build`でビルド
- [ ] ビルド後の動作確認
- [ ] デプロイ先で環境変数を設定（Netlify/Vercel等）
- [ ] 本番環境で動作確認
- [ ] OpenAIダッシュボードで使用量監視設定

---

## 🎯 推奨デプロイ先

### 1. **Vercel** (推奨)
- 環境変数設定が簡単
- 自動デプロイ
- 無料枠あり

### 2. **Netlify**
- 環境変数設定が簡単
- 無料枠あり

### 3. **GitHub Pages**
- 無料
- ただし環境変数はビルド時のみ

---

**準備ができたら教えてください。デプロイのサポートをします！** 🚀

