// src/components/UI/ExportPanel.tsx - PromptService統合版
import React, { useState } from 'react';
import { ExportService, ExportOptions, ExportProgress } from '../../services/ExportService';
import { promptService } from '../../services/PromptService';
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
  
  // 🆕 追加
  characterSettings?: Record<string, any>;
  characterNames?: Record<string, string>;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  panels,
  characters,
  bubbles,
  backgrounds,
  effects,
  tones,
  canvasRef,
  
  // 🆕 追加
  characterSettings,
  characterNames
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

  // 🆕 PromptService統合版プロンプト出力ハンドラー
  const handlePromptExport = async () => {
    setIsExporting(true);
    setExportProgress({ step: 'initialize', progress: 10, message: 'プロンプト分析中...' });

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

      setExportProgress({ step: 'processing', progress: 30, message: 'キャラクター詳細分析中...' });

      // 🆕 PromptServiceを使用したプロジェクト構築
      const project = {
        panels,
        characters,
        speechBubbles: bubbles,
        backgrounds,
        effects,
        
        // 🆕 追加
        characterSettings,
        characterNames
      };

      setExportProgress({ step: 'processing', progress: 50, message: '辞書ベースプロンプト生成中...' });

      // 🆕 PromptServiceでプロンプト生成
      const promptData = promptService.generatePrompts(project);
      
      setExportProgress({ step: 'processing', progress: 70, message: 'プロンプト整形中...' });

      // 🆕 PromptServiceの整形機能を使用
      let output = promptService.formatPromptOutput(promptData);

      // 追加で背景・効果線・トーン情報を統合
      output += await generateAdditionalPrompts(characterAssignments);

      setExportProgress({ step: 'finalizing', progress: 90, message: '最終調整中...' });

      setPromptOutput(output);
      setExportProgress({ step: 'complete', progress: 100, message: '完了！' });

    } catch (error) {
      console.error('プロンプト生成エラー:', error);
      alert('プロンプト生成に失敗しました: ' + (error as Error).message);
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportProgress(null), 1000);
    }
  };

  // 🆕 追加要素（背景・効果線・トーン）のプロンプト生成
  const generateAdditionalPrompts = async (characterAssignments: Map<number, Character[]>): Promise<string> => {
    let additionalOutput = "";

    // パネルごとの追加要素処理
    panels.forEach(panel => {
      const panelBackgrounds = backgrounds.filter(bg => bg.panelId === panel.id);
      const panelEffects = effects.filter(effect => effect.panelId === panel.id);
      const panelTones = tones.filter(tone => tone.panelId === panel.id);
      const panelChars = characterAssignments.get(panel.id) || [];

      // 背景が存在し、キャラクターがいない場合のみ背景専用プロンプト
      if (panelBackgrounds.length > 0 && panelChars.length === 0) {
        additionalOutput += `━━━ Panel ${panel.id} - Background Only ━━━\n`;
        additionalOutput += `【Positive Prompt】\n`;
        additionalOutput += generateBackgroundPrompt(panelBackgrounds);
        additionalOutput += `\n\n【日本語説明】\n`;
        additionalOutput += generateBackgroundJapaneseDescription(panelBackgrounds);
        additionalOutput += `\n\n───────────────────────────────\n\n`;
      }

      // 効果線専用プロンプト
      if (panelEffects.length > 0) {
        additionalOutput += `━━━ Panel ${panel.id} - Effects ━━━\n`;
        additionalOutput += `【Positive Prompt】\n`;
        additionalOutput += generateEffectsPrompt(panelEffects);
        additionalOutput += `\n\n【日本語説明】\n`;
        additionalOutput += generateEffectsJapaneseDescription(panelEffects);
        additionalOutput += `\n\n───────────────────────────────\n\n`;
      }

      // トーン専用プロンプト
      if (panelTones.length > 0) {
        additionalOutput += `━━━ Panel ${panel.id} - Tones ━━━\n`;
        additionalOutput += `【Positive Prompt】\n`;
        additionalOutput += generateTonesPrompt(panelTones);
        additionalOutput += `\n\n───────────────────────────────\n\n`;
      }
    });

    return additionalOutput;
  };

  // 背景プロンプト生成（改良版）
  const generateBackgroundPrompt = (backgrounds: BackgroundElement[]): string => {
    if (backgrounds.length === 0) return "";

    const bg = backgrounds[0];
    const parts = [
      "masterpiece, best quality",
      "detailed background",
      bg.type === 'solid' ? "simple background" : "detailed environment",
      "no humans",
      "anime style"
    ];

    // 背景タイプに応じた詳細追加
    switch (bg.type) {
      case 'gradient':
        parts.splice(2, 1, "gradient background", "soft lighting");
        break;
      case 'pattern':
        parts.splice(2, 1, "patterned background", "textured surface");
        break;
      case 'image':
        parts.splice(2, 1, "realistic background", "photographic style");
        break;
    }

    return parts.join(", ");
  };

  const generateBackgroundJapaneseDescription = (backgrounds: BackgroundElement[]): string => {
    if (backgrounds.length === 0) return "";

    const bg = backgrounds[0];
    const typeDescriptions = {
      'solid': '単色背景',
      'gradient': 'グラデーション背景',
      'pattern': 'パターン背景',
      'image': '画像背景'
    };

    return [
      `背景: ${typeDescriptions[bg.type] || '背景'}`,
      "構図: 背景のみ、人物なし",
      "画質: 高品質なアニメ風背景"
    ].join("\n");
  };

  const generateEffectsPrompt = (effects: EffectElement[]): string => {
    if (effects.length === 0) return "";

    const effectTypes = effects.map(effect => {
      switch (effect.type) {
        case 'speed': return "speed lines, motion blur";
        case 'focus': return "focus lines, concentration lines";
        case 'explosion': return "explosion effect, impact burst";
        case 'flash': return "flash effect, bright light";
        default: return "dynamic effects";
      }
    });

    const parts = [
      "masterpiece, best quality",
      ...effectTypes,
      "manga style effects",
      "anime style"
    ];

    return parts.join(", ");
  };

  const generateEffectsJapaneseDescription = (effects: EffectElement[]): string => {
    if (effects.length === 0) return "";

    const effectNames = effects.map(effect => {
      switch (effect.type) {
        case 'speed': return 'スピード線';
        case 'focus': return '集中線';
        case 'explosion': return '爆発エフェクト';
        case 'flash': return 'フラッシュ効果';
        default: return '効果線';
      }
    });

    return [
      `効果: ${effectNames.join('、')}`,
      "動き: ダイナミック、エネルギッシュ",
      "画質: 高品質なアニメ風エフェクト"
    ].join("\n");
  };

  const generateTonesPrompt = (tones: ToneElement[]): string => {
    if (tones.length === 0) return "";

    const parts = [
      "masterpiece, best quality",
      "screen tone effects",
      "manga style shading",
      "halftone pattern",
      "anime style"
    ];

    return parts.join(", ");
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
    a.download = `enhanced-prompts-${new Date().toISOString().split('T')[0]}.txt`;
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
      desc: 'AI画像生成用（辞書対応）'
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

      {/* 🆕 プロンプト機能強化アピール */}
      <div 
        style={{
          background: isDarkMode ? "rgba(139, 92, 246, 0.1)" : "rgba(139, 92, 246, 0.05)",
          border: `1px solid ${isDarkMode ? "rgba(139, 92, 246, 0.3)" : "rgba(139, 92, 246, 0.2)"}`,
          borderRadius: "6px",
          padding: "8px",
          marginBottom: "12px",
          fontSize: "10px",
          color: isDarkMode ? "#c4b5fd" : "#7c3aed"
        }}
      >
        <strong>🆕 プロンプト機能強化:</strong><br/>
        キャラクター詳細情報（表情・ポーズ・視線）を辞書ベースで高品質プロンプト化！<br/>
        固定値から動的生成に進化しました。
      </div>

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
                  
                  {/* 🆕 強化されたプロンプト出力設定 */}
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
                            🆕 辞書対応AI画像生成プロンプト
                          </h4>
                          <p style={{ 
                            color: isDarkMode ? "#9ca3af" : "#6b7280",
                            marginBottom: "16px",
                            lineHeight: "1.4",
                            fontSize: "11px"
                          }}>
                            キャラクター詳細情報（表情・ポーズ・視線）を辞書ベースで分析し、<br />
                            高品質なAI画像生成プロンプトを自動生成します。<br />
                            <strong>固定値→動的生成に進化！</strong>
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
                            {isExporting ? '🧠 辞書分析中...' : '🎨 強化プロンプト生成'}
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