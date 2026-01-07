@echo off
chcp 65001 >nul
echo ========================================
echo Windows防火墙配置工具
echo ========================================
echo.
echo 此脚本将配置Windows防火墙，允许外部访问端口 3002 和 5173
echo.
echo [警告] 需要管理员权限运行此脚本
echo.
pause

REM 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 需要管理员权限
    echo 请右键点击此文件，选择"以管理员身份运行"
    pause
    exit /b 1
)

echo.
echo [步骤1] 配置后端端口 3002...
netsh advfirewall firewall add rule name="Intent API Backend" dir=in action=allow protocol=TCP localport=3002
if %errorLevel% equ 0 (
    echo [✅] 后端端口 3002 已配置
) else (
    echo [⚠️]  配置失败，可能已存在规则
)
echo.

echo [步骤2] 配置前端端口 5173...
netsh advfirewall firewall add rule name="Intent Frontend" dir=in action=allow protocol=TCP localport=5173
if %errorLevel% equ 0 (
    echo [✅] 前端端口 5173 已配置
) else (
    echo [⚠️]  配置失败，可能已存在规则
)
echo.

echo [步骤3] 验证防火墙规则...
echo.
echo 后端端口规则：
netsh advfirewall firewall show rule name="Intent API Backend"
echo.
echo 前端端口规则：
netsh advfirewall firewall show rule name="Intent Frontend"
echo.

echo ========================================
echo 配置完成！
echo ========================================
echo.
echo 下一步：
echo 1. 检查阿里云安全组配置（如果使用阿里云）
echo 2. 重新构建并重启服务：
echo    npm run build:server
echo    pm2 restart all
echo 3. 测试远程访问：
echo    http://your-server-ip:3002/health
echo    http://your-server-ip:5173
echo.
pause
