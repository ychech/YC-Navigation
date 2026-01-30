"use client";

import { Category } from "@prisma/client";
import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface CategoryNavProps {
  categories: Category[];
}

export const CategoryNav = ({ categories }: CategoryNavProps) => {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Active section logic
      let current = null;
      for (const cat of categories) {
        const section = document.getElementById(`category-${cat.id}`);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 400) { // Increased threshold
            current = cat.id;
            break;
          }
        }
      }
      if (current) setActiveCategory(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories]);

  const scrollToCategory = (id: number) => {
    const section = document.getElementById(`category-${id}`);
    if (section) {
      // Offset for sticky header
      const top = section.getBoundingClientRect().top + window.scrollY - 140;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveCategory(id);
    }
  };

  return (
    <div className="flex items-center px-2 py-2 rounded-2xl bg-[#0a0a0a]/40 backdrop-blur-md border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] ring-1 ring-white/5 overflow-hidden min-w-[300px] justify-center relative group/nav">
       
       <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-[90vw] md:max-w-none px-2 relative z-10" onMouseLeave={() => {/* Optional: Reset hover state logic if needed */}}>
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={cn(
                  "relative px-5 py-2 text-xs font-bold uppercase tracking-[0.1em] whitespace-nowrap transition-colors duration-300 select-none rounded-xl z-10",
                  isActive 
                    ? "text-white" 
                    : "text-gray-500 hover:text-gray-200"
                )}
              >
                <span className="relative z-10">{cat.name}</span>
                
                {/* Active/Hover Spotlight Blob */}
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryBlob"
                    className="absolute inset-0 bg-white/10 rounded-xl blur-[8px] scale-110"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryBg"
                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            );
          })}
       </div>
    </div>
  );
};
