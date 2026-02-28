"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Check, Info } from "lucide-react";
import { toast } from "sonner";

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  codeSnippet: string;
  isActive: boolean;
  sortOrder: number;
}

interface AboutContent {
  id?: number;
  title: string;
  description: string;
}

export function HeroSlidesTab() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [aboutContent, setAboutContent] = useState<AboutContent>({
    title: "",
    description: "",
  });
  const [useSlides, setUseSlides] = useState(true);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newSlide, setNewSlide] = useState({
    title: "",
    subtitle: "",
    description: "",
    codeSnippet: "",
    isActive: true,
  });

  useEffect(() => {
    fetchSlides();
    fetchAbout();
  }, []);

  const fetchSlides = async () => {
    try {
      const res = await fetch("/api/hero");
      const data = await res.json();
      if (Array.isArray(data)) {
        setSlides(data);
        setUseSlides(data.length > 0);
      }
    } catch {}
  };

  const fetchAbout = async () => {
    try {
      const res = await fetch("/api/about");
      const data = await res.json();
      if (data) {
        setAboutContent({
          id: data.id,
          title: data.title || "",
          description: data.description || "",
        });
      }
    } catch {}
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/hero", {
        method: "POST",
        body: JSON.stringify(newSlide),
      });
      if (res.ok) {
        toast.success("幻灯片已添加");
        setNewSlide({ title: "", subtitle: "", description: "", codeSnippet: "", isActive: true });
        setIsAdding(false);
        fetchSlides();
      }
    } catch {
      toast.error("添加失败");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;
    try {
      const res = await fetch("/api/hero", {
        method: "PUT",
        body: JSON.stringify(editingSlide),
      });
      if (res.ok) {
        toast.success("幻灯片已更新");
        setEditingSlide(null);
        fetchSlides();
      }
    } catch {
      toast.error("更新失败");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除此幻灯片吗？")) return;
    try {
      const res = await fetch(`/api/hero?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("幻灯片已删除");
        fetchSlides();
      }
    } catch {
      toast.error("删除失败");
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      const res = await fetch("/api/hero", {
        method: "PUT",
        body: JSON.stringify({ ...slide, isActive: !slide.isActive }),
      });
      if (res.ok) {
        toast.success(slide.isActive ? "已禁用" : "已启用");
        fetchSlides();
      }
    } catch {
      toast.error("操作失败");
    }
  };

  const handleSaveAbout = async () => {
    try {
      const method = aboutContent.id ? "PUT" : "POST";
      const body = aboutContent.id
        ? JSON.stringify({ id: aboutContent.id, ...aboutContent })
        : JSON.stringify(aboutContent);

      const res = await fetch("/api/about", {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (res.ok) {
        toast.success("关于内容已保存");
        fetchAbout();
      }
    } catch {
      toast.error("保存失败");
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Switch */}
      <div className="border border-black/10 dark:border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-light">显示模式</h2>
            <p className="text-sm text-black/50 dark:text-white/50 mt-1">
              选择首页下方区域显示的内容
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setUseSlides(true)}
              className={`px-4 py-2 text-sm border transition-colors ${
                useSlides
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                  : "border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              幻灯片
            </button>
            <button
              onClick={() => setUseSlides(false)}
              className={`px-4 py-2 text-sm border transition-colors ${
                !useSlides
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                  : "border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              关于内容
            </button>
          </div>
        </div>
      </div>

      {useSlides ? (
        <>
          {/* Add Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity flex items-center gap-2"
            >
              <Plus size={18} /> 添加幻灯片
            </button>
          </div>

          {/* Add Modal */}
          {isAdding && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-light mb-6">添加幻灯片</h3>
                <form onSubmit={handleAdd} className="space-y-4">
                  <input
                    type="text"
                    placeholder="标题"
                    value={newSlide.title}
                    onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                    className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="副标题"
                    value={newSlide.subtitle}
                    onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                    className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
                    required
                  />
                  <textarea
                    placeholder="描述（可选）"
                    value={newSlide.description}
                    onChange={(e) => setNewSlide({ ...newSlide, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white resize-none"
                  />
                  <textarea
                    placeholder="代码片段（可选）"
                    value={newSlide.codeSnippet}
                    onChange={(e) => setNewSlide({ ...newSlide, codeSnippet: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white resize-none font-mono text-sm"
                  />
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">
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

          {/* Edit Modal */}
          {editingSlide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-light mb-6">编辑幻灯片</h3>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <input
                    type="text"
                    placeholder="标题"
                    value={editingSlide.title}
                    onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                    className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="副标题"
                    value={editingSlide.subtitle}
                    onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                    className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
                    required
                  />
                  <textarea
                    placeholder="描述（可选）"
                    value={editingSlide.description}
                    onChange={(e) => setEditingSlide({ ...editingSlide, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white resize-none"
                  />
                  <textarea
                    placeholder="代码片段（可选）"
                    value={editingSlide.codeSnippet}
                    onChange={(e) => setEditingSlide({ ...editingSlide, codeSnippet: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white resize-none font-mono text-sm"
                  />
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setEditingSlide(null)} className="flex-1 py-3 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">
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

          {/* Slides List */}
          <div className="space-y-4">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`border p-6 transition-colors ${
                  slide.isActive
                    ? "border-black/10 dark:border-white/10"
                    : "border-black/5 dark:border-white/5 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-black/30 dark:text-white/30 font-mono">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-medium">{slide.title}</h3>
                    {!slide.isActive && (
                      <span className="text-xs px-2 py-1 border border-black/10 dark:border-white/10 text-black/40 dark:text-white/40">
                        已禁用
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(slide)}
                      className={`p-2 transition-colors ${
                        slide.isActive ? "text-green-600 dark:text-green-400" : "text-black/30 dark:text-white/30"
                      }`}
                      title={slide.isActive ? "禁用" : "启用"}
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => setEditingSlide(slide)}
                      className="p-2 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(slide.id)}
                      className="p-2 text-black/30 hover:text-red-600 dark:text-white/30 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-black/50 dark:text-white/50 mb-2">{slide.subtitle}</p>
                {slide.description && (
                  <p className="text-sm text-black/40 dark:text-white/40 line-clamp-2">{slide.description}</p>
                )}
              </div>
            ))}
          </div>

          {slides.length === 0 && (
            <div className="text-center py-16 text-black/30 dark:text-white/30 border border-black/10 dark:border-white/10">
              <p>暂无幻灯片</p>
              <p className="text-sm mt-2">点击右上角添加</p>
            </div>
          )}
        </>
      ) : (
        /* About Content Editor */
        <div className="border border-black/10 dark:border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-light">关于内容</h3>
              <p className="text-sm text-black/50 dark:text-white/50 mt-1">
                当没有幻灯片时，显示此内容
              </p>
            </div>
            <button
              onClick={handleSaveAbout}
              className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity flex items-center gap-2"
            >
              <Save size={18} /> 保存
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-black/50 dark:text-white/50 mb-2">标题</label>
              <input
                type="text"
                value={aboutContent.title}
                onChange={(e) => setAboutContent({ ...aboutContent, title: e.target.value })}
                placeholder="数字时代的灵感档案馆"
                className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>
            <div>
              <label className="block text-sm text-black/50 dark:text-white/50 mb-2">描述</label>
              <textarea
                value={aboutContent.description}
                onChange={(e) => setAboutContent({ ...aboutContent, description: e.target.value })}
                placeholder="我们相信数字空间也应当具备艺术的温度..."
                rows={8}
                className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white resize-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
