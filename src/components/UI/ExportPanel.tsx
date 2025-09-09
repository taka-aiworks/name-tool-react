import React, { useState } from 'react';
import { ExportService, ExportOptions, ExportProgress } from '../../services/ExportService';
import { Panel, Character, SpeechBubble } from '../../types';

// ExportPanel.tsx のインターフェース部分
interface ExportPanelProps {
  panels: Panel[];
  characters: Character[];
  bubbles: SpeechBubble[];
  canvasRef: React.RefObject<HTMLCanvasElement | null>; // null を許可
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  panels,
  characters,
  bubbles,
  canvasRef
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    quality: 'high',
    resolution: 300,
    includeBackground: true,
    separatePages: false
  });

  const exportService = ExportService.getInstance();

  const handleExport = async () => {
    if (!canvasRef.current) {
      alert('キャンバスが見つかりません');
      return;
    }

    // バリデーション
    const errors = exportService.validateExportOptions(exportOptions);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    setIsExporting(true);
    setExportProgress({ step: 'initialize', progress: 0, message: '準備中...' });

    try {
      switch (exportOptions.format) {
        case 'pdf':
          await exportService.exportToPDF(
            canvasRef.current,
            panels,
            exportOptions,
            setExportProgress
          );
          break;
        case 'png':
          await exportService.exportToPNG(
            canvasRef.current,
            panels,
            exportOptions,
            setExportProgress
          );
          break;
        case 'psd':
          await exportService.exportToPSD(
            canvasRef.current,
            panels,
            characters,
            bubbles,
            exportOptions,
            setExportProgress
          );
          break;
      }
    } catch (error) {
      console.error('エクスポートエラー:', error);
      alert('エクスポートに失敗しました: ' + (error as Error).message);
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  const getFormatIcon = (format: string): string => {
    switch (format) {
      case 'pdf': return '📄';
      case 'png': return '🖼️';
      case 'psd': return '🎨';
      default: return '📁';
    }
  };

  const getQualityIcon = (quality: string): string => {
    switch (quality) {
      case 'high': return '⭐';
      case 'medium': return '⚡';
      case 'low': return '💨';
      default: return '⚡';
    }
  };

  return (
    <div className="export-panel">
      {/* 大きなエクスポートボタン */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        disabled={isExporting || panels.length === 0}
      >
        <span className="text-2xl">📁</span>
        <div className="text-left">
          <div className="font-bold text-lg">エクスポート</div>
          <div className="text-sm opacity-90">PDF・PNG・PSD出力</div>
        </div>
      </button>

      {/* エクスポート設定モーダル */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-screen overflow-y-auto shadow-2xl">
            {/* ヘッダー */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                📁 エクスポート設定
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                disabled={isExporting}
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* 出力形式 - カード形式 */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  📋 出力形式
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {([
                    { format: 'pdf', name: 'PDF', desc: '印刷・共有用' },
                    { format: 'png', name: 'PNG', desc: '画像ファイル（各コマ別＋全体）' },
                    { format: 'psd', name: 'PSD', desc: 'クリスタ用レイヤー情報' }
                  ] as const).map((item) => (
                    <label 
                      key={item.format} 
                      className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        exportOptions.format === item.format
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                          : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="format"
                        value={item.format}
                        checked={exportOptions.format === item.format}
                        onChange={(e) =>
                          setExportOptions({
                            ...exportOptions,
                            format: e.target.value as any
                          })
                        }
                        disabled={isExporting}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3 w-full">
                        <span className="text-2xl">{getFormatIcon(item.format)}</span>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 品質設定 - カード形式 */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  ⭐ 品質設定
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {([
                    { quality: 'high', name: '高品質', desc: '3倍サイズ・最高画質' },
                    { quality: 'medium', name: '標準品質', desc: '2倍サイズ・バランス重視' },
                    { quality: 'low', name: '低品質', desc: '等倍サイズ・軽量' }
                  ] as const).map((item) => (
                    <label 
                      key={item.quality} 
                      className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        exportOptions.quality === item.quality
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="quality"
                        value={item.quality}
                        checked={exportOptions.quality === item.quality}
                        onChange={(e) =>
                          setExportOptions({
                            ...exportOptions,
                            quality: e.target.value as any
                          })
                        }
                        disabled={isExporting}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3 w-full">
                        <span className="text-2xl">{getQualityIcon(item.quality)}</span>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 詳細設定 */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  🔧 詳細設定
                </h4>
                
                {/* 解像度設定 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    解像度 (DPI)
                  </label>
                  <input
                    type="number"
                    min="72"
                    max="600"
                    step="1"
                    value={exportOptions.resolution}
                    onChange={(e) =>
                      setExportOptions({
                        ...exportOptions,
                        resolution: parseInt(e.target.value)
                      })
                    }
                    disabled={isExporting}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    推奨: 印刷用300DPI、Web用72DPI
                  </p>
                </div>

                {/* チェックボックス設定 */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeBackground}
                      onChange={(e) =>
                        setExportOptions({
                          ...exportOptions,
                          includeBackground: e.target.checked
                        })
                      }
                      disabled={isExporting}
                      className="w-5 h-5 text-green-600 rounded"
                    />
                    <span className="text-sm text-gray-900 dark:text-white">
                      🎨 白背景を含める
                    </span>
                  </label>

                  {/* PDF専用オプション */}
                  {exportOptions.format === 'pdf' && (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exportOptions.separatePages}
                        onChange={(e) =>
                          setExportOptions({
                            ...exportOptions,
                            separatePages: e.target.checked
                          })
                        }
                        disabled={isExporting}
                        className="w-5 h-5 text-green-600 rounded"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">
                        📑 各コマを別ページにする
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* プレビュー情報 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  📊 出力プレビュー
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-gray-600 dark:text-gray-300">
                    <div className="font-medium">📐 コマ数</div>
                    <div className="text-lg font-bold text-blue-600">{panels.length}個</div>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    <div className="font-medium">👥 キャラクター</div>
                    <div className="text-lg font-bold text-green-600">{characters.length}個</div>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    <div className="font-medium">💬 吹き出し</div>
                    <div className="text-lg font-bold text-purple-600">{bubbles.length}個</div>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    <div className="font-medium">📝 形式</div>
                    <div className="text-lg font-bold text-orange-600">{exportOptions.format.toUpperCase()}</div>
                  </div>
                </div>
              </div>

              {/* プログレスバー */}
              {isExporting && exportProgress && (
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl">
                  <div className="flex justify-between text-sm text-gray-900 dark:text-white mb-3">
                    <span className="font-medium">{exportProgress.message}</span>
                    <span className="font-bold">{Math.round(exportProgress.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${exportProgress.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* アクションボタン */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleExport}
                  disabled={isExporting || panels.length === 0}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isExporting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      出力中...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-xl">🚀</span>
                      エクスポート開始
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isExporting}
                  className="px-6 py-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors rounded-xl border border-gray-300 dark:border-gray-600"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};