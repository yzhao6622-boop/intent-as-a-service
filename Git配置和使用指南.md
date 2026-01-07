# Git 配置和使用指南

## 📦 第一步：安装 Git

### Windows 服务器安装 Git

#### 方法1: 下载安装程序（推荐）

1. **下载 Git for Windows**
   - 访问：https://git-scm.com/download/win
   - 或直接下载：https://github.com/git-for-windows/git/releases/latest
   - 下载 `Git-2.x.x-64-bit.exe`

2. **安装 Git**
   - 双击安装程序
   - 一路点击"下一步"，使用默认配置即可
   - 安装完成后重启命令行窗口

3. **验证安装**
   ```bash
   git --version
   ```
   应该显示类似：`git version 2.43.0`

#### 方法2: 使用包管理器（如果已安装 Chocolatey）

```powershell
choco install git
```

#### 方法3: 使用 winget（Windows 10/11）

```powershell
winget install Git.Git
```

---

## 🔧 第二步：配置 Git 远程仓库

### 情况1: 项目还没有 Git 仓库

如果项目还没有初始化 Git，需要先初始化：

```bash
# 1. 初始化 Git 仓库
git init

# 2. 添加远程仓库地址
git remote add origin <你的仓库地址>

# 3. 添加所有文件
git add .

# 4. 提交初始版本
git commit -m "Initial commit"

# 5. 推送到远程仓库（如果是第一次）
git push -u origin main
```

### 情况2: 项目已有 Git 仓库，但需要配置远程地址

#### 查看当前远程仓库

```bash
git remote -v
```

如果没有输出，说明还没有配置远程仓库。

#### 添加远程仓库

```bash
# 添加远程仓库（origin 是默认名称）
git remote add origin <你的仓库地址>
```

#### 修改远程仓库地址

如果地址错误，可以修改：

```bash
# 方法1: 删除后重新添加
git remote remove origin
git remote add origin <新的仓库地址>

# 方法2: 直接修改
git remote set-url origin <新的仓库地址>
```

#### 查看远程仓库地址

```bash
git remote -v
```

---

## 📍 常见的 Git 仓库地址格式

### GitHub

```
https://github.com/用户名/仓库名.git
# 例如：https://github.com/yourusername/intent-as-a-service.git

# 或使用 SSH（需要配置 SSH 密钥）
git@github.com:用户名/仓库名.git
```

### Gitee（码云）

```
https://gitee.com/用户名/仓库名.git
# 例如：https://gitee.com/yourusername/intent-as-a-service.git
```

### GitLab

```
https://gitlab.com/用户名/仓库名.git
# 或私有服务器
https://your-gitlab-server.com/用户名/仓库名.git
```

### 其他 Git 服务

格式都是类似的：
```
https://服务器地址/用户名/仓库名.git
```

---

## 🚀 第三步：使用 Git 拉取代码

### 基本拉取命令

```bash
# 拉取最新代码（推荐）
git pull

# 或指定远程和分支
git pull origin main

# 拉取但不合并（先查看变化）
git fetch origin
git log HEAD..origin/main  # 查看有什么新提交
```

### 完整更新流程

```bash
# 1. 查看当前状态
git status

# 2. 如果有本地修改，先暂存或提交
git stash  # 暂存修改（推荐）
# 或
git add .
git commit -m "本地修改"

# 3. 拉取最新代码
git pull origin main

# 4. 如果有暂存的修改，恢复
git stash pop
```

---

## 🔐 第四步：配置 Git 认证

### HTTPS 方式（推荐，简单）

#### GitHub

1. **使用 Personal Access Token（推荐）**
   - 访问：https://github.com/settings/tokens
   - 生成新 token（选择 `repo` 权限）
   - 拉取代码时，用户名输入 GitHub 用户名，密码输入 token

2. **或使用 GitHub CLI**
   ```bash
   gh auth login
   ```

#### Gitee

1. **使用密码或 Access Token**
   - 访问：https://gitee.com/profile/personal_access_tokens
   - 生成 token
   - 拉取代码时使用 token 作为密码

#### 保存凭据（避免每次输入）

```bash
# Windows 会自动保存到凭据管理器
# 第一次输入后，后续会自动使用
```

### SSH 方式（更安全，但需要配置）

1. **生成 SSH 密钥**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   # 按 Enter 使用默认路径
   # 可以设置密码或直接按 Enter（不设置密码）
   ```

2. **查看公钥**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

3. **添加到 Git 服务商**
   - GitHub: https://github.com/settings/keys
   - Gitee: https://gitee.com/profile/sshkeys
   - 复制公钥内容，点击"添加 SSH 密钥"

4. **测试连接**
   ```bash
   ssh -T git@github.com  # GitHub
   ssh -T git@gitee.com   # Gitee
   ```

---

## 📝 完整示例：从零开始配置

假设你的代码在 GitHub 上，仓库地址是：`https://github.com/yourusername/intent-as-a-service.git`

### 第一次配置

```bash
# 1. 安装 Git（如果还没安装）
# 下载并安装 Git for Windows

# 2. 配置用户信息（只需要一次）
git config --global user.name "你的名字"
git config --global user.email "your_email@example.com"

# 3. 进入项目目录
cd C:\Users\Administrator\Desktop\intent-as-a-service

# 4. 初始化 Git（如果还没有）
git init

# 5. 添加远程仓库
git remote add origin https://github.com/yourusername/intent-as-a-service.git

# 6. 查看远程仓库（确认）
git remote -v
# 应该显示：
# origin  https://github.com/yourusername/intent-as-a-service.git (fetch)
# origin  https://github.com/yourusername/intent-as-a-service.git (push)

# 7. 拉取代码
git pull origin main
# 或如果默认分支是 master
git pull origin master
```

### 日常更新

```bash
# 直接拉取最新代码
git pull

# 或使用更新脚本
更新项目.bat
```

---

## 🔄 更新脚本中的 Git 使用

我们的 `更新项目.bat` 脚本已经包含了 Git 拉取功能：

```batch
git pull
```

如果 Git 未安装，脚本会跳过这一步，直接更新依赖和重启服务。

---

## ⚠️ 常见问题

### Q1: `git pull` 提示需要认证？

**A:** 需要配置认证信息：
- HTTPS: 使用用户名和 token/密码
- SSH: 配置 SSH 密钥

### Q2: `git pull` 提示有冲突？

**A:** 说明本地有修改和远程冲突：
```bash
# 查看冲突文件
git status

# 方法1: 暂存本地修改，拉取后再恢复
git stash
git pull
git stash pop

# 方法2: 提交本地修改后再拉取
git add .
git commit -m "本地修改"
git pull
# 如果有冲突，手动解决后：
git add .
git commit -m "解决冲突"
```

### Q3: 如何查看远程仓库地址？

**A:**
```bash
git remote -v
```

### Q4: 如何切换远程仓库？

**A:**
```bash
# 删除旧的
git remote remove origin

# 添加新的
git remote add origin <新地址>
```

### Q5: 如何查看有哪些分支？

**A:**
```bash
# 本地分支
git branch

# 远程分支
git branch -r

# 所有分支
git branch -a
```

### Q6: 如何切换到其他分支？

**A:**
```bash
# 切换到 main 分支
git checkout main

# 或创建并切换到新分支
git checkout -b new-branch
```

---

## 💡 最佳实践

1. **定期拉取代码**
   - 每天更新一次，保持代码最新
   - 使用 `更新项目.bat` 自动完成

2. **更新前检查状态**
   ```bash
   git status
   ```
   如果有未提交的修改，先处理

3. **使用分支管理**
   - `main/master`: 生产环境代码
   - `develop`: 开发环境代码
   - 功能分支: 新功能开发

4. **提交信息要清晰**
   ```bash
   git commit -m "修复前端服务启动问题"
   ```

5. **重要修改前备份**
   - 更新前备份 `.env` 和数据库文件

---

## 📚 常用 Git 命令速查

```bash
# 查看状态
git status

# 查看远程仓库
git remote -v

# 拉取代码
git pull

# 查看提交历史
git log

# 查看文件变化
git diff

# 暂存修改
git stash

# 恢复暂存
git stash pop

# 添加文件
git add .

# 提交
git commit -m "提交信息"

# 推送
git push
```

---

## 🆘 需要帮助？

如果遇到问题：

1. **查看 Git 帮助**
   ```bash
   git help <命令>
   # 例如：git help pull
   ```

2. **检查 Git 配置**
   ```bash
   git config --list
   ```

3. **查看详细错误信息**
   - Git 的错误信息通常很详细
   - 根据错误信息搜索解决方案

---

## 📌 快速配置检查清单

- [ ] Git 已安装（`git --version`）
- [ ] 配置了用户信息（`git config --global user.name`）
- [ ] 配置了远程仓库（`git remote -v`）
- [ ] 配置了认证（HTTPS token 或 SSH 密钥）
- [ ] 可以成功拉取代码（`git pull`）

完成以上步骤后，就可以使用 `更新项目.bat` 自动更新项目了！
