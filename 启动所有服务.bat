@echo off
chcp 65001 >nul
echo ========================================
echo 使用 PM2 启动所有服务
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
echo [步骤1] 检查是否已有服务运行...
call pm2 list
echo.

echo [步骤2] 停止现有服务（如果存在）...
call pm2 delete all 2>nul
echo.

echo [步骤3] 启动所有服务...
call pm2 start ecosystem.config.js
if %errorLevel% neq 0 (
    echo [错误] 启动失败
    pause
    exit /b 1
)

echo.
echo [步骤4] 保存配置...
call pm2 save
echo.

echo ========================================
echo 服务启动完成！
echo ========================================
echo.
echo 服务状态：
call pm2 status
echo.
echo 访问地址：
echo   后端: http://localhost:3002
echo   前端: http://localhost:5173
echo   外部: http://your-server-ip:3002 和 :5173
echo.
echo 常用命令：
echo   pm2 status          - 查看状态
echo   pm2 logs            - 查看日志
echo   pm2 restart all     - 重启所有
echo   pm2 stop all        - 停止所有
echo.
echo 如果前端服务启动失败，请运行：
echo   pm2 logs intent-frontend
echo   查看详细错误信息
echo.
pause
