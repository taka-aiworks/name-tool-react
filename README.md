# 🎨 AI漫画ネームメーカー（ベータ版）

AIを活用した漫画ネーム制作ツールです。ストーリーからコマ内容・セリフ・プロンプトを自動生成し、AI画像生成ツールと連携して効率的に漫画を制作できます。

## 🌐 ベータ版について

このリポジトリは公開用のベータ版です。
- **使用制限**: 1日10回、合計100回まで無料でAI生成が利用可能
- **APIキー不要**: ユーザーはAPIキーの設定なしで利用できます

## ✨ 主な機能

### 📖 AI自動生成
- **1ページ分生成**: ストーリー全体からコマ割り・セリフを一括生成
- **1コマ生成**: 個別のコマ内容を生成
- **プロンプト出力**: Stable Diffusion、Midjourney、DALL-E対応の英語プロンプト

### 🎨 ネーム制作機能
- **コマ割りテンプレート**: 1コマ〜複数コマの様々なレイアウト
- **吹き出し編集**: 縦書き/横書き、フォントサイズ調整
- **キャラクター管理**: 名前設定とキャラクター情報管理
- **エクスポート**: PNG/JPEG形式 + プロンプトファイル出力

### 🚀 AI画像生成連携
1. このツールでネーム作成
2. プロンプトファイル（prompts.txt）を出力
3. AI画像生成ツールで各コマを生成
4. 画像を合成して完成

## 📦 デプロイ方法

### Vercelでのデプロイ（推奨）

1. **Vercelプロジェクトを作成**
   - https://vercel.com でGitHubリポジトリをインポート
   - Framework Preset: **Create React App**

2. **環境変数を設定**
   ```
   REACT_APP_OPENAI_API_KEY=sk-your-api-key
   REACT_APP_USE_ENV_API_KEY=true
   REACT_APP_APP_NAME=AI漫画ネームメーカー（ベータ版）
   ```

3. **デプロイ**
   - `main`ブランチへのpushで自動デプロイ

詳細は [DEPLOYMENT.md](./DEPLOYMENT.md) をご覧ください。

## 🛠️ ローカル開発

### セットアップ

```bash
npm install
npm start
```

ブラウザで http://localhost:3000 が開きます。

### ビルド

```bash
npm run build
```

## 📚 ドキュメント

- [USER_GUIDE.md](./USER_GUIDE.md) - 使い方ガイド
- [DEPLOYMENT.md](./DEPLOYMENT.md) - デプロイメントガイド
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - プロジェクト状況

## 🔒 セキュリティ

- APIキーは環境変数で管理（`.env`ファイルはGit管理対象外）
- クライアント側でブラウザフィンガープリントによる使用制限
- 1日10回、合計100回の生成制限

## 📝 ライセンス

このプロジェクトはベータ版として公開されています。

## 🙏 謝辞

- React
- OpenAI API
- Vercel
