@echo off
chcp 65001 >nul
echo ========================================
echo 测试前端服务启动
echo ========================================
echo.

echo [步骤1] 删除旧的前端服务...
call pm2 delete intent-frontend 2>nul
echo.

echo [步骤2] 确保日志目录存在...
if not exist logs mkdir logs
echo.

echo [步骤3] 检查启动脚本是否存在...
if not exist "client\start-dev.cjs" (
    echo [错误] 启动脚本不存在
    pause
    exit /b 1
)
echo [成功] 启动脚本存在
echo.

echo [步骤4] 检查 client 目录依赖...
if not exist "client\node_modules" (
    echo [提示] 依赖未安装，正在安装...
    cd client
    call npm install
    if %errorLevel% neq 0 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
    cd ..
)
echo [成功] 依赖已安装
echo.

echo [步骤5] 重新启动前端服务...
call pm2 start ecosystem.config.js --only intent-frontend
echo.

echo [步骤6] 等待5秒后查看状态...
timeout /t 5 /nobreak >nul
call pm2 status
echo.

echo [步骤7] 查看前端日志...
call pm2 logs intent-frontend --lines 20 --nostream
echo.

echo ========================================
echo 测试完成！
echo ========================================
echo.
echo 如果前端状态显示 "online"，说明启动成功
echo 如果显示 "errored" 或 "stopped"，请查看上面的日志
echo.
pause
