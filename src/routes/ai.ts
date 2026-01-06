import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { dbGet } from '../db/schema';
import { chatWithAI } from '../services/aiService';
import { Intent } from '../types';

const router = express.Router();

router.use(authenticateToken);

// AI对话
router.post('/chat/:intentId', async (req: AuthRequest, res) => {
  try {
    const intentId = parseInt(req.params.intentId);
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: '消息内容不能为空' });
    }

    // 验证意图所有权
    const intent = await dbGet('SELECT * FROM intents WHERE id = ?', [intentId]) as Intent;
    if (!intent || intent.user_id !== req.user!.id) {
      return res.status(403).json({ error: '无权访问此意图' });
    }

    // 与AI对话
    const aiResponse = await chatWithAI(intentId, message);

    res.json({
      response: aiResponse,
    });
  } catch (error) {
    console.error('AI对话错误:', error);
    res.status(500).json({ error: 'AI对话失败' });
  }
});

export default router;
