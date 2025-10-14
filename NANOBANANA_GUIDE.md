# 🍌 NanoBanana出力機能 - 使い方ガイド

## 📖 NanoBananaとは？

**NanoBanana**は、Google AI Studio（Gemini）の画像生成機能の一つで、**レイアウト画像とプロンプトを組み合わせて、一貫性のある漫画を自動生成**できるツールです。

### 🎯 このツールとの連携

```
AI漫画ネームメーカー → NanoBanana → 完成した漫画
    (ネーム制作)     (画像生成)      (完成)
```

---

## 📦 NanoBanana出力の内容

エクスポートすると、以下のZIPファイルが作成されます：

```
nanobanana_export_2025-10-14.zip
├── layout.png              # レイアウト画像（コマ割り）
├── prompt.txt              # AI画像生成用プロンプト
├── character_mapping.txt   # キャラクター名対応表
├── instructions.txt        # 使用方法ガイド
└── metadata.json           # メタデータ
```

### 📄 各ファイルの役割

#### 1. `layout.png` - レイアウト画像
- コマ割りが描かれた画像
- コマの配置、吹き出し、セリフが含まれる
- **これをNanoBananaにアップロードすると、同じレイアウトで画像が生成される**

#### 2. `prompt.txt` - プロンプト（キャラ・動作・セリフすべて含む）
```
=== コマ1 ===
📌 メモ: 主人公が森を歩いているシーン
💬 セリフ:
  1. 「この森、なんだか静かすぎる...」
🎨 画像生成プロンプト: solo, 1girl, teen, black hair, blue eyes, 
   black sweater, walking in forest, serious expression
  - キャラ: solo, 1girl, teen, black hair, blue eyes, black sweater
  - 動作: walking in forest, serious expression
```

**重要：セリフ情報も含まれているので、NanoBananaがテキストも描画します！**

#### 3. `character_mapping.txt` - キャラクター対応表
```
キャラクター名対応表
==================
character_1 → 主人公（リナ）
  - 詳細プロンプト: solo, 1girl, teen, black hair, blue eyes...
```

#### 4. `instructions.txt` - 使用方法（日本語）
NanoBananaでの具体的な使い方手順が日本語で記載されています

---

## 🚀 NanoBananaでの使い方（Google AI Studio）

### 準備

1. **Google AI Studio にアクセス**
   - https://aistudio.google.com にアクセス
   - Googleアカウントでログイン

2. **ZIPファイルを解凍**
   - エクスポートしたZIPを解凍
   - `layout.png`と`prompt.txt`を用意

### 方法1: 基本的な使い方

#### ステップ1: 新しいチャットを開始
```
1. Google AI Studio で「New Chat」をクリック
2. モデルを「Gemini 2.0 Flash Experimental」に設定
   （画像生成対応モデル）
```

#### ステップ2: レイアウト画像をアップロード
```
3. 「📎 Attach」ボタンをクリック
4. layout.png をアップロード
5. 画像が表示されることを確認
```

#### ステップ3: プロンプトを入力
```
6. prompt.txt を開く
7. Panel 1のプロンプトをコピー
8. 以下のように入力:

"This is a manga panel layout. Generate a full illustration 
for Panel 1 based on this layout.

Panel 1 Prompt:
solo, 1girl, teen, black hair, blue eyes, black sweater, 
walking in forest, serious expression, quiet forest background,
masterpiece, best quality, anime style

Keep the same panel position and speech bubble placement 
as shown in the layout image."
```

#### ステップ4: 生成・確認
```
9. 送信ボタンをクリック
10. AIが画像を生成（30秒〜1分）
11. 結果を確認
```

#### ステップ5: 他のコマも生成
```
12. Panel 2, 3, 4... と同じ手順を繰り返す
13. すべてのコマの画像が揃ったら完成！
```

### 方法2: 一括生成（推奨）

#### より効率的な方法
```
1. レイアウト画像をアップロード
2. 以下のようなプロンプトで一括生成:

"This is a 4-panel manga layout. Generate complete illustrations 
for all panels based on this layout.

Panel 1:
[prompt.txt の Panel 1 をコピペ]

Panel 2:
[prompt.txt の Panel 2 をコピペ]

Panel 3:
[prompt.txt の Panel 3 をコピペ]

Panel 4:
[prompt.txt の Panel 4 をコピペ]

Keep the same layout, panel positions, and speech bubble 
placements as shown in the reference image. Maintain character 
consistency across all panels."
```

### 方法3: キャラクター一貫性を重視

#### キャラクターが複数コマに登場する場合
```
1. 最初にキャラクターのリファレンス画像を生成
2. そのキャラクター画像も一緒にアップロード
3. プロンプトに追加:

"Use the character design from the reference image. 
Maintain the exact same appearance across all panels."
```

---

## 💡 プロンプトのコツ

### 基本構成
```
1. レイアウト指示: "Based on this manga layout..."
2. コマ指定: "Panel 1: [プロンプト]"
3. キャラクター一貫性: "Maintain character consistency..."
4. 品質指定: "masterpiece, best quality, anime style"
```

### 効果的なキーワード
```
- "manga panel layout" - コマ割りレイアウト
- "keep the same layout" - レイアウトを維持
- "maintain character consistency" - キャラクター一貫性
- "speech bubble placement" - 吹き出し配置
- "anime style" / "manga style" - アニメ/漫画スタイル
```

---

## ⚠️ よくある問題と解決策

### 問題1: レイアウトが無視される
**解決策:**
```
プロンプトの最初に明示:
"IMPORTANT: Keep the exact same panel layout, positions, 
and composition as shown in the reference image."
```

### 問題2: キャラクターが統一されない
**解決策:**
```
各パネルのプロンプトに同じキャラクター詳細を含める
（このツールは自動的にキャラクタープロンプトを統合します）
```

### 問題3: 吹き出しの位置がずれる
**解決策:**
```
プロンプトに追加:
"Keep speech bubbles in the same positions as the layout image."
```

### 問題4: 生成された画像が期待と違う
**解決策:**
```
1. プロンプトをより具体的に
2. "Negative Prompt"を活用（prompt.txtに含まれています）
3. 複数回生成して、ベストを選択
```

---

## 🎨 完成後の仕上げ

### NanoBananaで生成した画像を使う

```
1. 生成された各コマの画像をダウンロード
2. 画像編集ソフト（Photoshop / GIMP / クリスタ）で開く
3. レイアウト画像を参考に、コマを配置
4. 吹き出しとセリフを追加（レイアウト通り）
5. 仕上げ・調整
6. 完成！
```

### または、このツールに戻って仕上げ
```
1. NanoBananaで生成した画像を保存
2. 背景として各コマにインポート（実装予定）
3. 吹き出しは既に配置済み
4. 微調整して完成
```

---

## 📊 ワークフロー全体図

```
┌─────────────────────────────────────┐
│ AI漫画ネームメーカー                  │
│                                     │
│ 1. ストーリー入力                     │
│ 2. AI自動生成（コマ・セリフ）          │
│ 3. レイアウト調整                     │
│ 4. NanoBananaエクスポート             │
└─────────────────────────────────────┘
              ↓ (ZIPダウンロード)
┌─────────────────────────────────────┐
│ Google AI Studio (NanoBanana)       │
│                                     │
│ 1. layout.png をアップロード          │
│ 2. prompt.txt からプロンプトコピー     │
│ 3. 画像生成実行                       │
│ 4. 各コマの画像をダウンロード          │
└─────────────────────────────────────┘
              ↓ (画像ファイル)
┌─────────────────────────────────────┐
│ 画像編集ソフト（Photoshop等）         │
│                                     │
│ 1. 生成画像を配置                     │
│ 2. 吹き出し・セリフを追加             │
│ 3. 仕上げ・調整                       │
│ 4. 完成！                            │
└─────────────────────────────────────┘
```

---

## 💰 コスト

### Google AI Studio（NanoBanana）
- **無料枠あり**（2024年10月時点）
- 月間の生成回数制限あり
- 詳細: https://aistudio.google.com

### このツール + NanoBanana
```
このツール: 無料（1日10回AI生成まで）
NanoBanana: 無料枠あり
合計コスト: 実質¥0で始められる！
```

---

## 🔗 参考リンク

- [NanoBanana使い方｜10分で4コママンガ作成](https://eikyuhozon.com/generative-ai/nanobanana-guide.html)
- [Google AI Studio](https://aistudio.google.com)
- [NanoBananaとは何か？徹底解説](https://ensou.app/blog/nanobanana/)

---

## 💬 サポート

NanoBanana出力について分からないことがあれば：
- アプリ内の「🧪 フィードバック」ボタン
- GitHub Issues: https://github.com/taka-aiworks/ai-manga-name-maker-beta/issues

---

**NanoBanana出力を使えば、レイアウトから完成した漫画が自動生成できます！** 🎉

ぜひお試しください！

