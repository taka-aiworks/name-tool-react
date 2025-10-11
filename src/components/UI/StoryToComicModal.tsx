// src/components/UI/StoryToComicModal.tsx - 2段階プレビュー対応版
import React, { useState } from 'react';
import { PanelContent } from '../../services/OpenAIService';

interface StoryToComicModalProps {
  isOpen: boolean;
  onClose: () => void;
  panelCount: number;
  onGeneratePreview: (story: string, tone: string) => Promise<PanelContent[]>;
  onApply: (previewData: PanelContent[]) => void;
  isDarkMode?: boolean;
  characterNames?: Record<string, string>;
}

export const StoryToComicModal: React.FC<StoryToComicModalProps> = ({
  isOpen,
  onClose,
  panelCount,
  onGeneratePreview,
  onApply,
  isDarkMode = false,
  characterNames = {}
}) => {
  const [story, setStory] = useState('');
  const [tone, setTone] = useState('コメディ');
  const [previewData, setPreviewData] = useState<PanelContent[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<'input' | 'preview'>('input');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!story.trim()) {
      alert('話の概要を入力してください');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await onGeneratePreview(story, tone);
      setPreviewData(result);
      setStep('preview');
    } catch (error) {
      console.error('Preview generation error:', error);
      alert('プレビュー生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (previewData) {
      onApply(previewData);
      handleClose();
    }
  };

  const handleClose = () => {
    setStory('');
    setTone('コメディ');
    setPreviewData(null);
    setStep('input');
    onClose();
  };

  const handleBack = () => {
    setStep('input');
  };

  return (
    <>
      {/* オーバーレイ */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998
        }}
        onClick={handleClose}
      />

      {/* モーダル */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: isDarkMode ? '#2d2d2d' : 'white',
          border: `2px solid ${isDarkMode ? '#555' : '#333'}`,
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 9999,
          minWidth: '600px',
          maxWidth: '700px',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ 
          marginBottom: '20px', 
          fontWeight: 'bold', 
          fontSize: '18px',
          color: isDarkMode ? '#fff' : '#333'
        }}>
          📖 話からコマ内容を生成 {step === 'preview' && '- プレビュー'}
        </div>

        {step === 'input' ? (
          <>
            {/* 入力画面 */}
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              background: isDarkMode ? '#404040' : '#f0f0f0',
              borderRadius: '6px',
              fontSize: '13px',
              color: isDarkMode ? '#ccc' : '#666'
            }}>
              📐 現在のコマ数: <strong>{panelCount}コマ</strong>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                fontSize: '13px',
                color: isDarkMode ? '#fff' : '#333'
              }}>
                🎭 トーン
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: `1px solid ${isDarkMode ? '#555' : '#ccc'}`,
                  borderRadius: '4px',
                  background: isDarkMode ? '#404040' : 'white',
                  color: isDarkMode ? '#fff' : '#333',
                  fontSize: '13px'
                }}
              >
                <option value="コメディ">😄 コメディ</option>
                <option value="シリアス">😐 シリアス</option>
                <option value="日常">☀️ 日常</option>
                <option value="感動">😢 感動</option>
                <option value="緊張">😰 緊張</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                fontSize: '13px',
                color: isDarkMode ? '#fff' : '#333'
              }}>
                📝 コマごとの内容
              </label>
              <textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder={"例:\n１コマ目→リナが悩んでる\n２コマ目→リナが漫画が描けないよーって悩んでる\n３コマ目→サユがこのアプリを使えばできる！"}
                autoFocus
                style={{
                  width: '100%',
                  height: '150px',
                  padding: '12px',
                  border: `1px solid ${isDarkMode ? '#555' : '#ccc'}`,
                  borderRadius: '6px',
                  resize: 'vertical',
                  fontFamily: "'Noto Sans JP', sans-serif",
                  fontSize: '14px',
                  lineHeight: '1.6',
                  background: isDarkMode ? '#404040' : 'white',
                  color: isDarkMode ? '#fff' : '#333'
                }}
              />
              <div style={{
                fontSize: '11px',
                color: isDarkMode ? '#999' : '#666',
                marginTop: '6px'
              }}>
                💡 コマごとに改行して、登場キャラ・動作・場所を書いてください
              </div>
            </div>

            <div style={{ 
              marginTop: '20px', 
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}>
              <button
                onClick={handleClose}
                disabled={isGenerating}
                style={{
                  padding: '10px 20px',
                  border: `1px solid ${isDarkMode ? '#555' : '#ccc'}`,
                  borderRadius: '6px',
                  background: isDarkMode ? '#404040' : 'white',
                  color: isDarkMode ? '#fff' : '#333',
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: isGenerating ? 0.5 : 1
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !story.trim()}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  background: isGenerating || !story.trim() ? '#999' : '#8b5cf6',
                  color: 'white',
                  cursor: isGenerating || !story.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {isGenerating ? '生成中...' : '🎯 プレビュー生成'}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* プレビュー画面 */}
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              background: isDarkMode ? '#1a4d1a' : '#d1fae5',
              border: `1px solid ${isDarkMode ? '#10b981' : '#059669'}`,
              borderRadius: '6px',
              fontSize: '12px',
              color: isDarkMode ? '#d1fae5' : '#065f46',
              fontWeight: 'bold'
            }}>
              ✅ プレビューが生成されました。内容を確認して「適用」してください。
            </div>

            {/* プレビュー内容 */}
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              marginBottom: '16px'
            }}>
              {previewData?.map((panel, index) => (
                <div
                  key={panel.panelId}
                  style={{
                    marginBottom: '12px',
                    padding: '12px',
                    background: isDarkMode ? '#404040' : '#f9f9f9',
                    border: `1px solid ${isDarkMode ? '#555' : '#ddd'}`,
                    borderRadius: '6px'
                  }}
                >
                  <div style={{
                    fontWeight: 'bold',
                    fontSize: '13px',
                    color: isDarkMode ? '#8b5cf6' : '#7c3aed',
                    marginBottom: '8px'
                  }}>
                    コマ {panel.panelId}
                  </div>

                  {panel.characterId && (
                    <div style={{ fontSize: '12px', marginBottom: '4px', color: isDarkMode ? '#fbbf24' : '#d97706' }}>
                      👤 キャラ: <strong>{characterNames[panel.characterId] || panel.characterId}</strong>
                    </div>
                  )}

                  <div style={{ fontSize: '12px', marginBottom: '4px', color: isDarkMode ? '#ccc' : '#666' }}>
                    📌 メモ: {panel.note}
                  </div>

                  <div style={{ fontSize: '12px', marginBottom: '4px', color: isDarkMode ? '#ccc' : '#666' }}>
                    💬 吹き出し: 「{panel.dialogue}」 ({panel.bubbleType || '普通'})
                  </div>

                  <div style={{ fontSize: '11px', marginBottom: '4px', color: isDarkMode ? '#999' : '#888', fontFamily: 'monospace' }}>
                    🎬 動作: {panel.actionPrompt}
                  </div>

                  {panel.actionPromptJa && (
                    <div style={{
                      fontSize: '11px',
                      color: isDarkMode ? '#fbbf24' : '#d97706',
                      padding: '6px',
                      background: isDarkMode ? '#2d2520' : '#fef3c7',
                      borderRadius: '4px',
                      marginTop: '4px'
                    }}>
                      💬 日本語: {panel.actionPromptJa}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ボタンエリア */}
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              gap: '10px'
            }}>
              <button
                onClick={handleBack}
                style={{
                  padding: '10px 20px',
                  border: `1px solid ${isDarkMode ? '#555' : '#ccc'}`,
                  borderRadius: '6px',
                  background: isDarkMode ? '#404040' : 'white',
                  color: isDarkMode ? '#fff' : '#333',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ← 戻る
              </button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleClose}
                  style={{
                    padding: '10px 20px',
                    border: `1px solid ${isDarkMode ? '#555' : '#ccc'}`,
                    borderRadius: '6px',
                    background: isDarkMode ? '#404040' : 'white',
                    color: isDarkMode ? '#fff' : '#333',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  キャンセル
                </button>
                <button
                  onClick={handleApply}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '6px',
                    background: '#10b981',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  ✅ 適用
                </button>
              </div>
            </div>
          </>
        )}

        {/* 注意事項 */}
        {step === 'input' && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: isDarkMode ? '#404040' : '#fff3cd',
            border: `1px solid ${isDarkMode ? '#555' : '#ffc107'}`,
            borderRadius: '6px',
            fontSize: '11px',
            color: isDarkMode ? '#fbbf24' : '#856404'
          }}>
            ⚠️ OpenAI APIの使用には料金がかかります（gpt-4o-mini使用、1回数円程度）
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};
