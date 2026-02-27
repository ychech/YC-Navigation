"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Trash2, Edit2, X, Search, 
  ChevronLeft, ChevronRight, 
  Image as ImageIcon,
  Command, Plus, Eye,
  ArrowUp, ArrowDown
} from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { Modal } from "./Modal";

interface Link {
  id: number;
  title: string;
  url: string;
  icon?: string;
  description?: string;
  tag?: string;
  categoryId: string;
  snapshotUrl?: string;
  clicks?: number;
}

interface Category {
  id: number;
  name: string;
  links: Link[];
}

export function LinksTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  const [newLink, setNewLink] = useState<Partial<Link>>({ title: "", url: "", icon: "", description: "", categoryId: "", snapshotUrl: "" });
  const [newCategory, setNewCategory] = useState("");
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number, type: 'link' | 'category' } | null>(null);
  
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

  const topLinks = useMemo(() => {
    const allLinks = categories.flatMap(cat => 
      (cat.links || []).map(link => ({ ...link, categoryName: cat.name }))
    );
    return allLinks
      .filter(link => (link.clicks || 0) > 0)
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
      .slice(0, 3);
  }, [categories]);

  const totalClicks = useMemo(() => {
    return categories.reduce((sum, cat) => 
      sum + (cat.links || []).reduce((linkSum, link) => linkSum + (link.clicks || 0), 0), 0
    );
  }, [categories]);

  // Handlers
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
    if (!file.type.startsWith('image/')) return toast.error('请选择图片文件');
    if (file.size > 5 * 1024 * 1024) return toast.error('文件大小不能超过5MB');

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error || '上传失败');

      if (type === 'link') {
        if (editingLink) setEditingLink({ ...editingLink, icon: data.url });
        else setNewLink({ ...newLink, icon: data.url });
      } else {
        if (editingLink) setEditingLink({ ...editingLink, snapshotUrl: data.url });
        else setNewLink({ ...newLink, snapshotUrl: data.url });
      }
      toast.success("上传成功");
    } catch {
      toast.error('上传出错');
    }
  };

  const getFaviconUrl = (url: string) => {
    try {
      if (!url || !url.includes('.')) return '';
      const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      return `https://icons.duckduckgo.com/ip3/${hostname}.ico`;
    } catch {
      return '';
    }
  };

  // Filter and pagination
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
      <DeleteConfirmModal 
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={deleteConfirm?.type === 'link' ? confirmDeleteLink : confirmDeleteCategory}
        type={deleteConfirm?.type}
      />

      {/* Category Modal */}
      <Modal isOpen={isCategoryModalOpen} onClose={() => { setIsCategoryModalOpen(false); setEditingCategory(null); }}>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">{editingCategory ? "编辑分类" : "新建分类"}</h2>
          <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory} className="space-y-4">
            <input
              type="text"
              placeholder="分类名称"
              value={editingCategory ? editingCategory.name : newCategory}
              onChange={(e) => editingCategory ? setEditingCategory({...editingCategory, name: e.target.value}) : setNewCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              required
            />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium">
                {editingCategory ? "保存" : "创建"}
              </button>
              <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg">
                取消
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Link Modal */}
      <Modal isOpen={isLinkModalOpen} onClose={() => { setIsLinkModalOpen(false); setEditingLink(null); }}>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg max-h-[80vh] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">{editingLink ? "编辑链接" : "新建链接"}</h2>
          <form onSubmit={editingLink ? handleUpdateLink : handleAddLink} className="space-y-4">
            <select
              value={editingLink ? editingLink.categoryId : newLink.categoryId}
              onChange={(e) => editingLink ? setEditingLink({...editingLink, categoryId: e.target.value}) : setNewLink({ ...newLink, categoryId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              required
            >
              <option value="">选择分类...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input
              type="text"
              placeholder="网站名称"
              value={editingLink ? editingLink.title : newLink.title}
              onChange={(e) => editingLink ? setEditingLink({...editingLink, title: e.target.value}) : setNewLink({ ...newLink, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              required
            />
            <input
              type="text"
              placeholder="网址 (https://...)"
              value={editingLink ? editingLink.url : newLink.url}
              onChange={(e) => editingLink ? setEditingLink({...editingLink, url: e.target.value}) : setNewLink({ ...newLink, url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              required
            />
            <input
              type="text"
              placeholder="描述（可选）"
              value={editingLink ? editingLink.description : newLink.description}
              onChange={(e) => editingLink ? setEditingLink({...editingLink, description: e.target.value}) : setNewLink({ ...newLink, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="图标 URL"
                value={editingLink ? (editingLink.icon || "") : newLink.icon}
                onChange={(e) => editingLink ? setEditingLink({...editingLink, icon: e.target.value}) : setNewLink({ ...newLink, icon: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
              <label className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <ImageIcon size={20} />
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'link')} />
              </label>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium">
                {editingLink ? "保存" : "创建"}
              </button>
              <button type="button" onClick={() => setIsLinkModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg">
                取消
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">总点击量</p>
          <p className="text-2xl font-semibold">{totalClicks.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">链接总数</p>
          <p className="text-2xl font-semibold">{categories.reduce((sum, cat) => sum + (cat.links?.length || 0), 0)}</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">分类数</p>
          <p className="text-2xl font-semibold">{categories.length}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="搜索链接或分类..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          />
        </div>
        <button onClick={() => { setEditingCategory(null); setIsCategoryModalOpen(true); }} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-medium hover:bg-gray-200">
          <Plus size={18} className="inline mr-1" /> 分类
        </button>
        <button onClick={() => { setEditingLink(null); setIsLinkModalOpen(true); }} className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium">
          <Plus size={18} className="inline mr-1" /> 链接
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {paginatedCategories.map((cat) => (
          <div key={cat.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{cat.name}</span>
                <span className="text-sm text-gray-500">({cat.links?.length || 0})</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setNewLink({ ...newLink, categoryId: String(cat.id) }); setEditingLink(null); setIsLinkModalOpen(true); }} className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                  <Plus size={16} />
                </button>
                <button onClick={() => { setEditingCategory(cat); setIsCategoryModalOpen(true); }} className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {(cat.links || []).map((link) => (
                <div key={link.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center shrink-0">
                    {link.icon ? (
                      <img src={link.icon} className="w-6 h-6 object-contain" alt="" />
                    ) : getFaviconUrl(link.url) ? (
                      <img src={getFaviconUrl(link.url)} className="w-6 h-6 object-contain" alt="" />
                    ) : (
                      <span className="text-sm font-bold text-gray-600">{link.title[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{link.title}</p>
                    <p className="text-sm text-gray-500 truncate">{link.url}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Eye size={14} />
                    <span>{link.clicks || 0}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingLink(link); setIsLinkModalOpen(true); }} className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDeleteLink(link.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {(!cat.links || cat.links.length === 0) && (
                <div className="p-8 text-center text-gray-500">
                  暂无链接，点击 + 添加
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="px-4 py-2 border border-gray-300 rounded-lg">
            {currentPage} / {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
