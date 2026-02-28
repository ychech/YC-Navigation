"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/admin/DashboardSidebar";
import { LinksTab } from "@/components/admin/LinksTab";
import { GalleryTab } from "@/components/admin/GalleryTab";
import { SiteConfigTab } from "@/components/admin/SiteConfigTab";

import { HeroSlidesTab } from "@/components/admin/HeroSlidesTab";
import { HeroConfigTab } from "@/components/admin/HeroConfigTab";

type Tab = "links" | "gallery" | "site" | "heroSlides" | "heroConfig";

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("links");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({ links: 0, gallery: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/check", { credentials: "include" });
      if (!res.ok) {
        router.push("/admin/login");
      } else {
        setIsLoading(false);
      }
    } catch {
      router.push("/admin/login");
    }
  };

  const fetchStats = async () => {
    try {
      const [linksRes, galleryRes] = await Promise.all([
        fetch("/api/links"),
        fetch("/api/gallery"),
      ]);
      const links = await linksRes.json();
      const gallery = await galleryRes.json();
      setStats({ links: links.length, gallery: gallery.length });
    } catch {}
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/admin/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black/20 dark:border-white/20 border-t-black dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const tabTitles: Record<Tab, string> = {
    links: "链接管理",
    gallery: "画廊管理",
    site: "站点配置",

    heroSlides: "首页幻灯片",
    heroConfig: "首页标题",
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex">
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        onLogout={handleLogout}
        stats={stats}
      />
      
      <main 
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <div className="p-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-2xl font-light tracking-wide">
              {tabTitles[activeTab]}
            </h1>
            <div className="w-12 h-px bg-black/20 dark:bg-white/20 mt-4" />
          </div>
          
          {activeTab === "links" && <LinksTab />}
          {activeTab === "gallery" && <GalleryTab />}
          {activeTab === "site" && <SiteConfigTab />}
        
          {activeTab === "heroSlides" && <HeroSlidesTab />}
          {activeTab === "heroConfig" && <HeroConfigTab />}
        </div>
      </main>
    </div>
  );
}
