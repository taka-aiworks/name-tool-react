# 🔗 PayPal連携実装計画

## 🎯 現在の状況

### ✅ 実装済み
- PayPal決済リンク生成
- ローカル制限管理
- テスト用プラン切り替え

### ❌ 未実装
- PayPal決済完了の検知
- 自動プラン切り替え
- 決済状態の同期

## 🔧 実装方法

### **方法1: PayPal Webhook（推奨）**

```typescript
// PayPal Webhook エンドポイント
app.post('/webhook/paypal', (req, res) => {
  const { event_type, resource } = req.body;
  
  if (event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
    // サブスクリプション有効化
    const subscriptionId = resource.id;
    const planId = resource.plan_id;
    
    // ユーザーのプランを更新
    updateUserPlan(subscriptionId, planId);
  }
});
```

### **方法2: 定期チェック（簡易版）**

```typescript
// フロントエンドで定期チェック
setInterval(async () => {
  const status = await checkPayPalSubscription();
  if (status.changed) {
    updateLocalPlan(status.plan);
  }
}, 60000); // 1分ごと
```

### **方法3: 手動同期ボタン（現実的）**

```typescript
// ユーザーが手動で同期
const handleSyncSubscription = async () => {
  try {
    const paypalStatus = await checkPayPalStatus();
    if (paypalStatus.active) {
      subscriptionService.setPlan(paypalStatus.plan);
      setMessage('PayPal決済が確認されました！');
    }
  } catch (error) {
    setMessage('同期に失敗しました。しばらく待ってから再試行してください。');
  }
};
```

## 🚀 推奨実装順序

### **Phase 1: 手動同期（即座に実装可能）**
1. PayPal APIで決済状態をチェック
2. ユーザーが「同期」ボタンをクリック
3. 決済状態に応じてプランを更新

### **Phase 2: 自動同期（後日実装）**
1. PayPal Webhook設定
2. バックエンドAPI作成
3. リアルタイム同期

## 💡 現実的な解決策

**今すぐ実装できる方法**:
1. **PayPal API連携**で決済状態をチェック
2. **「決済状態を確認」ボタン**を追加
3. **手動同期**でプランを更新

**これで実際のPayPal決済と連携できます！**
