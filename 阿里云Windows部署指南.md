# 阿里云 Windows 服务器部署指南

本指南将帮助您在阿里云 Windows 服务器上部署 Intent-as-a-Service 应用。

## 📋 前置准备

### 1. 服务器要求

- **操作系统**：Windows Server 2019/2022 或 Windows 10/11
- **内存**：建议 2GB 以上
- **磁盘**：建议 20GB 以上
- **网络**：已配置公网 IP 和安全组规则

### 2. 需要安装的软件

- Node.js 18+
- Git
- PM2（进程管理，可选）
- IIS（用于反向代理，可选）

---

## 🚀 部署步骤

### 步骤1：连接服务器

#### 方式1：使用远程桌面（RDP）

1. 在阿里云控制台找到您的 ECS 实例
2. 点击"远程连接" → "Workbench远程连接" 或使用 RDP 客户端
3. 输入用户名和密码登录

#### 方式2：使用 PowerShell/CMD

如果您有 SSH 访问权限，可以使用 PowerShell 连接。

### 步骤2：安装 Node.js

1. **下载 Node.js**
   - 访问 https://nodejs.org/
   - 下载 Windows 安装包（LTS 版本，推荐 18.x 或 20.x）

2. **安装 Node.js**
   - 运行下载的 `.msi` 安装包
   - 选择默认选项，一路"下一步"
   - 确保勾选"Add to PATH"

3. **验证安装**
   打开 PowerShell 或 CMD，运行：
   ```powershell
   node --version
   npm --version
   ```
   应该显示版本号。

### 步骤3：安装 Git

1. **下载 Git**
   - 访问 https://git-scm.com/download/win
   - 下载 Windows 版本

2. **安装 Git**
   - 运行安装包，使用默认选项

3. **验证安装**
   ```powershell
   git --version
   ```

### 步骤4：克隆或上传代码

#### 方式1：使用 Git 克隆（推荐）

```powershell
# 进入您想存放项目的目录，例如 D:\
cd D:\

# 克隆代码（如果代码在 GitHub）
git clone https://github.com/your-username/intent-as-a-service.git

# 或使用您的仓库地址
cd intent-as-a-service
```

#### 方式2：使用 FTP/SFTP 上传

1. 使用 FileZilla 或其他 FTP 工具
2. 连接到服务器
3. 上传项目文件夹到服务器（例如：`D:\intent-as-a-service`）

### 步骤5：安装项目依赖

```powershell
# 进入项目目录
cd D:\intent-as-a-service

# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
cd ..
```

### 步骤6：配置环境变量

1. **创建 .env 文件**
   ```powershell
   # 在项目根目录创建 .env 文件
   # 可以复制 env.example
   copy env.example .env
   ```

2. **编辑 .env 文件**
   使用记事本或其他编辑器打开 `.env`：
   ```env
   # 服务器配置
   PORT=3002
   NODE_ENV=production
   FRONTEND_URL=http://your-server-ip:5173

   # JWT密钥（生成一个强随机字符串）
   JWT_SECRET=your-very-secure-random-string-at-least-32-characters

   # 火山方舟（Ark）API配置
   ARK_API_KEY=your-ark-api-key
   ARK_MODEL_ID=your-model-id
   ARK_API_BASE_URL=https://ark.cn-beijing.volces.com/api/v3

   # 数据库配置
   DB_PATH=./data/intent.db
   ```

3. **生成 JWT_SECRET**
   可以使用 PowerShell 生成：
   ```powershell
   -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
   ```

### 步骤7：初始化数据库

```powershell
npm run migrate
```

### 步骤8：构建应用

```powershell
# 构建后端
npm run build:server

# 构建前端
npm run build:client
```

### 步骤9：测试运行

```powershell
# 测试后端是否正常
npm start
```

如果看到 "🚀 服务器运行在 http://localhost:3002"，说明后端正常。

按 `Ctrl+C` 停止测试。

---

## 🔧 配置 Windows 服务（推荐）

### 方式1：使用 PM2（推荐）

#### 安装 PM2

```powershell
npm install -g pm2
npm install -g pm2-windows-startup
```

#### 配置 PM2

```powershell
# 启动应用
pm2 start ecosystem.config.js

# 保存配置
pm2 save

# 设置开机自启
pm2-startup install
```

#### PM2 常用命令

```powershell
# 查看状态
pm2 status

# 查看日志
pm2 logs intent-api

# 重启
pm2 restart intent-api

# 停止
pm2 stop intent-api

# 删除
pm2 delete intent-api
```

### 方式2：使用 NSSM（Windows 服务管理器）

1. **下载 NSSM**
   - 访问 https://nssm.cc/download
   - 下载最新版本

2. **解压并安装服务**
   ```powershell
   # 解压到 C:\nssm
   # 以管理员身份运行 PowerShell
   
   cd C:\nssm\win64
   
   # 安装服务
   .\nssm install IntentService
   ```

3. **配置服务**
   - Path: `C:\Program Files\nodejs\node.exe`
   - Startup directory: `D:\intent-as-a-service`
   - Arguments: `dist/server.js`

4. **启动服务**
   ```powershell
   .\nssm start IntentService
   ```

---

## 🌐 配置 IIS 反向代理（可选）

如果您想使用 IIS 作为反向代理：

### 1. 安装 IIS

1. 打开"服务器管理器"
2. 添加角色和功能
3. 选择"Web 服务器(IIS)"
4. 安装所需功能

### 2. 安装 URL Rewrite 和 Application Request Routing

1. 下载并安装 URL Rewrite：https://www.iis.net/downloads/microsoft/url-rewrite
2. 下载并安装 ARR：https://www.iis.net/downloads/microsoft/application-request-routing

### 3. 配置反向代理

1. 打开 IIS 管理器
2. 创建新网站或使用默认网站
3. 在网站根目录创建 `web.config`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <!-- 前端静态文件 -->
                <rule name="Frontend" stopProcessing="true">
                    <match url="^$|^(?!api)" />
                    <action type="Rewrite" url="http://localhost:5173/{R:0}" />
                </rule>
                <!-- 后端 API -->
                <rule name="Backend API" stopProcessing="true">
                    <match url="^api/(.*)" />
                    <action type="Rewrite" url="http://localhost:3002/api/{R:1}" />
                </rule>
            </rules>
        </rewrite>
    </system.webServer>
</configuration>
```

---

## 🔒 配置防火墙

### 1. 开放端口

1. 打开"Windows Defender 防火墙"
2. 点击"高级设置"
3. 选择"入站规则" → "新建规则"
4. 选择"端口" → "TCP" → 输入端口号（3002, 5173）
5. 允许连接
6. 应用到所有配置文件

### 2. 配置阿里云安全组

1. 登录阿里云控制台
2. 进入 ECS 实例 → 安全组
3. 添加入站规则：
   - 端口：3002（后端）
   - 端口：5173（前端，如果直接访问）
   - 端口：80/443（如果使用 IIS）
   - 协议：TCP
   - 授权对象：0.0.0.0/0（或指定 IP）

---

## 🚀 启动应用

### 使用 PM2（推荐）

```powershell
# 启动
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs
```

### 使用 npm start

```powershell
npm start
```

### 使用 Windows 服务（NSSM）

服务会自动启动，或手动启动：
```powershell
net start IntentService
```

---

## ✅ 验证部署

### 1. 检查后端

在浏览器访问：
```
http://your-server-ip:3002/health
```

应该返回：
```json
{"status":"ok","message":"Intent-as-a-Service API 运行中"}
```

### 2. 检查前端

访问：
```
http://your-server-ip:5173
```

应该看到登录页面。

### 3. 测试 API

```powershell
# 测试注册接口
Invoke-WebRequest -Uri "http://localhost:3002/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"test@test.com","password":"test123","name":"Test"}'
```

---

## 🔄 更新应用

### 使用 Git 更新

```powershell
# 进入项目目录
cd D:\intent-as-a-service

# 拉取最新代码
git pull

# 安装新依赖
npm install
cd client
npm install
cd ..

# 重新构建
npm run build

# 重启服务
pm2 restart intent-api
# 或
npm start
```

---

## 📊 监控和维护

### 查看日志

#### PM2
```powershell
pm2 logs intent-api
```

#### 直接运行
日志会输出到控制台。

#### Windows 事件查看器
如果使用 NSSM，可以在事件查看器中查看。

### 查看进程

```powershell
# 查看 Node.js 进程
Get-Process node

# 查看端口占用
netstat -ano | findstr :3002
```

### 性能监控

```powershell
# PM2 监控
pm2 monit
```

---

## 🐛 常见问题

### 问题1：端口被占用

**解决**：
```powershell
# 查找占用端口的进程
netstat -ano | findstr :3002

# 结束进程（替换 PID）
taskkill /F /PID <进程ID>
```

### 问题2：无法访问外网

**解决**：
1. 检查防火墙规则
2. 检查阿里云安全组配置
3. 检查服务器网络配置

### 问题3：PM2 无法启动

**解决**：
```powershell
# 重新安装 PM2
npm uninstall -g pm2
npm install -g pm2

# 清除 PM2 配置
pm2 kill
pm2 save --force
```

### 问题4：数据库文件权限问题

**解决**：
1. 确保 `data` 目录有写入权限
2. 以管理员身份运行 PowerShell

### 问题5：环境变量未生效

**解决**：
1. 确保 `.env` 文件在项目根目录
2. 重启服务
3. 检查 `.env` 文件格式（不要有多余空格）

---

## 🔐 安全建议

1. **更改默认端口**（如果可能）
2. **使用强密码**（JWT_SECRET）
3. **定期更新** Node.js 和依赖
4. **配置 HTTPS**（使用 IIS 或 Nginx）
5. **限制访问 IP**（在安全组中配置）
6. **定期备份数据库**

---

## 📝 快速命令参考

```powershell
# 进入项目目录
cd D:\intent-as-a-service

# 安装依赖
npm install
cd client && npm install && cd ..

# 构建
npm run build

# 启动（PM2）
pm2 start ecosystem.config.js

# 启动（直接）
npm start

# 查看日志（PM2）
pm2 logs

# 重启（PM2）
pm2 restart intent-api

# 停止（PM2）
pm2 stop intent-api
```

---

## 🎯 下一步

部署完成后：

1. ✅ 配置域名（在阿里云 DNS 解析）
2. ✅ 配置 SSL 证书（Let's Encrypt 或阿里云证书）
3. ✅ 设置自动备份
4. ✅ 配置监控告警
5. ✅ 优化性能

---

## 💡 提示

- 建议使用 PM2 管理进程，更稳定
- 定期检查日志，及时发现问题
- 保持 Node.js 和依赖包更新
- 生产环境建议使用 HTTPS

如有问题，请查看日志文件或联系技术支持。
