// ユーザーのサブスクリプション状態確認API
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // 実際の実装では、データベースからユーザーのプランを取得
    // 今回はサンプルとして、ランダムにプランを返す
    const plans = ['free', 'pro', 'premium'];
    const randomPlan = plans[Math.floor(Math.random() * plans.length)];
    
    return res.status(200).json({
      success: true,
      userId,
      plan: randomPlan,
      message: `現在のプラン: ${randomPlan}`
    });
    
  } catch (error) {
    console.error('Check subscription error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
