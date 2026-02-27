"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Sparkles, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { Modal } from "./Modal";

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string | null;
  codeSnippet: string | null;
  isActive: boolean;
}

export function HeroTab() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [newSlide, setNewSlide] = useState<Partial<HeroSlide>>({
    title: "",
    subtitle: "",
    description: "",
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
    const body = isEdit && editingSlide ? {
      id: editingSlide.id,
      title: editingSlide.title,
      subtitle: editingSlide.subtitle,
      description: editingSlide.description,
      codeSnippet: editingSlide.codeSnippet,
      isActive: editingSlide.isActive,
    } : newSlide;

    try {
      await fetch("/api/hero", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      toast.success(isEdit ? "更新成功" : "创建成功");
      setIsModalOpen(false);
      setEditingSlide(null);
      setNewSlide({ title: "", subtitle: "", description: "", codeSnippet: "", isActive: true });
      fetchSlides();
    } catch {
      toast.error("操作失败");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await fetch(`/api/hero?id=${deleteConfirm}`, { method: "DELETE" });
    toast.success("删除成功");
    setDeleteConfirm(null);
    fetchSlides();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 
                       flex items-center justify-center text-white">
            <Monitor size={20} />
          </div>
          <h2 className="text-lg font-semibold">首页幻灯片管理</h2>
        </div>
        <button
          onClick={() => { setEditingSlide(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 
                   text-white rounded-xl font-medium shadow-lg shadow-violet-500/25 
                   hover:shadow-xl hover:shadow-violet-500/30 transition-all"
        >
          <Plus size={18} /> 新建幻灯片
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence>
          {slides.map((slide, index) => (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="group relative rounded-2xl bg-white/60 dark:bg-slate-700/30 backdrop-blur 
                       border border-gray-200/50 dark:border-white/10 p-5
                       hover:shadow-lg hover:shadow-violet-500/10 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-medium text-gray-400">#{slide.id}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingSlide(slide); setIsModalOpen(true); }}
                    className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => setDeleteConfirm(slide.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-lg mb-1 truncate">{slide.title}</h3>
              <p className="text-sm text-gray-500 mb-3 truncate">{slide.subtitle}</p>
              
              {slide.codeSnippet && (
                <div className="p-3 rounded-lg bg-gray-100 dark:bg-slate-800/50 
                             border border-gray-200/50 dark:border-white/5">
                  <code className="text-xs text-violet-600 dark:text-violet-400 font-mono line-clamp-2">
                    {slide.codeSnippet}
                  </code>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {slides.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Sparkles size={48} className="mx-auto mb-4 opacity-30" />
          <p>暂无幻灯片，点击上方创建</p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/50 
                     dark:border-white/10 shadow-2xl max-w-lg">
          <h2 className="text-xl font-semibold mb-5">
            {editingSlide ? "编辑幻灯片" : "新建幻灯片"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="标题" required
              value={editingSlide?.title ?? newSlide.title}
              onChange={(e) => editingSlide 
                ? setEditingSlide({ ...editingSlide, title: e.target.value })
                : setNewSlide({ ...newSlide, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200/50 dark:border-white/10 
                       bg-gray-50/50 dark:bg-slate-700/50" />
            <input type="text" placeholder="副标题" required
              value={editingSlide?.subtitle ?? newSlide.subtitle}
              onChange={(e) => editingSlide 
                ? setEditingSlide({ ...editingSlide, subtitle: e.target.value })
                : setNewSlide({ ...newSlide, subtitle: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200/50 dark:border-white/10 
                       bg-gray-50/50 dark:bg-slate-700/50" />
            <textarea placeholder="描述（可选）" rows={3}
              value={editingSlide?.description ?? newSlide.description ?? ""}
              onChange={(e) => editingSlide 
                ? setEditingSlide({ ...editingSlide, description: e.target.value })
                : setNewSlide({ ...newSlide, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200/50 dark:border-white/10 
                       bg-gray-50/50 dark:bg-slate-700/50 resize-none" />
            <textarea placeholder="代码片段（可选）" rows={4}
              value={editingSlide?.codeSnippet ?? newSlide.codeSnippet ?? ""}
              onChange={(e) => editingSlide 
                ? setEditingSlide({ ...editingSlide, codeSnippet: e.target.value })
                : setNewSlide({ ...newSlide, codeSnippet: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200/50 dark:border-white/10 
                       bg-gray-50/50 dark:bg-slate-700/50 font-mono text-sm resize-none" />
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} 
                className="flex-1 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                取消
              </button>
              <button type="submit" 
                className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white 
                         rounded-xl font-medium shadow-lg shadow-violet-500/25">
                保存
              </button>
            </div>
          </form>
        </div>
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
