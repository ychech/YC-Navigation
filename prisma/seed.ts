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
          { title: 'Awwwards', url: '#', description: '全球顶尖数字设计奖项，寻找创意与创新的边界。' },
          { title: 'Behance', url: '#', description: 'Adobe 旗下的创意作品展示平台，汇聚全球设计师。' },
          { title: 'Dribbble', url: '#', description: '设计师的社交网络，分享微小设计细节的乐园。' },
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
          { title: 'Framer', url: '#', description: 'AI 驱动的网页设计与构建工具，实现极致动效。' },
          { title: 'Figma', url: '#', description: '协同设计的行业标准，让创意无缝衔接。' },
          { title: 'Next.js', url: '#', description: '为 React 而生的 Web 框架，兼顾性能与体验。' },
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

  // 4. 站点配置 (联系信息 & Hero)
  await prisma.siteConfig.createMany({
    data: [
      { key: "contact_email", value: "hello@artistic-nav.com" },
      { key: "social_twitter", value: "Twitter" },
      { key: "social_instagram", value: "Instagram" },
      { key: "footer_copyright", value: "© 2024 艺术导航" },
      { key: "hero_title", value: "灵感与设计的边界" },
      { key: "hero_subtitle", value: "超越常规的数字导航体验。探索极致的设计语言与未来交互。" },
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
