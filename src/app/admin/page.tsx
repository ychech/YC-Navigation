"use client";

import { useState, useEffect } from "react";
import { Loader2, Globe, Fingerprint } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { DashboardSidebar } from "@/components/admin/DashboardSidebar";
import { LinksTab } from "@/components/admin/LinksTab";
import { GalleryTab } from "@/components/admin/GalleryTab";
import { AboutTab } from "@/components/admin/AboutTab";
import { ConfigTab } from "@/components/admin/ConfigTab";

type Tab = "links" | "gallery" | "about" | "config";

export default function AdminPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("links");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [stats, setStats] = useState({ totalLinks: 0, totalGallery: 0 });
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

  if (!authenticated || !mounted) return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#6ee7b7]/20" size={40} />
    </div>
  );

  return (
    <div className="h-screen bg-[#fdfdfd] dark:bg-[#080808] text-gray-900 dark:text-white transition-colors duration-1000 flex overflow-hidden font-sans relative">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 admin-grid opacity-20 pointer-events-none" />
      <div className="absolute inset-0 ink-flow-bg opacity-30 pointer-events-none" />
      
      <DashboardSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        theme={theme}
        setTheme={setTheme}
        handleLogout={handleLogout}
        currentStats={stats}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-transparent relative z-10">
        <div className="flex-shrink-0 p-6 md:p-10 pb-0">
          <div className="max-w-7xl mx-auto space-y-10">
            {/* Page Title & Quick Actions */}
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-[#6ee7b7] text-[10px] font-black uppercase tracking-[0.5em]">
                  <Fingerprint size={14} />
                  <span>验证访问</span>
                </div>
                <h2 className="text-5xl font-black tracking-tighter text-gray-900 dark:text-white archive-title">
                  {activeTab === "links" && "档案索引"}
                  {activeTab === "gallery" && "视觉陈列"}
                  {activeTab === "about" && "馆主自传"}
                  {activeTab === "config" && "系统核心"}
                </h2>
                <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">
                  <span className="px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-full">v2.0.4-稳定版</span>
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> 节点在线</span>
                </div>
              </div>
              <div className="flex gap-4 pt-2">
                <a href="/" className="group flex items-center gap-4 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#6ee7b7] dark:hover:bg-[#6ee7b7] hover:text-white dark:hover:text-white transition-all shadow-xl hover:shadow-[#6ee7b7]/20 active:scale-95">
                  <Globe size={16} className="group-hover:rotate-12 transition-transform" strokeWidth={2.5} /> 
                  返回前台
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 p-6 md:p-10 pt-6 overflow-hidden">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            {activeTab === "links" && <LinksTab />}
            {activeTab !== "links" && (
              <div className="h-full overflow-y-auto pr-2">
                {activeTab === "gallery" && <GalleryTab />}
                {activeTab === "about" && <AboutTab />}
                {activeTab === "config" && <ConfigTab />}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
