"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { 
  Link2, 
  Image, 
  Settings, 
  Info, 
  LogOut, 
  ChevronLeft,
  ChevronRight,
  Home,
  Sun,
  Moon,
  ArrowLeft,
  Type,
  Layout
} from "lucide-react";

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
      {/* Header */}
      <div className={`h-16 flex items-center border-b border-black/10 dark:border-white/10 flex-shrink-0 ${
        isSidebarCollapsed ? "justify-center px-2" : "justify-between px-4"
      }`}>
        {!isSidebarCollapsed && (
          <span className="text-sm font-light tracking-wider">后台管理</span>
        )}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="p-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          {isSidebarCollapsed ? (
            <ChevronRight size={18} className="text-black/40 dark:text-white/40" />
          ) : (
            <ChevronLeft size={18} className="text-black/40 dark:text-white/40" />
          )}
        </button>
      </div>

      {/* Back to Home */}
      <div className="p-3 pb-0 flex-shrink-0">
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
      <nav className="p-3 space-y-1 flex-shrink-0">
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

      {/* Spacer */}
      <div className="flex-1" />

      {/* Stats - only show when expanded */}
      {!isSidebarCollapsed && (
        <div className="px-6 py-4 border-t border-black/10 dark:border-white/10">
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
    </aside>
  );
}
