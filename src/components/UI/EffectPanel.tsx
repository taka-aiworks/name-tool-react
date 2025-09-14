// src/components/UI/EffectPanel.tsx
import React, { useState } from 'react';
import { EffectElement, EffectTemplate } from '../../types';
import { effectTemplates, getEffectTemplatesByCategory, createEffectFromTemplate } from '../CanvasArea/effectTemplates';

interface EffectPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEffect: (effect: EffectElement) => void;
  selectedEffect: EffectElement | null;
  onUpdateEffect: (effect: EffectElement) => void;
  isDarkMode: boolean;
}

const EffectPanel: React.FC<EffectPanelProps> = ({
  isOpen,
  onClose,
  onAddEffect,
  selectedEffect,
  onUpdateEffect,
  isDarkMode
}) => {
  const [activeCategory, setActiveCategory] = useState<'action' | 'emotion' | 'environment' | 'special'>('action');
  const [selectedTemplate, setSelectedTemplate] = useState<EffectTemplate | null>(null);

  if (!isOpen) return null;

  const categories = [
    { key: 'action' as const, name: 'アクション', icon: '⚡' },
    { key: 'emotion' as const, name: '感情', icon: '💥' },
    { key: 'environment' as const, name: '環境', icon: '🌪️' },
    { key: 'special' as const, name: '特殊', icon: '✨' }
  ];

  const currentTemplates = getEffectTemplatesByCategory(activeCategory);

  const handleTemplateSelect = (template: EffectTemplate) => {
    setSelectedTemplate(template);
    // デフォルト位置に効果線を追加
    const newEffect = createEffectFromTemplate(template, 100, 100, 200, 200);
    onAddEffect(newEffect);
  };

  const handleEffectPropertyChange = (property: keyof EffectElement, value: any) => {
    if (!selectedEffect) return;
    
    const updatedEffect = { ...selectedEffect, [property]: value };
    onUpdateEffect(updatedEffect);
  };

  const renderTemplateGrid = () => (
    <div className="grid grid-cols-2 gap-3">
      {currentTemplates.map((template) => (
        <div
          key={template.id}
          className={`
            p-3 rounded-lg border cursor-pointer transition-all
            ${isDarkMode 
              ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' 
              : 'border-gray-300 bg-white hover:bg-gray-50'
            }
            ${selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''}
          `}
          onClick={() => handleTemplateSelect(template)}
        >
          <div className="text-sm font-medium mb-1">{template.name}</div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {template.description}
          </div>
          
          {/* 効果線プレビュー */}
          <div className="mt-2 h-8 relative overflow-hidden rounded">
            <svg width="100%" height="100%" className="border border-gray-300">
              {template.direction === 'radial' ? (
                // 放射状効果のプレビュー
                Array.from({ length: 8 }, (_, i) => {
                  const angle = (i / 8) * 2 * Math.PI;
                  const centerX = 50;
                  const centerY = 16;
                  const length = 20;
                  return (
                    <line
                      key={i}
                      x1={centerX}
                      y1={centerY}
                      x2={centerX + Math.cos(angle) * length}
                      y2={centerY + Math.sin(angle) * length}
                      stroke={template.color}
                      strokeWidth={template.intensity * 2}
                      opacity={template.opacity}
                    />
                  );
                })
              ) : (
                // 直線効果のプレビュー
                Array.from({ length: 4 }, (_, i) => (
                  <line
                    key={i}
                    x1={10 + i * 20}
                    y1={8 + Math.random() * 16}
                    x2={25 + i * 20}
                    y2={8 + Math.random() * 16}
                    stroke={template.color}
                    strokeWidth={template.intensity * 2}
                    opacity={template.opacity}
                  />
                ))
              )}
            </svg>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEffectControls = () => {
    if (!selectedEffect) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">効果線の設定</h3>
        
        {/* 強度 */}
        <div>
          <label className="block text-sm font-medium mb-1">強度</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={selectedEffect.intensity}
            onChange={(e) => handleEffectPropertyChange('intensity', parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-gray-500">{selectedEffect.intensity}</span>
        </div>

        {/* 密度 */}
        <div>
          <label className="block text-sm font-medium mb-1">密度</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={selectedEffect.density}
            onChange={(e) => handleEffectPropertyChange('density', parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-gray-500">{selectedEffect.density}</span>
        </div>

        {/* 長さ */}
        <div>
          <label className="block text-sm font-medium mb-1">長さ</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={selectedEffect.length}
            onChange={(e) => handleEffectPropertyChange('length', parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-gray-500">{selectedEffect.length}</span>
        </div>

        {/* 角度（カスタム方向用） */}
        {selectedEffect.direction === 'custom' && (
          <div>
            <label className="block text-sm font-medium mb-1">角度</label>
            <input
              type="range"
              min="0"
              max="360"
              step="5"
              value={selectedEffect.angle}
              onChange={(e) => handleEffectPropertyChange('angle', parseInt(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{selectedEffect.angle}°</span>
          </div>
        )}

        {/* 色 */}
        <div>
          <label className="block text-sm font-medium mb-1">色</label>
          <input
            type="color"
            value={selectedEffect.color}
            onChange={(e) => handleEffectPropertyChange('color', e.target.value)}
            className="w-full h-10 rounded border"
          />
        </div>

        {/* 透明度 */}
        <div>
          <label className="block text-sm font-medium mb-1">透明度</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={selectedEffect.opacity}
            onChange={(e) => handleEffectPropertyChange('opacity', parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-gray-500">{selectedEffect.opacity}</span>
        </div>

        {/* ぼかし */}
        <div>
          <label className="block text-sm font-medium mb-1">ぼかし</label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={selectedEffect.blur}
            onChange={(e) => handleEffectPropertyChange('blur', parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-gray-500">{selectedEffect.blur}</span>
        </div>

        {/* 方向切り替え */}
        <div>
          <label className="block text-sm font-medium mb-1">方向</label>
          <select
            value={selectedEffect.direction}
            onChange={(e) => handleEffectPropertyChange('direction', e.target.value)}
            className={`w-full p-2 border rounded ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300'
            }`}
          >
            <option value="horizontal">水平</option>
            <option value="vertical">垂直</option>
            <option value="radial">放射状</option>
            <option value="custom">カスタム</option>
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`
        w-96 max-h-[80vh] rounded-lg shadow-xl overflow-hidden
        ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
      `}>
        {/* ヘッダー */}
        <div className={`
          p-4 border-b flex items-center justify-between
          ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <h2 className="text-xl font-bold">効果線</h2>
          <button
            onClick={onClose}
            className={`
              text-2xl hover:bg-opacity-20 hover:bg-gray-500 rounded p-1
              ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}
            `}
          >
            ×
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-4 overflow-y-auto max-h-96">
          {/* カテゴリタブ */}
          <div className="flex mb-4 space-x-1">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${activeCategory === category.key
                    ? isDarkMode 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-500 text-white'
                    : isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>

          {/* テンプレート選択エリア */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3">効果線テンプレート</h3>
            {renderTemplateGrid()}
          </div>

          {/* 選択中の効果線設定 */}
          {selectedEffect && (
            <div className={`
              border-t pt-4
              ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
            `}>
              {renderEffectControls()}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className={`
          p-4 border-t flex justify-end space-x-2
          ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <button
            onClick={onClose}
            className={`
              px-4 py-2 rounded font-medium
              ${isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }
            `}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default EffectPanel;