"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Link2, 
  Image, 
  Settings, 
  LogOut, 
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  ArrowLeft,
  Type,
  Layout
} from "lucide-react";
import { getImageUrl } from "@/lib/image-url";

type Tab = "links" | "gallery" | "site" | "heroSlides" | "heroConfig";

interface DashboardSidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (v: boolean) => void;
  onLogout: () => void;
  stats: { links: number; gallery: number };
}

export function DashboardSidebar({
  activeTab,
  setActiveTab,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  onLogout,
  stats,
}: DashboardSidebarProps) {
  const { theme, setTheme } = useTheme();
  const [siteConfig, setSiteConfig] = useState<{ name?: string; favicon?: string }>({});

  // 获取站点配置
  const fetchSiteConfig = () => {
    fetch("/api/config")
      .then(res => res.json())
      .then((configs: any[]) => {
        const nameConfig = configs.find(c => c.key === "site_name");
        const faviconConfig = configs.find(c => c.key === "site_favicon");
        setSiteConfig({
          name: nameConfig?.value,
          favicon: faviconConfig?.value,
        });
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchSiteConfig();
    
    // 监听站点配置更新事件
    const handleConfigUpdate = () => fetchSiteConfig();
    window.addEventListener("site-config-updated", handleConfigUpdate);
    
    return () => {
      window.removeEventListener("site-config-updated", handleConfigUpdate);
    };
  }, []);

  const menuItems = [
    { id: "links" as Tab, icon: Link2, label: "链接" },
    { id: "gallery" as Tab, icon: Image, label: "画廊" },
  ];

  const homeItems = [
    { id: "heroConfig" as Tab, icon: Type, label: "首页标题" },
    { id: "heroSlides" as Tab, icon: Layout, label: "尾部幻灯片" },
  ];

  const otherItems = [
    { id: "site" as Tab, icon: Settings, label: "站点配置" },
  ];

  const renderMenuItem = (item: { id: Tab; icon: any; label: string }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={`w-full flex items-center gap-3 px-3 py-3 transition-all ${
          isActive
            ? "bg-black text-white dark:bg-white dark:text-black"
            : "text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5"
        } ${isSidebarCollapsed ? "justify-center" : ""}`}
        title={isSidebarCollapsed ? item.label : undefined}
      >
        <Icon size={20} />
        {!isSidebarCollapsed && <span className="text-sm">{item.label}</span>}
      </button>
    );
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen border-r border-black/10 dark:border-white/10 bg-white dark:bg-black transition-all duration-300 z-40 flex flex-col ${
        isSidebarCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header with Site Info */}
      <div className={`border-b border-black/10 dark:border-white/10 flex-shrink-0 ${
        isSidebarCollapsed ? "p-3" : "p-4"
      }`}>
        {/* Site Logo & Name */}
        <div className={`flex items-center gap-3 ${isSidebarCollapsed ? "justify-center" : ""}`}>
          <div className={`flex-shrink-0 overflow-hidden border border-black/10 dark:border-white/10 ${
            isSidebarCollapsed ? "w-10 h-10" : "w-12 h-12"
          }`}>
            {siteConfig.favicon ? (
              <img 
                src={getImageUrl(siteConfig.favicon)} 
                alt="" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  // 如果图片加载失败，显示默认图标
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center"><span class="text-white font-bold text-lg">艺</span></div>';
                  }
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">艺</span>
              </div>
            )}
          </div>
          {!isSidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{siteConfig.name || "艺术导航"}</div>
              <div className="text-xs text-black/40 dark:text-white/40">后台管理</div>
            </div>
          )}
        </div>
      </div>

      {/* Back to Home */}
      <div className="px-3 py-2 flex-shrink-0">
        <Link
          href="/"
          className={`w-full flex items-center gap-3 px-3 py-3 text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 transition-all ${
            isSidebarCollapsed ? "justify-center" : ""
          }`}
          title={isSidebarCollapsed ? "返回首页" : undefined}
        >
          <ArrowLeft size={20} />
          {!isSidebarCollapsed && <span className="text-sm">返回首页</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="px-3 space-y-1 flex-shrink-0 overflow-y-auto flex-1">
        {!isSidebarCollapsed && (
          <div className="px-3 py-2 text-xs text-black/30 dark:text-white/30 uppercase tracking-wider">
            内容管理
          </div>
        )}
        {menuItems.map(renderMenuItem)}
        
        {!isSidebarCollapsed && (
          <div className="px-3 py-2 mt-4 text-xs text-black/30 dark:text-white/30 uppercase tracking-wider">
            首页配置
          </div>
        )}
        {homeItems.map(renderMenuItem)}
        
        {!isSidebarCollapsed && (
          <div className="px-3 py-2 mt-4 text-xs text-black/30 dark:text-white/30 uppercase tracking-wider">
            其他
          </div>
        )}
        {otherItems.map(renderMenuItem)}
      </nav>

      {/* Stats - only show when expanded */}
      {!isSidebarCollapsed && (
        <div className="px-6 py-4 border-t border-black/10 dark:border-white/10 flex-shrink-0">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-light">{stats.links}</div>
              <div className="text-xs text-black/40 dark:text-white/40">链接</div>
            </div>
            <div>
              <div className="text-2xl font-light">{stats.gallery}</div>
              <div className="text-xs text-black/40 dark:text-white/40">图片</div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-3 border-t border-black/10 dark:border-white/10 flex-shrink-0">
        <div className={`flex ${isSidebarCollapsed ? "flex-col gap-2" : "gap-2"}`}>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`flex-1 py-2 text-xs border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-1 ${
              isSidebarCollapsed ? "px-2" : ""
            }`}
            title={theme === "dark" ? "切换亮色" : "切换暗色"}
          >
            {isSidebarCollapsed ? (
              theme === "dark" ? <Sun size={14} /> : <Moon size={14} />
            ) : (
              theme === "dark" ? "亮色" : "暗色"
            )}
          </button>
          <button
            onClick={onLogout}
            className={`flex-1 py-2 text-xs border border-black/10 dark:border-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex items-center justify-center gap-1 ${
              isSidebarCollapsed ? "px-2" : ""
            }`}
            title="退出"
          >
            {isSidebarCollapsed ? <LogOut size={14} /> : "退出"}
          </button>
        </div>
      </div>

      {/* Collapse Button - Right side middle */}
      <button
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 flex items-center justify-center bg-white dark:bg-black border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors z-50 rounded-r"
        title={isSidebarCollapsed ? "展开" : "收起"}
      >
        {isSidebarCollapsed ? (
          <ChevronRight size={14} className="text-black/60 dark:text-white/60" />
        ) : (
          <ChevronLeft size={14} className="text-black/60 dark:text-white/60" />
        )}
      </button>
    </aside>
  );
}
