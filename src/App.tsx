// src/App.tsx - v1.1.5 初期画面表示最適化版
import React, { useState, useEffect, useCallback, useMemo } from "react";
import CanvasComponent from "./components/CanvasComponent";
import CharacterDetailPanel from "./components/UI/CharacterDetailPanel";
import { Panel, Character, SpeechBubble, SnapSettings, BackgroundElement, EffectElement, ToneElement, BackgroundTemplate, CanvasSettings, DEFAULT_CANVAS_SETTINGS } from "./types";
import { templates } from "./components/CanvasArea/templates";
import { ExportPanel } from './components/UI/ExportPanel';
import { useRef } from 'react';
import "./App.css";

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
    console.log('🎯 App initialization: Setting up initial panels');
    const initialPanels = templates.reverse_t.panels;
    console.log('📐 Initial panels loaded:', initialPanels.length, 'panels');
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
  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>(DEFAULT_CANVAS_SETTINGS);
  const [isPaperSizePanelVisible, setIsPaperSizePanelVisible] = useState(false);

  // スナップ設定の状態管理
  const [snapSettings, setSnapSettings] = useState<SnapSettings>({
    enabled: true,
    gridSize: 20,
    sensitivity: 'medium',
    gridDisplay: 'edit-only'
  });

  // 🔧 最適化3: デフォルトダークモード設定の最適化
  useEffect(() => {
    console.log('🎨 Setting default dark mode');
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  // 🔧 最適化4: 初回テンプレート適用の最適化（重複削除・シンプル化）
  useEffect(() => {
    console.log('🚀 Initial template application');
    if (selectedTemplate) {
      // 比率ベースのテンプレートを適用
      const { applyRatioTemplate } = require('./utils/RatioTemplateScaler');
      const scaledPanels = applyRatioTemplate(selectedTemplate, canvasSettings);
      console.log('📐 Template panels count:', scaledPanels.length);
      console.log('📐 Scaled panels:', scaledPanels);
      setPanels(scaledPanels);
      
      // キャンバスを再描画
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          console.log('🔄 Canvas cleared for initial template');
        }
      }
      
      console.log('✅ Initial template applied successfully with ratio scaling');
    }
  }, [selectedTemplate, canvasSettings]); // テンプレートとキャンバス設定の両方に依存

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
      
      console.log('🖼️ Initial canvas size set:', { width: pixelWidth, height: pixelHeight, displayScale: finalDisplayScale });
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

  const toneTemplateCount = useMemo(() => {
    const uniqueNames = new Set(tones.map(tone => tone.type));
    return uniqueNames.size;
  }, [tones]);

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
    characters: [[]],
    speechBubbles: [[]],
    panels: [[]],
    backgrounds: [[]],
    effects: [[]],
    tones: [[]],
    currentIndex: 0,
  });

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

  const tonesSignature = useMemo(() => 
    tones.map(tone => `${tone.id}-${tone.x}-${tone.y}-${tone.density}-${tone.opacity}`).join(','), 
    [tones]
  );

  // 履歴保存関数
  const saveToHistory = useCallback((
    newCharacters: Character[], 
    newBubbles: SpeechBubble[], 
    newPanels: Panel[], 
    newBackgrounds: BackgroundElement[],
    newEffects: EffectElement[],
    newTones: ToneElement[]
  ) => {
    setOperationHistory(prev => {
      const newHistory = {
        characters: [...prev.characters.slice(0, prev.currentIndex + 1), [...newCharacters]],
        speechBubbles: [...prev.speechBubbles.slice(0, prev.currentIndex + 1), [...newBubbles]],
        panels: [...prev.panels.slice(0, prev.currentIndex + 1), [...newPanels]],
        backgrounds: [...prev.backgrounds.slice(0, prev.currentIndex + 1), [...newBackgrounds]],
        effects: [...prev.effects.slice(0, prev.currentIndex + 1), [...newEffects]],
        tones: [...prev.tones.slice(0, prev.currentIndex + 1), [...newTones]],
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

  // 履歴保存のタイミング
  useEffect(() => {
    // 空の状態では履歴保存しない
    if (characters.length === 0 && speechBubbles.length === 0 && panels.length === 0 && 
        backgrounds.length === 0 && effects.length === 0 && tones.length === 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      saveToHistory(characters, speechBubbles, panels, backgrounds, effects, tones);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [charactersSignature, bubblesSignature, panelsSignature, backgroundsSignature, effectsSignature, tonesSignature, saveToHistory]);

  // アンドゥ/リドゥ処理
  const handleUndo = useCallback(() => {
    if (operationHistory.currentIndex > 0) {
      const newIndex = operationHistory.currentIndex - 1;
      setCharacters([...operationHistory.characters[newIndex]]);
      setSpeechBubbles([...operationHistory.speechBubbles[newIndex]]);
      setPanels([...operationHistory.panels[newIndex]]);
      setBackgrounds([...operationHistory.backgrounds[newIndex]]);
      setEffects([...operationHistory.effects[newIndex]]);
      setTones([...operationHistory.tones[newIndex]]);
      setOperationHistory(prev => ({ ...prev, currentIndex: newIndex }));
    }
  }, [operationHistory]);

  const handleRedo = useCallback(() => {
    if (operationHistory.currentIndex < operationHistory.characters.length - 1) {
      const newIndex = operationHistory.currentIndex + 1;
      setCharacters([...operationHistory.characters[newIndex]]);
      setSpeechBubbles([...operationHistory.speechBubbles[newIndex]]);
      setPanels([...operationHistory.panels[newIndex]]);
      setBackgrounds([...operationHistory.backgrounds[newIndex]]);
      setEffects([...operationHistory.effects[newIndex]]);
      setTones([...operationHistory.tones[newIndex]]);
      setOperationHistory(prev => ({ ...prev, currentIndex: newIndex }));
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

      if (e.key === 't' && e.ctrlKey) {
        e.preventDefault();
        setShowTonePanel(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDeleteSelected, handleUndo, handleRedo]);

  // スナップ設定ハンドラー
  const handleSnapToggle = useCallback(() => {
    setSnapSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  const handleGridSizeChange = useCallback((size: number) => {
    setSnapSettings(prev => ({ ...prev, gridSize: size }));
  }, []);

  const handleSensitivityChange = useCallback((sensitivity: 'weak' | 'medium' | 'strong') => {
    setSnapSettings(prev => ({ ...prev, sensitivity }));
  }, []);

  const handleGridDisplayChange = useCallback((display: 'always' | 'edit-only' | 'hidden') => {
    setSnapSettings(prev => ({ ...prev, gridDisplay: display }));
  }, []);

  const handleCharacterNameUpdate = useCallback((type: string, newName: string, newRole: string, appearance: any) => {
    console.log(`🔧 キャラクター名前更新開始: ${type} → ${newName}`);
    
    setCharacterNames(prev => {
      const updated = { ...prev, [type]: newName };
      console.log(`📝 名前辞書更新:`, updated);
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
    setSelectedTone(null);
    
    // 比率ベースのテンプレートを適用
    const { applyRatioTemplate } = require('./utils/RatioTemplateScaler');
    const scaledPanels = applyRatioTemplate(template, canvasSettings);
    console.log('📐 Scaled panels:', scaledPanels);
    setPanels(scaledPanels);
    
    setCharacters([]);
    setSpeechBubbles([]);
    setBackgrounds([]);
    setEffects([]);
    setTones([]);
    
    // キャンバスを再描画
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        console.log('🔄 Canvas cleared for template change');
      }
    }
    
    console.log('✅ Template applied successfully with ratio scaling');
  }, [canvasSettings]);

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
      const scaledTones = currentPageData.tones.map(tone => scaleTone(tone, transform));
      
      setPanels(scaledPanels);
      setCharacters(scaledCharacters);
      setSpeechBubbles(scaledBubbles);
      setBackgrounds(scaledBackgrounds);
      setEffects(scaledEffects);
      setTones(scaledTones);
    } else {
      setPanels(prev => prev.map(panel => scalePanel(panel, transform)));
      setCharacters(prev => prev.map(char => scaleCharacter(char, transform)));
      setSpeechBubbles(prev => prev.map(bubble => scaleBubble(bubble, transform)));
      setBackgrounds(prev => prev.map(bg => scaleBackground(bg, transform)));
      setEffects(prev => prev.map(effect => scaleEffect(effect, transform)));
      setTones(prev => prev.map(tone => scaleTone(tone, transform)));
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
      setTones(prev => prev.filter(tone => tone.panelId !== panelIdNum));
      setPanels(prev => prev.filter(panel => panel.id !== panelIdNum));
      setSelectedPanel(null);
      setSelectedEffect(null);
      setSelectedTone(null);
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

  const handleClearAll = useCallback(() => {
    if (window.confirm("全ての要素をクリアしますか？")) {
      setCharacters([]);
      setSpeechBubbles([]);
      setBackgrounds([]);
      setEffects([]);
      setTones([]);
      setSelectedCharacter(null);
      setSelectedPanel(null);
      setSelectedEffect(null);
      setSelectedTone(null);
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

  const handleToneAdd = useCallback((tone: ToneElement) => {
    setTones([...tones, tone]);
    setSelectedTone(tone);
    console.log(`トーン「${tone.type}」を追加しました`);
  }, [tones]);

  const handleToneUpdate = useCallback((updatedTone: ToneElement) => {
    setTones(prev => prev.map(tone => 
      tone.id === updatedTone.id ? updatedTone : tone
    ));
    setSelectedTone(updatedTone);
  }, []);

  const handleCharacterSettingsUpdate = useCallback((characterData: any) => {
    const { name, role, appearance } = characterData;
    handleCharacterNameUpdate(editingCharacterType, name || characterNames[editingCharacterType], role || characterSettings[editingCharacterType].role, appearance);
  }, [editingCharacterType, characterNames, characterSettings, handleCharacterNameUpdate]);

  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
      {/* ヘッダー */}
      <header className="header">
        <h1>📖 ネーム制作ツール</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button 
            className={`control-btn ${isPanelEditMode ? 'active' : ''}`}
            onClick={() => setIsPanelEditMode(!isPanelEditMode)}
            title="コマ編集モード (Ctrl+E)"
            style={{
              background: isPanelEditMode ? "#ff8833" : "var(--bg-tertiary)",
              color: isPanelEditMode ? "white" : "var(--text-primary)",
              border: `1px solid ${isPanelEditMode ? "#ff8833" : "var(--border-color)"}`,
            }}
          >
            🔧 {isPanelEditMode ? "編集中" : "編集"}
          </button>

          <button 
            className="control-btn"
            onClick={() => setShowBackgroundPanel(true)}
            title="背景設定 (Ctrl+B)"
            style={{
              background: backgroundTemplateCount > 0 ? "#9c27b0" : "var(--bg-tertiary)",
              color: backgroundTemplateCount > 0 ? "white" : "var(--text-primary)",
              border: `1px solid ${backgroundTemplateCount > 0 ? "#9c27b0" : "var(--border-color)"}`,
            }}  
          >
            🎨 背景
            {backgroundTemplateCount > 0 && <span style={{ marginLeft: "4px" }}>({backgroundTemplateCount})</span>}
          </button>

          <button 
            className="control-btn"
            onClick={() => setShowEffectPanel(true)}
            title="効果線設定 (Ctrl+F)"
            style={{
              background: effectTemplateCount > 0 ? "#ff5722" : "var(--bg-tertiary)",
              color: effectTemplateCount > 0 ? "white" : "var(--text-primary)",
              border: `1px solid ${effectTemplateCount > 0 ? "#ff5722" : "var(--border-color)"}`,
            }}
          >
            ⚡ 効果線
            {effectTemplateCount > 0 && <span style={{ marginLeft: "4px" }}>({effectTemplateCount})</span>}
          </button>

          <button 
            className="control-btn"
            onClick={() => setShowTonePanel(true)}
            title="トーン設定 (Ctrl+T)"
            style={{
              background: toneTemplateCount > 0 ? "#795548" : "var(--bg-tertiary)",
              color: toneTemplateCount > 0 ? "white" : "var(--text-primary)",
              border: `1px solid ${toneTemplateCount > 0 ? "#795548" : "var(--border-color)"}`,
            }}
          >
            🎯 トーン
            {toneTemplateCount > 0 && <span style={{ marginLeft: "4px" }}>({toneTemplateCount})</span>}
          </button>

          <button 
            className="control-btn"
            onClick={() => setShowProjectPanel(true)}
            title="プロジェクト管理"
            style={{
              background: projectSave.hasUnsavedChanges ? "#ff6b6b" : "var(--bg-tertiary)",
              color: projectSave.hasUnsavedChanges ? "white" : "var(--text-primary)",
              border: `1px solid ${projectSave.hasUnsavedChanges ? "#ff6b6b" : "var(--border-color)"}`,
            }}
          >
            💾 プロジェクト
            {projectSave.hasUnsavedChanges && <span style={{ marginLeft: "4px" }}>●</span>}
          </button>

          <button 
            className={`control-btn ${snapSettings.enabled ? 'active' : ''}`}
            onClick={handleSnapToggle}
            title="スナップ機能のON/OFF"
            style={{
              background: snapSettings.enabled ? "#4CAF50" : "var(--bg-tertiary)",
              color: snapSettings.enabled ? "white" : "var(--text-primary)",
              border: `1px solid ${snapSettings.enabled ? "#4CAF50" : "var(--border-color)"}`,
            }}
          >
            ✅ スナップ
          </button>

          <select 
            value={snapSettings.gridSize}
            onChange={(e) => handleGridSizeChange(Number(e.target.value))}
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              fontSize: "12px",
            }}
            title="グリッドサイズ"
          >
            <option value={10}>10px</option>
            <option value={20}>20px</option>
            <option value={40}>40px</option>
          </select>

          <select 
            value={snapSettings.sensitivity}
            onChange={(e) => handleSensitivityChange(e.target.value as 'weak' | 'medium' | 'strong')}
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              fontSize: "12px",
            }}
            title="スナップ感度"
          >
            <option value="weak">弱</option>
            <option value="medium">中</option>
            <option value="strong">強</option>
          </select>

          <select 
            value={snapSettings.gridDisplay}
            onChange={(e) => handleGridDisplayChange(e.target.value as 'always' | 'edit-only' | 'hidden')}
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              fontSize: "12px",
            }}
            title="グリッド表示"
          >
            <option value="always">📐 常時</option>
            <option value="edit-only">📐 編集時</option>
            <option value="hidden">📐 非表示</option>
          </select>
          
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            title={`${isDarkMode ? 'ライト' : 'ダーク'}モードに切り替え`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
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
        {/* 左サイドバー */}
        <div className="sidebar left-sidebar">
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

          {isPanelEditMode && (
            <div className="section" style={{ 
              border: "2px solid #ff8833",
              background: "var(--bg-tertiary)",
            }}>
              <h3>🔧 コマ操作</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <button 
                  className="btn btn-secondary"
                  onClick={handleClearAll}
                  title="全要素をクリア"
                >
                  🧹 全クリア
                </button>
                <div style={{ 
                  fontSize: "11px", 
                  color: "var(--text-muted)",
                  padding: "8px",
                  background: "var(--bg-primary)",
                  borderRadius: "4px",
                  lineHeight: "1.4",
                }}>
                  <strong>操作方法:</strong><br/>
                  • コマを選択してハンドルで操作<br/>
                  • 🔵 移動 / 🟧 リサイズ / 🟣 分割<br/>
                  • Ctrl+E でモード切替
                </div>
              </div>
            </div>
          )}

          <div className="section">
            <SceneTemplatePanel
              panels={panels}
              selectedPanel={selectedPanel}
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
              isDarkMode={isDarkMode}
            />
          </div>
        </div>

        {/* メインエリア */}
        <div className="canvas-area">
          <div className="canvas-controls">
            <div className="undo-redo-buttons">
              <button 
                className="control-btn"
                onClick={handleUndo}
                disabled={operationHistory.currentIndex <= 0}
                title="元に戻す (Ctrl+Z)"
              >
                ↶ 戻す
              </button>
              <button 
                className="control-btn"
                onClick={handleRedo}
                disabled={operationHistory.currentIndex >= operationHistory.characters.length - 1}
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
              操作履歴: {operationHistory.currentIndex + 1} / {operationHistory.characters.length}
              {selectedCharacter && <span> | 選択中: {getCharacterDisplayName(selectedCharacter)}</span>}
              {selectedPanel && <span> | パネル{selectedPanel.id}選択中</span>}
              {selectedEffect && <span> | 効果線選択中</span>}
              {selectedTone && <span> | トーン選択中</span>}
              {isPanelEditMode && <span> | 🔧 コマ編集モード</span>}
              {snapSettings.enabled && <span> | ⚙️ スナップ: {snapSettings.gridSize}px ({snapSettings.sensitivity})</span>}
              {projectSave.isAutoSaving && <span> | 💾 自動保存中...</span>}
              {projectSave.hasUnsavedChanges && <span> | ⚠️ 未保存</span>}
              {backgrounds.length > 0 && <span> | 🎨 背景: {backgrounds.length}個</span>}
              {effects.length > 0 && <span> | ⚡ 効果線: {effects.length}個</span>}
              {tones.length > 0 && <span> | 🎯 トーン: {tones.length}個</span>}
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
            onPanelSelect={(panel: Panel | null) => setSelectedPanel(panel)}
            onCharacterSelect={(character: Character | null) => setSelectedCharacter(character)}
            onCharacterRightClick={handleCanvasCharacterRightClick}
            isPanelEditMode={isPanelEditMode}
            onPanelSplit={handlePanelSplit}
            onPanelEditModeToggle={handlePanelEditModeToggle}
            onPanelAdd={handlePanelAdd}
            onPanelDelete={handlePanelDelete}
            snapSettings={snapSettings}
          />
        </div>

        {/* 右サイドバー */}
        <div className="sidebar right-sidebar">
          <div className="section">
            <h3>👥 キャラクター</h3>
            <div className="character-grid">
              {[
                { type: 'character_1', icon: '🦸‍♂️' },
                { type: 'character_2', icon: '🦸‍♀️' },
                { type: 'character_3', icon: '😤' },
                { type: 'character_4', icon: '😊' }
              ].map((char) => (
                <div
                  key={char.type}
                  className="char-btn"
                  onClick={() => handleCharacterClick(char.type)}
                  onContextMenu={(e) => handleCharacterRightClick(e, char.type)}
                  title={`${characterNames[char.type]}を追加 (右クリックで設定)`}
                >
                  <div className="char-icon">{char.icon}</div>
                  <span>{characterNames[char.type]}</span>
                </div>
              ))}
            </div>
            <div style={{
              fontSize: "11px", 
              color: "var(--text-muted)",
              padding: "4px 8px",
              background: "var(--bg-secondary)",
              borderRadius: "4px",
              marginTop: "8px"
            }}>
              💡 右クリックで名前・見た目を設定できます
            </div>
          </div>

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
            <PaperSizeSelectPanel
              currentSettings={canvasSettings}
              onSettingsChange={handleCanvasSettingsChange}
              isVisible={isPaperSizePanelVisible}
              onToggle={() => setIsPaperSizePanelVisible(!isPaperSizePanelVisible)}
            />
          </div>

          <div className="section">
            <h3>📤 出力</h3>
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
            />
          </div>
        </div>
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

      <TonePanel
        isOpen={showTonePanel}
        onClose={() => setShowTonePanel(false)}
        onAddTone={handleToneAdd}
        selectedTone={selectedTone}
        onUpdateTone={handleToneUpdate}
        isDarkMode={isDarkMode}
        selectedPanel={selectedPanel}
        tones={tones}
      />

      <CharacterSettingsPanel
        isOpen={showCharacterSettingsPanel}
        onClose={() => setShowCharacterSettingsPanel(false)}
        characterType={editingCharacterType}
        currentName={characterNames[editingCharacterType]}
        currentSettings={characterSettings[editingCharacterType]}
        onCharacterUpdate={handleCharacterSettingsUpdate}
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
          setTones([]);
          
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
          setSelectedTone(null);
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
    </div>
  );
}

export default App;