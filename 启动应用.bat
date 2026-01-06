@echo off
chcp 65001 >nul
echo ========================================
echo 启动 Intent-as-a-Service
echo ========================================
echo.

REM 检查是否已构建
if not exist dist (
    echo [错误] 应用尚未构建，请先运行 部署.bat
    pause
    exit /b 1
)

echo 选择启动方式：
echo 1. 直接运行 (npm start)
echo 2. 使用 PM2 (推荐)
echo.
set /p choice=请选择 (1/2): 

if "%choice%"=="1" (
    echo.
    echo 启动应用...
    echo 提示：按 Ctrl+C 停止应用
    echo.
    call npm start
) else if "%choice%"=="2" (
    echo.
    echo 检查 PM2...
    where pm2 >nul 2>&1
    if %errorLevel% neq 0 (
        echo PM2 未安装，正在安装...
        call npm install -g pm2
    )
    echo.
    echo 启动应用 (PM2)...
    call pm2 start ecosystem.config.js
    call pm2 save
    echo.
    echo [完成] 应用已启动！
    echo.
    echo 常用命令：
    echo   pm2 status          - 查看状态
    echo   pm2 logs           - 查看日志
    echo   pm2 restart intent-api - 重启
    echo   pm2 stop intent-api    - 停止
    echo.
) else (
    echo 无效选择，使用直接运行方式
    call npm start
)

pause
