@echo off
chcp 65001 >nul
echo ========================================
echo API 连接检查工具
echo ========================================
echo.

REM 获取服务器IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set LOCAL_IP=%%a
    set LOCAL_IP=!LOCAL_IP:~1!
    echo 服务器IP: !LOCAL_IP!
)
echo.

echo [步骤1] 检查后端服务状态...
pm2 status intent-api
echo.

echo [步骤2] 检查后端端口监听...
netstat -ano | findstr :3002
if %errorLevel% equ 0 (
    echo [✅] 端口 3002 正在监听
) else (
    echo [❌] 端口 3002 未监听，后端服务可能未运行
)
echo.

echo [步骤3] 测试健康检查接口...
curl -s http://localhost:3002/health
if %errorLevel% equ 0 (
    echo [✅] 后端服务正常
) else (
    echo [❌] 无法连接到后端服务
)
echo.

echo [步骤4] 测试API接口（需要认证）...
echo 注意：此测试需要有效的token
echo.
echo [步骤5] 检查PM2日志...
echo 后端日志（最近10行）：
pm2 logs intent-api --lines 10 --nostream
echo.

echo ========================================
echo 排查建议
echo ========================================
echo.
echo 如果后端服务未运行：
echo   1. 检查PM2状态: pm2 status
echo   2. 查看日志: pm2 logs intent-api
echo   3. 重启服务: pm2 restart intent-api
echo.
echo 如果端口未监听：
echo   1. 检查防火墙规则
echo   2. 检查服务是否正常启动
echo   3. 查看错误日志
echo.
echo 如果API请求失败：
echo   1. 检查CORS配置
echo   2. 检查认证token是否有效
echo   3. 查看浏览器控制台的详细错误
echo.
pause
