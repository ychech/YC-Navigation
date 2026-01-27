"use client";

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Activity } from "lucide-react";
import type { Link } from "@prisma/client";
import React, { useState } from "react";

interface LinkGridProps {
  links: Link[];
}

const TiltCard = ({ link, index, isActive, onActivate }: { link: Link; index: number; isActive: boolean; onActivate: () => void }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);
  
  // Dynamic glow position
  const glowX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glowY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  const getFaviconUrl = (url: string) => {
    try {
      if (url.startsWith('#') || !url.includes('.')) return '';
      const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
    } catch (e) {
      return '';
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`访问 ${link.title}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
      }}
      onClick={onActivate}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1],
        delay: index * 0.05 
      }}
      className={`group relative p-8 bg-[#0a0a0a]/80 backdrop-blur-2xl border overflow-hidden block transition-all duration-700 hover:scale-[1.01] perspective-1000 min-h-[220px] rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4),0_0_20px_rgba(99,102,241,0.08)] active:scale-[0.99] ${
        isActive 
          ? "border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.15)]" 
          : "border-white/5 hover:border-white/10"
      }`}
    >
      {/* Tech Corner Accents */}
      <div className={`absolute top-4 left-4 w-2 h-2 border-t border-l transition-colors duration-500 ${isActive ? "border-indigo-500" : "border-indigo-500/10"}`} />
      <div className={`absolute top-4 right-4 w-2 h-2 border-t border-r transition-colors duration-500 ${isActive ? "border-indigo-500" : "border-indigo-500/10"}`} />
      <div className={`absolute bottom-4 left-4 w-2 h-2 border-b border-l transition-colors duration-500 ${isActive ? "border-indigo-500" : "border-indigo-500/10"}`} />
      <div className={`absolute bottom-4 right-4 w-2 h-2 border-b border-r transition-colors duration-500 ${isActive ? "border-indigo-500" : "border-indigo-500/10"}`} />

      {/* Ink Bleed Effect on Hover - REMOVED per user request for simpler lighting */}
      
      {/* Subtle Border Glow */}
      <div className={`absolute inset-0 rounded-[24px] border transition-colors duration-500 ${isActive ? "border-indigo-500/30" : "border-white/5"}`} />

      {/* Holographic Scanline */}
      <motion.div 
        animate={{ y: ["-100%", "200%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-12 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent pointer-events-none"
      />

      {/* Snapshot Preview Overaly (On Hover) */}
      <AnimatePresence>
        {isHovered && link.snapshotUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0 pointer-events-none"
          >
            <img 
              src={link.snapshotUrl} 
              alt={`${link.title} 预览`} 
              className="w-full h-full object-cover grayscale transition-all duration-1000" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
      
      <div style={{ transform: "translateZ(20px)" }} className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center bg-white/5 border shadow-lg transition-all duration-500 overflow-hidden relative ${isActive ? "border-indigo-500/30" : "border-white/10"}`}>
              {link.icon ? (
                <img src={link.icon} alt="" className="w-6 h-6 object-contain relative z-10" />
              ) : getFaviconUrl(link.url) ? (
                <img src={getFaviconUrl(link.url)} alt="" className="w-6 h-6 object-contain relative z-10" />
              ) : (
                <div className="w-6 h-6 bg-indigo-500/10 rounded-md flex items-center justify-center relative z-10">
                  <span className="text-xs font-medium text-indigo-500">{link.title[0]}</span>
                </div>
              )}
              {/* Inner Icon Glow */}
              <div className={`absolute inset-0 bg-indigo-500/5 transition-opacity ${isActive ? "opacity-100" : "opacity-0"}`} />
            </div>
            <div>
              <h3 className={`text-base font-bold tracking-tight transition-colors duration-500 ${isActive ? "text-indigo-400" : "text-white"}`}>
                {link.title}
              </h3>
              <p className="text-[9px] text-gray-500 mt-0.5 font-mono tracking-widest uppercase opacity-60">
                {new URL(link.url.startsWith('http') ? link.url : `https://${link.url}`).hostname}
              </p>
            </div>
          </div>
          <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-all duration-500 border ${isActive ? "text-indigo-400 bg-indigo-500/5 border-indigo-500/20" : "text-gray-500 border-transparent"}`}>
            <ArrowUpRight size={14} strokeWidth={1.5} />
          </div>
        </div>
        
        <p className={`text-xs font-normal line-clamp-2 leading-relaxed transition-colors duration-500 mb-6 pl-3 border-l ${isActive ? "text-gray-300 border-indigo-500/20" : "text-gray-400 border-transparent"}`}>
          {link.description || "探索艺术与设计的数字边界。"}
        </p>

        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex-1 mr-4">
            <div className="flex items-center justify-between mb-1.5">
               <span className={`text-[8px] uppercase tracking-[0.2em] font-bold transition-colors ${isActive ? "text-indigo-500/60" : "text-gray-600"}`}>Stats</span>
               <div className="flex items-center gap-1.5">
                  <Activity size={8} className="text-indigo-500/40" />
                  <span className={`text-[8px] font-mono font-bold transition-colors ${isActive ? "text-indigo-500" : "text-gray-600"}`}>{link.clicks || 0}</span>
               </div>
            </div>
            <div className="h-[1.5px] w-full bg-white/5 rounded-full overflow-hidden relative">
               <motion.div 
                 initial={{ width: 0 }}
                 whileInView={{ width: "100%" }}
                 transition={{ duration: 1.5, ease: "circOut" }}
                 className="h-full bg-gradient-to-r from-indigo-500/40 to-purple-500/40"
               />
            </div>
          </div>
          
          <div className={`text-[7px] font-mono uppercase tracking-[0.2em] border px-1.5 py-0.5 rounded transition-all ${isActive ? "opacity-100 border-indigo-500/20 text-indigo-500/60" : "opacity-40 border-white/5 text-gray-700"}`}>
            #{link.id}
          </div>
        </div>
      </div>
    </motion.a>
  );
};

export const LinkGrid = ({ links }: LinkGridProps) => {
  const [activeId, setActiveId] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {links.map((link, i) => (
        <TiltCard 
          key={link.id} 
          link={link} 
          index={i} 
          isActive={activeId === link.id}
          onActivate={() => setActiveId(link.id)}
        />
      ))}
    </div>
  );
};
