"use client";

import { useState, useEffect } from "react";
import { 
  Trash2, Edit2, X, Search, 
  ChevronLeft, ChevronRight, 
  Image as ImageIcon,
  Command, Sparkles, Camera,
  ArrowUp, ArrowDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { Modal } from "./Modal";

// Type Definitions
interface Link {
  id: number;
  title: string;
  url: string;
  icon?: string;
  description?: string;
  categoryId: string;
  snapshotUrl?: string;
  order?: number;
}

interface Category {
  id: number;
  name: string;
  order?: number;
  links: Link[];
}

export function LinksTab() {
  // Data States
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 2;

  // Forms state
  const [newLink, setNewLink] = useState<Partial<Link>>({ title: "", url: "", icon: "", description: "", categoryId: "", snapshotUrl: "" });
  const [newCategory, setNewCategory] = useState("");
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number, type: 'link' | 'category' } | null>(null);
  
  // Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
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
    setIsLinkModalOpen(false);
    toast.success("链接已添加");
    fetchCategories();
  };

  const handleUpdateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;
    await fetch("/api/links", { method: "PUT", body: JSON.stringify(editingLink) });
    setEditingLink(null);
    setIsLinkModalOpen(false);
    toast.success("链接已更新");
    fetchCategories();
  };

  const handleDeleteLink = async (id: number) => {
    setDeleteConfirm({ id, type: 'link' });
  };

  const confirmDeleteLink = async () => {
    if (!deleteConfirm) return;
    await fetch(`/api/links?id=${deleteConfirm.id}`, { method: "DELETE" });
    toast.success("链接已删除");
    setDeleteConfirm(null);
    fetchCategories();
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/categories", { method: "POST", body: JSON.stringify({ name: newCategory }) });
    setNewCategory("");
    setIsCategoryModalOpen(false);
    toast.success("分类已创建");
    fetchCategories();
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    await fetch("/api/categories", { method: "PUT", body: JSON.stringify(editingCategory) });
    setEditingCategory(null);
    setIsCategoryModalOpen(false);
    toast.success("分类已更新");
    fetchCategories();
  };

  const handleDeleteCategory = async (id: number) => {
    setDeleteConfirm({ id, type: 'category' });
  };

  const confirmDeleteCategory = async () => {
    if (!deleteConfirm) return;
    await fetch(`/api/categories?id=${deleteConfirm.id}`, { method: "DELETE" });
    toast.success("分类已删除");
    setDeleteConfirm(null);
    fetchCategories();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'link' | 'snapshot') => {
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
      return `https://icons.duckduckgo.com/ip3/${hostname}.ico`;
    } catch (e) {
      return '';
    }
  };

  const openEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
  };

  const openEditLink = (link: Link) => {
    setEditingLink(link);
    setIsLinkModalOpen(true);
  };

  return (
    <div className="space-y-8 h-full flex flex-col">
      <DeleteConfirmModal 
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={deleteConfirm?.type === 'link' ? confirmDeleteLink : confirmDeleteCategory}
        type={deleteConfirm?.type}
      />

      {/* Category Modal */}
      <Modal isOpen={isCategoryModalOpen} onClose={() => { setIsCategoryModalOpen(false); setEditingCategory(null); }}>
        <section className="nm-flat p-8 rounded-[40px] border border-gray-100 dark:border-white/[0.03] slant-decor group relative overflow-hidden bg-white dark:bg-[#0f0f0f]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 dark:from-[#6ee7b7]/10 to-transparent blur-3xl pointer-events-none" />
          <h2 className="text-[11px] uppercase tracking-[0.5em] text-indigo-600 dark:text-[#6ee7b7] font-black mb-10 flex items-center gap-4">
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
                className="w-full bg-gray-50/50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl px-6 py-5 text-sm font-bold focus:outline-none glow-border transition-all text-gray-900 dark:text-white"
                required
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.4em] font-black hover:bg-indigo-600 dark:hover:bg-[#6ee7b7] dark:hover:text-black transition-all shadow-2xl hover:shadow-indigo-500/20 dark:hover:shadow-[#6ee7b7]/20 active:scale-[0.98]">
                {editingCategory ? "提交修改" : "创建节点"}
              </button>
              <button type="button" onClick={() => { setIsCategoryModalOpen(false); setEditingCategory(null); }} className="px-6 bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white rounded-2xl transition-all hover:bg-red-500/10 hover:text-red-500">
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
          </form>
        </section>
      </Modal>

      {/* Link Modal */}
      <Modal isOpen={isLinkModalOpen} onClose={() => { setIsLinkModalOpen(false); setEditingLink(null); }}>
        <section className="nm-flat p-10 rounded-[40px] border border-gray-100 dark:border-white/[0.03] group relative overflow-hidden bg-white dark:bg-[#0f0f0f]">
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-gradient-to-tl from-indigo-500/10 dark:from-[#6ee7b7]/10 to-transparent blur-3xl pointer-events-none" />
          <h2 className="text-[11px] uppercase tracking-[0.5em] text-indigo-600 dark:text-[#6ee7b7] font-black mb-10 flex items-center gap-4">
            <Command size={14} />
            {editingLink ? "重构链接" : "索引新链接"}
          </h2>
          <form onSubmit={editingLink ? handleUpdateLink : handleAddLink} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[9px] uppercase tracking-[0.5em] text-gray-400 font-black ml-1 opacity-50">节点归属</label>
              <select
                value={editingLink ? editingLink.categoryId : newLink.categoryId}
                onChange={(e) => editingLink ? setEditingLink({...editingLink, categoryId: e.target.value}) : setNewLink({ ...newLink, categoryId: e.target.value })}
                className="w-full bg-gray-50/50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl px-6 py-5 text-xs font-black tracking-widest focus:outline-none glow-border transition-all text-gray-900 dark:text-gray-300 appearance-none cursor-pointer"
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
                  className="w-full bg-gray-50/50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl px-6 py-5 text-sm font-bold focus:outline-none glow-border transition-all text-gray-900 dark:text-white"
                  required
                />
                <input
                  type="text"
                  placeholder="访问地址 (HTTPS://...)"
                  value={editingLink ? editingLink.url : newLink.url}
                  onChange={(e) => editingLink ? setEditingLink({...editingLink, url: e.target.value}) : setNewLink({ ...newLink, url: e.target.value })}
                  onBlur={(e) => fetchLinkTitle(e.target.value)}
                  className="w-full bg-gray-50/50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl px-6 py-5 text-sm font-bold focus:outline-none glow-border transition-all text-gray-900 dark:text-white"
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
                  className="flex-1 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl px-6 py-5 text-sm font-bold focus:outline-none transition-all text-gray-900 dark:text-white"
                />
                <label className="w-16 h-16 nm-flat cursor-pointer flex items-center justify-center hover:bg-indigo-500/10 dark:hover:bg-[#6ee7b7]/10 transition-all rounded-2xl border border-gray-200 dark:border-white/5 active:scale-95">
                  <ImageIcon size={24} className="text-indigo-500 dark:text-[#6ee7b7]" strokeWidth={2.5} />
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
                  className="flex-1 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl px-6 py-5 text-sm font-bold focus:outline-none transition-all text-gray-900 dark:text-white"
                />
                <label className="w-16 h-16 nm-flat cursor-pointer flex items-center justify-center hover:bg-indigo-500/10 dark:hover:bg-[#6ee7b7]/10 transition-all rounded-2xl border border-gray-200 dark:border-white/5 active:scale-95">
                  <Camera size={24} className="text-indigo-500 dark:text-[#6ee7b7]" strokeWidth={2.5} />
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
                className="w-full bg-gray-50/50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-[24px] px-6 py-6 text-sm font-medium focus:outline-none glow-border transition-all min-h-[140px] resize-none leading-relaxed text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex gap-3 pt-6">
              <button type="submit" className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.4em] font-black hover:bg-indigo-600 dark:hover:bg-[#6ee7b7] dark:hover:text-black transition-all shadow-2xl hover:shadow-indigo-500/20 dark:hover:shadow-[#6ee7b7]/20 active:scale-[0.98]">
                {editingLink ? "更新注册表" : "提交节点"}
              </button>
              <button type="button" onClick={() => { setIsLinkModalOpen(false); setEditingLink(null); }} className="px-6 bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white rounded-2xl transition-all hover:bg-red-500/10 hover:text-red-500">
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
          </form>
        </section>
      </Modal>

      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="nm-inset p-3 rounded-[32px] bg-white/50 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-white/5 flex-1">
          <div className="relative w-full group">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-[#6ee7b7] transition-colors" size={20} strokeWidth={1.5} />
            <input
              type="text"
              placeholder="搜索片段或关键词..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent pl-20 pr-8 py-6 text-xs font-black uppercase tracking-[0.3em] focus:outline-none transition-all placeholder:text-gray-400 placeholder:opacity-50 text-gray-900 dark:text-white"
            />
            <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-3">
              <span className="text-[10px] text-gray-400 font-black px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/5">ESC 清空</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setEditingCategory(null); setIsCategoryModalOpen(true); }}
            className="flex items-center gap-3 px-8 py-6 bg-gray-900 dark:bg-white text-white dark:text-black rounded-[28px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 dark:hover:bg-[#6ee7b7] hover:text-white dark:hover:text-white transition-all shadow-2xl hover:shadow-indigo-500/20 dark:hover:shadow-[#6ee7b7]/20 active:scale-95"
          >
            <Sparkles size={16} /> 创建分类
          </button>
          <button 
            onClick={() => { setEditingLink(null); setIsLinkModalOpen(true); }}
            className="flex items-center gap-3 px-8 py-6 bg-gray-900 dark:bg-white text-white dark:text-black rounded-[28px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 dark:hover:bg-[#6ee7b7] hover:text-white dark:hover:text-white transition-all shadow-2xl hover:shadow-indigo-500/20 dark:hover:shadow-[#6ee7b7]/20 active:scale-95"
          >
            <Command size={16} /> 索引链接
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <AnimatePresence mode="popLayout">
          {(() => {
            let displayCategories = [...categories];

            if (searchQuery) {
              const lowerQuery = searchQuery.toLowerCase();
              displayCategories = categories.map(cat => {
                const matchesCategory = cat.name.toLowerCase().includes(lowerQuery);
                const matchingLinks = (cat.links || []).filter((l: Link) => 
                  l.title.toLowerCase().includes(lowerQuery) || 
                  l.url.toLowerCase().includes(lowerQuery)
                );
                
                if (matchesCategory) return cat;
                if (matchingLinks.length > 0) return { ...cat, links: matchingLinks };
                return null;
              }).filter(Boolean) as Category[];
            }

            const totalPages = Math.ceil(displayCategories.length / ITEMS_PER_PAGE);
            const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
            const paginatedCategories = displayCategories.slice(startIndex, startIndex + ITEMS_PER_PAGE);

            return (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paginatedCategories.map((cat: Category, catIndex: number) => {
                  const globalIndex = startIndex + catIndex;
                  const isFirst = globalIndex === 0;
                  const isLast = globalIndex === categories.length - 1;

                  return (
                    <motion.div key={cat.id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="group/category nm-flat p-10 rounded-[40px] border border-gray-100 dark:border-white/[0.03] relative overflow-hidden h-full bg-white dark:bg-[#0f0f0f]">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-transparent dark:from-[#6ee7b7] dark:via-cyan-500 dark:to-transparent opacity-30" />
                      <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-5">
                          {!searchQuery && (
                            <div className="flex flex-col gap-1 mr-2 opacity-0 group-hover/category:opacity-100 transition-opacity">
                              <button 
                                onClick={() => moveCategory(globalIndex, 'up')} 
                                disabled={isFirst}
                                className="p-1 hover:bg-indigo-500/10 dark:hover:bg-[#6ee7b7]/10 rounded text-gray-400 hover:text-indigo-600 dark:hover:text-[#6ee7b7] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                              >
                                <ArrowUp size={12} strokeWidth={3} />
                              </button>
                              <button 
                                onClick={() => moveCategory(globalIndex, 'down')} 
                                disabled={isLast}
                                className="p-1 hover:bg-indigo-500/10 dark:hover:bg-[#6ee7b7]/10 rounded text-gray-400 hover:text-indigo-600 dark:hover:text-[#6ee7b7] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                              >
                                <ArrowDown size={12} strokeWidth={3} />
                              </button>
                            </div>
                          )}

                          <div className="w-1.5 h-10 bg-indigo-500 dark:bg-[#6ee7b7] rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)] dark:shadow-[0_0_15px_rgba(110,231,183,0.5)]" />
                          <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white uppercase">{cat.name}</h3>
                          <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full">{(cat.links || []).length} items</span>
                        </div>
                        <div className="flex gap-4 opacity-0 group-hover/category:opacity-100 transition-all duration-500 translate-x-4 group-hover/category:translate-x-0">
                          <button onClick={() => openEditCategory(cat)} className="w-12 h-12 nm-inset flex items-center justify-center text-gray-400 hover:text-indigo-600 dark:hover:text-[#6ee7b7] transition-all rounded-2xl bg-white dark:bg-[#0f0f0f]"><Edit2 size={16} /></button>
                          <button onClick={() => handleDeleteCategory(cat.id)} className="w-12 h-12 nm-inset flex items-center justify-center text-gray-400 hover:text-red-500 transition-all rounded-2xl bg-white dark:bg-[#0f0f0f]"><Trash2 size={16} /></button>
                        </div>
                      </div>

                      {(!cat.links || cat.links.length === 0) && (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400 border border-dashed border-gray-200 dark:border-white/10 rounded-[28px]">
                          <Sparkles size={24} className="mb-4 opacity-50" />
                          <p className="text-xs font-bold uppercase tracking-widest opacity-60">暂无内容</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {(cat.links || []).map((link: Link, linkIndex: number) => {
                          const isLinkFirst = linkIndex === 0;
                          const isLinkLast = linkIndex === (cat.links || []).length - 1;

                          return (
                            <div key={link.id} className="group flex items-center p-6 nm-inset hover:nm-flat transition-all duration-500 rounded-[28px] border border-transparent hover:border-indigo-500/10 dark:hover:border-[#6ee7b7]/10 min-h-[110px] relative overflow-hidden bg-white dark:bg-[#0f0f0f]">
                              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 dark:from-[#6ee7b7]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              
                              {!searchQuery && (
                                <div className="flex flex-col gap-1 mr-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                  <button 
                                    onClick={() => moveLink(globalIndex, linkIndex, 'up')} 
                                    disabled={isLinkFirst}
                                    className="p-1 hover:bg-indigo-500/10 dark:hover:bg-[#6ee7b7]/10 rounded text-gray-400 hover:text-indigo-600 dark:hover:text-[#6ee7b7] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                                  >
                                    <ArrowUp size={10} strokeWidth={3} />
                                  </button>
                                  <button 
                                    onClick={() => moveLink(globalIndex, linkIndex, 'down')} 
                                    disabled={isLinkLast}
                                    className="p-1 hover:bg-indigo-500/10 dark:hover:bg-[#6ee7b7]/10 rounded text-gray-400 hover:text-indigo-600 dark:hover:text-[#6ee7b7] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                                  >
                                    <ArrowDown size={10} strokeWidth={3} />
                                  </button>
                                </div>
                              )}

                              <div className="flex-1 flex items-center gap-6 min-w-0 relative z-10">
                                <div className="w-16 h-16 nm-flat flex items-center justify-center shrink-0 rounded-[20px] bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 group-hover:scale-110 transition-transform duration-500">
                                  {link.icon ? (
                                    <img src={link.icon} className="w-9 h-9 object-contain" alt="" />
                                  ) : getFaviconUrl(link.url) ? (
                                    <img src={getFaviconUrl(link.url)} className="w-9 h-9 object-contain" alt="" />
                                  ) : (
                                    <div className="w-9 h-9 bg-indigo-500/10 dark:bg-[#6ee7b7]/10 rounded-xl flex items-center justify-center">
                                      <span className="text-sm font-black text-indigo-600 dark:text-[#6ee7b7]">{link.title[0].toUpperCase()}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0 pr-4">
                                  <div className="flex items-center gap-3 mb-1">
                                    <p className="text-lg font-black text-gray-900 dark:text-white truncate tracking-tight">{link.title}</p>
                                    {link.snapshotUrl && (
                                      <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-500/10 dark:bg-[#6ee7b7]/10 text-indigo-600 dark:text-[#6ee7b7] text-[8px] font-black rounded-full uppercase tracking-widest">
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
                                <button onClick={() => openEditLink(link)} className="w-12 h-12 nm-flat flex items-center justify-center text-gray-400 hover:text-indigo-600 dark:hover:text-[#6ee7b7] transition-all rounded-2xl bg-white dark:bg-[#151515] active:scale-90"><Edit2 size={16} /></button>
                                <button onClick={() => handleDeleteLink(link.id)} className="w-12 h-12 nm-flat flex items-center justify-center text-gray-400 hover:text-red-500 transition-all rounded-2xl bg-white dark:bg-[#151515] active:scale-90"><Trash2 size={16} /></button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-8 mt-4 shrink-0 pt-4 border-t border-gray-100 dark:border-white/5">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="w-12 h-12 nm-flat flex items-center justify-center text-gray-400 hover:text-indigo-600 dark:hover:text-[#6ee7b7] disabled:opacity-10 disabled:hover:text-gray-400 transition-all rounded-2xl bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 active:scale-90"
                    >
                      <ChevronLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div className="nm-inset px-8 py-3 rounded-2xl text-[10px] font-black tracking-[0.4em] text-gray-400 bg-gray-50/50 dark:bg-black/40 border border-gray-100 dark:border-white/5">
                      序列 <span className="text-indigo-600 dark:text-[#6ee7b7]">{currentPage.toString().padStart(2, '0')}</span> <span className="mx-3 text-gray-300">/</span> {totalPages.toString().padStart(2, '0')}
                    </div>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="w-12 h-12 nm-flat flex items-center justify-center text-gray-400 hover:text-indigo-600 dark:hover:text-[#6ee7b7] disabled:opacity-10 disabled:hover:text-gray-400 transition-all rounded-2xl bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 active:scale-90"
                    >
                      <ChevronRight size={20} strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </AnimatePresence>
      </div>
    </div>
  );
}
