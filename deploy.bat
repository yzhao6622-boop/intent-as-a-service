@echo off
REM Intent-as-a-Service Windows 部署脚本（批处理版本）
REM 使用方法：双击运行此文件

echo ========================================
echo Intent-as-a-Service Windows 部署脚本
echo ========================================
echo.

REM 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo 错误：请以管理员身份运行此脚本！
    echo 右键点击此文件，选择"以管理员身份运行"
    pause
    exit /b 1
)

echo 正在运行 PowerShell 脚本...
echo.

REM 临时允许执行脚本
powershell.exe -ExecutionPolicy Bypass -File "%~dp0deploy-windows.ps1"

pause
