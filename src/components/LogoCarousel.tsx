"use client";

import { Link as PrismaLink } from "@prisma/client";
import { useEffect, useState, useRef } from "react";
import { motion, useAnimationFrame, useMotionValue, useTransform } from "framer-motion";

interface LogoCarouselProps {
  links: PrismaLink[];
}

export const LogoCarousel = ({ links }: LogoCarouselProps) => {
  const [mounted, setMounted] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Filter links that have icons
  const validLinks = links.filter(l => l.icon && l.title);

  if (validLinks.length === 0) return null;

  // We repeat the links enough times to cover the screen and allow seamless looping
  const multiplier = 8;
  const displayLinks = Array(multiplier).fill(validLinks).flat();

  const handleImageError = (index: number) => {
    setImgErrors(prev => ({ ...prev, [index]: true }));
  };

  return (
    <div className="w-full overflow-hidden py-12 relative border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#020617] transition-colors duration-300">
      {/* Gradient Masks for fading edges */}
      <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-[#020617] dark:via-[#020617]/80 z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-white via-white/80 to-transparent dark:from-[#020617] dark:via-[#020617]/80 z-10 pointer-events-none" />
      
      {/* Framer Motion Infinite Scroll */}
      <motion.div 
        className="flex w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ 
          duration: 40, 
          ease: "linear", 
          repeat: Infinity,
          repeatType: "loop" 
        }}
        whileHover={{ animationPlayState: "paused" }} // This works with CSS animation, but for framer motion we need a different approach or accept it won't pause easily without complex setup.
        // Actually, let's keep it simple: just continuous smooth scrolling. 
        // If pause on hover is critical, we can add it, but framer motion simple loop is robust.
      >
        {displayLinks.map((link, idx) => {
          const isBroken = imgErrors[idx];
          
          return (
            <a 
              key={`${link.id}-${idx}`} 
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 mx-8 opacity-40 hover:opacity-100 transition-all duration-500 grayscale hover:grayscale-0 group select-none"
            >
                {/* Logo - Hide if broken */}
                {!isBroken && link.icon && (
                  <div className="w-6 h-6 relative shrink-0">
                    <img 
                      src={link.icon} 
                      alt={link.title} 
                      className="object-contain w-full h-full filter drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                      onError={() => handleImageError(idx)}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </div>
                )}
                
                {/* Title */}
                <span className="text-xl font-black font-mono tracking-tighter text-gray-400 dark:text-white/80 group-hover:text-black dark:group-hover:text-white group-hover:drop-shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                  {link.title}
                </span>
            </a>
          );
        })}
      </motion.div>
    </div>
  );
};
