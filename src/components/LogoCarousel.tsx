"use client";

import { Link as PrismaLink } from "@prisma/client";
import { useEffect, useState, useRef, memo } from "react";
import { motion } from "framer-motion";

interface LogoCarouselProps {
  links: PrismaLink[];
}

// Memoized single logo item to prevent unnecessary re-renders
const LogoItem = memo(({ link, index }: { link: PrismaLink; index: number }) => {
  const [hasError, setHasError] = useState(false);
  
  return (
    <a 
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 mx-8 opacity-40 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0 group select-none will-change-transform"
    >
      {!hasError && link.icon ? (
        <div className="w-6 h-6 relative shrink-0">
          <img 
            src={link.icon} 
            alt="" 
            className="object-contain w-full h-full filter drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
            onError={() => setHasError(true)}
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
          />
        </div>
      ) : (
        <div className="w-6 h-6 bg-indigo-500/20 rounded flex items-center justify-center text-xs font-bold text-indigo-600">
          {link.title[0].toUpperCase()}
        </div>
      )}
      
      <span className="text-xl font-black font-mono tracking-tighter text-gray-400 dark:text-white/80 group-hover:text-black dark:group-hover:text-white whitespace-nowrap">
        {link.title}
      </span>
    </a>
  );
});

LogoItem.displayName = "LogoItem";

export const LogoCarousel = ({ links }: LogoCarouselProps) => {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Filter links that have titles (allow empty icon, will show fallback)
  const validLinks = links.filter(l => l.title);

  if (validLinks.length === 0) return null;

  // Reduce multiplier for better performance
  const multiplier = 4;
  const displayLinks = Array(multiplier).fill(validLinks).flat();

  return (
    <div className="w-full overflow-hidden py-6 relative border-b border-gray-200 dark:border-white/5 bg-transparent dark:bg-[#020617] transition-colors duration-300">
      {/* Gradient Masks for fading edges - Adapted for light/dark blending */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent dark:from-[#020617] dark:via-[#020617]/80 z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent dark:from-[#020617] dark:via-[#020617]/80 z-10 pointer-events-none" />
      
      {/* Framer Motion Infinite Scroll */}
      {/* Use CSS animation instead of Framer Motion for better performance */}
      <div 
        ref={containerRef}
        className="flex w-max animate-scroll hover:pause-animation"
        style={{
          animation: "scroll 30s linear infinite",
        }}
      >
        {displayLinks.map((link, idx) => (
          <LogoItem key={`${link.id}-${idx}`} link={link} index={idx} />
        ))}
      </div>
    </div>
  );
};
