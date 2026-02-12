"use client";

import { useState } from "react";
import { SidebarNav } from "./SidebarNav";
import { CategoryNav } from "./CategoryNav";
import { LinkGrid } from "./LinkGrid";
import { LogoCarousel } from "./LogoCarousel";
import { AnimatedSectionHeader } from "./AnimatedSectionHeader";
import { About } from "./About";
import type { Category, Link, AboutContent, HeroSlide } from "@prisma/client";

interface MainContentProps {
  categories: (Category & { links: Link[] })[];
  aboutContent: AboutContent | null;
  heroSlides: HeroSlide[];
  featuredLinks: Link[];
  configMap: Record<string, string>;
}

export function MainContent({ categories, aboutContent, heroSlides, featuredLinks, configMap }: MainContentProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <>
      {/* Left Sidebar Navigation */}
      <SidebarNav 
        categories={categories} 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      {/* Main Content - 动态左边距 */}
      <div 
        className={`w-full mx-auto px-4 md:px-6 lg:px-8 xl:px-12 pb-20 relative z-10 -mt-20 transition-all duration-300 ${
          isSidebarCollapsed 
            ? 'max-w-[1920px] xl:pl-24' 
            : 'max-w-[1800px] xl:pl-56'
        }`}
      >
        
        {/* Sticky Top Category Nav - Mobile & Tablet */}
        <div className="xl:hidden mb-8 sticky top-20 z-30">
          <div className="flex justify-center">
            <CategoryNav categories={categories} />
          </div>
        </div>

        {/* Directory Section */}
        <div id="directory" className="space-y-24">
          {categories.map((category, idx) => (
            <div key={category.id} id={`category-${category.id}`} className="relative group scroll-mt-32">
              {/* Logo Carousel - 第一个分类 */}
              {idx === 0 && category.links && category.links.length > 0 && (
                 <div className="mb-8">
                   <LogoCarousel links={category.links.slice(0, 8)} />
                 </div>
              )}

              {/* Section Header with Decorative Line */}
              <div className="relative mb-8">
                {/* Desktop: Left Line - 根据侧边栏状态调整位置 */}
                <div className={`hidden xl:block absolute top-1/2 -translate-y-1/2 w-8 h-[1px] bg-gradient-to-r from-indigo-500/50 to-transparent transition-all duration-300 ${
                  isSidebarCollapsed ? '-left-8' : '-left-12'
                }`} />
                
                <AnimatedSectionHeader 
                  index={idx} 
                  title={category.name} 
                  count={category.links?.length || 0} 
                />
              </div>
              
              <LinkGrid 
                links={category.links} 
                categoryIndex={idx} 
                featuredLinks={featuredLinks}
              />
            </div>
          ))}
        </div>

        {/* About Section - 自然过渡 */}
        {aboutContent && (
          <div id="about" className="mt-8">
            <About content={aboutContent} slides={heroSlides} categories={categories} />
          </div>
        )}
      </div>
      
      {/* Footer - 动态左边距 */}
      <footer className="relative border-t border-gray-200 dark:border-white/5 bg-white dark:bg-[#020617] text-gray-600 dark:text-gray-500 overflow-hidden transition-colors duration-300">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#6366f1_1px,transparent_1px),linear-gradient(to_bottom,#6366f1_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className={`w-full mx-auto px-4 md:px-6 lg:px-8 xl:px-12 py-12 relative z-10 transition-all duration-300 ${
          isSidebarCollapsed 
            ? 'max-w-[1920px] xl:pl-24' 
            : 'max-w-[1800px] xl:pl-56'
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                <span className="text-xs font-mono tracking-widest text-emerald-500/80 uppercase">Online</span>
              </div>
              <div className="h-4 w-[1px] bg-white/10" />
              <p className="text-sm text-gray-400 font-light">
                {configMap.footer_copyright || "© 2026 艺术导航"}
              </p>
            </div>

            {/* Right */}
            <div className="flex items-center gap-8 text-xs font-mono text-gray-500">
              <div className="flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-widest text-indigo-500/40 font-bold">Contact</span>
                <a href={`mailto:${configMap.contact_email}`} className="hover:text-indigo-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-gray-600 rounded-full" />
                  {configMap.contact_email || "hello@artistic-nav.com"}
                </a>
              </div>

              <div className="h-4 w-[1px] bg-white/10" />

              <div className="flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-widest text-indigo-500/40 font-bold">Social</span>
                <div className="flex gap-4">
                  <a href="#" className="hover:text-indigo-400 transition-colors">Twitter</a>
                  <a href="#" className="hover:text-indigo-400 transition-colors">Instagram</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Gradient Line */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50" />
      </footer>
    </>
  );
}
