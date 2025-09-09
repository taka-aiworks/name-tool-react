import React, { useState } from 'react';
import { ExportService, ExportOptions, ExportProgress } from '../../services/ExportService';
import { Panel, Character, SpeechBubble } from '../../types';

type ExportPurpose = 'print' | 'image' | 'clipstudio';

const purposeDefaults: Record<ExportPurpose, Partial<ExportOptions>> = {
  print: {
    format: 'pdf',
    quality: 'high',
    resolution: 300,
    includeBackground: true,
    separatePages: false
  },
  image: {
    format: 'png',
    quality: 'medium',
    resolution: 150,
    includeBackground: true,
    separatePages: false
  },
  clipstudio: {
    format: 'psd',
    quality: 'high',
    resolution: 300,
    includeBackground: false,
    separatePages: false
  }
};

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
  const [selectedPurpose, setSelectedPurpose] = useState<ExportPurpose | null>(null);
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

  // ダークモード検出
  const isDarkMode = document.documentElement.getAttribute("data-theme") === "dark";

  const handlePurposeClick = (purpose: ExportPurpose) => {
    if (selectedPurpose === purpose) {
      setSelectedPurpose(null);
    } else {
      setSelectedPurpose(purpose);
      setExportOptions({
        ...exportOptions,
        ...purposeDefaults[purpose]
      });
    }
  };

  const handleExport = async () => {
    if (!canvasRef.current || !selectedPurpose) {
      alert('設定に問題があります');
      return;
    }

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
          await exportService.exportToPDF(canvasRef.current, panels, exportOptions, setExportProgress);
          break;
        case 'png':
          await exportService.exportToPNG(canvasRef.current, panels, exportOptions, setExportProgress);
          break;
        case 'psd':
          await exportService.exportToPSD(canvasRef.current, panels, characters, bubbles, exportOptions, setExportProgress);
          break;
      }
    } catch (error) {
      console.error('エクスポートエラー:', error);
      alert('エクスポートに失敗しました: ' + (error as Error).message);
    } finally {
      setIsExporting(false);
      setExportProgress(null);
      setSelectedPurpose(null);
    }
  };

  const purposes = [
    {
      id: 'print' as ExportPurpose,
      icon: '📄',
      title: '印刷用PDF',
      desc: 'ネーム印刷・共有用'
    },
    {
      id: 'image' as ExportPurpose,
      icon: '🖼️',
      title: '画像保存',
      desc: 'SNS・Web用'
    },
    {
      id: 'clipstudio' as ExportPurpose,
      icon: '🎨',
      title: 'クリスタ用',
      desc: 'レイヤー分け'
    }
  ];

  return (
    <div 
      style={{
        background: isDarkMode ? "#2d2d2d" : "white",
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
    >
      {/* セクションヘッダー */}
      <h3 
        style={{
          color: isDarkMode ? "#ffffff" : "#333333",
          fontSize: "14px",
          fontWeight: "bold",
          marginBottom: "12px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span style={{ color: "#ff8833" }}>📁</span>
        出力
      </h3>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {purposes.map((purpose) => (
          <div key={purpose.id}>
            <button
              onClick={() => handlePurposeClick(purpose.id)}
              disabled={panels.length === 0 || isExporting}
              style={{
                width: "100%",
                padding: "12px",
                textAlign: "left",
                borderRadius: "4px",
                border: selectedPurpose === purpose.id 
                  ? "2px solid #ff8833" 
                  : `1px solid ${isDarkMode ? "#555555" : "#ddd"}`,
                background: selectedPurpose === purpose.id
                  ? (isDarkMode ? "rgba(255, 136, 51, 0.1)" : "rgba(255, 136, 51, 0.05)")
                  : (isDarkMode ? "#404040" : "#f9f9f9"),
                color: isDarkMode ? "#ffffff" : "#333333",
                cursor: panels.length === 0 || isExporting ? "not-allowed" : "pointer",
                opacity: panels.length === 0 || isExporting ? 0.5 : 1,
                transition: "all 0.2s",
                fontFamily: "inherit",
                fontSize: "12px",
              }}
              onMouseEnter={(e) => {
                if (panels.length > 0 && !isExporting) {
                  const target = e.target as HTMLElement;
                  target.style.background = selectedPurpose === purpose.id
                    ? (isDarkMode ? "rgba(255, 136, 51, 0.2)" : "rgba(255, 136, 51, 0.1)")
                    : (isDarkMode ? "#505050" : "#f0f0f0");
                }
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLElement;
                target.style.background = selectedPurpose === purpose.id
                  ? (isDarkMode ? "rgba(255, 136, 51, 0.1)" : "rgba(255, 136, 51, 0.05)")
                  : (isDarkMode ? "#404040" : "#f9f9f9");
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "16px" }}>{purpose.icon}</span>
                <div>
                  <div style={{ 
                    fontWeight: "600", 
                    fontSize: "12px",
                    marginBottom: "2px"
                  }}>
                    {purpose.title}
                  </div>
                  <div style={{ 
                    fontSize: "10px", 
                    opacity: 0.7
                  }}>
                    {purpose.desc}
                  </div>
                </div>
              </div>
            </button>

            {/* 設定パネル */}
            {selectedPurpose === purpose.id && (
              <div 
                style={{
                  marginTop: "8px",
                  padding: "12px",
                  background: isDarkMode ? "#404040" : "white",
                  border: `1px solid ${isDarkMode ? "#666666" : "#ddd"}`,
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {/* 印刷用設定 */}
                  {selectedPurpose === 'print' && (
                    <>
                      <div>
                        <label 
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: "600",
                            color: isDarkMode ? "#ffffff" : "#333333",
                            marginBottom: "4px",
                          }}
                        >
                          解像度
                        </label>
                        <select
                          value={exportOptions.resolution}
                          onChange={(e) => setExportOptions({
                            ...exportOptions,
                            resolution: parseInt(e.target.value)
                          })}
                          disabled={isExporting}
                          style={{
                            width: "100%",
                            padding: "6px 8px",
                            border: `1px solid ${isDarkMode ? "#666666" : "#ddd"}`,
                            borderRadius: "4px",
                            background: isDarkMode ? "#2d2d2d" : "white",
                            color: isDarkMode ? "#ffffff" : "#333333",
                            fontSize: "11px",
                            fontFamily: "inherit",
                          }}
                        >
                          <option value={150}>150 DPI (標準)</option>
                          <option value={300}>300 DPI (高品質)</option>
                          <option value={600}>600 DPI (最高品質)</option>
                        </select>
                      </div>
                      
                      <label style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "6px",
                        fontSize: "11px",
                        color: isDarkMode ? "#ffffff" : "#333333",
                        cursor: "pointer"
                      }}>
                        <input
                          type="checkbox"
                          checked={exportOptions.separatePages}
                          onChange={(e) => setExportOptions({
                            ...exportOptions,
                            separatePages: e.target.checked
                          })}
                          disabled={isExporting}
                          style={{ margin: 0 }}
                        />
                        各コマを別ページにする
                      </label>
                    </>
                  )}

                  {/* 画像用設定 */}
                  {selectedPurpose === 'image' && (
                    <>
                      <div>
                        <label 
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: "600",
                            color: isDarkMode ? "#ffffff" : "#333333",
                            marginBottom: "6px",
                          }}
                        >
                          品質
                        </label>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          {[
                            { value: 'high', label: '高品質' },
                            { value: 'medium', label: '標準' },
                            { value: 'low', label: '軽量' }
                          ].map((item) => (
                            <label 
                              key={item.value} 
                              style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: "6px",
                                fontSize: "11px",
                                color: isDarkMode ? "#ffffff" : "#333333",
                                cursor: "pointer"
                              }}
                            >
                              <input
                                type="radio"
                                name="quality"
                                value={item.value}
                                checked={exportOptions.quality === item.value}
                                onChange={(e) => setExportOptions({
                                  ...exportOptions,
                                  quality: e.target.value as any
                                })}
                                disabled={isExporting}
                                style={{ margin: 0 }}
                              />
                              {item.label}
                            </label>
                          ))}
                        </div>
                      </div>

                      <label style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "6px",
                        fontSize: "11px",
                        color: isDarkMode ? "#ffffff" : "#333333",
                        cursor: "pointer"
                      }}>
                        <input
                          type="checkbox"
                          checked={!exportOptions.includeBackground}
                          onChange={(e) => setExportOptions({
                            ...exportOptions,
                            includeBackground: !e.target.checked
                          })}
                          disabled={isExporting}
                          style={{ margin: 0 }}
                        />
                        背景を透明にする
                      </label>
                    </>
                  )}

                  {/* クリスタ用設定 */}
                  {selectedPurpose === 'clipstudio' && (
                    <>
                      <div 
                        style={{
                          background: isDarkMode ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.05)",
                          padding: "8px",
                          borderRadius: "4px",
                          textAlign: "center",
                        }}
                      >
                        <p 
                          style={{
                            fontSize: "10px",
                            color: isDarkMode ? "#93c5fd" : "#3b82f6",
                            margin: 0,
                          }}
                        >
                          レイヤー構造のJSONファイルと各要素のPNG画像を出力
                        </p>
                      </div>
                      
                      <div>
                        <label 
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: "600",
                            color: isDarkMode ? "#ffffff" : "#333333",
                            marginBottom: "4px",
                          }}
                        >
                          解像度
                        </label>
                        <select
                          value={exportOptions.resolution}
                          onChange={(e) => setExportOptions({
                            ...exportOptions,
                            resolution: parseInt(e.target.value)
                          })}
                          disabled={isExporting}
                          style={{
                            width: "100%",
                            padding: "6px 8px",
                            border: `1px solid ${isDarkMode ? "#666666" : "#ddd"}`,
                            borderRadius: "4px",
                            background: isDarkMode ? "#2d2d2d" : "white",
                            color: isDarkMode ? "#ffffff" : "#333333",
                            fontSize: "11px",
                            fontFamily: "inherit",
                          }}
                        >
                          <option value={300}>300 DPI (推奨)</option>
                          <option value={600}>600 DPI (高品質)</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* プログレス */}
                  {isExporting && exportProgress && (
                    <div 
                      style={{
                        background: isDarkMode ? "#404040" : "#f5f5f5",
                        padding: "8px",
                        borderRadius: "4px",
                      }}
                    >
                      <div 
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "10px",
                          marginBottom: "4px",
                          color: isDarkMode ? "#ffffff" : "#333333",
                        }}
                      >
                        <span>{exportProgress.message}</span>
                        <span style={{ fontWeight: "bold" }}>
                          {Math.round(exportProgress.progress)}%
                        </span>
                      </div>
                      <div 
                        style={{
                          width: "100%",
                          height: "4px",
                          background: isDarkMode ? "#666666" : "#e0e0e0",
                          borderRadius: "2px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            background: "#ff8833",
                            borderRadius: "2px",
                            transition: "width 0.3s",
                            width: `${exportProgress.progress}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 出力ボタン */}
                  <button
                    onClick={handleExport}
                    disabled={isExporting || panels.length === 0}
                    style={{
                      width: "100%",
                      background: isExporting || panels.length === 0 ? "#999999" : "#ff8833",
                      color: "white",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      border: "none",
                      fontSize: "11px",
                      fontWeight: "600",
                      cursor: isExporting || panels.length === 0 ? "not-allowed" : "pointer",
                      transition: "background-color 0.2s",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => {
                      if (!isExporting && panels.length > 0) {
                        const target = e.target as HTMLElement;
                        target.style.background = "#e6771f";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isExporting && panels.length > 0) {
                        const target = e.target as HTMLElement;
                        target.style.background = "#ff8833";
                      }
                    }}
                  >
                    {isExporting ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                        <div 
                          style={{
                            width: "12px",
                            height: "12px",
                            border: "2px solid white",
                            borderTop: "2px solid transparent",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                          }}
                        />
                        出力中...
                      </span>
                    ) : (
                      '出力する'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* アニメーション定義 */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};