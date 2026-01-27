"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Info, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const menuItems = [
  { icon: LayoutDashboard, label: "仪表盘", href: "/admin" },
  { icon: LinkIcon, label: "链接管理", href: "/admin/links" },
  { icon: ImageIcon, label: "画廊管理", href: "/admin/gallery" },
  { icon: Info, label: "关于内容", href: "/admin/about" },
  { icon: Settings, label: "系统配置", href: "/admin/config" },
];

/**
 * Admin Sidebar Component
 * 
 * Provides navigation for the admin dashboard.
 * Supports collapsible state on desktop and drawer mode on mobile.
 */
export const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    router.push("/admin/login");
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center justify-between">
        {(!isCollapsed || isMobileOpen) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-[#6ee7b7] rounded-lg flex items-center justify-center shadow-lg shadow-[#6ee7b7]/20">
              <Settings size={18} className="text-black" />
            </div>
            <span className="font-black tracking-tighter text-xl text-gray-900 dark:text-white">ADMIN</span>
          </motion.div>
        )}
        
        {/* Desktop Collapse Toggle */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* Mobile Close Toggle */}
        <button 
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group relative ${
                isActive 
                  ? "bg-[#6ee7b7]/10 text-[#6ee7b7]" 
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
              } ${isCollapsed && !isMobileOpen ? 'justify-center' : ''}`}
            >
              <item.icon size={20} className={isActive ? "text-[#6ee7b7]" : "group-hover:scale-110 transition-transform"} />
              {(!isCollapsed || isMobileOpen) && (
                <span className="font-bold text-sm tracking-wide whitespace-nowrap">{item.label}</span>
              )}
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-5 bg-[#6ee7b7] rounded-r-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-2 border-t border-gray-100 dark:border-white/5">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all group ${isCollapsed && !isMobileOpen ? 'justify-center' : ''}`}
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          {(!isCollapsed || isMobileOpen) && <span className="font-bold text-sm tracking-wide whitespace-nowrap">退出登录</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Trigger Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl shadow-lg border border-gray-100 dark:border-white/10 text-gray-500"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside 
        className={`fixed lg:sticky top-0 left-0 h-screen bg-white dark:bg-[#0a0a0a] border-r border-gray-100 dark:border-white/5 transition-all duration-300 z-50 flex flex-col
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-24' : 'lg:w-72'}
        `}
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
};
