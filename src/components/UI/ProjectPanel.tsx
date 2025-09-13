// src/components/UI/ProjectPanel.tsx
import React, { useState, useRef } from 'react';
import SaveService, { ProjectMetadata } from '../../services/SaveService';

interface ProjectPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadProject: (projectId: string) => void;
  onNewProject: () => void;
  currentProjectId: string | null;
  saveStatus: {
    isAutoSaving: boolean;
    lastSaved: Date | null;
    hasUnsavedChanges: boolean;
    error: string | null;
  };
  onSaveProject: (name?: string) => Promise<string | null>;
  className?: string;
}

const ProjectPanel: React.FC<ProjectPanelProps> = ({
  isOpen,
  onClose,
  onLoadProject,
  onNewProject,
  currentProjectId,
  saveStatus,
  onSaveProject,
  className = ''
}) => {
  const [projects, setProjects] = useState<ProjectMetadata[]>(() => 
    SaveService.getProjectList()
  );
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // プロジェクト一覧を更新
  const refreshProjects = () => {
    setProjects(SaveService.getProjectList());
  };

  // 新規プロジェクト
  const handleNewProject = () => {
    onNewProject();
    onClose();
  };

  // プロジェクト読み込み
  const handleLoadProject = (projectId: string) => {
    onLoadProject(projectId);
    onClose();
  };

  // プロジェクト保存（新規）
  const handleSaveAsNew = async () => {
    const name = prompt('プロジェクト名を入力してください:', '新規プロジェクト');
    if (name) {
      const projectId = await onSaveProject(name);
      if (projectId) {
        refreshProjects();
      }
    }
  };

  // プロジェクト名変更
  const handleRename = async (projectId: string) => {
    if (newName.trim()) {
      const project = SaveService.loadProject(projectId);
      if (project) {
        SaveService.saveProject(
          newName.trim(),
          project.data.panels,
          project.data.characters,
          project.data.bubbles,
          project.data.canvasSize,
          project.data.settings,
          projectId
        );
        refreshProjects();
      }
    }
    setIsRenaming(null);
    setNewName('');
  };

  // プロジェクト削除
  const handleDelete = (projectId: string) => {
    if (SaveService.deleteProject(projectId)) {
      refreshProjects();
      if (currentProjectId === projectId) {
        onNewProject();
      }
    }
    setShowConfirmDelete(null);
  };

  // プロジェクト複製
  const handleDuplicate = (projectId: string) => {
    const newId = SaveService.duplicateProject(projectId);
    if (newId) {
      refreshProjects();
    }
  };

  // エクスポート
  const handleExport = (projectId: string) => {
    try {
      SaveService.exportProject(projectId);
    } catch (error) {
      alert('エクスポートに失敗しました');
    }
  };

  // インポート
  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const projectId = await SaveService.importProject(file);
      if (projectId) {
        refreshProjects();
        alert('プロジェクトをインポートしました');
      } else {
        alert('インポートに失敗しました');
      }
    }
    event.target.value = '';
  };

  // 日時フォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ストレージ情報
  const storageInfo = SaveService.getStorageInfo();

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            プロジェクト管理
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* 保存状態表示 */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              保存状態
            </span>
            {saveStatus.isAutoSaving && (
              <span className="text-sm text-blue-600 dark:text-blue-400">
                自動保存中...
              </span>
            )}
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {saveStatus.lastSaved ? (
              <span>最終保存: {formatDate(saveStatus.lastSaved.toISOString())}</span>
            ) : (
              <span>未保存</span>
            )}
            {saveStatus.hasUnsavedChanges && (
              <span className="ml-2 text-orange-600 dark:text-orange-400">
                (未保存の変更あり)
              </span>
            )}
          </div>
          
          {saveStatus.error && (
            <div className="text-sm text-red-600 dark:text-red-400 mt-1">
              エラー: {saveStatus.error}
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={handleNewProject}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            新規プロジェクト
          </button>
          <button
            onClick={handleSaveAsNew}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            名前を付けて保存
          </button>
          <button
            onClick={handleImport}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            インポート
          </button>
        </div>

        {/* プロジェクト一覧 */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid gap-2">
            {projects.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                プロジェクトがありません
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    currentProjectId === project.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {isRenaming === project.id ? (
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          onBlur={() => handleRename(project.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(project.id);
                            if (e.key === 'Escape') setIsRenaming(null);
                          }}
                          className="w-full px-2 py-1 border rounded text-gray-900 dark:text-white dark:bg-gray-700"
                          autoFocus
                        />
                      ) : (
                        <h3 
                          className="font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                          onClick={() => handleLoadProject(project.id)}
                        >
                          {project.name}
                          {currentProjectId === project.id && (
                            <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">
                              (現在のプロジェクト)
                            </span>
                          )}
                        </h3>
                      )}
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        作成: {formatDate(project.createdAt)} | 
                        更新: {formatDate(project.updatedAt)}
                      </div>
                    </div>

                    <div className="flex gap-1 ml-4">
                      <button
                        onClick={() => {
                          setIsRenaming(project.id);
                          setNewName(project.name);
                        }}
                        className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                        title="名前変更"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDuplicate(project.id)}
                        className="p-1 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
                        title="複製"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => handleExport(project.id)}
                        className="p-1 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400"
                        title="エクスポート"
                      >
                        📥
                      </button>
                      <button
                        onClick={() => setShowConfirmDelete(project.id)}
                        className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        title="削除"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ストレージ情報 */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            ストレージ使用量: {Math.round(storageInfo.percentage)}% 
            ({(storageInfo.used / 1024).toFixed(1)}KB / {(storageInfo.available / 1024).toFixed(0)}KB)
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* 隠しファイル入力 */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* 削除確認ダイアログ */}
        {showConfirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm">
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                プロジェクトを削除
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                このプロジェクトを削除しますか？この操作は取り消せません。
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowConfirmDelete(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => handleDelete(showConfirmDelete)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectPanel;