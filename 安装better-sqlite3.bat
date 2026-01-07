@echo off
chcp 65001 >nul
echo ========================================
echo 安装 better-sqlite3
echo ========================================
echo.

echo [提示] better-sqlite3 需要编译，需要 Visual Studio Build Tools
echo.

REM 检查是否已安装 Visual Studio Build Tools
echo [步骤1] 检查 Visual Studio Build Tools...
if exist "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools" (
    echo [发现] Visual Studio Build Tools 2022 已安装
    goto :install
)
if exist "C:\Program Files\Microsoft Visual Studio\2022\Community" (
    echo [发现] Visual Studio Community 2022 已安装
    goto :install
)
if exist "C:\Program Files\Microsoft Visual Studio\2022\Enterprise" (
    echo [发现] Visual Studio Enterprise 2022 已安装
    goto :install
)
if exist "C:\Program Files\Microsoft Visual Studio\2022\Professional" (
    echo [发现] Visual Studio Professional 2022 已安装
    goto :install
)

echo [未发现] Visual Studio Build Tools 未安装
echo.
echo 请先安装 Visual Studio Build Tools：
echo   1. 运行: powershell.exe -ExecutionPolicy Bypass -File .\安装构建工具.ps1
echo   2. 或访问: https://visualstudio.microsoft.com/downloads/
echo   3. 下载并安装 "Build Tools for Visual Studio 2022"
echo   4. 安装时选择 "Desktop development with C++" 工作负载
echo.
pause
exit /b 1

:install
echo.
echo [步骤2] 安装 better-sqlite3...
call npm install better-sqlite3
if %errorLevel% neq 0 (
    echo.
    echo [错误] 安装失败
    echo.
    echo 可能的解决方案：
    echo   1. 确保已安装 Visual Studio Build Tools 并包含 C++ 工作负载
    echo   2. 尝试以管理员身份运行此脚本
    echo   3. 运行: npm install --build-from-source
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
