"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Search, Clock, Sun, Moon, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { SearchModal } from "./SearchModal";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Category, Link as PrismaLink } from "@prisma/client";

// Logo 组件 - 字符级流光特效
const NavBrand = ({ siteName = "艺术导航", siteSlogan = "ARTISTIC NAV" }: { siteName?: string; siteSlogan?: string }) => {
  return (
    <Link href="/" className="group flex flex-col relative z-50">
      {/* 主标题 - 分散字符动画 */}
      <h1 className="text-xl font-black tracking-tight flex items-center gap-[2px]">
        {siteName.split("").map((char, i) => (
          <motion.span
            key={i}
            className="inline-block bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-300 to-gray-500 drop-shadow-sm"
            whileHover={{ 
              y: -3, 
              scale: 1.1,
              textShadow: "0 0 10px rgba(255,255,255,0.5)",
              backgroundImage: "linear-gradient(to bottom, #fff, #ccc, #999)"
            }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {char}
          </motion.span>
        ))}
      </h1>
      {/* 副标题 */}
      <span className="text-[9px] font-mono text-gray-500 tracking-[0.2em] uppercase">
        {siteSlogan}
      </span>
    </Link>
  );
};

interface NavbarProps {
  categories?: (Category & { links: PrismaLink[] })[];
  siteName?: string;
  siteSlogan?: string;
}

export const Navbar = ({ categories = [], siteName = "艺术导航", siteSlogan = "ARTISTIC NAV" }: NavbarProps) => {
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
      <div className="w-full px-6 md:px-12 h-16 flex items-center justify-between">
        {/* Logo - 左边 */}
        <NavBrand siteName={siteName} siteSlogan={siteSlogan} />

        {/* 右边所有内容 */}
        <div className="flex items-center gap-4">
          {/* Navigation - 右边 */}
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

          {/* Buttons */}
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
      </div>
    </motion.nav>
  );
};
