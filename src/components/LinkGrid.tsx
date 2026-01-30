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
      className={`group relative bg-[#0a0a0a]/80 backdrop-blur-2xl border overflow-hidden block transition-all duration-500 hover:scale-[1.02] rounded-[16px] shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(99,102,241,0.1)] active:scale-[0.99] flex flex-col ${
        isActive 
          ? "border-indigo-500/50" 
          : "border-white/5 hover:border-white/10"
      }`}
    >
      {/* 1. Cover Image Section (AspectRatio 16:9 like Bilibili) */}
      <div className="relative w-full aspect-video bg-black/40 overflow-hidden group-hover:brightness-110 transition-all duration-500">
        {link.snapshotUrl ? (
           <img 
             src={link.snapshotUrl} 
             alt={link.title} 
             className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
           />
        ) : (
           // Placeholder pattern when no snapshot
           <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black relative">
              <div className="absolute inset-0 opacity-20" 
                   style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center backdrop-blur-sm border border-white/10">
                 {link.icon ? (
                    <img src={link.icon} alt="" className="w-6 h-6 object-contain opacity-50 grayscale" />
                 ) : (
                    <span className="text-xl font-bold text-white/20">{link.title[0]}</span>
                 )}
              </div>
           </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Stats Badge (Bottom Right of Cover) */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[9px] text-white/80">
           <Activity size={10} />
           <span className="font-mono">{link.clicks || 0}</span>
        </div>
      </div>

      {/* 2. Info Section (Bottom) */}
      <div className="p-3 flex gap-3 flex-1 relative z-10 bg-[#0a0a0a]">
         {/* Avatar / Icon (Left) */}
         <div className="shrink-0 mt-0.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center bg-[#1a1a1a] border transition-all duration-500 overflow-hidden relative group-hover:border-indigo-500/30 ${isActive ? "border-indigo-500/50" : "border-white/10"}`}>
               {link.icon ? (
                 <img src={link.icon} alt="" className="w-5 h-5 object-contain relative z-10" />
               ) : getFaviconUrl(link.url) ? (
                 <img src={getFaviconUrl(link.url)} alt="" className="w-5 h-5 object-contain relative z-10" />
               ) : (
                 <span className="text-xs font-bold text-indigo-500">{link.title[0]}</span>
               )}
            </div>
         </div>

         {/* Text Content (Right) */}
         <div className="flex flex-col min-w-0 flex-1">
            <h3 className={`text-sm font-medium leading-tight mb-1 truncate transition-colors duration-300 ${isActive ? "text-indigo-400" : "text-gray-200 group-hover:text-white"}`}>
               {link.title}
            </h3>
            
            <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2 h-8">
               {link.description || "探索数字边界。"}
            </p>
            
            <div className="mt-auto pt-2 flex items-center justify-between">
               <span className="text-[9px] text-gray-600 font-mono group-hover:text-indigo-400/60 transition-colors truncate max-w-[80px]">
                 {new URL(link.url.startsWith('http') ? link.url : `https://${link.url}`).hostname}
               </span>
               <ArrowUpRight size={12} className="text-gray-600 group-hover:text-indigo-400 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300" />
            </div>
         </div>
      </div>

      {/* Tech Corner Accents - Minimal */}
      {isActive && (
        <>
          <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500/50" />
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-indigo-500/30" />
        </>
      )}
    </motion.a>
  );
};

export const LinkGrid = ({ links }: LinkGridProps) => {
  const [activeId, setActiveId] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
