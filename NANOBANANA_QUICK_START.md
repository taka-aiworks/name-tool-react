# 🍌 NanoBanana出力 - クイックスタート

## 🎯 NanoBananaとは？

Google AI Studioの画像生成機能で、**キャラクターリファレンス画像 + レイアウト画像**を渡すと、一貫性のある漫画を自動生成してくれます。

---

## 📦 出力ファイル

```
nanobanana_export_2025-10-14.zip
├── layout.png              # コマ割りレイアウト（吹き出し含む）
├── prompt.txt              # キャラ外見+各コマのプロンプト+セリフ
├── character_mapping.txt   # キャラクター名対応表
└── instructions.txt        # 詳しい使い方（日本語）
```

---

## 🚀 使い方（4ステップ）

### ステップ1: キャラクター画像を生成 🎨

**使うツール:** Stable Diffusion / Midjourney / DALL-E

```
1. prompt.txt を開く
2. 「📸 キャラクターリファレンス画像の生成」を見つける
3. キャラクターのプロンプトをコピー

例:
【主人公】
外見プロンプト: solo, 1girl, teen, black hair, blue eyes, black sweater

完全なプロンプト例:
solo, 1girl, teen, black hair, blue eyes, black sweater, 
full body, standing pose, front view, simple background, 
masterpiece, best quality, anime style

4. Stable Diffusion等で画像生成
5. 生成した画像を保存（character_主人公.png）
```

**キャラが2人以上いる場合 → 全員分の画像を生成**

---

### ステップ2: Google AI Studio を開く 🌐

```
1. https://aistudio.google.com にアクセス
2. Googleアカウントでログイン
3. 「New Chat」をクリック
4. モデル: 「Gemini 2.0 Flash Experimental」
```

---

### ステップ3: 画像をアップロード 📎

```
1. 「📎 Attach」ボタンをクリック
2. アップロードする画像:
   ✅ character_主人公.png（リファレンス）
   ✅ character_サブキャラ.png（リファレンス）※いる場合
   ✅ layout.png（レイアウト）
3. すべての画像が表示されることを確認
```

---

### ステップ4: プロンプトを入力して生成 ✨

```
1. prompt.txt の「コマ別プロンプト」をコピー
2. 以下のテンプレートで入力：

━━━━━━━━━━━━━━━━━━━━━━━━━━━
アップロードした画像を使って、漫画を生成してください。

【使用する画像】
• キャラクター: 主人公、サブキャラ（リファレンス画像）
• レイアウト: layout.png

【各コマの内容】
[prompt.txt の「コマ別プロンプト」をここに全部コピペ]

【必須条件】
• キャラクターはリファレンス画像の外見を使用
• レイアウトのコマ配置・吹き出し位置を維持
• セリフを正確に描画
━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. 送信（Enter）
4. 待つ（30秒〜1分）
5. 完成した漫画が生成される！
```

---

## 📊 出力される漫画

```
✅ レイアウト通りのコマ割り
✅ 吹き出しの位置も維持
✅ セリフも描画される
✅ キャラクターが全コマで統一
✅ 高品質な漫画スタイル
```

---

## 💡 うまくいくコツ

### ✅ キャラクター画像生成のコツ
```
• 背景はシンプルに（white background推奨）
• 全身が見える構図（full body, standing pose）
• 正面向き（front view）
• 高品質設定（masterpiece, best quality）
```

### ✅ NanoBanana生成のコツ
```
• プロンプトの最初に「重要な指示」を明記
• "キャラクターはリファレンス画像通り"と強調
• 1回でうまくいかない場合は2-3回試す
```

### ⚠️ よくある問題

**問題: キャラクターが統一されない**
```
解決策:
プロンプトに追加：
"IMPORTANT: Use the exact character design from the 
reference images. Do NOT change their appearance."
```

**問題: レイアウトが無視される**
```
解決策:
プロンプトの最初に追加：
"IMPORTANT: Keep the exact panel layout and speech 
bubble positions as shown in layout.png."
```

**問題: セリフが変わってしまう**
```
解決策:
各セリフを引用符で囲んで明示：
'Draw the exact text: "この森、静かだな"'
```

---

## 🎯 完成までの全体フロー

```
【1】このツールでネーム作成
    ↓ NanoBanana出力
    
【2】Stable Diffusionでキャラ画像生成
    ↓ character_主人公.png
    
【3】Google AI Studioにアップロード
    • キャラ画像
    • レイアウト画像
    ↓ プロンプト入力
    
【4】完成した漫画が生成される！
    ↓ ダウンロード
    
【5】完成！🎉
```

**所要時間: 2-3時間**（従来の数日〜数週間から大幅短縮！）

---

## 💰 コスト

```
このツール: 無料（1日10回まで）
Stable Diffusion: 無料（ローカル実行）または有料サービス
Google AI Studio: 無料枠あり

合計: ほぼ無料で始められる！
```

---

## 📚 詳細情報

- **詳しい使い方**: instructions.txt（ZIPに含まれる）
- **完全ガイド**: NANOBANANA_GUIDE.md
- **サポート**: https://github.com/taka-aiworks/ai-manga-name-maker-beta

---

**キャラクターリファレンス画像を先に生成するのがポイント！** 🎨✨

