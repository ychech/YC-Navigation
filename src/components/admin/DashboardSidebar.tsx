"use client";

import { 
  LogOut, Info, Settings, Sun, Moon,
  ChevronLeft, ChevronRight,
  Image as ImageIcon, List as ListTree, Terminal
} from "lucide-react";
import { motion } from "framer-motion";

type Tab = "links" | "gallery" | "about" | "config" | "hero";

interface DashboardSidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  theme: string | undefined;
  setTheme: (theme: string) => void;
  handleLogout: () => void;
  currentStats: {
    totalLinks: number;
    totalGallery: number;
  };
  siteSlogan?: string;
  adminTitles?: Record<string, string>;
}

const DEFAULT_MENU_TITLES: Record<string, string> = {
  links: "链接管理",
  gallery: "图库管理",
  hero: "首页展示",
  about: "关于页面",
  config: "系统配置"
};

export function DashboardSidebar({
  activeTab,
  setActiveTab,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  theme,
  setTheme,
  handleLogout,
  currentStats,
  siteSlogan = "艺术导航",
  adminTitles = {}
}: DashboardSidebarProps) {
  const getMenuTitle = (tab: Tab) => {
    return adminTitles[tab] || DEFAULT_MENU_TITLES[tab];
  };

  const menuItems: { tab: Tab; icon: React.ReactNode }[] = [
    { tab: "links", icon: <ListTree size={18} /> },
    { tab: "gallery", icon: <ImageIcon size={18} /> },
    { tab: "hero", icon: <Terminal size={18} /> },
    { tab: "about", icon: <Info size={18} /> },
    { tab: "config", icon: <Settings size={18} /> },
  ];

  return (
    <aside className={`${isSidebarCollapsed ? "w-16" : "w-64"} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0 transition-all duration-300`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm shrink-0">
            A
          </div>
          {!isSidebarCollapsed && (
            <span className="font-semibold text-gray-900 dark:text-white truncate">
              {siteSlogan}
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === item.tab 
                ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white" 
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            }`}
          >
            <span className={activeTab === item.tab ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}>
              {item.icon}
            </span>
            {!isSidebarCollapsed && <span>{getMenuTitle(item.tab)}</span>}
          </button>
        ))}
      </nav>

      {/* Stats */}
      {!isSidebarCollapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">链接数</span>
              <span className="font-medium">{currentStats.totalLinks}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">图片数</span>
              <span className="font-medium">{currentStats.totalGallery}</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          {!isSidebarCollapsed && <span>{theme === "dark" ? "浅色模式" : "深色模式"}</span>}
        </button>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={18} />
          {!isSidebarCollapsed && <span>退出登录</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
