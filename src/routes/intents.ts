import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { dbRun, dbGet, dbAll } from '../db/schema';
import { mineIntent, verifyIntent, trackIntentEvolution, generateIntentStages } from '../services/aiService';
import { Intent, IntentProfile } from '../types';

const router = express.Router();

// 所有路由都需要认证
router.use(authenticateToken);

// 创建意图（从用户输入挖掘）
router.post('/create', async (req: AuthRequest, res) => {
  try {
    const { userInput } = req.body;
    console.log(`[创建意图] 用户ID: ${req.user!.id}, 输入: ${userInput?.substring(0, 100)}...`);

    if (!userInput) {
      return res.status(400).json({ error: '用户输入是必填项' });
    }

    // AI挖掘意图
    console.log(`[创建意图] 开始AI挖掘意图...`);
    let minedIntent;
    try {
      minedIntent = await mineIntent(userInput);
      console.log(`[创建意图] AI挖掘成功:`, minedIntent);
    } catch (error: any) {
      console.error(`[创建意图] AI挖掘失败:`, error);
      throw new Error(`AI挖掘意图失败: ${error.message || '未知错误'}`);
    }

    // 创建意图记录
    console.log(`[创建意图] 创建意图记录...`);
    const result = await dbRun(
      `INSERT INTO intents (user_id, title, description, category, time_window_days, credibility_score, status, stage)
       VALUES (?, ?, ?, ?, ?, 0, 'active', 'initial')`,
      [
        req.user!.id,
        minedIntent.title,
        minedIntent.description,
        minedIntent.category,
        minedIntent.time_window_days,
      ]
    );

    const intentId = (result as any).lastID;
    console.log(`[创建意图] 意图记录创建成功，ID: ${intentId}`);

    // 生成阶段拆解
    console.log(`[创建意图] 生成阶段拆解...`);
    const intent = await dbGet('SELECT * FROM intents WHERE id = ?', [intentId]) as Intent;
    let stagesData;
    try {
      stagesData = await generateIntentStages(intent);
      console.log(`[创建意图] 阶段拆解生成成功，阶段数: ${stagesData.stages.length}`);
    } catch (error: any) {
      console.error(`[创建意图] 生成阶段拆解失败:`, error);
      // 即使阶段生成失败，也继续创建意图
      stagesData = { stages: [] };
    }

    // 保存阶段
    if (stagesData.stages && stagesData.stages.length > 0) {
      console.log(`[创建意图] 保存阶段...`);
      for (const stage of stagesData.stages) {
        await dbRun(
          `INSERT INTO intent_stages (intent_id, stage_name, stage_order, description, verification_points)
           VALUES (?, ?, ?, ?, ?)`,
          [intentId, stage.stage_name, stage.stage_order, stage.description, stage.verification_points]
        );
      }
      console.log(`[创建意图] 阶段保存成功`);
    }

    // 初始验证
    console.log(`[创建意图] 开始初始验证...`);
    let verification;
    try {
      verification = await verifyIntent(intentId);
      console.log(`[创建意图] 验证完成，可信度: ${verification.credibility_score}`);
      
      await dbRun(
        `UPDATE intents SET credibility_score = ? WHERE id = ?`,
        [verification.credibility_score, intentId]
      );

      await dbRun(
        `INSERT INTO verification_records (intent_id, verification_type, ai_analysis, passed)
         VALUES (?, 'initial', ?, ?)`,
        [intentId, verification.analysis, verification.passed ? 1 : 0]
      );
    } catch (error: any) {
      console.error(`[创建意图] 验证失败:`, error);
      // 即使验证失败，也继续返回意图
      console.log(`[创建意图] 验证失败，但继续创建意图`);
    }

    // 返回完整的意图档案
    console.log(`[创建意图] 获取意图档案...`);
    try {
      const intentProfile = await getIntentProfile(intentId);
      console.log(`[创建意图] 创建成功，意图ID: ${intentId}`);
      res.json(intentProfile);
    } catch (profileError: any) {
      console.error(`[创建意图] 获取意图档案失败:`, profileError);
      // 即使获取档案失败，也返回基本的意图信息
      const basicIntent = await dbGet('SELECT * FROM intents WHERE id = ?', [intentId]) as Intent;
      if (basicIntent) {
        res.json({
          intent: basicIntent,
          stages: [],
          credibility_score: basicIntent.credibility_score,
          progress_percentage: 0,
          recent_verifications: [],
        });
      } else {
        throw profileError;
      }
    }
  } catch (error: any) {
    console.error('[创建意图] 错误:', error);
    console.error('[创建意图] 错误详情:', error.message);
    console.error('[创建意图] 错误堆栈:', error.stack);
    
    // 确保错误信息能正确传递
    let errorMessage = '创建意图失败';
    if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    // 如果是AI相关错误，提供更友好的提示
    if (errorMessage.includes('AI') || errorMessage.includes('API')) {
      errorMessage = `AI服务错误: ${errorMessage}\n请检查AI API配置或稍后重试`;
    }
    
    console.error('[创建意图] 返回错误信息:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

// 获取用户的意图列表
router.get('/list', async (req: AuthRequest, res) => {
  try {
    console.log(`[GET /list] 用户ID: ${req.user!.id}`);
    const intents = await dbAll(
      'SELECT * FROM intents WHERE user_id = ? ORDER BY created_at DESC',
      [req.user!.id]
    ) as Intent[];

    console.log(`[GET /list] 找到 ${intents.length} 个意图`);
    console.log(`[GET /list] 意图ID列表:`, intents.map(i => i.id));
    res.json(intents);
  } catch (error: any) {
    console.error('[GET /list] 获取意图列表错误:', error);
    console.error('[GET /list] 错误详情:', error.message, error.stack);
    res.status(500).json({ error: `获取意图列表失败: ${error.message}` });
  }
});

// 删除意图 - 必须在 GET /:id 之前定义
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const intentId = parseInt(req.params.id);
    const intent = await dbGet('SELECT * FROM intents WHERE id = ?', [intentId]) as Intent;

    if (!intent) {
      return res.status(404).json({ error: '意图不存在' });
    }

    if (intent.user_id !== req.user!.id) {
      return res.status(403).json({ error: '无权删除此意图' });
    }

    // 删除相关的所有数据（级联删除）
    await dbRun('DELETE FROM verification_records WHERE intent_id = ?', [intentId]);
    await dbRun('DELETE FROM intent_stages WHERE intent_id = ?', [intentId]);
    await dbRun('DELETE FROM intent_progress WHERE intent_id = ?', [intentId]);
    await dbRun('DELETE FROM ai_conversations WHERE intent_id = ?', [intentId]);
    await dbRun('DELETE FROM intent_marketplace WHERE intent_id = ?', [intentId]);
    await dbRun('DELETE FROM intents WHERE id = ?', [intentId]);

    res.json({ message: '意图已删除' });
  } catch (error) {
    console.error('删除意图错误:', error);
    res.status(500).json({ error: '删除意图失败' });
  }
});

// 获取意图详情（完整档案）
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const intentId = parseInt(req.params.id);
    const intent = await dbGet('SELECT * FROM intents WHERE id = ?', [intentId]) as Intent;

    if (!intent) {
      return res.status(404).json({ error: '意图不存在' });
    }

    if (intent.user_id !== req.user!.id) {
      return res.status(403).json({ error: '无权访问此意图' });
    }

    const intentProfile = await getIntentProfile(intentId);
    res.json(intentProfile);
  } catch (error) {
    console.error('获取意图详情错误:', error);
    res.status(500).json({ error: '获取意图详情失败' });
  }
});

// 验证意图
router.post('/:id/verify', async (req: AuthRequest, res) => {
  try {
    const intentId = parseInt(req.params.id);
    const intent = await dbGet('SELECT * FROM intents WHERE id = ?', [intentId]) as Intent;

    if (!intent || intent.user_id !== req.user!.id) {
      return res.status(403).json({ error: '无权访问此意图' });
    }

    const verification = await verifyIntent(intentId);

    // 更新可信度评分
    await dbRun(
      'UPDATE intents SET credibility_score = ? WHERE id = ?',
      [verification.credibility_score, intentId]
    );

    // 保存验证记录
    await dbRun(
      `INSERT INTO verification_records (intent_id, verification_type, ai_analysis, passed)
       VALUES (?, 'periodic', ?, ?)`,
      [intentId, verification.analysis, verification.passed ? 1 : 0]
    );

    res.json(verification);
  } catch (error) {
    console.error('验证意图错误:', error);
    res.status(500).json({ error: '验证意图失败' });
  }
});

// 追踪意图演进
router.post('/:id/track', async (req: AuthRequest, res) => {
  try {
    const intentId = parseInt(req.params.id);
    const intent = await dbGet('SELECT * FROM intents WHERE id = ?', [intentId]) as Intent;

    if (!intent || intent.user_id !== req.user!.id) {
      return res.status(403).json({ error: '无权访问此意图' });
    }

    const evolution = await trackIntentEvolution(intentId);

    // 更新意图阶段
    await dbRun(
      'UPDATE intents SET stage = ? WHERE id = ?',
      [evolution.current_stage, intentId]
    );

    // 保存进展记录
    await dbRun(
      `INSERT INTO intent_progress (intent_id, progress_percentage, milestone, ai_assessment)
       VALUES (?, ?, ?, ?)`,
      [
        intentId,
        evolution.progress_percentage,
        evolution.next_milestone,
        JSON.stringify(evolution.recommendations),
      ]
    );

    res.json(evolution);
  } catch (error) {
    console.error('追踪意图演进错误:', error);
    res.status(500).json({ error: '追踪意图演进失败' });
  }
});

// 更新意图状态
router.patch('/:id/status', async (req: AuthRequest, res) => {
  try {
    const intentId = parseInt(req.params.id);
    const { status } = req.body;

    if (!['active', 'completed', 'abandoned', 'paused'].includes(status)) {
      return res.status(400).json({ error: '无效的状态' });
    }

    const intent = await dbGet('SELECT * FROM intents WHERE id = ?', [intentId]) as Intent;
    if (!intent || intent.user_id !== req.user!.id) {
      return res.status(403).json({ error: '无权访问此意图' });
    }

    await dbRun('UPDATE intents SET status = ? WHERE id = ?', [status, intentId]);

    res.json({ message: '状态更新成功' });
  } catch (error) {
    console.error('更新意图状态错误:', error);
    res.status(500).json({ error: '更新意图状态失败' });
  }
});


// 辅助函数：获取完整的意图档案
async function getIntentProfile(intentId: number): Promise<IntentProfile> {
  const intent = await dbGet('SELECT * FROM intents WHERE id = ?', [intentId]) as Intent;
  const stages = await dbAll(
    'SELECT * FROM intent_stages WHERE intent_id = ? ORDER BY stage_order',
    [intentId]
  );
  const recentVerifications = await dbAll(
    'SELECT * FROM verification_records WHERE intent_id = ? ORDER BY created_at DESC LIMIT 5',
    [intentId]
  );
  const progressRecords = await dbAll(
    'SELECT * FROM intent_progress WHERE intent_id = ? ORDER BY created_at DESC LIMIT 1',
    [intentId]
  );

  const progress_percentage = progressRecords.length > 0
    ? (progressRecords[0] as any).progress_percentage
    : 0;

  return {
    intent,
    stages,
    credibility_score: intent.credibility_score,
    progress_percentage,
    recent_verifications: recentVerifications as any,
  };
}

export default router;
