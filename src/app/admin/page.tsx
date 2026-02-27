"use client";

import { useState, useEffect } from "react";
import { Loader2, Globe, Shield } from "lucide-react";
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
  const { theme, setTheme } = useTheme();
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <Loader2 className="animate-spin text-gray-400" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex overflow-hidden">
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
        adminTitles={adminTitles}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                  <Shield size={14} />
                  <span>后台管理</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {adminTitles[activeTab] || DEFAULT_ADMIN_TITLES[activeTab]}
                </h2>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">{version}</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> 
                    运行正常
                  </span>
                </div>
              </div>
              <a 
                href="/" 
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
              >
                <Globe size={16} /> 
                返回前台
              </a>
            </div>

            <div className="min-h-[60vh]">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
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
