"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Search, Menu, Clock, Sun, Moon, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { SearchModal } from "./SearchModal";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Category, Link as PrismaLink } from "@prisma/client";

const MotionLink = motion(Link);

// --- New NavBrand Component ---
const NavBrand = () => {
  return (
    <Link href="/" className="group flex items-center gap-4 relative z-50">
      <div className="flex flex-col">
        <h1 className="text-xl font-black tracking-tight flex items-center gap-[2px]">
          {/* Character-level animation for "艺术导航" - Liquid Metal Style */}
          {["艺", "术", "导", "航"].map((char, i) => (
            <motion.span
              key={i}
              className="inline-block bg-clip-text text-transparent bg-gradient-to-b from-slate-900 via-slate-600 to-slate-400 dark:from-white dark:via-gray-300 dark:to-gray-500 drop-shadow-sm"
              whileHover={{ 
                y: -3, 
                scale: 1.1,
                textShadow: "0 0 10px rgba(99,102,241,0.5)",
                backgroundImage: "linear-gradient(to bottom, #6366f1, #a5f3fc, #22d3ee)"
              }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {char}
            </motion.span>
          ))}
        </h1>
        <span className="text-[10px] font-mono text-gray-500 tracking-[0.2em] uppercase group-hover:text-indigo-600 dark:group-hover:text-gray-300 transition-colors flex items-center gap-1">
          ARTISTIC NAV
        </span>
      </div>
    </Link>
  );
};

interface NavbarProps {
  categories?: (Category & { links: PrismaLink[] })[];
}

export const Navbar = ({ categories = [] }: NavbarProps) => {
  const { scrollY, scrollYProgress } = useScroll();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Global Command+K Listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // 使用 resolvedTheme 确保挂载后有正确的主题值
  const isDark = mounted ? resolvedTheme === "dark" : true;

  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    [
      isDark ? "rgba(2, 6, 23, 0)" : "rgba(248, 250, 252, 0)",
      isDark ? "rgba(2, 6, 23, 0.8)" : "rgba(248, 250, 252, 0.8)"
    ]
  );

  const backdropFilter = useTransform(
    scrollY,
    [0, 100],
    ["blur(0px)", "blur(24px)"]
  );

  return (
    <motion.nav 
      style={{ 
        backgroundColor,
        backdropFilter,
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-6 flex justify-between items-center transition-all duration-500 border-b border-gray-200 dark:border-white/5"
    >
      <motion.div 
        style={{ scaleX: scrollYProgress }}
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-indigo-500/30 origin-left"
      />

      <div className="flex items-center gap-12">
        <NavBrand />
        
        <div className="hidden lg:flex items-center gap-3 text-[10px] text-gray-400 font-black tracking-widest font-mono">
          <Clock size={10} />
          <span>{time} / EST_2026</span>
        </div>
      </div>
      
      <div className="flex gap-12 items-center">
        <div className="hidden md:flex gap-12 text-sm uppercase tracking-[0.2em] text-gray-500 dark:text-gray-300 font-bold font-serif">
          {[
            { name: "Directory", label: "目录", href: "/#directory" },
            { name: "Gallery", label: "画廊", href: "/gallery" },
            { name: "About", label: "关于", href: "/#about" }
          ].map((item) => (
            <Link 
              key={item.name}
              href={item.href} 
              className="relative group block overflow-hidden"
            >
              <div className="relative transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full">
                {/* Original Text - Serif */}
                <span className="block text-gray-500 dark:text-gray-300 transition-colors duration-500 group-hover:italic">
                  {item.label}
                </span>
                
                {/* Hover Text - Serif Italic */}
                <span className="absolute top-full left-0 block text-indigo-600 dark:text-white font-black italic">
                  {item.label}
                </span>
              </div>
              
              {/* Subtle underline indicator */}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-indigo-500 rounded-full transition-all duration-500 group-hover:w-full opacity-0 group-hover:opacity-100" />
            </Link>
          ))}
        </div>
        
        <div className="flex gap-3 items-center">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] text-gray-500 hover:text-indigo-500 transition-all shadow-sm"
          >
            <Search size={16} strokeWidth={2.5} />
          </button>

          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] text-gray-500 hover:text-indigo-500 transition-all shadow-sm"
            >
              {theme === "dark" ? <Sun size={16} strokeWidth={2.5} /> : <Moon size={16} strokeWidth={2.5} />}
            </button>
          )}

          <button className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] text-gray-500 transition-all shadow-sm">
            <Menu size={16} strokeWidth={2.5} />
          </button>

          <Link 
            href="/admin" 
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] text-gray-500 hover:text-indigo-500 transition-all shadow-sm group/admin relative"
            aria-label="Admin Access"
          >
            <LayoutDashboard size={16} strokeWidth={2.5} />
            <span className="absolute top-full mt-2 px-2 py-1 bg-black dark:bg-white text-white dark:text-black text-[9px] font-bold uppercase tracking-widest rounded-md opacity-0 group-hover/admin:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Admin
            </span>
          </Link>
        </div>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} categories={categories} />
    </motion.nav>
  );
};
