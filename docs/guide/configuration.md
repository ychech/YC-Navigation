# 环境配置

## 环境变量

所有配置通过 `.env` 文件管理：

### 基础配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DATABASE_URL` | 数据库连接地址 | `file:./dev.db` |
| `ADMIN_PASSWORD` | 管理员密码 | `admin123456` |
| `NEXT_PUBLIC_SITE_URL` | 站点 URL | `http://localhost:3000` |

### 数据库配置

**SQLite (默认)**
```env
DATABASE_URL="file:./dev.db"
```

**MySQL**
```env
DATABASE_URL="mysql://user:password@localhost:3306/artistic_nav"
```

### 阿里云 OSS (可选)

用于图片上传存储：

```env
OSS_REGION=oss-cn-hangzhou
OSS_ACCESS_KEY_ID=your_access_key
OSS_ACCESS_KEY_SECRET=your_secret
OSS_BUCKET=your_bucket
OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com
```

## 配置文件

### next.config.ts

Next.js 配置文件，包含构建和运行时选项：

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

### tailwind.config.ts

Tailwind CSS 配置，包含主题和动画设置。

## 🛡️ 安全配置

生产环境建议：

1. 修改默认管理员密码
2. 使用 HTTPS
3. 配置防火墙
4. 启用 Fail2ban

详见 [安全加固指南](../deploy/security.md)
