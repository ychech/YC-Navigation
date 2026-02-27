# Vercel 部署

Vercel 是部署 Next.js 应用的最佳平台，提供无服务器部署和自动 HTTPS。

## 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ychech/YC-Navigation)

## 手动部署

### 1. 准备代码

确保代码已推送到 GitHub/GitLab/Bitbucket。

### 2. 导入项目

1. 登录 [Vercel](https://vercel.com)
2. 点击 "Add New Project"
3. 导入你的仓库

### 3. 配置环境变量

在项目设置中添加：

```
DATABASE_URL=file:./dev.db
ADMIN_PASSWORD=your_secure_password
```

### 4. 部署

点击 "Deploy"，等待构建完成。

## 注意事项

### 数据库

Vercel 使用无服务器函数，SQLite 可能无法持久化。建议：

1. 使用 Vercel Postgres 或外部 MySQL
2. 配置 `DATABASE_URL` 为外部数据库

### 构建配置

确保 `next.config.ts` 设置为 standalone：

```typescript
const nextConfig = {
  output: 'standalone'
}
```

### 自定义域名

1. 进入项目 Dashboard
2. 点击 "Settings" → "Domains"
3. 添加你的域名

## 自动部署

每次推送到 main 分支会自动触发部署。

## 部署预览

Pull Request 会自动生成预览链接。
