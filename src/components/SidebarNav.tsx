"use client";

import { Category } from "@prisma/client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useTheme } from "next-themes";

interface SidebarNavProps {
  categories: Category[];
  isCollapsed: boolean;
  onToggle: () => void;
}

export const SidebarNav = ({ categories, isCollapsed, onToggle }: SidebarNavProps) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      let current = null;
      for (const cat of categories) {
        const section = document.getElementById(`category-${cat.id}`);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 200) {
            current = cat.id;
          }
        }
      }
      if (current) setActiveCategory(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories]);

  const scrollToCategory = (id: number) => {
    const section = document.getElementById(`category-${id}`);
    if (section) {
      const top = section.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveCategory(id);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden xl:block fixed left-4 top-1/2 -translate-y-1/2 z-40"
      >
        {/* Toggle Button - Outside the sidebar */}
        <button
          onClick={onToggle}
          className={`absolute -right-4 top-1/2 -translate-y-1/2 z-50 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
            isDark 
              ? 'bg-white/10 border border-white/20 hover:bg-white/20' 
              : 'bg-gray-100 border border-gray-200 hover:bg-gray-200'
          }`}
          title={isCollapsed ? "展开" : "收缩"}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <svg width="12" height="12" viewBox="0 0 10 10" fill="none" className={isDark ? 'text-white/60' : 'text-gray-600'}>
              <path d="M6 2L3 5L6 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </button>

        <motion.div
          animate={{ width: isCollapsed ? 48 : 160 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className={`relative rounded-2xl backdrop-blur-xl overflow-hidden ${
            isDark 
              ? 'bg-white/[0.02] border border-white/[0.06]' 
              : 'bg-white border border-gray-200 shadow-lg'
          }`}
        >
          {/* Subtle gradient line on the right */}
          <div className={`absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent ${isDark ? 'via-white/10' : 'via-gray-300'} to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500`} />

          {/* Content Container */}
          <div className="py-4">
            {/* Category List */}
            <div className="space-y-0.5">
              {categories.map((cat, index) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => scrollToCategory(cat.id)}
                    className="relative w-full group"
                    title={cat.name}
                  >
                    {/* Hover background */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isActive ? 'opacity-100' : ''} ${isDark ? 'bg-white/[0.03]' : 'bg-gray-100'}`} />
                    
                    <motion.div
                      className={`relative flex items-center h-10 ${isCollapsed ? 'justify-center px-2' : 'px-4'} transition-all duration-300`}
                    >
                      {/* Active indicator - subtle line */}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className={`absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r-full ${isDark ? 'bg-white/40' : 'bg-indigo-500'}`}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                        />
                      )}

                      {/* Content */}
                      <AnimatePresence mode="wait">
                        {isCollapsed ? (
                          <motion.span
                            key="collapsed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`text-[10px] font-mono transition-colors ${
                              isDark 
                                ? (isActive ? 'text-white' : 'text-white/40 group-hover:text-white/60')
                                : (isActive ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700')
                            }`}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </motion.span>
                        ) : (
                          <motion.div
                            key="expanded"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex items-center gap-3"
                          >
                            <span className={`text-[10px] font-mono ${
                              isDark 
                                ? (isActive ? 'text-white/50' : 'text-white/20')
                                : (isActive ? 'text-gray-500' : 'text-gray-400')
                            }`}>
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span className={`text-xs tracking-wide transition-colors ${
                              isDark 
                                ? (isActive ? 'text-white/80' : 'text-white/40 group-hover:text-white/60')
                                : (isActive ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-800')
                            }`}>
                              {cat.name}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="my-3 mx-4 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              className={`w-full flex items-center py-2 text-white/30 hover:text-white/60 transition-colors ${isCollapsed ? 'justify-center px-2' : 'px-4 gap-2'}`}
            >
              <ArrowUpRight size={12} />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-[10px] tracking-wide overflow-hidden whitespace-nowrap"
                  >
                    顶部
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </motion.div>

        {/* Decorative element */}
        <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-4 h-32 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
        </div>
      </motion.div>

      {/* Mobile Bottom Nav */}
      <div className="xl:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-1 p-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-lg">
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={`px-4 py-2 text-xs font-medium rounded-full transition-all ${
                activeCategory === cat.id
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:bg-white/5"
              }`}
            >
              {cat.name.slice(0, 4)}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
