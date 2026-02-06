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
}

export function DashboardSidebar({
  activeTab,
  setActiveTab,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  theme,
  setTheme,
  handleLogout,
  currentStats,
  siteSlogan = "ARCHIVE.OS"
}: DashboardSidebarProps) {
  return (
    <aside className={`${isSidebarCollapsed ? "w-24" : "w-80"} border-r border-gray-100 dark:border-white/[0.03] bg-white/40 dark:bg-[#0a0a0a]/40 backdrop-blur-3xl flex flex-col p-8 z-20 shrink-0 relative overflow-hidden transition-all duration-700 ease-out`}>
      {/* Sidebar Collapse Toggle */}
      <button 
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className="absolute -right-3 top-24 w-6 h-12 bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-indigo-500 dark:hover:text-[#6ee7b7] transition-all z-30 shadow-xl group"
      >
        {isSidebarCollapsed ? <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" /> : <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />}
      </button>

      <div className={`mb-20 relative ${isSidebarCollapsed ? "text-center" : ""}`}>
        <h1 className="text-2xl font-black tracking-tighter flex items-center gap-4">
          <div className="relative shrink-0 w-4 h-4">
            <span className="absolute inset-0 bg-indigo-500 dark:bg-[#6ee7b7] blur-md opacity-40 animate-pulse" />
            <span className="relative block w-full h-full bg-indigo-500 dark:bg-[#6ee7b7] rounded-sm rotate-45" />
          </div>
          {!isSidebarCollapsed && (
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-300 dark:to-gray-500 whitespace-nowrap tracking-tight">
              {siteSlogan}
            </span>
          )}
        </h1>
        {!isSidebarCollapsed && (
          <div className="flex items-center gap-2 mt-4">
            <div className="h-[1px] w-4 bg-indigo-500/30 dark:bg-[#6ee7b7]/30" />
            <p className="text-[8px] uppercase tracking-[0.6em] text-gray-400 font-black opacity-40">System Management</p>
          </div>
        )}
      </div>

      <nav className="space-y-3 relative mb-auto">
        {(["links", "gallery", "hero", "about", "config"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`w-full group flex items-center gap-5 py-4 text-[13px] font-bold tracking-wider rounded-2xl transition-all duration-500 relative overflow-hidden ${
              isSidebarCollapsed ? "justify-center px-0" : "px-6"
            } ${
              activeTab === tab 
              ? "text-indigo-600 dark:text-[#6ee7b7] shadow-[0_8px_32px_-8px_rgba(79,70,229,0.15)] dark:shadow-[0_8px_32px_-8px_rgba(110,231,183,0.15)]" 
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            }`}
          >
            {activeTab === tab && (
              <motion.div 
                layoutId="sidebar-active-bg"
                className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent border-l-2 border-indigo-500 dark:from-[#6ee7b7]/10 dark:via-[#6ee7b7]/5 dark:border-[#6ee7b7]"
              />
            )}
            
            <span className={`relative z-10 transition-all duration-500 ${activeTab === tab ? "scale-110 text-indigo-600 dark:text-[#6ee7b7]" : "opacity-60 group-hover:opacity-100 group-hover:scale-105"}`}>
              {tab === "links" && <ListTree size={20} strokeWidth={1.5} />}
              {tab === "gallery" && <ImageIcon size={20} strokeWidth={1.5} />}
              {tab === "hero" && <Terminal size={20} strokeWidth={1.5} />}
              {tab === "about" && <Info size={20} strokeWidth={1.5} />}
              {tab === "config" && <Settings size={20} strokeWidth={1.5} />}
            </span>
            
            {!isSidebarCollapsed && (
              <span className="relative z-10 flex-1 text-left whitespace-nowrap font-black">
                {tab === "links" && "档案索引"}
                {tab === "gallery" && "视觉陈列"}
                {tab === "hero" && "Hero 轮播"}
                {tab === "about" && "馆主自传"}
                {tab === "config" && "系统核心"}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="space-y-8 relative pt-10 border-t border-gray-100 dark:border-white/[0.03]">
        {!isSidebarCollapsed && (
          <div className="grid grid-cols-1 gap-3">
            <div className="p-5 rounded-2xl bg-gray-50/30 dark:bg-white/[0.01] border border-gray-100 dark:border-white/[0.03] group hover:border-indigo-500/20 dark:hover:border-[#6ee7b7]/20 transition-colors">
              <div className="flex justify-between items-end">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Database Capacity</span>
                <span className="text-xl font-black text-indigo-600 dark:text-[#6ee7b7] tabular-nums">{currentStats.totalLinks + currentStats.totalGallery}</span>
              </div>
              <div className="w-full h-1 bg-gray-100 dark:bg-white/5 mt-3 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "65%" }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-[#6ee7b7] dark:to-cyan-400"
                />
              </div>
            </div>
          </div>
        )}
        
        <div className={`flex ${isSidebarCollapsed ? "flex-col items-center gap-6" : "gap-4"}`}>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`${isSidebarCollapsed ? "w-12 h-12" : "w-14 h-14 flex-1"} flex items-center justify-center rounded-2xl bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/[0.05] text-gray-400 hover:text-indigo-500 dark:hover:text-[#6ee7b7] transition-all hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-[#6ee7b7]/10`}
          >
            {theme === "dark" ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
          </button>
          <button 
            onClick={handleLogout} 
            className={`${isSidebarCollapsed ? "w-12 h-12" : "flex-[1.5] h-14"} flex items-center justify-center gap-3 rounded-2xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-500/60 hover:text-red-500 text-[11px] font-black uppercase tracking-widest transition-all`}
          >
            <LogOut size={18} strokeWidth={1.5} /> {!isSidebarCollapsed && "Logout"}
          </button>
        </div>
      </div>
    </aside>
  );
}
