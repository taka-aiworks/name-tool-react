// src/components/ServiceStatusBanner.tsx
// サービス状態表示バナー

import React from 'react';
import { ServiceStatus } from '../types';

interface ServiceStatusBannerProps {
  isDarkMode: boolean;
}

const ServiceStatusBanner: React.FC<ServiceStatusBannerProps> = ({ isDarkMode }) => {
  // 環境変数からサービス状態を取得
  const getServiceStatus = (): ServiceStatus => {
    const status = process.env.REACT_APP_SERVICE_STATUS || 'active';
    const endDate = process.env.REACT_APP_SERVICE_END_DATE;
    const maintenanceMessage = process.env.REACT_APP_MAINTENANCE_MESSAGE;

    return {
      status: status as 'active' | 'ending' | 'maintenance' | 'closed',
      endDate,
      maintenanceMessage,
    };
  };

  const serviceStatus = getServiceStatus();

  // アクティブな場合は何も表示しない
  if (serviceStatus.status === 'active') {
    return null;
  }

  // メンテナンス中の場合は全画面表示
  if (serviceStatus.status === 'maintenance') {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100000,
          padding: '20px',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔧</div>
        <h1 style={{ fontSize: '24px', marginBottom: '12px', color: isDarkMode ? '#e0e0e0' : '#333' }}>
          メンテナンス中
        </h1>
        <p style={{ fontSize: '16px', color: isDarkMode ? '#aaa' : '#666', textAlign: 'center', maxWidth: '600px' }}>
          {serviceStatus.maintenanceMessage || 'システムメンテナンスのため、一時的にサービスを停止しています。しばらくお待ちください。'}
        </p>
      </div>
    );
  }

  // サービス終了の場合は全画面表示
  if (serviceStatus.status === 'closed') {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100000,
          padding: '20px',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>👋</div>
        <h1 style={{ fontSize: '24px', marginBottom: '12px', color: isDarkMode ? '#e0e0e0' : '#333' }}>
          サービス終了のお知らせ
        </h1>
        <p style={{ fontSize: '16px', color: isDarkMode ? '#aaa' : '#666', textAlign: 'center', maxWidth: '600px', lineHeight: '1.6' }}>
          AI漫画ネームメーカーをご利用いただき、ありがとうございました。
          <br />
          サービスは終了いたしました。
          <br />
          <br />
          保存したプロジェクトデータは、ブラウザのローカルストレージに残っています。
          <br />
          データのバックアップが必要な場合は、お早めにエクスポートしてください。
        </p>
      </div>
    );
  }

  // サービス終了告知バナー
  if (serviceStatus.status === 'ending' && serviceStatus.endDate) {
    const endDate = new Date(serviceStatus.endDate);
    const today = new Date();
    const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#ff6b6b',
          color: '#fff',
          padding: '12px 20px',
          textAlign: 'center',
          zIndex: 10001,
          fontSize: '14px',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        }}
      >
        ⚠️ このサービスは {endDate.toLocaleDateString('ja-JP')} に終了します（残り {daysLeft} 日）
        <br />
        <span style={{ fontSize: '12px', fontWeight: 'normal' }}>
          プロジェクトデータをエクスポートして保存してください
        </span>
      </div>
    );
  }

  return null;
};

export default ServiceStatusBanner;

