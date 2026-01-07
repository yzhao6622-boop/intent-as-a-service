@echo off
chcp 65001 >nul
echo ========================================
echo 项目更新脚本
echo ========================================
echo.

REM 检查是否在项目根目录
if not exist "package.json" (
    echo [错误] 请在项目根目录运行此脚本
    pause
    exit /b 1
)

echo [步骤1] 检查 Git 状态...
where git >nul 2>&1
if %errorLevel% neq 0 (
    echo [警告] Git 未安装，跳过代码更新
    echo.
    echo 如需使用 Git 拉取代码，请：
    echo   1. 下载安装 Git: https://git-scm.com/download/win
    echo   2. 安装后重新运行此脚本
    echo   3. 或查看 "Git配置和使用指南.md" 了解详细步骤
    echo.
    echo 将直接更新依赖和重启服务
    goto :update_deps
)

REM 检查是否配置了远程仓库
git remote -v >nul 2>&1
if %errorLevel% neq 0 (
    echo [警告] 未检测到 Git 仓库或未配置远程仓库
    echo.
    echo 如需配置 Git 远程仓库，请：
    echo   1. 查看 "Git配置和使用指南.md" 了解详细步骤
    echo   2. 运行命令: git remote add origin ^<你的仓库地址^>
    echo   3. 例如: git remote add origin https://github.com/username/repo.git
    echo.
    echo 将跳过代码拉取，直接更新依赖和重启服务
    goto :update_deps
)

echo [提示] 正在拉取最新代码...
echo 远程仓库: 
git remote -v
echo.
git pull
if %errorLevel% neq 0 (
    echo [警告] Git pull 失败
    echo.
    echo 可能的原因：
    echo   1. 网络连接问题
    echo   2. 需要配置认证（用户名/密码或 SSH 密钥）
    echo   3. 本地有未提交的修改导致冲突
    echo.
    echo 查看 "Git配置和使用指南.md" 了解如何解决
    echo 继续更新依赖和重启服务...
)
echo.

:update_deps
echo [步骤2] 更新后端依赖...
call npm install
if %errorLevel% neq 0 (
    echo [错误] 后端依赖更新失败
    pause
    exit /b 1
)
echo [成功] 后端依赖已更新
echo.

echo [步骤3] 更新前端依赖...
cd client
call npm install
if %errorLevel% neq 0 (
    echo [错误] 前端依赖更新失败
    cd ..
    pause
    exit /b 1
)
cd ..
echo [成功] 前端依赖已更新
echo.

echo [步骤4] 重新构建后端...
call npm run build:server
if %errorLevel% neq 0 (
    echo [错误] 后端构建失败
    pause
    exit /b 1
)
echo [成功] 后端已构建
echo.

echo [步骤5] 重启 PM2 服务...
where pm2 >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] PM2 未安装
    echo 请先运行: npm install -g pm2
    pause
    exit /b 1
)

REM 重启所有服务
call pm2 restart all
if %errorLevel% neq 0 (
    echo [警告] PM2 重启失败，尝试重新启动...
    call pm2 delete all
    timeout /t 2 /nobreak >nul
    call pm2 start ecosystem.config.js
    if %errorLevel% neq 0 (
        echo [错误] 服务启动失败
        pause
        exit /b 1
    )
)
echo [成功] 服务已重启
echo.

echo [步骤6] 等待3秒后检查服务状态...
timeout /t 3 /nobreak >nul
call pm2 status
echo.

echo [步骤7] 保存 PM2 配置...
call pm2 save
echo.

echo ========================================
echo 更新完成！
echo ========================================
echo.
echo 服务状态：
call pm2 status
echo.
echo 如果服务状态异常，请运行：
echo   pm2 logs intent-api
echo   pm2 logs intent-frontend
echo.
pause
