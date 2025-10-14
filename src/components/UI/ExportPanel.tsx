// src/components/UI/ExportPanel.tsx - 修正版
import React, { useState } from 'react';
import { ExportService, ExportOptions, ExportProgress } from '../../services/ExportService';
import { promptService } from '../../services/PromptService';
import { nanoBananaExportService } from '../../services/NanoBananaExportService';
import { 
  Panel, 
  Character, 
  SpeechBubble, 
  BackgroundElement, 
  EffectElement, 
  ToneElement,
  NanoBananaExportOptions,
  NanoBananaExportProgress,
  DEFAULT_NANOBANANA_EXPORT_OPTIONS,
  PaperSize,
  PAPER_SIZES
} from '../../types';
import { BetaUtils } from '../../config/betaConfig';

type ExportPurpose = 'image' | 'clipstudio' | 'nanobanana';

const purposeDefaults: Record<ExportPurpose, Partial<ExportOptions>> = {
  image: {
    format: 'png',
    quality: 'medium', // 固定値
    resolution: 300,
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
  nanobanana: {
    format: 'zip' as any,
    quality: 'high',
    resolution: 300,
    includeBackground: true,
    separatePages: false
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
  paperSize?: PaperSize;
  currentPageIndex?: number;
  pages?: any[];
  onRedrawTemplateOnly?: (withoutNumbers?: boolean) => Promise<void>;
  onRestoreFullCanvas?: () => Promise<void>;
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
  characterNames,
  paperSize,
  currentPageIndex,
  pages,
  onRedrawTemplateOnly,
  onRestoreFullCanvas
}) => {
  const [selectedPurpose, setSelectedPurpose] = useState<ExportPurpose | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [promptOutput, setPromptOutput] = useState<string>('');
  const [debugOutput, setDebugOutput] = useState<string>('');
  const [exportCurrentPageOnly, setExportCurrentPageOnly] = useState<boolean>(false);
  const [exportTemplateOnly, setExportTemplateOnly] = useState<boolean>(false);
  const [exportTemplateWithoutNumbers, setExportTemplateWithoutNumbers] = useState<boolean>(false);
  const [exportPromptAlso, setExportPromptAlso] = useState<boolean>(false);
  
  // 🆕 NanoBanana関連のstate
  const [nanoBananaOptions, setNanoBananaOptions] = useState<NanoBananaExportOptions>(DEFAULT_NANOBANANA_EXPORT_OPTIONS);
  const [nanoBananaProgress, setNanoBananaProgress] = useState<NanoBananaExportProgress | null>(null);
  const [isNanoBananaExporting, setIsNanoBananaExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    quality: 'high',
    resolution: 300,
    includeBackground: true,
    separatePages: false
  });

  const exportService = ExportService.getInstance();
  const isDarkMode = document.documentElement.getAttribute("data-theme") === "dark";

  // 🍌 NanoBananaエクスポート処理関数
  const handleNanoBananaExport = async () => {
    if (!canvasRef.current || panels.length === 0) {
      alert('エクスポートできるコンテンツがありません');
      return;
    }

    const currentPaperSize = paperSize || PAPER_SIZES.A4_PORTRAIT;

    setIsNanoBananaExporting(true);
    setNanoBananaProgress({ 
      step: 'initialize', 
      progress: 0, 
      message: 'NanoBananaエクスポートを開始しています...' 
    });

    // 🎨 エクスポート時は一時的にライトモードに切り替え
    const originalTheme = document.documentElement.getAttribute("data-theme");
    const wasDarkMode = originalTheme === "dark";
    if (wasDarkMode) {
      document.documentElement.setAttribute("data-theme", "light");
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      const result = await nanoBananaExportService.exportForNanoBanana(
        panels,
        characters,
        bubbles,
        currentPaperSize,
        characterSettings,
        characterNames,
        nanoBananaOptions,
        setNanoBananaProgress,
        canvasRef.current || undefined  // 🆕 キャンバス要素を渡す
      );

      if (result.success && result.zipBlob) {
        // ダウンロードリンクを作成
        const url = URL.createObjectURL(result.zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // 成功メッセージ
        alert(`NanoBananaエクスポートが完了しました！\n\nファイル: ${result.filename}\nサイズ: ${(result.size / 1024).toFixed(1)} KB\n\nZIPファイルを解凍して、Google AI Studioで使用してください。`);
      } else {
        throw new Error(result.error || 'エクスポートに失敗しました');
      }
    } catch (error) {
      console.error('NanoBanana export error:', error);
      alert('NanoBananaエクスポートに失敗しました: ' + (error as Error).message);
    } finally {
      // 🎨 元のテーマに戻す
      if (wasDarkMode) {
        document.documentElement.setAttribute("data-theme", "dark");
      }
      setIsNanoBananaExporting(false);
      setTimeout(() => {
        setNanoBananaProgress(null);
        setSelectedPurpose(null);
      }, 2000);
    }
  };

  const handlePurposeClick = (purpose: ExportPurpose) => {
    // その他の場合は設定画面を開く
    if (selectedPurpose === purpose) {
      setSelectedPurpose(null);
      setPromptOutput('');
      setDebugOutput('');
      setNanoBananaProgress(null); // 🆕 追加
    } else {
      setSelectedPurpose(purpose);
      setPromptOutput('');
      setDebugOutput('');
      setNanoBananaProgress(null); // 🆕 追加
      
      if (purpose === 'nanobanana') {
        // NanoBanana用設定を適用
        setNanoBananaOptions(DEFAULT_NANOBANANA_EXPORT_OPTIONS);
      } else {
        setExportOptions({
          ...exportOptions,
          ...purposeDefaults[purpose]
        });
      }
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

    // 🎨 エクスポート時は一時的にライトモードに切り替え
    const originalTheme = document.documentElement.getAttribute("data-theme");
    const wasDarkMode = originalTheme === "dark";
    if (wasDarkMode) {
      document.documentElement.setAttribute("data-theme", "light");
      // キャンバスの再描画を待つ
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      switch (selectedPurpose) {
        case 'image':
          if (exportTemplateOnly) {
            // 番号なしオプションを渡す
            if (onRedrawTemplateOnly) {
              await onRedrawTemplateOnly(exportTemplateWithoutNumbers);
            }
            await exportService.exportTemplatePNG(canvasRef.current, panels, exportOptions, setExportProgress);
            // テンプレート出力後、元に戻す
            if (onRestoreFullCanvas) {
              await onRestoreFullCanvas();
            }
          } else {
            await exportService.exportToPNG(canvasRef.current, panels, exportOptions, setExportProgress);
          }
          
          // プロンプトも出力する場合
          if (exportPromptAlso) {
            await handlePromptExport();
          }
          break;
        case 'clipstudio':
          await exportService.exportToPSD(canvasRef.current, panels, characters, bubbles, backgrounds, effects, tones, exportOptions, setExportProgress);
          break;
      }
    } catch (error) {
      console.error('エクスポートエラー:', error);
      alert('エクスポートに失敗しました: ' + (error as Error).message);
      // エラーでも元に戻す
      if (selectedPurpose === 'image' && exportTemplateOnly && onRestoreFullCanvas) {
        await onRestoreFullCanvas();
      }
    } finally {
      // 🎨 元のテーマに戻す
      if (wasDarkMode) {
        document.documentElement.setAttribute("data-theme", "dark");
      }
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
      // 🔧 修正: 各キャラクターを座標ベースで最寄りパネルに割り当て
      const characterAssignments = new Map<number, Character[]>();
      
      // パネル初期化
      panels.forEach(panel => {
        characterAssignments.set(panel.id, []);
      });
      
      // 🔧 重要: 各キャラクターを現在の座標で判定
      characters.forEach(char => {
        console.log(`🔍 キャラクター配置判定開始:`, {
          id: char.id,
          name: char.name,
          x: char.x,
          y: char.y,
          panelId: char.panelId,
          isGlobalPosition: char.isGlobalPosition
        });
        
        const { panel, debug } = assignCharacterToNearestPanel(char, panels);
        console.log(`🔍 配置判定結果:`, debug);
        
        if (panel) {
          const panelChars = characterAssignments.get(panel.id) || [];
          panelChars.push(char);
          characterAssignments.set(panel.id, panelChars);
          
          // 🆕 デバッグログ追加
          console.log(`📍 キャラクター "${char.name}" を Panel ${panel.id} に配置 (座標: ${char.x}, ${char.y})`);
        } else {
          console.log(`❌ キャラクター "${char.name}" の配置に失敗`);
        }
      });

      setExportProgress({ step: 'processing', progress: 30, message: 'キャラクター詳細分析中...' });

      // 現在ページのみ出力の場合はフィルタ
      let filteredPanels = panels;
      let filteredCharacters = characters;
      let filteredBubbles = bubbles;
      let filteredBackgrounds = backgrounds;
      let filteredEffects = effects;
      
      if (exportCurrentPageOnly && typeof currentPageIndex === 'number' && pages) {
        const currentPage = pages[currentPageIndex];
        if (currentPage) {
          filteredPanels = currentPage.panels || [];
          const panelIds = new Set(filteredPanels.map((p: Panel) => p.id));
          filteredCharacters = (currentPage.characters || []).filter((c: Character) => panelIds.has(c.panelId));
          filteredBubbles = (currentPage.speechBubbles || []).filter((b: SpeechBubble) => panelIds.has(b.panelId));
          filteredBackgrounds = (currentPage.backgrounds || []).filter((bg: BackgroundElement) => panelIds.has(bg.panelId));
          filteredEffects = (currentPage.effects || []).filter((e: EffectElement) => panelIds.has(e.panelId));
        }
      }

      // 🔧 修正: characterAssignmentsを使ってプロジェクトデータを構築
      const project = {
        panels: filteredPanels,
        characters: filteredCharacters,
        speechBubbles: filteredBubbles,
        backgrounds: filteredBackgrounds,
        effects: filteredEffects,
        characterSettings,
        characterNames
      };

      setExportProgress({ step: 'processing', progress: 50, message: '未選択値除外プロンプト生成中...' });

      // 🔧 修正: PromptServiceに座標ベースのcharacterAssignmentsを渡す
      const promptData = promptService.generatePrompts(project, characterAssignments);
      
      setExportProgress({ step: 'processing', progress: 70, message: 'プロンプト整形中...' });

      // ページ情報を準備
      let output = '';
      
      if (exportCurrentPageOnly && typeof currentPageIndex === 'number' && pages) {
        // 現在ページのみ出力
        const currentPage = pages[currentPageIndex];
        if (currentPage) {
          const pageInfo = {
            pageIndex: currentPageIndex,
            pageTitle: currentPage.title || `Page ${currentPageIndex + 1}`
          };
          output = promptService.formatPromptOutput(promptData, filteredPanels, pageInfo, characterSettings);
        }
      } else {
        // 全ページ出力（シンプル版）
        output = "=== AI画像生成用プロンプト ===\n\n";
        
        filteredPanels.forEach((panel: Panel, panelIdx: number) => {
            output += `【Panel ${panelIdx + 1}】\n`;
            
            // デバッグ: パネルの内容を確認
            console.log(`Panel ${panelIdx + 1} データ:`, {
              note: panel.note,
              characterPrompt: panel.characterPrompt,
              actionPrompt: panel.actionPrompt,
              selectedCharacterId: panel.selectedCharacterId,
              prompt: panel.prompt,
              // キャラ設定の確認
              characterSettings: panel.selectedCharacterId ? characterSettings?.[panel.selectedCharacterId] : null
            });
            
            // Panel用メモ
            if (panel.note) {
              output += `📌 メモ: ${panel.note}\n`;
            }
            
            // 🆕 分離プロンプトシステム: キャラ＋動作を合成
            const parts: string[] = [];
            
            // キャラプロンプト取得（panel.characterPrompt or characterSettingsから）
            let charPrompt = panel.characterPrompt;
            if (!charPrompt && panel.selectedCharacterId && characterSettings?.[panel.selectedCharacterId]?.appearance?.basePrompt) {
              charPrompt = characterSettings[panel.selectedCharacterId].appearance.basePrompt;
            }
            
            if (charPrompt) {
              parts.push(charPrompt.trim());
            }
            
            if (panel.actionPrompt) {
              parts.push(panel.actionPrompt.trim());
            }
            
            if (parts.length > 0) {
              const combinedPrompt = parts.join(', ');
              output += `プロンプト: ${combinedPrompt}\n`;
            } else if (panel.prompt) {
              // フォールバック: 旧形式
              output += `プロンプト: ${panel.prompt}\n`;
            }
            
            output += '\n';
          });
        
        // Negative Prompt
        const negativePrompt = [
          'lowres', 'bad anatomy', 'bad hands', 'text', 'error',
          'worst quality', 'low quality', 'blurry', 'bad face',
          'extra fingers', 'watermark', 'signature',
          'deformed', 'mutated', 'disfigured', 'bad proportions'
        ].join(', ');
        output += `\n【Negative Prompt】\n${negativePrompt}\n`;
      }

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
    
    // プロジェクト名を取得（localStorageから）
    const projectName = localStorage.getItem('currentProjectName') || 'untitled';
    const safeProjectName = projectName.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '-');
    
    a.download = `${safeProjectName}-prompts.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const purposes = [
    {
      id: 'image' as ExportPurpose,
      icon: '🖼️',
      title: '画像出力',
      desc: 'キャラ・吹き出し・背景等すべて含むPNG'
    },
    {
      id: 'nanobanana' as ExportPurpose,
      icon: '🍌',
      title: 'NanoBanana出力',
      desc: 'Google AI Studioで完成漫画を自動生成'
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
                  </div>
                  <div style={{ 
                    fontSize: "10px", 
                    opacity: 0.7
                  }}>
                    {purpose.title}
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

                  {/* プロンプト出力設定画面（統合済み） */}
                  {false && (
                    <div>
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center",
                        marginBottom: "12px" 
                      }}>
                        <h4 style={{
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: isDarkMode ? "#10b981" : "#059669",
                          margin: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}>
                          ✅ プロンプト生成完了
                        </h4>
                        <button
                          onClick={handlePromptExport}
                          disabled={isExporting}
                          style={{
                            background: isExporting ? "#999999" : "#f59e0b",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            padding: "6px 12px",
                            fontSize: "10px",
                            fontWeight: "600",
                            cursor: isExporting ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          {isExporting ? '更新中...' : '🔄 再生成'}
                        </button>
                      </div>

                      {/* ページ出力オプション */}
                      <div style={{
                        marginBottom: "12px",
                        padding: "8px",
                        background: isDarkMode ? "#333" : "#f0f0f0",
                        borderRadius: "4px"
                      }}>
                        <label style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "11px",
                          cursor: "pointer"
                        }}>
                          <input
                            type="checkbox"
                            checked={exportCurrentPageOnly}
                            onChange={(e) => setExportCurrentPageOnly(e.target.checked)}
                          />
                          📄 現在のページのみ出力
                        </label>
                      </div>

                      <div style={{ 
                        display: "flex", 
                        justifyContent: "center",
                        marginBottom: "12px" 
                      }}>
                        <button
                          onClick={handleCopyPrompt}
                          style={{
                            background: "#10b981",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            padding: "8px 24px",
                            fontSize: "11px",
                            cursor: "pointer",
                            fontWeight: "600"
                          }}
                        >
                          📋 プロンプトコピー
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
                  
                  {/* 🍌 NanoBanana設定画面 */}
                  {selectedPurpose === 'nanobanana' && (
                    <div>

                      {/* 説明 */}
                      <div 
                        style={{
                          background: isDarkMode ? "rgba(251, 191, 36, 0.1)" : "rgba(245, 158, 11, 0.05)",
                          padding: "10px",
                          borderRadius: "4px",
                          marginBottom: "12px",
                        }}
                      >
                        <p 
                          style={{
                            fontSize: "11px",
                            color: isDarkMode ? "#fbbf24" : "#f59e0b",
                            margin: 0,
                            lineHeight: "1.6",
                            textAlign: "left"
                          }}
                        >
                          <strong>🍌 NanoBananaとは？</strong><br/>
                          Google AI Studioの画像生成機能。レイアウト＋プロンプトで一貫性のある漫画を自動生成。<br/>
                          <br/>
                          <strong>📦 出力内容：</strong><br/>
                          • layout.png（コマ割り+吹き出し）<br/>
                          • prompt.txt（キャラ・動作・セリフ）<br/>
                          • character_mapping.txt（キャラ対応表）<br/>
                          • instructions.txt（日本語ガイド）<br/>
                          <br/>
                          <strong>🎯 使い方：</strong><br/>
                          1. ZIPを解凍 → prompt.txt を開く<br/>
                          2. キャラ外見プロンプトで画像生成（SD等）<br/>
                          3. Google AI Studioを開く<br/>
                          4. キャラ画像+layout.pngをアップロード<br/>
                          5. prompt.txtをコピペして生成<br/>
                          6. セリフ・レイアウト維持で完成！<br/>
                          <br/>
                          <span style={{fontSize: "10px"}}>
                          ※詳細は NANOBANANA_GUIDE.md を参照<br/>
                          ※商用利用時はGoogleの利用規約に従ってください
                          </span>
                        </p>
                      </div>

                      {/* オプション設定 */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        
                        {/* レイアウト画像品質 */}
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
                            レイアウト画像品質
                          </label>
                          <select
                            value={nanoBananaOptions.layoutImageQuality}
                            onChange={(e) => setNanoBananaOptions({
                              ...nanoBananaOptions,
                              layoutImageQuality: e.target.value as any
                            })}
                            disabled={isNanoBananaExporting}
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
                            <option value="high">高品質（推奨）</option>
                            <option value="medium">標準</option>
                            <option value="low">軽量</option>
                          </select>
                        </div>

                        {/* プロンプト言語 */}
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
                            プロンプト言語
                          </label>
                          <select
                            value={nanoBananaOptions.promptLanguage}
                            onChange={(e) => setNanoBananaOptions({
                              ...nanoBananaOptions,
                              promptLanguage: e.target.value as any
                            })}
                            disabled={isNanoBananaExporting}
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
                            <option value="japanese">日本語（推奨）</option>
                            <option value="english">英語</option>
                            <option value="both">両方</option>
                          </select>
                        </div>

                        {/* チェックボックスオプション */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
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
                              checked={nanoBananaOptions.includeInstructions}
                              onChange={(e) => setNanoBananaOptions({
                                ...nanoBananaOptions,
                                includeInstructions: e.target.checked
                              })}
                              disabled={isNanoBananaExporting}
                              style={{ margin: 0 }}
                            />
                            使用方法ガイドを含める
                          </label>

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
                              checked={nanoBananaOptions.includeCharacterMapping}
                              onChange={(e) => setNanoBananaOptions({
                                ...nanoBananaOptions,
                                includeCharacterMapping: e.target.checked
                              })}
                              disabled={isNanoBananaExporting}
                              style={{ margin: 0 }}
                            />
                            キャラクター名対応表を含める
                          </label>
                        </div>
                      </div>

                      {/* エクスポートボタン */}
                      <button
                        onClick={handleNanoBananaExport}
                        disabled={isNanoBananaExporting || panels.length === 0}
                        style={{
                          width: "100%",
                          background: isNanoBananaExporting || panels.length === 0 ? "#999999" : "#f59e0b",
                          color: "white",
                          padding: "10px 12px",
                          borderRadius: "4px",
                          border: "none",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: isNanoBananaExporting || panels.length === 0 ? "not-allowed" : "pointer",
                          transition: "background-color 0.2s",
                          fontFamily: "inherit",
                          marginTop: "12px"
                        }}
                      >
                        {isNanoBananaExporting ? (
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
                            エクスポート中...
                          </span>
                        ) : (
                          '🍌 NanoBananaパッケージ作成'
                        )}
                      </button>

                      {/* プログレス表示 */}
                      {isNanoBananaExporting && nanoBananaProgress && (
                        <div 
                          style={{
                            marginTop: "12px",
                            background: isDarkMode ? "#404040" : "#f5f5f5",
                            padding: "10px",
                            borderRadius: "4px",
                          }}
                        >
                          <div 
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "10px",
                              marginBottom: "6px",
                              color: isDarkMode ? "#ffffff" : "#333333",
                            }}
                          >
                            <span>{nanoBananaProgress.message}</span>
                            <span style={{ fontWeight: "bold" }}>
                              {Math.round(nanoBananaProgress.progress)}%
                            </span>
                          </div>
                          {nanoBananaProgress.currentFile && (
                            <div style={{
                              fontSize: "9px",
                              color: isDarkMode ? "#cccccc" : "#666666",
                              marginBottom: "4px"
                            }}>
                              📄 {nanoBananaProgress.currentFile}
                            </div>
                          )}
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
                                background: "#f59e0b",
                                borderRadius: "2px",
                                transition: "width 0.3s",
                                width: `${nanoBananaProgress.progress}%`,
                              }}
                            />
                          </div>

                          {/* 完了時のメッセージ */}
                          {nanoBananaProgress.step === 'complete' && (
                            <div style={{
                              marginTop: "8px",
                              padding: "6px",
                              background: isDarkMode ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.05)",
                              borderRadius: "4px",
                              fontSize: "10px",
                              color: isDarkMode ? "#10b981" : "#059669",
                              textAlign: "center"
                            }}>
                              ✅ エクスポート完了！ZIPファイルをダウンロードしてください。
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  )}
                  

                  {/* 画像出力設定 */}
                  {selectedPurpose === 'image' && (
                    <>
                      <label style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "6px",
                        fontSize: "11px",
                        color: isDarkMode ? "#ffffff" : "#333333",
                        cursor: "pointer",
                        marginBottom: "8px"
                      }}>
                        <input
                          type="checkbox"
                          checked={exportTemplateOnly}
                          onChange={(e) => setExportTemplateOnly(e.target.checked)}
                          disabled={isExporting}
                          style={{ margin: 0 }}
                        />
                        📐 コマ割りのみ（枠＋番号）
                      </label>

                      {exportTemplateOnly && (
                        <label style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "6px",
                          fontSize: "11px",
                          color: isDarkMode ? "#ffffff" : "#333333",
                          cursor: "pointer",
                          marginBottom: "8px",
                          marginLeft: "16px"
                        }}>
                          <input
                            type="checkbox"
                            checked={exportTemplateWithoutNumbers}
                            onChange={(e) => setExportTemplateWithoutNumbers(e.target.checked)}
                            disabled={isExporting}
                            style={{ margin: 0 }}
                          />
                          📝 番号なし（枠のみ）
                        </label>
                      )}

                      <label style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "6px",
                        fontSize: "11px",
                        color: isDarkMode ? "#ffffff" : "#333333",
                        cursor: "pointer",
                        marginBottom: "8px"
                      }}>
                        <input
                          type="checkbox"
                          checked={exportPromptAlso}
                          onChange={async (e) => {
                            const checked = e.target.checked;
                            setExportPromptAlso(checked);
                            if (checked && !promptOutput) {
                              // チェックがONで、まだプロンプトが生成されていない場合は自動生成
                              await handlePromptExport();
                            }
                          }}
                          disabled={isExporting}
                          style={{ margin: 0 }}
                        />
                        🎨 プロンプトも出力
                      </label>

                      {/* プロンプトプレビュー（チェック時のみ表示） */}
                      {exportPromptAlso && (
                        <div style={{
                          marginBottom: "12px",
                          padding: "12px",
                          background: isDarkMode ? "#1f2937" : "#f9fafb",
                          border: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
                          borderRadius: "4px"
                        }}>
                          <div style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center",
                            marginBottom: "8px" 
                          }}>
                            <h4 style={{
                              fontSize: "11px",
                              fontWeight: "bold",
                              color: isDarkMode ? "#10b981" : "#059669",
                              margin: 0,
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}>
                              {promptOutput ? '✅ プロンプト生成完了' : '🎨 プロンプト生成中...'}
                            </h4>
                            <button
                              onClick={handlePromptExport}
                              disabled={isExporting}
                              style={{
                                background: isExporting ? "#999999" : "#f59e0b",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                padding: "4px 8px",
                                fontSize: "9px",
                                fontWeight: "600",
                                cursor: isExporting ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "2px"
                              }}
                            >
                              {isExporting ? '更新中...' : '🔄 再生成'}
                            </button>
                          </div>

                          {promptOutput && (
                            <>
                              <div style={{ 
                                display: "flex", 
                                justifyContent: "center",
                                marginBottom: "8px" 
                              }}>
                                <button
                                  onClick={handleCopyPrompt}
                                  style={{
                                    background: "#10b981",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "4px 12px",
                                    fontSize: "9px",
                                    cursor: "pointer",
                                    fontWeight: "600"
                                  }}
                                >
                                  📋 プロンプトコピー
                                </button>
                              </div>

                              <div style={{
                                background: isDarkMode ? "#111827" : "#ffffff",
                                border: `1px solid ${isDarkMode ? "#374151" : "#d1d5db"}`,
                                borderRadius: "4px",
                                padding: "8px",
                                maxHeight: "200px",
                                overflowY: "auto",
                                fontFamily: "monospace",
                                fontSize: "9px",
                                lineHeight: "1.3",
                                whiteSpace: "pre-wrap",
                                color: isDarkMode ? "#e5e7eb" : "#374151"
                              }}>
                                {promptOutput}
                              </div>
                            </>
                          )}
                        </div>
                      )}


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

                  {/* 出力ボタン（NanoBanana以外） */}
                  {selectedPurpose !== 'nanobanana' && (
                    <button
                      onClick={exportPromptAlso ? handleDownloadPrompt : handleExport}
                      disabled={isExporting || panels.length === 0 || (exportPromptAlso && !promptOutput)}
                      style={{
                        width: "100%",
                        background: isExporting || panels.length === 0 || (exportPromptAlso && !promptOutput) ? "#999999" : "#ff8833",
                        color: "white",
                        padding: "8px 12px",
                        borderRadius: "4px",
                        border: "none",
                        fontSize: "11px",
                        fontWeight: "600",
                        cursor: isExporting || panels.length === 0 || (exportPromptAlso && !promptOutput) ? "not-allowed" : "pointer",
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
                        exportPromptAlso ? '📄 プロンプトファイルダウンロード' : 'ファイルダウンロード'
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* プログレス表示（生成中のみ） */}
      {isExporting && exportProgress && (
        <div 
          style={{
            marginTop: "12px",
            background: isDarkMode ? "#404040" : "#f5f5f5",
            padding: "12px",
            borderRadius: "4px",
          }}
        >
          <div 
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "11px",
              marginBottom: "6px",
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