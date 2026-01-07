// PM2 启动脚本 - 用于启动 Vite 开发服务器
// 使用 .cjs 扩展名以支持 CommonJS
const { spawn } = require('child_process');
const path = require('path');

console.log('启动 Vite 开发服务器...');
console.log('工作目录:', __dirname);

const vite = spawn('npx', ['vite'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

vite.on('error', (error) => {
  console.error('启动失败:', error);
  process.exit(1);
});

vite.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.log(`Vite 进程退出，代码: ${code}`);
  }
  process.exit(code || 0);
});

// 处理退出信号
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，正在关闭...');
  vite.kill('SIGTERM');
  setTimeout(() => {
    vite.kill('SIGKILL');
    process.exit(0);
  }, 5000);
});

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信号，正在关闭...');
  vite.kill('SIGINT');
  setTimeout(() => {
    vite.kill('SIGKILL');
    process.exit(0);
  }, 5000);
});
