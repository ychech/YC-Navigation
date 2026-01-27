"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, lazy, Suspense, useState, useEffect } from "react";
import { Loader2, Zap, Activity, Shield } from "lucide-react";

// Lazy load the 3D component with JSDoc
/**
 * Lazy loaded WorldGlobe component to improve initial render performance
 */
const WorldGlobe = lazy(() => import("./WorldGlobe"));

interface HeroProps {
  /** Main title text displayed in large typography */
  title: string;
  /** Subtitle text displayed below the title */
  subtitle: string;
}

/**
 * Hero Section Component
 * 
 * Displays a 3D Earth background with overlaid artistic typography.
 * Implements smooth scroll transitions where the earth fades out as the user scrolls down.
 */
export const Hero = ({ title: rawTitle, subtitle }: HeroProps) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const [time, setTime] = useState("");
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
  const words = rawTitle.split(" ");

  // JSDoc: Helper for typewriter effect
  const [displayedSubtitle, setDisplayedSubtitle] = useState("");
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
    <section ref={containerRef} className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-[#020617]">
      {/* Background 3D Layer - Fixed position to allow content to scroll over it if needed, 
          but here we use sticky-like behavior via framer-motion */}
      <div className="absolute inset-0 z-0">
        <motion.div style={{ y, opacity, scale, filter: `blur(${blur})` }} className="w-full h-full">
          {/* Subtle Background Glow - Enhanced for depth */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1),transparent_60%)]" />
          
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center opacity-20">
              <Loader2 className="animate-spin w-10 h-10 text-indigo-500" />
            </div>
          }>
            <WorldGlobe />
          </Suspense>
        </motion.div>
      </div>

      {/* Gradient Mask for Smooth Transition to Content */}
      <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-[#020617] via-[#020617]/90 to-transparent z-10 pointer-events-none" />

      {/* Content Overlay */}
      <motion.div 
        style={{ y: contentY, opacity, filter: `blur(${blur})` }}
        className="relative z-20 w-full max-w-[1920px] mx-auto px-6 md:px-12 flex flex-col items-center text-center space-y-12 pt-[60vh] pb-32"
      >
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center gap-4 text-indigo-500 font-black text-[10px] tracking-[0.8em] uppercase"
          >
            <div className="w-8 h-[1px] bg-indigo-500/30" />
            <Shield size={12} className="text-indigo-400" />
            <span>Archive.OS // Core</span>
            <div className="w-8 h-[1px] bg-indigo-500/30" />
          </motion.div>
          
          <h1 className="archive-title text-5xl md:text-7xl text-white leading-tight tracking-tighter relative group mix-blend-overlay whitespace-nowrap z-10">
            {/* Glitch Shadow Effect - Enhanced */}
            <span className="absolute inset-0 text-indigo-500/30 -translate-x-2 -translate-y-1 blur-[10px] pointer-events-none select-none group-hover:animate-pulse">
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
            className="space-y-8 min-h-[60px]"
          >
            <p className="text-indigo-200/60 text-sm md:text-lg font-light tracking-wide max-w-2xl mx-auto leading-relaxed border-x border-indigo-500/10 px-12">
              {displayedSubtitle}
              <span className="animate-pulse text-indigo-400">_</span>
            </p>
            <div className="w-[1px] h-12 bg-gradient-to-b from-indigo-500/50 to-transparent mx-auto" />
          </motion.div>
        </div>

        {/* HUD Elements - Integrated Data Layer */}
        <div className="absolute inset-0 pointer-events-none z-20">
           {/* Left HUD */}
           <div className="absolute left-10 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-12">
              <div className="flex flex-col gap-2">
                 <div className="flex items-center gap-2 text-indigo-500/40 font-mono text-[8px] tracking-widest">
                    <Activity size={10} />
                    <span>SYSTEM_SYNC</span>
                 </div>
                 <div className="w-1 h-32 bg-gradient-to-b from-indigo-500/40 via-indigo-500/10 to-transparent rounded-full" />
              </div>
              <div className="space-y-1">
                 {[...Array(4)].map((_, i) => (
                   <div key={i} className="w-4 h-[1px] bg-indigo-500/20" />
                 ))}
              </div>
           </div>

           {/* Right HUD */}
           <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-end gap-12">
              <div className="text-right space-y-3">
                 <p className="text-indigo-500/40 font-mono text-[8px] tracking-[0.4em] uppercase">Time_Node</p>
                 <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-indigo-400 font-bold">{time}</span>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                 </div>
              </div>
              <div className="flex gap-1">
                 {[...Array(5)].map((_, i) => (
                   <motion.div 
                     key={i}
                     animate={{ height: [4, 12, 4] }}
                     transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                     className="w-1 bg-indigo-500/30 rounded-full"
                   />
                 ))}
              </div>
              <Zap size={14} className="text-indigo-500/40" />
           </div>

           {/* Bottom Corner Coordinates */}
           <div className="absolute bottom-10 left-10 flex flex-col gap-1 text-indigo-500/30 font-mono text-[7px] tracking-widest uppercase">
              <p>Lat: 35.6895° N</p>
              <p>Lng: 139.6917° E</p>
           </div>
        </div>
      </motion.div>

      {/* Background Subtle Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#6366f1_1px,transparent_1px),linear-gradient(to_bottom,#6366f1_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>
    </section>
  );
};
