"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Trash2, Loader2, Edit2, X, 
  LogOut, 
  Info, Settings, Search, Sun, Moon,
  ChevronLeft, ChevronRight, AlertCircle, Lock,
  Image as ImageIcon, List as ListTree,
  Command, Sparkles, Globe, Fingerprint, Camera,
  ArrowUp, ArrowDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

type Tab = "links" | "gallery" | "about" | "config";

import { toast } from "sonner";

export default function AdminPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("links");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number, type: 'link' | 'category' | 'gallery' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  
  // Data States
  const [categories, setCategories] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();
  
  // Forms state
  const [newLink, setNewLink] = useState({ title: "", url: "", icon: "", description: "", categoryId: "", snapshotUrl: "" });
  const [newCategory, setNewCategory] = useState("");
  const [editingLink, setEditingLink] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [newGalleryImg, setNewGalleryImg] = useState({ url: "", title: "" });
  const [editingAbout, setEditingAbout] = useState<any>(null);
  const [passwordChange, setPasswordChange] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    setMounted(true);
    const savedTab = localStorage.getItem("admin_active_tab") as Tab;
    if (savedTab) setActiveTab(savedTab);

    const isAuth = localStorage.getItem("admin_auth");
    if (!isAuth) {
      router.push("/admin/login");
    } else {
      setAuthenticated(true);
      fetchAllData();
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("admin_active_tab", activeTab);
    }
  }, [activeTab, mounted]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchCategories(),
      fetchGallery(),
      fetchAbout(),
      fetchConfigs()
    ]);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    router.push("/admin/login");
  };

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
  };

  const fetchGallery = async () => {
    const res = await fetch("/api/gallery");
    const data = await res.json();
    setGallery(data);
  };

  const fetchAbout = async () => {
    const res = await fetch("/api/about");
    const data = await res.json();
    setEditingAbout(data);
  };

  const fetchConfigs = async () => {
    const res = await fetch("/api/config");
    const data = await res.json();
    setConfigs(data);
  };

  // --- Sorting Handlers ---
  const moveCategory = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === categories.length - 1) return;

    const newCategories = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    [newCategories[index], newCategories[targetIndex]] = [newCategories[targetIndex], newCategories[index]];
    
    setCategories(newCategories);
    
    // Optimistic update done, now sync to server
    try {
      await fetch("/api/categories", { 
        method: "PUT", 
        body: JSON.stringify(newCategories) 
      });
      toast.success("排序已更新");
    } catch (e) {
      toast.error("排序保存失败");
      fetchCategories(); // Revert on error
    }
  };

  const moveLink = async (categoryIndex: number, linkIndex: number, direction: 'up' | 'down') => {
    const category = categories[categoryIndex];
    const links = [...(category.links || [])];
    
    if (direction === 'up' && linkIndex === 0) return;
    if (direction === 'down' && linkIndex === links.length - 1) return;

    const targetIndex = direction === 'up' ? linkIndex - 1 : linkIndex + 1;
    
    // Swap
    [links[linkIndex], links[targetIndex]] = [links[targetIndex], links[linkIndex]];
    
    // Update local state deeply
    const newCategories = [...categories];
    newCategories[categoryIndex] = { ...category, links };
    setCategories(newCategories);

    // Sync to server
    try {
      await fetch("/api/links", { 
        method: "PUT", 
        body: JSON.stringify(links) 
      });
      toast.success("链接排序已更新");
    } catch (e) {
      toast.error("排序保存失败");
      fetchCategories();
    }
  };

  // --- Handlers for Links & Categories ---
  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLink.categoryId) return toast.error("请选择分类");
    await fetch("/api/links", { method: "POST", body: JSON.stringify(newLink) });
    setNewLink({ title: "", url: "", icon: "", description: "", categoryId: "", snapshotUrl: "" });
    toast.success("链接已添加");
    fetchCategories();
  };

  const handleUpdateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/links", { method: "PUT", body: JSON.stringify(editingLink) });
    setEditingLink(null);
    toast.success("链接已更新");
    fetchCategories();
  };

  const handleDeleteLink = async (id: number) => {
    setDeleteConfirm({ id, type: 'link' });
  };

  const confirmDeleteLink = async (id: number) => {
    await fetch(`/api/links?id=${id}`, { method: "DELETE" });
    toast.success("链接已删除");
    setDeleteConfirm(null);
    fetchCategories();
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/categories", { method: "POST", body: JSON.stringify({ name: newCategory }) });
    setNewCategory("");
    toast.success("分类已创建");
    fetchCategories();
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/categories", { method: "PUT", body: JSON.stringify(editingCategory) });
    setEditingCategory(null);
    toast.success("分类已更新");
    fetchCategories();
  };

  const handleDeleteCategory = async (id: number) => {
    setDeleteConfirm({ id, type: 'category' });
  };

  const confirmDeleteCategory = async (id: number) => {
    await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
    toast.success("分类已删除");
    setDeleteConfirm(null);
    fetchCategories();
  };

  // --- Handlers for Gallery ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'link' | 'gallery' | 'snapshot') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (type === 'link') {
      if (editingLink) setEditingLink({ ...editingLink, icon: data.url });
      else setNewLink({ ...newLink, icon: data.url });
    } else if (type === 'snapshot') {
      if (editingLink) setEditingLink({ ...editingLink, snapshotUrl: data.url });
      else setNewLink({ ...newLink, snapshotUrl: data.url });
    } else {
      setNewGalleryImg({ ...newGalleryImg, url: data.url });
    }
    toast.success("文件上传成功");
  };

  const fetchLinkTitle = async (url: string) => {
    if (!url || (editingLink ? editingLink.title : newLink.title)) return;
    
    try {
      const res = await fetch("/api/utils/fetch-title", {
        method: "POST",
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (data.title) {
        if (editingLink) setEditingLink({ ...editingLink, title: data.title });
        else setNewLink({ ...newLink, title: data.title });
        toast.success("已自动获取标题");
      }
    } catch (err) {
      // Ignore error
    }
  };

  const getFaviconUrl = (url: string) => {
    try {
      if (!url || url.startsWith('#') || !url.includes('.')) return '';
      const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
    } catch (e) {
      return '';
    }
  };

  const handleAddGalleryImg = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/gallery", { method: "POST", body: JSON.stringify(newGalleryImg) });
    setNewGalleryImg({ url: "", title: "" });
    toast.success("图片已添加到画廊");
    fetchGallery();
  };

  const handleDeleteGalleryImg = async (id: number) => {
    setDeleteConfirm({ id, type: 'gallery' });
  };

  const confirmDeleteGalleryImg = async (id: number) => {
    await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
    toast.success("图片已删除");
    setDeleteConfirm(null);
    fetchGallery();
  };

  // --- Handlers for About ---
  const handleUpdateAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/about", { method: "PUT", body: JSON.stringify(editingAbout) });
    fetchAbout();
    toast.success("内容已保存");
  };

  // --- Handlers for Config ---
  const handleUpdateConfigs = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/config", { method: "PUT", body: JSON.stringify({ configs }) });
    fetchConfigs();
    toast.success("配置更新成功");
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      return toast.error("新密码与确认密码不匹配");
    }
    
    const res = await fetch("/api/auth/password", {
      method: "PUT",
      body: JSON.stringify({
        oldPassword: passwordChange.oldPassword,
        newPassword: passwordChange.newPassword
      })
    });
    
    const data = await res.json();
    if (data.success) {
      toast.success("密码修改成功");
      setPasswordChange({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      toast.error(data.message || "密码修改失败");
    }
  };

  const currentStats = {
    totalLinks: categories.reduce((acc, cat) => acc + (cat.links?.length || 0), 0),
    totalGallery: gallery.length
  };

  if (!authenticated || !mounted) return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#6ee7b7]/20" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdfdfd] dark:bg-[#080808] text-gray-900 dark:text-white transition-colors duration-1000 flex overflow-hidden font-sans relative">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 admin-grid opacity-20 pointer-events-none" />
      <div className="absolute inset-0 ink-flow-bg opacity-30 pointer-events-none" />
      
      {/* Sidebar Navigation */}
      <aside className={`${isSidebarCollapsed ? "w-24" : "w-80"} border-r border-gray-100 dark:border-white/[0.03] bg-white/40 dark:bg-[#0a0a0a]/40 backdrop-blur-3xl flex flex-col p-8 z-20 shrink-0 relative overflow-hidden transition-all duration-700 ease-out`}>
        {/* Sidebar Collapse Toggle */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-24 w-6 h-12 bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-[#6ee7b7] transition-all z-30 shadow-xl group"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" /> : <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />}
        </button>

        <div className={`mb-20 relative ${isSidebarCollapsed ? "text-center" : ""}`}>
          <h1 className="text-2xl font-black tracking-tighter flex items-center gap-4">
            <div className="relative shrink-0 w-4 h-4">
              <span className="absolute inset-0 bg-[#6ee7b7] blur-md opacity-40 animate-pulse" />
              <span className="relative block w-full h-full bg-[#6ee7b7] rounded-sm rotate-45" />
            </div>
            {!isSidebarCollapsed && (
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-300 dark:to-gray-500 whitespace-nowrap tracking-tight">
                ARCHIVE.OS
              </span>
            )}
          </h1>
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2 mt-4">
              <div className="h-[1px] w-4 bg-[#6ee7b7]/30" />
              <p className="text-[8px] uppercase tracking-[0.6em] text-gray-400 font-black opacity-40">System Management</p>
            </div>
          )}
        </div>

        <nav className="space-y-3 relative mb-auto">
          {(["links", "gallery", "about", "config"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full group flex items-center gap-5 py-4 text-[13px] font-bold tracking-wider rounded-2xl transition-all duration-500 relative overflow-hidden ${
                isSidebarCollapsed ? "justify-center px-0" : "px-6"
              } ${
                activeTab === tab 
                ? "text-[#6ee7b7] shadow-[0_8px_32px_-8px_rgba(110,231,183,0.15)]" 
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              }`}
            >
              {activeTab === tab && (
                <motion.div 
                  layoutId="sidebar-active-bg"
                  className="absolute inset-0 bg-gradient-to-r from-[#6ee7b7]/10 via-[#6ee7b7]/5 to-transparent border-l-2 border-[#6ee7b7]"
                />
              )}
              
              <span className={`relative z-10 transition-all duration-500 ${activeTab === tab ? "scale-110 text-[#6ee7b7]" : "opacity-60 group-hover:opacity-100 group-hover:scale-105"}`}>
                {tab === "links" && <ListTree size={20} strokeWidth={1.5} />}
                {tab === "gallery" && <ImageIcon size={20} strokeWidth={1.5} />}
                {tab === "about" && <Info size={20} strokeWidth={1.5} />}
                {tab === "config" && <Settings size={20} strokeWidth={1.5} />}
              </span>
              
              {!isSidebarCollapsed && (
                <span className="relative z-10 flex-1 text-left whitespace-nowrap font-black">
                  {tab === "links" && "档案索引"}
                  {tab === "gallery" && "视觉陈列"}
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
              <div className="p-5 rounded-2xl bg-gray-50/30 dark:bg-white/[0.01] border border-gray-100 dark:border-white/[0.03] group hover:border-[#6ee7b7]/20 transition-colors">
                <div className="flex justify-between items-end">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Database Capacity</span>
                  <span className="text-xl font-black text-[#6ee7b7] tabular-nums">{currentStats.totalLinks + currentStats.totalGallery}</span>
                </div>
                <div className="w-full h-1 bg-gray-100 dark:bg-white/5 mt-3 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "65%" }}
                    className="h-full bg-gradient-to-r from-[#6ee7b7] to-cyan-400"
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className={`flex ${isSidebarCollapsed ? "flex-col items-center gap-6" : "gap-4"}`}>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`${isSidebarCollapsed ? "w-12 h-12" : "w-14 h-14 flex-1"} flex items-center justify-center rounded-2xl bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/[0.05] text-gray-400 hover:text-[#6ee7b7] transition-all hover:shadow-2xl hover:shadow-[#6ee7b7]/10`}
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-white dark:bg-[#0f0f0f] border border-gray-100 dark:border-white/5 rounded-[32px] p-8 shadow-2xl"
            >
              <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6">
                <AlertCircle size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">确认删除？</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-8 leading-relaxed">
                此操作将永久移除该{deleteConfirm.type === 'link' ? '链接' : deleteConfirm.type === 'category' ? '分类及其所有链接' : '画廊图片'}，且无法撤销。
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-4 text-[13px] font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={() => {
                    if (deleteConfirm.type === 'link') confirmDeleteLink(deleteConfirm.id);
                    else if (deleteConfirm.type === 'category') confirmDeleteCategory(deleteConfirm.id);
                    else if (deleteConfirm.type === 'gallery') confirmDeleteGalleryImg(deleteConfirm.id);
                  }}
                  className="flex-1 py-4 bg-red-500 text-white rounded-2xl text-[13px] font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                >
                  确认删除
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-transparent p-12 md:p-20 relative z-10 scroll-smooth">
        <div className="max-w-6xl mx-auto space-y-24">
          {/* Page Title & Quick Actions */}
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[#6ee7b7] text-[10px] font-black uppercase tracking-[0.5em]">
                <Fingerprint size={14} />
                <span>验证访问</span>
              </div>
              <h2 className="text-7xl font-black tracking-tighter text-gray-900 dark:text-white archive-title">
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
            <div className="flex gap-4 pt-4">
              <a href="/" className="group flex items-center gap-4 px-10 py-5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#6ee7b7] dark:hover:bg-[#6ee7b7] hover:text-white dark:hover:text-white transition-all shadow-2xl hover:shadow-[#6ee7b7]/20 active:scale-95">
                <Globe size={16} className="group-hover:rotate-12 transition-transform" strokeWidth={2.5} /> 
                返回前台
              </a>
            </div>
          </div>

          <div className="min-h-[70vh]">
            {/* TAB: LINKS */}
            {activeTab === "links" && (
              <div className="space-y-16">
                <div className="nm-inset p-3 rounded-[32px] bg-white/50 dark:bg-black/20 backdrop-blur-md border border-white/5">
                  <div className="relative w-full group">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#6ee7b7] transition-colors" size={20} strokeWidth={1.5} />
                    <input
                      type="text"
                      placeholder="搜索片段或关键词..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full bg-transparent pl-20 pr-8 py-6 text-xs font-black uppercase tracking-[0.3em] focus:outline-none transition-all placeholder:text-gray-400 placeholder:opacity-50"
                    />
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-3">
                      <span className="text-[10px] text-gray-400 font-black px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/5">ESC 清空</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                  {/* Left Column: Forms - Asymmetric Width (5 cols) */}
                  <div className="lg:col-span-5 space-y-12">
                    <section className="nm-flat p-10 rounded-[40px] border border-gray-100/50 dark:border-white/[0.03] slant-decor group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#6ee7b7]/10 to-transparent blur-3xl pointer-events-none" />
                      <h2 className="text-[11px] uppercase tracking-[0.5em] text-[#6ee7b7] font-black mb-10 flex items-center gap-4">
                        <Sparkles size={14} />
                        {editingCategory ? "更新分类" : "创建分类"}
                      </h2>
                      <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory} className="space-y-8">
                        <div className="space-y-3">
                          <label className="text-[9px] uppercase tracking-[0.5em] text-gray-400 font-black ml-1 opacity-50">分类标识</label>
                          <input
                            type="text"
                            placeholder="输入分类名称"
                            value={editingCategory ? editingCategory.name : newCategory}
                            onChange={(e) => editingCategory ? setEditingCategory({...editingCategory, name: e.target.value}) : setNewCategory(e.target.value)}
                            className="w-full bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl px-6 py-5 text-sm font-bold focus:outline-none glow-border transition-all"
                            required
                          />
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button type="submit" className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.4em] font-black hover:bg-[#6ee7b7] dark:hover:bg-[#6ee7b7] hover:text-white dark:hover:text-black transition-all shadow-2xl hover:shadow-[#6ee7b7]/20 active:scale-[0.98]">
                            {editingCategory ? "提交修改" : "创建节点"}
                          </button>
                          {editingCategory && (
                            <button type="button" onClick={() => setEditingCategory(null)} className="px-6 bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white rounded-2xl transition-all hover:bg-red-500/10 hover:text-red-500">
                              <X size={18} strokeWidth={2.5} />
                            </button>
                          )}
                        </div>
                      </form>
                    </section>

                    <section className="nm-flat p-10 rounded-[40px] border border-gray-100/50 dark:border-white/[0.03] group relative overflow-hidden">
                      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-gradient-to-tl from-[#6ee7b7]/10 to-transparent blur-3xl pointer-events-none" />
                      <h2 className="text-[11px] uppercase tracking-[0.5em] text-[#6ee7b7] font-black mb-10 flex items-center gap-4">
                        <Command size={14} />
                        {editingLink ? "重构链接" : "索引新链接"}
                      </h2>
                      <form onSubmit={editingLink ? handleUpdateLink : handleAddLink} className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-[9px] uppercase tracking-[0.5em] text-gray-400 font-black ml-1 opacity-50">节点归属</label>
                          <select
                            value={editingLink ? editingLink.categoryId : newLink.categoryId}
                            onChange={(e) => editingLink ? setEditingLink({...editingLink, categoryId: e.target.value}) : setNewLink({ ...newLink, categoryId: e.target.value })}
                            className="w-full bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl px-6 py-5 text-xs font-black tracking-widest focus:outline-none glow-border transition-all text-gray-600 dark:text-gray-300 appearance-none cursor-pointer"
                            required
                          >
                            <option value="">选择目标分类</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
                          </select>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <label className="text-[9px] uppercase tracking-[0.5em] text-gray-400 font-black ml-1 opacity-50">元数据</label>
                            <input
                              type="text"
                              placeholder="链接标题"
                              value={editingLink ? editingLink.title : newLink.title}
                              onChange={(e) => editingLink ? setEditingLink({...editingLink, title: e.target.value}) : setNewLink({ ...newLink, title: e.target.value })}
                              className="w-full bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl px-6 py-5 text-sm font-bold focus:outline-none glow-border transition-all"
                              required
                            />
                            <input
                              type="text"
                              placeholder="访问地址 (HTTPS://...)"
                              value={editingLink ? editingLink.url : newLink.url}
                              onChange={(e) => editingLink ? setEditingLink({...editingLink, url: e.target.value}) : setNewLink({ ...newLink, url: e.target.value })}
                              onBlur={(e) => fetchLinkTitle(e.target.value)}
                              className="w-full bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl px-6 py-5 text-sm font-bold focus:outline-none glow-border transition-all"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[9px] uppercase tracking-[0.5em] text-gray-400 font-black ml-1 opacity-50">视觉资产 (Favicon)</label>
                          <div className="flex gap-4">
                            <input
                              type="text"
                              placeholder="资产地址"
                              value={editingLink ? (editingLink.icon || "") : newLink.icon}
                              onChange={(e) => editingLink ? setEditingLink({...editingLink, icon: e.target.value}) : setNewLink({ ...newLink, icon: e.target.value })}
                              className="flex-1 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl px-6 py-5 text-sm font-bold focus:outline-none transition-all"
                            />
                            <label className="w-16 h-16 nm-flat cursor-pointer flex items-center justify-center hover:bg-[#6ee7b7]/10 transition-all rounded-2xl border border-gray-100 dark:border-white/5 active:scale-95">
                              <ImageIcon size={24} className="text-[#6ee7b7]" strokeWidth={2.5} />
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'link')} />
                            </label>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[9px] uppercase tracking-[0.5em] text-gray-400 font-black ml-1 opacity-50">档案快照 (页面全景预览)</label>
                          <div className="flex gap-4">
                            <input
                              type="text"
                              placeholder="快照地址"
                              value={editingLink ? (editingLink.snapshotUrl || "") : newLink.snapshotUrl}
                              onChange={(e) => editingLink ? setEditingLink({...editingLink, snapshotUrl: e.target.value}) : setNewLink({ ...newLink, snapshotUrl: e.target.value })}
                              className="flex-1 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl px-6 py-5 text-sm font-bold focus:outline-none transition-all"
                            />
                            <label className="w-16 h-16 nm-flat cursor-pointer flex items-center justify-center hover:bg-[#6ee7b7]/10 transition-all rounded-2xl border border-gray-100 dark:border-white/5 active:scale-95">
                              <Camera size={24} className="text-[#6ee7b7]" strokeWidth={2.5} />
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'snapshot')} />
                            </label>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[9px] uppercase tracking-[0.5em] text-gray-400 font-black ml-1 opacity-50">描述 (可选)</label>
                          <textarea
                            placeholder="编码简短上下文..."
                            value={editingLink ? editingLink.description : newLink.description}
                            onChange={(e) => editingLink ? setEditingLink({...editingLink, description: e.target.value}) : setNewLink({ ...newLink, description: e.target.value })}
                            className="w-full bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[24px] px-6 py-6 text-sm font-medium focus:outline-none glow-border transition-all min-h-[140px] resize-none leading-relaxed"
                          />
                        </div>
                        <div className="flex gap-3 pt-6">
                          <button type="submit" className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.4em] font-black hover:bg-[#6ee7b7] dark:hover:bg-[#6ee7b7] hover:text-white dark:hover:text-black transition-all shadow-2xl hover:shadow-[#6ee7b7]/20 active:scale-[0.98]">
                            {editingLink ? "更新注册表" : "提交节点"}
                          </button>
                          {editingLink && (
                            <button type="button" onClick={() => setEditingLink(null)} className="px-6 bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white rounded-2xl transition-all hover:bg-red-500/10 hover:text-red-500">
                              <X size={18} strokeWidth={2.5} />
                            </button>
                          )}
                        </div>
                      </form>
                    </section>
                  </div>

                  {/* Right Column: List - Asymmetric Width (7 cols) */}
                  <div className="lg:col-span-7">
                    <AnimatePresence mode="popLayout">
                      {(() => {
                        // 1. Show ALL categories if no search query, regardless of whether they have links
                        let displayCategories = [...categories];

                        // 2. If search is active, filter categories based on their name OR their links
                        if (searchQuery) {
                          const lowerQuery = searchQuery.toLowerCase();
                          displayCategories = categories.map(cat => {
                            const matchesCategory = cat.name.toLowerCase().includes(lowerQuery);
                            const matchingLinks = (cat.links || []).filter((l: any) => 
                              l.title.toLowerCase().includes(lowerQuery) || 
                              l.url.toLowerCase().includes(lowerQuery)
                            );
                            
                            // If category matches, show all its links (or maybe just matching ones? let's show all for context)
                            // If category doesn't match, but has matching links, show category with matching links
                            if (matchesCategory) return cat;
                            if (matchingLinks.length > 0) return { ...cat, links: matchingLinks };
                            return null;
                          }).filter(Boolean) as any[];
                        }

                        const totalPages = Math.ceil(displayCategories.length / ITEMS_PER_PAGE);
                        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
                        const paginatedCategories = displayCategories.slice(startIndex, startIndex + ITEMS_PER_PAGE);

                        return (
                          <div className="space-y-12">
                            {paginatedCategories.map((cat: any, catIndex: number) => {
                              // Global index for sorting
                              const globalIndex = startIndex + catIndex;
                              const isFirst = globalIndex === 0;
                              const isLast = globalIndex === categories.length - 1;

                              return (
                                <motion.div key={cat.id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="group/category nm-flat p-10 rounded-[40px] border border-gray-100/50 dark:border-white/[0.03] relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#6ee7b7] via-cyan-500 to-transparent opacity-30" />
                                  <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100 dark:border-white/5">
                                    <div className="flex items-center gap-5">
                                      {/* Sorting Buttons for Category */}
                                      {!searchQuery && (
                                        <div className="flex flex-col gap-1 mr-2 opacity-0 group-hover/category:opacity-100 transition-opacity">
                                          <button 
                                            onClick={() => moveCategory(globalIndex, 'up')} 
                                            disabled={isFirst}
                                            className="p-1 hover:bg-[#6ee7b7]/10 rounded text-gray-400 hover:text-[#6ee7b7] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                                          >
                                            <ArrowUp size={12} strokeWidth={3} />
                                          </button>
                                          <button 
                                            onClick={() => moveCategory(globalIndex, 'down')} 
                                            disabled={isLast}
                                            className="p-1 hover:bg-[#6ee7b7]/10 rounded text-gray-400 hover:text-[#6ee7b7] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                                          >
                                            <ArrowDown size={12} strokeWidth={3} />
                                          </button>
                                        </div>
                                      )}

                                      <div className="w-1.5 h-10 bg-[#6ee7b7] rounded-full shadow-[0_0_15px_rgba(110,231,183,0.5)]" />
                                      <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white uppercase">{cat.name}</h3>
                                      <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full">{(cat.links || []).length} items</span>
                                    </div>
                                    <div className="flex gap-4 opacity-0 group-hover/category:opacity-100 transition-all duration-500 translate-x-4 group-hover/category:translate-x-0">
                                      <button onClick={() => setEditingCategory(cat)} className="w-12 h-12 nm-inset flex items-center justify-center text-gray-400 hover:text-[#6ee7b7] transition-all rounded-2xl bg-white dark:bg-[#0f0f0f]"><Edit2 size={16} /></button>
                                      <button onClick={() => handleDeleteCategory(cat.id)} className="w-12 h-12 nm-inset flex items-center justify-center text-gray-400 hover:text-red-500 transition-all rounded-2xl bg-white dark:bg-[#0f0f0f]"><Trash2 size={16} /></button>
                                    </div>
                                  </div>

                                  {/* Empty State for Links */}
                                  {(!cat.links || cat.links.length === 0) && (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 border border-dashed border-gray-200 dark:border-white/10 rounded-[28px]">
                                      <Sparkles size={24} className="mb-4 opacity-50" />
                                      <p className="text-xs font-bold uppercase tracking-widest opacity-60">暂无内容</p>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-1 gap-6">
                                    {(cat.links || []).map((link: any, linkIndex: number) => {
                                      const isLinkFirst = linkIndex === 0;
                                      const isLinkLast = linkIndex === (cat.links || []).length - 1;

                                      return (
                                        <div key={link.id} className="group flex items-center p-6 nm-inset hover:nm-flat transition-all duration-500 rounded-[28px] border border-transparent hover:border-[#6ee7b7]/10 min-h-[110px] relative overflow-hidden">
                                          <div className="absolute inset-0 bg-gradient-to-r from-[#6ee7b7]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                          
                                          {/* Sorting Buttons for Links */}
                                          {!searchQuery && (
                                            <div className="flex flex-col gap-1 mr-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                              <button 
                                                onClick={() => moveLink(globalIndex, linkIndex, 'up')} 
                                                disabled={isLinkFirst}
                                                className="p-1 hover:bg-[#6ee7b7]/10 rounded text-gray-400 hover:text-[#6ee7b7] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                                              >
                                                <ArrowUp size={10} strokeWidth={3} />
                                              </button>
                                              <button 
                                                onClick={() => moveLink(globalIndex, linkIndex, 'down')} 
                                                disabled={isLinkLast}
                                                className="p-1 hover:bg-[#6ee7b7]/10 rounded text-gray-400 hover:text-[#6ee7b7] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                                              >
                                                <ArrowDown size={10} strokeWidth={3} />
                                              </button>
                                            </div>
                                          )}

                                          <div className="flex-1 flex items-center gap-6 min-w-0 relative z-10">
                                            <div className="w-16 h-16 nm-flat flex items-center justify-center shrink-0 rounded-[20px] bg-white dark:bg-[#121212] border border-gray-50 dark:border-white/5 group-hover:scale-110 transition-transform duration-500">
                                              {link.icon ? (
                                                <img src={link.icon} className="w-9 h-9 object-contain" alt="" />
                                              ) : getFaviconUrl(link.url) ? (
                                                <img src={getFaviconUrl(link.url)} className="w-9 h-9 object-contain" alt="" />
                                              ) : (
                                                <div className="w-9 h-9 bg-[#6ee7b7]/10 rounded-xl flex items-center justify-center">
                                                  <span className="text-sm font-black text-[#6ee7b7]">{link.title[0].toUpperCase()}</span>
                                                </div>
                                              )}
                                            </div>
                                            <div className="flex-1 min-w-0 pr-4">
                                              <div className="flex items-center gap-3 mb-1">
                                                <p className="text-lg font-black text-gray-900 dark:text-white truncate tracking-tight">{link.title}</p>
                                                {link.snapshotUrl && (
                                                  <span className="flex items-center gap-1 px-2 py-0.5 bg-[#6ee7b7]/10 text-[#6ee7b7] text-[8px] font-black rounded-full uppercase tracking-widest">
                                                    <Camera size={10} /> 快照
                                                  </span>
                                                )}
                                              </div>
                                              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] truncate font-black mb-2 opacity-60 group-hover:opacity-100 transition-opacity">{new URL(link.url.startsWith('http') ? link.url : `https://${link.url}`).hostname}</p>
                                              {link.description && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 opacity-40 group-hover:opacity-100 transition-all italic leading-relaxed">{link.description}</p>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex gap-3 shrink-0 items-center opacity-0 group-hover:opacity-100 transition-all duration-500 ml-auto pl-6 border-l border-gray-100 dark:border-white/5 relative z-10">
                                            <button onClick={() => setEditingLink(link)} className="w-12 h-12 nm-flat flex items-center justify-center text-gray-400 hover:text-[#6ee7b7] transition-all rounded-2xl bg-white dark:bg-[#151515] active:scale-90"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDeleteLink(link.id)} className="w-12 h-12 nm-flat flex items-center justify-center text-gray-400 hover:text-red-500 transition-all rounded-2xl bg-white dark:bg-[#151515] active:scale-90"><Trash2 size={16} /></button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              );
                            })}

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                              <div className="flex items-center justify-center gap-8 mt-16">
                                <button 
                                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                  disabled={currentPage === 1}
                                  className="w-16 h-16 nm-flat flex items-center justify-center text-gray-400 hover:text-[#6ee7b7] disabled:opacity-10 disabled:hover:text-gray-400 transition-all rounded-3xl bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 active:scale-90"
                                >
                                  <ChevronLeft size={24} strokeWidth={2.5} />
                                </button>
                                <div className="nm-inset px-12 py-5 rounded-3xl text-[10px] font-black tracking-[0.4em] text-gray-400 bg-gray-50/50 dark:bg-black/40 border border-gray-100 dark:border-white/5">
                                  序列 <span className="text-[#6ee7b7]">{currentPage.toString().padStart(2, '0')}</span> <span className="mx-3 text-gray-300">/</span> {totalPages.toString().padStart(2, '0')}
                                </div>
                                <button 
                                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                  disabled={currentPage === totalPages}
                                  className="w-16 h-16 nm-flat flex items-center justify-center text-gray-400 hover:text-[#6ee7b7] disabled:opacity-10 disabled:hover:text-gray-400 transition-all rounded-3xl bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 active:scale-90"
                                >
                                  <ChevronRight size={24} strokeWidth={2.5} />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}
