@echo off
chcp 65001 >nul
echo ========================================
echo 快速修复前端服务
echo ========================================
echo.

echo [步骤1] 删除旧的前端服务...
call pm2 delete intent-frontend 2>nul
echo.

echo [步骤2] 确保日志目录存在...
if not exist logs mkdir logs
echo.

echo [步骤3] 重新启动前端服务...
call pm2 start ecosystem.config.js --only intent-frontend
echo.

echo [步骤4] 等待3秒后查看状态...
timeout /t 3 /nobreak >nul
call pm2 status
echo.

echo [步骤5] 查看前端日志（最后15行）...
call pm2 logs intent-frontend --lines 15 --nostream
echo.

echo ========================================
echo 修复完成！
echo ========================================
echo.
echo 如果前端状态显示 "online"，说明启动成功
echo 如果显示 "errored"，请运行以下命令查看详细错误：
echo   pm2 logs intent-frontend
echo.
pause
