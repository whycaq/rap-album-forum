# 🚀 Vercel 部署指南

## 📋 部署步骤

### 1. 准备环境变量

在 Vercel 项目设置中添加以下环境变量：

#### 必需的环境变量：
```
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥
VITE_API_BASE_URL=你的Supabase项目URL（通常与VITE_SUPABASE_URL相同）
```

#### 可选的环境变量（如果使用 Spotify 导入功能）：
```
VITE_SPOTIFY_CLIENT_ID=你的Spotify客户端ID
VITE_SPOTIFY_CLIENT_SECRET=你的Spotify客户端密钥
```

### 2. 推送代码到 GitHub

```bash
git add .
git commit -m "chore: update dependencies and add Vercel config"
git push
```

### 3. 在 Vercel 中导入项目

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 选择你的 GitHub 仓库
4. Vercel 会自动检测到这是一个 Vite 项目
5. 在 "Environment Variables" 中添加上述环境变量
6. 点击 "Deploy"

### 4. 等待部署完成

部署通常需要 1-3 分钟，完成后你会获得一个 `.vercel.app` 域名。

## 🔧 本地测试构建

在推送到 Vercel 之前，建议先在本地测试构建：

```bash
# 安装更新的依赖
npm install

# 测试构建
npm run build

# 预览构建结果
npm run preview
```

如果本地构建成功，Vercel 上的部署也应该成功。

## ⚠️ 常见问题

### 问题1：构建失败 - vue-tsc 错误
**解决方案**：已在 `package.json` 中更新 `vue-tsc` 到 v2.0.0

### 问题2：Node.js 版本不兼容
**解决方案**：已在 `vercel.json` 中指定使用 Node.js 20

### 问题3：环境变量未生效
**解决方案**：确保在 Vercel 项目设置的 "Environment Variables" 中正确添加所有变量

### 问题4：路由 404 错误
**解决方案**：Vercel 会自动处理 SPA 路由，无需额外配置

## 📝 更新部署

每次推送到 `main` 分支时，Vercel 会自动重新部署。

## 🌐 自定义域名

在 Vercel 项目设置的 "Domains" 中可以添加自定义域名。

## 🔍 查看部署日志

如果部署失败，可以在 Vercel 控制台查看详细的构建日志来诊断问题。

