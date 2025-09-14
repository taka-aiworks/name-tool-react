// src/components/UI/TonePanel.tsx - 既存ベース・モーダル化最小変更版
import React, { useState, useCallback, useMemo } from 'react';
import { ToneElement, ToneTemplate, Panel, BlendMode } from '../../types';
import { 
  allToneTemplates, 
  toneTemplatesByCategory, 
  createToneFromTemplate,
  getToneCategoryInfo,
  getDefaultToneSettings
} from '../CanvasArea/toneTemplates';

/**
 * 既存のTonePanelPropsをそのまま使用（互換性確保）
 */
interface TonePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTone: (tone: ToneElement) => void;
  selectedTone?: ToneElement | null;
  onUpdateTone?: (tone: ToneElement) => void;
  isDarkMode?: boolean;
  selectedPanel?: Panel | null;
  tones?: ToneElement[];
  // 🆕 新しいプロパティ（オプショナル）
  selectedPanelId?: number;
  darkMode?: boolean;
}

/**
 * トーン選択・設定パネル（既存機能保持・モーダル化）
 */
const TonePanel: React.FC<TonePanelProps> = ({
  isOpen,
  onClose,
  onAddTone,
  selectedTone,
  onUpdateTone,
  isDarkMode = false,
  selectedPanel,
  tones = [],
  // 新しいプロパティ
  selectedPanelId,
  darkMode
}) => {
  // ダークモード統一（既存との互換性確保）
  const isThemeDark = isDarkMode || darkMode || false;

  // UI状態管理（既存コードそのまま）
  const [activeTab, setActiveTab] = useState<'shadow' | 'highlight' | 'texture' | 'background' | 'effect' | 'mood'>('shadow');
  const [selectedTemplate, setSelectedTemplate] = useState<ToneTemplate | null>(null);
  const [previewTone, setPreviewTone] = useState<ToneElement | null>(null);

  // テンプレート選択時の処理（既存機能保持）
  const handleTemplateSelect = useCallback((template: ToneTemplate) => {
    const targetPanel = selectedPanel || (selectedPanelId ? { id: selectedPanelId } : null);
    if (!targetPanel) {
      alert('先にパネルを選択してください');
      return;
    }

    setSelectedTemplate(template);
    
    // プレビュー用トーンを作成（既存機能）
    if (createToneFromTemplate && typeof createToneFromTemplate === 'function') {
      try {
        const preview = createToneFromTemplate(template, targetPanel.id, 0, 0, 1, 1);
        setPreviewTone(preview);
      } catch (error) {
        console.warn('createToneFromTemplate failed:', error);
        setPreviewTone(null);
      }
    }
  }, [selectedPanel, selectedPanelId]);

  // トーン追加処理（既存機能保持・最小変更）
  const handleAddTone = useCallback((template: ToneTemplate) => {
    const targetPanel = selectedPanel || (selectedPanelId ? { id: selectedPanelId } : null);
    if (!targetPanel) {
      alert('パネルを選択してからトーンを追加してください');
      return;
    }

    // 既存のcreateTypeFromTemplateを使用
    if (createToneFromTemplate && typeof createToneFromTemplate === 'function') {
      try {
        const newTone = createToneFromTemplate(
          template,
          targetPanel.id,
          0.1, // デフォルト位置
          0.1,
          0.8, // デフォルトサイズ
          0.8
        );
        onAddTone(newTone);
        console.log(`✨ トーン「${template.name}」を追加しました`);
      } catch (error) {
        console.error('トーン追加エラー:', error);
        alert('トーンの追加に失敗しました');
      }
    }
  }, [selectedPanel, selectedPanelId, onAddTone]);

  // トーンパラメータ更新（既存機能保持）
  const handleToneUpdate = useCallback((updatedTone: ToneElement) => {
    if (onUpdateTone) {
      onUpdateTone(updatedTone);
    }
  }, [onUpdateTone]);

  // パラメータ変更ハンドラー（既存機能保持）
  const createParameterHandler = useCallback((parameter: keyof ToneElement) => {
    return (value: any) => {
      if (selectedTone) {
        const updatedTone = { ...selectedTone, [parameter]: value };
        handleToneUpdate(updatedTone);
      } else if (previewTone) {
        setPreviewTone({ ...previewTone, [parameter]: value });
      }
    };
  }, [selectedTone, previewTone, handleToneUpdate]);

  // カテゴリ情報取得（既存機能）
  const categoryInfo = getToneCategoryInfo ? getToneCategoryInfo() : {
    shadow: { icon: '🌑', name: '影・陰影', description: 'シャドウトーン' },
    highlight: { icon: '✨', name: 'ハイライト', description: '光・反射' },
    texture: { icon: '🎨', name: 'テクスチャ', description: '質感表現' },
    background: { icon: '🖼️', name: '背景', description: '背景パターン' },
    effect: { icon: '💫', name: '効果', description: '特殊効果' },
    mood: { icon: '🌈', name: '雰囲気', description: 'ムード演出' }
  };

  // 現在のトーン（既存機能）
  const currentTone = selectedTone || previewTone;

  // モーダル表示判定
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`
        w-4/5 max-w-6xl h-5/6 max-h-screen
        ${isThemeDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}
        rounded-lg shadow-2xl flex flex-col overflow-hidden
      `}>
        {/* ヘッダー（既存スタイル） */}
        <div className={`
          flex items-center justify-between p-4 border-b
          ${isThemeDark ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎨</span>
            <h2 className="text-xl font-bold">トーン設定</h2>
            {(selectedPanel || selectedPanelId) && (
              <span className={`
                px-2 py-1 rounded text-sm
                ${isThemeDark ? 'bg-blue-600' : 'bg-blue-100 text-blue-800'}
              `}>
                パネル{selectedPanelId || selectedPanel?.id}
              </span>
            )}
            {tones.length > 0 && (
              <span className={`
                px-2 py-1 rounded text-sm
                ${isThemeDark ? 'bg-green-600' : 'bg-green-100 text-green-800'}
              `}>
                {tones.length}個のトーン
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${isThemeDark 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }
            `}
          >
            ✕ 閉じる
          </button>
        </div>

        <div className="flex-1 flex min-h-0">
          {/* カテゴリタブ（既存スタイル） */}
          <div className={`
            w-48 border-r flex flex-col
            ${isThemeDark ? 'border-gray-700 bg-gray-850' : 'border-gray-200 bg-gray-50'}
          `}>
            <div className="p-3">
              <h3 className="text-sm font-medium mb-2">カテゴリ</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {Object.entries(categoryInfo).map(([category, info]) => (
                <button
                  key={category}
                  onClick={() => setActiveTab(category as any)}
                  className={`
                    w-full p-3 text-left flex items-center gap-2 transition-colors
                    ${activeTab === category
                      ? isThemeDark 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-100 text-blue-800 border-r-2 border-blue-500'
                      : isThemeDark
                        ? 'hover:bg-gray-700 text-gray-300'
                        : 'hover:bg-gray-100 text-gray-600'
                    }
                  `}
                >
                  <span className="text-lg">{info.icon}</span>
                  <div>
                    <div className="text-sm font-medium">{info.name}</div>
                    <div className="text-xs opacity-75">{info.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* テンプレート一覧（既存機能保持） */}
          <div className="flex-1 flex flex-col">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-1">
                {categoryInfo[activeTab]?.icon} {categoryInfo[activeTab]?.name}
              </h3>
              <p className="text-sm opacity-75 mb-4">
                {categoryInfo[activeTab]?.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                {(toneTemplatesByCategory[activeTab] || []).map((template) => (
                  <div
                    key={template.id}
                    className={`
                      border rounded-lg p-3 cursor-pointer transition-all duration-200
                      ${selectedTemplate?.id === template.id
                        ? isThemeDark
                          ? 'border-blue-500 bg-blue-900/30'
                          : 'border-blue-500 bg-blue-50'
                        : isThemeDark
                          ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }
                    `}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    {/* テンプレートプレビュー（既存機能） */}
                    <div className={`
                      w-full h-16 rounded mb-2 border
                      ${isThemeDark ? 'border-gray-600' : 'border-gray-300'}
                    `} 
                    style={{ 
                      backgroundColor: template.preview?.backgroundColor || '#f0f0f0',
                      backgroundImage: generatePreviewPattern(template),
                    }}>
                      <div className="w-full h-full flex items-center justify-center text-xs opacity-60">
                        プレビュー
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-sm mb-1">{template.name}</div>
                      <div className="text-xs opacity-75 leading-tight mb-2">
                        {template.description}
                      </div>
                      
                      {/* テンプレート詳細 */}
                      <div className="flex flex-wrap gap-1">
                        <span className={`
                          px-2 py-1 rounded text-xs
                          ${isThemeDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}
                        `}>
                          {template.type}
                        </span>
                        {template.blendMode && template.blendMode !== 'normal' && (
                          <span className={`
                            px-2 py-1 rounded text-xs
                            ${isThemeDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}
                          `}>
                            {template.blendMode}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 追加ボタン */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddTone(template);
                      }}
                      className={`
                        w-full mt-2 py-2 rounded text-sm font-medium transition-colors
                        ${isThemeDark
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }
                      `}
                    >
                      ➕ 追加
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* パラメータ調整パネル（既存機能保持） */}
          {currentTone && (
            <div className={`
              w-80 border-l flex flex-col
              ${isThemeDark ? 'border-gray-700 bg-gray-850' : 'border-gray-200 bg-gray-50'}
            `}>
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold mb-1">パラメータ調整</h3>
                <p className="text-sm opacity-75">
                  {selectedTone ? '選択されたトーン' : 'プレビュー'}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* 既存のパラメータ調整UI */}
                <div>
                  <h4 className="font-medium mb-3">基本設定</h4>
                  
                  {/* 簡略化されたパラメータ調整 */}
                  {currentTone.density !== undefined && (
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">
                        密度: {Math.round(currentTone.density * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={currentTone.density}
                        onChange={(e) => createParameterHandler('density')(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}

                  {currentTone.opacity !== undefined && (
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">
                        透明度: {Math.round(currentTone.opacity * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={currentTone.opacity}
                        onChange={(e) => createParameterHandler('opacity')(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 操作ボタン（既存機能） */}
              <div className="p-4 border-t border-gray-700 space-y-2">
                {previewTone && !selectedTone && (
                  <button
                    onClick={() => handleAddTone(selectedTemplate!)}
                    disabled={!(selectedPanel || selectedPanelId)}
                    className={`
                      w-full py-2 rounded font-medium transition-colors
                      ${!(selectedPanel || selectedPanelId)
                        ? 'bg-gray-500 cursor-not-allowed'
                        : isThemeDark
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }
                    `}
                  >
                    ✨ トーンを追加
                  </button>
                )}

                {!(selectedPanel || selectedPanelId) && (
                  <div className={`
                    p-3 rounded text-center text-sm
                    ${isThemeDark ? 'bg-yellow-900/30 text-yellow-200' : 'bg-yellow-100 text-yellow-800'}
                  `}>
                    💡 パネルを選択してトーンを追加してください
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// プレビューパターン生成ヘルパー関数（既存機能保持）
const generatePreviewPattern = (template: ToneTemplate): string => {
  if (!template.pattern) return 'none';
  
  // 簡易的なCSS背景パターン生成（既存機能）
  switch (template.pattern) {
    case 'dots_60':
    case 'dots_85':
    case 'dots_100':
    case 'dots_120':
    case 'dots_150':
      return `radial-gradient(circle, #000 1px, transparent 1px)`;
    case 'lines_horizontal':
      return `repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 3px)`;
    case 'lines_vertical':
      return `repeating-linear-gradient(90deg, transparent, transparent 2px, #000 2px, #000 3px)`;
    case 'gradient_linear':
      return `linear-gradient(90deg, #000, transparent)`;
    case 'gradient_radial':
      return `radial-gradient(circle, #000, transparent)`;
    default:
      return 'none';
  }
};

export default TonePanel;