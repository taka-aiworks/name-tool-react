# ネーム制作ツール - プロジェクト状況ファイル（コード分割作業中）

## 基本情報
- **プロジェクト名**: React製ネーム制作支援ツール
- **技術スタック**: React + TypeScript + HTML5 Canvas + jsPDF + html2canvas
- **開発開始**: 2025年9月8日
- **最終更新**: 2025年9月10日（CharacterRenderer.tsx分割作業実施中）
- **現在の状況**: コード分割作業を優先実施中、リサイズ機能修復は分割後に実施予定

## 🚨 **現在発生中の問題**

### **リサイズ機能完全停止**（分割後修復予定）
- **症状**: 吹き出しとキャラクターのリサイズが一切動作しない
- **発生タイミング**: ファイル分割作業後
- **元々の状態**: Phase 8完了時点では正常動作していた
- **修復方針**: 分割完了後にピンポイント修復実施

### **コードサイズ過大問題**（対応中）
- **CharacterRenderer.tsx**: 1400行（実測値）→ 5ファイルに分割中
- **BubbleRenderer.tsx**: 300行超（分割予定）
- **CanvasComponent.tsx**: 600行超（分割予定）
- **現在の分割状況**: CharacterRenderer.tsx分割作業中

### **技術的詳細**（変更なし）
```
ログ出力（推定）:
🖱️ マウス移動イベント発生
❌ 移動処理スキップ: {isDragging: false, isResizing: false, isBubbleResizing: false}
```

**根本原因**: 
- `isBubbleResizing` フラグが `true` にならない
- `isCharacterResizing` フラグが `true` にならない
- リサイズハンドルクリック判定が失敗している

## 📂 **コード分割進捗状況**

### **Phase 8.1: CharacterRenderer.tsx分割**（作業中）

#### **分割計画**：
```
CharacterRenderer.tsx (1400行) → 5ファイルに分割
├── CharacterRenderer.tsx         # メイン処理（150行）
├── CharacterFaceRenderer.tsx     # 顔・髪・表情描画（200行）
├── CharacterBodyRenderer.tsx     # 体・ポーズ・腕描画（250行）
├── CharacterHandleRenderer.tsx   # リサイズハンドル・判定（100行）
└── CharacterUtils.tsx           # サイズ計算・ユーティリティ（100行）
```

#### **分割進捗**：
- ✅ **CharacterRenderer.tsx** (150行) - 完了
- ❌ **CharacterFaceRenderer.tsx** (200行) - **途中で止まっている**
- ✅ **CharacterBodyRenderer.tsx** (250行) - 完了
- ❌ **CharacterHandleRenderer.tsx** (100行) - **途中で止まっている**
- ✅ **CharacterUtils.tsx** (100行) - 完了

#### **残りタスク**：
1. **最優先**: CharacterFaceRenderer.tsx の完成（口描画部分の続き）
2. **次点**: CharacterHandleRenderer.tsx の完成（ハンドル位置配列の続き）
3. **確認**: 分割後のインポート関係の整合性チェック

### **Phase 8.2: 他ファイル分割**（未着手）

#### **BubbleRenderer.tsx分割案**:
```
BubbleRenderer.tsx (300行) → 3ファイルに分割
├── BubbleRenderer.tsx (基本描画・100行)
├── BubbleShapeRenderer.tsx (形状描画・100行)
└── BubbleHandleRenderer.tsx (リサイズハンドル・100行)
```

#### **CanvasComponent.tsx分割案**:
```
CanvasComponent.tsx (600行) → 3ファイルに分割
├── CanvasComponent.tsx (メイン・300行)
├── CanvasEventHandlers.tsx (イベント処理・200行)
└── CanvasStateManager.tsx (状態管理・100行)
```

## 現在の実装状況（変更なし）

### ✅ 正常動作中の機能

#### 基本Canvas描画
- パネル、キャラクター、吹き出しの表示
- ダークモード対応の描画システム

#### スナップ設定UI機能
- **✅ スナップON/OFF**: ワンクリックで有効/無効切り替え
- **📐 グリッドサイズ選択**: 10px / 20px / 40px から選択可能
- **⚙️ スナップ感度調整**: 弱(6px) / 中(12px) / 強(20px) の3段階
- **👁️ グリッド表示設定**: 常時表示 / 編集時のみ / 非表示
- **🎯 リアルタイム反映**: 設定変更が即座にキャンバスに反映
- **📊 状態表示**: 現在のスナップ設定を右上に表示

#### コマ操作機能
- **コマ編集モード**: Ctrl+E または画面上部ボタンで切り替え
- **コマ移動**: 青い円形ハンドル（中央）をドラッグ
- **カスタマイズ可能スナップ機能**: ユーザー設定に基づく自動位置合わせ
- **補助線表示**: 移動中に破線ガイド表示（設定可能）
- **設定可能グリッド表示**: サイズ・表示タイミングをカスタマイズ
- **コマリサイズ**: 8方向ハンドル
- **コマ分割**: 紫のハサミボタン（右下角）
- **コマ削除**: 複数の削除方法
- **コマ複製**: 右クリック「📋 コマ複製」でパネル内要素も一緒に複製

#### パネルテンプレート自動配置
- **6種類のテンプレート**に専用シーン自動配置
- **自動配置要素**: キャラクター・吹き出し・斜め方向機能活用

#### 要素移動機能（正常動作）
- **吹き出し移動**: 自由移動（パネル外移動可能）
- **キャラクター移動**: 絶対座標での自由移動
- **ダブルクリック編集**: 吹き出しテキスト編集
- **右クリックメニュー**: 全機能正常動作

#### コピー&ペースト機能
- **Ctrl+C**: 選択中の要素（コマ・キャラ・吹き出し）をコピー
- **Ctrl+V**: コピーした要素をペースト
- **右クリックメニュー**: 「📋 コピー」「📌 ペースト」ボタン
- **クリップボード表示**: 右上にコピー中の要素を表示
- **Delete/Backspace**: 選択中の要素を削除
- **Escape**: 選択解除

#### エクスポート機能
- **PDF出力**: ネーム用レイアウト（A4サイズ自動調整）
- **PNG画像出力**: 高画質画像ファイル
- **PSD（クリスタ用）出力**: レイヤー構造付きデータ

#### その他機能
- **反転機能**: 水平反転・垂直反転（編集モード時のみ）
- **アンドゥ/リドゥ機能**: 操作履歴管理
- **キーボードショートカット対応**: 各種ショートカット
- **UI機能**: ダークモード・サイドバーレイアウト

### 🚨 **動作不良の機能**

#### リサイズ機能（完全停止）
- **❌ 吹き出しリサイズ**: 8方向ハンドル表示されるがクリック無効
- **❌ キャラクターリサイズ**: 8方向ハンドル表示されるがクリック無効
- **原因**: マウスダウン時にリサイズモードフラグが設定されない
- **修復予定**: コード分割完了後にピンポイント修復

## 🔧 **必要な作業**

### **Phase 8.1: CharacterRenderer.tsx分割完了** 🚨 **現在実施中**
**最優先**: 途中で止まっているファイルの完成
1. CharacterFaceRenderer.tsx の口描画部分完成
2. CharacterHandleRenderer.tsx のハンドル配列部分完成
3. インポート関係の整合性確認

### **Phase 8.2: 他ファイル分割** 🔜 **CharacterRenderer完了後**
1. **BubbleRenderer.tsx分割**: 300行を3ファイルに分割
2. **CanvasComponent.tsx分割**: 600行を3ファイルに分割

### **Phase 8.3: リサイズ機能段階的修復** 🔜 **全分割完了後実施**
1. **最小限のリサイズハンドル修復**: クリック判定のみ
2. **段階的機能回復**: 移動→リサイズ→完全機能
3. **動作確認**: 各段階で動作テスト

### **Phase 9: 次世代機能** 🔜
- ズーム機能、ルーラー機能、残コード分割完了

## 🏗️ ファイル構造（分割後想定）
```
src/
├── types.ts                    # 共通型定義（SnapSettings追加）
├── App.tsx                     # メインアプリ（スナップ設定UI付き）
├── components/
│   ├── CanvasComponent.tsx     # Canvas操作中核（600行→300行予定）
│   ├── CanvasEventHandlers.tsx # イベント処理（200行・新規）
│   ├── CanvasStateManager.tsx  # 状態管理（100行・新規）
│   ├── UI/
│   │   ├── CharacterDetailPanel.tsx # キャラクター詳細設定
│   │   └── ExportPanel.tsx          # エクスポートUI
│   └── CanvasArea/
│       ├── PanelManager.ts          # パネル操作ロジック（350行）
│       ├── ContextMenuHandler.ts    # 右クリックメニュー処理（250行）
│       ├── CanvasDrawing.ts         # Canvas描画処理
│       ├── EditBubbleModal.tsx      # 編集モーダル
│       ├── templates.ts             # パネルテンプレート定義
│       ├── sceneTemplates.ts        # シーンテンプレート定義
│       └── renderers/
│           ├── BubbleRenderer.tsx        # 吹き出し描画（100行予定）
│           ├── BubbleShapeRenderer.tsx   # 吹き出し形状（100行・新規）
│           ├── BubbleHandleRenderer.tsx  # 吹き出しハンドル（100行・新規）
│           ├── CharacterRenderer.tsx     # キャラ統合（150行・完了）
│           ├── CharacterFaceRenderer.tsx # 顔描画（200行・未完了）
│           ├── CharacterBodyRenderer.tsx # 体描画（250行・完了）
│           ├── CharacterHandleRenderer.tsx # キャラハンドル（100行・未完了）
│           ├── CharacterUtils.tsx        # キャラユーティリティ（100行・完了）
│           └── PanelRenderer.tsx         # パネル描画・操作
├── services/
│   └── ExportService.ts        # エクスポート機能中核
```

**現在の進捗率: 88% 完了（分割作業により2%減、完了後90%に回復予定）** 🚧

## 🎯 対応方針

### **短期目標（本日中）**
1. **🔄 CharacterRenderer.tsx分割完了**: 途中ファイルの完成
2. **🔍 分割後動作確認**: インポート関係とビルド確認

### **中期目標（1-2日）**
1. **🔧 他ファイル分割**: BubbleRenderer.txt、CanvasComponent.tsx
2. **🔧 リサイズ機能段階的修復**: 分割後のピンポイント修復

### **長期目標（1週間）**
1. **🎨 背景・小物システム実装**: 効果線・集中線の追加
2. **🤖 ChatGPT API連携**: AIによるストーリー相談機能

## 📝 **開発者メモ**

### **現在のフォーカス**: コード分割の完了 🎯
### **分割の意義**: 1400行ファイルによる修正困難の解決
### **次回作業優先順位**:
1. **最優先**: CharacterFaceRenderer.tsx、CharacterHandleRenderer.tsx の完成
2. **次点**: 分割後の動作確認とビルドテスト
3. **最後**: BubbleRenderer.tsx、CanvasComponent.tsx の分割

**重要**: 分割完了後はピンポイントでリサイズ機能修復に集中

### **反省点**
- CharacterRenderer.txtが1400行だったのを800行と誤認識していた
- 分割作業中にファイルが途中で止まってしまった
- より慎重な段階的分割アプローチが必要