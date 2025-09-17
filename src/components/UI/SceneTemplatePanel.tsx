// src/components/UI/SceneTemplatePanel.tsx - 統合シーンテンプレート
import React, { useState, useCallback } from 'react';
import { Panel, Character, SpeechBubble, BackgroundElement, EffectElement, ToneElement } from '../../types';
import { getAllSceneTemplates, getTemplatesByCategory, applyEnhancedSceneTemplate, EnhancedSceneTemplate } from '../CanvasArea/sceneTemplates';

interface SceneTemplatePanelProps {
  panels: Panel[];
  selectedPanel: Panel | null;
  characters: Character[];
  setCharacters: (characters: Character[]) => void;
  speechBubbles: SpeechBubble[];
  setSpeechBubbles: (bubbles: SpeechBubble[]) => void;
  backgrounds: BackgroundElement[];
  setBackgrounds: (backgrounds: BackgroundElement[]) => void;
  effects: EffectElement[];
  setEffects: (effects: EffectElement[]) => void;
  tones: ToneElement[];
  setTones: (tones: ToneElement[]) => void;
  isDarkMode?: boolean;
}

export const SceneTemplatePanel: React.FC<SceneTemplatePanelProps> = ({
  panels,
  selectedPanel,
  characters,
  setCharacters,
  speechBubbles,
  setSpeechBubbles,
  backgrounds,
  setBackgrounds,
  effects,
  setEffects,
  tones,
  setTones,
  isDarkMode = true,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'emotion' | 'action' | 'daily'>('emotion');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // カテゴリ別テンプレート取得
  const currentTemplates = getTemplatesByCategory(selectedCategory);

  // 統合シーンテンプレート適用
  const handleApplyTemplate = useCallback((templateKey: string) => {
    if (!panels || panels.length === 0) {
      alert('❌ パネルテンプレートを先に選択してください');
      return;
    }

    const template = getAllSceneTemplates()[templateKey];
    if (!template) {
      alert('❌ テンプレートが見つかりません');
      return;
    }

    // 統合テンプレート適用
    const result = applyEnhancedSceneTemplate(
      templateKey,
      panels,
      characters,
      speechBubbles,
      backgrounds,
      effects,
      tones,
      selectedPanel
    );

    // 状態更新
    setCharacters(result.characters);
    setSpeechBubbles(result.speechBubbles);
    setBackgrounds(result.backgrounds);
    setEffects(result.effects);
    setTones(result.tones);

    setSelectedTemplate(templateKey);
    
    // 成功メッセージ
    const targetPanel = selectedPanel || panels[0];
    console.log(`🎭 「${template.name}」をパネル${targetPanel.id}に適用しました`);
    
    // トースト通知（実装されている場合）
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast(`🎭 「${template.name}」を適用しました`, 'success');
    }
  }, [panels, selectedPanel, characters, speechBubbles, backgrounds, effects, tones, setCharacters, setSpeechBubbles, setBackgrounds, setEffects, setTones]);

  // プレビュー表示
  const handlePreview = useCallback((templateKey: string) => {
    setSelectedTemplate(templateKey);
    setShowPreview(true);
  }, []);

  // カテゴリ情報
  const categoryInfo = {
    emotion: {
      icon: '🎭',
      name: '感情表現',
      description: '驚き、悲しみ、怒り、喜びなどの感情シーン',
      color: '#e91e63'
    },
    action: {
      icon: '🚀',
      name: 'アクション',
      description: '走る、戦闘、衝撃などの動的なシーン',
      color: '#ff5722'
    },
    daily: {
      icon: '🏠',
      name: '日常生活',
      description: '学校、食事などの日常的なシーン',
      color: '#4caf50'
    }
  };

  const currentCategory = categoryInfo[selectedCategory];

  return (
    <div className="scene-template-panel">
      <div className="section-header">
        <h3>🎭 統合シーンテンプレート</h3>
        <div className="template-info" style={{
          fontSize: '12px',
          color: isDarkMode ? '#aaa' : '#666',
          marginTop: '4px',
          lineHeight: '1.4'
        }}>
          キャラ + 背景 + 効果線 + トーンを一括配置
        </div>
      </div>

      {/* カテゴリ選択タブ */}
      <div className="category-tabs" style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '12px',
        background: isDarkMode ? '#2a2a2a' : '#f5f5f5',
        borderRadius: '8px',
        padding: '4px'
      }}>
        {Object.entries(categoryInfo).map(([key, info]) => (
          <button
            key={key}
            className={`category-tab ${selectedCategory === key ? 'active' : ''}`}
            onClick={() => setSelectedCategory(key as 'emotion' | 'action' | 'daily')}
            style={{
              flex: 1,
              padding: '8px 4px',
              border: 'none',
              borderRadius: '6px',
              background: selectedCategory === key ? info.color : 'transparent',
              color: selectedCategory === key ? 'white' : (isDarkMode ? '#ccc' : '#666'),
              fontSize: '12px',
              fontWeight: selectedCategory === key ? 'bold' : 'normal',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            <span style={{ fontSize: '14px' }}>{info.icon}</span>
            <span>{info.name}</span>
          </button>
        ))}
      </div>

      {/* カテゴリ説明 */}
      <div style={{
        background: isDarkMode ? '#333' : '#f9f9f9',
        border: `1px solid ${currentCategory.color}`,
        borderRadius: '6px',
        padding: '8px',
        marginBottom: '12px',
        fontSize: '11px',
        color: isDarkMode ? '#ccc' : '#555'
      }}>
        <strong style={{ color: currentCategory.color }}>
          {currentCategory.icon} {currentCategory.name}
        </strong>
        <br />
        {currentCategory.description}
      </div>

      {/* テンプレート一覧 */}
      <div className="template-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
        marginBottom: '12px'
      }}>
        {Object.entries(currentTemplates).map(([key, template]) => (
          <div
            key={key}
            className={`template-card ${selectedTemplate === key ? 'selected' : ''}`}
            style={{
              border: `2px solid ${selectedTemplate === key ? currentCategory.color : (isDarkMode ? '#444' : '#ddd')}`,
              borderRadius: '8px',
              padding: '8px',
              background: selectedTemplate === key 
                ? `${currentCategory.color}15` 
                : (isDarkMode ? '#2a2a2a' : '#fafafa'),
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            onClick={() => handleApplyTemplate(key)}
            onMouseEnter={() => handlePreview(key)}
            onMouseLeave={() => setShowPreview(false)}
          >
            {/* テンプレート名 */}
            <div style={{
              fontSize: '13px',
              fontWeight: 'bold',
              color: isDarkMode ? '#fff' : '#333',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {template.name}
            </div>

            {/* テンプレート説明 */}
            <div style={{
              fontSize: '10px',
              color: isDarkMode ? '#aaa' : '#666',
              lineHeight: '1.3',
              marginBottom: '6px'
            }}>
              {template.description}
            </div>

            {/* 要素数表示 */}
            <div style={{
              display: 'flex',
              gap: '6px',
              fontSize: '9px',
              color: isDarkMode ? '#888' : '#777'
            }}>
              <span>👥{template.characters.length}</span>
              <span>💬{template.speechBubbles.length}</span>
              {template.backgrounds && template.backgrounds.length > 0 && <span>🎨{template.backgrounds.length}</span>}
              {template.effects && template.effects.length > 0 && <span>⚡{template.effects.length}</span>}
              {template.tones && template.tones.length > 0 && <span>🎯{template.tones.length}</span>}
            </div>

            {/* 選択インジケーター */}
            {selectedTemplate === key && (
              <div style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: currentCategory.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '8px',
                color: 'white'
              }}>
                ✓
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 適用状況表示 */}
      <div style={{
        background: isDarkMode ? '#333' : '#f0f0f0',
        border: `1px solid ${isDarkMode ? '#555' : '#ddd'}`,
        borderRadius: '6px',
        padding: '8px',
        fontSize: '11px',
        color: isDarkMode ? '#ccc' : '#666'
      }}>
        <div style={{ marginBottom: '4px' }}>
          <strong>📍 適用先: </strong>
          {selectedPanel ? `パネル${selectedPanel.id}` : '最初のパネル'}
        </div>
        <div style={{ marginBottom: '4px' }}>
          <strong>📊 現在の要素数: </strong>
          👥{characters.length} 💬{speechBubbles.length} 🎨{backgrounds.length} ⚡{effects.length} 🎯{tones.length}
        </div>
        {panels.length === 0 && (
          <div style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
            ⚠️ パネルテンプレートを先に選択してください
          </div>
        )}
      </div>

      {/* プレビューモーダル */}
      {showPreview && selectedTemplate && getAllSceneTemplates()[selectedTemplate] && (
        <div 
          className="preview-modal"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: isDarkMode ? '#2a2a2a' : '#ffffff',
            border: `2px solid ${currentCategory.color}`,
            borderRadius: '12px',
            padding: '16px',
            maxWidth: '300px',
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}
          onMouseLeave={() => setShowPreview(false)}
        >
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: currentCategory.color,
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {getAllSceneTemplates()[selectedTemplate].name}
            <span style={{ fontSize: '10px', color: isDarkMode ? '#888' : '#666' }}>プレビュー</span>
          </div>
          
          <div style={{
            fontSize: '12px',
            color: isDarkMode ? '#ccc' : '#666',
            marginBottom: '12px',
            lineHeight: '1.4'
          }}>
            {getAllSceneTemplates()[selectedTemplate].description}
          </div>

          <div style={{
            background: isDarkMode ? '#333' : '#f5f5f5',
            borderRadius: '6px',
            padding: '8px',
            fontSize: '10px',
            color: isDarkMode ? '#aaa' : '#777'
          }}>
            <div><strong>含まれる要素:</strong></div>
            <div>👥 キャラクター: {getAllSceneTemplates()[selectedTemplate].characters.length}体</div>
            <div>💬 吹き出し: {getAllSceneTemplates()[selectedTemplate].speechBubbles.length}個</div>
            {getAllSceneTemplates()[selectedTemplate].backgrounds && (
              <div>🎨 背景: {getAllSceneTemplates()[selectedTemplate].backgrounds!.length}個</div>
            )}
            {getAllSceneTemplates()[selectedTemplate].effects && (
              <div>⚡ 効果線: {getAllSceneTemplates()[selectedTemplate].effects!.length}個</div>
            )}
            {getAllSceneTemplates()[selectedTemplate].tones && (
              <div>🎯 トーン: {getAllSceneTemplates()[selectedTemplate].tones!.length}個</div>
            )}
          </div>

          <button
            onClick={() => handleApplyTemplate(selectedTemplate)}
            style={{
              width: '100%',
              marginTop: '12px',
              padding: '8px',
              background: currentCategory.color,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🎭 このシーンを適用
          </button>
        </div>
      )}

      {/* 背景オーバーレイ */}
      {showPreview && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 999
          }}
          onClick={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};