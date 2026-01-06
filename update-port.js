const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env 文件不存在');
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf8');

// 检查并更新PORT
if (envContent.includes('PORT=3001')) {
  envContent = envContent.replace(/PORT=3001/g, 'PORT=3002');
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✅ 已更新 .env 文件：PORT=3001 → PORT=3002');
} else if (envContent.includes('PORT=')) {
  const portMatch = envContent.match(/PORT=(\d+)/);
  if (portMatch) {
    console.log(`ℹ️  .env 文件中的端口是 ${portMatch[1]}，不是 3001`);
    console.log('   如果需要改为 3002，请手动编辑 .env 文件');
  }
} else {
  // 添加PORT配置
  if (!envContent.endsWith('\n')) {
    envContent += '\n';
  }
  envContent += 'PORT=3002\n';
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✅ 已在 .env 文件中添加 PORT=3002');
}

console.log('\n请重启应用以使更改生效：');
console.log('1. 停止当前运行的服务（Ctrl+C）');
console.log('2. 运行: npm run dev');
