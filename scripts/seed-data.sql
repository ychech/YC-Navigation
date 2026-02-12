-- 清空现有数据（保留 AboutContent 和 HeroSlide）
DELETE FROM Link;
DELETE FROM Category;
DELETE FROM GalleryImage;

-- 插入分类
INSERT INTO "Category" ("name", "sortOrder") VALUES 
('设计灵感', 0),
('UI/UX 工具', 1),
('前端开发', 2),
('后端开发', 3),
('AI 工具', 4),
(' productivity', 5);

-- 插入链接
INSERT INTO "Link" ("title", "url", "description", "icon", "tag", "clicks", "categoryId", "sortOrder") VALUES 
-- 设计灵感
('Dribbble', 'https://dribbble.com', '设计师作品展示平台', 'https://cdn.simpleicons.org/dribbble', '社区', 128, 1, 0),
('Behance', 'https://www.behance.net', 'Adobe 旗下创意作品平台', 'https://cdn.simpleicons.org/behance', '社区', 96, 1, 1),
('Awwwards', 'https://www.awwwards.com', '网页设计奖项与灵感', 'https://cdn.simpleicons.org/awwwards', '灵感', 85, 1, 2),
('Pinterest', 'https://www.pinterest.com', '图片收藏与灵感', 'https://cdn.simpleicons.org/pinterest', '灵感', 156, 1, 3),
('Muzli', 'https://muz.li', '每日设计灵感', '', '灵感', 42, 1, 4),

-- UI/UX 工具
('Figma', 'https://www.figma.com', '协作界面设计工具', 'https://cdn.simpleicons.org/figma', '设计工具', 234, 2, 0),
('Sketch', 'https://www.sketch.com', 'Mac 矢量设计工具', 'https://cdn.simpleicons.org/sketch', '设计工具', 89, 2, 1),
('Adobe XD', 'https://www.adobe.com/products/xd.html', 'UX/UI 设计与原型', 'https://cdn.simpleicons.org/adobexd', '设计工具', 67, 2, 2),
('Framer', 'https://www.framer.com', '网站与原型设计', 'https://cdn.simpleicons.org/framer', '原型', 45, 2, 3),
('Principle', 'https://principleformac.com', '交互动效设计', '', '动效', 23, 2, 4),

-- 前端开发
('GitHub', 'https://github.com', '代码托管与协作', 'https://cdn.simpleicons.org/github', '代码托管', 312, 3, 0),
('MDN Web Docs', 'https://developer.mozilla.org', 'Web 技术文档', 'https://cdn.simpleicons.org/mdnwebdocs', '文档', 189, 3, 1),
('Stack Overflow', 'https://stackoverflow.com', '开发者问答社区', 'https://cdn.simpleicons.org/stackoverflow', '社区', 267, 3, 2),
('CodePen', 'https://codepen.io', '前端代码分享', 'https://cdn.simpleicons.org/codepen', '代码', 78, 3, 3),
('Vercel', 'https://vercel.com', '前端部署平台', 'https://cdn.simpleicons.org/vercel', '部署', 134, 3, 4),
('Next.js', 'https://nextjs.org', 'React 框架', 'https://cdn.simpleicons.org/nextdotjs', '框架', 156, 3, 5),
('Tailwind CSS', 'https://tailwindcss.com', '实用优先 CSS 框架', 'https://cdn.simpleicons.org/tailwindcss', 'CSS', 198, 3, 6),

-- 后端开发
('Node.js', 'https://nodejs.org', 'JavaScript 运行时', 'https://cdn.simpleicons.org/nodedotjs', '运行时', 145, 4, 0),
('Docker', 'https://www.docker.com', '容器化平台', 'https://cdn.simpleicons.org/docker', '容器', 123, 4, 1),
('PostgreSQL', 'https://www.postgresql.org', '开源关系数据库', 'https://cdn.simpleicons.org/postgresql', '数据库', 87, 4, 2),
('Redis', 'https://redis.io', '内存数据结构存储', 'https://cdn.simpleicons.org/redis', '缓存', 65, 4, 3),
('Prisma', 'https://www.prisma.io', '现代数据库工具', 'https://cdn.simpleicons.org/prisma', 'ORM', 54, 4, 4),

-- AI 工具
('ChatGPT', 'https://chat.openai.com', 'OpenAI 对话 AI', 'https://cdn.simpleicons.org/openai', 'AI', 456, 5, 0),
('Midjourney', 'https://www.midjourney.com', 'AI 图像生成', '', 'AI', 234, 5, 1),
('Claude', 'https://claude.ai', 'Anthropic AI 助手', '', 'AI', 123, 5, 2),
('Stable Diffusion', 'https://stability.ai', '开源 AI 图像生成', '', '开源', 89, 5, 3),
('Copilot', 'https://github.com/features/copilot', 'AI 编程助手', 'https://cdn.simpleicons.org/githubcopilot', '编程', 178, 5, 4),

-- Productivity
('Notion', 'https://www.notion.so', '笔记与协作', 'https://cdn.simpleicons.org/notion', '笔记', 234, 6, 0),
('Linear', 'https://linear.app', '项目管理', 'https://cdn.simpleicons.org/linear', '项目管理', 67, 6, 1),
('Raycast', 'https://www.raycast.com', 'Mac 效率工具', '', '效率', 45, 6, 2),
('Obsidian', 'https://obsidian.md', '知识管理', '', '笔记', 89, 6, 3),
('Cron', 'https://cron.com', '日历应用', '', '效率', 34, 6, 4);

-- 插入 Gallery 图片
INSERT INTO "GalleryImage" ("url", "title") VALUES 
('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80', '抽象设计'),
('https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&q=80', '渐变艺术'),
('https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&q=80', '3D 渲染'),
('https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&q=80', '流体设计'),
('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80', '几何艺术'),
('https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=800&q=80', '光影效果');

-- 插入 SiteConfig
INSERT OR REPLACE INTO "SiteConfig" ("key", "value") VALUES 
('hero_title', '灵感与设计的边界'),
('hero_subtitle', '一个精心策划的数字档案馆，收集最纯粹的设计工具与艺术灵感。'),
('site_slogan', 'ARCHIVE.OS'),
('footer_copyright', '© 2026 艺术导航'),
('contact_email', 'hello@artistic-nav.com'),
('featured_links', '[1, 6, 11]');
