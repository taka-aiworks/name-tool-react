// src/components/UI/TonePanel.tsx - トーン設定UI
import React, { useState, useCallback, useMemo } from 'react';
import { ToneElement, ToneTemplate, Panel, TonePanelProps, BlendMode } from '../../types';
import { 
  allToneTemplates, 
  toneTemplatesByCategory, 
  createToneFromTemplate,
  getToneCategoryInfo,
  getDefaultToneSettings
} from '../CanvasArea/toneTemplates';

/**
 * トーン選択・設定パネル
 * カテゴリ別テンプレート選択とリアルタイムパラメータ調整
 */
const TonePanel: React.FC<TonePanelProps> = ({
  isOpen,
  onClose,
  onAddTone,
  selectedTone,
  onUpdateTone,
  isDarkMode,
  selectedPanel,
  tones
}) => {
  // UI状態管理
  const [activeTab, setActiveTab] = useState<'shadow' | 'highlight' | 'texture' | 'background' | 'effect' | 'mood'>('shadow');
  const [selectedTemplate, setSelectedTemplate] = useState<ToneTemplate | null>(null);
  const [previewTone, setPreviewTone] = useState<ToneElement | null>(null);

  // テンプレート選択時の処理
  const handleTemplateSelect = useCallback((template: ToneTemplate) => {
    if (!selectedPanel) {
      alert('先にパネルを選択してください');
      return;
    }

    setSelectedTemplate(template);
    
    // プレビュー用トーンを作成
    const preview = createToneFromTemplate(template, selectedPanel.id, 0, 0, 1, 1);
    setPreviewTone(preview);
  }, [selectedPanel]);

  // トーン追加処理
  const handleAddTone = useCallback((template: ToneTemplate) => {
    if (!selectedPanel) {
      alert('パネルを選択してからトーンを追加してください');
      return;
    }

    const newTone = createToneFromTemplate(
      template,
      selectedPanel.id,
      0.1, // デフォルト位置
      0.1,
      0.8, // デフォルトサイズ
      0.8
    );

    onAddTone(newTone);
    console.log(`✨ トーン「${template.name}」を追加しました`);
  }, [selectedPanel, onAddTone]);

  // トーンパラメータ更新
  const handleToneUpdate = useCallback((updatedTone: ToneElement) => {
    onUpdateTone(updatedTone);
  }, [onUpdateTone]);

  // パラメータ変更ハンドラー
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

  // カテゴリ情報取得
  const categoryInfo = getToneCategoryInfo();

  // 現在のトーン（選択されたトーンまたはプレビュー）
  const currentTone = selectedTone || previewTone;

  // パネル表示判定
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`
        w-4/5 max-w-6xl h-5/6 max-h-screen
        ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}
        rounded-lg shadow-2xl flex flex-col overflow-hidden
      `}>
        {/* ヘッダー */}
        <div className={`
          flex items-center justify-between p-4 border-b
          ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎨</span>
            <h2 className="text-xl font-bold">トーン設定</h2>
            {selectedPanel && (
              <span className={`
                px-2 py-1 rounded text-sm
                ${isDarkMode ? 'bg-blue-600' : 'bg-blue-100 text-blue-800'}
              `}>
                パネル{selectedPanel.id}
              </span>
            )}
            {tones.length > 0 && (
              <span className={`
                px-2 py-1 rounded text-sm
                ${isDarkMode ? 'bg-green-600' : 'bg-green-100 text-green-800'}
              `}>
                {tones.length}個のトーン
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }
            `}
          >
            ✕ 閉じる
          </button>
        </div>

        <div className="flex-1 flex min-h-0">
          {/* カテゴリタブ */}
          <div className={`
            w-48 border-r flex flex-col
            ${isDarkMode ? 'border-gray-700 bg-gray-850' : 'border-gray-200 bg-gray-50'}
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
                      ? isDarkMode 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-100 text-blue-800 border-r-2 border-blue-500'
                      : isDarkMode
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

          {/* テンプレート一覧 */}
          <div className="flex-1 flex flex-col">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-1">
                {categoryInfo[activeTab].icon} {categoryInfo[activeTab].name}
              </h3>
              <p className="text-sm opacity-75 mb-4">
                {categoryInfo[activeTab].description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                {toneTemplatesByCategory[activeTab].map((template) => (
                  <div
                    key={template.id}
                    className={`
                      border rounded-lg p-3 cursor-pointer transition-all duration-200
                      ${selectedTemplate?.id === template.id
                        ? isDarkMode
                          ? 'border-blue-500 bg-blue-900/30'
                          : 'border-blue-500 bg-blue-50'
                        : isDarkMode
                          ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }
                    `}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    {/* テンプレートプレビュー */}
                    <div className={`
                      w-full h-16 rounded mb-2 border
                      ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}
                    `} 
                    style={{ 
                      backgroundColor: template.preview.backgroundColor,
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
                          ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}
                        `}>
                          {template.type}
                        </span>
                        {template.blendMode !== 'normal' && (
                          <span className={`
                            px-2 py-1 rounded text-xs
                            ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}
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
                        ${isDarkMode
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

          {/* パラメータ調整パネル */}
          {currentTone && (
            <div className={`
              w-80 border-l flex flex-col
              ${isDarkMode ? 'border-gray-700 bg-gray-850' : 'border-gray-200 bg-gray-50'}
            `}>
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold mb-1">パラメータ調整</h3>
                <p className="text-sm opacity-75">
                  {selectedTone ? '選択されたトーン' : 'プレビュー'}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* 基本設定 */}
                <div>
                  <h4 className="font-medium mb-3">基本設定</h4>
                  
                  {/* 密度 */}
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

                  {/* 透明度 */}
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

                  {/* 回転 */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">
                      回転: {currentTone.rotation}°
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="15"
                      value={currentTone.rotation}
                      onChange={(e) => createParameterHandler('rotation')(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* スケール */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">
                      スケール: {currentTone.scale.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={currentTone.scale}
                      onChange={(e) => createParameterHandler('scale')(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* ブレンドモード */}
                <div>
                  <h4 className="font-medium mb-3">ブレンドモード</h4>
                  <select
                    value={currentTone.blendMode}
                    onChange={(e) => createParameterHandler('blendMode')(e.target.value as BlendMode)}
                    className={`
                      w-full p-2 border rounded
                      ${isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                      }
                    `}
                  >
                    <option value="normal">通常</option>
                    <option value="multiply">乗算</option>
                    <option value="screen">スクリーン</option>
                    <option value="overlay">オーバーレイ</option>
                    <option value="soft-light">ソフトライト</option>
                    <option value="hard-light">ハードライト</option>
                    <option value="darken">比較（暗）</option>
                    <option value="lighten">比較（明）</option>
                    <option value="difference">差の絶対値</option>
                    <option value="exclusion">除外</option>
                  </select>
                </div>

                {/* 色調整 */}
                <div>
                  <h4 className="font-medium mb-3">色調整</h4>
                  
                  {/* コントラスト */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">
                      コントラスト: {currentTone.contrast.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={currentTone.contrast}
                      onChange={(e) => createParameterHandler('contrast')(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* 明度 */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">
                      明度: {currentTone.brightness > 0 ? '+' : ''}{Math.round(currentTone.brightness * 100)}
                    </label>
                    <input
                      type="range"
                      min="-0.5"
                      max="0.5"
                      step="0.05"
                      value={currentTone.brightness}
                      onChange={(e) => createParameterHandler('brightness')(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* 反転 */}
                  <div className="mb-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={currentTone.invert}
                        onChange={(e) => createParameterHandler('invert')(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">反転</span>
                    </label>
                  </div>
                </div>

                {/* マスク設定 */}
                <div>
                  <h4 className="font-medium mb-3">マスク設定</h4>
                  
                  {/* マスク有効 */}
                  <div className="mb-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={currentTone.maskEnabled}
                        onChange={(e) => createParameterHandler('maskEnabled')(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">マスク有効</span>
                    </label>
                  </div>

                  {currentTone.maskEnabled && (
                    <>
                      {/* マスク形状 */}
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">形状</label>
                        <select
                          value={currentTone.maskShape}
                          onChange={(e) => createParameterHandler('maskShape')(e.target.value)}
                          className={`
                            w-full p-2 border rounded
                            ${isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300'
                            }
                          `}
                        >
                          <option value="rectangle">四角形</option>
                          <option value="ellipse">楕円</option>
                          <option value="custom">カスタム</option>
                        </select>
                      </div>

                      {/* マスクぼかし */}
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">
                          ぼかし: {currentTone.maskFeather}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          step="1"
                          value={currentTone.maskFeather}
                          onChange={(e) => createParameterHandler('maskFeather')(parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* 表示設定 */}
                <div>
                  <h4 className="font-medium mb-3">表示設定</h4>
                  
                  {/* 表示・非表示 */}
                  <div className="mb-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={currentTone.visible}
                        onChange={(e) => createParameterHandler('visible')(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">表示</span>
                    </label>
                  </div>

                  {/* zIndex */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">
                      重ね順: {currentTone.zIndex}
                    </label>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="1"
                      value={currentTone.zIndex}
                      onChange={(e) => createParameterHandler('zIndex')(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* 操作ボタン */}
              <div className="p-4 border-t border-gray-700 space-y-2">
                {previewTone && !selectedTone && (
                  <button
                    onClick={() => handleAddTone(selectedTemplate!)}
                    disabled={!selectedPanel}
                    className={`
                      w-full py-2 rounded font-medium transition-colors
                      ${!selectedPanel
                        ? 'bg-gray-500 cursor-not-allowed'
                        : isDarkMode
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }
                    `}
                  >
                    ✨ トーンを追加
                  </button>
                )}

                {selectedTone && (
                  <button
                    onClick={() => {
                      const updatedTones = tones.filter(t => t.id !== selectedTone.id);
                      // トーン削除処理（親コンポーネントで実装）
                      console.log('トーン削除:', selectedTone.id);
                    }}
                    className={`
                      w-full py-2 rounded font-medium transition-colors
                      ${isDarkMode
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                      }
                    `}
                  >
                    🗑️ トーンを削除
                  </button>
                )}

                {!selectedPanel && (
                  <div className={`
                    p-3 rounded text-center text-sm
                    ${isDarkMode ? 'bg-yellow-900/30 text-yellow-200' : 'bg-yellow-100 text-yellow-800'}
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

// プレビューパターン生成ヘルパー関数
const generatePreviewPattern = (template: ToneTemplate): string => {
  // 簡易的なCSS背景パターン生成
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