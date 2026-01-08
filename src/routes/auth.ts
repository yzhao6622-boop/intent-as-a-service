import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbGet, dbRun } from '../db/schema';

const router = express.Router();

// 注册
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码是必填项' });
    }

    // 检查用户是否已存在
    const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: '该邮箱已被注册' });
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    const result = await dbRun(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      [email, passwordHash, name || null]
    );

    // better-sqlite3 使用 lastInsertRowid 而不是 lastID
    const userId = (result as any).lastInsertRowid || (result as any).lastID;
    console.log(`[注册] 创建用户成功，用户ID: ${userId}, 邮箱: ${email}`);

    // 验证用户是否真的创建成功
    const verifyUser = await dbGet('SELECT id, email, name FROM users WHERE id = ?', [userId]);
    if (!verifyUser) {
      console.error(`[注册] 错误：用户创建后查询不到，用户ID: ${userId}`);
      return res.status(500).json({ error: '用户创建失败，请重试' });
    }
    console.log(`[注册] 验证用户存在:`, verifyUser);

    // 生成JWT令牌
    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    console.log(`[注册] 生成JWT token，userId: ${userId}`);

    res.json({
      token,
      user: {
        id: userId,
        email,
        name,
      },
    });
  } catch (error: any) {
    console.error('注册错误:', error);
    console.error('错误详情:', error.message, error.stack);
    res.status(500).json({ error: `注册失败: ${error.message || '未知错误'}` });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码是必填项' });
    }

    // 查找用户
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]) as any;
    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 验证密码
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

export default router;
