// PayPal Webhook受信API
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { event_type, resource } = req.body;
    
    // サブスクリプション作成イベントをチェック
    if (event_type === 'BILLING.SUBSCRIPTION.CREATED' || 
        event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
      
      const subscriptionId = resource.id;
      const planId = resource.plan_id;
      
      // プラン判定
      let userPlan = 'free';
      if (planId.includes('pro')) {
        userPlan = 'pro';
      } else if (planId.includes('premium')) {
        userPlan = 'premium';
      }
      
      // ユーザーIDを取得（PayPalのpayer_idを使用）
      const userId = resource.subscriber?.payer_id || 'unknown';
      
      console.log(`ユーザー ${userId} が ${userPlan} プランに変更されました`);
      
      // ここでデータベースに保存（今回はLocalStorageの代わり）
      // 実際の実装では、データベースに保存する必要があります
      
      return res.status(200).json({ 
        success: true, 
        message: `プランが ${userPlan} に更新されました`,
        userId,
        plan: userPlan
      });
    }
    
    // サブスクリプションキャンセルイベント
    if (event_type === 'BILLING.SUBSCRIPTION.CANCELLED') {
      const userId = resource.subscriber?.payer_id || 'unknown';
      
      console.log(`ユーザー ${userId} がサブスクリプションをキャンセルしました`);
      
      return res.status(200).json({ 
        success: true, 
        message: 'サブスクリプションがキャンセルされました',
        userId,
        plan: 'free'
      });
    }
    
    return res.status(200).json({ success: true, message: 'Webhook received' });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
