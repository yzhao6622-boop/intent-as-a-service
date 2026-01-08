import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbGet, dbAll } from '../db/schema';
import { User } from '../types';

export interface AuthRequest extends Request {
  user?: User;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  // 允许 OPTIONS 预检请求通过（CORS 预检）
  if (req.method === 'OPTIONS') {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', async (err, decoded: any) => {
    try {
    if (err) {
        console.error('[认证] JWT验证失败:', err);
      return res.status(403).json({ error: '无效的认证令牌' });
    }

      if (!decoded || !decoded.userId) {
        console.error('[认证] JWT解码结果无效:', decoded);
        return res.status(403).json({ error: '无效的认证令牌：缺少用户ID' });
      }

      console.log(`[认证] JWT解码成功，decoded:`, decoded);
      console.log(`[认证] 查询用户，userId: ${decoded.userId}`);

    const user = await dbGet('SELECT id, email, name, created_at FROM users WHERE id = ?', [decoded.userId]) as User;
    if (!user) {
        console.error(`[认证] 用户不存在，userId: ${decoded.userId}`);
        // 列出所有用户ID以便调试
        const allUsers = await dbAll('SELECT id, email FROM users LIMIT 10') as any;
        console.error(`[认证] 数据库中的用户:`, allUsers);
      return res.status(403).json({ error: '用户不存在' });
    }

      console.log(`[认证] 用户验证成功，userId: ${user.id}, email: ${user.email}`);
    req.user = user;
    next();
    } catch (error: any) {
      console.error('[认证] 认证过程出错:', error);
      console.error('[认证] 错误详情:', error.message, error.stack);
      return res.status(500).json({ error: '认证过程出错' });
    }
  });
}
