@echo off
chcp 65001 >nul
echo ========================================
echo 重新构建后端并重启服务
echo ========================================
echo.

echo [步骤1] 停止现有服务...
call pm2 stop intent-api 2>nul
echo.

echo [步骤2] 重新构建后端代码...
call npm run build:server
if %errorLevel% neq 0 (
    echo [错误] 构建失败
    pause
    exit /b 1
)
echo [成功] 构建完成
echo.

echo [步骤3] 重启后端服务...
call pm2 restart intent-api
if %errorLevel% neq 0 (
    echo [错误] 重启失败
    pause
    exit /b 1
)
echo [成功] 服务已重启
echo.

echo [步骤4] 等待3秒后查看状态...
timeout /t 3 /nobreak >nul
call pm2 status
echo.

echo ========================================
echo 完成！现在可以尝试创建意图了
echo ========================================
echo.
echo 查看日志命令：
echo   pm2 logs intent-api --lines 50
echo.
pause
