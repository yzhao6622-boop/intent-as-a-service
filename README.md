# Intent-as-a-Service (AI可验证意图市场)

把"人的真实意图"变成一种可被验证、交易、订阅的数字资产。

## 核心概念

这个平台解决的核心问题是：**如何验证和交易"已经下定决心、即将行动的意图"**。

### 关键特性

1. **意图挖掘**：AI从用户输入推理真实意图，而非表面需求
2. **意图验证**：AI作为审计员，反复质疑动机，捕捉犹豫和拖延
3. **意图演进追踪**：动态跟踪意图从A阶段到B阶段的进展
4. **意图市场**：已验证的意图可以被交易和订阅
5. **可信度评分**：基于AI分析的可信度评分系统

## 技术栈

### 后端
- Node.js + Express + TypeScript
- SQLite（数据库）
- 火山方舟（Ark）API（AI服务）
- JWT（认证）

### 前端
- React + TypeScript
- Vite（构建工具）
- Tailwind CSS（样式）
- React Router（路由）

## 快速开始

### 1. 安装依赖

```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
cd ..
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写：

```env
PORT=3002
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
ARK_API_KEY=your-ark-api-key
ARK_MODEL_ID=ep-20241208200930-xxxxx
DB_PATH=./data/intent.db
```

**注意**：
- `ARK_API_KEY`: 火山方舟API密钥（在火山方舟控制台的"API Key管理"中创建）
- `ARK_MODEL_ID`: 模型访问点ID（在火山方舟模型商城选择模型并创建访问点后获取，格式通常为 `ep-xxxxx`）

### 3. 初始化数据库

```bash
npm run migrate
```

### 4. 启动开发服务器

```bash
# 同时启动前后端
npm run dev

# 或分别启动
npm run dev:server  # 后端：http://localhost:3002
npm run dev:client  # 前端：http://localhost:5173
```

## API文档

### 认证

- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录

### 意图管理

- `POST /api/intents/create` - 创建意图（AI挖掘）
- `GET /api/intents/list` - 获取意图列表
- `GET /api/intents/:id` - 获取意图详情
- `POST /api/intents/:id/verify` - 验证意图
- `POST /api/intents/:id/track` - 追踪意图演进
- `PATCH /api/intents/:id/status` - 更新意图状态

### AI对话

- `POST /api/ai/chat/:intentId` - 与AI意图审计员对话

### 市场

- `POST /api/marketplace/publish/:intentId` - 发布意图到市场
- `GET /api/marketplace/browse` - 浏览市场
- `POST /api/marketplace/purchase/:marketplaceId` - 购买/订阅意图

## 使用流程

1. **注册/登录**：创建账户
2. **创建意图**：描述您的真实意图，AI将分析并生成意图档案
3. **AI验证**：与AI审计员对话，验证您的真实意图
4. **追踪进展**：AI追踪您的意图演进，更新可信度评分
5. **发布市场**（可选）：将已验证的意图发布到市场供他人订阅

## 典型应用场景

- **职业转型**：从零基础转行做前端工程师
- **医疗决策**：选择手术/治疗路径
- **大额消费**：买车/买房/留学决策
- **关系决策**：离婚/和解等重大决定
- **学习成长**：系统化学习计划

## 商业模式

1. **Intent API（To B）**：按已验证意图收费，比CPL贵5-10倍
2. **用户订阅**：为意图坚持/防反悔/决策陪伴付费
3. **意图保险**（后期）：如果AI判断未执行，退费；执行成功，平台抽成

## 项目结构

```
intent-as-a-service/
├── src/                    # 后端源码
│   ├── db/                # 数据库相关
│   ├── routes/            # API路由
│   ├── services/          # 业务逻辑（AI服务）
│   ├── middleware/        # 中间件（认证等）
│   └── types/             # TypeScript类型定义
├── client/                # 前端源码
│   ├── src/
│   │   ├── components/    # React组件
│   │   ├── context/       # React Context
│   │   └── api/           # API客户端
└── data/                  # 数据库文件（自动生成）
```

## 开发说明

- 后端使用TypeScript，编译到 `dist/` 目录
- 前端使用Vite，开发时热重载
- 数据库使用SQLite，文件存储在 `data/intent.db`
- AI服务需要火山方舟（Ark）API密钥和模型ID

## 项目文档

- **启动说明**：`启动说明.md` - 本地开发启动指南
- **功能说明**：`功能说明.md` - 完整功能列表和API文档
- **火山方舟配置**：`火山方舟配置说明.md` - AI服务配置详细说明
- **API配置检查**：`API配置检查.md` - API配置问题排查
- **部署指南**：`部署指南.md` - 云端部署完整指南
- **阿里云Windows部署**：`阿里云Windows部署指南.md` - 阿里云Windows服务器部署
- **PM2使用指南**：`PM2使用指南.md` - 进程管理工具使用
- **Git配置指南**：`Git配置和使用指南.md` - Git配置和代码更新
- **项目更新指南**：`项目更新指南.md` - 服务器上更新项目的方法

## 常用脚本

### 开发
- `npm run dev` - 同时启动前后端开发服务器
- `npm run dev:server` - 仅启动后端
- `npm run dev:client` - 仅启动前端

### 构建
- `npm run build` - 构建前后端
- `npm run build:server` - 仅构建后端
- `npm run build:client` - 仅构建前端

### 部署
- `一键启动所有服务.bat` - 使用PM2启动所有服务（Windows）
- `更新项目.bat` - 更新项目代码和依赖（Windows）
- `检查Git配置.bat` - 检查Git配置状态（Windows）

## License

MIT
