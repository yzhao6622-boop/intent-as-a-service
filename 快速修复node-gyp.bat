@echo off
chcp 65001 >nul
echo ========================================
echo 快速修复 node-gyp 配置
echo ========================================
echo.

echo [步骤1] 设置 node-gyp 环境变量...
REM 设置环境变量（当前会话）
set npm_config_msvs_version=2022
set GYP_MSVS_VERSION=2022

echo [成功] 已设置环境变量
echo   npm_config_msvs_version=2022
echo   GYP_MSVS_VERSION=2022
echo.

echo [步骤2] 验证环境变量...
echo npm_config_msvs_version=%npm_config_msvs_version%
echo GYP_MSVS_VERSION=%GYP_MSVS_VERSION%
echo.

echo ========================================
echo 配置完成！
echo ========================================
echo.
echo 现在可以尝试安装：
echo   npm install better-sqlite3
echo.
echo 或者直接安装所有依赖：
echo   npm install
echo.
echo 如果仍然失败，请使用 Visual Studio 的开发者命令提示符：
echo   - Developer PowerShell for VS
echo   - Developer Command Prompt for VS
echo.
pause
