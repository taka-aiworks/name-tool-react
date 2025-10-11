# 📖 AI漫画ネームメーカー - プロジェクトステータス

## 🎯 プロジェクト概要
AI漫画制作支援アプリケーション（ネーム段階）
- **テーマ**: 「AI漫画の描き方」を題材とした教育漫画
- **キャラクター**: リナ（初心者）× サユ（AI漫画の先生）
- **目標**: 100ページ前後のKDP出版対応漫画

## ✅ 完了した機能

### 🎨 UI/UX改善
- **統一カラーパレット**: 機能別色分けルールの実装
  - 💚 緑色系統 = ファイル操作（保存、作成）
  - 🔵 青色系統 = 出力・エクスポート
  - 🟠 オレンジ系統 = 編集・変更
  - 🔴 赤色系統 = 削除・危険操作
  - 🟣 紫色系統 = 設定・有効化
  - ⚫ グレー系統 = 管理・一覧

- **サイドバー整理**: 左・右サイドバーの開閉機能
- **ヘッダー整理**: 機能別ボタン配置の最適化
- **ダークモード完全対応**: 全モーダル・コンポーネント対応

### 💾 プロジェクト管理
- **保存機能の改善**: 新規保存時は名前入力、既存は上書き保存
- **プロジェクト一覧**: 作成日・更新日表示
- **インポート・エクスポート**: 完全対応
- **プロジェクト複製**: キャラクター情報含む完全複製
- **変更検知**: 未保存変更の自動検知と表示

### 🤖 AI機能統合
- **OpenAI API統合**: ストーリーからコマ内容自動生成
- **キャラクター登録**: AI Prompt Maker Web連携
- **プレビュー機能**: 2段階確認プロセス
- **プロンプト分離**: キャラクター・アクション別プロンプト

### 🔧 コマ操作機能
- **コマ入れ替え**: 直感的なクリック選択方式
- **コマ編集モード**: 詳細な編集機能
- **パネル設定**: AI生成の直下に配置
- **吹き出し編集**: 縦書き・横書き選択可能

### 📐 テンプレート・レイアウト
- **KDP出版対応**: 印刷用マージン設定
  - 上マージン: 20px
  - 左右マージン: 20px
  - 下マージン: 35px（ページ番号用スペース）
- **日本語読み順**: 右→左、上→下のコマ番号
- **テンプレート統一**: 全テンプレートの座標統一

### 📤 出力機能
- **プロンプト出力**: ページ・コマ別整理
- **NanoBanana対応**: 画像生成ツール連携
- **メモ機能**: 日本語メモ表示
- **キャラクタープロンプト**: 自動統合出力

## ⚠️ 現在の問題

### 🔄 アンドゥ/リドゥ機能の再実装状況
**状態: 部分的に完了 - 追加実装が必要**

#### 再実装の方針:
**useEffect自動保存をやめて、明示的な履歴保存に変更**

1. **useRefで同期的フラグ管理**
   ```typescript
   const isUndoRedoExecutingRef = useRef(false);
   ```

2. **デバウンス付き履歴保存関数**
   ```typescript
   const saveHistoryDebounced = () => {
     if (isUndoRedoExecutingRef.current) return;
     clearTimeout(saveHistoryTimerRef.current);
     saveHistoryTimerRef.current = setTimeout(() => {
       saveToHistory(...);
     }, 500);
   };
   ```

3. **各操作関数で明示的に呼び出し**

#### ✅ 履歴保存が実装済みの操作:
1. **テンプレート操作**
   - ✅ テンプレート適用時 (`handleTemplateClick`)

2. **ページ操作**
   - ✅ ページ切り替え時 (`pageManager.onDataUpdate`)

3. **パネル操作（App.tsx内）**
   - ✅ パネル移動/リサイズ (`handlePanelUpdate`)
   - ✅ パネル追加 (`handlePanelAdd`)
   - ✅ パネル削除 (`handlePanelDelete`)
   - ✅ パネル分割 (`handlePanelSplit`)
   - ✅ パネル入れ替え (`handlePanelSwap`)

4. **キャラクター操作（App.tsx内）**
   - ✅ キャラクター更新 (`handleCharacterUpdate`)
   - ✅ キャラクター削除 (`handleCharacterDelete`)

#### ❌ 履歴保存が未実装の操作:
1. **キャラクター操作（CanvasComponent内）**
   - ❌ キャラクター追加（Canvas上でのドロップ）
   - ❌ キャラクター移動（Canvas上でのドラッグ）
   - ❌ キャラクターリサイズ（Canvas上でのハンドル操作）
   - ❌ キャラクター表情変更（Canvas上での操作）

2. **吹き出し操作（CanvasComponent内）**
   - ❌ 吹き出し追加（Canvas上での追加）
   - ❌ 吹き出し移動（Canvas上でのドラッグ）
   - ❌ 吹き出しリサイズ（Canvas上でのハンドル操作）
   - ❌ 吹き出しテキスト編集（ダブルクリック編集）
   - ❌ 吹き出し削除（Canvas上での削除）

3. **背景操作（CanvasComponent内）**
   - ❌ 背景追加
   - ❌ 背景移動
   - ❌ 背景リサイズ
   - ❌ 背景削除

4. **効果操作（CanvasComponent内）**
   - ❌ 効果追加
   - ❌ 効果移動
   - ❌ 効果設定変更
   - ❌ 効果削除

5. **AI生成操作**
   - ❌ AI生成でコマ内容が更新された時

#### 技術的な課題:
**CanvasComponent内で直接状態更新が行われている**
```typescript
<CanvasComponent
  characters={characters}
  setCharacters={setCharacters}  // ← 直接渡している
  speechBubbles={speechBubbles}
  setSpeechBubbles={setSpeechBubbles}  // ← 直接渡している
  ...
/>
```

**解決策:**
1. **ラッパー関数を作成**: `setCharacters`の代わりに`handleCharactersChange`を渡す
2. **ラッパー内で履歴保存**: 状態更新後に`saveHistoryDebounced()`を呼ぶ
3. **CanvasComponentのすべての操作に適用**

## 🔄 進行中の作業
- **アンドゥ/リドゥ機能の完全実装**: CanvasComponent内の操作に履歴保存を追加

## 📋 今後の予定
1. **漫画制作**: リナ×サユのストーリー展開
2. **プロンプト最適化**: AI生成品質の向上
3. **テンプレート拡張**: より多様なコマ割り
4. **エクスポート機能強化**: より多くのツール対応

## 🛠️ 技術スタック
- **Frontend**: React + TypeScript
- **Canvas**: HTML5 Canvas API
- **AI**: OpenAI GPT-4o-mini
- **Storage**: LocalStorage
- **Styling**: CSS Variables + カラーパレット

## 📁 主要ファイル構成
```
src/
├── App.tsx                    # メインアプリケーション
├── styles/colorPalette.ts     # 統一カラーパレット
├── components/
│   ├── CanvasArea/
│   │   ├── templates.ts       # KDP対応テンプレート
│   │   └── CanvasDrawing.ts   # キャンバス描画
│   └── UI/
│       ├── ProjectPanel.tsx   # プロジェクト管理
│       ├── ExportPanel.tsx    # 出力機能
│       └── StoryToComicModal.tsx # AI生成UI
├── services/
│   ├── OpenAIService.ts       # AI統合
│   └── SaveService.ts         # データ管理
└── hooks/
    ├── useProjectSave.ts      # プロジェクト保存
    └── usePageManager.ts      # ページ管理
```

## 🎯 完成度
- **UI/UX**: 95% 完了
- **基本機能**: 80% 完了（アンドゥ/リドゥ不安定）
- **AI統合**: 90% 完了
- **プロジェクト管理**: 100% 完了
- **出力機能**: 95% 完了

**総合完成度: 88%**（アンドゥ/リドゥ問題により低下）

### ⚠️ 既知の不具合:
- **アンドゥ/リドゥ**: 履歴保存の挙動が不安定（調査中）

## 🚀 次のマイルストーン
1. **最優先**: アンドゥ/リドゥ機能の完全修正
2. 漫画制作の本格開始
3. AI生成機能とプロンプト出力機能の最適化

## 📝 開発メモ

### アンドゥ/リドゥ再実装の経緯:
**問題の本質:**
- useEffect依存配列による自動履歴保存は制御が困難
- アンドゥ/リドゥ実行時に新しい履歴が作られる問題
- 状態更新が3層（App.tsx → CanvasComponent → MouseEventHandler）に分散

**採用した解決策:**
1. **useRefで同期的フラグ管理** - レースコンディション防止
2. **明示的な履歴保存** - 各操作関数で`saveHistoryDebounced()`を呼び出し
3. **デバウンス処理** - 連続操作を1つの履歴にまとめる

**現在の課題:**
- CanvasComponent内の操作（Canvas上でのドラッグ/リサイズなど）で履歴保存されない
- `setCharacters`などを直接渡しているため、ラッパー関数が必要

**次のステップ:**
1. ラッパー関数を作成（`handleCharactersChange`など）
2. CanvasComponentに渡すpropsを変更
3. すべてのCanvas操作で履歴保存を確認

---
*最終更新: 2025年10月11日*