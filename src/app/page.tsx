
import prisma from "@/lib/prisma";
import { LinkGrid } from "@/components/LinkGrid";
import { Navbar } from "@/components/Navbar";
import { About } from "@/components/About";
import { Hero } from "@/components/Hero";
import { GlobalSpotlight } from "@/components/GlobalSpotlight";
import { ParticleWave } from "@/components/ParticleWave";
import { StarFieldTransition } from "@/components/StarFieldTransition";
import { AnimatedSectionHeader } from "@/components/AnimatedSectionHeader";
import { LogoCarousel } from "@/components/LogoCarousel";

import { CategoryNav } from "@/components/CategoryNav";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const [categories, galleryImages, aboutContent, siteConfigs, heroSlides] = await Promise.all([
    prisma.category.findMany({ include: { links: true } }),
    prisma.galleryImage.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.aboutContent.findFirst(),
    prisma.siteConfig.findMany(),
    prisma.heroSlide.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
  ]);

  const configMap = Object.fromEntries(siteConfigs.map(c => [c.key, c.value]));

  return (
    <main className="min-h-screen bg-[#020617] transition-colors duration-300 relative">
      <GlobalSpotlight />
      <Navbar categories={categories} />
      
      {/* Hero section should be full width and handled separately from the main container */}
      <Hero 
        title={configMap.hero_title || "灵感与设计的边界"} 
        subtitle={configMap.hero_subtitle || "一个精心策划的数字档案馆，收集最纯粹的设计工具与艺术灵感。"} 
        categories={categories}
      />

      {/* Visual Transition Zone - Overlapping with Hero */}
      <div className="relative w-full h-[300px] -mt-[150px] z-10 pointer-events-none">
        <StarFieldTransition />
        <div className="absolute inset-0 flex items-center justify-center opacity-50">
          <ParticleWave />
        </div>
        {/* Gradient Mask for Seamless Blend */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/80 to-[#020617]" />
      </div>

      <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 pb-20 relative z-10 -mt-20">
        
        <div id="directory" className="space-y-32">
          {categories.map((category, idx) => (
            <div key={category.id} id={`category-${category.id}`} className="relative group scroll-mt-32">
              {/* Special Carousel for AI Section */}
              {(category.name.includes("AI") || category.name.includes("智能")) && (
                 <div className="mb-16 -mt-8">
                   <LogoCarousel links={category.links} />
                 </div>
              )}

              {/* Sticky Category Navigation - Placed inside content flow, specifically after AI Carousel if present */}
              {idx === 0 && (
                 <div className="mb-12 sticky top-4 z-40 flex justify-center pointer-events-none">
                    <div className="pointer-events-auto">
                       <CategoryNav categories={categories} />
                    </div>
                 </div>
              )}

              {/* Vertical Archive Line */}
              <div className="absolute -left-12 top-0 bottom-0 w-[1px] bg-gradient-to-b from-indigo-500/20 via-transparent to-transparent hidden xl:block transition-all duration-1000 group-hover:from-indigo-500/50" />
              
              <AnimatedSectionHeader 
                index={idx} 
                title={category.name} 
                count={category.links?.length || 0} 
              />
              
              <LinkGrid links={category.links} />
            </div>
          ))}
        </div>

        {aboutContent && (
          <div id="about" className="mt-32 pt-16 border-t border-gray-500/10">
            <About content={aboutContent} slides={heroSlides} />
          </div>
        )}
      </div>
      
      <footer className="relative border-t border-white/5 bg-[#020617] text-gray-500 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#6366f1_1px,transparent_1px),linear-gradient(to_bottom,#6366f1_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12 xl:px-24 py-12 relative z-10 flex flex-nowrap items-center justify-between gap-8 xl:gap-20 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-6 shrink-0 whitespace-nowrap">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
              <span className="text-xs font-mono tracking-widest text-emerald-500/80 uppercase">Online</span>
            </div>
            <div className="h-4 w-[1px] bg-white/10" />
            <p className="text-sm text-gray-400 font-light hidden md:block max-w-md truncate">
              {configMap.footer_copyright || "© 2026 艺术导航"}
            </p>
          </div>

          <div className="flex items-center gap-8 xl:gap-16 shrink-0 text-xs font-mono text-gray-400 whitespace-nowrap">
             {/* Contact Group */}
             <div className="flex items-center gap-6">
                <span className="text-[10px] uppercase tracking-widest text-indigo-500/40 font-bold hidden md:block">Contact</span>
                <a href={`mailto:${configMap.contact_email}`} className="hover:text-indigo-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-gray-600 rounded-full" />
                  {configMap.contact_email || "hello@artistic-nav.com"}
                </a>
                <span className="flex items-center gap-2">
                   <span className="w-1 h-1 bg-gray-600 rounded-full" />
                   Beijing, CN
                </span>
             </div>

             <div className="h-4 w-[1px] bg-white/10" />

             {/* Social Group */}
             <div className="flex items-center gap-6">
                <span className="text-[10px] uppercase tracking-widest text-indigo-500/40 font-bold hidden md:block">Social</span>
                <a href="#" className="hover:text-indigo-400 transition-colors">Twitter</a>
                <a href="#" className="hover:text-indigo-400 transition-colors">Instagram</a>
             </div>
          </div>
        </div>
        
        {/* Artistic Footer Gradient Line */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50" />
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent blur-sm -mt-1" />
      </footer>
    </main>
  );
}
