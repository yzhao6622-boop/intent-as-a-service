@echo off
chcp 65001 >nul
echo ========================================
echo 查看后端日志（创建意图相关）
echo ========================================
echo.
echo 正在查看后端日志，按 Ctrl+C 退出...
echo.
echo 提示：日志中搜索 "[创建意图]" 可以快速找到相关错误
echo.
pm2 logs intent-api --lines 100
