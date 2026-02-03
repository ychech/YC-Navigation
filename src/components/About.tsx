"use client";

import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import type { AboutContent, HeroSlide } from "@prisma/client";
import { Cpu, Globe, ChevronLeft, ChevronRight, Terminal as TerminalIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { DigitalRain } from "./DigitalRain";

interface AboutProps {
  content: AboutContent;
  slides?: HeroSlide[];
}

const ScrambleText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = "!<>-_\\/[]{}—=+*^?#________";
  
  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(_prev => 
        text.split("")
          .map((_char, index) => {
            if (index < iteration) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );
      
      if (iteration >= text.length) clearInterval(interval);
      iteration += 1/3;
    }, 30);
    
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayText}</span>;
};

export const About = ({ content, slides = [] }: AboutProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  const [currentSlide, setCurrentSlide] = useState(0);

  // Drag Gesture Logic
  const x = useMotionValue(0);
  const dragConstraints = { left: 0, right: 0 };

  const handleDragEnd = (event: any, info: any) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset < -100 || velocity < -500) {
      nextSlide();
    } else if (offset > 100 || velocity > 500) {
      prevSlide();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % (slides.length || 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + (slides.length || 1)) % (slides.length || 1));
  };

  // Fallback data if no slides
  const displaySlides = slides.length > 0 ? slides : [{
    id: 0,
    title: "FUTURE & ART",
    subtitle: "「我们将代码视为新的画笔，将数据视为流动的颜料。在这里，艺术不再是静止的陈列，而是每一次点击、每一次滚动的实时交互。」",
    codeSnippet: null,
    isActive: true,
    sortOrder: 0
  }];

  const activeSlide = displaySlides[currentSlide];

  return (
    <div 
      className="relative py-32 overflow-hidden bg-[#080808] dark:bg-[#080808] bg-white dark:text-white text-black border-t border-gray-200 dark:border-white/5 transition-colors duration-300"
      onMouseMove={handleMouseMove}
    >
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white via-white/50 to-transparent dark:from-[#020617] dark:via-[#020617]/50 pointer-events-none z-20" />
      <DigitalRain />

      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-indigo-500/50 animate-[scan_8s_linear_infinite]" />
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#6366f1_1px,transparent_1px),linear-gradient(to_bottom,#6366f1_1px,transparent_1px)] bg-[size:60px_60px] dark:opacity-[0.05] opacity-10" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(99,102,241,0.15),transparent_40%)]" 
             style={{ 
               "--mouse-x": `${springX.get() + 500}px`, 
               "--mouse-y": `${springY.get() + 500}px` 
             } as any} 
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col items-center justify-center text-center max-w-5xl mx-auto space-y-20 min-h-[600px]">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              drag="x"
              dragConstraints={dragConstraints}
              onDragEnd={handleDragEnd}
              style={{ x, transformStyle: "preserve-3d", cursor: "grab" }}
              whileTap={{ cursor: "grabbing" }}
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -90 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="space-y-12 relative w-full perspective-1000 select-none"
            >
               <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[1px] h-20 bg-gradient-to-b from-transparent to-indigo-500/50" />
               <div className="flex items-center justify-center gap-6">
                  <Globe size={14} className="text-indigo-500 animate-spin-slow opacity-60" />
                  <p className="text-[10px] uppercase tracking-[0.5em] text-indigo-500 font-black">Archive.OS // SLIDE_{currentSlide + 1}</p>
                  <Cpu size={14} className="text-indigo-500 animate-pulse opacity-60" />
               </div>
               
               <h2 className="archive-title text-6xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-b from-black via-black to-black/10 dark:from-white dark:via-white dark:to-white/10 leading-[0.85] tracking-tighter mix-blend-overlay dark:mix-blend-overlay mix-blend-normal relative z-10">
                  <ScrambleText text={activeSlide.title} />
               </h2>

               <div className="text-gray-500 dark:text-gray-400 text-lg md:text-2xl leading-relaxed font-light max-w-3xl mx-auto space-y-8 relative z-10">
                  <p className="drop-shadow-lg whitespace-pre-wrap">
                    {activeSlide.subtitle}
                  </p>
               </div>

               {activeSlide.codeSnippet ? (
                 <div className="pt-12 flex justify-center w-full">
                   <div className="relative group w-full max-w-lg mx-auto text-left">
                     <div className="absolute inset-0 bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500 rounded-3xl" />
                     <div className="relative rounded-2xl bg-white dark:bg-black/80 border border-gray-200 dark:border-indigo-500/30 backdrop-blur-xl overflow-hidden shadow-2xl dark:shadow-none">
                       <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                         <div className="flex gap-1.5">
                           <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                           <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                           <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                         </div>
                         <div className="ml-2 text-[10px] text-gray-400 dark:text-gray-500 font-mono flex items-center gap-1">
                           <TerminalIcon size={10} />
                           <span>protocol.ts</span>
                         </div>
                       </div>
                       <div className="p-6 overflow-x-auto">
                         <pre className="text-xs md:text-sm font-mono text-slate-700 dark:text-indigo-300 leading-relaxed">
                           <code>{activeSlide.codeSnippet}</code>
                         </pre>
                       </div>
                     </div>
                   </div>
                 </div>
               ) : (
                 <div className="pt-12 flex justify-center">
                    <div className="relative group cursor-pointer">
                       <div className="absolute inset-0 bg-indigo-500/20 blur-xl group-hover:bg-indigo-500/40 transition-all duration-500 rounded-full" />
                       <div className="relative px-10 py-5 rounded-full bg-black/40 border border-indigo-500/30 backdrop-blur-xl flex items-center gap-4 hover:scale-105 transition-transform duration-300">
                          <div className="flex gap-1">
                             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-xs font-mono text-indigo-300 tracking-widest uppercase">Initializing Art Sequence...</span>
                       </div>
                    </div>
                 </div>
               )}
            </motion.div>
          </AnimatePresence>

          {/* Drag Hint & Navigation Controls */}
          {displaySlides.length > 1 && (
            <div className="flex flex-col items-center gap-4 pt-12 relative z-20">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-indigo-500/40 font-bold animate-pulse">
                <ChevronLeft size={12} />
                <span>Drag to Navigate</span>
                <ChevronRight size={12} />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
