// src/hooks/useProjectSave.ts - 背景対応修正版
import { useEffect, useRef, useCallback, useState } from 'react';
import SaveService from '../services/SaveService';
import { Panel, Character, SpeechBubble, BackgroundElement } from '../types';

interface UseProjectSaveProps {
  panels: Panel[];
  characters: Character[];
  bubbles: SpeechBubble[];
  backgrounds: BackgroundElement[]; // 🆕 背景データ追加
  canvasSize: { width: number; height: number };
  settings: { snapEnabled: boolean; snapSize: number; darkMode: boolean };
}

interface SaveStatus {
  isAutoSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: string | null;
}

export const useProjectSave = ({
  panels,
  characters,
  bubbles,
  backgrounds, // 🆕 背景データ受け取り
  canvasSize,
  settings
}: UseProjectSaveProps) => {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({
    isAutoSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    error: null
  });

  const lastDataRef = useRef<string>('');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3;
  const projectName = '新規プロジェクト'; // デフォルト名
  const autoSaveInterval = 30000; // 30秒

  const getCurrentDataString = useCallback(() => {
    return JSON.stringify({
      panels,
      characters,
      bubbles,
      backgrounds, // 🆕 背景データを含める
      canvasSize,
      settings
    });
  }, [panels, characters, bubbles, backgrounds, canvasSize, settings]);

  const hasDataChanged = useCallback(() => {
    const currentData = getCurrentDataString();
    return currentData !== lastDataRef.current;
  }, [getCurrentDataString]);

  const saveProject = useCallback(async (name?: string): Promise<string | null> => {
    try {
      setSaveStatus(prev => ({ ...prev, error: null }));
      
      const projectId = SaveService.saveProject(
        name || projectName,
        panels,
        characters,
        bubbles,
        backgrounds, // 🆕 背景データを保存
        canvasSize,
        settings,
        currentProjectId || undefined
      );

      lastDataRef.current = getCurrentDataString();
      setCurrentProjectId(projectId);
      setSaveStatus(prev => ({
        ...prev,
        lastSaved: new Date(),
        hasUnsavedChanges: false
      }));
      retryCountRef.current = 0;

      return projectId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '保存に失敗しました';
      setSaveStatus(prev => ({ ...prev, error: errorMessage }));
      console.error('手動保存エラー:', error);
      return null;
    }
  }, [projectName, panels, characters, bubbles, backgrounds, canvasSize, settings, currentProjectId, getCurrentDataString]);

  const autoSave = useCallback(async () => {
    if (!hasDataChanged() || saveStatus.isAutoSaving) {
      return;
    }

    try {
      setSaveStatus(prev => ({ ...prev, isAutoSaving: true, error: null }));
      await saveProject();
      retryCountRef.current = 0;
    } catch (error) {
      retryCountRef.current++;
      
      if (retryCountRef.current < maxRetries) {
        setTimeout(() => autoSave(), 5000);
      } else {
        const errorMessage = '自動保存に失敗しました（手動保存を試してください）';
        setSaveStatus(prev => ({ ...prev, error: errorMessage }));
        console.error('自動保存エラー（最大試行回数到達）:', error);
      }
    } finally {
      setSaveStatus(prev => ({ ...prev, isAutoSaving: false }));
    }
  }, [hasDataChanged, saveStatus.isAutoSaving, saveProject]);

  const loadProject = useCallback((projectId: string) => {
    const project = SaveService.loadProject(projectId);
    if (project) {
      setCurrentProjectId(projectId);
      lastDataRef.current = JSON.stringify(project.data);
      setSaveStatus(prev => ({
        ...prev,
        lastSaved: new Date(project.updatedAt),
        hasUnsavedChanges: false,
        error: null
      }));
      return project;
    }
    return null;
  }, []);

  const newProject = useCallback(() => {
    setCurrentProjectId(null);
    lastDataRef.current = '';
    setSaveStatus({
      isAutoSaving: false,
      lastSaved: null,
      hasUnsavedChanges: false,
      error: null
    });
  }, []);

  useEffect(() => {
    if (hasDataChanged()) {
      setSaveStatus(prev => ({ ...prev, hasUnsavedChanges: true }));
    }
  }, [hasDataChanged]);

  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setInterval(() => {
      autoSave();
    }, autoSaveInterval);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [autoSave, autoSaveInterval]);

  useEffect(() => {
    const currentId = SaveService.getCurrentProjectId();
    if (currentId) {
      const project = SaveService.getCurrentProject();
      if (project) {
        setCurrentProjectId(currentId);
        setSaveStatus(prev => ({
          ...prev,
          lastSaved: new Date(project.updatedAt)
        }));
        lastDataRef.current = JSON.stringify(project.data);
      }
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus.hasUnsavedChanges) {
        try {
          SaveService.saveProject(
            projectName,
            panels,
            characters,
            bubbles,
            backgrounds, // 🆕 背景データも保存
            canvasSize,
            settings,
            currentProjectId || undefined
          );
        } catch (error) {
          console.error('ページ離脱時の保存エラー:', error);
          e.preventDefault();
          e.returnValue = '未保存の変更があります。ページを離れますか？';
          return e.returnValue;
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus.hasUnsavedChanges, projectName, panels, characters, bubbles, backgrounds, canvasSize, settings, currentProjectId]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, []);

  return {
    currentProjectId,
    saveStatus,
    saveProject,
    loadProject,
    newProject,
    hasUnsavedChanges: saveStatus.hasUnsavedChanges,
    isAutoSaving: saveStatus.isAutoSaving,
    lastSaved: saveStatus.lastSaved,
    error: saveStatus.error
  };
};

export default useProjectSave;