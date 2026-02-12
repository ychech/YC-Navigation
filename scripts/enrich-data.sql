-- 更新 HeroSlides 为专业内容
UPDATE HeroSlide SET 
  title = 'Artistic Navigation',
  subtitle = '发现创意工具的无限可能',
  description = '精心 curated 的设计资源、开发工具与创意平台集合，为创作者提供纯粹的灵感源泉',
  codeSnippet = '{
  "project": "Artistic Nav",
  "version": "2.0.0",
  "status": "active",
  "resources": 50+,
  "theme": "adaptive"
}' 
WHERE id = 1;

UPDATE HeroSlide SET 
  title = 'Design Tools',
  subtitle = '打造视觉盛宴',
  description = '从 UI 设计到 3D 建模，一站式工具导航，助力创意落地',
  codeSnippet = '{
  "category": "design",
  "tools": ["Figma", "Sketch", "Blender"],
  "paradigm": "creative",
  "focus": "visual"
}' 
WHERE id = 2;

-- 添加更多分类
INSERT OR IGNORE INTO "Category" ("id", "name", "sortOrder") VALUES 
(7, '3D与动画', 6),
(8, '字体与排版', 7),
(9, '灵感博客', 8),
(10, '颜色工具', 9);

-- 更新现有链接，添加快照图片
UPDATE Link SET snapshotUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80' WHERE title = 'Dribbble';
UPDATE Link SET snapshotUrl = 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=600&q=80' WHERE title = 'Behance';
UPDATE Link SET snapshotUrl = 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=600&q=80' WHERE title = 'Awwwards';
UPDATE Link SET snapshotUrl = 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&q=80' WHERE title = 'Pinterest';
UPDATE Link SET snapshotUrl = 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&q=80' WHERE title = 'Muzli';

UPDATE Link SET snapshotUrl = 'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=600&q=80' WHERE title = 'Figma';
UPDATE Link SET snapshotUrl = 'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=600&q=80' WHERE title = 'Sketch';
UPDATE Link SET snapshotUrl = 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=600&q=80' WHERE title = 'Adobe XD';
UPDATE Link SET snapshotUrl = 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=600&q=80' WHERE title = 'Framer';
UPDATE Link SET snapshotUrl = 'https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=600&q=80' WHERE title = 'Principle';

UPDATE Link SET snapshotUrl = 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&q=80' WHERE title = 'GitHub';
UPDATE Link SET snapshotUrl = 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&q=80' WHERE title = 'MDN Web Docs';
UPDATE Link SET snapshotUrl = 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&q=80' WHERE title = 'Stack Overflow';
UPDATE Link SET snapshotUrl = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&q=80' WHERE title = 'CodePen';
UPDATE Link SET snapshotUrl = 'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=600&q=80' WHERE title = 'Vercel';

-- 添加更多链接数据
INSERT INTO "Link" ("title", "url", "description", "icon", "tag", "clicks", "categoryId", "sortOrder", "snapshotUrl") VALUES 
-- 3D与动画
('Blender', 'https://www.blender.org', '开源3D创作套件', 'https://cdn.simpleicons.org/blender', '3D', 0, 7, 0, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80'),
('Cinema 4D', 'https://www.maxon.net/cinema-4d', '专业3D建模动画', '', '3D', 0, 7, 1, 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&q=80'),
('After Effects', 'https://www.adobe.com/products/aftereffects.html', '动效设计软件', 'https://cdn.simpleicons.org/adobeaftereffects', '动效', 0, 7, 2, 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&q=80'),
('Spline', 'https://spline.design', '浏览器3D设计工具', '', '3D', 0, 7, 3, 'https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=600&q=80'),

-- 字体与排版
('Google Fonts', 'https://fonts.google.com', '免费字体库', '', '字体', 0, 8, 0, 'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=600&q=80'),
('Adobe Fonts', 'https://fonts.adobe.com', '专业字体服务', 'https://cdn.simpleicons.org/adobe', '字体', 0, 8, 1, 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=600&q=80'),
('Font Squirrel', 'https://www.fontsquirrel.com', '免费商用字体', '', '字体', 0, 8, 2, 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=600&q=80'),

-- 灵感博客
('Smashing Magazine', 'https://www.smashingmagazine.com', '设计与开发文章', '', '博客', 0, 9, 0, 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&q=80'),
('CSS-Tricks', 'https://css-tricks.com', 'CSS技巧与教程', '', '教程', 0, 9, 1, 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&q=80'),
('Designmodo', 'https://designmodo.com', '设计与Web资源', '', '博客', 0, 9, 2, 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&q=80'),

-- 颜色工具
('Coolors', 'https://coolors.co', '配色方案生成器', '', '配色', 0, 10, 0, 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&q=80'),
('Adobe Color', 'https://color.adobe.com', 'Adobe配色工具', 'https://cdn.simpleicons.org/adobe', '配色', 0, 10, 1, 'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=600&q=80'),
('Color Hunt', 'https://colorhunt.co', '配色灵感', '', '配色', 0, 10, 2, 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=600&q=80'),

-- 更多链接到现有分类
('Webflow', 'https://webflow.com', '无代码网站设计', '', '设计工具', 0, 2, 5, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80'),
('Canva', 'https://www.canva.com', '在线设计工具', '', '设计工具', 0, 2, 6, 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=600&q=80'),
('React', 'https://react.dev', 'React官方文档', 'https://cdn.simpleicons.org/react', '框架', 0, 3, 7, 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80'),
('Vue.js', 'https://vuejs.org', 'Vue框架', 'https://cdn.simpleicons.org/vuedotjs', '框架', 0, 3, 8, 'https://images.unsplash.com/photo-1607799275518-d58665d099db?w=600&q=80'),
('TypeScript', 'https://www.typescriptlang.org', '类型化JavaScript', 'https://cdn.simpleicons.org/typescript', '语言', 0, 3, 9, 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600&q=80'),
('MongoDB', 'https://www.mongodb.com', 'NoSQL数据库', 'https://cdn.simpleicons.org/mongodb', '数据库', 0, 4, 5, 'https://images.unsplash.com/photo-1623282033815-40b05d96c903?w=600&q=80'),
('Supabase', 'https://supabase.com', '开源Firebase替代', '', '后端', 0, 4, 6, 'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=600&q=80'),
('Hugging Face', 'https://huggingface.co', 'AI模型平台', '', 'AI', 0, 5, 5, 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80'),
('Runway', 'https://runwayml.com', 'AI创意工具', '', 'AI', 0, 5, 6, 'https://images.unsplash.com/photo-1686191128892-3b37add4a934?w=600&q=80'),
('FigJam', 'https://www.figma.com/figjam/', '协作白板工具', '', '效率', 0, 6, 5, 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=600&q=80'),
('Miro', 'https://miro.com', '在线协作白板', '', '效率', 0, 6, 6, 'https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=600&q=80');

-- 添加更多 Gallery 图片
INSERT INTO "GalleryImage" ("url", "title") VALUES 
('https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80', '科技感'),
('https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=800&q=80', '抽象渐变'),
('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80', '流体形态'),
('https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80', '数字艺术'),
('https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80', '霓虹光影'),
('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80', '渐变背景'),
('https://images.unsplash.com/photo-1607799275518-d58665d099db?w=800&q=80', '现代建筑'),
('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80', '色彩爆炸');

-- 更新 SiteConfig
UPDATE SiteConfig SET value = 'ARCHIVE.OS' WHERE key = 'site_slogan';
UPDATE SiteConfig SET value = '© 2026 Artistic Navigation. 精心策划的数字灵感档案馆。' WHERE key = 'footer_copyright';
