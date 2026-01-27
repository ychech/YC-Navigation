import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const links = [
  // AI
  { title: "ChatGPT", url: "https://chat.openai.com", description: "OpenAI 旗下的对话 AI，目前最强的生产力工具之一。", categoryName: "AI 智能" },
  { title: "Claude", url: "https://claude.ai", description: "Anthropic 开发的 AI 助手，以长文本理解和人性化对话著称。", categoryName: "AI 智能" },
  { title: "Midjourney", url: "https://midjourney.com", description: "顶级的 AI 绘画工具，艺术感和写实度极高。", categoryName: "AI 智能" },
  { title: "Perplexity", url: "https://perplexity.ai", description: "AI 驱动的搜索引擎，提供结构化的实时信息。", categoryName: "AI 智能" },
  { title: "DeepSeek", url: "https://deepseek.com", description: "国产之光，极具性价比且性能强劲的开源大模型。", categoryName: "AI 智能" },
  
  // Design
  { title: "Figma", url: "https://figma.com", description: "最受欢迎的协作式 UI/UX 设计工具。", categoryName: "视觉设计" },
  { title: "Dribbble", url: "https://dribbble.com", description: "全球顶尖设计师的作品展示平台。", categoryName: "视觉设计" },
  { title: "Behance", url: "https://behance.net", description: "Adobe 旗下的创意作品集社区。", categoryName: "视觉设计" },
  { title: "Pinterest", url: "https://pinterest.com", description: "灵感收集与图片搜索的首选之地。", categoryName: "视觉设计" },
  { title: "Eagle", url: "https://eagle.cool", description: "本地素材管理工具，设计师的数字资产管家。", categoryName: "视觉设计" },
  
  // Development
  { title: "GitHub", url: "https://github.com", description: "全球最大的代码托管与开源协作平台。", categoryName: "开发利器" },
  { title: "Vercel", url: "https://vercel.com", description: "前端部署的首选平台，Next.js 的母公司。", categoryName: "开发利器" },
  { title: "Stack Overflow", url: "https://stackoverflow.com", description: "全球程序员的技术问答社区。", categoryName: "开发利器" },
  { title: "MDN Web Docs", url: "https://developer.mozilla.org", description: "最权威的 Web 开发文档。", categoryName: "开发利器" },
  { title: "Tailwind CSS", url: "https://tailwindcss.com", description: "原子化 CSS 框架，开发效率极高。", categoryName: "开发利器" },
  
  // Tools
  { title: "Notion", url: "https://notion.so", description: "全能型笔记与项目管理协作工具。", categoryName: "效率工具" },
  { title: "DeepL", url: "https://deepl.com", description: "全球最精准的 AI 翻译工具。", categoryName: "效率工具" },
  { title: "Raycast", url: "https://raycast.com", description: "Mac 上的全能启动器，可替代 Spotlight。", categoryName: "效率工具" },
  { title: "Canva", url: "https://canva.com", description: "在线平面设计工具，简单高效。", categoryName: "效率工具" },
  { title: "Obsidian", url: "https://obsidian.md", description: "基于本地 Markdown 的第二大脑笔记系统。", categoryName: "效率工具" },
  
  // Inspiration
  { title: "Awwwards", url: "https://awwwards.com", description: "全球最优秀的网页设计奖项展示。", categoryName: "灵感收集" },
  { title: "Product Hunt", url: "https://producthunt.com", description: "发现最新、最酷的科技产品。", categoryName: "灵感收集" },
  { title: "Abduzeedo", url: "https://abduzeedo.com", description: "老牌的设计灵感博客，内容质量极高。", categoryName: "灵感收集" },
  { title: "SaaS Design", url: "https://saasdesign.io", description: "专注于 SaaS 产品设计的灵感库。", categoryName: "灵感收集" },
  { title: "Mobbin", url: "https://mobbin.com", description: "全球移动应用 UI 设计的参考库。", categoryName: "灵感收集" },
  
  // Resources
  { title: "Unsplash", url: "https://unsplash.com", description: "免费高画质摄影图片素材库。", categoryName: "资源下载" },
  { title: "Iconfont", url: "https://iconfont.cn", description: "阿里巴巴矢量图标库，国内最好用。", categoryName: "资源下载" },
  { title: "Fontshare", url: "https://fontshare.com", description: "免费的商用字体资源库。", categoryName: "资源下载" },
  { title: "Pexels", url: "https://pexels.com", description: "免费高清视频与图片资源。", categoryName: "资源下载" },
  { title: "Flaticon", url: "https://flaticon.com", description: "全球最大的免费图标资源库。", categoryName: "资源下载" },
];

async function main() {
  console.log("开始清理旧数据...");
  await prisma.link.deleteMany();
  await prisma.category.deleteMany();

  console.log("开始填充数据...");
  for (const item of links) {
    const category = await prisma.category.upsert({
      where: { name: item.categoryName },
      update: {},
      create: { name: item.categoryName },
    });

    await prisma.link.create({
      data: {
        title: item.title,
        url: item.url,
        description: item.description,
        categoryId: category.id,
      },
    });
  }
  console.log("数据填充完成！");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
