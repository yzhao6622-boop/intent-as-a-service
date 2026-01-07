@echo off
chcp 65001 >nul
echo ========================================
echo 修复 CORS 问题
echo ========================================
echo.

echo [步骤1] 重新构建后端...
call npm run build:server
if %errorLevel% neq 0 (
    echo [错误] 构建失败
    pause
    exit /b 1
)
echo [成功] 后端已构建
echo.

echo [步骤2] 重启后端服务...
where pm2 >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] PM2 未安装
    pause
    exit /b 1
)

call pm2 restart intent-api
if %errorLevel% neq 0 (
    echo [错误] 重启失败
    pause
    exit /b 1
)
echo [成功] 后端服务已重启
echo.

echo [步骤3] 等待3秒后检查服务状态...
timeout /t 3 /nobreak >nul
call pm2 status
echo.

echo [步骤4] 查看后端日志（检查CORS配置）...
echo 最近10行日志：
call pm2 logs intent-api --lines 10 --nostream
echo.

echo ========================================
echo 修复完成！
echo ========================================
echo.
echo 下一步：
echo   1. 刷新浏览器页面
echo   2. 检查浏览器控制台是否还有CORS错误
echo   3. 如果还有问题，查看后端日志: pm2 logs intent-api
echo.
pause
