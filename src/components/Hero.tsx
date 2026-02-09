"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import WorldGlobe from "./WorldGlobe";
import { Search, Command } from "lucide-react";
import { SearchModal } from "./SearchModal";

import { Category, Link } from "@prisma/client";

interface HeroProps {
  title: string;
  subtitle: string;
  categories?: (Category & { links: Link[] })[];
  systemCode?: string;
}

export const Hero = ({ title, subtitle, categories = [], systemCode = "Archive.OS" }: HeroProps) => {
  const containerRef = useRef(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const y = useTransform(scrollY, [0, 400], [0, 50]);

  return (
    <>
      <section ref={containerRef} className="relative h-auto min-h-[50vh] py-20 w-full flex flex-col justify-center items-center overflow-hidden bg-gray-50 dark:bg-[#020617] transition-colors duration-500">
        
        {/* 简化的背景网格 */}
        <div 
          className="absolute inset-0 z-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(99,102,241,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        {/* HUD 装饰 */}
        <div className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-8 z-10 pointer-events-none opacity-30">
           <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2 text-[10px] text-[#6366f1] font-mono tracking-widest">
               <div className="w-1.5 h-1.5 bg-[#6366f1]" /> SYSTEM
             </div>
             <div className="text-[9px] text-gray-500 font-mono">
               CORE: ONLINE<br/>NET: CONNECTED
             </div>
           </div>
        </div>

        <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-end gap-8 z-10 pointer-events-none opacity-30">
           <div className="text-[9px] text-gray-500 font-mono text-right">
             COORDINATES<br/>LAT: 39.90° N
           </div>
        </div>
        
        {/* 3D 地球 */}
        <div className="absolute inset-0 z-0">
          <motion.div style={{ opacity }} className="w-full h-full">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_60%)] dark:bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_60%)]" />
            <WorldGlobe />
          </motion.div>
        </div>

        {/* 内容 */}
        <motion.div 
          style={{ y, opacity }}
          className="relative z-20 w-full max-w-[1920px] mx-auto px-6 md:px-12 flex flex-col items-center text-center space-y-6 pt-[25vh] pb-16"
        >
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-center gap-4 text-indigo-500 font-black text-[10px] tracking-[0.8em] uppercase"
            >
              <span className="text-indigo-500 font-mono">&gt;_</span>
              <span>{systemCode} // Core</span>
            </motion.div>
            
            <h1 className="text-3xl md:text-5xl text-gray-900 dark:text-white leading-tight tracking-tighter relative z-10 font-mono transition-colors duration-500">
              {title}
            </h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="text-gray-600 dark:text-gray-400 text-sm md:text-base max-w-2xl mx-auto px-12 transition-colors duration-500">
            >
              {subtitle}
            </motion.p>

            {/* 搜索按钮 */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              onClick={() => setIsSearchOpen(true)}
              className="group relative flex items-center gap-4 px-6 py-3 rounded-full bg-white border border-gray-200 hover:bg-gray-50 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 transition-all w-full max-w-md mx-auto"
            >
              <Search size={16} className="text-gray-500" />
              <span className="text-sm text-gray-400">Type to search...</span>
              <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded bg-black/20 text-[10px] text-gray-400 font-mono">
                <Command size={10} /> K
              </div>
            </motion.button>
          </div>
        </motion.div>
      </section>

      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        categories={categories}
      />
    </>
  );
};
