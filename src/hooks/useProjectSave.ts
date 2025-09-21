// src/hooks/useProjectSave.ts - App.tsx互換性保持版
import { useEffect, useRef, useCallback, useState } from 'react';
import SaveService from '../services/SaveService';
import { Panel, Character, SpeechBubble, BackgroundElement, EffectElement, ToneElement } from '../types';

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
}

// 🔧 引数なしで呼び出し可能にする
export const useProjectSave = (): UseProjectSaveReturn => {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // プロジェクト保存（App.tsxの期待するシグネチャに合わせる）
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
          console.log(`Character ${index + 1}:`, {
            id: char.id,
            name: char.name,
            expression: char.expression,
            action: char.action,
            facing: char.facing,
            viewType: char.viewType,
            eyeState: char.eyeState,
            mouthState: char.mouthState,
            handGesture: char.handGesture
          });
        });
      }

      const saveData = {
        ...projectData,
        version: '2.0',
        timestamp: new Date().toISOString()
      };

      const key = `manga-project-${projectName}-${Date.now()}`;
      localStorage.setItem(key, JSON.stringify(saveData));
      localStorage.setItem('manga-project-current', key);
      
      setCurrentProjectId(key);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      console.log('✅ プロジェクト保存完了:', key);
      return true;
    } catch (error) {
      console.error('❌ プロジェクト保存エラー:', error);
      setError(error instanceof Error ? error.message : '保存に失敗しました');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // プロジェクト読み込み（App.tsxの期待する形式に合わせる）
  const loadProject = useCallback((projectKey?: string): any | null => {
    try {
      const key = projectKey || localStorage.getItem('manga-project-current');
      if (!key) return null;

      const savedData = localStorage.getItem(key);
      if (!savedData) return null;

      const parsedData = JSON.parse(savedData);
      
      console.log('📂 プロジェクト読み込み:', key);
      console.log('読み込まれたデータ:', {
        panels: parsedData.panels?.length || 0,
        characters: parsedData.characters?.length || 0,
        characterNames: parsedData.characterNames,
        characterSettings: parsedData.characterSettings
      });

      // 🔧 キャラクター詳細設定の読み込み確認
      if (parsedData.characters) {
        console.log('キャラクター詳細設定読み込み確認:');
        parsedData.characters.forEach((char: any, index: number) => {
          console.log(`Character ${index + 1}:`, {
            id: char.id,
            name: char.name,
            expression: char.expression,
            action: char.action,
            facing: char.facing,
            viewType: char.viewType,
            eyeState: char.eyeState,
            mouthState: char.mouthState,
            handGesture: char.handGesture
          });
        });
      }

      setCurrentProjectId(key);
      setLastSaved(new Date(parsedData.timestamp || Date.now()));
      setHasUnsavedChanges(false);
      setError(null);

      // 🔧 App.tsxが期待する形式 { data: ... } ではなく、直接データを返す
      return parsedData;
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

  // プロジェクト一覧取得
  const getProjectList = useCallback((): Array<{key: string, name: string, timestamp: string}> => {
    const projects: Array<{key: string, name: string, timestamp: string}> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('manga-project-') && !key.endsWith('-current')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          projects.push({
            key,
            name: key.replace('manga-project-', '').split('-')[0] || 'untitled',
            timestamp: data.timestamp || 'unknown'
          });
        } catch (error) {
          console.warn(`⚠️ プロジェクト読み込みスキップ: ${key}`);
        }
      }
    }
    
    return projects.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, []);

  // プロジェクト削除
  const deleteProject = useCallback((projectKey: string): boolean => {
    try {
      localStorage.removeItem(projectKey);
      console.log(`🗑️ プロジェクト削除: ${projectKey}`);
      return true;
    } catch (error) {
      console.error('❌ プロジェクト削除エラー:', error);
      return false;
    }
  }, []);

  // 新規プロジェクト
  const newProject = useCallback(() => {
    setCurrentProjectId(null);
    setLastSaved(null);
    setHasUnsavedChanges(false);
    setError(null);
    console.log('📄 新規プロジェクト作成');
  }, []);

  // 初期化
  useEffect(() => {
    const currentId = localStorage.getItem('manga-project-current');
    if (currentId) {
      const data = localStorage.getItem(currentId);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          setCurrentProjectId(currentId);
          setLastSaved(new Date(parsed.timestamp || Date.now()));
        } catch (error) {
          console.warn('初期プロジェクト読み込み失敗:', error);
        }
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
    newProject
  };
};

export default useProjectSave;