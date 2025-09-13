// src/services/SaveService.ts - エラー修正版
import { Panel, Character, SpeechBubble } from '../types';

export interface ProjectData {
  id: string;
  name: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  data: {
    panels: Panel[];
    characters: Character[];
    bubbles: SpeechBubble[];
    canvasSize: { width: number; height: number };
    settings: {
      snapEnabled: boolean;
      snapSize: number;
      darkMode: boolean;
    };
  };
}

export interface ProjectMetadata {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
}

export class SaveService {
  private static readonly STORAGE_KEY = 'name_tool_projects';
  private static readonly CURRENT_PROJECT_KEY = 'name_tool_current_project';
  private static readonly VERSION = '1.0.0';

  /**
   * プロジェクトを保存
   */
  static saveProject(
    name: string,
    panels: Panel[],
    characters: Character[],
    bubbles: SpeechBubble[],
    canvasSize: { width: number; height: number },
    settings: { snapEnabled: boolean; snapSize: number; darkMode: boolean },
    projectId?: string
  ): string {
    try {
      const id = projectId || this.generateId();
      const now = new Date().toISOString();
      
      const projectData: ProjectData = {
        id,
        name,
        version: this.VERSION,
        createdAt: projectId ? this.getProject(projectId)?.createdAt || now : now,
        updatedAt: now,
        data: {
          panels: JSON.parse(JSON.stringify(panels)),
          characters: JSON.parse(JSON.stringify(characters)),
          bubbles: JSON.parse(JSON.stringify(bubbles)),
          canvasSize,
          settings
        }
      };

      const projects = this.getAllProjects();
      const existingIndex = projects.findIndex(p => p.id === id);
      
      if (existingIndex >= 0) {
        projects[existingIndex] = projectData;
      } else {
        projects.push(projectData);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
      localStorage.setItem(this.CURRENT_PROJECT_KEY, id);

      console.log(`プロジェクト "${name}" を保存しました (ID: ${id})`);
      return id;

    } catch (error) {
      console.error('プロジェクト保存エラー:', error);
      throw new Error('プロジェクトの保存に失敗しました');
    }
  }

  /**
   * プロジェクトを読み込み
   */
  static loadProject(projectId: string): ProjectData | null {
    try {
      const projects = this.getAllProjects();
      const project = projects.find(p => p.id === projectId);
      
      if (project) {
        localStorage.setItem(this.CURRENT_PROJECT_KEY, projectId);
        console.log(`プロジェクト "${project.name}" を読み込みました`);
        return project;
      }
      
      return null;
    } catch (error) {
      console.error('プロジェクト読み込みエラー:', error);
      return null;
    }
  }

  /**
   * 現在のプロジェクトIDを取得
   */
  static getCurrentProjectId(): string | null {
    return localStorage.getItem(this.CURRENT_PROJECT_KEY);
  }

  /**
   * 現在のプロジェクトを取得
   */
  static getCurrentProject(): ProjectData | null {
    const currentId = this.getCurrentProjectId();
    return currentId ? this.loadProject(currentId) : null;
  }

  /**
   * プロジェクト一覧を取得
   */
  static getAllProjects(): ProjectData[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('プロジェクト一覧取得エラー:', error);
      return [];
    }
  }

  /**
   * プロジェクトメタデータ一覧を取得
   */
  static getProjectList(): ProjectMetadata[] {
    return this.getAllProjects().map(project => ({
      id: project.id,
      name: project.name,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    }));
  }

  /**
   * プロジェクトを削除
   */
  static deleteProject(projectId: string): boolean {
    try {
      const projects = this.getAllProjects();
      const filteredProjects = projects.filter(p => p.id !== projectId);
      
      if (filteredProjects.length === projects.length) {
        return false;
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredProjects));
      
      if (this.getCurrentProjectId() === projectId) {
        localStorage.removeItem(this.CURRENT_PROJECT_KEY);
      }

      console.log(`プロジェクト (ID: ${projectId}) を削除しました`);
      return true;
    } catch (error) {
      console.error('プロジェクト削除エラー:', error);
      return false;
    }
  }

  /**
   * プロジェクトを複製
   */
  static duplicateProject(projectId: string, newName?: string): string | null {
    try {
      const original = this.getProject(projectId);
      if (!original) return null;

      const newId = this.generateId();
      const now = new Date().toISOString();
      
      const duplicated: ProjectData = {
        ...JSON.parse(JSON.stringify(original)),
        id: newId,
        name: newName || `${original.name} のコピー`,
        createdAt: now,
        updatedAt: now
      };

      const projects = this.getAllProjects();
      projects.push(duplicated);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));

      console.log(`プロジェクト "${original.name}" を複製しました`);
      return newId;
    } catch (error) {
      console.error('プロジェクト複製エラー:', error);
      return null;
    }
  }

  /**
   * プロジェクトをエクスポート（JSON）
   */
  static exportProject(projectId: string): void {
    try {
      const project = this.getProject(projectId);
      if (!project) throw new Error('プロジェクトが見つかりません');

      const dataStr = JSON.stringify(project, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log(`プロジェクト "${project.name}" をエクスポートしました`);
    } catch (error) {
      console.error('プロジェクトエクスポートエラー:', error);
      throw new Error('プロジェクトのエクスポートに失敗しました');
    }
  }

  /**
   * プロジェクトをインポート（JSON）
   */
  static async importProject(file: File): Promise<string | null> {
    try {
      const text = await file.text();
      const projectData: ProjectData = JSON.parse(text);
      
      if (!this.validateProjectData(projectData)) {
        throw new Error('無効なプロジェクトファイルです');
      }

      const newId = this.generateId();
      const now = new Date().toISOString();
      
      projectData.id = newId;
      projectData.updatedAt = now;

      const projects = this.getAllProjects();
      projects.push(projectData);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));

      console.log(`プロジェクト "${projectData.name}" をインポートしました`);
      return newId;
    } catch (error) {
      console.error('プロジェクトインポートエラー:', error);
      return null;
    }
  }

  /**
   * ストレージ使用量を取得
   */
  static getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY) || '';
      const used = new Blob([data]).size;
      const available = 5 * 1024 * 1024;
      const percentage = (used / available) * 100;

      return { used, available, percentage };
    } catch (error) {
      console.error('ストレージ情報取得エラー:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  // Private methods
  private static getProject(projectId: string): ProjectData | null {
    const projects = this.getAllProjects();
    return projects.find(p => p.id === projectId) || null;
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private static validateProjectData(data: any): data is ProjectData {
    return (
      data &&
      typeof data.id === 'string' &&
      typeof data.name === 'string' &&
      typeof data.version === 'string' &&
      data.data &&
      Array.isArray(data.data.panels) &&
      Array.isArray(data.data.characters) &&
      Array.isArray(data.data.bubbles)
    );
  }
}

export default SaveService;