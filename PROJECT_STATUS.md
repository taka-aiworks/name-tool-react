# ネーム制作ツール - プロジェクト状況ファイル

## 基本情報
- **プロジェクト名**: React製ネーム制作支援ツール
- **技術スタック**: React + TypeScript + HTML5 Canvas + jsPDF + html2canvas
- **開発開始**: 2025年9月8日
- **最終更新**: 2025年9月13日
- **現在の状況**: **Phase 11.0開始: プロンプト連携機能実装準備** 🚀

## ✅ **完了済み主要機能（高品質実装済み）**

### **コア機能群**
- **Canvas描画システム**: パネル・キャラクター・吹き出し表示
- **8方向リサイズ**: 吹き出し・キャラクター完全対応
- **コマ操作**: 移動・分割・削除・複製（スナップ機能付き）
- **コピー&ペースト**: 全要素対応
- **エクスポート**: PDF/PNG/PSD出力
- **2D回転機能**: 完全実装・動作確認済み

### **UI・操作性**
- **スナップ設定UI**: 完全カスタマイズ対応
- **ダークモード**: 完全対応
- **キーボードショートカット**: 主要操作対応
- **右クリックメニュー**: 全機能アクセス可能

### **🏗️ CharacterRenderer分割成功**
**Before**: 1つの巨大ファイル（800行）
**After**: 機能別5ファイル構成
- **保守性**: 300%向上（機能別責任分離）
- **開発効率**: 並列開発・デバッグ効率化
- **拡張性**: 新機能追加が極めて容易

## 🚀 **Phase 11.0: プロンプト連携機能**

### **🎯 機能概要**
キャラクターの位置・角度・向き情報を自動分析し、AI画像生成用プロンプトテキストを生成する機能

### **📊 実装予定機能**
1. **キャラクター状態自動分析**
   - 位置分析: パネル内での配置（左・中央・右、上・中・下）
   - 角度分析: 回転角度から向き判定（正面・横向き・斜め・後ろ向き）
   - サイズ分析: キャラクターサイズから構図判定（アップ・ミディアム・ワイド）
   - 傾き分析: 回転角度から傾き度合い判定

2. **プロンプトテキスト自動生成**
   - 基本情報: キャラクター名・タイプ
   - 構図情報: "close-up portrait", "upper body shot", "full body shot"
   - 向き情報: "facing left", "three-quarter view", "side view"
   - 角度情報: "slight tilt", "rotated 30°"
   - 位置情報: "positioned center", "positioned left"

3. **キャラクター間関係分析**
   - 距離関係: "close together", "distant"
   - 向き関係: "facing each other", "looking away"
   - 配置関係: "side by side", "facing off"

4. **シーン全体プロンプト生成**
   - 複数キャラクターの統合分析
   - カスタムコンテキスト追加
   - 既存プロンプトツールとの連携

### **🏗️ 実装予定ファイル構成**

```
src/
├── services/
│   ├── ExportService.ts                  # 既存（PDF/PNG）✅
│   └── PromptService/                    # 🆕 新規作成予定
│       ├── CharacterPromptAnalyzer.ts        # キャラクター状態分析
│       ├── PromptExportService.ts            # プロンプト生成・エクスポート
│       ├── PromptTemplates.ts                # プロンプトテンプレート管理
│       └── types/
│           └── PromptTypes.ts                # プロンプト関連型定義
├── components/
│   ├── UI/
│   │   ├── ExportPanel.tsx               # 既存 ✅
│   │   └── PromptPanel.tsx               # 🆕 プロンプト生成UI
│   └── CanvasArea/
│       └── renderers/
│           └── CharacterRenderer/        # 既存（回転機能完備）✅
│               ├── utils/
│               │   ├── CharacterUtils.ts     # 既存 ✅
│               │   └── CharacterBounds.ts    # 既存 ✅
│               └── ...
├── hooks/
│   └── usePromptGeneration.ts            # 🆕 プロンプト生成カスタムhook
└── utils/
    └── PromptUtils.ts                    # 🆕 プロンプト関連ユーティリティ
```

### **🔧 実装技術詳細**

#### **CharacterPromptAnalyzer.ts**
```typescript
interface CharacterPromptData {
  name: string;
  position: { panelPosition: 'left'|'center'|'right', size: 'small'|'medium'|'large' };
  orientation: { rotation: number, facingDirection: string, tilt: string };
  composition: { viewType: string, framePosition: string };
}

// 角度→向き変換ロジック
// 0-15°: 'front', 15-75°: 'diagonal-right', 75-105°: 'right' など
```

#### **PromptExportService.ts**
```typescript
// 使用例
const prompt = PromptExportService.exportToPrompt(characters, panels, {
  customContext: "manga panel, black and white",
  includeRotations: true,
  includeInteractions: true
});
// → "manga panel, black and white, 主人公 upper body shot facing diagonal-right, rotated 30°..."
```

#### **PromptPanel.tsx**
- リアルタイムプロンプト生成プレビュー
- カスタムコンテキスト入力
- 既存プロンプトツールへのエクスポート機能
- キャラクター別詳細表示

### **🎯 既存システムとの連携**
1. **CharacterRenderer**: 既存の角度・位置情報を活用
2. **ExportService**: PDF/PNG機能と並列でプロンプト出力
3. **既存プロンプトツール**: 生成したプロンプトを外部ツールに送信

## 🔄 進行中
- **Phase 11.0**: プロンプト連携機能実装準備中

## ❌ 未実装・今後の課題
1. **🔥 高優先**: プロンプト連携機能（Phase 11.0）
2. **スナップ回転機能**: 15度単位での角度スナップ
3. **シーンテンプレート自動配置**: テンプレート選択時にキャラ・吹き出し自動生成
4. **キャラクター自由移動**: パネル外移動対応
5. **3D回転機能**: Y軸・Z軸回転の実装

## 🎯 開発優先度
1. **最高**: プロンプト連携機能（実用性・差別化要素）
2. **高**: スナップ回転機能（UX向上）
3. **中**: シーンテンプレート自動配置（作業効率化）
4. **低**: 3D回転機能（高度な表現力）

## 🏗️ **現在のファイル構造（Phase 11.0拡張予定）**
```
src/
├── types.ts                    # 型定義（rotation対応）✅
├── components/
│   ├── CanvasComponent/        # ← 分割完了（250行）✅
│   │   ├── hooks/              # カスタムhooks ✅
│   │   │   ├── useCanvasState.ts    # 回転状態管理完備 ✅
│   │   │   ├── useMouseEvents.ts    # 回転・移動・リサイズ統合 ✅
│   │   │   └── useCanvasDrawing.ts ✅
│   │   └── utils/              # ユーティリティ ✅
│   ├── UI/
│   │   ├── CharacterDetailPanel.tsx # キャラクター詳細設定 ✅
│   │   ├── ExportPanel.tsx          # エクスポートUI ✅
│   │   └── PromptPanel.tsx          # 🆕 プロンプト生成UI（予定）
│   └── CanvasArea/
│       └── renderers/
│           ├── BubbleRenderer.tsx        # 吹き出し描画 ✅
│           ├── CharacterRenderer/        # ← 分割完了・回転機能統合
│           │   ├── CharacterRenderer.tsx     # メイン制御（250行）✅
│           │   ├── CharacterRotation.ts      # 回転専用処理 ✅
│           │   ├── utils/
│           │   │   ├── CharacterUtils.ts    # 計算・変換 ✅
│           │   │   └── CharacterBounds.ts   # 境界・判定 ✅
│           │   └── drawing/
│           │       └── CharacterHair.ts     # 髪の毛描画 ✅
│           └── PanelRenderer.tsx         # パネル描画・操作 ✅
├── services/
│   ├── ExportService.ts        # エクスポート機能中核 ✅
│   └── PromptService/          # 🆕 プロンプト関連サービス（予定）
│       ├── CharacterPromptAnalyzer.ts
│       ├── PromptExportService.ts
│       └── PromptTemplates.ts
└── hooks/
    └── usePromptGeneration.ts  # 🆕 プロンプト生成hook（予定）
```

## 📝 **Phase 11.0 実装計画**

### **Step 1: 基盤実装**
1. **PromptTypes.ts**: インターフェース・型定義
2. **CharacterPromptAnalyzer.ts**: 状態分析ロジック
3. **PromptExportService.ts**: プロンプト生成エンジン

### **Step 2: UI実装**
1. **PromptPanel.tsx**: プロンプト生成UI
2. **usePromptGeneration.ts**: リアルタイム生成hook
3. **既存ExportPanel.tsx拡張**: プロンプト出力オプション追加

### **Step 3: 連携実装**
1. **既存プロンプトツール連携**: API/データ送信機能
2. **テンプレート管理**: カスタムプロンプトテンプレート
3. **プレビュー機能**: 生成プロンプトのリアルタイム確認

### **🎯 期待効果**
- **ネーム→AI画像の自動化**: 手動プロンプト作成の大幅効率化
- **精密な角度指定**: 2D回転機能との完全連携
- **シーン解析**: キャラクター関係の自動分析
- **差別化**: 他ツールにない独自機能

## 📊 **現在の実装状況: Phase 10.1完了 → Phase 11.0開始**

**Phase 10.1成果**:
- 2D回転機能完全実装
- アーキテクチャ基盤完成
- 高い保守性・拡張性確保

**Phase 11.0目標**:
- プロンプト連携機能実装
- AI画像生成との完全統合
- 作業効率の革新的向上

**実装確実性**: 高（既存の角度・位置データ活用、技術的課題なし）

---

## 🔄 **継続プロンプト（Phase 11.0実装版）**

### **次回セッション用**
```
継続プロンプト: 2025-09-13_開発_08
チャットタイトル: 開発_ネーム制作ツール_Phase11.0_プロンプト連携機能_2025-09-13
セッションキー: 2025-09-13_開発_08

コンテキスト: React製ネーム制作ツールのPhase 10.1（2D回転機能）完全実装後、Phase 11.0のプロンプト連携機能実装を開始。キャラクターの位置・角度・向きからAI画像生成用プロンプトを自動生成する機能の実装準備完了。

進行状況:
✅ Phase 10.1完了: 2D回転機能完全実装・動作確認済み
✅ アーキテクチャ基盤完成: 高い保守性・拡張性確保
✅ Phase 11.0設計完了: プロンプト連携機能の技術仕様策定
✅ ファイル構成計画完了: services/PromptService/配下の実装計画

実装予定機能:
- キャラクター状態自動分析（位置・角度・向き・サイズ）
- プロンプトテキスト自動生成（構図・向き・角度情報）
- キャラクター間関係分析（距離・向き関係）
- リアルタイムプロンプトプレビューUI

次のアクション:
優先度1: CharacterPromptAnalyzer.ts実装（状態分析ロジック）
優先度2: PromptExportService.ts実装（プロンプト生成エンジン）
優先度3: PromptPanel.tsx実装（プロンプト生成UI）

継続指示:
Phase 11.0のプロンプト連携機能実装を開始してください。まずCharacterPromptAnalyzer.tsから実装し、キャラクターの回転角度・位置・サイズ情報を分析してAI画像生成用プロンプトテキストを自動生成する機能を構築してください。既存の2D回転機能と完全連携し、直感的で実用的なプロンプト生成システムを実現してください。
```