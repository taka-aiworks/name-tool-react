// src/components/UI/ExportPanel.tsx - 完全版
import React, { useState } from 'react';
import { ExportService, ExportOptions, ExportProgress } from '../../services/ExportService';
import { Panel, Character, SpeechBubble, BackgroundElement, EffectElement, ToneElement } from '../../types';

type ExportPurpose = 'print' | 'image' | 'clipstudio' | 'prompt';

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
  },
  prompt: {
    format: 'txt' as any,
    quality: 'high',
    resolution: 512,
    includeBackground: false,
    separatePages: true
  }
};

interface ExportPanelProps {
  panels: Panel[];
  characters: Character[];
  bubbles: SpeechBubble[];
  backgrounds: BackgroundElement[];
  effects: EffectElement[];
  tones: ToneElement[];
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  panels,
  characters,
  bubbles,
  backgrounds,
  effects,
  tones,
  canvasRef
}) => {
  const [selectedPurpose, setSelectedPurpose] = useState<ExportPurpose | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [promptOutput, setPromptOutput] = useState<string>('');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    quality: 'high',
    resolution: 300,
    includeBackground: true,
    separatePages: false
  });

  const exportService = ExportService.getInstance();
  const isDarkMode = document.documentElement.getAttribute("data-theme") === "dark";

  const handlePurposeClick = (purpose: ExportPurpose) => {
    if (selectedPurpose === purpose) {
      setSelectedPurpose(null);
      setPromptOutput('');
    } else {
      setSelectedPurpose(purpose);
      setPromptOutput('');
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
          await exportService.exportToPSD(canvasRef.current, panels, characters, bubbles, backgrounds, effects, tones, exportOptions, setExportProgress);
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

  // キャラクターを最寄りパネルに割り当てる関数
  const assignCharacterToNearestPanel = (char: Character, allPanels: Panel[]) => {
    if (allPanels.length === 0) return null;
    
    const charCenterX = char.x + (50 / 2);
    const charCenterY = char.y + (50 / 2);
    
    let nearestPanel = allPanels[0];
    let minDistance = Number.MAX_VALUE;
    
    allPanels.forEach(panel => {
      const panelCenterX = panel.x + panel.width / 2;
      const panelCenterY = panel.y + panel.height / 2;
      
      const distance = Math.sqrt(
        Math.pow(charCenterX - panelCenterX, 2) + 
        Math.pow(charCenterY - panelCenterY, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestPanel = panel;
      }
    });
    
    return nearestPanel;
  };

  // プロンプト生成関数
  const generateCharacterPrompt = (char: Character): string => {
    const parts = [
      "masterpiece, best quality",
      "young woman",
      "long black hair",
      "brown eyes", 
      "blue school uniform",
      "standing",
      "solo",
      "anime style"
    ];
    return parts.join(", ");
  };

  const generateJapaneseDescription = (char: Character): string => {
    return [
      "キャラクター: 女性、黒髪ロング、茶色の瞳、青い制服、立っている",
      "構図: 1人、アニメ風",
      "画質: 高品質なアニメ風イラスト"
    ].join("\n");
  };

  const generateBackgroundPrompt = (backgrounds: BackgroundElement[]): string => {
    const parts = [
      "masterpiece, best quality",
      "detailed background",
      "classroom",
      "morning light",
      "no humans",
      "anime style"
    ];
    return parts.join(", ");
  };

  const generateBackgroundJapaneseDescription = (backgrounds: BackgroundElement[]): string => {
    return [
      "背景: 教室、机と椅子、朝の光",
      "構図: 背景のみ、人物なし", 
      "画質: 高品質なアニメ風背景"
    ].join("\n");
  };

  const generateEffectsPrompt = (effects: EffectElement[]): string => {
    const parts = [
      "masterpiece, best quality",
      "speed lines",
      "dynamic effects",
      "motion blur",
      "anime style"
    ];
    return parts.join(", ");
  };

  const generateEffectsJapaneseDescription = (effects: EffectElement[]): string => {
    return [
      "効果: 集中線、スピード線",
      "動き: ダイナミック、モーションブラー",
      "画質: 高品質なアニメ風エフェクト"
    ].join("\n");
  };

  const generateTonesPrompt = (tones: ToneElement[]): string => {
    const parts = [
      "masterpiece, best quality",
      "screen tone effects",
      "manga style shading",
      "anime style"
    ];
    return parts.join(", ");
  };

  // カスタムプロンプト生成関数
  const generateCustomPrompts = (panelsData: Array<{
    panel: Panel;
    characters: Character[];
    backgrounds: BackgroundElement[];
    effects: EffectElement[];
    tones: ToneElement[];
  }>): string => {
    let output = "=== AI Image Generation Prompts ===\n\n";

    panelsData.forEach(({ panel, characters, backgrounds, effects, tones }) => {
      // パネルに何も設定されていない場合はスキップ
      if (characters.length === 0 && backgrounds.length === 0 && effects.length === 0 && tones.length === 0) {
        return;
      }

      // キャラクターごとにプロンプト生成
      characters.forEach((char, charIndex) => {
        output += `━━━ Panel ${panel.id} - Character ${charIndex + 1} (${char.name || '名無し'}) ━━━\n`;
        
        const characterPrompt = generateCharacterPrompt(char);
        output += `【Positive Prompt】\n${characterPrompt}\n\n`;
        
        const japaneseDesc = generateJapaneseDescription(char);
        output += `【日本語説明】\n${japaneseDesc}\n\n`;
        
        output += `───────────────────────────────\n\n`;
      });

      // 背景プロンプト
      if (backgrounds.length > 0) {
        output += `━━━ Panel ${panel.id} - Background ━━━\n`;
        
        const backgroundPrompt = generateBackgroundPrompt(backgrounds);
        output += `【Positive Prompt】\n${backgroundPrompt}\n\n`;
        
        const bgJapaneseDesc = generateBackgroundJapaneseDescription(backgrounds);
        output += `【日本語説明】\n${bgJapaneseDesc}\n\n`;
        
        output += `───────────────────────────────\n\n`;
      }

      // 効果線プロンプト
      if (effects.length > 0) {
        output += `━━━ Panel ${panel.id} - Effects ━━━\n`;
        
        const effectsPrompt = generateEffectsPrompt(effects);
        output += `【Positive Prompt】\n${effectsPrompt}\n\n`;
        
        const effectsJapaneseDesc = generateEffectsJapaneseDescription(effects);
        output += `【日本語説明】\n${effectsJapaneseDesc}\n\n`;
        
        output += `───────────────────────────────\n\n`;
      }

      // トーンプロンプト
      if (tones.length > 0) {
        output += `━━━ Panel ${panel.id} - Tones ━━━\n`;
        
        const tonesPrompt = generateTonesPrompt(tones);
        output += `【Positive Prompt】\n${tonesPrompt}\n\n`;
        
        output += `───────────────────────────────\n\n`;
      }
    });

    // 共通設定
    output += "【Negative Prompt】(全共通)\n";
    output += "lowres, bad anatomy, bad hands, text, error, worst quality, low quality, blurry, bad face, deformed face, extra fingers, watermark, signature\n\n";
    
    output += "【Recommended Settings】(全共通)\n";
    output += "• Steps: 20-28\n";
    output += "• CFG Scale: 7-9\n";
    output += "• Size: 512x768 (portrait) or 768x512 (landscape)\n";
    output += "• Sampler: DPM++ 2M Karras\n\n";

    // 使用ガイド
    output += "=== Usage Guide ===\n";
    output += "1. Copy the Positive Prompt to your AI image generator\n";
    output += "2. Copy the Negative Prompt to negative prompt field\n";
    output += "3. Adjust settings according to recommendations\n";
    output += "4. Generate each prompt separately for best results\n\n";

    // 技術情報
    output += "=== Technical Info ===\n";
    output += `Generated: ${new Date().toLocaleString()}\n`;
    output += `Tool: ネーム制作ツール - Prompt Generator\n`;
    output += `Panels with content: ${panelsData.filter(p => 
      p.characters.length > 0 || p.backgrounds.length > 0 || p.effects.length > 0 || p.tones.length > 0
    ).length}\n`;

    return output;
  };

  // プロンプト出力ハンドラー
  const handlePromptExport = async () => {
    setIsExporting(true);
    try {
      // 各キャラクターを最寄りパネルに割り当て
      const characterAssignments = new Map<number, Character[]>();
      
      // まず全パネルの配列を初期化
      panels.forEach(panel => {
        characterAssignments.set(panel.id, []);
      });
      
      // 各キャラクターを最寄りパネルに割り当て
      characters.forEach(char => {
        const nearestPanel = assignCharacterToNearestPanel(char, panels);
        if (nearestPanel) {
          const panelChars = characterAssignments.get(nearestPanel.id) || [];
          panelChars.push(char);
          characterAssignments.set(nearestPanel.id, panelChars);
        }
      });

      // パネルデータを構築
      const panelsData = panels.map(panel => ({
        panel,
        characters: characterAssignments.get(panel.id) || [],
        backgrounds: backgrounds.filter(bg => bg.panelId === panel.id),
        effects: effects.filter(effect => effect.panelId === panel.id),
        tones: tones.filter(tone => tone.panelId === panel.id)
      }));

      // カスタムプロンプト生成
      const output = generateCustomPrompts(panelsData);
      setPromptOutput(output);
    } catch (error) {
      console.error('プロンプト生成エラー:', error);
      alert('プロンプト生成に失敗しました: ' + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  // プロンプトコピー機能
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptOutput).then(() => {
      alert('プロンプトをクリップボードにコピーしました！');
    }).catch(err => {
      console.error('コピーに失敗:', err);
      alert('コピーに失敗しました。テキストを手動で選択してコピーしてください。');
    });
  };

  // プロンプトダウンロード機能
  const handleDownloadPrompt = () => {
    const blob = new Blob([promptOutput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storyboard-prompts-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const purposes = [
    {
      id: 'prompt' as ExportPurpose,
      icon: '🎨',
      title: 'プロンプト出力',
      desc: 'AI画像生成用'
    },
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
      icon: '🎭',
      title: 'クリスタ用',
      desc: 'レイヤー分け'
    }
  ];

  const totalElements = characters.length + bubbles.length + backgrounds.length + effects.length + tones.length;

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

      {/* 出力統計情報 */}
      <div 
        style={{
          background: isDarkMode ? "#404040" : "#f9f9f9",
          border: `1px solid ${isDarkMode ? "#666666" : "#ddd"}`,
          borderRadius: "6px",
          padding: "8px",
          marginBottom: "12px",
          fontSize: "11px",
          color: isDarkMode ? "#cccccc" : "#666666"
        }}
      >
        <strong>出力内容:</strong><br/>
        📐 コマ: {panels.length}個<br/>
        👥 キャラクター: {characters.length}体<br/>
        💬 吹き出し: {bubbles.length}個<br/>
        🎨 背景: {backgrounds.length}個<br/>
        ⚡ 効果線: {effects.length}個<br/>
        🎯 トーン: {tones.length}個
        <hr style={{ margin: "4px 0", borderColor: isDarkMode ? "#666666" : "#ddd" }} />
        📊 総要素数: {totalElements}個
      </div>
      
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
                  
                  {/* プロンプト出力設定 */}
                  {selectedPurpose === 'prompt' && (
                    <>
                      {!promptOutput ? (
                        <div style={{ textAlign: "center" }}>
                          <div style={{ 
                            fontSize: "32px", 
                            marginBottom: "12px"
                          }}>🎨</div>
                          <h4 style={{ 
                            fontSize: "14px", 
                            fontWeight: "bold", 
                            color: isDarkMode ? "white" : "#1f2937",
                            marginBottom: "8px"
                          }}>
                            AI画像生成用プロンプト出力
                          </h4>
                          <p style={{ 
                            color: isDarkMode ? "#9ca3af" : "#6b7280",
                            marginBottom: "16px",
                            lineHeight: "1.4",
                            fontSize: "11px"
                          }}>
                            設定されている要素のみを分析して、AI画像生成に最適化されたプロンプトを自動生成します。<br />
                            キャラクター・背景・効果線を個別に出力します。
                          </p>
                          <button
                            onClick={handlePromptExport}
                            disabled={isExporting}
                            style={{
                              background: isExporting 
                                ? "#999999" 
                                : "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              padding: "8px 16px",
                              fontSize: "11px",
                              fontWeight: "600",
                              cursor: isExporting ? "not-allowed" : "pointer",
                              opacity: isExporting ? 0.6 : 1
                            }}
                          >
                            {isExporting ? '生成中...' : '🎨 プロンプト生成'}
                          </button>
                        </div>
                      ) : (
                        // プロンプト表示と操作
                        <div>
                          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                            <button
                              onClick={handleCopyPrompt}
                              style={{
                                background: "#10b981",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                padding: "6px 12px",
                                fontSize: "11px",
                                cursor: "pointer"
                              }}
                            >
                              📋 コピー
                            </button>
                            <button
                              onClick={handleDownloadPrompt}
                              style={{
                                background: "#3b82f6",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                padding: "6px 12px",
                                fontSize: "11px",
                                cursor: "pointer"
                              }}
                            >
                              💾 ダウンロード
                            </button>
                          </div>
                          <div style={{
                            background: isDarkMode ? "#1f2937" : "#f9fafb",
                            border: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
                            borderRadius: "4px",
                            padding: "12px",
                            maxHeight: "300px",
                            overflowY: "auto",
                            fontFamily: "monospace",
                            fontSize: "10px",
                            lineHeight: "1.4",
                            whiteSpace: "pre-wrap",
                            color: isDarkMode ? "#e5e7eb" : "#374151"
                          }}>
                            {promptOutput}
                          </div>
                        </div>
                      )}
                    </>
                  )}

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
                          レイヤー構造のJSONファイルと各要素（背景・キャラクター・吹き出し・効果線・トーン）のPNG画像を出力
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

                  {/* プログレス（全出力共通） */}
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

                  {/* 出力ボタン（プロンプト以外） */}
                  {selectedPurpose !== 'prompt' && (
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
                  )}
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