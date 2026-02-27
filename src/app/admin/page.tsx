"use client";

import { useState, useEffect } from "react";
import { Loader2, Globe, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { DashboardSidebar } from "@/components/admin/DashboardSidebar";
import { LinksTab } from "@/components/admin/LinksTab";
import { GalleryTab } from "@/components/admin/GalleryTab";
import { AboutTab } from "@/components/admin/AboutTab";
import { ConfigTab } from "@/components/admin/ConfigTab";
import { HeroTab } from "@/components/admin/HeroTab";

type Tab = "links" | "gallery" | "about" | "config" | "hero";

interface SiteConfig {
  key: string;
  value: string;
}

const DEFAULT_ADMIN_TITLES: Record<string, string> = {
  links: "链接管理",
  gallery: "图库管理", 
  about: "关于页面",
  config: "系统配置",
  hero: "首页展示"
};

export default function AdminPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("links");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [stats, setStats] = useState({ totalLinks: 0, totalGallery: 0 });
  
  const [siteSlogan, setSiteSlogan] = useState("艺术导航");
  const [adminTitles, setAdminTitles] = useState<Record<string, string>>(DEFAULT_ADMIN_TITLES);
  const [version, setVersion] = useState("v2.0");
  
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const savedTab = localStorage.getItem("admin_active_tab") as Tab;
    if (savedTab) setActiveTab(savedTab);

    const isAuth = localStorage.getItem("admin_auth");
    if (!isAuth) {
      router.push("/admin/login");
    } else {
      setAuthenticated(true);
      fetchStats();
      fetchAdminConfig();
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("admin_active_tab", activeTab);
    }
  }, [activeTab, mounted]);

  const fetchAdminConfig = async () => {
    try {
      const res = await fetch("/api/config");
      if (res.ok) {
        const configs: SiteConfig[] = await res.json();
        
        const slogan = configs.find(c => c.key === "site_slogan");
        if (slogan) setSiteSlogan(slogan.value);
        
        const titles: Record<string, string> = { ...DEFAULT_ADMIN_TITLES };
        configs.forEach(c => {
          if (c.key.startsWith("admin_title_")) {
            const tabKey = c.key.replace("admin_title_", "");
            titles[tabKey] = c.value;
          }
        });
        setAdminTitles(titles);
        
        const versionConfig = configs.find(c => c.key === "admin_version");
        if (versionConfig) setVersion(versionConfig.value);
      }
    } catch (e) {
      console.error("Failed to fetch admin config");
    }
  };

  const fetchStats = async () => {
    try {
      const [categoriesRes, galleryRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/gallery")
      ]);
      const categories = await categoriesRes.json();
      const gallery = await galleryRes.json();
      
      const totalLinks = categories.reduce((acc: number, cat: any) => acc + (cat.links?.length || 0), 0);
      setStats({
        totalLinks,
        totalGallery: gallery.length
      });
    } catch (e) {
      console.error("Failed to fetch stats");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    router.push("/admin/login");
  };

  if (!authenticated || !mounted) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <Loader2 className="animate-spin text-indigo-500" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 
                    dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950
                    text-gray-800 dark:text-gray-100 
                    flex overflow-hidden transition-colors duration-500">
      
      {/* 背景装饰 - 深色模式下的灵动光效 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-300/20 dark:bg-indigo-500/10 
                        rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-300/20 dark:bg-purple-500/10 
                        rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      <DashboardSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        handleLogout={handleLogout}
        currentStats={stats}
        siteSlogan={siteSlogan}
        adminTitles={adminTitles}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-between items-start"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                  <Sparkles size={14} />
                  <span>后台管理</span>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 
                               dark:from-white dark:to-indigo-200 bg-clip-text text-transparent">
                  {adminTitles[activeTab] || DEFAULT_ADMIN_TITLES[activeTab]}
                </h2>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="px-2 py-1 bg-white/80 dark:bg-white/10 backdrop-blur rounded-md border 
                                   border-gray-200/50 dark:border-white/10">
                    {version}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 
                    系统运行正常
                  </span>
                </div>
              </div>
              <a 
                href="/" 
                className="group flex items-center gap-2 px-5 py-2.5 
                         bg-white/80 dark:bg-white/10 backdrop-blur
                         border border-gray-200/50 dark:border-white/10
                         rounded-xl text-sm font-medium 
                         hover:border-indigo-300 dark:hover:border-indigo-400/50
                         hover:shadow-lg hover:shadow-indigo-500/10 
                         dark:hover:shadow-indigo-400/10
                         transition-all duration-300"
              >
                <Globe size={16} className="group-hover:rotate-12 transition-transform" /> 
                返回前台
              </a>
            </motion.div>

            <div className="min-h-[60vh]">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl
                         rounded-2xl border border-gray-200/50 dark:border-white/10
                         shadow-xl shadow-gray-200/50 dark:shadow-black/20
                         p-6"
              >
                {activeTab === "links" && <LinksTab />}
                {activeTab === "gallery" && <GalleryTab />}
                {activeTab === "about" && <AboutTab />}
                {activeTab === "config" && <ConfigTab />}
                {activeTab === "hero" && <HeroTab />}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
