@echo off
chcp 65001 >nul
echo ========================================
echo 修复前端服务启动问题
echo ========================================
echo.

echo [步骤1] 停止前端服务...
call pm2 delete intent-frontend 2>nul
echo.

echo [步骤2] 检查 client 目录...
if not exist "client\package.json" (
    echo [错误] client 目录不存在或 package.json 缺失
    pause
    exit /b 1
)
echo [成功] client 目录存在
echo.

echo [步骤3] 检查依赖是否安装...
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

echo [步骤4] 重新启动前端服务...
call pm2 start ecosystem.config.js --only intent-frontend
if %errorLevel% neq 0 (
    echo [错误] 启动失败
    echo.
    echo 查看错误日志：
    call pm2 logs intent-frontend --lines 20 --nostream
    pause
    exit /b 1
)

echo.
echo [步骤5] 查看服务状态...
call pm2 status
echo.

echo [步骤6] 查看前端日志（最后10行）...
call pm2 logs intent-frontend --lines 10 --nostream
echo.

echo ========================================
echo 修复完成！
echo ========================================
echo.
echo 如果仍有问题，请运行：
echo   pm2 logs intent-frontend
echo   查看完整错误日志
echo.
pause
