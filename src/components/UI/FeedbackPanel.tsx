/**
 * ベータ版フィードバック収集パネル
 * ユーザーからの意見・要望を収集するためのUI
 */

import React, { useState } from 'react';

interface FeedbackData {
  rating: number; // 1-5の評価
  category: string; // フィードバックカテゴリ
  message: string; // 詳細メッセージ
  userAgent: string; // ブラウザ情報
  timestamp: string; // 送信日時
}

interface FeedbackPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onDarkMode?: boolean;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  isVisible,
  onClose,
  onDarkMode = false
}) => {
  const [rating, setRating] = useState<number>(0);
  const [category, setCategory] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories = [
    { value: 'usability', label: '使いやすさ' },
    { value: 'features', label: '機能について' },
    { value: 'performance', label: '動作・パフォーマンス' },
    { value: 'ui', label: 'デザイン・UI' },
    { value: 'bug', label: 'バグ報告' },
    { value: 'request', label: '機能要望' },
    { value: 'other', label: 'その他' }
  ];

  const handleSubmit = async () => {
    if (!category || !message.trim()) {
      alert('カテゴリとメッセージを入力してください。');
      return;
    }

    setIsSubmitting(true);

    try {
      // Googleフォームに送信
      const formData = new FormData();
      formData.append('entry.1234567890', rating.toString()); // 評価
      formData.append('entry.1234567891', category); // カテゴリ
      formData.append('entry.1234567892', message.trim()); // メッセージ
      formData.append('entry.1234567893', new Date().toISOString()); // タイムスタンプ
      formData.append('entry.1234567894', navigator.userAgent); // ブラウザ情報

      // Googleフォームの送信URL（実際のフォーム作成後に更新が必要）
      const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse';
      
      const response = await fetch(GOOGLE_FORM_URL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors' // CORS回避のため
      });

      // 送信完了後の処理
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
        // フォームリセット
        setRating(0);
        setCategory('');
        setMessage('');
      }, 2000);

    } catch (error) {
      console.error('フィードバック送信エラー:', error);
      alert('送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="feedback-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div className="feedback-panel" style={{
        backgroundColor: onDarkMode ? '#2a2a2a' : '#ffffff',
        border: `1px solid ${onDarkMode ? '#444' : '#ddd'}`,
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        {/* ヘッダー */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '12px',
          borderBottom: `1px solid ${onDarkMode ? '#444' : '#eee'}`
        }}>
          <h3 style={{
            margin: 0,
            color: onDarkMode ? '#fff' : '#333',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            🧪 ベータ版フィードバック
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: onDarkMode ? '#ccc' : '#666',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* 送信完了メッセージ */}
        {isSubmitted ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: onDarkMode ? '#4CAF50' : '#2E7D32'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h3 style={{ margin: '0 0 8px 0', color: onDarkMode ? '#fff' : '#333' }}>
              フィードバックを送信しました！
            </h3>
            <p style={{ margin: 0, color: onDarkMode ? '#ccc' : '#666' }}>
              ご協力ありがとうございます
            </p>
          </div>
        ) : (
          <>
            {/* 評価 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: onDarkMode ? '#fff' : '#333',
                fontWeight: '500'
              }}>
                全体的な評価（任意）
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      color: star <= rating ? '#FFD700' : onDarkMode ? '#666' : '#ccc',
                      padding: '4px'
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* カテゴリ選択 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: onDarkMode ? '#fff' : '#333',
                fontWeight: '500'
              }}>
                カテゴリ *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${onDarkMode ? '#555' : '#ddd'}`,
                  borderRadius: '6px',
                  backgroundColor: onDarkMode ? '#333' : '#fff',
                  color: onDarkMode ? '#fff' : '#333',
                  fontSize: '14px'
                }}
              >
                <option value="">カテゴリを選択してください</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* メッセージ入力 */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: onDarkMode ? '#fff' : '#333',
                fontWeight: '500'
              }}>
                メッセージ *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="ご意見・ご要望をお聞かせください..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '12px',
                  border: `1px solid ${onDarkMode ? '#555' : '#ddd'}`,
                  borderRadius: '6px',
                  backgroundColor: onDarkMode ? '#333' : '#fff',
                  color: onDarkMode ? '#fff' : '#333',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* 送信ボタン */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  border: `1px solid ${onDarkMode ? '#555' : '#ddd'}`,
                  borderRadius: '6px',
                  backgroundColor: 'transparent',
                  color: onDarkMode ? '#ccc' : '#666',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !category || !message.trim()}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: isSubmitting || !category || !message.trim() 
                    ? onDarkMode ? '#555' : '#ccc'
                    : '#007bff',
                  color: '#fff',
                  cursor: isSubmitting || !category || !message.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {isSubmitting ? '送信中...' : '送信'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
