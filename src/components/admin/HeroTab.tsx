"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Trash2, Edit2, X, Terminal, Sparkles, Code
} from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { Modal } from "./Modal";
import { motion, AnimatePresence } from "framer-motion";

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  codeSnippet: string | null;
  isActive: boolean;
  sortOrder: number;
}

export function HeroTab() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // New slide state
  const [newSlide, setNewSlide] = useState<Partial<HeroSlide>>({
    title: "",
    subtitle: "",
    codeSnippet: "",
    isActive: true
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    const res = await fetch("/api/hero");
    const data = await res.json();
    setSlides(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!editingSlide;
    const url = "/api/hero";
    const method = isEdit ? "PUT" : "POST";
    const body = isEdit ? editingSlide : newSlide;

    try {
      await fetch(url, {
        method,
        body: JSON.stringify(body),
      });
      toast.success(isEdit ? "更新成功" : "创建成功");
      setIsModalOpen(false);
      setEditingSlide(null);
      setNewSlide({ title: "", subtitle: "", codeSnippet: "", isActive: true });
      fetchSlides();
    } catch (error) {
      toast.error("操作失败");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await fetch(`/api/hero?id=${deleteConfirm}`, { method: "DELETE" });
      toast.success("删除成功");
      setDeleteConfirm(null);
      fetchSlides();
    } catch (error) {
      toast.error("删除失败");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <Terminal className="text-indigo-600 dark:text-[#6ee7b7]" />
          HERO 轮播管理
        </h2>
        <button
          onClick={() => { setEditingSlide(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:bg-indigo-600 dark:hover:bg-[#6ee7b7] transition-colors"
        >
          <Plus size={18} /> 新增 Slide
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slides.map((slide) => (
          <motion.div
            key={slide.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative bg-white dark:bg-[#0f0f0f] border border-gray-100 dark:border-white/5 rounded-3xl p-6 overflow-hidden hover:border-indigo-500/30 dark:hover:border-[#6ee7b7]/30 transition-colors shadow-sm dark:shadow-none"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button
                onClick={() => { setEditingSlide(slide); setIsModalOpen(true); }}
                className="p-2 bg-gray-100 dark:bg-white/10 rounded-lg hover:bg-indigo-600 dark:hover:bg-white text-gray-500 dark:text-white hover:text-white dark:hover:text-black transition-colors"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => setDeleteConfirm(slide.id)}
                className="p-2 bg-gray-100 dark:bg-white/10 rounded-lg hover:bg-red-500 text-gray-500 dark:text-white hover:text-white transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-[10px] text-indigo-600 dark:text-[#6ee7b7] font-mono tracking-widest uppercase">Slide #{slide.id}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">{slide.title}</h3>
              </div>
              
              <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 min-h-[40px]">{slide.subtitle}</p>
              
              {slide.codeSnippet && (
                <div className="bg-gray-50 dark:bg-black/50 rounded-xl p-3 border border-gray-100 dark:border-white/5 font-mono text-[10px] text-gray-500 truncate">
                  <Code size={12} className="inline mr-2" />
                  {slide.codeSnippet}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <section className="bg-white dark:bg-[#0f0f0f] border border-gray-100 dark:border-white/10 rounded-3xl p-8 w-full max-w-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 dark:bg-[#6ee7b7]/10 blur-3xl pointer-events-none" />
          
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <Sparkles size={18} className="text-indigo-600 dark:text-[#6ee7b7]" />
            {editingSlide ? "编辑 Slide" : "新建 Slide"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs text-gray-500 font-bold uppercase tracking-widest">标题</label>
              <input
                type="text"
                value={editingSlide?.title ?? newSlide.title}
                onChange={(e) => editingSlide 
                  ? setEditingSlide({ ...editingSlide, title: e.target.value })
                  : setNewSlide({ ...newSlide, title: e.target.value })
                }
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500/50 dark:focus:border-[#6ee7b7]/50 transition-colors"
                placeholder="例如: FUTURE & ART"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-500 font-bold uppercase tracking-widest">副标题 / 描述</label>
              <textarea
                value={editingSlide?.subtitle ?? newSlide.subtitle}
                onChange={(e) => editingSlide 
                  ? setEditingSlide({ ...editingSlide, subtitle: e.target.value })
                  : setNewSlide({ ...newSlide, subtitle: e.target.value })
                }
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500/50 dark:focus:border-[#6ee7b7]/50 transition-colors min-h-[100px]"
                placeholder="主要描述文本..."
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-500 font-bold uppercase tracking-widest">代码片段 (可选)</label>
              <textarea
                value={editingSlide?.codeSnippet ?? newSlide.codeSnippet ?? ""}
                onChange={(e) => editingSlide 
                  ? setEditingSlide({ ...editingSlide, codeSnippet: e.target.value })
                  : setNewSlide({ ...newSlide, codeSnippet: e.target.value })
                }
                className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-indigo-600 dark:text-[#6ee7b7] font-mono text-sm focus:outline-none focus:border-indigo-500/50 dark:focus:border-[#6ee7b7]/50 transition-colors min-h-[120px]"
                placeholder="const future = new Art();"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 rounded-xl bg-gray-900 dark:bg-[#6ee7b7] text-white dark:text-black font-bold hover:bg-indigo-600 dark:hover:bg-[#5cdcae] transition-colors"
              >
                保存
              </button>
            </div>
          </form>
        </section>
      </Modal>

      <DeleteConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        type="slide" 
      />
    </div>
  );
}
