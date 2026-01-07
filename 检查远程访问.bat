@echo off
chcp 65001 >nul
echo ========================================
echo 远程访问问题排查工具
echo ========================================
echo.

REM 获取服务器IP
echo [步骤1] 检查服务器IP地址...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set LOCAL_IP=%%a
    set LOCAL_IP=!LOCAL_IP:~1!
    echo 本地IP: !LOCAL_IP!
)
echo.

REM 检查端口监听
echo [步骤2] 检查端口监听状态...
echo.
echo 检查端口 3002 (后端)...
netstat -ano | findstr :3002
if %errorLevel% equ 0 (
    echo [✅] 端口 3002 正在监听
) else (
    echo [❌] 端口 3002 未监听
)
echo.

echo 检查端口 5173 (前端)...
netstat -ano | findstr :5173
if %errorLevel% equ 0 (
    echo [✅] 端口 5173 正在监听
) else (
    echo [❌] 端口 5173 未监听
)
echo.

REM 检查防火墙
echo [步骤3] 检查Windows防火墙规则...
echo.
netsh advfirewall firewall show rule name=all | findstr /i "3002\|5173" >nul 2>&1
if %errorLevel% equ 0 (
    echo [✅] 发现防火墙规则
    netsh advfirewall firewall show rule name=all | findstr /i "3002\|5173"
) else (
    echo [⚠️]  未发现防火墙规则，可能需要配置
)
echo.

REM 检查PM2状态
echo [步骤4] 检查PM2服务状态...
where pm2 >nul 2>&1
if %errorLevel% equ 0 (
    pm2 status
) else (
    echo [❌] PM2 未安装
)
echo.

echo ========================================
echo 排查建议
echo ========================================
echo.
echo 1. 确保服务器监听 0.0.0.0 而不是 localhost
echo    检查 src/server.ts 中的 app.listen(PORT, '0.0.0.0', ...)
echo.
echo 2. 配置Windows防火墙：
echo    - 打开"Windows Defender 防火墙"
echo    - 高级设置 → 入站规则 → 新建规则
echo    - 端口 → TCP → 3002, 5173
echo    - 允许连接
echo.
echo 3. 配置阿里云安全组：
echo    - 登录阿里云控制台
echo    - ECS → 安全组 → 配置规则
echo    - 添加入站规则：端口 3002, 5173，协议 TCP
echo.
echo 4. 测试本地访问：
echo    - 后端: http://localhost:3002/health
echo    - 前端: http://localhost:5173
echo.
echo 5. 测试远程访问：
echo    - 后端: http://your-server-ip:3002/health
echo    - 前端: http://your-server-ip:5173
echo.
echo 6. 如果本地可以访问但远程不行：
echo    - 检查防火墙规则
echo    - 检查安全组配置
echo    - 检查服务器是否在公网
echo.
pause
