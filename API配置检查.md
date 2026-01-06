# API配置检查清单

如果遇到 "API key or AK/SK is missing or invalid" 错误，请按以下步骤检查：

## 1. 检查 .env 文件

确保 `.env` 文件存在且包含以下配置：

```env
ARK_API_KEY=你的完整API密钥（前后无空格）
ARK_MODEL_ID=ep-xxxxx（完整的模型ID）
ARK_API_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
```

**注意**：
- 不要使用引号包裹值
- 确保没有多余的空格
- 确保值在同一行，没有换行

## 2. 验证API密钥

1. 登录火山方舟控制台
2. 进入"API Key管理"
3. 确认密钥状态为"有效"
4. 复制完整的密钥（不要遗漏任何字符）

## 3. 验证模型ID

1. 登录火山方舟控制台
2. 进入"模型商城"
3. 找到您创建的访问点
4. 复制完整的访问点ID（格式：`ep-20241208200930-xxxxx`）
5. 确认访问点状态为"已启用"

## 4. 验证API端点

根据您的区域，API端点可能不同：

- 北京：`https://ark.cn-beijing.volces.com/api/v3`
- 其他区域：请查看控制台中的实际端点

## 5. 测试配置

创建测试文件 `test-api.js`：

```javascript
require('dotenv').config();

console.log('ARK_API_KEY:', process.env.ARK_API_KEY ? '已配置' : '未配置');
console.log('ARK_MODEL_ID:', process.env.ARK_MODEL_ID || '未配置');
console.log('ARK_API_BASE_URL:', process.env.ARK_API_BASE_URL || '未配置');

// 检查密钥长度（通常API密钥有一定长度）
if (process.env.ARK_API_KEY) {
  console.log('API密钥长度:', process.env.ARK_API_KEY.length);
}

// 检查模型ID格式
if (process.env.ARK_MODEL_ID) {
  const isValid = process.env.ARK_MODEL_ID.startsWith('ep-');
  console.log('模型ID格式:', isValid ? '正确' : '错误（应以ep-开头）');
}
```

运行测试：
```bash
node test-api.js
```

## 6. 常见错误原因

1. **密钥前后有空格**：复制时可能带入了空格
2. **密钥不完整**：复制时遗漏了部分字符
3. **模型ID错误**：使用了错误的访问点ID
4. **端点错误**：使用了错误的API端点
5. **密钥已过期**：检查密钥的有效期
6. **IP白名单限制**：如果启用了IP白名单，确保当前IP在列表中

## 7. 重新启动服务

修改 `.env` 文件后，需要重新启动服务：

```bash
# 停止当前服务（Ctrl+C）
# 然后重新启动
npm run dev
```

## 8. 查看详细错误

如果问题仍然存在，查看服务器日志中的详细错误信息，可能包含：
- 请求的URL
- 请求头信息
- 错误详情

这些信息可以帮助进一步诊断问题。
