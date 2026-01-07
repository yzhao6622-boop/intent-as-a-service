# 项目更新脚本 (PowerShell)
# 使用方法: powershell.exe -ExecutionPolicy Bypass -File .\更新项目.ps1

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "项目更新脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否在项目根目录
if (-not (Test-Path "package.json")) {
    Write-Host "[错误] 请在项目根目录运行此脚本" -ForegroundColor Red
    Read-Host "按 Enter 键退出"
    exit 1
}

# 步骤1: 拉取最新代码
Write-Host "[步骤1] 检查 Git 状态..." -ForegroundColor Yellow
$gitInstalled = Get-Command git -ErrorAction SilentlyContinue
if ($gitInstalled) {
    Write-Host "[提示] 正在拉取最新代码..." -ForegroundColor Green
    try {
        git pull
        Write-Host "[成功] 代码已更新" -ForegroundColor Green
    } catch {
        Write-Host "[警告] Git pull 失败，继续更新依赖..." -ForegroundColor Yellow
    }
} else {
    Write-Host "[警告] Git 未安装，跳过代码更新" -ForegroundColor Yellow
    Write-Host "将直接更新依赖和重启服务" -ForegroundColor Yellow
}
Write-Host ""

# 步骤2: 更新后端依赖
Write-Host "[步骤2] 更新后端依赖..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "[成功] 后端依赖已更新" -ForegroundColor Green
} catch {
    Write-Host "[错误] 后端依赖更新失败" -ForegroundColor Red
    Read-Host "按 Enter 键退出"
    exit 1
}
Write-Host ""

# 步骤3: 更新前端依赖
Write-Host "[步骤3] 更新前端依赖..." -ForegroundColor Yellow
try {
    Set-Location client
    npm install
    Set-Location ..
    Write-Host "[成功] 前端依赖已更新" -ForegroundColor Green
} catch {
    Write-Host "[错误] 前端依赖更新失败" -ForegroundColor Red
    Set-Location ..
    Read-Host "按 Enter 键退出"
    exit 1
}
Write-Host ""

# 步骤4: 重新构建后端
Write-Host "[步骤4] 重新构建后端..." -ForegroundColor Yellow
try {
    npm run build:server
    Write-Host "[成功] 后端已构建" -ForegroundColor Green
} catch {
    Write-Host "[错误] 后端构建失败" -ForegroundColor Red
    Read-Host "按 Enter 键退出"
    exit 1
}
Write-Host ""

# 步骤5: 重启 PM2 服务
Write-Host "[步骤5] 重启 PM2 服务..." -ForegroundColor Yellow
$pm2Installed = Get-Command pm2 -ErrorAction SilentlyContinue
if (-not $pm2Installed) {
    Write-Host "[错误] PM2 未安装" -ForegroundColor Red
    Write-Host "请先运行: npm install -g pm2" -ForegroundColor Yellow
    Read-Host "按 Enter 键退出"
    exit 1
}

try {
    pm2 restart all
    Write-Host "[成功] 服务已重启" -ForegroundColor Green
} catch {
    Write-Host "[警告] PM2 重启失败，尝试重新启动..." -ForegroundColor Yellow
    pm2 delete all
    Start-Sleep -Seconds 2
    pm2 start ecosystem.config.js
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[错误] 服务启动失败" -ForegroundColor Red
        Read-Host "按 Enter 键退出"
        exit 1
    }
}
Write-Host ""

# 步骤6: 检查服务状态
Write-Host "[步骤6] 等待3秒后检查服务状态..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
pm2 status
Write-Host ""

# 步骤7: 保存 PM2 配置
Write-Host "[步骤7] 保存 PM2 配置..." -ForegroundColor Yellow
pm2 save
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "更新完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "服务状态：" -ForegroundColor Yellow
pm2 status
Write-Host ""
Write-Host "如果服务状态异常，请运行：" -ForegroundColor Yellow
Write-Host "  pm2 logs intent-api" -ForegroundColor Cyan
Write-Host "  pm2 logs intent-frontend" -ForegroundColor Cyan
Write-Host ""
Read-Host "按 Enter 键退出"
