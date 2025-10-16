// src/components/UI/SubscriptionPanel.tsx
// サブスクリプション管理パネル

import React, { useState, useEffect } from 'react';
import { subscriptionService } from '../../services/SubscriptionService';
import { usageLimitService } from '../../services/UsageLimitService';
import { COLOR_PALETTE } from '../../styles/colorPalette';

interface SubscriptionPanelProps {
  onClose: () => void;
  isDarkMode: boolean;
}

const SubscriptionPanel: React.FC<SubscriptionPanelProps> = ({ onClose, isDarkMode }) => {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(subscriptionService.getStatus());
  const [usageText, setUsageText] = useState('');
  const [remainingDays, setRemainingDays] = useState(0);

  useEffect(() => {
    const updateStatus = async () => {
      setStatus(subscriptionService.getStatus());
      setRemainingDays(subscriptionService.getRemainingDays());
      const usage = await usageLimitService.getUsageStatusText();
      setUsageText(usage);
    };
    updateStatus();
  }, []);

  const handleActivateCode = () => {
    if (!code.trim()) {
      setMessage('コードを入力してください');
      return;
    }

    const result = subscriptionService.activateCode(code);
    setMessage(result.message);
    
    if (result.success) {
      setCode('');
      setStatus(subscriptionService.getStatus());
      setRemainingDays(subscriptionService.getRemainingDays());
      setTimeout(async () => {
        const usage = await usageLimitService.getUsageStatusText();
        setUsageText(usage);
      }, 100);
    }
  };

  const handleCancel = () => {
    if (!window.confirm('サブスクリプションを解約しますか？\n無料版に戻ります。')) {
      return;
    }
    
    subscriptionService.cancelSubscription();
    setStatus(subscriptionService.getStatus());
    setRemainingDays(0);
    setMessage('解約しました。無料版に戻りました。');
  };

  const handleUpgrade = (plan: 'basic' | 'premium') => {
    const link = subscriptionService.getStripePurchaseLink(plan);
    window.open(link, '_blank');
  };

  const handleManageSubscription = () => {
    const link = subscriptionService.getStripePortalLink();
    window.open(link, '_blank');
  };

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflowY: 'auto',
    backgroundColor: isDarkMode ? '#2c2c2c' : '#fff',
    color: isDarkMode ? '#e0e0e0' : '#333',
    border: `2px solid ${isDarkMode ? '#444' : '#ddd'}`,
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    zIndex: 10000,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: `2px solid ${isDarkMode ? '#444' : '#ddd'}`,
  };

  const planBadgeStyle = (currentPlan: boolean): React.CSSProperties => ({
    display: 'inline-block',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
    backgroundColor: currentPlan 
      ? (status.plan === 'premium' ? COLOR_PALETTE.primary.purple : COLOR_PALETTE.primary.orange)
      : isDarkMode ? '#444' : '#f5f5f5',
    color: currentPlan ? '#fff' : isDarkMode ? '#999' : '#666',
    marginBottom: '12px',
  });

  const buttonStyle = (color: string, isSecondary: boolean = false): React.CSSProperties => ({
    padding: '10px 20px',
    backgroundColor: isSecondary ? 'transparent' : color,
    color: isSecondary ? color : '#fff',
    border: `2px solid ${color}`,
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.2s',
  });

  const planCardStyle: React.CSSProperties = {
    border: `2px solid ${isDarkMode ? '#444' : '#ddd'}`,
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    backgroundColor: isDarkMode ? '#333' : '#f9f9f9',
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
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
        }}
        onClick={onClose}
      />

      {/* パネル本体 */}
      <div style={panelStyle}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            💎 サブスクリプション管理
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: isDarkMode ? '#e0e0e0' : '#333',
            }}
          >
            ×
          </button>
        </div>

        {/* 現在のプラン表示 */}
        <div style={{ marginBottom: '24px' }}>
          <div style={planBadgeStyle(true)}>
            {status.plan === 'premium' && '👑 '}
            {status.plan === 'basic' && '💎 '}
            {status.plan === 'free' && '📦 '}
            現在のプラン: {subscriptionService.getPlanName()}
          </div>
          
          <div style={{ fontSize: '14px', color: isDarkMode ? '#aaa' : '#666', marginBottom: '8px' }}>
            <div>AI生成回数: {usageText}</div>
            {status.expiresAt && (
              <div style={{ marginTop: '4px' }}>
                有効期限: {new Date(status.expiresAt).toLocaleDateString('ja-JP')} まで
                （残り {remainingDays} 日）
              </div>
            )}
            {status.isTrialMode && (
              <div style={{ marginTop: '4px', color: COLOR_PALETTE.primary.orange, fontWeight: 'bold' }}>
                🎁 トライアル期間中
              </div>
            )}
          </div>
        </div>

        {/* メッセージ */}
        {message && (
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: message.includes('無効') || message.includes('解約')
                ? isDarkMode ? '#4a2222' : '#ffe0e0'
                : isDarkMode ? '#224a22' : '#e0ffe0',
              color: message.includes('無効') || message.includes('解約')
                ? isDarkMode ? '#ff8888' : '#cc0000'
                : isDarkMode ? '#88ff88' : '#006600',
              marginBottom: '16px',
              fontSize: '14px',
            }}
          >
            {message}
          </div>
        )}

        {/* トライアルコード入力 */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>🎁 トライアルコード入力</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="TRIAL7"
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: `2px solid ${isDarkMode ? '#444' : '#ddd'}`,
                backgroundColor: isDarkMode ? '#333' : '#fff',
                color: isDarkMode ? '#e0e0e0' : '#333',
                fontSize: '14px',
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleActivateCode()}
            />
            <button
              onClick={handleActivateCode}
              style={buttonStyle(COLOR_PALETTE.primary.orange)}
            >
              適用
            </button>
          </div>
          <div style={{ fontSize: '12px', color: isDarkMode ? '#888' : '#999', marginTop: '8px' }}>
            ヒント: TRIAL7 で7日間無料トライアル
          </div>
        </div>

        {/* 有料版アクティブ時の管理ボタン */}
        {status.plan !== 'free' && status.code && (
          <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
            <button
              onClick={handleManageSubscription}
              style={buttonStyle(COLOR_PALETTE.primary.purple, true)}
            >
              サブスク管理
            </button>
            <button
              onClick={handleCancel}
              style={buttonStyle(COLOR_PALETTE.primary.red, true)}
            >
              解約する
            </button>
          </div>
        )}

        {/* プラン一覧 */}
        <div>
          <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>💎 プラン一覧</h3>

          {/* ベーシック版 */}
          <div style={planCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                  💎 ベーシック版
                </div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: COLOR_PALETTE.primary.orange }}>
                  ¥300/月
                </div>
              </div>
            </div>
            <ul style={{ fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px', marginBottom: '12px' }}>
              <li>AI生成: <strong>100回/日</strong></li>
              <li>プロジェクト保存: 無制限（ローカル）</li>
              <li>メールサポート</li>
              <li>初回7日間無料</li>
            </ul>
            {status.plan !== 'basic' && (
              <button
                onClick={() => handleUpgrade('basic')}
                style={buttonStyle(COLOR_PALETTE.primary.orange)}
              >
                アップグレード
              </button>
            )}
          </div>

          {/* プレミアム版 */}
          <div style={planCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                  👑 プレミアム版
                </div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: COLOR_PALETTE.primary.purple }}>
                  ¥980/月
                </div>
              </div>
            </div>
            <ul style={{ fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px', marginBottom: '12px' }}>
              <li>AI生成: <strong>完全無制限</strong></li>
              <li>プロジェクト保存: 無制限（ローカル）</li>
              <li>優先サポート</li>
              <li>ベータ機能先行アクセス</li>
              <li>初回7日間無料</li>
            </ul>
            {status.plan !== 'premium' && (
              <button
                onClick={() => handleUpgrade('premium')}
                style={buttonStyle(COLOR_PALETTE.primary.purple)}
              >
                アップグレード
              </button>
            )}
          </div>
        </div>

        {/* 注意事項 */}
        <div style={{ fontSize: '12px', color: isDarkMode ? '#888' : '#999', marginTop: '20px', paddingTop: '20px', borderTop: `1px solid ${isDarkMode ? '#444' : '#ddd'}` }}>
          <p style={{ margin: '0 0 8px 0' }}>
            ※ 決済はStripeで安全に処理されます
          </p>
          <p style={{ margin: '0 0 8px 0' }}>
            ※ いつでもキャンセル可能です
          </p>
          <p style={{ margin: 0 }}>
            ※ お問い合わせ: {process.env.REACT_APP_SUPPORT_EMAIL || 'support@example.com'}
          </p>
        </div>
      </div>
    </>
  );
};

export default SubscriptionPanel;

