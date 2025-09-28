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
  onCreateCharacter?: () => void;
  selectedCharacter: Character | null;
  setSelectedCharacter: (character: Character | null) => void;
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
  onCreateCharacter,
  selectedCharacter,
  setSelectedCharacter,
}) => {
  // 修正後
  const [selectedCategory, setSelectedCategory] = useState<'emotion' | 'action' | 'basic'>('emotion');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  // プレビュー機能を一時的に無効化
  // const [showPreview, setShowPreview] = useState<boolean>(false);

  // カテゴリ別テンプレート取得
  const currentTemplates = getTemplatesByCategory(selectedCategory);
  
  // デバッグ: キャラクター情報を確認
  console.log('🔍 SceneTemplatePanel - キャラクター情報:', {
    charactersCount: characters.length,
    characters: characters.map(char => ({ id: char.id, name: char.name, characterId: char.characterId }))
  });

  // キャラクター情報を直接受け取るテンプレート適用関数
  const handleApplyTemplateWithCharacter = useCallback((templateKey: string, character: any) => {
    console.log('🔍 handleApplyTemplateWithCharacter called:', {
      templateKey,
      character: character ? character.name : 'null',
      selectedPanel: selectedPanel ? selectedPanel.id : 'null'
    });

    if (!panels || panels.length === 0) {
      alert('❌ パネルテンプレートを先に選択してください');
      return;
    }

    if (!character) {
      console.log('❌ character is null:', character);
      alert('❌ キャラクターを先に選択してください');
      return;
    }

    const template = getAllSceneTemplates()[templateKey];
    if (!template) {
      alert('❌ テンプレートが見つかりません');
      return;
    }

    // 🔧 選択されたパネルを強制的に確認・取得
    let targetPanel = selectedPanel;
    
    // selectedPanelがnullの場合の対策
    if (!targetPanel) {
      // 最後にクリックされたパネルを探す（パネルの選択状態を確認）
      const lastSelectedPanel = panels.find(panel => {
        // パネルが何らかの形で選択状態を保持している場合
        return (panel as any).isSelected || (panel as any).selected;
      });
      
      if (lastSelectedPanel) {
        targetPanel = lastSelectedPanel;
        console.log(`🔧 選択状態から対象パネルを復元: パネル${targetPanel.id}`);
      } else {
        // それでもない場合は確認ダイアログ
        const panelId = prompt(
          `どのパネルに配置しますか？\n利用可能なパネル: ${panels.map(p => p.id).join(', ')}`,
          panels[0].id.toString()
        );
        
        if (panelId) {
          const specifiedPanel = panels.find(p => p.id.toString() === panelId);
          if (specifiedPanel) {
            targetPanel = specifiedPanel;
            console.log(`🔧 ユーザー指定でパネル${targetPanel.id}に配置`);
          }
        }
        
        // それでもない場合は最初のパネル
        if (!targetPanel) {
          targetPanel = panels[0];
          console.log(`⚠️ 最初のパネル${targetPanel.id}にフォールバック`);
        }
      }
    }

    console.log(`🎭 テンプレート適用: ${template.name} → パネル${targetPanel.id}`);
    console.log(`📊 選択状態: selectedPanel=${selectedPanel?.id || 'null'}, targetPanel=${targetPanel.id}`);
    console.log(`👤 選択されたキャラクター: ${character.name} (ID: ${character.id})`);

    // 🔧 既存のパネル内要素をクリア（統合テンプレート適用前に）
    if (!targetPanel) {
      console.error('❌ targetPanel is null');
      return;
    }
    
    // TypeScriptの型ガード: targetPanelが確実にnullでないことを保証
    const panelId = targetPanel.id;
    
    const filteredCharacters = characters.filter(char => char.panelId !== panelId);
    const filteredBubbles = speechBubbles.filter(bubble => bubble.panelId !== panelId);
    const filteredBackgrounds = backgrounds.filter(bg => bg.panelId !== panelId);
    const filteredEffects = effects.filter(effect => effect.panelId !== panelId);
    const filteredTones = tones.filter(tone => tone.panelId !== panelId);
    
    console.log(`🧹 パネル${panelId}の既存要素をクリア:`, {
      characters: characters.length - filteredCharacters.length,
      bubbles: speechBubbles.length - filteredBubbles.length,
      backgrounds: backgrounds.length - filteredBackgrounds.length,
      effects: effects.length - filteredEffects.length,
      tones: tones.length - filteredTones.length
    });


    // 統合テンプレート適用（選択されたキャラクター情報を渡す）
    const result = applyEnhancedSceneTemplate(
      templateKey,
      panels,
      filteredCharacters,  // 🔧 クリア済みのキャラクター配列を使用
      filteredBubbles,    // 🔧 クリア済みの吹き出し配列を使用
      filteredBackgrounds, // 🔧 クリア済みの背景配列を使用
      filteredEffects,    // 🔧 クリア済みの効果配列を使用
      filteredTones,      // 🔧 クリア済みのトーン配列を使用
      targetPanel,  // 🔧 確実に取得したパネルを使用
      character  // 🔧 選択されたキャラクター情報を渡す
    );


    // 状態更新
    setCharacters(result.characters);
    setSpeechBubbles(result.speechBubbles);
    setBackgrounds(result.backgrounds);
    setEffects(result.effects);
    setTones(result.tones);

    setSelectedTemplate(templateKey);
    
    // 成功メッセージ
    console.log(`🎭 「${template.name}」をパネル${targetPanel.id}に適用しました`);
    
    // トースト通知（実装されている場合）
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast(`🎭 「${template.name}」をパネル${targetPanel.id}に適用`, 'success');
    }
    
    // 適用後に対象パネルを選択状態にする
    // この部分は親コンポーネントのonPanelSelectがあれば使用
  }, [panels, characters, speechBubbles, backgrounds, effects, tones, selectedPanel, setCharacters, setSpeechBubbles, setBackgrounds, setEffects, setTones, setSelectedTemplate]);

  // 統合シーンテンプレート適用
  // handleApplyTemplate関数の修正版
  const handleApplyTemplate = useCallback((templateKey: string) => {
    console.log('🔍 handleApplyTemplate called:', {
      templateKey,
      selectedCharacter: selectedCharacter ? selectedCharacter.name : 'null',
      selectedPanel: selectedPanel ? selectedPanel.id : 'null'
    });

    if (!panels || panels.length === 0) {
      alert('❌ パネルテンプレートを先に選択してください');
      return;
    }

    if (!selectedCharacter) {
      console.log('❌ selectedCharacter is null:', selectedCharacter);
      alert('❌ キャラクターを先に選択してください');
      return;
    }

    const template = getAllSceneTemplates()[templateKey];
    if (!template) {
      alert('❌ テンプレートが見つかりません');
      return;
    }

    // 🔧 選択されたパネルを強制的に確認・取得
    let targetPanel = selectedPanel;
    
    // selectedPanelがnullの場合の対策
    if (!targetPanel) {
      // 最後にクリックされたパネルを探す（パネルの選択状態を確認）
      const lastSelectedPanel = panels.find(panel => {
        // パネルが何らかの形で選択状態を保持している場合
        return (panel as any).isSelected || (panel as any).selected;
      });
      
      if (lastSelectedPanel) {
        targetPanel = lastSelectedPanel;
        console.log(`🔧 選択状態から対象パネルを復元: パネル${targetPanel.id}`);
      } else {
        // それでもない場合は確認ダイアログ
        const panelId = prompt(
          `どのパネルに配置しますか？\n利用可能なパネル: ${panels.map(p => p.id).join(', ')}`,
          panels[0].id.toString()
        );
        
        if (panelId) {
          const specifiedPanel = panels.find(p => p.id.toString() === panelId);
          if (specifiedPanel) {
            targetPanel = specifiedPanel;
            console.log(`🔧 ユーザー指定でパネル${targetPanel.id}に配置`);
          }
        }
        
        // それでもない場合は最初のパネル
        if (!targetPanel) {
          targetPanel = panels[0];
          console.log(`⚠️ 最初のパネル${targetPanel.id}にフォールバック`);
        }
      }
    }

    console.log(`🎭 テンプレート適用: ${template.name} → パネル${targetPanel.id}`);
    console.log(`📊 選択状態: selectedPanel=${selectedPanel?.id || 'null'}, targetPanel=${targetPanel.id}`);
    console.log(`👤 選択されたキャラクター: ${selectedCharacter.name} (ID: ${selectedCharacter.id})`);

    // 統合テンプレート適用（選択されたキャラクター情報を渡す）
    const result = applyEnhancedSceneTemplate(
      templateKey,
      panels,
      characters,
      speechBubbles,
      backgrounds,
      effects,
      tones,
      targetPanel,  // 🔧 確実に取得したパネルを使用
      selectedCharacter  // 🔧 選択されたキャラクター情報を渡す
    );

    // 状態更新
    setCharacters(result.characters);
    setSpeechBubbles(result.speechBubbles);
    setBackgrounds(result.backgrounds);
    setEffects(result.effects);
    setTones(result.tones);

    setSelectedTemplate(templateKey);
    
    // 成功メッセージ
    console.log(`🎭 「${template.name}」をパネル${targetPanel.id}に適用しました`);
    
    // トースト通知（実装されている場合）
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast(`🎭 「${template.name}」をパネル${targetPanel.id}に適用`, 'success');
    }
    
    // 適用後に対象パネルを選択状態にする
    // この部分は親コンポーネントのonPanelSelectがあれば使用
    // onPanelSelect?.(targetPanel);
    
  }, [panels, selectedPanel, characters, speechBubbles, backgrounds, effects, tones, setCharacters, setSpeechBubbles, setBackgrounds, setEffects, setTones]);

  // プレビュー表示を一時的に無効化
  const handlePreview = useCallback((templateKey: string) => {
    setSelectedTemplate(templateKey);
    // setShowPreview(true); // 一時的にコメントアウト
  }, []);

  // カテゴリ情報
  const categoryInfo = {
    emotion: { icon: '😢', name: '感情', description: '感情表現', color: '#ff6b6b' },
    action: { icon: '💨', name: 'アクション', description: '動きのあるシーン', color: '#4ecdc4' },
    basic: { icon: '💬', name: '基本', description: '基本的なシーン', color: '#45b7d1' } // ← daily → basic
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

      {/* キャラクター選択 */}
      <div className="character-selection" style={{
        marginBottom: '12px',
        padding: '8px',
        background: isDarkMode ? '#2a2a2a' : '#f5f5f5',
        borderRadius: '8px',
        border: `1px solid ${isDarkMode ? '#444' : '#ddd'}`
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: 'bold',
          marginBottom: '8px',
          color: isDarkMode ? '#fff' : '#333'
        }}>
          👤 キャラクター選択
        </div>
        
        <div style={{
          display: 'flex',
          gap: '4px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => {
              if (!selectedPanel) {
                alert('パネルを選択してください');
                return;
              }
              // 主人公キャラクターを作成
              const protagonistChar = {
                id: `char_${Date.now()}_protagonist`,
                characterId: 'protagonist',
                name: '主人公',
                x: 0,
                y: 0,
                panelId: 0,
                isGlobalPosition: true,
                scale: 2.0,
                type: 'character_1',  // 🔧 修正: character → character_1
                expression: 'neutral',
                action: 'standing',
                facing: 'at_viewer',
                eyeState: 'normal',
                mouthState: 'closed',
                handGesture: 'none',
                viewType: 'upper_body' as const
              };
              setSelectedCharacter(protagonistChar);
              console.log('👤 主人公選択:', protagonistChar);
            }}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: selectedCharacter?.characterId === 'protagonist' ? (isDarkMode ? '#4ecdc4' : '#45b7d1') : (isDarkMode ? '#333' : '#f0f0f0'),
              color: selectedCharacter?.characterId === 'protagonist' ? '#fff' : (isDarkMode ? '#fff' : '#333'),
              transition: 'all 0.2s ease'
            }}
          >
            👤 主人公
          </button>
          <button
            onClick={() => {
              if (!selectedPanel) {
                alert('パネルを選択してください');
                return;
              }
              // ヒロインキャラクターを作成または選択
              const heroineChar = characters.find(char => char.characterId === 'heroine') || {
                id: `char_${Date.now()}_heroine`,
                characterId: 'heroine',
                name: 'ヒロイン',
                x: 0,
                y: 0,
                panelId: 0,
                isGlobalPosition: true,
                scale: 2.0,
                type: 'character_2',  // 🔧 修正: character → character_2
                expression: 'neutral',
                action: 'standing',
                facing: 'at_viewer',
                eyeState: 'normal',
                mouthState: 'closed',
                handGesture: 'none',
                viewType: 'upper_body' as const
              };
              setSelectedCharacter(heroineChar);
              console.log('👩 ヒロイン選択:', heroineChar);
            }}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: selectedCharacter?.characterId === 'heroine' ? (isDarkMode ? '#4ecdc4' : '#45b7d1') : (isDarkMode ? '#333' : '#f0f0f0'),
              color: selectedCharacter?.characterId === 'heroine' ? '#fff' : (isDarkMode ? '#fff' : '#333'),
              transition: 'all 0.2s ease'
            }}
          >
            👩 ヒロイン
          </button>
          <button
            onClick={() => {
              if (!selectedPanel) {
                alert('パネルを選択してください');
                return;
              }
              // ライバルキャラクターを作成または選択
              const rivalChar = characters.find(char => char.characterId === 'rival') || {
                id: `char_${Date.now()}_rival`,
                characterId: 'rival',
                name: 'ライバル',
                x: 0,
                y: 0,
                panelId: 0,
                isGlobalPosition: true,
                scale: 2.0,
                type: 'character_3',  // 🔧 修正: character → character_3
                expression: 'neutral',
                action: 'standing',
                facing: 'at_viewer',
                eyeState: 'normal',
                mouthState: 'closed',
                handGesture: 'none',
                viewType: 'upper_body' as const
              };
              setSelectedCharacter(rivalChar);
              console.log('👨 ライバル選択:', rivalChar);
            }}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: selectedCharacter?.characterId === 'rival' ? (isDarkMode ? '#4ecdc4' : '#45b7d1') : (isDarkMode ? '#333' : '#f0f0f0'),
              color: selectedCharacter?.characterId === 'rival' ? '#fff' : (isDarkMode ? '#fff' : '#333'),
              transition: 'all 0.2s ease'
            }}
          >
            👨 ライバル
          </button>
          <button
            onClick={() => {
              if (!selectedPanel) {
                alert('パネルを選択してください');
                return;
              }
              // 友人キャラクターを作成または選択
              const friendChar = characters.find(char => char.characterId === 'friend') || {
                id: `char_${Date.now()}_friend`,
                characterId: 'friend',
                name: '友人',
                x: 0,
                y: 0,
                panelId: 0,
                isGlobalPosition: true,
                scale: 2.0,
                type: 'character_4',  // 🔧 修正: character_3 → character_4
                expression: 'neutral',
                action: 'standing',
                facing: 'at_viewer',
                eyeState: 'normal',
                mouthState: 'closed',
                handGesture: 'none',
                viewType: 'upper_body' as const
              };
              setSelectedCharacter(friendChar);
              console.log('👫 友人選択:', friendChar);
            }}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: selectedCharacter?.characterId === 'friend' ? (isDarkMode ? '#4ecdc4' : '#45b7d1') : (isDarkMode ? '#333' : '#f0f0f0'),
              color: selectedCharacter?.characterId === 'friend' ? '#fff' : (isDarkMode ? '#fff' : '#333'),
              transition: 'all 0.2s ease'
            }}
          >
            👫 友人
          </button>
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
            onClick={() => setSelectedCategory(key as 'emotion' | 'action' | 'basic')}
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
            onClick={() => {
              if (!selectedCharacter) {
                alert('キャラクターを先に選択してください');
                return;
              }
              handleApplyTemplateWithCharacter(key, selectedCharacter);
            }}
            // プレビューを一時的に無効化してチカチカを防ぐ
            // onMouseEnter={() => handlePreview(key)}
            // onMouseLeave={() => setShowPreview(false)}
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

      {/* プレビューモーダルを一時的に無効化してチカチカを防ぐ */}
      {/*
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
      */}

      {/* 背景オーバーレイも一時的に無効化 */}
      {/*
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
      */}
    </div>
  );
};