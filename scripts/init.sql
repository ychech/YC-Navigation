-- Artistic Navigation - 数据库初始化脚本

-- Category 表
CREATE TABLE IF NOT EXISTS "Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL UNIQUE,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- Link 表
CREATE TABLE IF NOT EXISTS "Link" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT,
    "snapshotUrl" TEXT,
    "description" TEXT,
    "tag" TEXT,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "categoryId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE
);

-- GalleryImage 表
CREATE TABLE IF NOT EXISTS "GalleryImage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- AboutContent 表
CREATE TABLE IF NOT EXISTS "AboutContent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- SiteConfig 表
CREATE TABLE IF NOT EXISTS "SiteConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL UNIQUE,
    "value" TEXT NOT NULL
);

-- HeroSlide 表
CREATE TABLE IF NOT EXISTS "HeroSlide" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "description" TEXT,
    "codeSnippet" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认数据
INSERT OR IGNORE INTO "AboutContent" ("id", "title", "description") 
VALUES (1, '关于 Artistic Navigation', '这是一个精心设计的艺术导航网站，汇集了各种创意工具和资源。');

INSERT OR IGNORE INTO "HeroSlide" ("id", "title", "subtitle", "description", "codeSnippet", "isActive", "sortOrder") 
VALUES 
(1, 'Artistic Navigation', '发现创意工具的无限可能', '精心 curated 的设计资源、开发工具与创意平台集合', '// 探索创意的边界\nconst explore = () => {\n  return inspiration;\n}', 1, 0),
(2, 'Design Tools', '打造视觉盛宴', '从 UI 设计到 3D 建模，一站式工具导航', '// 设计即艺术\nconst design = () => {\n  return masterpiece;\n}', 1, 1),
(3, 'Dev Resources', '开发者的好帮手', '精选前端、后端、全栈开发资源', '// 代码改变世界\nconst code = () => {\n  return future;\n}', 1, 2);
