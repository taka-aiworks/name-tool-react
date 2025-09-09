import React, { useState } from 'react';
import { ExportService, ExportOptions, ExportProgress } from '../../services/ExportService';
// ✅ これに変更
import { Panel, Character, SpeechBubble } from '../../types';

interface ExportPanelProps {
  panels: Panel[];
  characters: Character[];
  bubbles: SpeechBubble[];
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
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

  const getFormatDescription = (format: string): string => {
    switch (format) {
      case 'pdf':
        return 'PDF形式（印刷・共有用）';
      case 'png':
        return 'PNG画像（各コマ個別 + 全体）';
      case 'psd':
        return 'クリスタ用データ（レイヤー情報付き）';
      default:
        return '';
    }
  };

  const getQualityDescription = (quality: string): string => {
    switch (quality) {
      case 'high':
        return '高品質（3倍サイズ）';
      case 'medium':
        return '標準品質（2倍サイズ）';
      case 'low':
        return '低品質（等倍サイズ）';
      default:
        return '';
    }
  };

  return (
    <div className="export-panel">
      {/* エクスポートボタン */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        disabled={isExporting || panels.length === 0}
      >
        <span>📁</span>
        エクスポート
      </button>

      {/* エクスポート設定モーダル */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                📁 エクスポート設定
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                disabled={isExporting}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* 出力形式 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  出力形式
                </label>
                <div className="space-y-2">
                  {(['pdf', 'png', 'psd'] as const).map((format) => (
                    <label key={format} className="flex items-center">
                      <input
                        type="radio"
                        name="format"
                        value={format}
                        checked={exportOptions.format === format}
                        onChange={(e) =>
                          setExportOptions({
                            ...exportOptions,
                            format: e.target.value as any
                          })
                        }
                        disabled={isExporting}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {format.toUpperCase()} - {getFormatDescription(format)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 品質設定 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  品質設定
                </label>
                <div className="space-y-2">
                  {(['high', 'medium', 'low'] as const).map((quality) => (
                    <label key={quality} className="flex items-center">
                      <input
                        type="radio"
                        name="quality"
                        value={quality}
                        checked={exportOptions.quality === quality}
                        onChange={(e) =>
                          setExportOptions({
                            ...exportOptions,
                            quality: e.target.value as any
                          })
                        }
                        disabled={isExporting}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {getQualityDescription(quality)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 解像度設定 */}
              <div>
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  推奨: 印刷用300DPI、Web用72DPI
                </p>
              </div>

              {/* 背景設定 */}
              <div>
                <label className="flex items-center">
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
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">
                    白背景を含める
                  </span>
                </label>
              </div>

              {/* PDF専用オプション */}
              {exportOptions.format === 'pdf' && (
                <div>
                  <label className="flex items-center">
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
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-900 dark:text-white">
                      各コマを別ページにする
                    </span>
                  </label>
                </div>
              )}

              {/* プレビュー情報 */}
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  📊 出力プレビュー
                </h4>
                <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  <p>• コマ数: {panels.length}個</p>
                  <p>• キャラクター数: {characters.length}個</p>
                  <p>• 吹き出し数: {bubbles.length}個</p>
                  <p>• 形式: {getFormatDescription(exportOptions.format)}</p>
                  <p>• 品質: {getQualityDescription(exportOptions.quality)}</p>
                </div>
              </div>

              {/* プログレスバー */}
              {isExporting && exportProgress && (
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
                  <div className="flex justify-between text-sm text-gray-900 dark:text-white mb-2">
                    <span>{exportProgress.message}</span>
                    <span>{Math.round(exportProgress.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${exportProgress.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* アクションボタン */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleExport}
                  disabled={isExporting || panels.length === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {isExporting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      出力中...
                    </span>
                  ) : (
                    '📁 エクスポート開始'
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isExporting}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
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