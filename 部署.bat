@echo off
chcp 65001 >nul
echo ========================================
echo Intent-as-a-Service 部署脚本
echo ========================================
echo.

REM 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 请以管理员身份运行此脚本！
    echo 右键点击此文件，选择"以管理员身份运行"
    pause
    exit /b 1
)

echo [1/7] 检查 Node.js...
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] Node.js 未安装，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)
node --version
echo [完成] Node.js 已安装
echo.

echo [2/7] 安装后端依赖...
call npm install
if %errorLevel% neq 0 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)
echo [完成] 后端依赖安装完成
echo.

echo [3/7] 安装前端依赖...
cd client
call npm install
if %errorLevel% neq 0 (
    echo [错误] 前端依赖安装失败
    cd ..
    pause
    exit /b 1
)
cd ..
echo [完成] 前端依赖安装完成
echo.

echo [4/7] 检查环境变量...
if not exist .env (
    echo [提示] .env 文件不存在，正在创建...
    if exist env.example (
        copy env.example .env >nul
        echo [完成] 已创建 .env 文件
        echo.
        echo [重要] 请编辑 .env 文件，配置以下内容：
        echo   - JWT_SECRET (随机字符串)
        echo   - ARK_API_KEY (火山方舟API密钥)
        echo   - ARK_MODEL_ID (模型ID)
        echo.
        pause
    ) else (
        echo [错误] env.example 文件不存在
        pause
        exit /b 1
    )
) else (
    echo [完成] .env 文件已存在
)
echo.

echo [5/7] 创建数据目录...
if not exist data mkdir data
echo [完成] 数据目录已创建
echo.

echo [6/7] 初始化数据库...
call npm run migrate
if %errorLevel% neq 0 (
    echo [错误] 数据库初始化失败
    pause
    exit /b 1
)
echo [完成] 数据库初始化完成
echo.

echo [7/7] 构建应用...
echo 构建后端...
call npm run build:server
if %errorLevel% neq 0 (
    echo [错误] 后端构建失败
    pause
    exit /b 1
)
echo 构建前端...
call npm run build:client
if %errorLevel% neq 0 (
    echo [错误] 前端构建失败
    pause
    exit /b 1
)
echo [完成] 应用构建完成
echo.

echo ========================================
echo 部署完成！
echo ========================================
echo.
echo 下一步：
echo 1. 编辑 .env 文件，填入正确的配置
echo 2. 启动应用：
echo    方式1: npm start
echo    方式2: 安装 PM2 后运行: pm2 start ecosystem.config.js
echo.
echo 访问地址：
echo   后端: http://localhost:3002
echo   前端: http://localhost:5173
echo   健康检查: http://localhost:3002/health
echo.
pause
