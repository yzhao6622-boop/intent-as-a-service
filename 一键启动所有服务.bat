@echo off
chcp 65001 >nul
echo ========================================
echo 一键启动所有服务（PM2）
echo ========================================
echo.

REM 检查 PM2 是否安装
where pm2 >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] PM2 未安装
    echo 正在安装 PM2...
    call npm install -g pm2
    if %errorLevel% neq 0 (
        echo [错误] PM2 安装失败
        pause
        exit /b 1
    )
)

echo.
echo [步骤1] 确保日志目录存在...
if not exist logs mkdir logs
echo.

echo [步骤2] 停止现有服务（如果存在）...
call pm2 delete all 2>nul
echo.

echo [步骤3] 检查后端是否已构建...
if not exist "dist\server.js" (
    echo [提示] 后端未构建，正在构建...
    call npm run build:server
    if %errorLevel% neq 0 (
        echo [错误] 后端构建失败
        pause
        exit /b 1
    )
)
echo [成功] 后端已构建
echo.

echo [步骤4] 检查前端依赖...
if not exist "client\node_modules" (
    echo [提示] 前端依赖未安装，正在安装...
    cd client
    call npm install
    if %errorLevel% neq 0 (
        echo [错误] 前端依赖安装失败
        pause
        exit /b 1
    )
    cd ..
)
echo [成功] 前端依赖已安装
echo.

echo [步骤5] 启动所有服务...
call pm2 start ecosystem.config.js
if %errorLevel% neq 0 (
    echo [错误] 启动失败
    pause
    exit /b 1
)

echo.
echo [步骤6] 等待3秒后查看状态...
timeout /t 3 /nobreak >nul
call pm2 status
echo.

echo [步骤7] 保存配置（开机自启）...
call pm2 save
echo.

echo ========================================
echo 服务启动完成！
echo ========================================
echo.
echo 访问地址：
echo   后端: http://localhost:3002
echo   前端: http://localhost:5173
echo   外部: http://your-server-ip:3002 和 :5173
echo.
echo 常用命令：
echo   pm2 status          - 查看状态
echo   pm2 logs            - 查看所有日志
echo   pm2 logs intent-api - 查看后端日志
echo   pm2 logs intent-frontend - 查看前端日志
echo   pm2 restart all     - 重启所有服务
echo   pm2 stop all        - 停止所有服务
echo.
echo 如果前端服务状态不是 "online"，请运行：
echo   pm2 logs intent-frontend
echo   查看详细错误信息
echo.
pause
