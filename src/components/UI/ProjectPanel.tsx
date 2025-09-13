// src/components/UI/ProjectPanel.tsx - エラー修正版
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
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ストレージ情報
  const storageInfo = SaveService.getStorageInfo();

  return (
  <div 
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}
  >
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col transform transition-all duration-200 ease-out"
      style={{
        animation: isOpen ? 'modalSlideIn 0.2s ease-out' : ''
      }}
    >
        {/* ヘッダー */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">💾</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              プロジェクト管理
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 保存状態表示 */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                saveStatus.isAutoSaving ? 'bg-blue-500 animate-pulse' :
                saveStatus.hasUnsavedChanges ? 'bg-orange-500' : 'bg-green-500'
              }`}></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {saveStatus.isAutoSaving ? '自動保存中...' :
                 saveStatus.hasUnsavedChanges ? '未保存の変更あり' : '保存済み'}
              </span>
            </div>
            
            {saveStatus.lastSaved && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                最終保存: {formatDate(saveStatus.lastSaved.toISOString())}
              </span>
            )}
          </div>
          
          {saveStatus.error && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
              エラー: {saveStatus.error}
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleNewProject}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <span>📄</span>
              新規プロジェクト
            </button>
            <button
              onClick={handleSaveAsNew}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <span>💾</span>
              名前を付けて保存
            </button>
            <button
              onClick={handleImport}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <span>📥</span>
              インポート
            </button>
          </div>
        </div>

        {/* プロジェクト一覧 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📂</div>
              <div className="text-gray-500 dark:text-gray-400">
                プロジェクトがありません<br/>
                <span className="text-sm">新規プロジェクトを作成してください</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`p-4 border rounded-xl transition-all cursor-pointer hover:shadow-md ${
                    currentProjectId === project.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                  onClick={() => handleLoadProject(project.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
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
                          className="w-full px-3 py-1 border rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {project.name}
                            {currentProjectId === project.id && (
                              <span className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                                現在のプロジェクト
                              </span>
                            )}
                          </h3>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            更新: {formatDate(project.updatedAt)}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsRenaming(project.id);
                          setNewName(project.name);
                        }}
                        className="w-8 h-8 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                        title="名前変更"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicate(project.id);
                        }}
                        className="w-8 h-8 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
                        title="複製"
                      >
                        📋
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExport(project.id);
                        }}
                        className="w-8 h-8 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
                        title="エクスポート"
                      >
                        📥
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowConfirmDelete(project.id);
                        }}
                        className="w-8 h-8 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                        title="削除"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* フッター：ストレージ情報 */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              ストレージ使用量: {Math.round(storageInfo.percentage)}%
            </span>
            <span className="text-gray-500 dark:text-gray-500">
              {(storageInfo.used / 1024).toFixed(1)}KB / {(storageInfo.available / 1024).toFixed(0)}KB
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                storageInfo.percentage > 80 ? 'bg-red-500' :
                storageInfo.percentage > 60 ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
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
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
              <div className="text-center">
                <div className="text-4xl mb-4">🗑️</div>
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                  プロジェクトを削除
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  このプロジェクトを削除しますか？<br/>
                  この操作は取り消せません。
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmDelete(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={() => handleDelete(showConfirmDelete)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectPanel;