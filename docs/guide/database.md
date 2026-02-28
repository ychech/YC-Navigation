# 数据库详解

本文档详细说明 YC-Navigation 的数据库设计和使用方法。

---

## 数据库选择

项目支持两种数据库：

| 数据库 | 适用场景 | 优点 | 缺点 |
|--------|---------|------|------|
| **SQLite** | 个人使用、小流量 | 零配置、单文件、低内存 | 并发性能有限 |
| **MySQL** | 生产环境、高并发 | 性能高、支持多实例 | 需要额外安装 |

---

## 切换数据库

### SQLite（默认）

```env
DB_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"
```

### MySQL

```env
DB_PROVIDER=mysql
DATABASE_URL="mysql://用户名:密码@主机:端口/数据库名"
```

切换后执行：
```bash
npx prisma generate
npx prisma db push
```

---

## 数据表结构

### Category（分类表）

存储链接分类信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int | 主键，自增 |
| name | String | 分类名称 |
| sortOrder | Int | 排序顺序（越小越靠前）|
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

**关系**：一个分类有多个链接（一对多）

---

### Link（链接表）

存储导航链接信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int | 主键，自增 |
| title | String | 链接标题 |
| url | String | 链接地址 |
| description | String | 描述 |
| icon | String | 图标 URL |
| snapshotUrl | String | 截图 URL |
| tag | String | 标签 |
| clicks | Int | 点击次数 |
| categoryId | Int | 所属分类 ID |
| sortOrder | Int | 排序顺序 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

**索引**：
- `categoryId` - 加速分类查询
- `clicks` - 加速热门排序

---

### HeroSlide（幻灯片表）

存储首页下方轮播的幻灯片内容。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int | 主键，自增 |
| title | String | 标题 |
| subtitle | String | 副标题 |
| description | String? | 描述（可选）|
| codeSnippet | String? | 代码片段（可选）|
| isActive | Boolean | 是否启用 |
| sortOrder | Int | 排序顺序 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

**说明**：
- 当 `isActive=false` 时，前台不显示
- 按 `sortOrder` 排序轮播

---

### AboutContent（关于内容表）

存储关于页面的内容，作为幻灯片的备选。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int | 主键，自增 |
| title | String | 标题 |
| description | String | 描述内容 |
| updatedAt | DateTime | 更新时间 |

**说明**：通常只有一条记录。

---

### GalleryImage（画廊图片表）

存储画廊页面的图片。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int | 主键，自增 |
| url | String | 图片 URL |
| title | String | 图片标题 |
| createdAt | DateTime | 创建时间 |

---

### SiteConfig（站点配置表）

存储键值对形式的站点配置。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int | 主键，自增 |
| key | String | 配置键（唯一）|
| value | String | 配置值 |

**常用配置项**：

| key | 说明 | 示例值 |
|-----|------|--------|
| site_name | 站点名称 | 艺术导航 |
| site_slogan | 站点标语 | ARTISTIC NAV |
| hero_title | 首页标题 | 灵感与设计的边界 |
| hero_subtitle | 首页副标题 | 一个精心策划的数字档案馆... |
| footer_copyright | 版权信息 | © 2026 艺术导航 |
| contact_email | 联系邮箱 | hello@artistic-nav.com |
| featured_links | 精选链接 | [1, 2, 3] |
| link_tags | 链接标签 | ["热门", "推荐"] |

---

## Prisma 操作示例

### 查询

```typescript
// 获取所有分类及其链接
const categories = await prisma.category.findMany({
  include: { links: true },
  orderBy: { sortOrder: 'asc' }
});

// 获取启用的幻灯片
const slides = await prisma.heroSlide.findMany({
  where: { isActive: true },
  orderBy: { sortOrder: 'asc' }
});

// 获取单个链接
const link = await prisma.link.findUnique({
  where: { id: 1 }
});
```

### 创建

```typescript
// 创建分类
const category = await prisma.category.create({
  data: {
    name: "设计工具",
    sortOrder: 1
  }
});

// 创建链接
const link = await prisma.link.create({
  data: {
    title: "Figma",
    url: "https://figma.com",
    categoryId: 1,
    sortOrder: 0
  }
});
```

### 更新

```typescript
// 更新链接
await prisma.link.update({
  where: { id: 1 },
  data: { clicks: { increment: 1 } }
});

// 更新或创建配置
await prisma.siteConfig.upsert({
  where: { key: "site_name" },
  update: { value: "新名称" },
  create: { key: "site_name", value: "新名称" }
});
```

### 删除

```typescript
// 删除链接
await prisma.link.delete({
  where: { id: 1 }
});

// 删除分类及其链接
await prisma.link.deleteMany({
  where: { categoryId: 1 }
});
await prisma.category.delete({
  where: { id: 1 }
});
```

---

## 数据库迁移

### 开发环境

```bash
# 生成迁移文件
npx prisma migrate dev --name 迁移名称

# 应用迁移
npx prisma migrate deploy
```

### 生产环境

```bash
# 只应用迁移，不生成
npx prisma migrate deploy
```

---

## 数据备份

### SQLite 备份

```bash
# 直接复制数据库文件
cp prisma/dev.db prisma/dev.db.backup
```

### MySQL 备份

```bash
# 使用 mysqldump
mysqldump -u root -p artistic_nav > backup.sql

# 恢复
mysql -u root -p artistic_nav < backup.sql
```

---

## 常见问题

### 1. 数据库锁定（SQLite）

**问题**：SQLite 并发写入时锁定

**解决**：
- 减少并发写入
- 使用连接池
- 考虑切换到 MySQL

### 2. 时区问题

**问题**：时间显示不正确

**解决**：
```typescript
// 存储时转换为 UTC
// Prisma 自动处理时区转换
```

### 3. 字符集问题（MySQL）

**解决**：确保使用 utf8mb4
```sql
ALTER DATABASE artistic_nav CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
