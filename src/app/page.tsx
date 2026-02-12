
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { GlobalSpotlight } from "@/components/GlobalSpotlight";
import { ParticleWave } from "@/components/ParticleWave";
import { StarFieldTransition } from "@/components/StarFieldTransition";
import { MainContent } from "@/components/MainContent";

export const dynamic = 'auto';
export const revalidate = 60;

export default async function Home() {
  const [categories, galleryImages, aboutContent, siteConfigs, heroSlides] = await Promise.all([
    prisma.category.findMany({ include: { links: true } }),
    prisma.galleryImage.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.aboutContent.findFirst(),
    prisma.siteConfig.findMany(),
    prisma.heroSlide.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
  ]);

  const configMap = Object.fromEntries(siteConfigs.map(c => [c.key, c.value]));
  
  const allLinks = categories.flatMap(cat => cat.links || []);
  let featuredLinks: typeof allLinks = [];
  
  try {
    const featuredConfig = configMap.featured_links;
    if (featuredConfig) {
      const featuredIds: number[] = JSON.parse(featuredConfig);
      featuredLinks = featuredIds
        .map(id => allLinks.find(link => link.id === id))
        .filter(Boolean) as typeof allLinks;
    }
  } catch {
    // 如果没有配置或解析失败，不显示精选
  }
  
  // 如果配置的精选不足3个，从有图片的链接中补充
  if (featuredLinks.length < 3) {
    const existingIds = new Set(featuredLinks.map(l => l.id));
    const linksWithImages = allLinks
      .filter(link => link.snapshotUrl && !existingIds.has(link.id))
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
    
    featuredLinks = [...featuredLinks, ...linksWithImages.slice(0, 3 - featuredLinks.length)];
  }
  
  // 如果还是有不足，用点击量最高的补充
  if (featuredLinks.length < 3) {
    const existingIds = new Set(featuredLinks.map(l => l.id));
    const remainingLinks = allLinks
      .filter(link => !existingIds.has(link.id))
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
    
    featuredLinks = [...featuredLinks, ...remainingLinks.slice(0, 3 - featuredLinks.length)];
  }
  
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#020617] text-gray-900 dark:text-white transition-colors duration-300 relative selection:bg-indigo-500/30">
      <GlobalSpotlight />
      <Navbar categories={categories} />
      
      {/* Hero Section */}
      <Hero 
        title={configMap.hero_title || "灵感与设计的边界"} 
        subtitle={configMap.hero_subtitle || "一个精心策划的数字档案馆，收集最纯粹的设计工具与艺术灵感。"} 
        categories={categories}
        systemCode={configMap.site_slogan || "ARCHIVE.OS"}
      />

      {/* Visual Transition Zone */}
      <div className="relative w-full h-[200px] -mt-[100px] z-10 pointer-events-none">
        <StarFieldTransition />
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <ParticleWave />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/50 to-gray-50 dark:via-[#020617]/50 dark:to-[#020617]" />
      </div>

      {/* Main Content with Sidebar */}
      <MainContent 
        categories={categories}
        aboutContent={aboutContent}
        heroSlides={heroSlides}
        featuredLinks={featuredLinks}
        configMap={configMap}
      />
    </main>
  );
}
