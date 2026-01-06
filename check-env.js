require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('='.repeat(60));
console.log('环境变量配置检查');
console.log('='.repeat(60));
console.log('');

// 检查必要的环境变量
const requiredVars = {
  'ARK_API_KEY': '火山方舟API密钥',
  'ARK_MODEL_ID': '模型ID',
  'ARK_API_BASE_URL': 'API端点',
  'JWT_SECRET': 'JWT密钥',
  'PORT': '服务器端口',
  'DB_PATH': '数据库路径',
};

let hasErrors = false;
let hasWarnings = false;

console.log('【必需配置检查】');
console.log('-'.repeat(60));

for (const [key, description] of Object.entries(requiredVars)) {
  const value = process.env[key];
  
  if (!value || value.trim() === '') {
    console.log(`❌ ${key} (${description}): 未配置`);
    hasErrors = true;
  } else if (value.includes('your-') || value.includes('xxxxx') || value === 'your-secret-key-change-in-production') {
    console.log(`⚠️  ${key} (${description}): 使用默认值，需要修改`);
    console.log(`   当前值: ${value.substring(0, 20)}...`);
    hasWarnings = true;
  } else {
    // 检查格式
    let formatOk = true;
    let formatMsg = '';
    
    if (key === 'ARK_MODEL_ID') {
      // 火山方舟支持多种模型ID格式：
      // 1. 访问点ID格式：ep-xxxxx
      // 2. 模型ID格式：doubao-seed-xxx, deepseek-xxx 等
      // 所以不强制检查格式，只要不是默认值即可
      if (value.length < 5) {
        formatOk = false;
        formatMsg = ' (长度异常，可能不完整)';
      }
    }
    
    if (key === 'ARK_API_KEY') {
      if (value.length < 10) {
        formatOk = false;
        formatMsg = ' (长度异常，可能不完整)';
      }
    }
    
    if (key === 'PORT') {
      const port = parseInt(value);
      if (isNaN(port) || port < 1 || port > 65535) {
        formatOk = false;
        formatMsg = ' (端口号无效)';
      }
    }
    
    if (formatOk) {
      // 隐藏敏感信息，只显示部分
      const displayValue = key.includes('KEY') || key.includes('SECRET') 
        ? `${value.substring(0, 8)}...${value.substring(value.length - 4)} (长度: ${value.length})`
        : value;
      console.log(`✅ ${key} (${description}): 已配置`);
      console.log(`   值: ${displayValue}`);
    } else {
      console.log(`⚠️  ${key} (${description}): 已配置但格式可能有问题${formatMsg}`);
      console.log(`   值: ${value.substring(0, 30)}...`);
      hasWarnings = true;
    }
  }
}

console.log('');
console.log('【额外检查】');
console.log('-'.repeat(60));

// 检查.env文件是否存在
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env 文件存在');
  
  // 检查文件内容（不显示敏感信息）
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  // 检查是否有注释掉的配置
  const commentedVars = [];
  lines.forEach(line => {
    if (line.trim().startsWith('#') && (line.includes('ARK_') || line.includes('JWT_'))) {
      const match = line.match(/#\s*(\w+)=/);
      if (match) {
        commentedVars.push(match[1]);
      }
    }
  });
  
  if (commentedVars.length > 0) {
    console.log(`⚠️  发现注释掉的配置项: ${commentedVars.join(', ')}`);
    console.log('   如果这些配置是必需的，请取消注释');
  }
  
  // 检查是否有空行或格式问题
  const emptyLines = lines.filter(line => line.trim() === '').length;
  if (emptyLines > 0) {
    console.log(`ℹ️  文件包含 ${emptyLines} 个空行（正常）`);
  }
  
} else {
  console.log('❌ .env 文件不存在');
  console.log('   请从 env.example 复制并重命名为 .env');
  hasErrors = true;
}

// 检查数据库路径
const dbPath = process.env.DB_PATH || './data/intent.db';
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  console.log(`⚠️  数据库目录不存在: ${dbDir}`);
  console.log('   应用启动时会自动创建');
}

console.log('');
console.log('='.repeat(60));

if (hasErrors) {
  console.log('❌ 发现错误：请修复上述问题后重试');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  发现警告：请检查上述配置项');
  process.exit(0);
} else {
  console.log('✅ 所有配置检查通过！');
  process.exit(0);
}
