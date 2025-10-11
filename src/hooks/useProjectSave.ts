// src/hooks/useProjectSave.ts - App.tsx互換性保持版
import { useEffect, useRef, useCallback, useState } from 'react';
import SaveService from '../services/SaveService';
import { Panel, Character, SpeechBubble, BackgroundElement, EffectElement, ToneElement, DEFAULT_CANVAS_SETTINGS } from '../types';

// 🔧 App.tsxの期待する戻り値型に合わせる
interface UseProjectSaveReturn {
  saveProject: (projectData: any, projectName?: string) => Promise<boolean>;
  loadProject: (projectKey?: string) => any | null;
  autoSave: (projectData: any) => Promise<void>;
  getProjectList: () => Array<{key: string, name: string, timestamp: string}>;
  deleteProject: (projectKey: string) => boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  
  // 🆕 App.tsxが期待するプロパティを追加
  hasUnsavedChanges: boolean;
  isAutoSaving: boolean;
  currentProjectId: string | null;
  saveStatus: {
    isAutoSaving: boolean;
    lastSaved: Date | null;
    hasUnsavedChanges: boolean;
    error: string | null;
  };
  newProject: () => void;
  checkForChanges: (currentData: any) => void;
}

// 🔧 引数なしで呼び出し可能にする
export const useProjectSave = (): UseProjectSaveReturn => {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<string>('');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // プロジェクト保存（SaveService使用版）
  const saveProject = useCallback(async (
    projectData: any,
    projectName: string = 'untitled'
  ): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    
    try {
      console.log('💾 プロジェクト保存開始:', projectName);
      console.log('保存データ:', {
        panels: projectData.panels?.length || 0,
        characters: projectData.characters?.length || 0,
        characterNames: projectData.characterNames,
        characterSettings: projectData.characterSettings
      });

      // 🔧 キャラクター詳細設定の保存確認
      if (projectData.characters) {
        console.log('キャラクター詳細設定確認:');
        projectData.characters.forEach((char: any, index: number) => {
          console.log(`Character ${index + 1}:`, char);
        });
      }

      // 🆕 SaveService.ts を使用して保存
      const projectId = SaveService.saveProject(
        projectName,                                    // name
        projectData.panels || [],                       // panels
        projectData.characters || [],                   // characters  
        projectData.bubbles || [],                      // bubbles
        projectData.backgrounds || [],                  // backgrounds
        projectData.effects || [],                      // effects
        projectData.tones || [],                        // tones
        projectData.canvasSize || { width: 800, height: 600 }, // canvasSize
        projectData.settings || { snapEnabled: true, snapSize: 20, darkMode: false }, // settings
        currentProjectId || undefined,                  // projectId (update existing)
        projectData.characterNames || {},               // characterNames
        projectData.characterSettings || {},            // characterSettings
        projectData.pages,                              // pages
        projectData.currentPageIndex                    // currentPageIndex
      );
      
      setCurrentProjectId(projectId);
      // SaveServiceから実際の保存時刻を取得
      const savedProject = SaveService.loadProject(projectId);
      if (savedProject) {
        setLastSaved(new Date(savedProject.updatedAt));
      } else {
        setLastSaved(new Date());
      }
      setHasUnsavedChanges(false);
      setLastSavedData(JSON.stringify(projectData));
      
      console.log('✅ プロジェクト保存完了:', projectId);
      return true;
    } catch (error) {
      console.error('❌ プロジェクト保存エラー:', error);
      setError(error instanceof Error ? error.message : '保存に失敗しました');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [currentProjectId]);

  // プロジェクト読み込み（SaveService使用版 + デバッグ強化）
  const loadProject = useCallback((projectKey?: string): any | null => {
    try {
      console.log('📂 プロジェクト読み込み開始 - projectKey:', projectKey);
      
      const projectId = projectKey || SaveService.getCurrentProjectId();
      console.log('🆔 使用するプロジェクトID:', projectId);
      
      if (!projectId) {
        console.log('❌ プロジェクトIDがありません');
        return null;
      }

      const projectData = SaveService.loadProject(projectId);
      console.log('📊 SaveServiceから取得したデータ:', projectData ? 'データあり' : 'データなし');
      
      if (!projectData) {
        console.log('❌ プロジェクトデータが見つかりません');
        return null;
      }
      
      console.log('📋 プロジェクトデータ構造:', {
        id: projectData.id,
        name: projectData.name,
        dataKeys: Object.keys(projectData.data),
        panelsCount: projectData.data.panels?.length || 0,
        charactersCount: projectData.data.characters?.length || 0
      });

      // 🔧 App.tsxが期待する形式でデータを返す（data.プロパティではなく直接プロパティ）
      const loadedData = {
        panels: projectData.data.panels || [],
        characters: projectData.data.characters || [],
        bubbles: projectData.data.bubbles || [],
        backgrounds: projectData.data.backgrounds || [],
        effects: projectData.data.effects || [],
        tones: projectData.data.tones || [],
        canvasSize: projectData.data.canvasSize || { width: 800, height: 600 },
        settings: projectData.data.settings || { snapEnabled: true, snapSize: 20, darkMode: false },
        characterNames: projectData.data.characterNames || {},
        characterSettings: projectData.data.characterSettings || {},
        pages: projectData.data.pages,
        currentPageIndex: projectData.data.currentPageIndex,
        canvasSettings: projectData.data.canvasSettings || DEFAULT_CANVAS_SETTINGS  // この1行を追加
      };

      console.log('📤 App.tsxに返すデータ:', {
        panelsCount: loadedData.panels.length,
        charactersCount: loadedData.characters.length,
        bubblesCount: loadedData.bubbles.length,
        hasCharacterNames: !!loadedData.characterNames,
        hasCharacterSettings: !!loadedData.characterSettings
      });

      setCurrentProjectId(projectId);
      setLastSaved(new Date(projectData.updatedAt));
      setHasUnsavedChanges(false);
      setError(null);

      return loadedData;
    } catch (error) {
      console.error('❌ プロジェクト読み込みエラー:', error);
      setError(error instanceof Error ? error.message : '読み込みに失敗しました');
      return null;
    }
  }, []);

  // 自動保存
  const autoSave = useCallback(async (projectData: any): Promise<void> => {
    if (isAutoSaving) return;
    
    setIsAutoSaving(true);
    try {
      const autoSaveKey = 'manga-project-autosave';
      const autoSaveData = {
        ...projectData,
        version: '2.0',
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(autoSaveKey, JSON.stringify(autoSaveData));
      console.log('💾 自動保存完了');
    } catch (error) {
      console.error('❌ 自動保存エラー:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [isAutoSaving]);

  // プロジェクト一覧取得（SaveService使用版）
  const getProjectList = useCallback((): Array<{key: string, name: string, timestamp: string}> => {
    try {
      const projects = SaveService.getProjectList();
      return projects.map(project => ({
        key: project.id,
        name: project.name,
        timestamp: project.updatedAt
      }));
    } catch (error) {
      console.error('❌ プロジェクト一覧取得エラー:', error);
      return [];
    }
  }, []);

  // プロジェクト削除（SaveService使用版）
  const deleteProject = useCallback((projectKey: string): boolean => {
    try {
      const result = SaveService.deleteProject(projectKey);
      if (result && projectKey === currentProjectId) {
        setCurrentProjectId(null);
        setLastSaved(null);
        setHasUnsavedChanges(false);
      }
      return result;
    } catch (error) {
      console.error('❌ プロジェクト削除エラー:', error);
      return false;
    }
  }, [currentProjectId]);

  // 新規プロジェクト
  const newProject = useCallback(() => {
    setCurrentProjectId(null);
    setLastSaved(null);
    setHasUnsavedChanges(false);
    setError(null);
    console.log('📄 新規プロジェクト作成');
  }, []);

  // 初期化（SaveService使用版）
  useEffect(() => {
    const currentId = SaveService.getCurrentProjectId();
    if (currentId) {
      const project = SaveService.loadProject(currentId);
      if (project) {
        setCurrentProjectId(currentId);
        setLastSaved(new Date(project.updatedAt));
      }
    }
  }, []);

  // saveStatus オブジェクト
  const saveStatus = {
    isAutoSaving,
    lastSaved,
    hasUnsavedChanges,
    error
  };

  // 変更検知用の関数を追加
  const checkForChanges = useCallback((currentData: any) => {
    const currentDataString = JSON.stringify(currentData);
    const hasChanges = currentDataString !== lastSavedData;
    setHasUnsavedChanges(hasChanges);
  }, [lastSavedData]);

  return {
    saveProject,
    loadProject,
    autoSave,
    getProjectList,
    deleteProject,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    isAutoSaving,
    currentProjectId,
    saveStatus,
    newProject,
    checkForChanges
  };
};

export default useProjectSave;