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

// 浏览市场中的意图
router.get('/browse', async (req: AuthRequest, res) => {
  try {
    const { category, min_credibility } = req.query;

    let query = `
      SELECT 
        m.*,
        i.title,
        i.description,
        i.category,
        i.credibility_score,
        i.time_window_days,
        u.name as seller_name
      FROM intent_marketplace m
      JOIN intents i ON m.intent_id = i.id
      JOIN users u ON m.seller_id = u.id
      WHERE m.status = 'available'
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

    query += ' ORDER BY i.credibility_score DESC';

    const listings = await dbAll(query, params);

    res.json(listings);
  } catch (error) {
    console.error('浏览市场错误:', error);
    res.status(500).json({ error: '浏览市场失败' });
  }
});

// 购买/订阅意图
router.post('/purchase/:marketplaceId', async (req: AuthRequest, res) => {
  try {
    const marketplaceId = parseInt(req.params.marketplaceId);

    const listing = await dbGet(
      'SELECT * FROM intent_marketplace WHERE id = ?',
      [marketplaceId]
    ) as any;

    if (!listing) {
      return res.status(404).json({ error: '市场条目不存在' });
    }

    if (listing.status !== 'available') {
      return res.status(400).json({ error: '该意图已不可用' });
    }

    if (listing.seller_id === req.user!.id) {
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
