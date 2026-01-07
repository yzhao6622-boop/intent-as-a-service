@echo off
chcp 65001 >nul
echo ========================================
echo 配置前端环境变量
echo ========================================
echo.

cd client

REM 检查是否已存在 .env 文件
if exist .env (
    echo [提示] .env 文件已存在
    echo.
    echo 当前内容：
    type .env
    echo.
    set /p overwrite=是否覆盖？(y/n): 
    if /i not "%overwrite%"=="y" (
        echo 已取消
        cd ..
        pause
        exit /b 0
    )
)

echo.
echo 请选择配置方式：
echo   1. 自动检测（推荐，使用当前服务器地址和端口3002）
echo   2. 手动输入后端地址
echo   3. 使用代理（仅本地开发）
echo.
set /p choice=请输入选项 (1-3): 

if "%choice%"=="1" (
    echo.
    echo 使用自动检测模式
    echo 前端将自动使用: http://当前hostname:3002/api
    echo VITE_API_URL= > .env
    echo [成功] 已配置为自动检测模式
) else if "%choice%"=="2" (
    echo.
    set /p api_url=请输入后端API地址（例如: http://8.134.184.83:3002/api）: 
    echo VITE_API_URL=%api_url% > .env
    echo [成功] 已配置为: %api_url%
) else if "%choice%"=="3" (
    echo.
    echo 使用代理模式（仅本地开发）
    echo VITE_API_URL=/api > .env
    echo [成功] 已配置为使用代理
) else (
    echo [错误] 无效选项
    cd ..
    pause
    exit /b 1
)

echo.
echo ========================================
echo 配置完成！
echo ========================================
echo.
echo 下一步：
echo   1. 重启前端服务使配置生效
echo   2. 运行: pm2 restart intent-frontend
echo   或重新启动开发服务器
echo.
cd ..
pause
