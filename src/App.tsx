// src/App.tsx (コマ操作・自動配置機能追加版)
import React, { useState, useEffect } from "react";
import CanvasComponent from "./components/CanvasComponent";
import CharacterDetailPanel from "./components/UI/CharacterDetailPanel";
import { Panel, Character, SpeechBubble } from "./types";
import { templates, applyTemplateDefaults } from "./components/CanvasArea/templates";
import { sceneTemplates, applySceneTemplate } from "./components/CanvasArea/sceneTemplates";
import "./App.css";

function App() {
  // デフォルトダークモード設定
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    console.log("🌙 デフォルトダークモード設定完了");
  }, []);

  // 基本状態管理
  const [selectedTemplate, setSelectedTemplate] = useState<string>("4koma");
  const [panels, setPanels] = useState<Panel[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [speechBubbles, setSpeechBubbles] = useState<SpeechBubble[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null);
  const [dialogueText, setDialogueText] = useState<string>("");

  // UI状態管理
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [selectedScene, setSelectedScene] = useState<string>("");
  const [showCharacterPanel, setShowCharacterPanel] = useState<boolean>(false);
  
  // 🆕 コマ編集モード
  const [isPanelEditMode, setIsPanelEditMode] = useState<boolean>(false);

  // 機能コールバック用の状態
  const [addCharacterFunc, setAddCharacterFunc] = useState<((type: string) => void) | null>(null);
  const [addBubbleFunc, setAddBubbleFunc] = useState<((type: string, text: string) => void) | null>(null);

  // アンドゥ/リドゥ機能
  const [operationHistory, setOperationHistory] = useState<{
    characters: Character[][];
    speechBubbles: SpeechBubble[][];
    panels: Panel[][]; // 🆕 パネル履歴も追加
    currentIndex: number;
  }>({
    characters: [[]],
    speechBubbles: [[]],
    panels: [[]],
    currentIndex: 0,
  });

  // アンドゥ/リドゥ機能の実装（パネル対応版）
  const saveToHistory = (newCharacters: Character[], newBubbles: SpeechBubble[], newPanels: Panel[]) => {
    setOperationHistory(prev => {
      const newHistory = {
        characters: [...prev.characters.slice(0, prev.currentIndex + 1), [...newCharacters]],
        speechBubbles: [...prev.speechBubbles.slice(0, prev.currentIndex + 1), [...newBubbles]],
        panels: [...prev.panels.slice(0, prev.currentIndex + 1), [...newPanels]], // 🆕
        currentIndex: prev.currentIndex + 1,
      };
      
      // 履歴上限管理
      if (newHistory.characters.length > 50) {
        newHistory.characters = newHistory.characters.slice(1);
        newHistory.speechBubbles = newHistory.speechBubbles.slice(1);
        newHistory.panels = newHistory.panels.slice(1); // 🆕
        newHistory.currentIndex = Math.max(0, newHistory.currentIndex - 1);
      }
      
      return newHistory;
    });
  };

  const handleUndo = () => {
    if (operationHistory.currentIndex > 0) {
      const newIndex = operationHistory.currentIndex - 1;
      setCharacters([...operationHistory.characters[newIndex]]);
      setSpeechBubbles([...operationHistory.speechBubbles[newIndex]]);
      setPanels([...operationHistory.panels[newIndex]]); // 🆕
      setOperationHistory(prev => ({ ...prev, currentIndex: newIndex }));
      console.log("⬅️ アンドゥ実行");
    }
  };

  const handleRedo = () => {
    if (operationHistory.currentIndex < operationHistory.characters.length - 1) {
      const newIndex = operationHistory.currentIndex + 1;
      setCharacters([...operationHistory.characters[newIndex]]);
      setSpeechBubbles([...operationHistory.speechBubbles[newIndex]]);
      setPanels([...operationHistory.panels[newIndex]]); // 🆕
      setOperationHistory(prev => ({ ...prev, currentIndex: newIndex }));
      console.log("➡️ リドゥ実行");
    }
  };

  // 履歴保存のタイミング（パネル変更も含める）
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (characters.length > 0 || speechBubbles.length > 0 || panels.length > 0) {
        saveToHistory(characters, speechBubbles, panels);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    characters.map(char => `${char.id}-${char.x}-${char.y}-${char.scale}`).join(','),
    speechBubbles.map(bubble => `${bubble.id}-${bubble.x}-${bubble.y}-${bubble.width}-${bubble.height}`).join(','),
    panels.map(panel => `${panel.id}-${panel.x}-${panel.y}-${panel.width}-${panel.height}`).join(','), // 🆕
    characters.length,
    speechBubbles.length,
    panels.length, // 🆕
  ]);

  // バックスペースキーで要素削除機能
  const handleDeleteSelected = () => {
    if (selectedCharacter) {
      const newCharacters = characters.filter(char => char.id !== selectedCharacter.id);
      setCharacters(newCharacters);
      setSelectedCharacter(null);
      console.log("🗑️ キャラクター削除:", selectedCharacter.name);
    }
  };

  // キーボードイベント処理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handleDeleteSelected();
      }
      
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        handleRedo();
      }
      
      // 🆕 コマ編集モード切り替え
      if (e.key === 'e' && e.ctrlKey) {
        e.preventDefault();
        setIsPanelEditMode(!isPanelEditMode);
        console.log(`🔧 コマ編集モード: ${!isPanelEditMode ? 'ON' : 'OFF'}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCharacter, operationHistory, isPanelEditMode]);

  // 履歴保存
  useEffect(() => {
    if (characters.length > 0 || speechBubbles.length > 0 || panels.length > 0) {
      saveToHistory(characters, speechBubbles, panels);
    }
  }, [characters.length, speechBubbles.length, panels.length]);

  // ダークモード切り替え
  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute("data-theme", newTheme);
    console.log(`🎨 テーマ切り替え: ${newTheme}モード`);
  };

  // 🆕 テンプレート変更処理（自動配置対応）
  const handleTemplateClick = (template: string) => {
    setSelectedTemplate(template);
    setSelectedCharacter(null);
    setSelectedPanel(null);
    
    // パネルをセット
    const newPanels = [...templates[template].panels];
    setPanels(newPanels);
    
    // 🆕 デフォルトシーンの自動適用
    const { characters: defaultCharacters, speechBubbles: defaultBubbles } = applyTemplateDefaults(template, newPanels);
    setCharacters(defaultCharacters);
    setSpeechBubbles(defaultBubbles);
    
    console.log(`✅ ${template}テンプレート適用完了 - キャラクター${defaultCharacters.length}個、吹き出し${defaultBubbles.length}個を自動配置`);
  };

  // シーンテンプレート適用
  const handleSceneClick = (sceneType: string) => {
    if (!panels || panels.length === 0) {
      console.log("⚠️ パネルが存在しません");
      return;
    }

    setSelectedScene(sceneType);
    
    const { characters: newCharacters, speechBubbles: newBubbles } = applySceneTemplate(
      sceneType,
      panels,
      characters,
      speechBubbles,
      selectedPanel
    );
    
    setCharacters(newCharacters);
    setSpeechBubbles(newBubbles);
    
    console.log(`🎭 シーンテンプレート「${sceneType}」適用完了`);
  };

  // キャラクター操作
  const handleCharacterClick = (charType: string) => {
    if (addCharacterFunc) {
      addCharacterFunc(charType);
    } else {
      console.log("⚠️ キャラクター追加機能が利用できません");
    }
  };

  // 吹き出し操作
  const handleBubbleClick = (bubbleType: string) => {
    if (addBubbleFunc) {
      const text = dialogueText || "ダブルクリックで編集";
      addBubbleFunc(bubbleType, text);
      setDialogueText("");
    } else {
      console.log("⚠️ 吹き出し追加機能が利用できません");
    }
  };

  // キャラクター詳細更新
  const handleCharacterUpdate = (updatedCharacter: Character) => {
    setCharacters(characters.map(char => 
      char.id === updatedCharacter.id ? updatedCharacter : char
    ));
    setSelectedCharacter(updatedCharacter);
  };

  // キャラクター削除機能
  const handleCharacterDelete = (characterToDelete: Character) => {
    const newCharacters = characters.filter(char => char.id !== characterToDelete.id);
    setCharacters(newCharacters);
    setSelectedCharacter(null);
    console.log("🗑️ キャラクター削除:", characterToDelete.name);
  };

  // キャラクター詳細パネルを閉じる
  const handleCharacterPanelClose = () => {
    setSelectedCharacter(null);
  };

  // 🆕 パネル操作ハンドラー
  const handlePanelUpdate = (updatedPanels: Panel[]) => {
    setPanels(updatedPanels);
    console.log("📐 パネル更新:", updatedPanels.length);
  };

  // 🆕 パネル分割機能
  const handlePanelSplit = (panelId: number, direction: "horizontal" | "vertical") => {
    const panelToSplit = panels.find(p => p.id === panelId);
    if (!panelToSplit) return;

    // 新しいIDを生成（最大ID + 1）
    const maxId = Math.max(...panels.map(p => p.id), 0);
    const newId = maxId + 1;

    let newPanels: Panel[];
    if (direction === "horizontal") {
      // 水平分割（上下）
      const topPanel: Panel = {
        ...panelToSplit,
        height: panelToSplit.height / 2,
      };
      const bottomPanel: Panel = {
        ...panelToSplit,
        id: newId,
        y: panelToSplit.y + panelToSplit.height / 2,
        height: panelToSplit.height / 2,
      };
      newPanels = panels.map(p => p.id === panelId ? topPanel : p).concat([bottomPanel]);
    } else {
      // 垂直分割（左右）
      const leftPanel: Panel = {
        ...panelToSplit,
        width: panelToSplit.width / 2,
      };
      const rightPanel: Panel = {
        ...panelToSplit,
        id: newId,
        x: panelToSplit.x + panelToSplit.width / 2,
        width: panelToSplit.width / 2,
      };
      newPanels = panels.map(p => p.id === panelId ? leftPanel : p).concat([rightPanel]);
    }

    setPanels(newPanels);
    console.log(`✂️ パネル${panelId}を${direction === "horizontal" ? "水平" : "垂直"}分割`);
  };

  // 🆕 全てクリア機能
  const handleClearAll = () => {
    if (window.confirm("全ての要素をクリアしますか？")) {
      setCharacters([]);
      setSpeechBubbles([]);
      setSelectedCharacter(null);
      setSelectedPanel(null);
      console.log("🧹 全要素クリア完了");
    }
  };

  // エクスポート機能
  const handleExport = (format: string) => {
    console.log(`📤 ${format}でエクスポート開始`);
    alert(`${format}でのエクスポート機能は実装予定です`);
  };

  const handleCharacterRightClick = (character: Character) => {
    setSelectedCharacter(character);
    setShowCharacterPanel(true);
  };

  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
      {/* ヘッダー */}
      <header className="header">
        <h1>📖 ネーム制作ツール</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* 🆕 コマ編集モードトグル */}
          <button 
            className={`control-btn ${isPanelEditMode ? 'active' : ''}`}
            onClick={() => setIsPanelEditMode(!isPanelEditMode)}
            title="コマ編集モード (Ctrl+E)"
            style={{
              background: isPanelEditMode ? "#ff8833" : "var(--bg-tertiary)",
              color: isPanelEditMode ? "white" : "var(--text-primary)",
              border: `1px solid ${isPanelEditMode ? "#ff8833" : "var(--border-color)"}`,
            }}
          >
            🔧 {isPanelEditMode ? "編集中" : "編集"}
          </button>
          
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            title={`${isDarkMode ? 'ライト' : 'ダーク'}モードに切り替え`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <div className="main-content">
        {/* 左サイドバー */}
        <div className="sidebar left-sidebar">
          {/* パネルテンプレート */}
          <div className="section">
            <h3>📐 パネルテンプレート</h3>
            <div className="template-grid">
              {Object.keys(templates).map((template) => (
                <div
                  key={template}
                  className={`template-card ${selectedTemplate === template ? 'selected' : ''}`}
                  onClick={() => handleTemplateClick(template)}
                >
                  <div className="template-preview">
                    {templates[template].panels.length}コマ
                  </div>
                  <span>{template}</span>
                </div>
              ))}
            </div>
            <div className="section-info">
              ✨ キャラクターと吹き出しも自動配置されます
            </div>
          </div>

          {/* 🆕 コマ操作パネル */}
          {isPanelEditMode && (
            <div className="section" style={{ 
              border: "2px solid #ff8833",
              background: "var(--bg-tertiary)",
            }}>
              <h3>🔧 コマ操作</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <button 
                  className="btn btn-secondary"
                  onClick={handleClearAll}
                  title="全要素をクリア"
                >
                  🧹 全クリア
                </button>
                <div style={{ 
                  fontSize: "11px", 
                  color: "var(--text-muted)",
                  padding: "8px",
                  background: "var(--bg-primary)",
                  borderRadius: "4px",
                  lineHeight: "1.4",
                }}>
                  <strong>操作方法:</strong><br/>
                  • コマを選択してハンドルで操作<br/>
                  • 🔵 移動 / 🟧 リサイズ / 🟣 分割<br/>
                  • Ctrl+E でモード切替
                </div>
              </div>
            </div>
          )}

          {/* シーンテンプレート */}
          <div className="section">
            <h3>🎭 シーンテンプレート</h3>
            <div className="scene-grid">
              {[
                { key: 'daily', icon: '🌅', name: '日常' },
                { key: 'dialogue', icon: '💬', name: '会話' },
                { key: 'action', icon: '⚡', name: 'アクション' },
                { key: 'emotional', icon: '😢', name: '感情' },
                { key: 'comedy', icon: '😄', name: 'コメディ' },
                { key: 'romance', icon: '💕', name: '恋愛' },
                { key: 'tension', icon: '😰', name: '緊張' },
                { key: 'surprise', icon: '😲', name: '驚き' },
              ].map((scene) => (
                <div
                  key={scene.key}
                  className={`scene-card ${selectedScene === scene.key ? 'selected' : ''}`}
                  onClick={() => handleSceneClick(scene.key)}
                  title={`${scene.name}シーン - 斜め方向対応`}
                >
                  <div className="scene-icon">
                    {scene.icon}
                  </div>
                  <span>{scene.name}</span>
                </div>
              ))}
            </div>
            <div className="scene-info">
              💡 キャラクターと吹き出しが自動配置されます<br/>
              🆕 恋愛・緊張・驚きは斜め方向対応
            </div>
          </div>
        </div>

        {/* メインエリア */}
        <div className="canvas-area">
          {/* キャンバス上部コントロール */}
          <div className="canvas-controls">
            <div className="undo-redo-buttons">
              <button 
                className="control-btn"
                onClick={handleUndo}
                disabled={operationHistory.currentIndex <= 0}
                title="元に戻す (Ctrl+Z)"
              >
                ↶ 戻す
              </button>
              <button 
                className="control-btn"
                onClick={handleRedo}
                disabled={operationHistory.currentIndex >= operationHistory.characters.length - 1}
                title="やり直し (Ctrl+Y)"
              >
                ↷ 進む
              </button>
              <button 
                className="control-btn delete-btn"
                onClick={handleDeleteSelected}
                disabled={!selectedCharacter}
                title="選択要素を削除 (Backspace)"
              >
                🗑️ 削除
              </button>
            </div>
            <div className="canvas-info">
              操作履歴: {operationHistory.currentIndex + 1} / {operationHistory.characters.length}
              {selectedCharacter && <span> | 選択中: {selectedCharacter.name}</span>}
              {selectedPanel && <span> | パネル{selectedPanel.id}選択中</span>}
              {isPanelEditMode && <span> | 🔧 コマ編集モード</span>}
            </div>
          </div>

          {/* キャンバス */}
          <CanvasComponent
            selectedTemplate={selectedTemplate}
            panels={panels}
            setPanels={handlePanelUpdate} // 🆕 パネル更新対応
            characters={characters}
            setCharacters={setCharacters}
            speechBubbles={speechBubbles}
            setSpeechBubbles={setSpeechBubbles}
            onCharacterAdd={(func) => setAddCharacterFunc(() => func)}
            onBubbleAdd={(func) => setAddBubbleFunc(() => func)}
            onPanelSelect={(panel) => setSelectedPanel(panel)}
            onCharacterSelect={(character) => setSelectedCharacter(character)}
            onCharacterRightClick={handleCharacterRightClick}
            isPanelEditMode={isPanelEditMode} // 🆕 編集モード渡し
            onPanelSplit={handlePanelSplit} // 🆕 分割ハンドラー渡し
          />
        </div>

        {/* 右サイドバー */}
        <div className="sidebar right-sidebar">
          {/* キャラクター */}
          <div className="section">
            <h3>👥 キャラクター</h3>
            <div className="character-grid">
              {[
                { type: 'hero', icon: '🦸‍♂️', name: '主人公' },
                { type: 'heroine', icon: '🦸‍♀️', name: 'ヒロイン' },
                { type: 'rival', icon: '😤', name: 'ライバル' },
                { type: 'friend', icon: '😊', name: '友人' }
              ].map((char) => (
                <div
                  key={char.type}
                  className="char-btn"
                  onClick={() => handleCharacterClick(char.type)}
                >
                  <div className="char-icon">{char.icon}</div>
                  <span>{char.name}</span>
                </div>
              ))}
            </div>
            <div className="section-info">
              🎯 パネル未選択でも追加可能
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
                { id: 'normal', icon: '💬', name: '普通' },
                { id: 'shout', icon: '❗', name: '叫び' },
                { id: 'whisper', icon: '💭', name: '小声' },
                { id: 'thought', icon: '☁️', name: '心の声' }
              ].map(bubble => (
                <div 
                  key={bubble.id}
                  className="bubble-btn"
                  onClick={() => handleBubbleClick(bubble.name)}
                >
                  {bubble.icon} {bubble.name}
                </div>
              ))}
            </div>
            <div className="section-info">
              🎯 パネル未選択でも追加可能
            </div>
          </div>

          {/* 出力 */}
          <div className="section">
            <h3>📤 出力</h3>
            <div className="export-buttons">
              <button 
                className="btn btn-primary"
                onClick={() => handleExport('クリスタ用データ')}
              >
                🎨 クリスタ用データ
              </button>
              <button 
                className="btn btn-success"
                onClick={() => handleExport('PDF')}
              >
                📄 PDF (ネーム用)
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => handleExport('PNG画像')}
              >
                🖼️ PNG画像
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* キャラクター詳細パネル */}
      {showCharacterPanel && selectedCharacter && (
        <CharacterDetailPanel
          selectedCharacter={selectedCharacter}
          onCharacterUpdate={handleCharacterUpdate}
          onCharacterDelete={handleCharacterDelete}
          onClose={handleCharacterPanelClose}
        />
      )}
    </div>
  );
}

export default App;