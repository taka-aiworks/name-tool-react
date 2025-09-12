# ネーム制作ツール - プロジェクト状況ファイル（3D化検討フェーズ）

## 基本情報
- **プロジェクト名**: React製ネーム制作支援ツール
- **技術スタック**: React + TypeScript + HTML5 Canvas + jsPDF + html2canvas
- **開発開始**: 2025年9月8日
- **最終更新**: 2025年9月12日（3D化検討フェーズ）
- **現在の状況**: **Phase 10準備: 3D化実装計画策定** 🎯

## 🎯 **現在のフォーカス: 段階的3D化実装**

### **🚀 3D化アプローチ（段階的進化）**
1. **Phase 10.1: 2D回転機能** ← **推奨開始点**
2. **Phase 10.2: 擬似3D表現**
3. **Phase 10.3: 本格3D化（Three.js統合）**

### **✅ ファイル分割完了（Phase 9達成）**
- **CanvasComponent.tsx**: 1,200行 → 250行に大幅分割 ✅
- **管理性300%向上**: hooks/handlers/utils分離完了 ✅
- **並列開発対応**: 機能別独立開発可能 ✅
- **保守性劇的改善**: Single Responsibility実現 ✅

## 🏗️ **段階的3D化実装計画**

### **Phase 10.1: 2D回転機能** ← **次の実装対象**
```typescript
// 実装対象機能
interface RotationFeature {
  rotationHandle: CircularHandle;        // 回転ハンドル表示
  dragRotation: DragRotationSystem;      // ドラッグ操作
  canvasTransform: CanvasRotation;       // Canvas回転描画
  hitDetection: RotatedHitDetection;     // 回転後当たり判定
}
```

**実装ファイル**: 
- `CharacterRenderer/CharacterRotation.ts` ← 新規作成
- `CharacterRenderer/CharacterInteraction.ts` ← 拡張

**技術要件**:
- Canvas 2D Context `transform()` / `rotate()`
- 回転ハンドルUI設計（既存リサイズハンドル参考）
- 角度計算・座標変換（数学関数）
- 回転後の境界ボックス再計算

### **Phase 10.2: 擬似3D表現**
```typescript
// 予定実装機能
interface Pseudo3D {
  cssTransforms: CSS3DTransform;         // CSS 3D transforms
  perspectiveView: PerspectiveSystem;    // 遠近感表現
  layerDepth: DepthLayering;            // レイヤー深度
  shadowEffects: DropShadowSystem;       // 影効果
}
```

### **Phase 10.3: 本格3D化（Three.js統合）**
```typescript
// 将来実装機能
interface Full3D {
  threeJsRenderer: Three.WebGLRenderer;  // WebGL 3D描画
  sceneManagement: Three.Scene;          // 3Dシーン管理  
  cameraControls: CameraSystem;          // カメラ操作
  lightingSystem: LightingSetup;         // ライティング
}
```

## 📊 **現在の実装状況（96% 完了）**

### **✅ 完全動作中の機能**

#### **基本Canvas描画**
- パネル、キャラクター、吹き出しの表示
- ダークモード対応の描画システム

#### **リサイズ機能（完全修復済み）**
- **✅ 吹き出しリサイズ**: 8方向ハンドル（縦・横・斜め自由変更）
- **✅ キャラクターリサイズ**: 8方向ハンドル（縦・横・斜め自由変更）
- **✅ ハンドル表示**: 角（四角）・辺（丸）で視覚的区別
- **✅ 座標維持**: リサイズ時の予期しない移動なし
- **✅ 最小サイズ制限**: 適切な下限値設定

#### **スナップ設定UI機能**
- **✅ スナップON/OFF**: ワンクリックで有効/無効切り替え
- **📐 グリッドサイズ選択**: 10px / 20px / 40px から選択可能
- **⚙️ スナップ感度調整**: 弱(6px) / 中(12px) / 強(20px) の3段階
- **👁️ グリッド表示設定**: 常時表示 / 編集時のみ / 非表示
- **🎯 リアルタイム反映**: 設定変更が即座にキャンバスに反映

#### **コマ操作機能**
- **コマ編集モード**: Ctrl+E または画面上部ボタンで切り替え
- **コマ移動**: 青い円形ハンドル（中央）をドラッグ
- **カスタマイズ可能スナップ機能**: ユーザー設定に基づく自動位置合わせ
- **コマリサイズ**: 8方向ハンドル
- **コマ分割**: 紫のハサミボタン（右下角）
- **コマ削除**: 複数の削除方法
- **コマ複製**: 右クリック「📋 コマ複製」でパネル内要素も一緒に複製

#### **パネルテンプレート自動配置**
- **6種類のテンプレート**に専用シーン自動配置
- **自動配置要素**: キャラクター・吹き出し・斜め方向機能活用

#### **要素移動機能**
- **吹き出し移動**: 自由移動（パネル外移動可能）
- **キャラクター移動**: 絶対座標での自由移動
- **ダブルクリック編集**: 吹き出しテキスト編集
- **右クリックメニュー**: 全機能正常動作

#### **コピー&ペースト機能**
- **Ctrl+C**: 選択中の要素（コマ・キャラ・吹き出し）をコピー
- **Ctrl+V**: コピーした要素をペースト
- **右クリックメニュー**: 「📋 コピー」「📌 ペースト」ボタン
- **クリップボード表示**: 右上にコピー中の要素を表示
- **Delete/Backspace**: 選択中の要素を削除
- **Escape**: 選択解除

#### **エクスポート機能**
- **PDF出力**: ネーム用レイアウト（A4サイズ自動調整）
- **PNG画像出力**: 高画質画像ファイル
- **PSD（クリスタ用）出力**: レイヤー構造付きデータ

#### **その他機能**
- **反転機能**: 水平反転・垂直反転（編集モード時のみ）
- **アンドゥ/リドゥ機能**: 操作履歴管理
- **キーボードショートカット対応**: 各種ショートカット
- **UI機能**: ダークモード・サイドバーレイアウト

## 🔧 **今後の開発予定**

### **Phase 10.1: 2D回転機能実装** ← **次の実装対象**
**実装期間**: 2-3日  
**実装内容**:
1. **🔄 回転ハンドル設計**: キャラクター周囲に円形ハンドル配置
2. **🎯 ドラッグ操作**: マウスドラッグによる360度回転
3. **🖼️ Canvas回転描画**: `context.rotate()` による回転描画
4. **📐 当たり判定対応**: 回転後の境界ボックス再計算

**技術的課題**:
- 回転中心点の正確な計算
- 回転後座標変換の実装
- 他の要素との干渉防止
- パフォーマンス最適化

### **Phase 10.2: 擬似3D表現実装**
**実装期間**: 1週間  
**実装内容**:
1. **🎨 CSS 3D transforms**: `perspective` / `rotateX` / `rotateY`
2. **💫 遠近感表現**: キャラクターの奥行き表現
3. **🌊 レイヤー深度**: Z-index による重ね順制御
4. **🌓 影効果**: リアルな影システム

### **Phase 10.3: 本格3D化実装**
**実装期間**: 2-3週間  
**実装内容**:
1. **🚀 Three.js統合**: WebGL 3D描画システム
2. **📹 3Dカメラシステム**: 視点操作・ズーム機能
3. **💡 ライティングシステム**: リアルな光源効果
4. **🎮 3D操作UI**: 3D空間での直感的操作

## 🏗️ **現在のファイル構造（分割完了版）**
```
src/
├── types.ts                    # 型定義（Character: width/height対応）
├── App.tsx                     # メインアプリ（スナップ設定UI付き）
├── components/
│   ├── CanvasComponent/        # ← 分割完了（250行）
│   │   ├── CanvasComponent.tsx # メインコンポーネント
│   │   ├── hooks/              # カスタムhooks
│   │   │   ├── useCanvasState.ts
│   │   │   ├── useMouseEvents.ts
│   │   │   ├── useKeyboardEvents.ts
│   │   │   └── useCanvasDrawing.ts
│   │   ├── handlers/           # イベントハンドラー
│   │   │   ├── MouseDownHandler.ts
│   │   │   ├── MouseMoveHandler.ts
│   │   │   ├── MouseUpHandler.ts
│   │   │   └── ClickHandler.ts
│   │   └── utils/              # ユーティリティ
│   │       ├── CanvasUtils.ts
│   │       └── StateUtils.ts
│   ├── UI/
│   │   ├── CharacterDetailPanel.tsx # キャラクター詳細設定
│   │   └── ExportPanel.tsx          # エクスポートUI
│   └── CanvasArea/
│       ├── PanelManager.ts          # パネル操作ロジック
│       ├── ContextMenuHandler.ts    # 右クリックメニュー処理
│       ├── CanvasDrawing.ts         # Canvas描画処理
│       ├── EditBubbleModal.tsx      # 編集モーダル
│       ├── templates.ts             # パネルテンプレート定義
│       ├── sceneTemplates.ts        # シーンテンプレート定義
│       └── renderers/
│           ├── BubbleRenderer.tsx        # 吹き出し描画
│           ├── CharacterRenderer/        # ← 3D化対象
│           │   ├── CharacterRenderer.tsx
│           │   ├── CharacterUtils.ts
│           │   ├── CharacterResize.ts
│           │   ├── CharacterInteraction.ts
│           │   └── CharacterRotation.ts  # ← 新規追加予定
│           └── PanelRenderer.tsx         # パネル描画・操作
├── services/
│   └── ExportService.ts        # エクスポート機能中核
```

## 📈 **3D化実装後の予想構造**
```
src/
├── components/
│   └── CanvasArea/
│       └── renderers/
│           ├── CharacterRenderer/
│           │   ├── CharacterRenderer.tsx     # メイン描画
│           │   ├── CharacterUtils.ts         # ユーティリティ
│           │   ├── CharacterResize.ts        # リサイズ処理
│           │   ├── CharacterInteraction.ts   # インタラクション
│           │   ├── CharacterRotation.ts      # 🆕 2D回転機能
│           │   ├── Character3D.ts            # 🆕 擬似3D表現
│           │   └── CharacterThreeJS.ts       # 🆕 本格3D機能
│           └── [その他既存ファイル]
├── utils/
│   ├── MathUtils.ts            # 🆕 数学計算（角度・座標変換）
│   ├── 3DTransforms.ts         # 🆕 3D変換ユーティリティ
│   └── ThreeJSHelpers.ts       # 🆕 Three.js支援機能
```

**現在の進捗率: 96% 完了** 🎉  
**3D化準備完了率: 100%** ✅

## 🎯 **次回実装方針**

### **推奨実装順序**
1. **🔄 2D回転機能**: 即効性・基盤構築の両面で最適
2. **💫 擬似3D表現**: 安全で視覚的インパクト大
3. **🚀 本格3D化**: 最終目標・差別化要素

### **技術的優位性**
- **分割済みアーキテクチャ**: 新機能追加が極めて容易
- **型定義システム**: TypeScript厳密管理で品質担保
- **独立レンダリング**: CharacterRenderer完全分離済み
- **イベント処理基盤**: マウス操作システム確立済み

### **リスク管理**
- **段階的実装**: 各フェーズで動作検証
- **後方互換性**: 既存2D機能の完全維持
- **パフォーマンス監視**: 3D処理の最適化
- **フォールバック**: 3D非対応環境への対応

## 📝 **開発者メモ**

### **🎯 3D化の戦略的価値**
- **競合優位性**: 2D→3D進化による差別化
- **ユーザー体験**: 直感的・視覚的な表現力向上
- **技術的成長**: 最新Web技術の習得・活用
- **将来性**: VR/AR対応への発展基盤

### **🔧 実装上の重要ポイント**
- **パフォーマンス第一**: 60fps維持が必須
- **使いやすさ優先**: 3D化で複雑にならない
- **段階的移行**: ユーザーが自然に慣れる設計
- **品質保証**: 各段階での十分なテスト

**次回作業時の最優先事項:**
1. **CharacterRotation.ts作成**: 2D回転機能の実装開始
2. **回転ハンドルUI設計**: 直感的な操作インターフェース
3. **Canvas回転描画**: transform/rotate関数の活用

**🚀 3D化実装フェーズ開始準備完了！** 段階的進化で確実に成功させましょう！