"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { AboutContent } from "@prisma/client";
import { Box, CheckCircle2, Terminal as TerminalIcon, Activity, ArrowRight, ShieldCheck, Database, Server, Cpu, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { DigitalRain } from "./DigitalRain";

interface AboutProps {
  content: AboutContent;
}

// JSDoc: Helper component for scrambling text effect
/**
 * ScrambleText Component
 * Renders text with a "hacker-style" scrambling animation on mount.
 */
const ScrambleText = ({ text }: { text: string; delay?: number }) => {
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

// JSDoc: Helper for terminal typewriter effect
/**
 * TypewriterLog Component
 * Simulates typing effect for terminal logs.
 */
const TypewriterLog = ({ text }: { text: string; delay?: number }) => {
  const [displayText, setDisplayText] = useState("");
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayText}</span>;
};

// ... existing helpers ...

export const About = ({ content }: AboutProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const [logs, setLogs] = useState<string[]>([
    "[SEC] 正在初始化档案协议...",
    "[SYS] 正在加载清单 v2.0.4...",
    "[NET] 加密通道已建立。"
  ]);

  useEffect(() => {
    const logPool = [
      "[INFO] 元数据同步完成。",
      "[WARN] 检测到未知碎片。",
      "[SEC] 防火墙绕过尝试已拦截。",
      "[SYS] 正在优化神经缓存...",
      "[DATA] 快照完整性: 100%",
      "[NET] 延迟: 14ms (Tokyo-HK)"
    ];

    const interval = setInterval(() => {
      setLogs(prev => [...prev.slice(-4), logPool[Math.floor(Math.random() * logPool.length)]]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="relative py-32 overflow-hidden bg-[#080808] border-t border-white/5"
      onMouseMove={handleMouseMove}
    >
      {/* Interactive Digital Rain Background - Future Art Vibe */}
      <DigitalRain />

      {/* Sci-fi Scanning Background - Blue Theme */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-indigo-500/50 animate-[scan_8s_linear_infinite]" />
        {/* Dynamic Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#6366f1_1px,transparent_1px),linear-gradient(to_bottom,#6366f1_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(99,102,241,0.15),transparent_40%)]" 
             style={{ 
               "--mouse-x": `${springX.get() + 500}px`, 
               "--mouse-y": `${springY.get() + 500}px` 
             } as any} 
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Main Content Layout - Centered Future Art View */}
        <div className="flex flex-col items-center justify-center text-center max-w-5xl mx-auto space-y-20">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="space-y-12 relative"
          >
             {/* Decorative HUD Elements */}
             <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[1px] h-20 bg-gradient-to-b from-transparent to-indigo-500/50" />
             <div className="flex items-center justify-center gap-6">
                <Globe size={14} className="text-indigo-500 animate-spin-slow opacity-60" />
                <p className="text-[10px] uppercase tracking-[0.5em] text-indigo-500 font-black">Archive.OS // FUTURE_ART_PROTOCOL</p>
                <Cpu size={14} className="text-indigo-500 animate-pulse opacity-60" />
             </div>
             
             <h2 className="archive-title text-6xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/10 leading-[0.85] tracking-tighter mix-blend-overlay relative z-10">
                <ScrambleText text="FUTURE & ART" />
             </h2>

             <div className="text-gray-400 text-lg md:text-2xl leading-relaxed font-light max-w-3xl mx-auto space-y-8 relative z-10">
                <p className="drop-shadow-lg">
                  「我们将<span className="text-indigo-400 font-medium">代码</span>视为新的画笔，将<span className="text-indigo-400 font-medium">数据</span>视为流动的颜料。在这里，艺术不再是静止的陈列，而是每一次点击、每一次滚动的实时交互。」
                </p>
             </div>

             {/* Interactive Code Fragment */}
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
          </motion.div>

        </div>
      </div>
    </div>
  );
};
