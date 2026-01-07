import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { dbRun, dbGet, dbAll } from '../db/schema';
import { Intent } from '../types';

const router = express.Router();

router.use(authenticateToken);

// 将意图发布到市场
router.post('/publish/:intentId', async (req: AuthRequest, res) => {
  try {
    const intentId = parseInt(req.params.intentId);
    const { price, transaction_type = 'subscription' } = req.body;

    const intent = await dbGet('SELECT * FROM intents WHERE id = ?', [intentId]) as Intent;
    if (!intent || intent.user_id !== req.user!.id) {
      return res.status(403).json({ error: '无权访问此意图' });
    }

    // 检查是否已经发布
    const existing = await dbGet(
      'SELECT * FROM intent_marketplace WHERE intent_id = ? AND status = ?',
      [intentId, 'available']
    );

    if (existing) {
      return res.status(400).json({ error: '该意图已经发布到市场' });
    }

    // 发布到市场
    await dbRun(
      `INSERT INTO intent_marketplace (intent_id, seller_id, price, transaction_type, status)
       VALUES (?, ?, ?, ?, 'available')`,
      [intentId, req.user!.id, price || null, transaction_type]
    );

    res.json({ message: '意图已发布到市场' });
  } catch (error) {
    console.error('发布意图错误:', error);
    res.status(500).json({ error: '发布意图失败' });
  }
});

// 工具函数：脱敏用户名/邮箱
function maskEmail(email: string): string {
  if (!email) return '';
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;
  
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }
  
  const visibleStart = localPart.substring(0, 2);
  const visibleEnd = localPart.length > 4 ? localPart.substring(localPart.length - 1) : '';
  return `${visibleStart}***${visibleEnd}@${domain}`;
}

// 浏览市场中的意图（返回所有用户的意图）
router.get('/browse', async (req: AuthRequest, res) => {
  try {
    const { category, min_credibility } = req.query;

    // 查询所有意图，不仅仅是已发布的
    let query = `
      SELECT 
        i.id as intent_id,
        i.id as marketplace_id,
        i.title,
        i.description,
        i.category,
        i.credibility_score,
        i.time_window_days,
        i.status,
        i.created_at,
        u.email as seller_email,
        u.name as seller_name,
        m.price,
        m.transaction_type,
        m.status as marketplace_status
      FROM intents i
      JOIN users u ON i.user_id = u.id
      LEFT JOIN intent_marketplace m ON i.id = m.intent_id AND m.status = 'available'
      WHERE i.status != 'abandoned'
    `;

    const params: any[] = [];

    if (category) {
      query += ' AND i.category = ?';
      params.push(category);
    }

    if (min_credibility) {
      query += ' AND i.credibility_score >= ?';
      params.push(parseFloat(min_credibility as string));
    }

    query += ' ORDER BY i.credibility_score DESC, i.created_at DESC';

    const listings = await dbAll(query, params) as any[];

    // 脱敏用户名/邮箱
    const maskedListings = listings.map(listing => ({
      ...listing,
      seller_email: maskEmail(listing.seller_email || ''),
      seller_name: listing.seller_name || maskEmail(listing.seller_email || ''),
    }));

    res.json(maskedListings);
  } catch (error) {
    console.error('浏览市场错误:', error);
    res.status(500).json({ error: '浏览市场失败' });
  }
});

// 购买/订阅意图
router.post('/purchase/:marketplaceId', async (req: AuthRequest, res) => {
  try {
    const marketplaceId = parseInt(req.params.marketplaceId);

    // 先尝试通过marketplace_id查找
    let listing = await dbGet(
      'SELECT * FROM intent_marketplace WHERE id = ?',
      [marketplaceId]
    ) as any;

    // 如果找不到，可能是通过intent_id购买，需要先发布到市场
    if (!listing) {
      // 检查是否是意图ID
      const intent = await dbGet(
        'SELECT * FROM intents WHERE id = ?',
        [marketplaceId]
      ) as any;

      if (!intent) {
        return res.status(404).json({ error: '意图不存在' });
      }

      if (intent.user_id === req.user!.id) {
        return res.status(400).json({ error: '不能购买自己的意图' });
      }

      // 自动发布到市场并购买
      const result = await dbRun(
        `INSERT INTO intent_marketplace (intent_id, seller_id, buyer_id, status, purchased_at)
         VALUES (?, ?, ?, 'purchased', CURRENT_TIMESTAMP)`,
        [marketplaceId, intent.user_id, req.user!.id]
      );

      res.json({ message: '购买成功' });
      return;
    }

    if (listing.status !== 'available') {
      return res.status(400).json({ error: '该意图已不可用' });
    }

    // 获取意图信息以检查所有者
    const intent = await dbGet(
      'SELECT * FROM intents WHERE id = ?',
      [listing.intent_id]
    ) as any;

    if (intent && intent.user_id === req.user!.id) {
      return res.status(400).json({ error: '不能购买自己的意图' });
    }

    // 更新购买记录
    await dbRun(
      `UPDATE intent_marketplace 
       SET buyer_id = ?, status = 'purchased', purchased_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [req.user!.id, marketplaceId]
    );

    res.json({ message: '购买成功' });
  } catch (error) {
    console.error('购买意图错误:', error);
    res.status(500).json({ error: '购买意图失败' });
  }
});

export default router;
