// src/App.tsx - v1.1.5 初期画面表示最適化版
import React, { useState, useEffect, useCallback, useMemo } from "react";
import CanvasComponent from "./components/CanvasComponent";
import CharacterDetailPanel from "./components/UI/CharacterDetailPanel";
import { Panel, Character, SpeechBubble, SnapSettings, BackgroundElement, EffectElement, ToneElement, BackgroundTemplate, CanvasSettings, DEFAULT_CANVAS_SETTINGS } from "./types";
import { templates } from "./components/CanvasArea/templates";
import { ExportPanel } from './components/UI/ExportPanel';
import { useRef } from 'react';
import "./App.css";
import { COLOR_PALETTE, getThemeColors } from './styles/colorPalette';

// 必要なimport（トーン機能含む）
import useProjectSave from './hooks/useProjectSave';
import ProjectPanel from './components/UI/ProjectPanel';
import BackgroundPanel from './components/UI/BackgroundPanel';
import EffectPanel from './components/UI/EffectPanel';
import TonePanel from './components/UI/TonePanel';
import { CharacterSettingsPanel } from './components/UI/CharacterSettingsPanel';
import { PageManager } from './components/UI/PageManager';
import { usePageManager } from './hooks/usePageManager';
import { SceneTemplatePanel } from './components/UI/SceneTemplatePanel';
import PanelTemplateSelector from './components/UI/PanelTemplateSelector';
import { PaperSizeSelectPanel } from './components/UI/PaperSizeSelectPanel';
import SnapSettingsPanel from './components/UI/SnapSettingsPanel';
import { SimpleFeedbackPanel } from './components/UI/SimpleFeedbackPanel';
import { CURRENT_CONFIG, BetaUtils } from './config/betaConfig';
import { StoryToComicModal } from './components/UI/StoryToComicModal';
import { OpenAISettingsModal } from './components/UI/OpenAISettingsModal';
import { CharacterPromptRegisterModal } from './components/UI/CharacterPromptRegisterModal';
import HelpModal from './components/UI/HelpModal';
import { openAIService } from './services/OpenAIService';

import {
  calculateScaleTransform,
  scalePanel,
  scaleCharacter,
  scaleBubble,
  scaleBackground,
  scaleEffect,
  scaleTone,
  validateScaleTransform,
  logScaleTransform
} from './utils/ScaleTransformUtils';

function App() {
  // 🔧 最適化1: 状態管理の初期化を統一・明確化
  const [selectedTemplate, setSelectedTemplate] = useState<string>("reverse_t");

  // 🔧 最適化2: 初期パネル設定の最適化
  const [panels, setPanels] = useState<Panel[]>(() => {
    // コンソールログは無効化
    const initialPanels = templates.reverse_t.panels;
    // コンソールログは無効化
    return [...initialPanels];
  });

  // 基本状態管理（最適化済み）
  const [characters, setCharacters] = useState<Character[]>([]);
  const [speechBubbles, setSpeechBubbles] = useState<SpeechBubble[]>([]);
  const [backgrounds, setBackgrounds] = useState<BackgroundElement[]>([]);
  const [effects, setEffects] = useState<EffectElement[]>([]);
  const [tones, setTones] = useState<ToneElement[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<EffectElement | null>(null);
  const [selectedTone, setSelectedTone] = useState<ToneElement | null>(null);
  const [dialogueText, setDialogueText] = useState<string>("");

  // UI状態管理（最適化済み）
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [showCharacterPanel, setShowCharacterPanel] = useState<boolean>(false);
  const [isPanelEditMode, setIsPanelEditMode] = useState<boolean>(false);
  const [showProjectPanel, setShowProjectPanel] = useState<boolean>(false);
  const [showBackgroundPanel, setShowBackgroundPanel] = useState<boolean>(false);
  const [showEffectPanel, setShowEffectPanel] = useState<boolean>(false);
  const [showTonePanel, setShowTonePanel] = useState<boolean>(false);
  const [showCharacterSettingsPanel, setShowCharacterSettingsPanel] = useState<boolean>(false);
  const [editingCharacterType, setEditingCharacterType] = useState<string>('');
  const [showPanelSelector, setShowPanelSelector] = useState<boolean>(false);
  const [showSnapSettingsPanel, setShowSnapSettingsPanel] = useState<boolean>(false);
  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>(DEFAULT_CANVAS_SETTINGS);
  const [isPaperSizePanelVisible, setIsPaperSizePanelVisible] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState<boolean>(false);

  // サイドバーの開閉状態
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState<boolean>(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(true);

  // 🔄 コマ入れ替え機能
  const [swapPanel1, setSwapPanel1] = useState<number | null>(null);
  const [swapPanel2, setSwapPanel2] = useState<number | null>(null);
  const [isSwapMode, setIsSwapMode] = useState<boolean>(false);
  const lastPanelClickRef = useRef<{ panelId: number; timestamp: number } | null>(null);

  // 🧪 ベータ版フィードバック機能
  const [showFeedbackPanel, setShowFeedbackPanel] = useState<boolean>(false);
  
  // 🤖 OpenAI連携機能
  const [showStoryToComicModal, setShowStoryToComicModal] = useState<boolean>(false);
  const [showOpenAISettingsModal, setShowOpenAISettingsModal] = useState<boolean>(false);
  const [isGeneratingFromStory, setIsGeneratingFromStory] = useState<boolean>(false);
  
  // 👤 キャラプロンプト登録
  const [showCharacterPromptRegister, setShowCharacterPromptRegister] = useState<boolean>(false);
  const [registeringCharacterId, setRegisteringCharacterId] = useState<string>('character_1');
  
  // 📖 ヘルプモーダル
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // スナップ設定の状態管理
  const [snapSettings, setSnapSettings] = useState<SnapSettings>({
    enabled: true,
    gridSize: 20,
    sensitivity: 'medium',
    gridDisplay: 'edit-only'
  });

  // 🔧 最適化3: デフォルトダークモード設定の最適化
  useEffect(() => {
    // コンソールログは無効化
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  // 🔧 初期テンプレートのスケーリング適用
  useEffect(() => {
    const { pixelWidth, pixelHeight } = canvasSettings.paperSize;
    const templateBaseWidth = 800;
    const templateBaseHeight = 600;
    
    const templateData = templates[selectedTemplate];
    if (templateData) {
      const scaledPanels = templateData.panels.map(panel => ({
        ...panel,
        x: Math.round(panel.x * pixelWidth / templateBaseWidth),
        y: Math.round(panel.y * pixelHeight / templateBaseHeight),
        width: Math.round(panel.width * pixelWidth / templateBaseWidth),
        height: Math.round(panel.height * pixelHeight / templateBaseHeight)
      }));
      setPanels(scaledPanels);
    }
  }, [canvasSettings.paperSize, selectedTemplate]);

  // 🔧 初期キャンバスサイズ設定
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const { pixelWidth, pixelHeight } = canvasSettings.paperSize;
      
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
      
      // 表示スケーリングを適用（テンプレート配置を最適化）
      const containerWidth = 1000; // 適切なサイズに調整
      const containerHeight = 700; // 高さを調整
      const displayScaleX = containerWidth / pixelWidth;
      const displayScaleY = containerHeight / pixelHeight;
      const displayScale = Math.min(displayScaleX, displayScaleY, 1);
      
      // 最小サイズを保証（適切な値に）
      const minDisplayScale = 0.7;
      const finalDisplayScale = Math.max(displayScale, minDisplayScale);
      
      canvas.style.width = `${pixelWidth * finalDisplayScale}px`;
      canvas.style.height = `${pixelHeight * finalDisplayScale}px`;
      
      // コンソールログは無効化
    }
  }, [canvasSettings]);

  // プロジェクト保存hook
  const settings = useMemo(() => ({ 
    snapEnabled: snapSettings.enabled, 
    snapSize: snapSettings.gridSize, 
    darkMode: isDarkMode 
  }), [snapSettings.enabled, snapSettings.gridSize, isDarkMode]);

  const canvasSize = useMemo(() => ({ 
    width: 800, 
    height: 600 
  }), []);

  // テンプレートカウント用memo（最適化済み）
  const backgroundTemplateCount = useMemo(() => {
    const uniqueNames = new Set(
      backgrounds
        .filter(bg => bg.name)
        .map(bg => bg.name)
    );
    return uniqueNames.size;
  }, [backgrounds]);

  const effectTemplateCount = useMemo(() => {
    const uniqueNames = new Set(effects.map(effect => effect.type));
    return uniqueNames.size;
  }, [effects]);

  // トーン機能は無効化

  // キャラクター名前管理（最適化済み）
  const [characterNames, setCharacterNames] = useState<Record<string, string>>({
    character_1: '主人公',
    character_2: 'ヒロイン',
    character_3: 'ライバル',
    character_4: '友人'
  });

  const [characterSettings, setCharacterSettings] = useState<Record<string, any>>({
    character_1: { appearance: null, role: '主人公' },
    character_2: { appearance: null, role: 'ヒロイン' },
    character_3: { appearance: null, role: 'ライバル' },
    character_4: { appearance: null, role: '友人' }
  });

  const projectSave = useProjectSave();

  // 変更検知のためのuseEffect
  useEffect(() => {
    const projectData = {
      panels,
      characters,
      bubbles: speechBubbles,
      backgrounds,
      effects,
      tones,
      canvasSize,
      settings,
      characterNames,
      characterSettings,
      canvasSettings
    };
    projectSave.checkForChanges(projectData);
  }, [panels, characters, speechBubbles, backgrounds, effects, tones, canvasSize, settings, characterNames, characterSettings, canvasSettings, projectSave]);

  const getCharacterDisplayName = useCallback((character: Character) => {
    return characterNames[character.type] || character.name || 'キャラクター';
  }, [characterNames]);

  // 機能コールバック用の状態
  const [addCharacterFunc, setAddCharacterFunc] = useState<((type: string) => void) | null>(null);
  const [addBubbleFunc, setAddBubbleFunc] = useState<((type: string, text: string) => void) | null>(null);

  // アンドゥ/リドゥ機能
  const [operationHistory, setOperationHistory] = useState<{
    characters: Character[][];
    speechBubbles: SpeechBubble[][];
    panels: Panel[][];
    backgrounds: BackgroundElement[][];
    effects: EffectElement[][];
    tones: ToneElement[][];
    currentIndex: number;
  }>({
    characters: [],
    speechBubbles: [],
    panels: [],
    backgrounds: [],
    effects: [],
    tones: [],
    currentIndex: -1,
  });
  
  // アンドゥリドゥ実行中フラグ（useRefで同期管理）
  const isUndoRedoExecutingRef = useRef(false);
  
  // 初回マウント判定用
  const isFirstMountRef = useRef(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 履歴保存の最適化 - 依存関係を文字列で管理
  const charactersSignature = useMemo(() => 
    characters.map(char => `${char.id}-${char.x}-${char.y}-${char.scale}`).join(','), 
    [characters]
  );
  
  const bubblesSignature = useMemo(() => 
    speechBubbles.map(bubble => `${bubble.id}-${bubble.x}-${bubble.y}-${bubble.width}-${bubble.height}`).join(','), 
    [speechBubbles]
  );
  
  const panelsSignature = useMemo(() => 
    panels.map(panel => `${panel.id}-${panel.x}-${panel.y}-${panel.width}-${panel.height}`).join(','), 
    [panels]
  );

  const backgroundsSignature = useMemo(() => 
    backgrounds.map(bg => `${bg.id}-${bg.x}-${bg.y}-${bg.width}-${bg.height}-${bg.opacity}`).join(','), 
    [backgrounds]
  );

  const effectsSignature = useMemo(() => 
    effects.map(effect => `${effect.id}-${effect.x}-${effect.y}-${effect.intensity}-${effect.density}`).join(','), 
    [effects]
  );

  // トーン機能は無効化

  // 履歴保存関数
  const saveToHistory = useCallback((
    newCharacters: Character[], 
    newBubbles: SpeechBubble[], 
    newPanels: Panel[],
    newBackgrounds: BackgroundElement[],
    newEffects: EffectElement[]
  ) => {
    setOperationHistory(prev => {
      // 初回保存の場合は特別処理
      if (prev.currentIndex === -1) {
        return {
          characters: [[...newCharacters]],
          speechBubbles: [[...newBubbles]],
          panels: [[...newPanels]],
          backgrounds: [[...newBackgrounds]],
          effects: [[...newEffects]],
          tones: [[]],
          currentIndex: 0,
        };
      }
      
      const newHistory = {
        characters: [...prev.characters.slice(0, prev.currentIndex + 1), [...newCharacters]],
        speechBubbles: [...prev.speechBubbles.slice(0, prev.currentIndex + 1), [...newBubbles]],
        panels: [...prev.panels.slice(0, prev.currentIndex + 1), [...newPanels]],
        backgrounds: [...prev.backgrounds.slice(0, prev.currentIndex + 1), [...newBackgrounds]],
        effects: [...prev.effects.slice(0, prev.currentIndex + 1), [...newEffects]],
        tones: [[]],
        currentIndex: prev.currentIndex + 1,
      };
      
      // 履歴上限管理
      if (newHistory.characters.length > 50) {
        newHistory.characters = newHistory.characters.slice(1);
        newHistory.speechBubbles = newHistory.speechBubbles.slice(1);
        newHistory.panels = newHistory.panels.slice(1);
        newHistory.backgrounds = newHistory.backgrounds.slice(1);
        newHistory.effects = newHistory.effects.slice(1);
        newHistory.tones = newHistory.tones.slice(1);
        newHistory.currentIndex = Math.max(0, newHistory.currentIndex - 1);
      }
      
      return newHistory;
    });
  }, []);


  // 自動履歴保存（useEffect）
  useEffect(() => {
    // 初回マウント時はスキップ
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    
    // アンドゥリドゥ実行中はスキップ
    if (isUndoRedoExecutingRef.current) {
      return;
    }
    
    // 空の状態ではスキップ
    if (characters.length === 0 && speechBubbles.length === 0 && panels.length === 0 && 
        backgrounds.length === 0 && effects.length === 0) {
      return;
    }

    // 500ms後に履歴保存（デバウンス）
    const timer = setTimeout(() => {
      saveToHistory(characters, speechBubbles, panels, backgrounds, effects);
    }, 500);

    return () => clearTimeout(timer);
  }, [charactersSignature, bubblesSignature, panelsSignature, backgroundsSignature, effectsSignature, saveToHistory]);

  // アンドゥ/リドゥ処理
  const handleUndo = useCallback(() => {
    if (operationHistory.currentIndex > 0) {
      // 実行中フラグを立てる
      isUndoRedoExecutingRef.current = true;
      
      const newIndex = operationHistory.currentIndex - 1;
      setCharacters([...operationHistory.characters[newIndex]]);
      setSpeechBubbles([...operationHistory.speechBubbles[newIndex]]);
      setPanels([...operationHistory.panels[newIndex]]);
      setBackgrounds([...operationHistory.backgrounds[newIndex]]);
      setEffects([...operationHistory.effects[newIndex]]);
      setOperationHistory(prev => ({ ...prev, currentIndex: newIndex }));
      
      // フラグをリセット（履歴保存タイムアウトより長く）
      setTimeout(() => {
        isUndoRedoExecutingRef.current = false;
      }, 600);
    }
  }, [operationHistory]);

  const handleRedo = useCallback(() => {
    if (operationHistory.currentIndex < operationHistory.characters.length - 1) {
      // 実行中フラグを立てる
      isUndoRedoExecutingRef.current = true;
      
      const newIndex = operationHistory.currentIndex + 1;
      setCharacters([...operationHistory.characters[newIndex]]);
      setSpeechBubbles([...operationHistory.speechBubbles[newIndex]]);
      setPanels([...operationHistory.panels[newIndex]]);
      setBackgrounds([...operationHistory.backgrounds[newIndex]]);
      setEffects([...operationHistory.effects[newIndex]]);
      setOperationHistory(prev => ({ ...prev, currentIndex: newIndex }));
      
      // フラグをリセット（履歴保存タイムアウトより長く）
      setTimeout(() => {
        isUndoRedoExecutingRef.current = false;
      }, 600);
    }
  }, [operationHistory]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedCharacter) {
      const newCharacters = characters.filter(char => char.id !== selectedCharacter.id);
      setCharacters(newCharacters);
      setSelectedCharacter(null);
    }
  }, [selectedCharacter, characters]);

  // キーボードイベント処理（最適化済み）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' ||
        (activeElement as HTMLElement).contentEditable === 'true'
      )) {
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handleDeleteSelected();
      }
      
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        handleRedo();
      }
      
      if (e.key === 'e' && e.ctrlKey) {
        e.preventDefault();
        setIsPanelEditMode(prev => !prev);
      }

      if (e.key === 'b' && e.ctrlKey) {
        e.preventDefault();
        setShowBackgroundPanel(prev => !prev);
      }

      if (e.key === 'f' && e.ctrlKey) {
        e.preventDefault();
        setShowEffectPanel(prev => !prev);
      }

      // トーン機能は無効化
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDeleteSelected, handleUndo, handleRedo]);

  // スナップ設定ハンドラー
  const handleSnapToggle = useCallback(() => {
    setShowSnapSettingsPanel(true);
  }, []);

  const handleSnapSettingsUpdate = useCallback((newSettings: SnapSettings) => {
    setSnapSettings(newSettings);
  }, []);


  const handleCharacterNameUpdate = useCallback((type: string, newName: string, newRole: string, appearance: any) => {
    // コンソールログは無効化
    
    setCharacterNames(prev => {
      const updated = { ...prev, [type]: newName };
      // コンソールログは無効化
      return updated;
    });
    
    setCharacterSettings(prev => {
      const updated = {
        ...prev,
        [type]: {
          appearance,
          role: newRole
        }
      };
      console.log(`⚙️ 設定更新:`, updated);
      return updated;
    });
    
    setCharacters(prev => {
      const updated = prev.map(char => {
        if (char.type === type) {
          console.log(`🔄 キャラクター更新: ${char.id} (${type}) → ${newName}`);
          return {
            ...char,
            name: newName,
            role: newRole,
            appearance,
            label: newName,
            title: newName
          };
        }
        return char;
      });
      console.log(`✅ 全キャラクター更新完了:`, updated);
      return updated;
    });
    
    console.log(`✅ キャラクター名前更新完了: ${type} → ${newName}`);
  }, []);

  // ダークモード切り替え
  const toggleTheme = useCallback(() => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute("data-theme", newTheme);
  }, [isDarkMode]);

  // 🔧 最適化5: テンプレート切り替えの最適化
  const handleTemplateClick = useCallback((template: string) => {
    console.log('🎯 Template change:', template);
    setSelectedTemplate(template);
    setSelectedCharacter(null);
    setSelectedPanel(null);
    setSelectedEffect(null);
    
    const templateData = templates[template];
    if (templateData) {
      console.log('📐 Template panels with corrected IDs:', templateData.panels);
      console.log('📐 Panel IDs:', templateData.panels.map(p => p.id));
      
      const { pixelWidth, pixelHeight } = canvasSettings.paperSize;
      const templateBaseWidth = 800;
      const templateBaseHeight = 600;
      
      const scaledPanels = templateData.panels.map(panel => ({
        ...panel,
        x: Math.round(panel.x * pixelWidth / templateBaseWidth),
        y: Math.round(panel.y * pixelHeight / templateBaseHeight),
        width: Math.round(panel.width * pixelWidth / templateBaseWidth),
        height: Math.round(panel.height * pixelHeight / templateBaseHeight)
      }));
      
    console.log('📐 Scaled panels:', scaledPanels);
    setPanels(scaledPanels);
    } else {
      console.error(`Template "${template}" not found`);
    }
    
    setCharacters([]);
    setSpeechBubbles([]);
    setBackgrounds([]);
    setEffects([]);
    
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        console.log('🔄 Canvas cleared for template change');
      }
    }
    
    console.log('✅ Template applied successfully with ratio scaling');
  }, [canvasSettings, saveToHistory]);

  // ページ管理hook
  const pageManager = usePageManager({
    panels, characters, bubbles: speechBubbles, backgrounds, effects, tones,
    onDataUpdate: ({ panels: newPanels, characters: newCharacters, bubbles: newBubbles, backgrounds: newBackgrounds, effects: newEffects, tones: newTones }) => {
      setPanels(newPanels);
      setCharacters(newCharacters);
      setSpeechBubbles(newBubbles);
      setBackgrounds(newBackgrounds);
      setEffects(newEffects);
      setTones(newTones);
    }
  });

  // キャンバス設定変更ハンドラー（最適化済み）
  const handleCanvasSettingsChange = useCallback((newSettings: CanvasSettings) => {
    const oldSettings = canvasSettings;
    
    console.log('🔄 Canvas settings change initiated:', {
      from: {
        size: oldSettings.paperSize.displayName,
        pixels: `${oldSettings.paperSize.pixelWidth}×${oldSettings.paperSize.pixelHeight}`
      },
      to: {
        size: newSettings.paperSize.displayName,
        pixels: `${newSettings.paperSize.pixelWidth}×${newSettings.paperSize.pixelHeight}`
      }
    });
    
    if (oldSettings.paperSize.pixelWidth === newSettings.paperSize.pixelWidth && 
        oldSettings.paperSize.pixelHeight === newSettings.paperSize.pixelHeight) {
      console.log('📐 Canvas size unchanged, skipping scale transform');
      setCanvasSettings(newSettings);
      return;
    }
    
    const transform = calculateScaleTransform(oldSettings, newSettings);
    
    if (!validateScaleTransform(transform)) {
      console.error('❌ Invalid scale transform, aborting canvas resize');
      return;
    }
    
    logScaleTransform(oldSettings, newSettings, transform);
    
    setCanvasSettings(newSettings);
    
    if (pageManager && pageManager.pages && pageManager.pages.length > 0) {
      const currentPageData = pageManager.currentPage;
      
      const scaledPanels = currentPageData.panels.map(panel => scalePanel(panel, transform));
      const scaledCharacters = currentPageData.characters.map(char => scaleCharacter(char, transform));
      const scaledBubbles = currentPageData.bubbles.map(bubble => scaleBubble(bubble, transform));
      const scaledBackgrounds = currentPageData.backgrounds.map(bg => scaleBackground(bg, transform));
      const scaledEffects = currentPageData.effects.map(effect => scaleEffect(effect, transform));
      // トーン機能は無効化
      
      setPanels(scaledPanels);
      setCharacters(scaledCharacters);
      setSpeechBubbles(scaledBubbles);
      setBackgrounds(scaledBackgrounds);
      setEffects(scaledEffects);
      // トーン機能は無効化
    } else {
      setPanels(prev => prev.map(panel => scalePanel(panel, transform)));
      setCharacters(prev => prev.map(char => scaleCharacter(char, transform)));
      setSpeechBubbles(prev => prev.map(bubble => scaleBubble(bubble, transform)));
      setBackgrounds(prev => prev.map(bg => scaleBackground(bg, transform)));
      setEffects(prev => prev.map(effect => scaleEffect(effect, transform)));
      // トーン機能は無効化
    }
    
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const newWidth = newSettings.paperSize.pixelWidth;
      const newHeight = newSettings.paperSize.pixelHeight;
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      const containerWidth = 1200; // 1000 → 1200 に拡大
      const containerHeight = 800; // 700 → 800 に拡大
      const displayScaleX = containerWidth / newWidth;
      const displayScaleY = containerHeight / newHeight;
      const displayScale = Math.min(displayScaleX, displayScaleY, 1);
      
      // 最小サイズを保証（適切な値に）
      const minDisplayScale = 0.8; // 0.7 → 0.8 に拡大
      const finalDisplayScale = Math.max(displayScale, minDisplayScale);
      
      canvas.style.width = `${newWidth * finalDisplayScale}px`;
      canvas.style.height = `${newHeight * finalDisplayScale}px`;
      
      console.log('🖼️ Canvas physical size updated');
      
      requestAnimationFrame(() => {
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            console.log('🔄 Canvas cleared and ready for redraw');
          }
        }
      });
    }
    
    console.log('✅ Canvas settings change completed successfully');
  }, [canvasSettings, canvasRef, pageManager]);

  // その他のハンドラー関数（既存と同様、省略）
  const getCanvasDisplayScale = useCallback(() => {
    if (!canvasRef.current) return 1;
    
    const canvas = canvasRef.current;
    const actualWidth = canvas.width;
    const displayWidth = canvas.offsetWidth;
    
    if (actualWidth === 0 || displayWidth === 0) return 1;
    
    const scale = displayWidth / actualWidth;
    return scale;
  }, [canvasRef]);

  const convertMouseToCanvasCoordinates = useCallback((mouseX: number, mouseY: number) => {
    const displayScale = getCanvasDisplayScale();
    const canvasX = mouseX / displayScale;
    const canvasY = mouseY / displayScale;
    
    return { x: Math.round(canvasX), y: Math.round(canvasY) };
  }, [getCanvasDisplayScale]);

  // キャラクター操作
  const handleCharacterClick = useCallback((charType: string) => {
    if (addCharacterFunc) {
      addCharacterFunc(charType);
    }
  }, [addCharacterFunc]);

  const handleBubbleClick = useCallback((bubbleType: string) => {
    if (addBubbleFunc) {
      const text = dialogueText || "ダブルクリックで編集";
      addBubbleFunc(bubbleType, text);
      setDialogueText("");
    }
  }, [addBubbleFunc, dialogueText]);

  // 👤 キャラプロンプト登録保存
  const handleSaveCharacterPrompt = useCallback((characterId: string, name: string, prompt: string) => {
    // キャラクター名を更新
    setCharacterNames(prev => ({
      ...prev,
      [characterId]: name
    }));

    // キャラクター設定にプロンプトを保存
    setCharacterSettings(prev => ({
      ...prev,
      [characterId]: {
        ...prev[characterId],
        appearance: {
          ...prev[characterId]?.appearance,
          basePrompt: prompt
        }
      }
    }));

    alert(`✅ ${name} のプロンプトを登録しました！`);
  }, []);

  // 🤖 OpenAI: プレビュー生成
  const handleGeneratePreview = useCallback(async (story: string, tone: string): Promise<any[]> => {
    if (!openAIService.hasApiKey()) {
      alert('OpenAI APIキーを設定してください');
      setShowOpenAISettingsModal(true);
      throw new Error('API key not set');
    }

    // 登録済みキャラ情報を準備
    const registeredCharacters = Object.entries(characterNames)
      .filter(([id, name]) => characterSettings[id]?.appearance?.basePrompt)
      .map(([id, name]) => ({
        id,
        name,
        prompt: characterSettings[id].appearance.basePrompt
      }));

    const result = await openAIService.generatePanelContent({
      story,
      panelCount: panels.length,
      tone,
      characters: registeredCharacters
    });

    if (!result.success || !result.panels) {
      throw new Error(result.error || '生成に失敗しました');
    }

    return result.panels;
  }, [panels, characterNames, characterSettings]);

  // 🤖 OpenAI: プレビュー適用
  const handleApplyPreview = useCallback((previewData: any[]) => {
    const { updatedPanels, newBubbles } = openAIService.applyPanelContent(
      panels,
      speechBubbles,
      previewData,
      characterSettings
    );

    setPanels(updatedPanels);
    setSpeechBubbles(newBubbles);
    
    alert(`✅ ${previewData.length}コマの内容を適用しました！`);
  }, [panels, speechBubbles, characterSettings]);

  // 🤖 OpenAI: 1コマ生成
  const handleGenerateSinglePanel = useCallback(async (story: string, tone: string, targetPanelId: number) => {
    if (!openAIService.hasApiKey()) {
      alert('OpenAI APIキーを設定してください');
      setShowOpenAISettingsModal(true);
      throw new Error('API key not set');
    }

    // 既存のコマ情報を取得
    const existingPanels = panels.map(panel => ({
      panelId: panel.id,
      note: panel.note || '',
      dialogue: speechBubbles.find(bubble => bubble.panelId === panel.id)?.text || '',
      actionPrompt: panel.actionPrompt || '',
      characterId: panel.selectedCharacterId
    }));

    // 登録済みキャラクター情報
    const characters = Object.entries(characterNames).map(([id, name]) => ({
      id,
      name,
      prompt: characterSettings[id]?.appearance?.basePrompt || ''
    }));

    const result = await openAIService.generateSinglePanel(
      story,
      targetPanelId,
      existingPanels,
      tone || undefined,
      characters
    );

    return result;
  }, [panels, speechBubbles, characterNames, characterSettings]);

  // 🤖 OpenAI: 1コマ適用
  const handleApplySinglePanel = useCallback((panelData: any) => {
    if (!panelData) return;

    // 選択中のコマに内容を適用
    const updatedPanels = panels.map(panel => 
      panel.id === panelData.panelId 
        ? {
            ...panel,
            note: panelData.note,
            actionPrompt: panelData.actionPrompt,
            actionPromptJa: panelData.actionPromptJa,
            selectedCharacterId: panelData.characterId
          }
        : panel
    );
    setPanels(updatedPanels);

    // セリフバブルを更新
    const updatedBubbles = speechBubbles.filter(bubble => bubble.panelId !== panelData.panelId);
    if (panelData.dialogue) {
      const bubbleTypeMap: Record<string, string> = {
        '普通': 'normal',
        '叫び': 'shout',
        '小声': 'whisper',
        '心の声': 'thought'
      };
      
      const newBubble = {
        id: Date.now().toString(),
        panelId: panelData.panelId,
        text: panelData.dialogue,
        x: 0.5,  // パネル中央（相対座標）
        y: 0.3,  // パネル上部寄り（相対座標）
        width: 0.7,  // パネル幅の70%（相対座標）
        height: 0.25, // パネル高さの25%（相対座標）
        type: bubbleTypeMap[panelData.bubbleType || '普通'] || 'normal',
        vertical: true,  // デフォルトは縦書き
        scale: 1,
        isGlobalPosition: false  // パネル相対座標を使用
      };
      
      
      updatedBubbles.push(newBubble);
    }
    setSpeechBubbles(updatedBubbles);

    alert(`✅ コマ${panelData.panelId}の内容を適用しました！`);
  }, [panels, speechBubbles]);

  const handleCharacterUpdate = useCallback((updatedCharacter: Character) => {
    setCharacters(prevCharacters => {
      const updated = prevCharacters.map(char => {
        if (char.id === updatedCharacter.id) {
          return {
            ...char,
            ...updatedCharacter,
            eyeState: (updatedCharacter as any).eyeState,
            mouthState: (updatedCharacter as any).mouthState,
            handGesture: (updatedCharacter as any).handGesture
          };
        }
        return char;
      });
      
      return updated;
    });
    
    setSelectedCharacter(updatedCharacter);
  }, []);

  const handleCharacterDelete = useCallback((characterToDelete: Character) => {
    const newCharacters = characters.filter(char => char.id !== characterToDelete.id);
    setCharacters(newCharacters);
    setSelectedCharacter(null);
  }, [characters]);

  const handleCharacterPanelClose = useCallback(() => {
    setSelectedCharacter(null);
  }, []);

  const handlePanelUpdate = useCallback((updatedPanels: Panel[]) => {
    setPanels(updatedPanels);
    // 履歴保存はonDragEndで行う（ドラッグ中の連続更新を防ぐため）
  }, []);
  

  const handlePanelAdd = useCallback((targetPanelId: string, position: 'above' | 'below' | 'left' | 'right') => {
    const targetPanel = panels.find(p => p.id.toString() === targetPanelId);
    if (!targetPanel) return;

    const maxId = Math.max(...panels.map(p => typeof p.id === 'string' ? parseInt(p.id) : p.id), 0);
    const newPanelId = maxId + 1;

    let newPanel: Panel;
    const spacing = 10;

    switch (position) {
      case 'above':
        newPanel = { id: newPanelId, x: targetPanel.x, y: targetPanel.y - targetPanel.height - spacing, width: targetPanel.width, height: targetPanel.height };
        break;
      case 'below':
        newPanel = { id: newPanelId, x: targetPanel.x, y: targetPanel.y + targetPanel.height + spacing, width: targetPanel.width, height: targetPanel.height };
        break;
      case 'left':
        newPanel = { id: newPanelId, x: targetPanel.x - targetPanel.width - spacing, y: targetPanel.y, width: targetPanel.width, height: targetPanel.height };
        break;
      case 'right':
        newPanel = { id: newPanelId, x: targetPanel.x + targetPanel.width + spacing, y: targetPanel.y, width: targetPanel.width, height: targetPanel.height };
        break;
      default:
        return;
    }

    setPanels(prevPanels => [...prevPanels, newPanel]);
    console.log(`✅ コマ追加完了: ${newPanelId} (${position})`);
  }, [panels]);

  const handlePanelDelete = useCallback((panelId: string) => {
    if (panels.length <= 1) {
      console.log(`⚠️ 最後のコマは削除できません`);
      return;
    }

    if (window.confirm(`コマ${panelId}を削除しますか？`)) {
      const panelIdNum = parseInt(panelId);
      setCharacters(prev => prev.filter(char => char.panelId !== panelIdNum));
      setSpeechBubbles(prev => prev.filter(bubble => bubble.panelId !== panelIdNum));
      setBackgrounds(prev => prev.filter(bg => bg.panelId !== panelIdNum));
      setEffects(prev => prev.filter(effect => effect.panelId !== panelIdNum));
      // トーン機能は無効化
      setPanels(prev => prev.filter(panel => panel.id !== panelIdNum));
      setSelectedPanel(null);
      setSelectedEffect(null);
      // トーン機能は無効化
      console.log(`🗑️ コマ削除: ${panelId}`);
    }
  }, [panels.length]);

  const handlePanelSplit = useCallback((panelId: number, direction: "horizontal" | "vertical") => {
    const panelToSplit = panels.find(p => p.id === panelId);
    if (!panelToSplit) return;

    const gap = 10;
    const maxId = Math.max(...panels.map(p => p.id), 0);
    const newId = maxId + 1;

    let newPanels: Panel[];
    if (direction === "horizontal") {
      const availableHeight = panelToSplit.height - gap;
      const halfHeight = availableHeight / 2;
      
      const topPanel: Panel = {
        ...panelToSplit,
        height: halfHeight,
      };
      const bottomPanel: Panel = {
        ...panelToSplit,
        id: newId,
        y: panelToSplit.y + halfHeight + gap,
        height: halfHeight,
      };
      newPanels = panels.map(p => p.id === panelId ? topPanel : p).concat([bottomPanel]);
    } else {
      const availableWidth = panelToSplit.width - gap;
      const halfWidth = availableWidth / 2;
      
      const leftPanel: Panel = {
        ...panelToSplit,
        width: halfWidth,
      };
      const rightPanel: Panel = {
        ...panelToSplit,
        id: newId,
        x: panelToSplit.x + halfWidth + gap,
        width: halfWidth,
      };
      newPanels = panels.map(p => p.id === panelId ? leftPanel : p).concat([rightPanel]);
    }

    setPanels(newPanels);
    console.log(`${direction}分割完了（隙間: ${gap}px）`);
  }, [panels]);

  // コマの入れ替え機能（サイズはそのまま、内容のみ入れ替え）
  const handlePanelSwap = useCallback((panelId1: number, panelId2: number) => {
    const panel1 = panels.find(p => p.id === panelId1);
    const panel2 = panels.find(p => p.id === panelId2);
    
    if (!panel1 || !panel2) return;

    const swappedPanel1: Panel = {
      ...panel1,
      note: panel2.note,
      prompt: panel2.prompt,
      characterPrompt: panel2.characterPrompt,
      actionPrompt: panel2.actionPrompt,
      actionPromptJa: panel2.actionPromptJa,
      selectedCharacterId: panel2.selectedCharacterId
    };

    const swappedPanel2: Panel = {
      ...panel2,
      note: panel1.note,
      prompt: panel1.prompt,
      characterPrompt: panel1.characterPrompt,
      actionPrompt: panel1.actionPrompt,
      actionPromptJa: panel1.actionPromptJa,
      selectedCharacterId: panel1.selectedCharacterId
    };

    setPanels(prev => prev.map(panel => {
      if (panel.id === panelId1) return swappedPanel1;
      if (panel.id === panelId2) return swappedPanel2;
      return panel;
    }));

    console.log(`🔄 コマ ${panelId1} と ${panelId2} の内容を入れ替えました`);
  }, [panels]);

  const handleClearAll = useCallback(() => {
    if (window.confirm("全ての要素をクリアしますか？")) {
      setCharacters([]);
      setSpeechBubbles([]);
      setBackgrounds([]);
      setEffects([]);
      // トーン機能は無効化
      setSelectedCharacter(null);
      setSelectedPanel(null);
      setSelectedEffect(null);
      // トーン機能は無効化
    }
  }, []);

  const handleExport = useCallback((format: string) => {
    alert(`${format}でのエクスポート機能は実装予定です`);
  }, []);

  const handleCharacterRightClick = useCallback((e: React.MouseEvent, charType: string) => {
    e.preventDefault();
    setEditingCharacterType(charType);
    setShowCharacterSettingsPanel(true);
  }, []);

  const handleCanvasCharacterRightClick = useCallback((character: Character) => {
    setSelectedCharacter(character);
    setShowCharacterPanel(true);
  }, []);

  const handlePanelEditModeToggle = (enabled: boolean) => {
    setIsPanelEditMode(enabled);
  };

  const handleBackgroundAdd = useCallback((template: BackgroundTemplate) => {
    console.log(`背景テンプレート「${template.name}」を適用しました`);
  }, []);

  const handleEffectAdd = useCallback((effect: EffectElement) => {
    setEffects([...effects, effect]);
    setSelectedEffect(effect);
    console.log(`効果線「${effect.type}」を追加しました`);
  }, [effects]);

  const handleEffectUpdate = useCallback((updatedEffect: EffectElement) => {
    setEffects(prev => prev.map(effect => 
      effect.id === updatedEffect.id ? updatedEffect : effect
    ));
    setSelectedEffect(updatedEffect);
  }, []);

  // トーン機能は無効化

  const handleCharacterSettingsUpdate = useCallback((characterData: any) => {
    const { name, role, appearance } = characterData;
    handleCharacterNameUpdate(editingCharacterType, name || characterNames[editingCharacterType], role || characterSettings[editingCharacterType].role, appearance);
  }, [editingCharacterType, characterNames, characterSettings, handleCharacterNameUpdate]);

  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
      {/* ヘッダー */}
      <header className="header">
        <h1>📖 AI漫画ネームメーカー</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button 
            className="control-btn"
            onClick={() => setShowHelpModal(true)}
            title="使い方ガイド"
            style={{
              background: '#3498db',
              color: "white",
              border: '1px solid #3498db',
              fontWeight: "bold"
            }}
          >
            📖 使い方ガイド
          </button>

          <div style={{ width: "1px", height: "24px", background: "var(--border-color)" }}></div>

          <button 
            className="control-btn"
            onClick={async () => {
              if (!projectSave.currentProjectId || !projectSave.currentProjectName) {
                alert('保存されているプロジェクトがありません。「📁 プロジェクト管理」から「名前を付けて保存」してください。');
                return;
              }
              
              try {
                const projectData = {
                  panels,
                  characters,
                  bubbles: speechBubbles,
                  backgrounds,
                  effects,
                  tones,
                  canvasSize,
                  settings,
                  characterNames,
                  characterSettings,
                  canvasSettings
                };
                
                const success = await projectSave.saveProject(projectData);
                if (success) {
                  alert(`プロジェクト「${projectSave.currentProjectName}」を上書き保存しました`);
                } else {
                  alert('保存に失敗しました');
                }
              } catch (error) {
                console.error('保存エラー:', error);
                alert('保存中にエラーが発生しました');
              }
            }}
            title={projectSave.currentProjectName ? `上書き保存: ${projectSave.currentProjectName}` : "上書き保存（プロジェクト未保存）"}
            style={{
              background: projectSave.currentProjectId ? COLOR_PALETTE.buttons.save.primary : '#9ca3af',
              color: "white",
              border: `1px solid ${projectSave.currentProjectId ? COLOR_PALETTE.buttons.save.primary : '#9ca3af'}`,
              fontWeight: "bold",
              cursor: projectSave.currentProjectId ? 'pointer' : 'not-allowed'
            }}
          >
            💾 {projectSave.currentProjectName ? `上書き: ${projectSave.currentProjectName}` : "上書き保存"}
          </button>

          <button 
            className="control-btn"
            onClick={() => setShowProjectPanel(true)}
            title="プロジェクト管理"
            style={{
              background: COLOR_PALETTE.buttons.manage.primary,
              color: "white",
              border: `1px solid ${COLOR_PALETTE.buttons.manage.primary}`,
              fontWeight: "bold"
            }}
          >
            📁 プロジェクト管理
          </button>

          <div style={{ width: "1px", height: "24px", background: "var(--border-color)" }}></div>

          <button 
            className="control-btn"
            onClick={() => setShowExportPanel(true)}
            title="プロンプト出力"
            style={{
              background: COLOR_PALETTE.buttons.export.primary,
              color: "white",
              border: `1px solid ${COLOR_PALETTE.buttons.export.primary}`,
              fontWeight: "bold"
            }}
          >
            📤 出力
          </button>

          <div style={{ width: "1px", height: "24px", background: "var(--border-color)" }}></div>

          <button 
            className={`control-btn ${snapSettings.enabled ? 'active' : ''}`}
            onClick={handleSnapToggle}
            title="スナップ設定"
            style={{
              background: snapSettings.enabled ? COLOR_PALETTE.buttons.success.primary : "var(--bg-tertiary)",
              color: snapSettings.enabled ? "white" : "var(--text-primary)",
              border: `1px solid ${snapSettings.enabled ? COLOR_PALETTE.buttons.success.primary : "var(--border-color)"}`,
            }}
          >
            ⚙️ スナップ
          </button>
          
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            title={`${isDarkMode ? 'ライト' : 'ダーク'}モードに切り替え`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          
          {/* 🧪 ベータ版フィードバックボタン */}
          {CURRENT_CONFIG.isBetaVersion && (
            <button 
              className="feedback-button"
              onClick={() => setShowFeedbackPanel(true)}
              title="ベータ版フィードバックを送信"
              style={{
                padding: "8px 12px",
                backgroundColor: COLOR_PALETTE.primary.orange,
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                marginLeft: "8px"
              }}
            >
              🧪 フィードバック
            </button>
          )}
        </div>
      </header>

      <PageManager
        currentPage={pageManager.currentPage}
        pages={pageManager.pages}
        currentPageIndex={pageManager.currentPageIndex}
        onPageChange={pageManager.switchToPage}
        onPageAdd={pageManager.addPage}
        onPageDelete={pageManager.deletePage}
        onPageDuplicate={pageManager.duplicatePage}
        onPageRename={pageManager.renamePage}
        onPageReorder={pageManager.reorderPages}
        onCurrentPageUpdate={pageManager.updateCurrentPageData}
        isDarkMode={isDarkMode}
      />

      <div className="main-content">
        {!isLeftSidebarOpen && (
          <button
            onClick={() => setIsLeftSidebarOpen(true)}
            style={{
              position: 'fixed',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '12px 8px',
              background: 'var(--accent-color)',
              color: 'white',
              border: 'none',
              borderRadius: '0 6px 6px 0',
              cursor: 'pointer',
              zIndex: 100,
              fontSize: '16px'
            }}
          >
            ▶
          </button>
        )}
        
        {isLeftSidebarOpen && (
        <div className="sidebar left-sidebar">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>🛠️ ツール</h3>
            <button
              onClick={() => setIsLeftSidebarOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '4px 8px'
              }}
            >
              ◀
            </button>
          </div>
          <div className="section">
            <h3>📐 パネルテンプレート</h3>
            <button 
              className="control-btn"
              onClick={() => setShowPanelSelector(true)}
              style={{
                width: "100%",
                padding: "12px",
                background: "var(--accent-color)",
                color: "white",
                border: "none",
                borderRadius: "6px"
              }}
            >
              🎯 コマ割りを選択 ({Object.keys(templates).length}種類)
            </button>
            <div className="section-info">
              ✨ コマ数別に分類された使いやすいテンプレート集
            </div>
          </div>

          {/* キャラクター登録セクション */}
          <div className="section">
            <h3>👤 キャラクター登録</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {Object.entries(characterNames).map(([id, name]) => (
                <button
                  key={id}
                  onClick={() => {
                    setRegisteringCharacterId(id);
                    setShowCharacterPromptRegister(true);
                  }}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                    textAlign: "left",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <span>{name}</span>
                  <span style={{ fontSize: "10px", opacity: 0.7 }}>
                    {characterSettings[id]?.appearance?.basePrompt ? '✅' : '未登録'}
                  </span>
                </button>
              ))}
            </div>
            <div className="section-info" style={{ marginTop: "8px" }}>
              💡 プロンプトを登録すると使い回せます
            </div>
          </div>

          <div className="section">
            <h3>📐 用紙サイズ</h3>
            <button
              onClick={() => setIsPaperSizePanelVisible(true)}
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              📄 {canvasSettings.paperSize.displayName}
            </button>
          </div>

          {/* SceneTemplatePanel非表示 - シンプルなネームツールに集中 */}
        </div>
        )}

        {/* メインエリア */}
        <div className="canvas-area">
          <div className="canvas-controls">
            <div className="undo-redo-buttons">
              <button 
                className="control-btn"
                onClick={handleUndo}
                disabled={operationHistory.currentIndex <= 0 || operationHistory.characters.length === 0}
                title="元に戻す (Ctrl+Z)"
              >
                ↶ 戻す
              </button>
              <button 
                className="control-btn"
                onClick={handleRedo}
                disabled={operationHistory.currentIndex >= operationHistory.characters.length - 1 || operationHistory.characters.length === 0}
                title="やり直し (Ctrl+Y)"
              >
                ↷ 進む
              </button>
              <button 
                className="control-btn delete-btn"
                onClick={handleDeleteSelected}
                disabled={!selectedCharacter}
                title="選択要素を削除 (Backspace)"
              >
                🗑️ 削除
              </button>
            </div>
            <div className="canvas-info">
              操作履歴: {operationHistory.currentIndex + 1} / {Math.max(1, operationHistory.characters.length)}
              {selectedCharacter && <span> | 選択中: {getCharacterDisplayName(selectedCharacter)}</span>}
              {selectedPanel && <span> | パネル{selectedPanel.id}選択中</span>}
              {selectedEffect && <span> | 効果線選択中</span>}
              {/* トーン機能は無効化 */}
              {isPanelEditMode && <span> | 🔧 コマ編集モード</span>}
              {snapSettings.enabled && <span> | ⚙️ スナップ: {snapSettings.gridSize}px ({snapSettings.sensitivity})</span>}
              {projectSave.isAutoSaving && <span> | 💾 自動保存中...</span>}
              {projectSave.hasUnsavedChanges && <span> | ⚠️ 未保存</span>}
              {backgrounds.length > 0 && <span> | 🎨 背景: {backgrounds.length}個</span>}
              {effects.length > 0 && <span> | ⚡ 効果線: {effects.length}個</span>}
              {/* トーン機能は無効化 */}
            </div>
          </div>

          <CanvasComponent
            ref={canvasRef}
            selectedTemplate={selectedTemplate}
            panels={panels}
            setPanels={handlePanelUpdate}
            characters={characters}
            setCharacters={setCharacters}
            speechBubbles={speechBubbles}
            setSpeechBubbles={setSpeechBubbles}
            backgrounds={backgrounds}
            setBackgrounds={setBackgrounds}
            effects={effects}
            setEffects={setEffects}
            tones={tones}
            setTones={setTones}
            selectedTone={selectedTone}
            onToneSelect={setSelectedTone}
            showTonePanel={showTonePanel}
            onTonePanelToggle={() => setShowTonePanel(!showTonePanel)}
            characterNames={characterNames}
            onCharacterAdd={(func: (type: string) => void) => setAddCharacterFunc(() => func)}
            onBubbleAdd={(func: (type: string, text: string) => void) => setAddBubbleFunc(() => func)}
            onPanelSelect={(panel: Panel | null) => {
              if (isSwapMode && panel) {
                const now = Date.now();
                if (lastPanelClickRef.current && 
                    lastPanelClickRef.current.panelId === panel.id && 
                    now - lastPanelClickRef.current.timestamp < 300) {
                  console.log('⏭️ 重複クリック無視');
                  return;
                }
                lastPanelClickRef.current = { panelId: panel.id, timestamp: now };
                
                console.log('🔄 入れ替えモード: コマクリック', { 
                  panelId: panel.id, 
                  currentSwap1: swapPanel1, 
                  currentSwap2: swapPanel2 
                });
                
                setSwapPanel1((prev1) => {
                  const currentSwap2 = swapPanel2;
                  
                  if (panel.id === prev1) {
                    console.log('❌ 1番目のコマを選択解除');
                    return null;
                  } else if (panel.id === currentSwap2) {
                    console.log('❌ 2番目のコマを選択解除');
                    setSwapPanel2(null);
                    return prev1;
                  } else if (!prev1) {
                    console.log('✅ 1番目のコマを選択:', panel.id);
                    return panel.id;
                  } else if (prev1 && !currentSwap2) {
                    console.log('✅ 2番目のコマを選択:', panel.id);
                    setSwapPanel2(panel.id);
                    return prev1;
                  }
                  return prev1;
                });
                return;
              }
              setSelectedPanel(panel);
            }}
            onCharacterSelect={(character: Character | null) => setSelectedCharacter(character)}
            onCharacterRightClick={handleCanvasCharacterRightClick}
            isPanelEditMode={isPanelEditMode}
            onPanelSplit={handlePanelSplit}
            onPanelEditModeToggle={handlePanelEditModeToggle}
            onPanelAdd={handlePanelAdd}
            onPanelDelete={handlePanelDelete}
            snapSettings={snapSettings}
            swapPanel1={swapPanel1}
            swapPanel2={swapPanel2}
          />
        </div>

        {!isRightSidebarOpen && (
          <button
            onClick={() => setIsRightSidebarOpen(true)}
            style={{
              position: 'fixed',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '12px 8px',
              background: 'var(--accent-color)',
              color: 'white',
              border: 'none',
              borderRadius: '6px 0 0 6px',
              cursor: 'pointer',
              zIndex: 100,
              fontSize: '16px'
            }}
          >
            ◀
          </button>
        )}

        {isRightSidebarOpen && (
        <div className="sidebar right-sidebar">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>⚙️ 設定</h3>
            <button
              onClick={() => setIsRightSidebarOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '4px 8px'
              }}
            >
              ▶
            </button>
          </div>

          {/* ページ全体メモ */}
          <div className="section">
            <h3>📄 ページ設定</h3>
            
            <div style={{ marginBottom: "12px" }}>
              <label style={{
                fontSize: "11px",
                fontWeight: "bold",
                color: "var(--text-primary)",
                display: "block",
                marginBottom: "4px"
              }}>
                📝 ページメモ（構成・展開・意図）
              </label>
              <textarea
                value={pageManager.currentPage.note || ''}
                onChange={(e) => {
                  pageManager.updateCurrentPageData({
                    note: e.target.value
                  });
                }}
                placeholder="例: 導入シーン、主人公の決意を描く"
                style={{
                  width: '100%',
                  minHeight: '60px',
                  padding: '8px',
                  fontSize: '12px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  resize: 'vertical'
                }}
              />
              <div style={{ 
                fontSize: "10px", 
                color: "var(--text-muted)", 
                marginTop: "4px" 
              }}>
                このページ全体の役割や構成メモを記録
              </div>
            </div>
          </div>

          <div className="section">
            <h3>🤖 AI自動生成</h3>
            
            {/* AI生成 */}
            <button
              onClick={() => {
                if (!openAIService.hasApiKey()) {
                  if (window.confirm('OpenAI APIキーが未設定です。設定画面を開きますか？')) {
                    setShowOpenAISettingsModal(true);
                  }
                } else if (panels.length === 0) {
                  alert('先にコマ割りテンプレートを選択してください');
                } else {
                  setShowStoryToComicModal(true);
                }
              }}
              disabled={panels.length === 0}
              style={{
                width: '100%',
                padding: '12px',
                background: panels.length === 0 ? '#999' : COLOR_PALETTE.buttons.export.primary,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: panels.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                marginBottom: '8px'
              }}
            >
              📖 話からコマ内容を生成
            </button>

            <button
              onClick={() => setShowOpenAISettingsModal(true)}
              style={{
                width: '100%',
                padding: '8px',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              🔑 APIキー設定
            </button>
            <div style={{
              fontSize: "10px",
              color: "var(--text-muted)",
              padding: "6px 8px",
              background: "var(--bg-secondary)",
              borderRadius: "4px",
              marginTop: "8px"
            }}>
              💡 先にコマ割りを選択→話を入力→各コマに自動配置
                </div>
          </div>

          {/* プロンプト入力セクション（コマ設定）をAI生成の直後に配置 */}
          {selectedPanel && (
            <div className="section">
              <h3>📝 コマ {selectedPanel.id}</h3>
              
              {/* コマ重要度マーカー */}
              <div style={{ marginBottom: "12px" }}>
                <label style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  color: "var(--text-primary)",
                  display: "block",
                  marginBottom: "6px"
                }}>
                  ⭐ 重要度
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[
                    { value: 'normal', label: '通常', color: '#6b7280', emoji: '○' },
                    { value: 'important', label: '重要', color: '#f59e0b', emoji: '⭐' },
                    { value: 'climax', label: '見せ場', color: '#ef4444', emoji: '🔥' }
                  ].map(({ value, label, color, emoji }) => (
                    <button
                      key={value}
                      onClick={() => {
                        const updatedPanels = panels.map(p =>
                          p.id === selectedPanel.id
                            ? { ...p, importance: value as 'normal' | 'important' | 'climax' }
                            : p
                        );
                        setPanels(updatedPanels);
                        setSelectedPanel({ ...selectedPanel, importance: value as 'normal' | 'important' | 'climax' });
                      }}
                      style={{
                        flex: 1,
                        padding: "8px",
                        fontSize: "11px",
                        borderRadius: "4px",
                        border: `2px solid ${(selectedPanel.importance || 'normal') === value ? color : 'var(--border-color)'}`,
                        background: (selectedPanel.importance || 'normal') === value ? color : 'var(--bg-primary)',
                        color: (selectedPanel.importance || 'normal') === value ? 'white' : 'var(--text-primary)',
                        cursor: "pointer",
                        fontWeight: (selectedPanel.importance || 'normal') === value ? 'bold' : 'normal'
                      }}
                    >
                      {emoji} {label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* コマメモ */}
              <div style={{ marginBottom: "12px" }}>
                <label style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  color: "var(--text-primary)",
                  display: "block",
                  marginBottom: "4px"
                }}>
                  📌 メモ（構図・シーン説明）
                </label>
                <textarea
                  value={selectedPanel.note || ''}
                  onChange={(e) => {
                    const updatedPanels = panels.map(p =>
                      p.id === selectedPanel.id
                        ? { ...p, note: e.target.value }
                        : p
                    );
                    setPanels(updatedPanels);
                    setSelectedPanel({ ...selectedPanel, note: e.target.value });
                  }}
                  placeholder="例: リナ驚く、サユ笑顔でツッコミ"
                  style={{
                    width: '100%',
                    minHeight: '50px',
                    padding: '8px',
                    fontSize: '12px',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* キャラクター選択＋プロンプト表示 */}
              <div style={{ marginBottom: "12px" }}>
                <label style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  color: "var(--text-primary)",
                  display: "block",
                  marginBottom: "4px"
                }}>
                  👤 使用キャラクター
                </label>
                
                <select
                  value={selectedPanel.selectedCharacterId || ''}
                  onChange={(e) => {
                    const charId = e.target.value;
                    const updatedPanels = panels.map(p =>
                      p.id === selectedPanel.id
                        ? { ...p, selectedCharacterId: charId }
                        : p
                    );
                    setPanels(updatedPanels);
                    setSelectedPanel({ ...selectedPanel, selectedCharacterId: charId });
                    
                    // キャラ設定からプロンプトを自動取得
                    if (charId && characterSettings[charId]?.appearance?.basePrompt) {
                      const basePrompt = characterSettings[charId].appearance.basePrompt;
                      const updatedPanelsWithPrompt = panels.map(p =>
                        p.id === selectedPanel.id
                          ? { ...p, selectedCharacterId: charId, characterPrompt: basePrompt }
                          : p
                      );
                      setPanels(updatedPanelsWithPrompt);
                      setSelectedPanel({ 
                        ...selectedPanel, 
                        selectedCharacterId: charId,
                        characterPrompt: basePrompt 
                      });
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '12px',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}
                >
                  <option value="">（キャラなし）</option>
                  {Object.entries(characterNames).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>

                {/* キャラプロンプト表示（読み取り専用的に） */}
                {selectedPanel.characterPrompt && (
                  <div style={{
                    padding: '8px',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    background: isDarkMode ? '#1a1a1a' : '#f8f8f8',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    maxHeight: '60px',
                    overflowY: 'auto',
                    lineHeight: '1.4'
                  }}>
                    {selectedPanel.characterPrompt}
            </div>
                )}
                
            <div style={{
                  fontSize: "10px",
                  color: "var(--text-muted)",
                  padding: "4px 8px",
                  background: "var(--bg-secondary)",
                  borderRadius: "4px",
                  marginTop: "4px"
                }}>
                  💡 左サイドバーでキャラ登録→選択で自動入力
                </div>
              </div>

              {/* 動作プロンプト（自動生成） */}
              <div>
                <label style={{
                  fontSize: "11px", 
                  fontWeight: "bold",
                  color: "var(--text-primary)",
                  display: "block",
                  marginBottom: "4px"
                }}>
                  🎬 動作・シチュエーション
                </label>
                
                {/* AI生成用の入力欄 */}
                <div style={{ marginBottom: '8px' }}>
                  <input
                    type="text"
                    placeholder="例: 驚いた表情で振り向く"
                    id={`action-input-${selectedPanel.id}`}
                    style={{
                      width: '100%',
                      padding: '8px',
                      fontSize: '12px',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      marginBottom: '6px'
                    }}
                  />
                  <button
                    onClick={async () => {
                      const input = document.getElementById(`action-input-${selectedPanel.id}`) as HTMLInputElement;
                      const description = input?.value?.trim();
                      
                      if (!description) {
                        alert('動作・シチュエーションの説明を入力してください');
                        return;
                      }

                      if (!openAIService.hasApiKey()) {
                        if (window.confirm('OpenAI APIキーが未設定です。設定画面を開きますか？')) {
                          setShowOpenAISettingsModal(true);
                        }
                        return;
                      }

                      try {
                        setIsGeneratingFromStory(true);
                        
                        const actionPrompt: { prompt: string; promptJa: string } = await openAIService.generateActionPrompt(description);
                        
                        if (actionPrompt) {
                          const updatedPanels = panels.map(p =>
                            p.id === selectedPanel.id
                              ? { ...p, actionPrompt: actionPrompt.prompt, actionPromptJa: description }
                              : p
                          );
                          setPanels(updatedPanels);
                          setSelectedPanel({ 
                            ...selectedPanel, 
                            actionPrompt: actionPrompt.prompt,
                            actionPromptJa: description
                          });
                          
                          // 入力欄をクリア
                          if (input) input.value = '';
                        }
                      } catch (error) {
                        console.error('Action prompt generation error:', error);
                        alert('動作プロンプト生成に失敗しました: ' + (error as Error).message);
                      } finally {
                        setIsGeneratingFromStory(false);
                      }
                    }}
                    disabled={isGeneratingFromStory}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: isGeneratingFromStory ? '#999' : COLOR_PALETTE.buttons.export.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isGeneratingFromStory ? 'not-allowed' : 'pointer',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}
                  >
                    {isGeneratingFromStory ? '🤖 生成中...' : '🎬 プロンプト生成'}
                  </button>
                </div>

                <textarea
                  value={selectedPanel.actionPrompt || ''}
                  onChange={(e) => {
                    const updatedPanels = panels.map(p =>
                      p.id === selectedPanel.id
                        ? { ...p, actionPrompt: e.target.value }
                        : p
                    );
                    setPanels(updatedPanels);
                    setSelectedPanel({ ...selectedPanel, actionPrompt: e.target.value });
                  }}
                  placeholder="動作・表情・構図（OpenAI自動生成 or 手動入力）"
                  style={{
                    width: '100%',
                    minHeight: '60px',
                    padding: '8px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    resize: 'vertical'
                  }}
                />
                
                {/* 日本語説明表示 */}
                {(selectedPanel as any).actionPromptJa && (
                  <div style={{
                    fontSize: "11px",
                    color: isDarkMode ? "#fbbf24" : "#d97706",
                    padding: "6px 8px",
                    background: isDarkMode ? "#2d2520" : "#fef3c7",
                    border: `1px solid ${isDarkMode ? "#92400e" : "#fbbf24"}`,
                    borderRadius: "4px",
                    marginTop: "6px",
                    lineHeight: "1.5"
                  }}>
                    💬 日本語: {(selectedPanel as any).actionPromptJa}
                  </div>
                )}
                
                <div style={{
                  fontSize: "10px",
                  color: "var(--text-muted)",
                  padding: "4px 8px",
                  background: "var(--bg-secondary)",
                  borderRadius: "4px",
                  marginTop: "4px"
                }}>
                  💡 最終プロンプト = キャラ + 動作で自動合成
                </div>
              </div>

              {/* コマ編集操作 */}
              {isPanelEditMode && (
                <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border-color)" }}>
                  <h4 style={{ fontSize: "12px", marginBottom: "8px", color: "var(--text-primary)" }}>
                    🔧 コマ編集操作
                  </h4>
                  <button 
                    className="btn btn-secondary"
                    onClick={handleClearAll}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: COLOR_PALETTE.buttons.delete.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginBottom: '8px'
                    }}
                  >
                    🧹 全クリア
                  </button>
                  <div style={{ 
                    fontSize: "10px", 
                    color: "var(--text-muted)",
                    padding: "8px",
                    background: "var(--bg-secondary)",
                    borderRadius: "4px",
                    lineHeight: "1.4",
                  }}>
                    <strong>操作方法:</strong><br/>
                    • 🔵 移動: 中央ハンドルをドラッグ<br/>
                    • 🟧 リサイズ: 四隅のハンドル<br/>
                    • ✂️ 分割: 分割アイコンをクリック<br/>
                    • 🗑️ 削除: 削除アイコンをクリック
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="section">
            <h3>💬 セリフ・吹き出し</h3>
            <div className="bubble-types">
              {[
                { id: 'normal', icon: '💬', name: '普通' },
                { id: 'shout', icon: '❗', name: '叫び' },
                { id: 'whisper', icon: '💭', name: '小声' },
                { id: 'thought', icon: '☁️', name: '心の声' }
              ].map(bubble => (
                <div 
                  key={bubble.id}
                  className="bubble-btn"
                  onClick={() => handleBubbleClick(bubble.name)}
                >
                  {bubble.icon} {bubble.name}
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h3>🔧 編集</h3>
            <button 
              className={`control-btn ${isPanelEditMode ? 'active' : ''}`}
              onClick={() => setIsPanelEditMode(!isPanelEditMode)}
              style={{
                width: "100%",
                padding: "10px",
                background: isPanelEditMode ? COLOR_PALETTE.buttons.edit.primary : "var(--bg-secondary)",
                color: isPanelEditMode ? "white" : "var(--text-primary)",
                border: `1px solid ${isPanelEditMode ? COLOR_PALETTE.buttons.edit.primary : "var(--border-color)"}`,
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "bold"
              }}
            >
              {isPanelEditMode ? "✅ 編集モード中" : "🔧 コマ編集モード"}
            </button>
            <div style={{
              fontSize: "10px",
              color: "var(--text-muted)",
              padding: "8px",
              background: "var(--bg-tertiary)",
              borderRadius: "4px",
              marginTop: "8px",
              lineHeight: "1.4"
            }}>
              💡 コマをクリック→ハンドルで移動・リサイズ・分割
            </div>
          </div>

          <div className="section">
            <h3>🎨 装飾</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button 
                className="control-btn"
                onClick={() => setShowBackgroundPanel(true)}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: backgroundTemplateCount > 0 ? COLOR_PALETTE.buttons.export.primary : "var(--bg-secondary)",
                  color: backgroundTemplateCount > 0 ? "white" : "var(--text-primary)",
                  border: `1px solid ${backgroundTemplateCount > 0 ? COLOR_PALETTE.buttons.export.primary : "var(--border-color)"}`,
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "13px"
                }}
              >
                🎨 背景
                {backgroundTemplateCount > 0 && <span style={{ marginLeft: "4px" }}>({backgroundTemplateCount})</span>}
              </button>

              <button 
                className="control-btn"
                onClick={() => setShowEffectPanel(true)}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: effectTemplateCount > 0 ? COLOR_PALETTE.primary.red : "var(--bg-secondary)",
                  color: effectTemplateCount > 0 ? "white" : "var(--text-primary)",
                  border: `1px solid ${effectTemplateCount > 0 ? COLOR_PALETTE.primary.red : "var(--border-color)"}`,
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "13px"
                }}
              >
                ⚡ 効果線
                {effectTemplateCount > 0 && <span style={{ marginLeft: "4px" }}>({effectTemplateCount})</span>}
              </button>
          </div>
        </div>

          {panels.length > 1 && (
          <div className="section">
              <h3>🔄 コマ操作</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <button
                  onClick={() => {
                    setIsSwapMode(!isSwapMode);
                    if (isSwapMode) {
                      setSwapPanel1(null);
                      setSwapPanel2(null);
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: isSwapMode ? COLOR_PALETTE.buttons.delete.primary : COLOR_PALETTE.buttons.save.primary,
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "bold"
                  }}
                >
                  {isSwapMode ? "❌ 入れ替えモード終了" : "🔄 コマ入れ替えモード"}
                </button>

                {isSwapMode && (
                  <>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <div style={{
                        flex: 1,
                        padding: "8px",
                        background: swapPanel1 ? COLOR_PALETTE.buttons.success.primary : "#f3f4f6",
                        color: swapPanel1 ? "white" : "#374151",
                        border: `2px solid ${swapPanel1 ? COLOR_PALETTE.buttons.success.primary : "#d1d5db"}`,
                        borderRadius: "6px",
                        textAlign: "center",
                        fontSize: "12px",
                        fontWeight: "bold"
                      }}>
                        1️⃣ {swapPanel1 ? `コマ ${swapPanel1}` : "未選択"}
                      </div>
                      <div style={{
                        flex: 1,
                        padding: "8px",
                        background: swapPanel2 ? COLOR_PALETTE.buttons.success.primary : "#f3f4f6",
                        color: swapPanel2 ? "white" : "#374151",
                        border: `2px solid ${swapPanel2 ? COLOR_PALETTE.buttons.success.primary : "#d1d5db"}`,
                        borderRadius: "6px",
                        textAlign: "center",
                        fontSize: "12px",
                        fontWeight: "bold"
                      }}>
                        2️⃣ {swapPanel2 ? `コマ ${swapPanel2}` : "未選択"}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (swapPanel1 && swapPanel2 && swapPanel1 !== swapPanel2) {
                          handlePanelSwap(swapPanel1, swapPanel2);
                          setSwapPanel1(null);
                          setSwapPanel2(null);
                          setIsSwapMode(false);
                        } else {
                          alert('異なる2つのコマを選択してください');
                        }
                      }}
                      disabled={!swapPanel1 || !swapPanel2 || swapPanel1 === swapPanel2}
                      style={{
                        width: "100%",
                        padding: "10px",
                        background: (!swapPanel1 || !swapPanel2 || swapPanel1 === swapPanel2) ? "#999" : COLOR_PALETTE.buttons.success.primary,
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: (!swapPanel1 || !swapPanel2 || swapPanel1 === swapPanel2) ? "not-allowed" : "pointer",
                        fontSize: "13px",
                        fontWeight: "bold"
                      }}
                    >
                      🔄 内容を入れ替え実行
                    </button>
                  </>
                )}
              </div>
              {isSwapMode && (
                <div style={{
                  fontSize: "10px",
                  color: "var(--text-muted)",
                  padding: "8px",
                  background: "#fef3c7",
                  border: "1px solid #f59e0b",
                  borderRadius: "4px",
                  marginTop: "8px"
                }}>
                  💡 コマをクリックして選択→「入れ替え実行」で内容を交換<br/>
                  サイズ・位置はそのまま、内容（メモ・プロンプト・キャラ）のみ入れ替え
                </div>
              )}
            </div>
          )}

          {/* 出力は上バーに移動 */}
        </div>
        )}
      </div>

      {/* モーダル・パネル類 */}
      {showCharacterPanel && selectedCharacter && (
        <CharacterDetailPanel
          selectedCharacter={selectedCharacter}
          onCharacterUpdate={handleCharacterUpdate}
          onCharacterDelete={handleCharacterDelete}
          onClose={handleCharacterPanelClose}
          characterNames={characterNames}
        />
      )}

      <BackgroundPanel
        isOpen={showBackgroundPanel}
        onClose={() => setShowBackgroundPanel(false)}
        backgrounds={backgrounds}
        setBackgrounds={setBackgrounds}
        selectedPanel={selectedPanel}
        onBackgroundAdd={handleBackgroundAdd}
      />

      <EffectPanel
        isOpen={showEffectPanel}
        onClose={() => setShowEffectPanel(false)}
        onAddEffect={handleEffectAdd}
        selectedEffect={selectedEffect}
        onUpdateEffect={handleEffectUpdate}
        isDarkMode={isDarkMode}
        selectedPanel={selectedPanel}
        effects={effects}
      />

      {showExportPanel && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowExportPanel(false)}>
          <div style={{
            background: isDarkMode ? '#1e1e1e' : '#ffffff',
            borderRadius: '8px',
            padding: '20px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>📤 プロンプト出力</h3>
              <button
                onClick={() => setShowExportPanel(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'var(--text-primary)'
                }}
              >
                ×
              </button>
            </div>
            <ExportPanel
              panels={panels}
              characters={characters}
              bubbles={speechBubbles}
              backgrounds={backgrounds}
              effects={effects}
              tones={tones}
              canvasRef={canvasRef}
              characterSettings={characterSettings}
              characterNames={characterNames}
              currentPageIndex={pageManager.currentPageIndex}
              pages={pageManager.pages}
              paperSize={canvasSettings.paperSize}
            />
          </div>
        </div>
      )}

      <PaperSizeSelectPanel
        currentSettings={canvasSettings}
        onSettingsChange={(newSettings: CanvasSettings) => {
          setCanvasSettings(newSettings);
        }}
        isVisible={isPaperSizePanelVisible}
        onToggle={() => setIsPaperSizePanelVisible(!isPaperSizePanelVisible)}
        isDarkMode={isDarkMode}
      />

      {/* トーン機能は無効化 */}

      <CharacterSettingsPanel
        isOpen={showCharacterSettingsPanel}
        onClose={() => setShowCharacterSettingsPanel(false)}
        characterType={editingCharacterType}
        currentName={characterNames[editingCharacterType]}
        currentSettings={characterSettings[editingCharacterType]}
        onCharacterUpdate={handleCharacterSettingsUpdate}
        isDarkMode={isDarkMode}
      />

      <SnapSettingsPanel
        isOpen={showSnapSettingsPanel}
        onClose={() => setShowSnapSettingsPanel(false)}
        snapSettings={snapSettings}
        onSnapSettingsUpdate={handleSnapSettingsUpdate}
        isDarkMode={isDarkMode}
      />

      {/* OpenAI連携モーダル */}
      <StoryToComicModal
        isOpen={showStoryToComicModal}
        onClose={() => setShowStoryToComicModal(false)}
        panelCount={panels.length}
        onGeneratePreview={handleGeneratePreview}
        onGenerateSinglePanel={handleGenerateSinglePanel}
        onApply={handleApplyPreview}
        onApplySinglePanel={handleApplySinglePanel}
        isDarkMode={isDarkMode}
        characterNames={characterNames}
        selectedPanelId={selectedPanel?.id}
      />

      <OpenAISettingsModal
        isOpen={showOpenAISettingsModal}
        onClose={() => setShowOpenAISettingsModal(false)}
        isDarkMode={isDarkMode}
      />

      <CharacterPromptRegisterModal
        isOpen={showCharacterPromptRegister}
        onClose={() => setShowCharacterPromptRegister(false)}
        characterId={registeringCharacterId}
        characterName={characterNames[registeringCharacterId] || `キャラクター${registeringCharacterId.replace('character_', '')}`}
        currentPrompt={characterSettings[registeringCharacterId]?.appearance?.basePrompt || selectedPanel?.characterPrompt || ''}
        onSave={handleSaveCharacterPrompt}
        isDarkMode={isDarkMode}
      />

      <ProjectPanel
        isOpen={showProjectPanel}
        onClose={() => setShowProjectPanel(false)}
        onLoadProject={(projectId) => {
          console.log('📂 App.tsx: プロジェクト読み込み開始 - projectId:', projectId);
          
          const project = projectSave.loadProject(projectId);
          console.log('📊 loadProjectの戻り値:', project ? 'データあり' : 'データなし');
          
          if (project) {
            setPanels(project.panels || []);
            setCharacters(project.characters || []);
            setSpeechBubbles(project.bubbles || []);
            setBackgrounds(project.backgrounds || []);
            setEffects(project.effects || []);
            setTones(project.tones || []);
            
            if (project.characterNames) {
              setCharacterNames(project.characterNames);
            }
            if (project.characterSettings) {
              setCharacterSettings(project.characterSettings);
            }
            
            if (project.settings) {
              setSnapSettings(prev => ({
                ...prev,
                enabled: project.settings.snapEnabled,
                gridSize: project.settings.snapSize
              }));
              setIsDarkMode(project.settings.darkMode);
              document.documentElement.setAttribute("data-theme", project.settings.darkMode ? "dark" : "light");
            }
            
            console.log('✅ プロジェクト読み込み完了');
          } else {
            console.error('❌ プロジェクトデータが取得できませんでした');
          }
        }}
        onNewProject={() => {
          projectSave.newProject();
          setPanels([]);
          setCharacters([]);
          setSpeechBubbles([]);
          setBackgrounds([]);
          setEffects([]);
          // トーン機能は無効化
          
          setCharacterNames({
            character_1: '主人公',
            character_2: 'ヒロイン',
            character_3: 'ライバル',
            character_4: '友人'
          });
          setCharacterSettings({
            character_1: { appearance: null, role: '主人公' },
            character_2: { appearance: null, role: 'ヒロイン' },
            character_3: { appearance: null, role: 'ライバル' },
            character_4: { appearance: null, role: '友人' }
          });
          
          setSelectedCharacter(null);
          setSelectedPanel(null);
          setSelectedEffect(null);
          // トーン機能は無効化
        }}
        currentProjectId={projectSave.currentProjectId}
        saveStatus={projectSave.saveStatus}
        onSaveProject={async (name?: string) => {
          const projectData = {
            panels,
            characters,
            bubbles: speechBubbles,
            backgrounds,
            effects,
            tones,
            canvasSize,
            settings,
            characterNames,
            characterSettings,
            canvasSettings
          };
          
          const success = await projectSave.saveProject(projectData, name);
          return success ? 'saved' : null;
        }}
        isDarkMode={isDarkMode}
      />

      <PanelTemplateSelector
        onTemplateSelect={(templateId) => {
          if (templateId && templates[templateId]) {
            handleTemplateClick(templateId);
          }
          setShowPanelSelector(false);
        }}
        onClose={() => setShowPanelSelector(false)}
        isDarkMode={isDarkMode}
        isVisible={showPanelSelector}
      />

      {/* 🧪 ベータ版フィードバックパネル */}
      <SimpleFeedbackPanel
        isVisible={showFeedbackPanel}
        onClose={() => setShowFeedbackPanel(false)}
        onDarkMode={isDarkMode}
      />

      {/* 📖 ヘルプモーダル */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

export default App;