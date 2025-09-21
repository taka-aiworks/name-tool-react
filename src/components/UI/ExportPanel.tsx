// src/components/UI/ExportPanel.tsx - パネル判定デバッグ強化最終版
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
  characterSettings,
  characterNames
}) => {
  const [selectedPurpose, setSelectedPurpose] = useState<ExportPurpose | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [promptOutput, setPromptOutput] = useState<string>('');
  const [debugOutput, setDebugOutput] = useState<string>('');
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
      setDebugOutput('');
    } else {
      setSelectedPurpose(purpose);
      setPromptOutput('');
      setDebugOutput('');
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

  /**
   * 🔧 最終版: キャラクターを最寄りパネルに割り当てる関数（詳細デバッグ対応）
   */
  const assignCharacterToNearestPanel = (char: Character, allPanels: Panel[]): { panel: Panel | null; debug: string } => {
    if (allPanels.length === 0) {
      return { panel: null, debug: 'パネルが存在しません' };
    }
    
    // キャラクターの中心座標を計算
    const charCenterX = char.x + (char.width || 50) / 2;
    const charCenterY = char.y + (char.height || 50) / 2;
    
    let nearestPanel = allPanels[0];
    let minDistance = Number.MAX_VALUE;
    let debugInfo = `🎭 キャラクター "${char.name}" (ID: ${char.id})\n`;
    debugInfo += `📍 座標: (${char.x}, ${char.y}) サイズ: (${char.width || 50} x ${char.height || 50})\n`;
    debugInfo += `🎯 中心点: (${charCenterX}, ${charCenterY})\n\n`;
    
    // 🔧 各パネルとの距離を計算・記録
    const distanceCalculations: Array<{
      panel: Panel;
      distance: number;
      centerX: number;
      centerY: number;
      isInside: boolean;
    }> = [];
    
    allPanels.forEach(panel => {
      const panelCenterX = panel.x + panel.width / 2;
      const panelCenterY = panel.y + panel.height / 2;
      
      const distance = Math.sqrt(
        Math.pow(charCenterX - panelCenterX, 2) + 
        Math.pow(charCenterY - panelCenterY, 2)
      );
      
      // 🆕 パネル内判定
      const isInside = charCenterX >= panel.x && 
                      charCenterX <= panel.x + panel.width &&
                      charCenterY >= panel.y && 
                      charCenterY <= panel.y + panel.height;
      
      distanceCalculations.push({
        panel,
        distance,
        centerX: panelCenterX,
        centerY: panelCenterY,
        isInside
      });
      
      debugInfo += `📐 Panel ${panel.id}:\n`;
      debugInfo += `   位置: (${panel.x}, ${panel.y}) サイズ: (${panel.width} x ${panel.height})\n`;
      debugInfo += `   中心: (${panelCenterX}, ${panelCenterY})\n`;
      debugInfo += `   距離: ${distance.toFixed(2)}px\n`;
      debugInfo += `   内包: ${isInside ? 'YES ✅' : 'NO ❌'}\n\n`;
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestPanel = panel;
      }
    });
    
    // 🆕 距離順にソートしてランキング表示
    distanceCalculations.sort((a, b) => a.distance - b.distance);
    debugInfo += '🏆 距離ランキング:\n';
    distanceCalculations.forEach((calc, index) => {
      const marker = index === 0 ? '👑 1位' : `${index + 1}位`;
      const insideFlag = calc.isInside ? ' 📍内包' : '';
      debugInfo += `${marker}: Panel ${calc.panel.id} (${calc.distance.toFixed(2)}px)${insideFlag}\n`;
    });
    
    // 🆕 最終判定結果
    const finalChoice = distanceCalculations[0];
    debugInfo += `\n✅ 最終判定: Panel ${finalChoice.panel.id}\n`;
    debugInfo += `   理由: ${finalChoice.isInside ? 'キャラクターがパネル内に存在' : '最も距離が近い'}\n`;
    debugInfo += `   距離: ${finalChoice.distance.toFixed(2)}px\n`;
    
    return { panel: nearestPanel, debug: debugInfo };
  };

  /**
   * 🆕 全キャラクターの配置判定デバッグ関数（最終版）
   */
  const generatePanelAssignmentDebug = (): string => {
    let debugText = "=== キャラクター配置判定デバッグ（v1.1.1最終版） ===\n\n";
    
    debugText += `📊 基本情報:\n`;
    debugText += `- パネル数: ${panels.length}\n`;
    debugText += `- キャラクター数: ${characters.length}\n`;
    debugText += `- 生成日時: ${new Date().toLocaleString()}\n\n`;
    
    // パネル情報詳細
    debugText += `📐 パネル詳細情報:\n`;
    panels.forEach(panel => {
      const centerX = panel.x + panel.width / 2;
      const centerY = panel.y + panel.height / 2;
      const area = panel.width * panel.height;
      debugText += `Panel ${panel.id}:\n`;
      debugText += `  📍 左上: (${panel.x}, ${panel.y})\n`;
      debugText += `  📏 サイズ: ${panel.width} x ${panel.height} (面積: ${area})\n`;
      debugText += `  🎯 中心: (${centerX}, ${centerY})\n`;
      debugText += `  📦 範囲: X[${panel.x} - ${panel.x + panel.width}], Y[${panel.y} - ${panel.y + panel.height}]\n\n`;
    });
    
    // キャラクター配置判定詳細
    debugText += `👥 キャラクター配置判定詳細:\n`;
    const characterAssignments = new Map<number, Character[]>();
    
    // パネル初期化
    panels.forEach(panel => {
      characterAssignments.set(panel.id, []);
    });
    
    // 各キャラクターを詳細判定
    characters.forEach((char, index) => {
      debugText += `\n${'='.repeat(50)}\n`;
      debugText += `Character ${index + 1}: ${char.name}\n`;
      debugText += `${'='.repeat(50)}\n`;
      
      const { panel, debug } = assignCharacterToNearestPanel(char, panels);
      debugText += debug + '\n';
      
      if (panel) {
        const panelChars = characterAssignments.get(panel.id) || [];
        panelChars.push(char);
        characterAssignments.set(panel.id, panelChars);
      }
    });
    
    // 最終配置結果サマリー
    debugText += `\n${'='.repeat(60)}\n`;
    debugText += `📋 最終配置結果サマリー\n`;
    debugText += `${'='.repeat(60)}\n`;
    
    let totalAssigned = 0;
    panels.forEach(panel => {
      const assignedChars = characterAssignments.get(panel.id) || [];
      totalAssigned += assignedChars.length;
      
      debugText += `Panel ${panel.id}: ${assignedChars.length}体`;
      if (assignedChars.length > 0) {
        const names = assignedChars.map(c => `"${c.name}"`).join(', ');
        debugText += ` → ${names}`;
      } else {
        debugText += ` → (空)`;
      }
      debugText += '\n';
    });
    
    debugText += `\n📈 統計:\n`;
    debugText += `- 総キャラクター数: ${characters.length}\n`;
    debugText += `- 配置完了数: ${totalAssigned}\n`;
    debugText += `- 未配置数: ${characters.length - totalAssigned}\n`;
    
    if (totalAssigned === characters.length) {
      debugText += `✅ 全キャラクターの配置が完了しました\n`;
    } else {
      debugText += `⚠️ 一部キャラクターが未配置です\n`;
    }
    
    debugText += `\n${'='.repeat(60)}\n`;
    debugText += `デバッグ完了 - ${new Date().toISOString()}\n`;
    debugText += `${'='.repeat(60)}\n`;
    
    return debugText;
  };

  const handlePromptExport = async () => {
    setIsExporting(true);
    setExportProgress({ step: 'initialize', progress: 10, message: 'プロンプト分析中...' });

    try {
      // 🆕 パネル配置デバッグ情報を先に生成
      const debugInfo = generatePanelAssignmentDebug();
      //setDebugOutput(debugInfo);

      // 各キャラクターを最寄りパネルに割り当て
      const characterAssignments = new Map<number, Character[]>();
      
      panels.forEach(panel => {
        characterAssignments.set(panel.id, []);
      });
      
      characters.forEach(char => {
        const { panel } = assignCharacterToNearestPanel(char, panels);
        if (panel) {
          const panelChars = characterAssignments.get(panel.id) || [];
          panelChars.push(char);
          characterAssignments.set(panel.id, panelChars);
        }
      });

      setExportProgress({ step: 'processing', progress: 30, message: 'キャラクター詳細分析中...' });

      const project = {
        panels,
        characters,
        speechBubbles: bubbles,
        backgrounds,
        effects,
        characterSettings,
        characterNames
      };

      setExportProgress({ step: 'processing', progress: 50, message: '未選択値除外プロンプト生成中...' });

      const promptData = promptService.generatePrompts(project);
      
      setExportProgress({ step: 'processing', progress: 70, message: 'プロンプト整形中...' });

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

  const generateAdditionalPrompts = async (characterAssignments: Map<number, Character[]>): Promise<string> => {
    let additionalOutput = "";

    panels.forEach(panel => {
      const panelBackgrounds = backgrounds.filter(bg => bg.panelId === panel.id);
      const panelEffects = effects.filter(effect => effect.panelId === panel.id);
      const panelTones = tones.filter(tone => tone.panelId === panel.id);
      const panelChars = characterAssignments.get(panel.id) || [];

      if (panelBackgrounds.length > 0 && panelChars.length === 0) {
        additionalOutput += `━━━ Panel ${panel.id} - Background Only ━━━\n`;
        additionalOutput += `【Positive Prompt】\n`;
        additionalOutput += generateBackgroundPrompt(panelBackgrounds);
        additionalOutput += `\n\n【日本語説明】\n`;
        additionalOutput += generateBackgroundJapaneseDescription(panelBackgrounds);
        additionalOutput += `\n\n───────────────────────────────\n\n`;
      }

      if (panelEffects.length > 0) {
        additionalOutput += `━━━ Panel ${panel.id} - Effects ━━━\n`;
        additionalOutput += `【Positive Prompt】\n`;
        additionalOutput += generateEffectsPrompt(panelEffects);
        additionalOutput += `\n\n【日本語説明】\n`;
        additionalOutput += generateEffectsJapaneseDescription(panelEffects);
        additionalOutput += `\n\n───────────────────────────────\n\n`;
      }

      if (panelTones.length > 0) {
        additionalOutput += `━━━ Panel ${panel.id} - Tones ━━━\n`;
        additionalOutput += `【Positive Prompt】\n`;
        additionalOutput += generateTonesPrompt(panelTones);
        additionalOutput += `\n\n───────────────────────────────\n\n`;
      }
    });

    return additionalOutput;
  };

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

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptOutput).then(() => {
      alert('プロンプトをクリップボードにコピーしました！');
    }).catch(err => {
      console.error('コピーに失敗:', err);
      alert('コピーに失敗しました。テキストを手動で選択してコピーしてください。');
    });
  };

  const handleCopyDebug = () => {
    navigator.clipboard.writeText(debugOutput).then(() => {
      alert('デバッグ情報をクリップボードにコピーしました！');
    }).catch(err => {
      console.error('コピーに失敗:', err);
      alert('コピーに失敗しました。');
    });
  };

  const handleDownloadPrompt = () => {
    const blob = new Blob([promptOutput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `v1.1.1-final-prompts-${new Date().toISOString().split('T')[0]}.txt`;
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
      desc: 'AI画像生成用（未選択時除外対応）'
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

      {/* 🆕 v1.1.1 最終版アピール */}
      <div 
        style={{
          background: isDarkMode ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.05)",
          border: `1px solid ${isDarkMode ? "rgba(16, 185, 129, 0.3)" : "rgba(16, 185, 129, 0.2)"}`,
          borderRadius: "6px",
          padding: "8px",
          marginBottom: "12px",
          fontSize: "10px",
          color: isDarkMode ? "#6ee7b7" : "#047857"
        }}
      >
        <strong>🎯 v1.1.1 最終版完成:</strong><br/>
        ✅ 未選択時完全除外システム<br/>
        ✅ パネル判定デバッグ詳細強化<br/>
        ✅ プロンプト品質大幅向上
      </div>

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
                            🎯 v1.1.1 最終版プロンプト生成
                          </h4>
                          <p style={{ 
                            color: isDarkMode ? "#9ca3af" : "#6b7280",
                            marginBottom: "16px",
                            lineHeight: "1.4",
                            fontSize: "11px"
                          }}>
                            ✅ 未選択項目は完全に出力除外<br />
                            ✅ パネル判定デバッグ詳細表示<br />
                            ✅ 無意味なデフォルト値完全除去<br />
                            <strong>史上最高品質なプロンプト生成！</strong>
                          </p>
                          <button
                            onClick={handlePromptExport}
                            disabled={isExporting}
                            style={{
                              background: isExporting 
                                ? "#999999" 
                                : "linear-gradient(135deg, #10b981, #059669)",
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
                            {isExporting ? '🎯 最終版生成中...' : '🎨 v1.1.1 最終版生成'}
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
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
                              📋 プロンプトコピー
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
                            {debugOutput && (
                              <button
                                onClick={handleCopyDebug}
                                style={{
                                  background: "#f59e0b",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  padding: "6px 12px",
                                  fontSize: "11px",
                                  cursor: "pointer"
                                }}
                              >
                                🔧 デバッグコピー
                              </button>
                            )}
                          </div>

                          {/* 🆕 デバッグ表示エリア（詳細版） */}
                          {debugOutput && (
                            <div style={{ marginBottom: "12px" }}>
                              <h5 style={{
                                fontSize: "12px",
                                fontWeight: "bold",
                                color: isDarkMode ? "#f59e0b" : "#d97706",
                                marginBottom: "6px",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px"
                              }}>
                                🔧 パネル判定デバッグ情報（v1.1.1詳細版）
                              </h5>
                              <div style={{
                                background: isDarkMode ? "#1f2937" : "#fffbeb",
                                border: `1px solid ${isDarkMode ? "#374151" : "#fbbf24"}`,
                                borderRadius: "4px",
                                padding: "8px",
                                maxHeight: "250px",
                                overflowY: "auto",
                                fontFamily: "monospace",
                                fontSize: "9px",
                                lineHeight: "1.3",
                                whiteSpace: "pre-wrap",
                                color: isDarkMode ? "#fbbf24" : "#92400e"
                              }}>
                                {debugOutput}
                              </div>
                              <div style={{
                                fontSize: "10px",
                                color: isDarkMode ? "#9ca3af" : "#6b7280",
                                marginTop: "4px",
                                textAlign: "center"
                              }}>
                                💡 各キャラクターがどのパネルに配置されるかの詳細計算結果
                              </div>
                            </div>
                          )}

                          {/* プロンプト表示エリア */}
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