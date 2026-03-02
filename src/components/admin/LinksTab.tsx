"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, X, Search, ChevronDown, ChevronUp, ExternalLink, Image, Upload, XCircle, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { getImageUrl } from "@/lib/image-url";

interface Link {
  id: number;
  title: string;
  url: string;
  description: string;
  icon: string;
  snapshotUrl: string;
  categoryId: number;
  tags: string[];
  clicks: number;
}

interface Category {
  id: number;
  name: string;
  order: number;
  links: Link[];
}

export function LinksTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    description: "",
    icon: "",
    snapshotUrl: "",
    categoryId: 0,
    tags: [] as string[],
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "category" | "link"; id: number; name: string } | null>(null);
  const [isUploading, setIsUploading] = useState<{ type: "icon" | "snapshot"; forNewLink: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [categorySortInputs, setCategorySortInputs] = useState<Record<number, string>>({});
  const [linkSortInputs, setLinkSortInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
    
    // 初始化排序输入状态
    const catInputs: Record<number, string> = {};
    const linkInputs: Record<string, string> = {};
    data.forEach((cat: Category, catIndex: number) => {
      catInputs[cat.id] = String(catIndex + 1);
      cat.links.forEach((link, linkIndex) => {
        linkInputs[`${cat.id}-${link.id}`] = String(linkIndex + 1);
      });
    });
    setCategorySortInputs(catInputs);
    setLinkSortInputs(linkInputs);
  };

  const fetchTags = async () => {
    const res = await fetch("/api/config");
    const data = await res.json();
    const tagsConfig = data.find((c: any) => c.key === "link_tags");
    if (tagsConfig) {
      try {
        setAllTags(JSON.parse(tagsConfig.value));
      } catch {
        setAllTags([]);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "icon" | "snapshot", forNewLink: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("文件大小不能超过 5MB");
      return;
    }

    setIsUploading({ type, forNewLink });
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { 
        method: "POST", 
        credentials: "include",
        body: formData 
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "上传失败");
      }

      if (forNewLink) {
        setNewLink(prev => ({ ...prev, [type === "icon" ? "icon" : "snapshotUrl"]: data.url }));
      } else if (editingLink) {
        setEditingLink(prev => prev ? { ...prev, [type === "icon" ? "icon" : "snapshotUrl"]: data.url } : null);
      }
      
      toast.success("上传成功");
    } catch (error: any) {
      toast.error(error.message || "上传失败，请检查是否已登录");
    } finally {
      setIsUploading(null);
      e.target.value = "";
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/categories", {
      method: "POST",
      body: JSON.stringify({ name: newCategoryName }),
    });
    setNewCategoryName("");
    setIsAddingCategory(false);
    toast.success("分类已添加");
    fetchCategories();
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    await fetch("/api/categories", {
      method: "POST",
      body: JSON.stringify({ id: editingCategory.id, name: editingCategory.name }),
    });
    setEditingCategory(null);
    toast.success("分类已更新");
    fetchCategories();
  };

  const handleDeleteCategory = async () => {
    if (!deleteConfirm) return;
    await fetch(`/api/categories?id=${deleteConfirm.id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    toast.success("分类已删除");
    fetchCategories();
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await fetch("/api/links", {
        method: "POST",
        body: JSON.stringify(newLink),
      });
      setNewLink({ title: "", url: "", description: "", icon: "", snapshotUrl: "", categoryId: 0, tags: [] });
      setIsAddingLink(false);
      toast.success("链接已添加");
      fetchCategories();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await fetch("/api/links", {
        method: "PUT",
        body: JSON.stringify(editingLink),
      });
      setEditingLink(null);
      toast.success("链接已更新");
      fetchCategories();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLink = async () => {
    if (!deleteConfirm) return;
    await fetch(`/api/links?id=${deleteConfirm.id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    toast.success("链接已删除");
    fetchCategories();
  };

  // 移动分类排序
  const moveCategory = async (index: number, direction: 'up' | 'down') => {
    if (isReordering || searchQuery) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;

    await moveCategoryToIndex(index, newIndex);
  };

  // 移动分类到指定位置
  const moveCategoryToIndex = async (fromIndex: number, toIndex: number) => {
    if (isReordering || searchQuery) return;
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= categories.length) return;

    setIsReordering(true);
    try {
      const newCategories = [...categories];
      const [movedItem] = newCategories.splice(fromIndex, 1);
      newCategories.splice(toIndex, 0, movedItem);
      
      // 更新本地状态
      setCategories(newCategories);
      
      // 更新排序输入状态
      const newInputs: Record<number, string> = {};
      newCategories.forEach((cat, i) => {
        newInputs[cat.id] = String(i + 1);
      });
      setCategorySortInputs(newInputs);
      
      // 保存到服务器
      await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategories.map((cat, i) => ({ id: cat.id, sortOrder: i })))
      });
      
      toast.success("分类排序已更新");
    } catch (error) {
      toast.error("排序失败");
      fetchCategories();
    } finally {
      setIsReordering(false);
    }
  };

  // 移动链接排序
  const moveLink = async (categoryId: number, linkIndex: number, direction: 'up' | 'down') => {
    if (isReordering) return;
    
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    const newIndex = direction === 'up' ? linkIndex - 1 : linkIndex + 1;
    if (newIndex < 0 || newIndex >= category.links.length) return;

    await moveLinkToIndex(categoryId, linkIndex, newIndex);
  };

  // 移动链接到指定位置
  const moveLinkToIndex = async (categoryId: number, fromIndex: number, toIndex: number) => {
    if (isReordering) return;
    
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= category.links.length) return;

    setIsReordering(true);
    try {
      const newLinks = [...category.links];
      const [movedItem] = newLinks.splice(fromIndex, 1);
      newLinks.splice(toIndex, 0, movedItem);
      
      // 更新本地状态
      setCategories(prev => prev.map(c => 
        c.id === categoryId ? { ...c, links: newLinks } : c
      ));
      
      // 更新排序输入状态
      const newInputs: Record<string, string> = {};
      newLinks.forEach((link, i) => {
        newInputs[`${categoryId}-${link.id}`] = String(i + 1);
      });
      setLinkSortInputs(prev => ({ ...prev, ...newInputs }));
      
      // 保存到服务器
      await fetch("/api/links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLinks.map((link, i) => ({ id: link.id, sortOrder: i })))
      });
      
      toast.success("链接排序已更新");
    } catch (error) {
      toast.error("排序失败");
      fetchCategories();
    } finally {
      setIsReordering(false);
    }
  };

  const toggleCategory = (id: number) => {
    setExpandedCategories(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const openAddLinkModal = (categoryId?: number) => {
    setNewLink({
      title: "",
      url: "",
      description: "",
      icon: "",
      snapshotUrl: "",
      categoryId: categoryId || 0,
      tags: [],
    });
    setIsAddingLink(true);
  };

  const filteredCategories = categories.map(cat => ({
    ...cat,
    links: cat.links.filter(link =>
      searchQuery === "" ||
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.url.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.links.length > 0 || searchQuery === "");

  return (
    <div className="space-y-6">
      <DeleteConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={deleteConfirm?.type === "category" ? handleDeleteCategory : handleDeleteLink}
        type={deleteConfirm?.type || "link"}
        itemName={deleteConfirm?.name}
      />

      {/* Search & Add */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30" />
          <input
            type="text"
            placeholder="搜索链接..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors"
            >
              <XCircle size={18} />
            </button>
          )}
        </div>
        <button
          onClick={() => setIsAddingCategory(true)}
          className="px-4 py-3 border border-black/10 dark:border-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> 分类
        </button>
        <button
          onClick={() => openAddLinkModal()}
          className="px-4 py-3 bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity flex items-center gap-2"
        >
          <Plus size={18} /> 链接
        </button>
      </div>

      {/* Add Category Modal */}
      {isAddingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 p-8 w-full max-w-md">
            <h3 className="text-lg font-light mb-6">添加分类</h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <input
                type="text"
                placeholder="分类名称"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
                required
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsAddingCategory(false)} className="flex-1 py-3 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">
                  取消
                </button>
                <button type="submit" className="flex-1 py-3 bg-black text-white dark:bg-white dark:text-black hover:opacity-80">
                  添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Link Modal */}
      {(isAddingLink || editingLink) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-light mb-6">
              {editingLink ? "编辑链接" : "添加链接"}
            </h3>
            <form onSubmit={editingLink ? handleUpdateLink : handleAddLink} className="space-y-4">
              <input
                type="text"
                placeholder="标题"
                value={editingLink ? editingLink.title : newLink.title}
                onChange={(e) => editingLink 
                  ? setEditingLink({ ...editingLink, title: e.target.value })
                  : setNewLink({ ...newLink, title: e.target.value })
                }
                className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
                required
              />
              <input
                type="url"
                placeholder="URL"
                value={editingLink ? editingLink.url : newLink.url}
                onChange={(e) => editingLink
                  ? setEditingLink({ ...editingLink, url: e.target.value })
                  : setNewLink({ ...newLink, url: e.target.value })
                }
                className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
                required
              />
              <textarea
                placeholder="描述"
                value={editingLink ? editingLink.description : newLink.description}
                onChange={(e) => editingLink
                  ? setEditingLink({ ...editingLink, description: e.target.value })
                  : setNewLink({ ...newLink, description: e.target.value })
                }
                rows={2}
                className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white resize-none"
              />
              
              {/* Icon */}
              <div className="space-y-2">
                <label className="block text-sm text-black/50 dark:text-white/50">图标</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="图标地址或上传"
                    value={editingLink ? editingLink.icon : newLink.icon}
                    onChange={(e) => editingLink
                      ? setEditingLink({ ...editingLink, icon: e.target.value })
                      : setNewLink({ ...newLink, icon: e.target.value })
                    }
                    className="flex-1 px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
                  />
                  <label className={`px-4 py-3 border border-black/10 dark:border-white/10 cursor-pointer flex items-center transition-colors ${
                    isUploading?.type === "icon" && isUploading?.forNewLink === !editingLink
                      ? "opacity-50 cursor-not-allowed" 
                      : "hover:bg-black/5 dark:hover:bg-white/5"
                  }`}>
                    {isUploading?.type === "icon" && isUploading?.forNewLink === !editingLink ? (
                      <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                      <Upload size={18} />
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, "icon", !editingLink)}
                      disabled={isUploading !== null}
                    />
                  </label>
                  {(editingLink?.icon || newLink.icon) && (
                    <img 
                      src={getImageUrl(editingLink ? editingLink.icon : newLink.icon)} 
                      alt="icon" 
                      className="w-12 h-12 object-contain border border-black/10 dark:border-white/10"
                      onError={(e) => {
                        console.error("Icon load error:", editingLink?.icon || newLink.icon);
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Snapshot */}
              <div className="space-y-2">
                <label className="block text-sm text-black/50 dark:text-white/50">截图</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="截图地址或上传"
                    value={editingLink ? editingLink.snapshotUrl : newLink.snapshotUrl}
                    onChange={(e) => editingLink
                      ? setEditingLink({ ...editingLink, snapshotUrl: e.target.value })
                      : setNewLink({ ...newLink, snapshotUrl: e.target.value })
                    }
                    className="flex-1 px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
                  />
                  <label className={`px-4 py-3 border border-black/10 dark:border-white/10 cursor-pointer flex items-center transition-colors ${
                    isUploading?.type === "snapshot" && isUploading?.forNewLink === !editingLink
                      ? "opacity-50 cursor-not-allowed" 
                      : "hover:bg-black/5 dark:hover:bg-white/5"
                  }`}>
                    {isUploading?.type === "snapshot" && isUploading?.forNewLink === !editingLink ? (
                      <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                      <Upload size={18} />
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, "snapshot", !editingLink)}
                      disabled={isUploading !== null}
                    />
                  </label>
                  {(editingLink?.snapshotUrl || newLink.snapshotUrl) && (
                    <img 
                      src={getImageUrl(editingLink ? editingLink.snapshotUrl : newLink.snapshotUrl)} 
                      alt="snapshot" 
                      className="w-20 h-12 object-cover border border-black/10 dark:border-white/10"
                      onError={(e) => {
                        console.error("Snapshot load error:", editingLink?.snapshotUrl || newLink.snapshotUrl);
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>
              </div>

              <select
                value={editingLink ? editingLink.categoryId : newLink.categoryId}
                onChange={(e) => editingLink
                  ? setEditingLink({ ...editingLink, categoryId: parseInt(e.target.value) })
                  : setNewLink({ ...newLink, categoryId: parseInt(e.target.value) })
                }
                className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
                required
              >
                <option value={0}>选择分类</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              {/* Tags */}
              <div>
                <label className="block text-sm text-black/50 dark:text-white/50 mb-2">标签</label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const currentTags = editingLink ? editingLink.tags : newLink.tags;
                        const newTags = currentTags?.includes(tag)
                          ? currentTags.filter(t => t !== tag)
                          : [...(currentTags || []), tag];
                        editingLink
                          ? setEditingLink({ ...editingLink, tags: newTags })
                          : setNewLink({ ...newLink, tags: newTags });
                      }}
                      className={`px-3 py-1 text-sm border transition-colors ${
                        (editingLink ? editingLink.tags : newLink.tags)?.includes(tag)
                          ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                          : "border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => { setIsAddingLink(false); setEditingLink(null); }} 
                  className="flex-1 py-3 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-black text-white dark:bg-white dark:text-black hover:opacity-80 disabled:opacity-50"
                >
                  {isSubmitting ? "保存中..." : (editingLink ? "保存" : "添加")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-4">
        {filteredCategories.map((category) => (
          <div key={category.id} className="border border-black/10 dark:border-white/10">
            {/* Category Header */}
            <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5">
              {editingCategory?.id === category.id ? (
                <form onSubmit={handleUpdateCategory} className="flex items-center gap-3 flex-1">
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="flex-1 px-3 py-2 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
                    autoFocus
                  />
                  <button type="submit" className="p-2 text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white" title="保存">
                    <Edit2 size={16} />
                  </button>
                  <button type="button" onClick={() => setEditingCategory(null)} className="p-2 text-black/30 hover:text-black dark:text-white/30 dark:hover:text-white">
                    <X size={16} />
                  </button>
                </form>
              ) : (
                <>
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    {expandedCategories.includes(category.id) ? (
                      <ChevronUp size={18} className="text-black/40 dark:text-white/40" />
                    ) : (
                      <ChevronDown size={18} className="text-black/40 dark:text-white/40" />
                    )}
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm text-black/40 dark:text-white/40">({category.links.length})</span>
                  </button>
                  <div className="flex items-center gap-1">
                    {/* Category sort input */}
                    {!searchQuery && (
                      <div className="flex items-center gap-1 mr-2">
                        <input
                          type="number"
                          min={1}
                          max={categories.length}
                          value={categorySortInputs[category.id] || ''}
                          onChange={(e) => {
                            setCategorySortInputs(prev => ({ ...prev, [category.id]: e.target.value }));
                          }}
                          onBlur={(e) => {
                            const newIndex = parseInt(e.target.value) - 1;
                            const currentIndex = categories.findIndex(c => c.id === category.id);
                            if (!isNaN(newIndex) && newIndex !== currentIndex && newIndex >= 0 && newIndex < categories.length) {
                              moveCategoryToIndex(currentIndex, newIndex);
                            } else {
                              // 重置为当前值
                              setCategorySortInputs(prev => ({ ...prev, [category.id]: String(currentIndex + 1) }));
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const newIndex = parseInt((e.target as HTMLInputElement).value) - 1;
                              const currentIndex = categories.findIndex(c => c.id === category.id);
                              if (!isNaN(newIndex) && newIndex !== currentIndex && newIndex >= 0 && newIndex < categories.length) {
                                moveCategoryToIndex(currentIndex, newIndex);
                              }
                            }
                          }}
                          className="w-10 px-1 py-1 text-center text-xs border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
                          title="输入排序位置"
                          disabled={isReordering}
                        />
                        <span className="text-xs text-black/30 dark:text-white/30">/</span>
                        <span className="text-xs text-black/30 dark:text-white/30 w-4">{categories.length}</span>
                      </div>
                    )}
                    {/* Add link to this category */}
                    <button
                      type="button"
                      onClick={() => openAddLinkModal(category.id)}
                      className="p-2 text-black/30 hover:text-black dark:text-white/30 dark:hover:text-white transition-colors"
                      title="在此分类添加链接"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCategory(category)}
                      className="p-2 text-black/30 hover:text-black dark:text-white/30 dark:hover:text-white transition-colors"
                      title="编辑分类"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm({ type: "category", id: category.id, name: category.name })}
                      className="p-2 text-black/30 hover:text-red-600 dark:text-white/30 dark:hover:text-red-400 transition-colors"
                      title="删除分类"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Links */}
            {expandedCategories.includes(category.id) && (
              <div className="divide-y divide-black/5 dark:divide-white/5">
                {category.links.length === 0 ? (
                  <div className="p-8 text-center text-black/30 dark:text-white/30">
                    暂无链接
                    <button
                      onClick={() => openAddLinkModal(category.id)}
                      className="ml-2 text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white underline"
                    >
                      添加一个
                    </button>
                  </div>
                ) : (
                  category.links.map((link, linkIndex) => (
                    <div key={link.id} className="flex items-center gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                      {/* Link reorder */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <input
                          type="number"
                          min={1}
                          max={category.links.length}
                          value={linkSortInputs[`${category.id}-${link.id}`] || ''}
                          onChange={(e) => {
                            setLinkSortInputs(prev => ({ ...prev, [`${category.id}-${link.id}`]: e.target.value }));
                          }}
                          onBlur={(e) => {
                            const newIndex = parseInt(e.target.value) - 1;
                            if (!isNaN(newIndex) && newIndex !== linkIndex && newIndex >= 0 && newIndex < category.links.length) {
                              moveLinkToIndex(category.id, linkIndex, newIndex);
                            } else {
                              // 重置为当前值
                              setLinkSortInputs(prev => ({ ...prev, [`${category.id}-${link.id}`]: String(linkIndex + 1) }));
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const newIndex = parseInt((e.target as HTMLInputElement).value) - 1;
                              if (!isNaN(newIndex) && newIndex !== linkIndex && newIndex >= 0 && newIndex < category.links.length) {
                                moveLinkToIndex(category.id, linkIndex, newIndex);
                              }
                            }
                          }}
                          className="w-8 px-1 py-1 text-center text-xs border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
                          title="输入排序位置"
                          disabled={isReordering}
                        />
                        <span className="text-xs text-black/30 dark:text-white/30">/</span>
                        <span className="text-xs text-black/30 dark:text-white/30 w-4">{category.links.length}</span>
                      </div>
                      
                      {/* Icon */}
                      {link.icon && (
                        <img src={getImageUrl(link.icon)} alt="" className="w-10 h-10 object-contain flex-shrink-0" />
                      )}
                      
                      {/* Snapshot */}
                      {link.snapshotUrl && (
                        <img src={getImageUrl(link.snapshotUrl)} alt="" className="w-16 h-10 object-cover flex-shrink-0 border border-black/10 dark:border-white/10" />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-medium truncate">{link.title}</h4>
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-black/30 hover:text-black dark:text-white/30 dark:hover:text-white">
                            <ExternalLink size={14} />
                          </a>
                        </div>
                        <p className="text-sm text-black/50 dark:text-white/50 truncate">{link.description}</p>
                        {link.tags?.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {link.tags.map((tag) => (
                              <span key={tag} className="text-xs px-2 py-0.5 border border-black/10 dark:border-white/10 text-black/40 dark:text-white/40">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-black/30 dark:text-white/30">
                        {link.clicks} 次点击
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setEditingLink(link)}
                          className="p-2 text-black/30 hover:text-black dark:text-white/30 dark:hover:text-white"
                          title="编辑链接"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm({ type: "link", id: link.id, name: link.title })}
                          title="删除链接"
                          className="p-2 text-black/30 hover:text-red-600 dark:text-white/30 dark:hover:text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-16 text-black/30 dark:text-white/30 border border-black/10 dark:border-white/10">
          <p>没有找到匹配的结果</p>
        </div>
      )}
    </div>
  );
}
