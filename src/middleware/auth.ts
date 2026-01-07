import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbGet } from '../db/schema';
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
    if (err) {
      return res.status(403).json({ error: '无效的认证令牌' });
    }

    const user = await dbGet('SELECT id, email, name, created_at FROM users WHERE id = ?', [decoded.userId]) as User;
    if (!user) {
      return res.status(403).json({ error: '用户不存在' });
    }

    req.user = user;
    next();
  });
}
