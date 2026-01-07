# 修复 node-gyp 配置，使其能找到 Visual Studio Build Tools

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "修复 node-gyp Visual Studio 配置" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Visual Studio 安装路径
Write-Host "[步骤1] 查找 Visual Studio 安装..." -ForegroundColor Yellow

$vsPaths = @(
    "C:\Program Files (x86)\Microsoft Visual Studio\18\BuildTools",
    "C:\Program Files\Microsoft Visual Studio\2026\BuildTools",
    "C:\Program Files\Microsoft Visual Studio\2026\Community",
    "C:\Program Files\Microsoft Visual Studio\2026\Enterprise",
    "C:\Program Files\Microsoft Visual Studio\2026\Professional",
    "C:\Program Files\Microsoft Visual Studio\2024\BuildTools",
    "C:\Program Files\Microsoft Visual Studio\2024\Community",
    "C:\Program Files\Microsoft Visual Studio\2024\Enterprise",
    "C:\Program Files\Microsoft Visual Studio\2024\Professional",
    "C:\Program Files\Microsoft Visual Studio\2022\BuildTools",
    "C:\Program Files\Microsoft Visual Studio\2022\Community",
    "C:\Program Files\Microsoft Visual Studio\2022\Enterprise",
    "C:\Program Files\Microsoft Visual Studio\2022\Professional",
    "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools"
)

$foundVS = $null
$vsVersion = "2022"  # 默认版本，node-gyp 使用 2022 兼容模式

foreach ($path in $vsPaths) {
    if (Test-Path $path) {
        Write-Host "[发现] Visual Studio 安装在: $path" -ForegroundColor Green
        $foundVS = $path
        
        # 检测 Visual Studio 版本
        # node-gyp 可能还不完全支持 2026，使用 2022 兼容模式
        if ($path -match "\\18\\" -or $path -match "2026") {
            $vsVersion = "2022"
            Write-Host "[提示] 检测到 Visual Studio 2026，使用 2022 兼容模式" -ForegroundColor Yellow
        } elseif ($path -match "2024") {
            $vsVersion = "2022"  # 2024 也使用 2022 兼容模式
        }
        break
    }
}

if (-not $foundVS) {
    Write-Host "[错误] 未找到 Visual Studio 安装" -ForegroundColor Red
    Write-Host "请确保已安装 Visual Studio Build Tools 或 Visual Studio" -ForegroundColor Yellow
    Read-Host "按 Enter 键退出"
    exit 1
}

Write-Host ""
Write-Host "[步骤2] 配置 npm 使用 Visual Studio $vsVersion..." -ForegroundColor Yellow

# 设置 npm 配置
npm config set msvs_version $vsVersion

# 设置环境变量（当前会话）
$env:npm_config_msvs_version = $vsVersion

Write-Host "[成功] 已配置 npm 使用 Visual Studio $vsVersion" -ForegroundColor Green
Write-Host ""

# 检查是否有 vcvarsall.bat
$vcvarsPath = Join-Path $foundVS "VC\Auxiliary\Build\vcvarsall.bat"
if (Test-Path $vcvarsPath) {
    Write-Host "[成功] 找到 vcvarsall.bat: $vcvarsPath" -ForegroundColor Green
} else {
    Write-Host "[警告] 未找到 vcvarsall.bat，可能缺少 C++ 工作负载" -ForegroundColor Yellow
    Write-Host "请确保安装了 'Desktop development with C++' 工作负载" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[步骤3] 验证配置..." -ForegroundColor Yellow
$config = npm config get msvs_version
Write-Host "npm msvs_version 配置: $config" -ForegroundColor Cyan

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "配置完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "现在可以尝试安装 better-sqlite3：" -ForegroundColor Yellow
Write-Host "  npm install better-sqlite3" -ForegroundColor Cyan
Write-Host ""
Write-Host "如果仍然失败，请尝试：" -ForegroundColor Yellow
Write-Host "  1. 使用 'Developer Command Prompt for VS' 或 'Developer PowerShell for VS'" -ForegroundColor Cyan
Write-Host "  2. 在这些特殊命令提示符中运行 npm install" -ForegroundColor Cyan
Write-Host ""

Read-Host "按 Enter 键退出"
