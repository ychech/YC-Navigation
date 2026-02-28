"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, GripVertical, X, Search, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

interface Link {
  id: number;
  title: string;
  url: string;
  description: string;
  categoryId: number;
  tags: string[];
  clickCount: number;
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
    categoryId: 0,
    tags: [] as string[],
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "category" | "link"; id: number; name: string } | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
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
    await fetch("/api/links", {
      method: "POST",
      body: JSON.stringify(newLink),
    });
    setNewLink({ title: "", url: "", description: "", categoryId: 0, tags: [] });
    setIsAddingLink(false);
    toast.success("链接已添加");
    fetchCategories();
  };

  const handleUpdateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;
    await fetch("/api/links", {
      method: "POST",
      body: JSON.stringify(editingLink),
    });
    setEditingLink(null);
    toast.success("链接已更新");
    fetchCategories();
  };

  const handleDeleteLink = async () => {
    if (!deleteConfirm) return;
    await fetch(`/api/links?id=${deleteConfirm.id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    toast.success("链接已删除");
    fetchCategories();
  };

  const toggleCategory = (id: number) => {
    setExpandedCategories(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
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
            className="w-full pl-12 pr-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
          />
        </div>
        <button
          onClick={() => setIsAddingCategory(true)}
          className="px-4 py-3 border border-black/10 dark:border-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> 分类
        </button>
        <button
          onClick={() => setIsAddingLink(true)}
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

      {/* Add Link Modal */}
      {isAddingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-light mb-6">添加链接</h3>
            <form onSubmit={handleAddLink} className="space-y-4">
              <input
                type="text"
                placeholder="标题"
                value={newLink.title}
                onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
                required
              />
              <input
                type="url"
                placeholder="URL"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
                required
              />
              <textarea
                placeholder="描述"
                value={newLink.description}
                onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white resize-none"
              />
              <select
                value={newLink.categoryId}
                onChange={(e) => setNewLink({ ...newLink, categoryId: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
                required
              >
                <option value={0}>选择分类</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const tags = newLink.tags.includes(tag)
                        ? newLink.tags.filter(t => t !== tag)
                        : [...newLink.tags, tag];
                      setNewLink({ ...newLink, tags });
                    }}
                    className={`px-3 py-1 text-sm border transition-colors ${
                      newLink.tags.includes(tag)
                        ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                        : "border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAddingLink(false)} className="flex-1 py-3 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">
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

      {/* Edit Link Modal */}
      {editingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-light mb-6">编辑链接</h3>
            <form onSubmit={handleUpdateLink} className="space-y-4">
              <input
                type="text"
                placeholder="标题"
                value={editingLink.title}
                onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
                required
              />
              <input
                type="url"
                placeholder="URL"
                value={editingLink.url}
                onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
                required
              />
              <textarea
                placeholder="描述"
                value={editingLink.description}
                onChange={(e) => setEditingLink({ ...editingLink, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white resize-none"
              />
              <select
                value={editingLink.categoryId}
                onChange={(e) => setEditingLink({ ...editingLink, categoryId: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const tags = editingLink.tags?.includes(tag)
                        ? editingLink.tags.filter(t => t !== tag)
                        : [...(editingLink.tags || []), tag];
                      setEditingLink({ ...editingLink, tags });
                    }}
                    className={`px-3 py-1 text-sm border transition-colors ${
                      editingLink.tags?.includes(tag)
                        ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                        : "border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingLink(null)} className="flex-1 py-3 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">
                  取消
                </button>
                <button type="submit" className="flex-1 py-3 bg-black text-white dark:bg-white dark:text-black hover:opacity-80">
                  保存
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
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="flex-1 px-3 py-2 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
                    autoFocus
                  />
                  <button type="submit" className="p-2 text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white">
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
                    <button
                      onClick={() => setEditingCategory(category)}
                      className="p-2 text-black/30 hover:text-black dark:text-white/30 dark:hover:text-white transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ type: "category", id: category.id, name: category.name })}
                      className="p-2 text-black/30 hover:text-red-600 dark:text-white/30 dark:hover:text-red-400 transition-colors"
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
                  </div>
                ) : (
                  category.links.map((link) => (
                    <div key={link.id} className="flex items-center gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
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
                        {link.clickCount} 次点击
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingLink(link)}
                          className="p-2 text-black/30 hover:text-black dark:text-white/30 dark:hover:text-white"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: "link", id: link.id, name: link.title })}
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
