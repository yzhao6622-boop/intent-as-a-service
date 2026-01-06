# Intent-as-a-Service Windows 部署脚本
# 使用方法：
#   方法1：双击运行 deploy.bat（推荐）
#   方法2：在 PowerShell 中运行：powershell.exe -ExecutionPolicy Bypass -File .\deploy-windows.ps1
#   方法3：以管理员身份运行 PowerShell，然后执行：.\deploy-windows.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Intent-as-a-Service Windows 部署脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查管理员权限
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "❌ 请以管理员身份运行此脚本！" -ForegroundColor Red
    Write-Host "右键点击 PowerShell，选择'以管理员身份运行'" -ForegroundColor Yellow
    exit 1
}

# 检查 Node.js
Write-Host "检查 Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 已安装: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js 未安装，请先安装 Node.js 18+" -ForegroundColor Red
    Write-Host "下载地址: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# 检查 npm
Write-Host "检查 npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm 已安装: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm 未安装" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "步骤 1: 安装依赖..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

# 安装后端依赖
Write-Host "安装后端依赖..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 后端依赖安装失败" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 后端依赖安装完成" -ForegroundColor Green

# 安装前端依赖
Write-Host "安装前端依赖..." -ForegroundColor Yellow
Set-Location client
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 前端依赖安装失败" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Host "✅ 前端依赖安装完成" -ForegroundColor Green

Write-Host ""
Write-Host "步骤 2: 检查环境变量..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

# 检查 .env 文件
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env 文件不存在，从 env.example 创建..." -ForegroundColor Yellow
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env"
        Write-Host "✅ 已创建 .env 文件，请编辑并填入正确的配置" -ForegroundColor Green
        Write-Host "⚠️  重要：请编辑 .env 文件，配置以下内容：" -ForegroundColor Yellow
        Write-Host "   - JWT_SECRET (随机字符串)" -ForegroundColor Yellow
        Write-Host "   - ARK_API_KEY (火山方舟API密钥)" -ForegroundColor Yellow
        Write-Host "   - ARK_MODEL_ID (模型ID)" -ForegroundColor Yellow
        Write-Host ""
        $continue = Read-Host "配置完成后，按 Enter 继续..."
    } else {
        Write-Host "❌ env.example 文件不存在" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ .env 文件已存在" -ForegroundColor Green
}

Write-Host ""
Write-Host "步骤 3: 初始化数据库..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

# 创建 data 目录
if (-not (Test-Path "data")) {
    New-Item -ItemType Directory -Path "data" | Out-Null
    Write-Host "✅ 已创建 data 目录" -ForegroundColor Green
}

# 运行数据库迁移
Write-Host "运行数据库迁移..." -ForegroundColor Yellow
npm run migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 数据库迁移失败" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 数据库初始化完成" -ForegroundColor Green

Write-Host ""
Write-Host "步骤 4: 构建应用..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

# 构建后端
Write-Host "构建后端..." -ForegroundColor Yellow
npm run build:server
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 后端构建失败" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 后端构建完成" -ForegroundColor Green

# 构建前端
Write-Host "构建前端..." -ForegroundColor Yellow
npm run build:client
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 前端构建失败" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 前端构建完成" -ForegroundColor Green

Write-Host ""
Write-Host "步骤 5: 安装 PM2（进程管理）..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

# 检查 PM2
$pm2Installed = $false
try {
    pm2 --version | Out-Null
    $pm2Installed = $true
    Write-Host "✅ PM2 已安装" -ForegroundColor Green
} catch {
    Write-Host "PM2 未安装，正在安装..." -ForegroundColor Yellow
    npm install -g pm2
    if ($LASTEXITCODE -eq 0) {
        $pm2Installed = $true
        Write-Host "✅ PM2 安装完成" -ForegroundColor Green
    } else {
        Write-Host "⚠️  PM2 安装失败，将使用直接运行方式" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "部署完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 询问启动方式
Write-Host "选择启动方式：" -ForegroundColor Yellow
Write-Host "1. 使用 PM2 启动（推荐，支持自动重启）" -ForegroundColor White
Write-Host "2. 直接运行（npm start）" -ForegroundColor White
Write-Host "3. 稍后手动启动" -ForegroundColor White
Write-Host ""

$choice = Read-Host "请选择 (1/2/3)"

switch ($choice) {
    "1" {
        if ($pm2Installed) {
            Write-Host ""
            Write-Host "使用 PM2 启动..." -ForegroundColor Yellow
            pm2 start ecosystem.config.js
            pm2 save
            Write-Host ""
            Write-Host "✅ 应用已启动！" -ForegroundColor Green
            Write-Host ""
            Write-Host "常用 PM2 命令：" -ForegroundColor Cyan
            Write-Host "  pm2 status          - 查看状态" -ForegroundColor White
            Write-Host "  pm2 logs           - 查看日志" -ForegroundColor White
            Write-Host "  pm2 restart intent-api - 重启" -ForegroundColor White
            Write-Host "  pm2 stop intent-api    - 停止" -ForegroundColor White
        } else {
            Write-Host "❌ PM2 未安装，使用直接运行方式" -ForegroundColor Red
            Write-Host "启动应用..." -ForegroundColor Yellow
            npm start
        }
    }
    "2" {
        Write-Host ""
        Write-Host "启动应用..." -ForegroundColor Yellow
        Write-Host "提示：按 Ctrl+C 停止应用" -ForegroundColor Yellow
        Write-Host ""
        npm start
    }
    "3" {
        Write-Host ""
        Write-Host "稍后可以使用以下命令启动：" -ForegroundColor Yellow
        if ($pm2Installed) {
            Write-Host "  pm2 start ecosystem.config.js" -ForegroundColor White
        } else {
            Write-Host "  npm start" -ForegroundColor White
        }
    }
    default {
        Write-Host "无效选择，使用直接运行方式" -ForegroundColor Yellow
        npm start
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "访问地址：" -ForegroundColor Green
Write-Host "  后端 API: http://localhost:3002" -ForegroundColor White
Write-Host "  前端界面: http://localhost:5173" -ForegroundColor White
Write-Host "  健康检查: http://localhost:3002/health" -ForegroundColor White
Write-Host ""
Write-Host "重要提示：" -ForegroundColor Yellow
Write-Host "1. 确保防火墙已开放 3002 和 5173 端口" -ForegroundColor White
Write-Host "2. 在阿里云安全组中配置端口规则" -ForegroundColor White
Write-Host "3. 使用公网 IP 访问时，将 localhost 替换为服务器 IP" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
