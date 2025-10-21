// src/components/UI/SubscriptionPanel.tsx
// サブスクリプション管理パネル

import React, { useState, useEffect } from 'react';
import { subscriptionService } from '../../services/SubscriptionService';
import { usageLimitService } from '../../services/UsageLimitService';
import { COLOR_PALETTE } from '../../styles/colorPalette';
import { SubscriptionPlan } from '../../types';

interface SubscriptionPanelProps {
  onClose: () => void;
  isDarkMode: boolean;
}

const SubscriptionPanel: React.FC<SubscriptionPanelProps> = ({ onClose, isDarkMode }) => {
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


  const handleCancel = () => {
    if (!window.confirm('サブスクリプションを解約しますか？\nPayPalの管理画面に移動します。')) {
      return;
    }
    
    // PayPal Customer Portalに移動
    const portalUrl = subscriptionService.getPortalLink();
    window.open(portalUrl, '_blank');
    setMessage('PayPalの管理画面で解約手続きを行ってください。');
  };

  const handleUpgrade = (plan: 'pro' | 'premium') => {
    const link = subscriptionService.getPurchaseLink(plan);
    window.open(link, '_blank');
  };


  const handleManageSubscription = () => {
    const link = subscriptionService.getPortalLink();
    window.open(link, '_blank');
  };

  // テスト用のプラン変更機能
  const handleTestPlanChange = async (plan: 'free' | 'pro' | 'premium') => {
    subscriptionService.setPlan(plan);
    setStatus(subscriptionService.getStatus());
    setRemainingDays(subscriptionService.getRemainingDays());
    
    // 実際の制限を確認
    const usage = await usageLimitService.getUsageStatusText();
    setUsageText(usage);
    
    setMessage(`${subscriptionService.getPlanName()}に変更しました。制限: ${usage}`);
  };

  // 実際のAI生成制限をテストする機能
  const handleTestAILimit = async () => {
    try {
      const limitCheck = await usageLimitService.canUseAI();
      if (limitCheck.allowed) {
        setMessage(`✅ AI生成可能！残り: 日次${limitCheck.remaining?.daily}回, 累計${limitCheck.remaining?.total}回`);
      } else {
        setMessage(`❌ AI生成不可: ${limitCheck.reason}`);
      }
    } catch (error) {
      setMessage(`❌ エラー: ${error}`);
    }
  };

  // PayPal決済状態を手動で確認する機能
  const handleCheckPayPalStatus = async () => {
    setMessage('🔄 PayPal決済状態を確認中...');
    
    try {
      // 実際のPayPal API連携は後で実装
      // 現在は模擬的な確認
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模擬的な決済状態確認（実際のPayPal API連携時に置き換え）
      const mockPayPalStatus = {
        active: false, // 実際のPayPal APIで決済状態をチェック
        plan: 'free' as SubscriptionPlan,
        subscriptionId: null
      };
      
      if (mockPayPalStatus.active) {
        subscriptionService.setPlan(mockPayPalStatus.plan);
        setStatus(subscriptionService.getStatus());
        setRemainingDays(subscriptionService.getRemainingDays());
        setMessage(`✅ PayPal決済が確認されました！プラン: ${subscriptionService.getPlanName()}`);
      } else {
        setMessage('ℹ️ PayPal決済は確認されませんでした。\n現在は手動でプランを変更してください。');
      }
    } catch (error) {
      setMessage(`❌ エラー: ${error}`);
    }
  };

  // サーバーからプラン状態を確認する機能
  const handleCheckServerStatus = async () => {
    setMessage('🔄 サーバーからプラン状態を確認中...');
    
    // ユーザーIDを生成（実際の実装では、ユーザー認証から取得）
    const userId = 'user_' + Math.random().toString(36).substr(2, 9);
    
    try {
      const result = await subscriptionService.checkServerSubscription(userId);
      setMessage(result.message);
      
      if (result.success) {
        setStatus(subscriptionService.getStatus());
        setRemainingDays(subscriptionService.getRemainingDays());
        setTimeout(async () => {
          const usage = await usageLimitService.getUsageStatusText();
          setUsageText(usage);
        }, 100);
      }
    } catch (error) {
      setMessage('❌ サーバーとの通信に失敗しました');
    }
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
            {status.plan === 'pro' && '💎 '}
            {status.plan === 'free' && '📦 '}
            現在のプラン: {subscriptionService.getPlanName()}
          </div>
          
          
          <div style={{ fontSize: '14px', color: isDarkMode ? '#aaa' : '#666', marginBottom: '8px' }}>
            <div>AI生成回数: {usageText}</div>
            <div style={{ marginTop: '4px', fontSize: '12px', color: isDarkMode ? '#888' : '#999' }}>
              制限詳細: 無料版=10回/日, プロ版=100回/日, プレミアム版=無制限
            </div>
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



        {/* 有料版アクティブ時の管理ボタン */}
        {status.plan !== 'free' && (
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

          {/* プロ版 */}
          <div style={planCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                  💎 プロ版
                </div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: COLOR_PALETTE.primary.orange }}>
                  ¥300/月
                </div>
              </div>
            </div>
            <ul style={{ fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px', marginBottom: '12px' }}>
              <li>AI生成: <strong>100回/日</strong></li>
              <li>初回7日間無料</li>
            </ul>
            {status.plan !== 'pro' && (
              <button
                onClick={() => handleUpgrade('pro')}
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
          ※ 決済はPayPalで安全に処理されます
        </p>
        <p style={{ margin: '0 0 8px 0' }}>
          ※ お問い合わせ: guidajiben3@gmail.com
        </p>
        <p style={{ margin: '0 0 8px 0' }}>
          ※ いつでもキャンセル可能です
        </p>
        
        {/* 開発者用機能（本番では非表示） */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: `1px solid ${isDarkMode ? '#444' : '#ddd'}` }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: isDarkMode ? '#ff6b6b' : '#e74c3c' }}>
              🔧 開発者用機能
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={handleCheckServerStatus}
                style={{
                  padding: '6px 12px',
                  fontSize: '11px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                🌐 サーバー確認
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default SubscriptionPanel;

