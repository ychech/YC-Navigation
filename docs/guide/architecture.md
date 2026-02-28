# 项目架构分析

本文档详细解析 YC-Navigation 的代码架构和设计思路。

---

## 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| 前端框架 | Next.js 15 + React 19 | SSR、路由、API |
| 样式 | Tailwind CSS | 原子化 CSS |
| 数据库 | Prisma + SQLite/MySQL | ORM 和数据存储 |
| 动画 | Framer Motion | 页面动画效果 |
| 主题 | next-themes | 深色/浅色模式 |
| 图标 | Lucide React | 图标库 |

---

## 目录结构

```
artistic-nav/
├── prisma/                 # 数据库 schema
│   ├── schema.prisma      # 主 schema (SQLite)
│   ├── schema.mysql.prisma # MySQL 版本
│   └── dev.db             # SQLite 数据库文件
│
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API 路由
│   │   ├── admin/         # 后台管理页面
│   │   ├── gallery/       # 画廊页面
│   │   ├── page.tsx       # 首页
│   │   └── layout.tsx     # 根布局
│   │
│   ├── components/        # React 组件
│   │   ├── admin/         # 后台组件
│   │   ├── About.tsx      # 关于/幻灯片组件
│   │   ├── Hero.tsx       # 首页 Hero
│   │   ├── Navbar.tsx     # 导航栏
│   │   └── ...
│   │
│   └── lib/               # 工具库
│       ├── prisma.ts      # Prisma 客户端
│       ├── auth.ts        # 认证工具
│       └── storage/       # 存储适配器
│
├── public/                # 静态资源
│   └── uploads/           # 上传的图片
│
├── docs/                  # 文档 (VitePress)
└── deploy/                # 部署配置
```

---

## 数据库模型

### 核心模型关系图

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Category   │────<│    Link     │     │ GalleryImage│
│  分类        │     │   链接      │     │   画廊图片   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           │ clicks
                           ▼
                    ┌─────────────┐
                    │  LinkClick  │
                    │   点击记录   │
                    └─────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  HeroSlide  │     │ AboutContent│     │  SiteConfig │
│  首页幻灯片  │     │   关于内容   │     │   站点配置   │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 模型详解

#### Category（分类）
```prisma
model Category {
  id        Int     @id @default(autoincrement())
  name      String  // 分类名称
  sortOrder Int     // 排序顺序
  links     Link[]  // 关联链接
}
```

#### Link（链接）
```prisma
model Link {
  id          Int    @id @default(autoincrement())
  title       String // 标题
  url         String // URL
  description String // 描述
  icon        String // 图标 URL
  snapshotUrl String // 截图 URL
  clicks      Int    // 点击次数
  categoryId  Int    // 所属分类
  sortOrder   Int    // 排序
}
```

#### HeroSlide（幻灯片）
```prisma
model HeroSlide {
  id          Int     @id @default(autoincrement())
  title       String  // 标题
  subtitle    String  // 副标题
  description String? // 描述
  codeSnippet String? // 代码片段
  isActive    Boolean // 是否启用
  sortOrder   Int     // 排序
}
```

---

## 前端架构

### 页面结构

```
首页 (page.tsx)
├── Navbar          # 导航栏
├── Hero            # 顶部 Hero 区域
└── MainContent     # 主内容
    ├── SidebarNav  # 左侧分类导航
    ├── LinkGrid    # 链接网格
    ├── LogoCarousel # Logo 轮播
    ├── About       # 关于/幻灯片区域
    └── Footer      # 页脚
```

### 组件设计模式

#### 1. 复合组件模式
`MainContent` 组合多个子组件：

```tsx
export function MainContent({ categories, aboutContent, heroSlides }) {
  return (
    <>
      <SidebarNav categories={categories} />
      <LinkGrid links={links} />
      <About content={aboutContent} slides={heroSlides} />
      <Footer />
    </>
  );
}
```

#### 2. 条件渲染模式
`About` 组件根据数据决定显示内容：

```tsx
export const About = ({ content, slides = [] }) => {
  // 有幻灯片显示幻灯片，否则显示关于内容
  const displaySlides = slides.length > 0 ? slides : [{
    title: content.title,
    subtitle: content.description,
    // ...
  }];
  
  return (...);
};
```

#### 3. 自定义 Hook 模式
使用 `useTheme` 处理深色模式：

```tsx
const { resolvedTheme } = useTheme();
const isDark = resolvedTheme === "dark";
```

---

## 后端架构

### API 路由结构

```
api/
├── auth/              # 认证相关
│   ├── check/         # 检查登录状态
│   ├── login/         # 登录
│   ├── logout/        # 退出
│   └── password/      # 修改密码
│
├── categories/        # 分类 CRUD
├── links/             # 链接 CRUD
├── gallery/           # 画廊 CRUD
├── hero/              # 幻灯片 CRUD
├── about/             # 关于内容 CRUD
├── config/            # 站点配置
└── upload/            # 文件上传
```

### API 设计规范

所有 API 遵循 RESTful 风格：

| 方法 | 用途 | 示例 |
|------|------|------|
| GET | 获取数据 | `GET /api/links` |
| POST | 创建资源 | `POST /api/links` |
| PUT | 更新资源 | `PUT /api/links` |
| DELETE | 删除资源 | `DELETE /api/links?id=1` |

### 认证中间件

```ts
// lib/auth.ts
export async function verifyAuth() {
  const session = cookies().get("admin_session")?.value;
  if (!session) return false;
  
  // 验证 session 格式和过期时间
  const [timestamp, hash] = session.split(":");
  // ...
  return true;
}
```

---

## 数据流

### 前台数据流

```
page.tsx (Server Component)
├── Prisma 查询数据
├── 组装 props
└── 传递给组件

组件 (Client Component)
├── 接收 props
├── 使用 useState/useEffect
└── 渲染 UI
```

### 后台数据流

```
Admin Page (Client)
├── useEffect 获取数据
├── fetch('/api/xxx')
├── 更新 state
└── 渲染表单

表单提交
├── fetch('/api/xxx', { method: 'POST' })
├── API 处理请求
├── Prisma 操作数据库
└── 返回结果
```

---

## 存储架构

### 本地存储

```
public/uploads/
├── xxx-uuid.png    # 上传的图片
└── ...
```

### 存储适配器模式

```ts
// lib/storage/interface.ts
interface StorageProvider {
  upload(file: File): Promise<{ url: string, error?: string }>;
  delete(url: string): Promise<boolean>;
}

// 支持多种存储
class LocalStorage implements StorageProvider { ... }
class AliOSSStorage implements StorageProvider { ... }
```

---

## 主题系统

### 实现方式

使用 `next-themes` + Tailwind 的 `dark:` 前缀：

```tsx
// 切换主题
const { theme, setTheme } = useTheme();
setTheme(theme === "dark" ? "light" : "dark");

// 样式
<div className="bg-white dark:bg-black text-gray-900 dark:text-white">
```

### 系统偏好检测

自动检测系统深色模式偏好，首次访问时应用。

---

## 性能优化

### 1. 数据库优化
- 使用连接池
- 添加索引
- 分页查询

### 2. 前端优化
- 图片懒加载
- 组件按需加载
- CSS 优化

### 3. 缓存策略
- Next.js 静态生成
- 浏览器缓存
- CDN 缓存

---

## 扩展开发

### 添加新 API

1. 在 `src/app/api/` 下创建路由文件夹
2. 实现 `route.ts`，导出 HTTP 方法
3. 使用 `verifyAuth()` 保护管理接口

### 添加新组件

1. 在 `src/components/` 创建组件文件
2. 使用 TypeScript 定义 props 类型
3. 遵循黑白艺术风格设计

### 添加新页面

1. 在 `src/app/` 下创建文件夹
2. 创建 `page.tsx`
3. 添加导航链接
