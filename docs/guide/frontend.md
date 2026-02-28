# 前端开发指南

本文档详细说明前端组件的使用和开发方法。

---

## 组件目录结构

```
src/components/
├── admin/              # 后台管理组件
│   ├── DashboardSidebar.tsx
│   ├── LinksTab.tsx
│   ├── GalleryTab.tsx
│   ├── HeroConfigTab.tsx
│   ├── HeroSlidesTab.tsx
│   ├── SiteConfigTab.tsx
│   └── DeleteConfirmModal.tsx
│
├── About.tsx           # 关于/幻灯片组件
├── Hero.tsx            # 首页 Hero
├── Navbar.tsx          # 导航栏
├── MainContent.tsx     # 主内容区
├── SidebarNav.tsx      # 侧边导航
├── LinkGrid.tsx        # 链接网格
├── LogoCarousel.tsx    # Logo 轮播
├── Gallery.tsx         # 画廊组件
├── SearchModal.tsx     # 搜索弹窗
├── GlobalSpotlight.tsx # 全局光效
└── AnimatedSectionHeader.tsx # 动画标题
```

---

## 核心组件详解

### Hero 组件

首页顶部的大标题区域。

**Props：**

| 属性 | 类型 | 说明 |
|------|------|------|
| title | string | 主标题 |
| subtitle | string | 副标题 |
| categories | Category[] | 分类数据（用于搜索）|
| systemCode | string | 系统代码显示 |

**使用示例：**

```tsx
<Hero 
  title="灵感与设计的边界"
  subtitle="一个精心策划的数字档案馆..."
  categories={categories}
  systemCode="ARCHIVE.OS"
/>
```

**实现要点：**
- 使用 Framer Motion 实现滚动渐隐效果
- 集成搜索弹窗
- 响应式字体大小

---

### About 组件

首页下方的幻灯片/关于区域。

**Props：**

| 属性 | 类型 | 说明 |
|------|------|------|
| content | AboutContent | 关于内容 |
| slides | HeroSlide[] | 幻灯片数组 |
| categories | Category[] | 分类数据 |
| codeFileName | string | 代码文件名 |

**显示逻辑：**

```tsx
// 如果有幻灯片，显示幻灯片
// 如果没有，用 aboutContent 作为默认
const displaySlides = slides.length > 0 
  ? slides 
  : [{
      title: content.title,
      subtitle: content.description,
      // ...
    }];
```

**特性：**
- 自动轮播（8秒间隔）
- 键盘左右键切换
- 打字机效果副标题
- 代码块语法高亮

---

### Navbar 组件

顶部导航栏。

**Props：**

| 属性 | 类型 | 说明 |
|------|------|------|
| categories | Category[] | 分类列表 |
| siteName | string | 站点名称 |
| siteSlogan | string | 站点标语 |

**功能：**
- 分类下拉菜单
- 搜索按钮
- 主题切换
- 移动端汉堡菜单

---

### LinkGrid 组件

链接卡片网格布局。

**Props：**

| 属性 | 类型 | 说明 |
|------|------|------|
| links | Link[] | 链接数组 |
| categoryIndex | number | 分类索引（影响动画延迟）|
| featuredLinks | Link[] | 精选链接（高亮显示）|

**特性：**
- 悬停卡片放大效果
- 点击统计
- 新窗口打开链接
- 标签显示

---

## 后台组件

### DashboardSidebar

后台侧边栏导航。

**Props：**

| 属性 | 类型 | 说明 |
|------|------|------|
| activeTab | Tab | 当前激活的 Tab |
| setActiveTab | function | 切换 Tab |
| isSidebarCollapsed | boolean | 是否折叠 |
| setIsSidebarCollapsed | function | 切换折叠状态 |
| onLogout | function | 退出登录 |
| stats | object | 统计数据 |

**菜单结构：**
- 内容管理：链接、画廊
- 首页配置：首页标题、尾部幻灯片
- 其他：站点配置

---

### LinksTab

链接管理界面。

**功能：**
- 分类管理（添加、编辑、删除）
- 链接管理（添加、编辑、删除）
- 搜索过滤
- 标签选择

**数据结构：**
```typescript
interface Category {
  id: number;
  name: string;
  links: Link[];
}

interface Link {
  id: number;
  title: string;
  url: string;
  description: string;
  categoryId: number;
  tags: string[];
}
```

---

### HeroSlidesTab

尾部幻灯片管理。

**特点：**
- 支持两种显示模式：幻灯片 / 关于内容
- 幻灯片支持启用/禁用
- 实时预览

---

## 自定义 Hooks

### useTheme

主题切换 Hook。

```tsx
import { useTheme } from "next-themes";

function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  const isDark = resolvedTheme === "dark";
  
  return (
    <button onClick={() => setTheme(isDark ? "light" : "dark")}>
      切换主题
    </button>
  );
}
```

---

## 样式规范

### 颜色系统

**黑白艺术风格：**

```css
/* 浅色模式 */
bg-white           /* 纯白背景 */
text-black         /* 纯黑文字 */
border-black/10    /* 10% 黑色边框 */

/* 深色模式 */
bg-black           /* 纯黑背景 */
text-white         /* 纯白文字 */
border-white/10    /* 10% 白色边框 */
```

### 间距规范

```css
/* 页面内边距 */
px-4 md:px-6 lg:px-8 xl:px-12

/* 组件间距 */
space-y-6    /* 垂直间距 24px */
gap-4        /* 网格间距 16px */
p-6          /* 内边距 24px */
```

### 字体规范

```css
/* 标题 */
text-2xl font-light tracking-wide

/* 正文 */
text-sm text-black/60

/* 标签 */
text-xs uppercase tracking-wider
```

---

## 动画效果

### Framer Motion 常用模式

**淡入动画：**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  内容
</motion.div>
```

**列表动画：**
```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }}
>
  {items.map(item => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.name}
    </motion.div>
  ))}
</motion.div>
```

**滚动效果：**
```tsx
const { scrollY } = useScroll();
const opacity = useTransform(scrollY, [0, 400], [1, 0]);

<motion.div style={{ opacity }}>
  随滚动渐隐
</motion.div>
```

---

## 表单处理

### 受控组件模式

```tsx
function Form() {
  const [formData, setFormData] = useState({
    title: "",
    description: ""
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/xxx", {
      method: "POST",
      body: JSON.stringify(formData)
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.title}
        onChange={e => setFormData({ ...formData, title: e.target.value })}
      />
      <button type="submit">提交</button>
    </form>
  );
}
```

---

## 开发规范

### 文件命名

- 组件：PascalCase（如 `Hero.tsx`）
- 工具：camelCase（如 `utils.ts`）
- 样式：kebab-case（如 `globals.css`）

### 类型定义

```typescript
// 组件 Props 接口
interface ComponentProps {
  title: string;
  children?: React.ReactNode;
}

// 数据接口
interface Link {
  id: number;
  title: string;
  // ...
}
```

### 注释规范

```typescript
/**
 * 组件说明
 * @param title - 标题
 * @returns JSX.Element
 */
export function Component({ title }: { title: string }) {
  // 实现逻辑
}
```
