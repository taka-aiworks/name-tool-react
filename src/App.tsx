import React, { useState } from "react";
import CanvasComponent from "./components/CanvasComponent";
import "./legacy.css";
import { 
  Panel, 
  Character, 
  SpeechBubble, 
  SceneInfo, 
  CharacterInfo, 
  BubbleInfo, 
  TemplateInfo 
} from "./types"; // ← 型定義をインポート

// 型定義を削除（types.tsに移動済み）
// interface Panel { ... } ← 削除
// interface Character { ... } ← 削除  
// interface SpeechBubble { ... } ← 削除


function App() {
  // 状態管理
  const [selectedTemplate, setSelectedTemplate] = useState("4koma");
  const [dialogueText, setDialogueText] = useState("");
  const [plotText, setPlotText] = useState("");
  const [panels, setPanels] = useState<Panel[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [speechBubbles, setSpeechBubbles] = useState<SpeechBubble[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedScene, setSelectedScene] = useState("daily");

  // キャラクター追加機能（Canvasから提供される）
  const [addCharacterFunc, setAddCharacterFunc] = useState<
    ((type: string) => void) | null
  >(null);
  // 吹き出し追加機能（Canvasから提供される） ← これを追加
  const [addBubbleFunc, setAddBubbleFunc] = useState<
    ((type: string, text: string) => void) | null
  >(null);
  // 選択されたパネル情報を取得
  const [selectedPanelFromCanvas, setSelectedPanelFromCanvas] =
    useState<Panel | null>(null);

  // ダークモード切り替え
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "light" : "dark"
    );
    console.log("🌙 ダークモード切り替え:", !isDarkMode ? "ON" : "OFF");
  };

  // イベントハンドラー
  const handleTemplateClick = (template: string) => {
    setSelectedTemplate(template);
    console.log(`✅ ${template}テンプレート適用完了`);
  };

  const handleCharacterClick = (charType: string) => {
    console.log(
      "🎭 キャラクター追加試行:",
      charType,
      "パネル選択状態:",
      !!selectedPanelFromCanvas
    );

    if (addCharacterFunc && selectedPanelFromCanvas) {
      addCharacterFunc(charType);
      console.log(`✅ ${charType}をパネル${selectedPanelFromCanvas.id}に追加`);
    } else if (!selectedPanelFromCanvas) {
      console.log("⚠️ パネル未選択");
      // 一時的なメッセージ表示（ポップアップではなく）
      const statusElement = document.querySelector(".status-right");
      if (statusElement) {
        const originalText = statusElement.textContent;
        statusElement.textContent = "⚠️ まずパネルを選択してください";
        setTimeout(() => {
          statusElement.textContent = originalText;
        }, 2000);
      }
    } else {
      console.log("⚠️ キャラクター追加機能が準備できていません");
    }
  };

  const handleBubbleClick = (bubbleType: string) => {
  // 空でも吹き出し作成可能に変更
  const textToUse = dialogueText.trim() || "ダブルクリックで編集";  // ← メッセージ変更
  
  if (addBubbleFunc && selectedPanelFromCanvas) {
    addBubbleFunc(bubbleType, textToUse);
    console.log(`💬 吹き出し追加: ${bubbleType} - "${textToUse}"`);
    setDialogueText(""); // 入力欄をクリア
  } else if (!selectedPanelFromCanvas) {
    console.log("⚠️ パネル未選択");
  } else {
    console.log("⚠️ 吹き出し追加機能が準備できていません");
  }
};

  const handleExport = (type: string) => {
    console.log(`📤 ${type}エクスポート`, {
      panels: panels.length,
      characters: characters.length,
      speechBubbles: speechBubbles.length,
    });
  };

  const handleSceneChange = (scene: string) => {
    setSelectedScene(scene);
    console.log("🎭 シーン選択:", scene);
  };

  const addPage = () => {
    const newPage = currentPage + 1;
    setCurrentPage(newPage);
    console.log("📄 ページ追加:", newPage);
  };

  const switchPage = (page: number) => {
    setCurrentPage(page);
    console.log("📄 ページ切り替え:", page);
  };

  // Undo/Redo（簡易版）
  const handleUndo = () => {
    console.log("⏪ Undo（実装予定）");
  };

  const handleRedo = () => {
    console.log("⏩ Redo（実装予定）");
  };

  const showHelp = () => {
    alert(`📚 ネーム制作支援ツール ヘルプ

🎬 使い方:
1. シーンテンプレートを選択
2. パネルをクリックして選択
3. キャラクターを追加
4. セリフを入力して吹き出し追加
5. 完成したらエクスポート

⌨️ キーボードショートカット:
- F1: ヘルプ表示
- Ctrl+Z: 元に戻す（予定）
- Ctrl+Y: やり直し（予定）

🎯 パネルの操作:
- クリック: 選択
- ドラッグ: キャラクター移動
- 四隅ドラッグ: サイズ変更`);
  };

  return (
    <div className="App">
      {/* ヘッダー */}
      <div className="header">
        <h1>📚 ネーム制作支援ツール</h1>
        <p>コマ割り・キャラ配置・セリフを統合した漫画ネーム作成ツール</p>

        {/* 操作ボタンエリア */}
        <div className="header-controls">
          <div className="undo-redo-group">
            <button
              className="control-btn undo-btn"
              onClick={handleUndo}
              title="元に戻す (Ctrl+Z)"
            >
              <span className="btn-icon">⏪</span>
              <span className="btn-text">元に戻す</span>
            </button>
            <button
              className="control-btn redo-btn"
              onClick={handleRedo}
              title="やり直し (Ctrl+Y)"
            >
              <span className="btn-icon">⏩</span>
              <span className="btn-text">やり直し</span>
            </button>
          </div>

          <div className="quick-actions">
            <button
              className="control-btn help-btn"
              onClick={showHelp}
              title="キーボードショートカット (F1)"
            >
              <span className="btn-icon">❓</span>
              <span className="btn-text">ヘルプ</span>
            </button>

            <button className="control-btn" onClick={toggleDarkMode}>
              {isDarkMode ? "☀️ ライトモード" : "🌙 ダークモード"}
            </button>
          </div>
        </div>
      </div>

      {/* 操作状況表示バー */}
      <div className="operation-status">
        <div className="status-left">
          <span id="operationStatus">準備完了</span>
          <span id="historyStatus">履歴: 0/0</span>
        </div>
        <div className="status-right">
          <span>
            選択中: {selectedTemplate}テンプレート | パネル:{" "}
            {selectedPanelFromCanvas
              ? `P${selectedPanelFromCanvas.id}選択中`
              : "未選択"}{" "}
            | キャラクター数: {characters.length}
          </span>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container">
        {/* 左パネル：ストーリー構成 */}
        <div className="story-panel">
          {/* ストーリー構成 */}
          <div className="section">
            <h3>📖 ストーリー構成</h3>
            <div className="story-timeline">
              <div className="timeline-step active">導入</div>
              <div className="timeline-step">展開</div>
              <div className="timeline-step">転</div>
              <div className="timeline-step">結</div>
            </div>
            <textarea
              placeholder="プロット・あらすじを入力..."
              className="plot-input"
              value={plotText}
              onChange={(e) => setPlotText(e.target.value)}
            />
          </div>

          {/* シーン選択 */}
          <div className="section">
            <h3>🎭 シーン選択</h3>
            <div className="scene-buttons">
              {[
                { id: "daily", icon: "🌸", name: "日常シーン" },
                { id: "dialogue", icon: "💬", name: "会話シーン" },
                { id: "action", icon: "⚡", name: "アクションシーン" },
                { id: "emotional", icon: "😢", name: "感情シーン" },
                { id: "comedy", icon: "😂", name: "ギャグシーン" },
              ].map((scene) => (
                <div
                  key={scene.id}
                  className={`scene-btn ${
                    selectedScene === scene.id ? "active" : ""
                  }`}
                  onClick={() => handleSceneChange(scene.id)}
                >
                  {scene.icon} {scene.name}
                </div>
              ))}
            </div>
          </div>

          {/* ページ管理 */}
          <div className="section">
            <h3>📄 ページ管理</h3>
            <div className="page-tabs">
              <button
                className={`page-tab ${currentPage === 1 ? "active" : ""}`}
                onClick={() => switchPage(1)}
              >
                P1
              </button>
              <button
                className={`page-tab ${currentPage === 2 ? "active" : ""}`}
                onClick={() => switchPage(2)}
              >
                P2
              </button>
              <button className="page-tab" onClick={addPage}>
                +
              </button>
            </div>
            <div className="page-info">
              現在: {currentPage}ページ目 / 全2ページ
            </div>
          </div>
        </div>

        {/* メインキャンバス */}
        <div className="main-canvas">
          <div className="canvas-info">
            <strong>📐 ネームキャンバス:</strong> React版 |
            <strong>🎯 選択中:</strong>{" "}
            <span>{selectedTemplate}テンプレート</span> |
            <strong>📊 パネル数:</strong> <span>{panels.length}</span> |
            <strong>👥 キャラクター数:</strong> <span>{characters.length}</span>
          </div>

          <div className="canvas-container">
            <CanvasComponent
              selectedTemplate={selectedTemplate}
              panels={panels}
              setPanels={setPanels}
              characters={characters}
              setCharacters={setCharacters}
              speechBubbles={speechBubbles} // ← これを追加
              setSpeechBubbles={setSpeechBubbles} // ← これを追加
              onCharacterAdd={(func) => setAddCharacterFunc(() => func)}
              onBubbleAdd={(func) => setAddBubbleFunc(() => func)} // ← これを追加
              onPanelSelect={(panel) => setSelectedPanelFromCanvas(panel)}
            />
          </div>

          {plotText && (
            <div
              style={{
                marginTop: "15px",
                padding: "15px",
                background: "#e8f4f8",
                borderRadius: "8px",
                fontSize: "12px",
                border: "1px solid #bee5eb",
              }}
            >
              <strong>📝 現在のプロット:</strong>
              <p style={{ marginTop: "5px", lineHeight: "1.4" }}>{plotText}</p>
            </div>
          )}
        </div>

        {/* 右パネル：制作ツール */}
        <div className="tools-panel">
          {/* シーンテンプレート */}
          <div className="section">
            <h3>🎬 シーンテンプレート</h3>
            <div className="template-grid">
              {[
                { id: "4koma", title: "4コマ", desc: "基本構成" },
                { id: "dialogue", title: "会話", desc: "2人の対話" },
                { id: "action", title: "アクション", desc: "動きのシーン" },
                { id: "emotional", title: "感情", desc: "表情重視" },
                { id: "gag", title: "ギャグ", desc: "5コマ構成" },
                { id: "custom", title: "カスタム", desc: "自由作成" },
              ].map((template) => (
                <div
                  key={template.id}
                  className={`template-card ${
                    selectedTemplate === template.id ? "active" : ""
                  }`}
                  onClick={() => handleTemplateClick(template.id)}
                >
                  <div className="template-title">{template.title}</div>
                  <div className="template-desc">{template.desc}</div>
                </div>
              ))}
            </div>

            <div className="template-info">
              <div
                style={{ fontSize: "10px", color: "#666", marginTop: "8px" }}
              >
                📝 テンプレートクリックでパネルレイアウトが変更されます
              </div>
            </div>
          </div>

          {/* キャラ配置 */}
          <div className="section">
            <h3>👥 キャラ配置</h3>
            <div className="character-list">
              {[
                { id: "hero", icon: "主", name: "主人公" },
                { id: "heroine", icon: "ヒ", name: "ヒロイン" },
                { id: "rival", icon: "敵", name: "ライバル" },
                { id: "friend", icon: "友", name: "友人" },
              ].map((char) => (
                <div
                  key={char.id}
                  className={`char-item ${
                    !selectedPanelFromCanvas ? "disabled" : ""
                  }`}
                  onClick={() => handleCharacterClick(char.id)}
                  style={{
                    opacity: selectedPanelFromCanvas ? 1 : 0.5,
                    cursor: selectedPanelFromCanvas ? "pointer" : "not-allowed",
                  }}
                >
                  <div className="char-icon">{char.icon}</div>
                  <span>{char.name}</span>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "10px",
                padding: "8px",
                background: selectedPanelFromCanvas ? "#f0fff0" : "#fff8dc",
                borderRadius: "4px",
                fontSize: "10px",
                color: "#666",
              }}
            >
              {selectedPanelFromCanvas
                ? `🎯 パネル${selectedPanelFromCanvas.id}が選択されています`
                : "📍 まずパネルを選択してください"}
            </div>
          </div>

          {/* セリフ・吹き出し */}
          <div className="section">
            <h3>💬 セリフ・吹き出し</h3>
            <textarea
              className="dialogue-input"
              placeholder="セリフを入力してください..."
              value={dialogueText}
              onChange={(e) => setDialogueText(e.target.value)}
            />

            <div className="bubble-types">
              {[
                { id: "normal", icon: "💬", name: "普通" },
                { id: "shout", icon: "❗", name: "叫び" },
                { id: "whisper", icon: "💭", name: "小声" },
                { id: "thought", icon: "☁️", name: "心の声" },
              ].map((bubble) => (
                <div
                  key={bubble.id}
                  className="bubble-btn"
                  onClick={() => handleBubbleClick(bubble.id)} // ← bubble.name から bubble.id に修正
                >
                  {bubble.icon} {bubble.name}
                </div>
              ))}
            </div>
          </div>

          {/* 出力 */}
          <div className="section">
            <h3>📤 出力</h3>
            <div className="export-buttons">
              <button
                className="btn btn-primary"
                onClick={() => handleExport("クリスタ用データ")}
              >
                🎨 クリスタ用データ
              </button>
              <button
                className="btn btn-success"
                onClick={() => handleExport("PDF")}
              >
                📄 PDF (ネーム用)
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => handleExport("PNG画像")}
              >
                🖼️ PNG画像
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ステータスバー */}
      <div className="status-bar">
        <div>
          <span>React版ネーム制作ツール</span> |
          <span>パネル数: {panels.length}</span> |
          <span>要素数: {characters.length + speechBubbles.length}</span>
        </div>
        <div>📏 Canvas描画機能 ✅ | 💾 キャラクター機能 🔄</div>
      </div>
    </div>
  );
}

export default App;
