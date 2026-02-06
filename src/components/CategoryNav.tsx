"use client";

import { Category } from "@prisma/client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CategoryNavProps {
  categories: Category[];
}

export const CategoryNav = ({ categories }: CategoryNavProps) => {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      let current = null;
      for (const cat of categories) {
        const section = document.getElementById(`category-${cat.id}`);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 400) {
            current = cat.id;
            break;
          }
        }
      }
      if (current) setActiveCategory(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories]);

  const scrollToCategory = (id: number) => {
    const section = document.getElementById(`category-${id}`);
    if (section) {
      const top = section.getBoundingClientRect().top + window.scrollY - 140;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveCategory(id);
    }
  };

  return (
    <div className="inline-flex items-center p-1.5 rounded-full bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl border border-gray-200/60 dark:border-white/[0.06] shadow-lg shadow-black/5 dark:shadow-black/20">
      <div className="flex items-center gap-1">
        {categories.map((cat, index) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className="relative px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-300 rounded-full"
            >
              {/* 背景指示器 */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg shadow-indigo-500/25"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              
              {/* 文字 */}
              <span 
                className={`relative z-10 transition-colors duration-300 ${
                  isActive 
                    ? "text-white font-semibold" 
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                {cat.name}
              </span>

              {/* 分隔线（除了最后一个） */}
              {!isActive && index < categories.length - 1 && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-4 bg-gray-200 dark:bg-white/10" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
