require('dotenv').config();
const axios = require('axios');

const ARK_API_KEY = process.env.ARK_API_KEY;
const ARK_MODEL_ID = process.env.ARK_MODEL_ID;
const ARK_API_BASE_URL = process.env.ARK_API_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';

console.log('='.repeat(60));
console.log('测试火山方舟API调用');
console.log('='.repeat(60));
console.log('');
console.log('配置信息:');
console.log('  API端点:', ARK_API_BASE_URL);
console.log('  模型ID:', ARK_MODEL_ID);
console.log('  API密钥长度:', ARK_API_KEY?.length || 0);
console.log('  API密钥前8位:', ARK_API_KEY?.substring(0, 8) || '未配置');
console.log('');

if (!ARK_API_KEY || !ARK_MODEL_ID) {
  console.error('❌ 缺少必要的配置');
  process.exit(1);
}

// 测试不同的认证方式
const testMethods = [
  {
    name: '方式1: Bearer Token',
    headers: {
      'Authorization': `Bearer ${ARK_API_KEY}`,
      'Content-Type': 'application/json',
    },
  },
  {
    name: '方式2: 直接使用API Key作为Token',
    headers: {
      'Authorization': ARK_API_KEY,
      'Content-Type': 'application/json',
    },
  },
  {
    name: '方式3: 使用X-API-Key header',
    headers: {
      'X-API-Key': ARK_API_KEY,
      'Content-Type': 'application/json',
    },
  },
];

async function testAPI(method) {
  try {
    console.log(`\n测试: ${method.name}`);
    console.log('-'.repeat(60));
    
    const response = await axios.post(
      `${ARK_API_BASE_URL}/chat/completions`,
      {
        model: ARK_MODEL_ID,
        messages: [
          { role: 'user', content: '你好' }
        ],
        temperature: 0.7,
      },
      {
        headers: method.headers,
        timeout: 10000,
      }
    );

    console.log('✅ 成功!');
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
    return true;
  } catch (error) {
    if (error.response) {
      console.log('❌ 失败');
      console.log('状态码:', error.response.status);
      console.log('错误信息:', error.response.data?.error?.message || error.message);
    } else {
      console.log('❌ 网络错误:', error.message);
    }
    return false;
  }
}

async function runTests() {
  for (const method of testMethods) {
    const success = await testAPI(method);
    if (success) {
      console.log(`\n✅ 找到有效的认证方式: ${method.name}`);
      console.log('\n请在代码中使用以下header配置:');
      console.log(JSON.stringify(method.headers, null, 2));
      return;
    }
    // 等待一下再测试下一个方法
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n❌ 所有认证方式都失败了');
  console.log('\n请检查:');
  console.log('1. API密钥是否正确');
  console.log('2. 模型ID是否正确');
  console.log('3. API端点是否正确');
  console.log('4. 账户是否有权限访问该模型');
}

runTests().catch(console.error);
