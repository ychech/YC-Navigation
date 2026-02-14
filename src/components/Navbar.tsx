"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Search, Clock, Sun, Moon, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { SearchModal } from "./SearchModal";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Category, Link as PrismaLink } from "@prisma/client";

// Logo 组件 - 中国风毛笔字 + 印章
const NavBrand = () => {
  return (
    <Link href="/" className="flex items-center gap-3 relative z-50 group">
      {/* 黑色圆形 - 毛笔字背景 */}
      <div className="relative w-11 h-11">
        {/* 黑色圆底 */}
        <div className="absolute inset-0 rounded-full bg-black border-2 border-gray-800 shadow-lg" />
        
        {/* 白色毛笔字 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className="text-white text-xl font-bold tracking-widest transform -rotate-6"
            style={{ 
              fontFamily: '"Noto Serif SC", "Source Han Serif SC", "STKaiti", "KaiTi", serif',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            艺
          </span>
        </div>
        
        {/* 红色印章 - 右下角 */}
        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-red-600 rounded-sm border border-red-700 shadow-md flex items-center justify-center transform rotate-12 group-hover:rotate-0 transition-transform duration-300">
          <span 
            className="text-white text-[7px] font-bold"
            style={{ fontFamily: '"Noto Serif SC", serif' }}
          >
            术
          </span>
        </div>
      </div>
      
      {/* 文字标题 */}
      <div className="flex flex-col">
        <span 
          className="text-xl text-gray-900 dark:text-white tracking-widest"
          style={{ fontFamily: '"Noto Serif SC", "Source Han Serif SC", serif' }}
        >
          艺术导航
        </span>
      </div>
    </Link>
  );
};

interface NavbarProps {
  categories?: (Category & { links: PrismaLink[] })[];
  siteName?: string;
  siteSlogan?: string;
}

export const Navbar = ({ categories = [] }: NavbarProps) => {
  const { scrollY } = useScroll();
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

  const isDark = mounted ? resolvedTheme === "dark" : true;

  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    [
      isDark ? "rgba(2, 6, 23, 0)" : "rgba(248, 250, 252, 0)",
      isDark ? "rgba(2, 6, 23, 0.8)" : "rgba(248, 250, 252, 0.8)"
    ]
  );

  return (
    <motion.nav 
      style={{ backgroundColor }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <NavBrand />

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { label: "目录", href: "/#directory" },
            { label: "画廊", href: "/gallery" },
            { label: "关于", href: "/#about" }
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-gray-400 font-mono mr-2">
            <Clock size={12} />
            <span>{time}</span>
          </div>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            <Search size={16} />
          </button>

          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}

          <Link
            href="/admin"
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            <LayoutDashboard size={16} />
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};
