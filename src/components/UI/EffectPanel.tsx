// src/components/UI/EffectPanel.tsx - 完全版（重複解消）
import React, { useState } from 'react';
import { EffectElement, EffectTemplate, Panel } from '../../types';

// 効果線テンプレート定義
const effectTemplates: EffectTemplate[] = [
  // アクションカテゴリ
  {
    id: 'speed_horizontal',
    name: 'スピード線（水平）',
    type: 'speed',
    direction: 'horizontal',
    intensity: 0.8,
    density: 0.6,
    length: 0.7,
    angle: 0,
    color: '#333333',
    opacity: 0.8,
    blur: 0,
    description: '水平方向のスピード線',
    category: 'action'
  },
  {
    id: 'speed_diagonal',
    name: 'スピード線（斜め）',
    type: 'speed',
    direction: 'custom',
    intensity: 0.7,
    density: 0.5,
    length: 0.8,
    angle: 45,
    color: '#444444',
    opacity: 0.9,
    blur: 0,
    description: '斜め方向のスピード線',
    category: 'action'
  },
  {
    id: 'explosion_impact',
    name: '爆発（衝撃）',
    type: 'explosion',
    direction: 'radial',
    intensity: 0.9,
    density: 0.8,
    length: 0.6,
    angle: 0,
    color: '#FF4444',
    opacity: 0.7,
    blur: 1,
    description: '強烈な衝撃表現',
    category: 'action'
  },
  // 感情カテゴリ
  {
    id: 'focus_attention',
    name: '集中線（注目）',
    type: 'focus',
    direction: 'radial',
    intensity: 0.6,
    density: 0.4,
    length: 0.9,
    angle: 0,
    color: '#222222',
    opacity: 0.6,
    blur: 0,
    description: '注目ポイントの強調',
    category: 'emotion'
  },
  {
    id: 'flash_realization',
    name: 'フラッシュ（気づき）',
    type: 'flash',
    direction: 'radial',
    intensity: 0.5,
    density: 0.7,
    length: 0.5,
    angle: 0,
    color: '#FFD700',
    opacity: 0.8,
    blur: 2,
    description: 'ひらめき・気づきの表現',
    category: 'emotion'
  },
  // 環境カテゴリ
  {
    id: 'speed_wind',
    name: '風のスピード線',
    type: 'speed',
    direction: 'custom',
    intensity: 0.4,
    density: 0.3,
    length: 0.8,
    angle: 15,
    color: '#87CEEB',
    opacity: 0.5,
    blur: 1,
    description: '風の流れを表現',
    category: 'environment'
  },
  // 特殊カテゴリ
  {
    id: 'focus_dramatic',
    name: '集中線（ドラマチック）',
    type: 'focus',
    direction: 'radial',
    intensity: 0.8,
    density: 0.6,
    length: 1.0,
    angle: 0,
    color: '#000000',
    opacity: 0.9,
    blur: 0,
    description: 'ドラマチックな演出',
    category: 'special'
  }
];

interface EffectPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEffect: (effect: EffectElement) => void;
  selectedEffect: EffectElement | null;
  onUpdateEffect: (effect: EffectElement) => void;
  isDarkMode: boolean;
  selectedPanel: Panel | null;
  effects: EffectElement[];
}

const EffectPanel: React.FC<EffectPanelProps> = ({
  isOpen,
  onClose,
  onAddEffect,
  selectedEffect,
  onUpdateEffect,
  isDarkMode,
  selectedPanel,
  effects
}) => {
  const [activeCategory, setActiveCategory] = useState<'action' | 'emotion' | 'environment' | 'special'>('action');

  if (!isOpen) return null;

  // テンプレートから効果線要素を作成（背景と同じ方式）
  const createEffectFromTemplate = (template: EffectTemplate): EffectElement => {
    if (!selectedPanel) {
      alert('効果線を追加するコマを選択してください');
      return null as any;
    }

    return {
      id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      panelId: selectedPanel.id,
      type: template.type,
      x: 0, // パネル全体に適用（背景と同じ）
      y: 0,
      width: 1, // パネル全体の幅
      height: 1, // パネル全体の高さ
      direction: template.direction,
      intensity: template.intensity,
      density: template.density,
      length: template.length,
      angle: template.angle,
      color: template.color,
      opacity: template.opacity,
      blur: template.blur,
      centerX: template.direction === 'radial' ? 0.5 : undefined,
      centerY: template.direction === 'radial' ? 0.5 : undefined,
      selected: false,
      zIndex: 0,
      isGlobalPosition: false
    };
  };

  // カテゴリ別テンプレート取得
  const getTemplatesByCategory = (category: string) => {
    return effectTemplates.filter(template => template.category === category);
  };

  // 選択中のコマの効果線を取得
  const getPanelEffects = () => {
    if (!selectedPanel) return [];
    return effects.filter(effect => effect.panelId === selectedPanel.id);
  };

  // カテゴリ情報
  const categories = [
    { id: 'action' as const, name: 'アクション', icon: '⚡', color: '#FF5722' },
    { id: 'emotion' as const, name: '感情', icon: '💭', color: '#9C27B0' },
    { id: 'environment' as const, name: '環境', icon: '🌪️', color: '#2196F3' },
    { id: 'special' as const, name: '特殊', icon: '✨', color: '#FF9800' }
  ];

  // 効果線タイプのアイコン取得
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'speed': return '💨';
      case 'focus': return '🎯';
      case 'explosion': return '💥';
      case 'flash': return '✨';
      default: return '⚡';
    }
  };

  const panelEffects = getPanelEffects();

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'var(--bg-primary)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          maxWidth: '700px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>
              ⚡ 効果線設定
            </h3>
            {selectedPanel ? (
              <div style={{ 
                fontSize: '12px', 
                color: 'var(--text-muted)', 
                marginTop: '4px' 
              }}>
                📍 コマ{selectedPanel.id}に効果線を追加
              </div>
            ) : (
              <div style={{ 
                fontSize: '12px', 
                color: '#ff6b6b', 
                marginTop: '4px' 
              }}>
                ⚠️ コマを選択してください
              </div>
            )}
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              padding: '4px',
              borderRadius: '4px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            ✕
          </button>
        </div>

        {/* 現在のコマの効果線表示 */}
        {selectedPanel && panelEffects.length > 0 && (
          <div style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            margin: '12px 16px',
            padding: '12px'
          }}>
            <h4 style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              color: 'var(--text-primary)'
            }}>
              コマ{selectedPanel.id}の効果線 ({panelEffects.length}個)
            </h4>
            <div style={{
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap'
            }}>
              {panelEffects.map((effect) => (
                <span
                  key={effect.id}
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {getTypeIcon(effect.type)} {effect.type}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* コンテンツ */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* カテゴリタブ */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)'
          }}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                disabled={!selectedPanel}
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  border: 'none',
                  background: activeCategory === category.id ? category.color : 'transparent',
                  color: activeCategory === category.id ? 'white' : (selectedPanel ? 'var(--text-primary)' : 'var(--text-muted)'),
                  cursor: selectedPanel ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: activeCategory === category.id ? 'bold' : 'normal',
                  transition: 'all 0.2s',
                  borderBottom: activeCategory === category.id ? '3px solid ' + category.color : 'none',
                  opacity: selectedPanel ? 1 : 0.5
                }}
                onMouseEnter={(e) => {
                  if (activeCategory !== category.id && selectedPanel) {
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeCategory !== category.id && selectedPanel) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '16px' }}>{category.icon}</span>
                  <span style={{ fontSize: '12px' }}>{category.name}</span>
                </div>
              </button>
            ))}
          </div>

          {/* テンプレートグリッド */}
          <div style={{ 
            flex: 1, 
            padding: '16px', 
            overflowY: 'auto'
          }}>
            {!selectedPanel ? (
              // コマ未選択時のメッセージ
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '200px',
                color: 'var(--text-muted)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📐</div>
                <div style={{ fontSize: '16px', marginBottom: '8px' }}>コマを選択してください</div>
                <div style={{ fontSize: '12px', lineHeight: 1.4 }}>
                  Canvas上のコマをクリックしてから<br/>
                  効果線テンプレートを選択できます
                </div>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                {getTemplatesByCategory(activeCategory).map((template) => (
                  <div
                    key={template.id}
                    onClick={() => {
                      const newEffect = createEffectFromTemplate(template);
                      if (newEffect) {
                        onAddEffect(newEffect);
                      }
                    }}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                      e.currentTarget.style.borderColor = categories.find(c => c.id === activeCategory)?.color || 'var(--border-color)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                  >
                    {/* テンプレートヘッダー */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ fontSize: '18px' }}>
                        {getTypeIcon(template.type)}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: 'var(--text-primary)',
                          lineHeight: 1.2
                        }}>
                          {template.name}
                        </div>
                      </div>
                    </div>

                    {/* テンプレートプレビュー */}
                    <div style={{
                      background: 'var(--bg-primary)',
                      borderRadius: '4px',
                      padding: '8px',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      lineHeight: 1.3
                    }}>
                      {template.description}
                    </div>

                    {/* パラメータ表示 */}
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{
                        background: 'var(--bg-tertiary)',
                        padding: '2px 6px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        color: 'var(--text-muted)'
                      }}>
                        強度: {Math.round(template.intensity * 100)}%
                      </span>
                      <span style={{
                        background: 'var(--bg-tertiary)',
                        padding: '2px 6px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        color: 'var(--text-muted)'
                      }}>
                        密度: {Math.round(template.density * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 選択中の効果線編集エリア */}
          {selectedEffect && (
            <div style={{
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              padding: '16px'
            }}>
              <h4 style={{
                margin: '0 0 12px 0',
                fontSize: '14px',
                color: 'var(--text-primary)'
              }}>
                選択中の効果線: {getTypeIcon(selectedEffect.type)} {selectedEffect.type}
              </h4>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    marginBottom: '4px'
                  }}>
                    強度: {Math.round(selectedEffect.intensity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={selectedEffect.intensity}
                    onChange={(e) => {
                      const updatedEffect = {
                        ...selectedEffect,
                        intensity: parseFloat(e.target.value)
                      };
                      onUpdateEffect(updatedEffect);
                    }}
                    style={{
                      width: '100%',
                      accentColor: categories.find(c => c.id === activeCategory)?.color
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    marginBottom: '4px'
                  }}>
                    密度: {Math.round(selectedEffect.density * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={selectedEffect.density}
                    onChange={(e) => {
                      const updatedEffect = {
                        ...selectedEffect,
                        density: parseFloat(e.target.value)
                      };
                      onUpdateEffect(updatedEffect);
                    }}
                    style={{
                      width: '100%',
                      accentColor: categories.find(c => c.id === activeCategory)?.color
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* フッター */}
          <div style={{
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            padding: '12px 16px',
            fontSize: '12px',
            color: 'var(--text-muted)',
            textAlign: 'center'
          }}>
            💡 コマを選択してテンプレートをクリック • Canvas上で効果線を選択して編集
          </div>
        </div>
      </div>
    </div>
  );
};

export default EffectPanel;