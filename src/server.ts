import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db/schema';

import authRoutes from './routes/auth';
import intentRoutes from './routes/intents';
import aiRoutes from './routes/ai';
import marketplaceRoutes from './routes/marketplace';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// 中间件
const corsOptions = {
  origin: process.env.FRONTEND_URL || process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL?.split(',') || ['http://localhost:5173']
    : true, // 开发环境允许所有来源
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/intents', intentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/marketplace', marketplaceRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Intent-as-a-Service API 运行中' });
});

// 初始化数据库并启动服务器
let server: any = null;

// 在进程退出前清理
const cleanup = () => {
  if (server) {
    console.log('正在关闭服务器...');
    server.close(() => {
      console.log('服务器已关闭');
      server = null;
    });
    // 强制关闭所有连接
    server.closeAllConnections?.();
  }
};

// 监听nodemon重启信号
process.once('SIGUSR2', () => {
  cleanup();
  process.kill(process.pid, 'SIGUSR2');
});

async function startServer() {
  try {
    // 先清理旧服务器实例
    cleanup();
    
    await initDatabase();
    
    // 尝试启动服务器，如果端口被占用则等待后重试
    const tryListen = (retries = 5, delay = 1500) => {
      if (retries === 0) {
        console.error(`❌ 端口 ${PORT} 被占用，无法启动服务器`);
        console.log('💡 请手动停止占用该端口的进程');
        return;
      }

      try {
        server = app.listen(PORT, '0.0.0.0', () => {
          console.log(`🚀 服务器运行在 http://0.0.0.0:${PORT}`);
          console.log(`📊 本地访问: http://localhost:${PORT}`);
          console.log(`📊 远程访问: http://your-server-ip:${PORT}`);
          console.log(`📊 健康检查: http://your-server-ip:${PORT}/health`);
        });

        // 处理服务器错误
        server.on('error', (err: any) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`⚠️  端口 ${PORT} 被占用，等待 ${delay}ms 后重试... (剩余 ${retries - 1} 次)`);
            if (server) {
              server.close();
              server.closeAllConnections?.();
              server = null;
            }
            setTimeout(() => tryListen(retries - 1, delay), delay);
          } else {
            console.error('服务器错误:', err);
          }
        });
      } catch (error: any) {
        if (error.code === 'EADDRINUSE') {
          console.log(`⚠️  端口 ${PORT} 被占用，等待 ${delay}ms 后重试... (剩余 ${retries - 1} 次)`);
          setTimeout(() => tryListen(retries - 1, delay), delay);
        } else {
          throw error;
        }
      }
    };

    // 等待一小段时间确保旧实例完全关闭
    setTimeout(() => {
      tryListen();
    }, 500);
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGTERM', () => {
  cleanup();
  setTimeout(() => process.exit(0), 1000);
});

process.on('SIGINT', () => {
  cleanup();
  setTimeout(() => process.exit(0), 1000);
});

startServer();
