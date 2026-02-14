"use client";

import { Category } from "@prisma/client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface SidebarNavProps {
  categories: Category[];
  isCollapsed: boolean;
  onToggle: () => void;
}

export const SidebarNav = ({ categories, isCollapsed, onToggle }: SidebarNavProps) => {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // 支持暗黑模式的颜色配置
  const baseClasses = {
    container: "hidden xl:block fixed left-4 top-1/2 -translate-y-1/2 z-40",
    toggleBtn: "absolute -right-4 top-1/2 -translate-y-1/2 z-50 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg bg-gray-200/50 dark:bg-white/10 border border-gray-300/50 dark:border-white/20 hover:bg-gray-300/50 dark:hover:bg-white/20",
    sidebar: "relative rounded-2xl backdrop-blur-xl overflow-hidden bg-white/80 dark:bg-white/[0.02] border border-gray-200/50 dark:border-white/[0.06] shadow-lg dark:shadow-none",
    item: "relative w-full group",
    itemBg: "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-200/50 dark:bg-white/[0.03]",
    itemText: "text-[10px] font-mono text-gray-500 dark:text-white/40 group-hover:text-gray-700 dark:group-hover:text-white/60",
    itemTextActive: "text-[10px] font-mono text-gray-900 dark:text-gray-200",
    itemName: "text-xs tracking-wide transition-colors text-gray-600 dark:text-white/40 group-hover:text-gray-900 dark:group-hover:text-white/60",
    itemNameActive: "text-xs tracking-wide transition-colors text-gray-900 dark:text-white/80",
    divider: "my-3 mx-4 h-[1px] bg-gradient-to-r from-transparent via-gray-300 dark:via-white/10 to-transparent",
    backToTop: "w-full flex items-center py-2 text-gray-500 dark:text-white/30 hover:text-gray-700 dark:hover:text-white/60 transition-colors",
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={baseClasses.container}
      >
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className={baseClasses.toggleBtn}
          title={isCollapsed ? "展开" : "收缩"}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <svg width="12" height="12" viewBox="0 0 10 10" fill="none" className="text-gray-600 dark:text-white/60">
              <path d="M6 2L3 5L6 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </button>

        <motion.div
          animate={{ width: isCollapsed ? 48 : 160 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className={baseClasses.sidebar}
          suppressHydrationWarning
        >
          {/* Subtle gradient line on the right */}
          <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-gray-300 dark:via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />

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
                    className={baseClasses.item}
                    title={cat.name}
                  >
                    {/* Hover background */}
                    <div className={`${baseClasses.itemBg} ${isActive ? 'opacity-100' : ''}`} />
                    
                    <motion.div
                      className={`relative flex items-center h-10 ${isCollapsed ? 'justify-center px-2' : 'px-4'} transition-all duration-300`}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r-full bg-gray-900/40 dark:bg-white/40"
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
                            className={isActive ? baseClasses.itemTextActive : baseClasses.itemText}
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
                            <span className={isActive ? "text-[10px] font-mono text-gray-900 dark:text-gray-300" : "text-[10px] font-mono text-gray-500 dark:text-gray-500"}>
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span className={isActive ? baseClasses.itemNameActive : baseClasses.itemName}>
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
            <div className={baseClasses.divider} />

            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              className={`${baseClasses.backToTop} ${isCollapsed ? 'justify-center px-2' : 'px-4 gap-2'}`}
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
