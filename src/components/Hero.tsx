"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import WorldGlobe from "./WorldGlobe";
import { Shield, Search, Command } from "lucide-react";
import { SearchModal } from "./SearchModal";

import { Category, Link } from "@prisma/client";

interface HeroProps {
  title: string;
  subtitle: string;
  categories?: (Category & { links: Link[] })[];
}

export const Hero = ({ title, subtitle, categories = [] }: HeroProps) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Parallax and fade effects based on scroll
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  // More aggressive opacity fade out to ensure clean transition
  const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  
  // New Exit Animations: Blur and Scale
  const blur = useTransform(scrollYProgress, [0, 0.3], ["0px", "10px"]);
  const scale = useTransform(scrollYProgress, [0, 0.4], [1, 0.9]);
  
  // Content moves up slightly as you scroll
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  // Split title into words and characters for complex animation
  const rawTitle = title || "灵感与设计的边界";
  const words = rawTitle.split(" ");

  // JSDoc: Helper for typewriter effect
  const [displayedSubtitle, setDisplayedSubtitle] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    let i = 0;
    // Delay subtitle start until title is mostly done
    const startDelay = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayedSubtitle(subtitle.slice(0, i));
        i++;
        if (i > subtitle.length) clearInterval(interval);
      }, 30);
      return () => clearInterval(interval);
    }, 1500);
    return () => clearTimeout(startDelay);
  }, [subtitle]);

  return (
    <>
      <section ref={containerRef} className="relative h-auto min-h-[50vh] py-20 w-full flex flex-col justify-center items-center overflow-hidden bg-[#020617]">
        {/* Hacker Matrix Background Effect */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ 
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(32, 255, 77, .1) 25%, rgba(32, 255, 77, .1) 26%, transparent 27%, transparent 74%, rgba(32, 255, 77, .1) 75%, rgba(32, 255, 77, .1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(32, 255, 77, .1) 25%, rgba(32, 255, 77, .1) 26%, transparent 27%, transparent 74%, rgba(32, 255, 77, .1) 75%, rgba(32, 255, 77, .1) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px'
        }}/>

        {/* Left Side HUD Data */}
        <div className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-8 z-20 pointer-events-none opacity-40 mix-blend-screen">
           <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2 text-[10px] text-[#6366f1] font-mono tracking-widest">
               <div className="w-1.5 h-1.5 bg-[#6366f1] animate-pulse" /> SYSTEM STATUS
             </div>
             <div className="w-32 h-[1px] bg-gradient-to-r from-[#6366f1] to-transparent" />
             <div className="text-[9px] text-gray-400 font-mono leading-relaxed">
               &gt; CORE: ONLINE<br/>
               &gt; NET: CONNECTED<br/>
               &gt; SEC: ENCRYPTED
             </div>
           </div>
           
           <div className="flex flex-col gap-2">
              <div className="text-[40px] font-black text-[#6366f1]/20 leading-none tracking-tighter">01</div>
              <div className="w-1 h-12 bg-gradient-to-b from-[#6366f1]/50 to-transparent" />
           </div>
        </div>

        {/* Right Side HUD Data */}
        <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-end gap-8 z-20 pointer-events-none opacity-40 mix-blend-screen">
           <div className="flex flex-col items-end gap-2 text-right">
             <div className="flex items-center gap-2 text-[10px] text-[#6366f1] font-mono tracking-widest">
               COORDINATES <div className="w-1.5 h-1.5 bg-[#6366f1] animate-pulse" />
             </div>
             <div className="w-32 h-[1px] bg-gradient-to-l from-[#6366f1] to-transparent" />
             <div className="text-[9px] text-gray-400 font-mono leading-relaxed">
               LAT: 39.9042° N<br/>
               LNG: 116.4074° E<br/>
               ALT: 20,000 KM
             </div>
           </div>
           
           <div className="flex flex-col items-end gap-2">
              <div className="text-[40px] font-black text-[#6366f1]/20 leading-none tracking-tighter">02</div>
              <div className="w-1 h-12 bg-gradient-to-b from-[#6366f1]/50 to-transparent" />
           </div>
        </div>
        
        {/* Background 3D Layer */}
        <div className="absolute inset-0 z-0">
          <motion.div style={{ y, opacity, scale, filter: `blur(${blur})` }} className="w-full h-full">
            {/* Subtle Background Glow - Enhanced for depth */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1),transparent_60%)]" />
            <WorldGlobe />
          </motion.div>
        </div>

        {/* Content Overlay */}
        <motion.div 
          style={{ y: contentY, opacity, filter: `blur(${blur})` }}
          className="relative z-20 w-full max-w-[1920px] mx-auto px-6 md:px-12 flex flex-col items-center text-center space-y-6 pt-[25vh] pb-16"
        >
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-center gap-4 text-indigo-500 font-black text-[10px] tracking-[0.8em] uppercase"
            >
              <span className="text-indigo-500 font-mono animate-pulse mr-2">&gt;_</span>
              <span>Archive.OS // Core</span>
              <span className="w-2 h-4 bg-indigo-500 animate-pulse ml-2" />
            </motion.div>
            
            <h1 className="archive-title text-3xl md:text-5xl text-white leading-tight tracking-tighter relative group mix-blend-overlay whitespace-nowrap z-10 font-mono">
              {/* Glitch Shadow Effect - Enhanced */}
              <span className="absolute inset-0 text-green-500/30 -translate-x-1 translate-y-1 blur-[1px] pointer-events-none select-none opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                 {rawTitle}
              </span>
              <span className="absolute inset-0 text-indigo-500/30 translate-x-1 -translate-y-1 blur-[1px] pointer-events-none select-none opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                 {rawTitle}
              </span>
              
              {words.map((word, wordIdx) => (
                <span key={wordIdx} className="inline-block mx-[0.15em] overflow-hidden py-[0.1em]">
                  {word.split("").map((char, charIdx) => (
                    <motion.span
                      key={charIdx}
                      initial={{ y: "120%" }}
                      animate={{ y: 0 }}
                      whileHover={{ 
                        y: -15, 
                        scale: 1.1,
                        color: "#818cf8",
                        textShadow: "0 0 50px rgba(99,102,241,0.8)",
                        transition: { duration: 0.1, type: "spring", stiffness: 300 } 
                      }}
                      transition={{ 
                        duration: 1.2, 
                        ease: [0.16, 1, 0.3, 1], 
                        delay: 0.1 + (wordIdx * 5 + charIdx) * 0.04 
                      }}
                      className="inline-block origin-bottom transition-all duration-300 cursor-default pointer-events-auto"
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>
              ))}
            </h1>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, delay: 0.8 }}
              className="space-y-8 min-h-[40px]"
            >
              <p className="text-indigo-200/60 text-sm md:text-base font-light tracking-wide max-w-2xl mx-auto leading-relaxed px-12">
                {displayedSubtitle}
                <span className="animate-pulse text-indigo-400">_</span>
              </p>
            </motion.div>

            {/* Quick Search Trigger */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="pt-4"
            >
              <button
                onClick={() => setIsSearchOpen(true)}
                className="group relative flex items-center gap-4 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/30 transition-all duration-300 backdrop-blur-md w-full max-w-md mx-auto"
              >
                <Search size={16} className="text-gray-500 group-hover:text-indigo-400 transition-colors" />
                <span className="text-sm text-gray-500 font-light group-hover:text-gray-300 transition-colors">Type to search...</span>
                <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded bg-black/20 border border-white/5 text-[10px] text-gray-600 font-mono">
                  <Command size={10} /> K
                </div>
                
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-full bg-indigo-500/5 opacity-0 group-hover:opacity-100 blur-md transition-opacity" />
              </button>
            </motion.div>
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
