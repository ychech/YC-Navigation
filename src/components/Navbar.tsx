"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Search, Menu, Clock, Sun, Moon, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { SearchModal } from "./SearchModal";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Category, Link as PrismaLink } from "@prisma/client";

const MotionLink = motion(Link);

interface NavbarProps {
  categories?: (Category & { links: PrismaLink[] })[];
}

export const Navbar = ({ categories = [] }: NavbarProps) => {
  const { scrollY, scrollYProgress } = useScroll();
  const { theme, setTheme } = useTheme();
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

  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    [
      "rgba(var(--background), 0)",
      theme === "dark" ? "rgba(2, 6, 23, 0.8)" : "rgba(253, 253, 253, 0.8)"
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
      className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-6 flex justify-between items-center transition-all duration-500 border-b border-white/5 dark:border-white/5"
    >
      <motion.div 
        style={{ scaleX: scrollYProgress }}
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-indigo-500/30 origin-left"
      />

      <div className="flex items-center gap-12">
        <Link href="/" className="text-xl font-black tracking-tighter group flex items-center gap-3">
          <div className="flex items-center">
            <span className="text-indigo-500 font-mono animate-pulse mr-1">_</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
              艺术导航
            </span>
            <span className="text-indigo-500 font-mono animate-pulse ml-1">_</span>
          </div>
        </Link>
        
        <div className="hidden lg:flex items-center gap-3 text-[10px] text-gray-400 font-black tracking-widest">
          <Clock size={10} />
          <span>{time} / EST_2026</span>
        </div>
      </div>
      
      <div className="flex gap-12 items-center">
        <div className="hidden md:flex gap-10 text-[11px] uppercase tracking-[0.4em] text-gray-500 dark:text-gray-300 font-black">
          {[
            { name: "目录", href: "/#directory" },
            { name: "画廊", href: "/gallery" },
            { name: "关于", href: "/#about" }
          ].map((item) => (
            <MotionLink 
              key={item.name}
              href={item.href} 
              whileHover={{ color: "#6366f1", y: -1 }}
              className="transition-colors relative group"
            >
              {item.name}
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full opacity-0 transition-all duration-500 group-hover:opacity-100" />
            </MotionLink>
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
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-transparent text-gray-300/20 hover:text-indigo-500/50 hover:bg-indigo-500/5 transition-all"
            aria-label="Admin Access"
          >
            <Lock size={14} strokeWidth={2.5} />
          </Link>
        </div>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} categories={categories} />
    </motion.nav>
  );
};
