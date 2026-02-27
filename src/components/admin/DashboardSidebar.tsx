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
    <aside className={`${isSidebarCollapsed ? "w-20" : "w-72"} 
                      bg-white/80 dark:bg-slate-800/60 
                      backdrop-blur-xl
                      border-r border-gray-200/50 dark:border-white/10
                      flex flex-col shrink-0 relative 
                      transition-all duration-500 ease-out`}>
      
      {/* 装饰性顶部渐变 */}
      <div className="absolute top-0 left-0 right-0 h-1 
                      bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
                      dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400" />
      
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50 dark:border-white/10">
        <div className={`flex items-center gap-4 ${isSidebarCollapsed ? "justify-center" : ""}`}>
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 
                          dark:from-indigo-400 dark:to-purple-500
                          flex items-center justify-center text-white font-bold text-lg
                          shadow-lg shadow-indigo-500/30 dark:shadow-indigo-400/30">
              A
            </div>
            {/* 发光效果 */}
            <div className="absolute inset-0 rounded-xl bg-indigo-500/20 dark:bg-indigo-400/20 
                          blur-xl -z-10" />
          </div>
          {!isSidebarCollapsed && (
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white text-lg">{siteSlogan}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">管理控制台</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.tab}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setActiveTab(item.tab)}
            className={`w-full group flex items-center gap-4 px-4 py-3 
                       rounded-xl transition-all duration-300 relative overflow-hidden
                       ${activeTab === item.tab 
                         ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/5 dark:from-indigo-400/20 dark:to-purple-400/10 text-indigo-700 dark:text-indigo-300 shadow-lg shadow-indigo-500/10 dark:shadow-indigo-400/10" 
                         : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-white/5"
                       }`}
          >
            {/* 激活指示器 */}
            {activeTab === item.tab && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 
                         bg-gradient-to-b from-indigo-500 to-purple-500
                         dark:from-indigo-400 dark:to-purple-400
                         rounded-full"
              />
            )}
            
            <span className={`relative z-10 transition-transform duration-300 
                           ${activeTab === item.tab ? "scale-110" : "group-hover:scale-105"}`}>
              {item.icon}
            </span>
            
            {!isSidebarCollapsed && (
              <span className="relative z-10 font-medium">
                {getMenuTitle(item.tab)}
              </span>
            )}
          </motion.button>
        ))}
      </nav>

      {/* Stats Card */}
      {!isSidebarCollapsed && (
        <div className="px-4 pb-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white 
                        dark:from-slate-700/50 dark:to-slate-800/50
                        border border-gray-200/50 dark:border-white/10">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {currentStats.totalLinks}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">链接</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {currentStats.totalGallery}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">图片</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-gray-200/50 dark:border-white/10 space-y-3">
        {/* Theme Toggle */}
        <button
          onClick={() => {}}
          className="w-full flex items-center gap-3 px-4 py-2.5 
                   rounded-xl text-gray-600 dark:text-gray-400 
                   hover:bg-gray-100/50 dark:hover:bg-white/5
                   transition-colors"
        >
          <Sun size={18} className="dark:hidden" />
          <Moon size={18} className="hidden dark:block text-indigo-400" />
          {!isSidebarCollapsed && <span className="text-sm">切换主题</span>}
        </button>
        
        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 
                   rounded-xl text-red-600 dark:text-red-400
                   hover:bg-red-50 dark:hover:bg-red-500/10
                   transition-colors"
        >
          <LogOut size={18} />
          {!isSidebarCollapsed && <span className="text-sm">退出登录</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="w-full flex items-center justify-center p-2 
                   rounded-xl text-gray-400 hover:bg-gray-100/50 
                   dark:hover:bg-white/5 transition-colors"
        >
          {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
