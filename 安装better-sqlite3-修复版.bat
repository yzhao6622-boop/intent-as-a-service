@echo off
chcp 65001 >nul
echo ========================================
echo 安装 better-sqlite3（修复版）
echo ========================================
echo.

echo [步骤1] 设置 node-gyp 环境变量...
set npm_config_msvs_version=2022
set GYP_MSVS_VERSION=2022

echo [成功] 环境变量已设置
echo   npm_config_msvs_version=2022
echo   GYP_MSVS_VERSION=2022
echo.

echo [步骤2] 安装 better-sqlite3...
call npm install better-sqlite3
if %errorLevel% neq 0 (
    echo.
    echo [错误] 安装失败
    echo.
    echo 可能的解决方案：
    echo   1. 使用 Visual Studio 的开发者命令提示符：
    echo      - Developer PowerShell for VS
    echo      - Developer Command Prompt for VS
    echo   2. 在这些特殊命令提示符中运行此脚本
    echo   3. 或直接运行: npm install better-sqlite3
    echo.
    pause
    exit /b 1
)

echo.
echo [成功] better-sqlite3 已安装
echo.

echo [步骤3] 安装其他依赖...
call npm install
if %errorLevel% neq 0 (
    echo [警告] 部分依赖安装失败，但 better-sqlite3 已安装
)

echo.
echo ========================================
echo 安装完成！
echo ========================================
echo.
pause
