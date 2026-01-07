# PM2 使用指南

## 🚀 一键启动前后端

### 启动所有服务

```cmd
pm2 start ecosystem.config.js
```

这会同时启动：
- 后端服务（端口 3002）
- 前端服务（端口 5173）

### 查看状态

```cmd
pm2 status
```

### 查看日志

```cmd
# 查看所有日志
pm2 logs

# 查看后端日志
pm2 logs intent-api

# 查看前端日志
pm2 logs intent-frontend
```

### 重启服务

```cmd
# 重启所有服务
pm2 restart all

# 重启后端
pm2 restart intent-api

# 重启前端
pm2 restart intent-frontend
```

### 停止服务

```cmd
# 停止所有服务
pm2 stop all

# 停止后端
pm2 stop intent-api

# 停止前端
pm2 stop intent-frontend
```

### 删除服务

```cmd
# 删除所有服务
pm2 delete all

# 删除后端
pm2 delete intent-api

# 删除前端
pm2 delete intent-frontend
```

---

## 💾 保存配置

启动服务后，保存配置以便开机自启：

```cmd
pm2 save
pm2-startup install
```

---

## 📊 监控

```cmd
# 实时监控
pm2 monit

# 查看详细信息
pm2 show intent-api
pm2 show intent-frontend
```

---

## 🔄 更新应用后重启

```cmd
# 重新构建
npm run build

# 重启服务
pm2 restart all
```

---

## 📝 常用命令总结

```cmd
pm2 start ecosystem.config.js    # 启动所有服务
pm2 status                        # 查看状态
pm2 logs                          # 查看日志
pm2 restart all                   # 重启所有
pm2 stop all                      # 停止所有
pm2 delete all                    # 删除所有
pm2 save                          # 保存配置
```

---

## ⚠️ 注意事项

1. **开发环境**：前端使用 `npm run dev`（Vite 开发服务器）
2. **生产环境**：建议构建前端后使用静态文件服务器
3. **日志位置**：`./logs/` 目录
4. **内存限制**：后端 1GB，前端 500MB

---

## 🎯 生产环境建议

生产环境建议：

1. **构建前端**：
   ```cmd
   cd client
   npm run build
   ```

2. **使用静态文件服务器**（如 Nginx 或 IIS）提供前端文件

3. **只使用 PM2 管理后端**：
   ```cmd
   pm2 start intent-api
   ```
