@echo off
chcp 65001 >nul
echo ========================================
echo 快速修复 node-gyp 配置
echo ========================================
echo.

echo [步骤1] 配置 npm 使用 Visual Studio 2022 (兼容模式)...
call npm config set msvs_version 2022
if %errorLevel% neq 0 (
    echo [错误] 配置失败
    pause
    exit /b 1
)

echo [成功] 已配置
echo.

echo [步骤2] 验证配置...
call npm config get msvs_version
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
