// src/App.tsx (完全最新版 - エラー修正済み)
import React, { useState, useEffect } from "react";
import CanvasComponent from "./components/CanvasComponent";
import CharacterDetailPanel from "./components/UI/CharacterDetailPanel";
import { Panel, Character, SpeechBubble } from "./types";
import { templates } from "./components/CanvasArea/templates";
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

  // 機能コールバック用の状態
  const [addCharacterFunc, setAddCharacterFunc] = useState<((type: string) => void) | null>(null);
  const [addBubbleFunc, setAddBubbleFunc] = useState<((type: string, text: string) => void) | null>(null);

  // アンドゥ/リドゥ機能
  const [operationHistory, setOperationHistory] = useState<{
    characters: Character[][];
    speechBubbles: SpeechBubble[][];
    currentIndex: number;
  }>({
    characters: [[]],
    speechBubbles: [[]],
    currentIndex: 0,
  });

  // アンドゥ/リドゥ機能の実装（改良版）
  const saveToHistory = (newCharacters: Character[], newBubbles: SpeechBubble[]) => {
    setOperationHistory(prev => {
      const newHistory = {
        characters: [...prev.characters.slice(0, prev.currentIndex + 1), [...newCharacters]], // 深いコピー
        speechBubbles: [...prev.speechBubbles.slice(0, prev.currentIndex + 1), [...newBubbles]], // 深いコピー
        currentIndex: prev.currentIndex + 1,
      };
      
      // 履歴上限管理
      if (newHistory.characters.length > 50) {
        newHistory.characters = newHistory.characters.slice(1);
        newHistory.speechBubbles = newHistory.speechBubbles.slice(1);
        newHistory.currentIndex = Math.max(0, newHistory.currentIndex - 1);
      }
      
      return newHistory;
    });
  };

  const handleUndo = () => {
    if (operationHistory.currentIndex > 0) {
      const newIndex = operationHistory.currentIndex - 1;
      setCharacters([...operationHistory.characters[newIndex]]); // 深いコピー
      setSpeechBubbles([...operationHistory.speechBubbles[newIndex]]); // 深いコピー
      setOperationHistory(prev => ({ ...prev, currentIndex: newIndex }));
      console.log("⬅️ アンドゥ実行");
    }
  };

  const handleRedo = () => {
    if (operationHistory.currentIndex < operationHistory.characters.length - 1) {
      const newIndex = operationHistory.currentIndex + 1;
      setCharacters([...operationHistory.characters[newIndex]]); // 深いコピー
      setSpeechBubbles([...operationHistory.speechBubbles[newIndex]]); // 深いコピー
      setOperationHistory(prev => ({ ...prev, currentIndex: newIndex }));
      console.log("➡️ リドゥ実行");
    }
  };

  // 履歴保存のタイミングを改良（移動・リサイズも含める）
  useEffect(() => {
    // デバウンス処理で頻繁な保存を防ぐ
    const timeoutId = setTimeout(() => {
      if (characters.length > 0 || speechBubbles.length > 0) {
        saveToHistory(characters, speechBubbles);
      }
    }, 300); // 300ms後に保存

    return () => clearTimeout(timeoutId);
  }, [
    characters.map(char => `${char.id}-${char.x}-${char.y}-${char.scale}`).join(','), // 位置・スケール変更を検知
    speechBubbles.map(bubble => `${bubble.id}-${bubble.x}-${bubble.y}-${bubble.width}-${bubble.height}`).join(','), // 位置・サイズ変更を検知
    characters.length, // 追加・削除
    speechBubbles.length // 追加・削除
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCharacter, operationHistory]);

  // 履歴保存
  useEffect(() => {
    if (characters.length > 0 || speechBubbles.length > 0) {
      saveToHistory(characters, speechBubbles);
    }
  }, [characters.length, speechBubbles.length]);

  // ダークモード切り替え
  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute("data-theme", newTheme);
    console.log(`🎨 テーマ切り替え: ${newTheme}モード`);
  };

  // テンプレート変更処理
  const handleTemplateClick = (template: string) => {
    setSelectedTemplate(template);
    setCharacters([]);
    setSpeechBubbles([]);
    setSelectedCharacter(null);
    setSelectedPanel(null);
    console.log(`✅ ${template}テンプレート適用完了`);
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
      selectedPanel // 選択パネル情報を渡す
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

  // キャラクター削除機能（新機能）
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

  // エクスポート機能
  const handleExport = (format: string) => {
    console.log(`📤 ${format}でエクスポート開始`);
    alert(`${format}でのエクスポート機能は実装予定です`);
  };


// 関数を追加
const handleCharacterRightClick = (character: Character) => {
  setSelectedCharacter(character);
  setShowCharacterPanel(true);
};



  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
      {/* ヘッダー */}
      <header className="header">
        <h1>📖 ネーム制作ツール</h1>
        <button 
          className="theme-toggle"
          onClick={toggleTheme}
          title={`${isDarkMode ? 'ライト' : 'ダーク'}モードに切り替え`}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
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
          </div>

          {/* シーンテンプレート */}
          <div className="section">
            <h3>🎭 シーンテンプレート</h3>
            <div className="scene-grid">
              {Object.keys(sceneTemplates).map((sceneType) => (
                <div
                  key={sceneType}
                  className={`scene-card ${selectedScene === sceneType ? 'selected' : ''}`}
                  onClick={() => handleSceneClick(sceneType)}
                >
                  <div className="scene-icon">
                    {sceneType === 'daily' && '🌅'}
                    {sceneType === 'dialogue' && '💬'}
                    {sceneType === 'action' && '⚡'}
                    {sceneType === 'emotional' && '😢'}
                    {sceneType === 'comedy' && '😄'}
                  </div>
                  <span>
                    {sceneType === 'daily' && '日常'}
                    {sceneType === 'dialogue' && '会話'}
                    {sceneType === 'action' && 'アクション'}
                    {sceneType === 'emotional' && '感情'}
                    {sceneType === 'comedy' && 'コメディ'}
                  </span>
                </div>
              ))}
            </div>
            <div className="scene-info">
              💡 キャラクターと吹き出しが自動配置されます
            </div>
          </div>
        </div>

        {/* メインエリア */}
        <div className="canvas-area">
          {/* キャンバス上部コントロール - ここに移動 */}
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
            </div>
          </div>

          {/* キャンバス */}
          <CanvasComponent
            selectedTemplate={selectedTemplate}
            panels={panels}
            setPanels={setPanels}
            characters={characters}
            setCharacters={setCharacters}
            speechBubbles={speechBubbles}
            setSpeechBubbles={setSpeechBubbles}
            onCharacterAdd={(func) => setAddCharacterFunc(() => func)}
            onBubbleAdd={(func) => setAddBubbleFunc(() => func)}
            onPanelSelect={(panel) => setSelectedPanel(panel)}
            onCharacterSelect={(character) => setSelectedCharacter(character)}
            onCharacterRightClick={handleCharacterRightClick}
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
      // 最下部のCharacterDetailPanelを条件変更
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