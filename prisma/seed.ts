import prisma from "../src/lib/prisma";

async function main() {
  // 清理旧数据
  await prisma.link.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.galleryImage.deleteMany({});
  await prisma.aboutContent.deleteMany({});
  await prisma.siteConfig.deleteMany({});

  // 1. 导航分类与链接
  const design = await prisma.category.upsert({
    where: { name: '设计灵感' },
    update: {},
    create: {
      name: '设计灵感',
      links: {
        create: [
          { title: 'Awwwards', url: 'https://www.awwwards.com', icon: 'https://icons.duckduckgo.com/ip3/www.awwwards.com.ico', description: '全球顶尖数字设计奖项，寻找创意与创新的边界。' },
          { title: 'Behance', url: 'https://www.behance.net', icon: 'https://icons.duckduckgo.com/ip3/www.behance.net.ico', description: 'Adobe 旗下的创意作品展示平台，汇聚全球设计师。' },
          { title: 'Dribbble', url: 'https://dribbble.com', icon: 'https://icons.duckduckgo.com/ip3/dribbble.com.ico', description: '设计师的社交网络，分享微小设计细节的乐园。' },
          { title: 'Pinterest', url: 'https://www.pinterest.com', icon: 'https://icons.duckduckgo.com/ip3/www.pinterest.com.ico', description: '全球创意灵感图库，发现美好生活灵感。' },
          { title: 'Mobbin', url: 'https://mobbin.com', icon: 'https://icons.duckduckgo.com/ip3/mobbin.com.ico', description: '移动应用设计参考库，精选优秀 App 界面。' },
        ]
      }
    }
  });

  const tools = await prisma.category.upsert({
    where: { name: '生产力工具' },
    update: {},
    create: {
      name: '生产力工具',
      links: {
        create: [
          { title: 'Framer', url: 'https://www.framer.com', icon: 'https://icons.duckduckgo.com/ip3/www.framer.com.ico', description: 'AI 驱动的网页设计与构建工具，实现极致动效。' },
          { title: 'Figma', url: 'https://www.figma.com', icon: 'https://icons.duckduckgo.com/ip3/www.figma.com.ico', description: '协同设计的行业标准，让创意无缝衔接。' },
          { title: 'Notion', url: 'https://www.notion.so', icon: 'https://icons.duckduckgo.com/ip3/www.notion.so.ico', description: '全能工作空间，笔记、数据库、项目管理一体。' },
          { title: 'Vercel', url: 'https://vercel.com', icon: 'https://icons.duckduckgo.com/ip3/vercel.com.ico', description: '前端部署平台，让开发者的创意快速上线。' },
          { title: 'GitHub', url: 'https://github.com', icon: 'https://icons.duckduckgo.com/ip3/github.com.ico', description: '代码托管与协作平台，开发者的家园。' },
        ]
      }
    }
  });

  // 2. 画廊数据
  await prisma.galleryImage.createMany({
    data: [
      { url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop", title: "Minimal Abstract 01" },
      { url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop", title: "Digital Space 02" },
      { url: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=1974&auto=format&fit=crop", title: "Texture 03" },
      { url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop", title: "Flow 04" },
    ]
  });

  // 3. 关于内容
  await prisma.aboutContent.create({
    data: {
      title: "我们相信数字空间也应当具备艺术的温度与设计的深度。",
      description: "艺术导航 (Artistic Nav) 不仅仅是一个链接的集合，它是一个经过深思熟虑策划的数字档案馆。我们致力于为现代创意从业者提供一个宁静、纯粹且充满启发的探索空间。通过极简主义的设计语言和细腻的交互体验，我们重新定义了“导航”这一行为，使其从单纯的点击转变为一次关于美学的旅程。"
    }
  });

  // 4. 站点配置 (联系信息 & Hero & 系统名称)
  await prisma.siteConfig.createMany({
    data: [
      { key: "contact_email", value: "hello@artistic-nav.com" },
      { key: "social_twitter", value: "Twitter" },
      { key: "social_instagram", value: "Instagram" },
      { key: "footer_copyright", value: "© 2024 艺术导航" },
      { key: "hero_title", value: "灵感与设计的边界" },
      { key: "hero_subtitle", value: "超越常规的数字导航体验。探索极致的设计语言与未来交互。" },
      { key: "site_name", value: "艺术导航" },
      { key: "site_slogan", value: "ARCHIVE.OS" },
      { key: "admin_title_links", value: "档案索引" },
      { key: "admin_title_gallery", value: "视觉陈列" },
      { key: "admin_title_about", value: "馆主自传" },
      { key: "admin_title_config", value: "系统核心" },
      { key: "admin_title_hero", value: "首页展示" },
    ]
  });

  console.log('种子数据已更新（包含画廊、关于和站点配置）');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
