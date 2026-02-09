"use client";

import { useState, useEffect } from "react";
import { Loader2, Globe, Fingerprint } from "lucide-react";
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

export default function AdminPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("links");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [stats, setStats] = useState({ totalLinks: 0, totalGallery: 0 });
  const [siteSlogan, setSiteSlogan] = useState("ARCHIVE.OS");
  const [adminTitles, setAdminTitles] = useState<Record<string, string>>({
    links: "档案索引",
    gallery: "视觉陈列", 
    about: "馆主自传",
    config: "系统核心",
    hero: "首页展示"
  });
  const [version, setVersion] = useState("v2.0.4-稳定版");
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
      fetchConfig();
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("admin_active_tab", activeTab);
    }
  }, [activeTab, mounted]);

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

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/config");
      if (res.ok) {
        const configs: SiteConfig[] = await res.json();
        const slogan = configs.find(c => c.key === "site_slogan")?.value;
        if (slogan) setSiteSlogan(slogan);
        
        // 获取自定义标题
        const titles: Record<string, string> = {};
        configs.forEach(c => {
          if (c.key.startsWith("admin_title_")) {
            const tab = c.key.replace("admin_title_", "");
            titles[tab] = c.value;
          }
        });
        if (Object.keys(titles).length > 0) {
          setAdminTitles(prev => ({ ...prev, ...titles }));
        }
        
        // 获取版本号
        const versionConfig = configs.find(c => c.key === "admin_version");
        if (versionConfig) {
          setVersion(versionConfig.value);
        }
      }
    } catch (e) {
      console.error("Failed to fetch config");
    }
  };

  if (!authenticated || !mounted) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
      <Loader2 className="animate-spin text-gray-400 dark:text-[#6ee7b7]/20" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#080808] text-gray-900 dark:text-white transition-colors duration-300 flex overflow-hidden font-sans relative">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 admin-grid opacity-5 dark:opacity-20 pointer-events-none" />
      <div className="absolute inset-0 ink-flow-bg opacity-10 dark:opacity-30 pointer-events-none" />
      
      <DashboardSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        theme={theme}
        setTheme={setTheme}
        handleLogout={handleLogout}
        currentStats={stats}
        siteSlogan={siteSlogan}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-transparent relative z-10 scroll-smooth">
        <div className="p-6 md:p-10">
          <div className="max-w-7xl mx-auto space-y-10">
            {/* Page Title & Quick Actions */}
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-indigo-600 dark:text-[#6ee7b7] text-[10px] font-black uppercase tracking-[0.5em]">
                  <Fingerprint size={14} />
                  <span>验证访问</span>
                </div>
                <h2 className="text-5xl font-black tracking-tighter text-gray-900 dark:text-white archive-title">
                  {adminTitles[activeTab]}
                </h2>
                <div className="flex items-center gap-4 text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest opacity-60">
                  <span className="px-3 py-1 bg-gray-200 dark:bg-white/5 rounded-full text-gray-600 dark:text-gray-300">{version}</span>
                  <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 节点在线</span>
                </div>
              </div>
              <div className="flex gap-4 pt-2">
                <a href="/" className="group flex items-center gap-4 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 dark:hover:bg-[#6ee7b7] hover:text-white dark:hover:text-white transition-all shadow-xl hover:shadow-indigo-500/20 dark:hover:shadow-[#6ee7b7]/20 active:scale-95">
                  <Globe size={16} className="group-hover:rotate-12 transition-transform" strokeWidth={2.5} /> 
                  返回前台
                </a>
              </div>
            </div>

            <div className="min-h-[60vh]">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
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
