# 安装 Visual Studio Build Tools 以支持 better-sqlite3 编译
# 需要管理员权限运行

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "安装 Visual Studio Build Tools" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查管理员权限
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[错误] 需要管理员权限运行此脚本" -ForegroundColor Red
    Write-Host "请右键点击 PowerShell，选择'以管理员身份运行'" -ForegroundColor Yellow
    Read-Host "按 Enter 键退出"
    exit 1
}

Write-Host "[步骤1] 检查是否已安装 Visual Studio Build Tools..." -ForegroundColor Yellow

# 检查 Visual Studio Build Tools 是否已安装
$vsPath = "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools"
$vsCommunityPath = "C:\Program Files\Microsoft Visual Studio\2022\Community"
$vsEnterprisePath = "C:\Program Files\Microsoft Visual Studio\2022\Enterprise"
$vsProfessionalPath = "C:\Program Files\Microsoft Visual Studio\2022\Professional"

$vsInstalled = $false
if (Test-Path $vsPath) {
    Write-Host "[发现] Visual Studio Build Tools 2022 已安装" -ForegroundColor Green
    $vsInstalled = $true
} elseif (Test-Path $vsCommunityPath) {
    Write-Host "[发现] Visual Studio Community 2022 已安装" -ForegroundColor Green
    $vsInstalled = $true
} elseif (Test-Path $vsEnterprisePath) {
    Write-Host "[发现] Visual Studio Enterprise 2022 已安装" -ForegroundColor Green
    $vsInstalled = $true
} elseif (Test-Path $vsProfessionalPath) {
    Write-Host "[发现] Visual Studio Professional 2022 已安装" -ForegroundColor Green
    $vsInstalled = $true
}

if ($vsInstalled) {
    Write-Host "[成功] Visual Studio 已安装，可以尝试安装 better-sqlite3" -ForegroundColor Green
    Write-Host ""
    Write-Host "现在可以运行: npm install" -ForegroundColor Yellow
    Read-Host "按 Enter 键退出"
    exit 0
}

Write-Host "[未发现] Visual Studio Build Tools 未安装" -ForegroundColor Yellow
Write-Host ""

# 提供安装选项
Write-Host "请选择安装方式：" -ForegroundColor Cyan
Write-Host "1. 自动下载并安装 Visual Studio Build Tools 2022（推荐）" -ForegroundColor Yellow
Write-Host "2. 手动下载安装（打开下载页面）" -ForegroundColor Yellow
Write-Host "3. 跳过（稍后手动安装）" -ForegroundColor Yellow
Write-Host ""

$choice = Read-Host "请输入选项 (1/2/3)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "[步骤2] 下载 Visual Studio Build Tools 安装程序..." -ForegroundColor Yellow
    Write-Host "这可能需要一些时间，请耐心等待..." -ForegroundColor Yellow
    Write-Host ""
    
    $installerPath = "$env:TEMP\vs_buildtools.exe"
    $downloadUrl = "https://aka.ms/vs/17/release/vs_buildtools.exe"
    
    try {
        Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing
        Write-Host "[成功] 下载完成" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "[步骤3] 启动安装程序..." -ForegroundColor Yellow
        Write-Host "安装程序将打开，请选择以下工作负载：" -ForegroundColor Yellow
        Write-Host "  - Desktop development with C++" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "安装完成后，请重新运行: npm install" -ForegroundColor Yellow
        Write-Host ""
        
        Start-Process -FilePath $installerPath -ArgumentList "--quiet", "--wait", "--add", "Microsoft.VisualStudio.Workload.VCTools", "--includeRecommended"
        
        Write-Host "[提示] 安装程序已启动，请按照提示完成安装" -ForegroundColor Green
        Write-Host "安装完成后，请重新运行此脚本或直接运行: npm install" -ForegroundColor Yellow
        
    } catch {
        Write-Host "[错误] 下载失败: $_" -ForegroundColor Red
        Write-Host "请手动下载: $downloadUrl" -ForegroundColor Yellow
    }
    
} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "[步骤2] 打开下载页面..." -ForegroundColor Yellow
    Start-Process "https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022"
    Write-Host ""
    Write-Host "请在下载页面：" -ForegroundColor Yellow
    Write-Host "1. 下载 'Build Tools for Visual Studio 2022'" -ForegroundColor Cyan
    Write-Host "2. 运行安装程序" -ForegroundColor Cyan
    Write-Host "3. 选择 'Desktop development with C++' 工作负载" -ForegroundColor Cyan
    Write-Host "4. 安装完成后，运行: npm install" -ForegroundColor Cyan
    Write-Host ""
    
} else {
    Write-Host ""
    Write-Host "[跳过] 稍后请手动安装 Visual Studio Build Tools" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "安装步骤：" -ForegroundColor Cyan
    Write-Host "1. 访问: https://visualstudio.microsoft.com/downloads/" -ForegroundColor Yellow
    Write-Host "2. 下载 'Build Tools for Visual Studio 2022'" -ForegroundColor Yellow
    Write-Host "3. 安装时选择 'Desktop development with C++' 工作负载" -ForegroundColor Yellow
    Write-Host "4. 安装完成后运行: npm install" -ForegroundColor Yellow
    Write-Host ""
}

Read-Host "按 Enter 键退出"
