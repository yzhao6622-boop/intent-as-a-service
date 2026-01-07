@echo off
chcp 65001 >nul
echo ========================================
echo Git 配置检查工具
echo ========================================
echo.

REM 检查 Git 是否安装
where git >nul 2>&1
if %errorLevel% neq 0 (
    echo [❌] Git 未安装
    echo.
    echo 安装步骤：
    echo   1. 访问: https://git-scm.com/download/win
    echo   2. 下载并安装 Git for Windows
    echo   3. 安装后重启命令行窗口
    echo   4. 运行此脚本再次检查
    echo.
    pause
    exit /b 1
)

echo [✅] Git 已安装
git --version
echo.

REM 检查用户配置
echo [检查] Git 用户配置...
git config --global user.name >nul 2>&1
if %errorLevel% neq 0 (
    echo [⚠️]  未配置用户名
    echo   当前用户名: (未设置)
) else (
    echo [✅] 用户名: 
    git config --global user.name
)

git config --global user.email >nul 2>&1
if %errorLevel% neq 0 (
    echo [⚠️]  未配置邮箱
    echo   当前邮箱: (未设置)
) else (
    echo [✅] 邮箱: 
    git config --global user.email
)
echo.

REM 检查是否在 Git 仓库中
if not exist ".git" (
    echo [⚠️]  当前目录不是 Git 仓库
    echo.
    echo 如需初始化 Git 仓库：
    echo   git init
    echo   git remote add origin ^<你的仓库地址^>
    echo.
    pause
    exit /b 0
)

echo [✅] 当前目录是 Git 仓库
echo.

REM 检查远程仓库配置
echo [检查] 远程仓库配置...
git remote -v >nul 2>&1
if %errorLevel% neq 0 (
    echo [❌] 未配置远程仓库
    echo.
    echo 配置步骤：
    echo   git remote add origin ^<你的仓库地址^>
    echo.
    echo 常见仓库地址格式：
    echo   GitHub: https://github.com/用户名/仓库名.git
    echo   Gitee:  https://gitee.com/用户名/仓库名.git
    echo   GitLab: https://gitlab.com/用户名/仓库名.git
    echo.
) else (
    echo [✅] 远程仓库配置：
    git remote -v
    echo.
)

REM 检查当前分支
echo [检查] 当前分支...
git branch --show-current >nul 2>&1
if %errorLevel% equ 0 (
    echo [✅] 当前分支: 
    git branch --show-current
) else (
    echo [⚠️]  无法获取分支信息
)
echo.

REM 检查是否有未提交的修改
echo [检查] 工作区状态...
git status --short >nul 2>&1
if %errorLevel% equ 0 (
    git status --short | findstr /R "." >nul 2>&1
    if %errorLevel% equ 0 (
        echo [⚠️]  有未提交的修改：
        git status --short
        echo.
        echo 建议：
        echo   1. 查看修改: git status
        echo   2. 暂存修改: git stash
        echo   3. 或提交修改: git add . ^&^& git commit -m "提交信息"
    ) else (
        echo [✅] 工作区干净，没有未提交的修改
    )
) else (
    echo [⚠️]  无法检查工作区状态
)
echo.

REM 测试拉取（不实际拉取）
echo [检查] 测试远程连接...
git ls-remote --heads origin >nul 2>&1
if %errorLevel% equ 0 (
    echo [✅] 可以连接到远程仓库
    echo   远程分支：
    git ls-remote --heads origin
) else (
    echo [❌] 无法连接到远程仓库
    echo.
    echo 可能的原因：
    echo   1. 网络连接问题
    echo   2. 需要配置认证（用户名/密码或 SSH 密钥）
    echo   3. 远程仓库地址错误
    echo.
    echo 查看 "Git配置和使用指南.md" 了解如何配置认证
)
echo.

echo ========================================
echo 检查完成
echo ========================================
echo.
echo 如需详细配置说明，请查看：
echo   Git配置和使用指南.md
echo.
pause
