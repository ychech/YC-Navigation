# VitePress 文档部署指南

本文档已配置多种云部署方式，选择适合你的方式进行部署。

## 🚀 部署方式

### 1. GitHub Pages（推荐）

已配置 GitHub Actions，推送到 main/master 分支自动部署。

**步骤：**

1. 推送代码到 GitHub
2. 进入仓库 Settings → Pages
3. Source 选择 "GitHub Actions"
4. 访问 `https://<username>.github.io/<repo-name>/`

### 2. Vercel

**一键部署：**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ychech/YC-Navigation)

**手动部署：**

1. 登录 [Vercel](https://vercel.com)
2. 导入项目
3. 构建命令：`npm run docs:build`
4. 输出目录：`docs/.vitepress/dist`

### 3. Netlify

**一键部署：**

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/ychech/YC-Navigation)

**手动部署：**

1. 登录 [Netlify](https://netlify.com)
2. 选择 "Add new site" → "Import an existing project"
3. 选择你的 GitHub 仓库
4. 构建设置已包含在 `netlify.toml` 中

### 4. Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 Pages → "Create a project"
3. 连接 GitHub 仓库
4. 构建设置：
   - Build command: `npm run docs:build`
   - Build output: `docs/.vitepress/dist`

## 📋 本地预览

```bash
# 开发模式
npm run docs:dev

# 构建
npm run docs:build

# 预览构建结果
npm run docs:preview
```

## 🔧 自定义域名

### Vercel
1. 进入项目 Dashboard
2. Settings → Domains
3. 添加你的域名

### Netlify
1. 进入 Site settings
2. Domain management
3. 添加自定义域名

### Cloudflare Pages
1. 进入项目
2. Custom domains
3. 设置域名

## 📝 文档结构

```
docs/
├── .vitepress/
│   ├── config.mjs    # 配置文件
│   └── dist/         # 构建输出
├── index.md          # 首页
├── guide/            # 指南文档
├── api/              # API 文档
└── deploy/           # 部署文档
```

## 🛠️ 修改配置

编辑 `docs/.vitepress/config.mjs`：

```javascript
export default defineConfig({
  title: '你的标题',
  description: '你的描述',
  base: '/<repo-name>/',  // GitHub Pages 需要设置
  // ...
})
```

## 🔗 相关链接

- [VitePress 文档](https://vitepress.dev/)
- [GitHub Pages](https://pages.github.com/)
- [Vercel](https://vercel.com/)
- [Netlify](https://netlify.com/)
