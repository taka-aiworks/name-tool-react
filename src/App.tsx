import React, { useState } from 'react';
import './legacy.css';

// 型定義
interface Panel {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Character {
  id: string;
  panelId: number;
  type: string;
  name: string;
  x: number;
  y: number;
  scale: number;
}

interface SpeechBubble {
  id: string;
  panelId: number;
  type: string;
  text: string;
  x: number;
  y: number;
  scale: number;
}

function App() {
  // 状態管理
  const [selectedTemplate, setSelectedTemplate] = useState('4koma');
  const [dialogueText, setDialogueText] = useState('');
  const [plotText, setPlotText] = useState('');
  const [panels, setPanels] = useState<Panel[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [speechBubbles, setSpeechBubbles] = useState<SpeechBubble[]>([]);

  // イベントハンドラー
  const handleTemplateClick = (template: string) => {
    setSelectedTemplate(template);
    console.log(`テンプレート選択: ${template}`);
    
    // 簡単な通知表示
    alert(`${template}テンプレートを選択しました！`);
  };

  const handleCharacterClick = (charType: string) => {
    console.log(`キャラクター追加: ${charType}`);
    alert(`${charType}を追加しました！`);
  };

  const handleBubbleClick = (bubbleType: string) => {
    if (!dialogueText.trim()) {
      alert('セリフを入力してください');
      return;
    }
    console.log(`吹き出し追加: ${bubbleType}, テキスト: ${dialogueText}`);
    alert(`${bubbleType}の吹き出しを追加しました！\nテキスト: ${dialogueText}`);
    setDialogueText(''); // 入力欄をクリア
  };

  const handleExport = (type: string) => {
    console.log(`エクスポート: ${type}`);
    alert(`${type}でエクスポートしました！`);
  };

  return (
    <div className="App">
      {/* ヘッダー */}
      <div className="header">
        <h1>📚 ネーム制作支援ツール</h1>
        <p>コマ割り・キャラ配置・セリフを統合した漫画ネーム作成ツール</p>
      </div>

      {/* メインコンテンツ */}
      <div className="container">
        {/* 左パネル：ストーリー構成 */}
        <div className="story-panel">
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
        </div>
        
        {/* メインキャンバス */}
        <div className="main-canvas">
          <div className="canvas-info">
            <strong>📐 ネームキャンバス:</strong> React版 | 
            <strong>🎯 選択中:</strong> <span>{selectedTemplate}テンプレート</span>
          </div>
          
          <div className="canvas-container">
            <div style={{
              padding: '50px',
              textAlign: 'center',
              background: '#f9f9f9',
              border: '2px dashed #ccc',
              margin: '20px',
              borderRadius: '8px'
            }}>
              <h2>🎨 Canvas機能</h2>
              <p>選択中: <strong>{selectedTemplate}</strong>テンプレート</p>
              <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                <p>✅ React移行完了</p>
                <p>✅ UI コンポーネント実装完了</p>
                <p>✅ 基本的なイベント処理実装完了</p>
                <p>🔄 Canvas描画機能移行予定</p>
              </div>
              {plotText && (
                <div style={{ 
                  marginTop: '20px', 
                  padding: '15px', 
                  background: '#e8f4f8', 
                  borderRadius: '8px',
                  fontSize: '12px'
                }}>
                  <strong>📝 現在のプロット:</strong>
                  <p style={{ marginTop: '5px' }}>{plotText}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* 右パネル：制作ツール */}
        <div className="tools-panel">
          {/* シーンテンプレート */}
          <div className="section">
            <h3>🎬 シーンテンプレート</h3>
            <div className="template-grid">
              {[
                { id: '4koma', title: '4コマ', desc: '基本構成' },
                { id: 'dialogue', title: '会話', desc: '2人の対話' },
                { id: 'action', title: 'アクション', desc: '動きのシーン' },
                { id: 'emotional', title: '感情', desc: '表情重視' }
              ].map(template => (
                <div 
                  key={template.id}
                  className={`template-card ${selectedTemplate === template.id ? 'active' : ''}`}
                  onClick={() => handleTemplateClick(template.id)}
                >
                  <div className="template-title">{template.title}</div>
                  <div className="template-desc">{template.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* キャラ配置 */}
          <div className="section">
            <h3>👥 キャラ配置</h3>
            <div className="character-list">
              {[
                { id: 'hero', icon: '主', name: '主人公' },
                { id: 'heroine', icon: 'ヒ', name: 'ヒロイン' },
                { id: 'rival', icon: '敵', name: 'ライバル' },
                { id: 'friend', icon: '友', name: '友人' }
              ].map(char => (
                <div 
                  key={char.id}
                  className="char-item"
                  onClick={() => handleCharacterClick(char.name)}
                >
                  <div className="char-icon">{char.icon}</div>
                  <span>{char.name}</span>
                </div>
              ))}
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
    </div>
  );
}

export default App;