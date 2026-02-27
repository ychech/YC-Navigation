"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Code } from "lucide-react";
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
        <h2 className="text-lg font-semibold">首页展示管理</h2>
        <button
          onClick={() => { setEditingSlide(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium"
        >
          <Plus size={18} /> 新增
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs text-gray-500">#{slide.id}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => { setEditingSlide(slide); setIsModalOpen(true); }}
                  className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(slide.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <h3 className="font-medium mb-1 truncate">{slide.title}</h3>
            <p className="text-sm text-gray-500 truncate mb-2">{slide.subtitle}</p>
            {slide.codeSnippet && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Code size={12} /> 有代码片段
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-lg">
          <h2 className="text-lg font-semibold mb-4">
            {editingSlide ? "编辑" : "新建"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="标题"
              value={editingSlide?.title ?? newSlide.title}
              onChange={(e) => editingSlide 
                ? setEditingSlide({ ...editingSlide, title: e.target.value })
                : setNewSlide({ ...newSlide, title: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              required
            />
            <input
              type="text"
              placeholder="副标题"
              value={editingSlide?.subtitle ?? newSlide.subtitle}
              onChange={(e) => editingSlide 
                ? setEditingSlide({ ...editingSlide, subtitle: e.target.value })
                : setNewSlide({ ...newSlide, subtitle: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              required
            />
            <textarea
              placeholder="描述（可选）"
              value={editingSlide?.description ?? newSlide.description ?? ""}
              onChange={(e) => editingSlide 
                ? setEditingSlide({ ...editingSlide, description: e.target.value })
                : setNewSlide({ ...newSlide, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
            <textarea
              placeholder="代码片段（可选）"
              value={editingSlide?.codeSnippet ?? newSlide.codeSnippet ?? ""}
              onChange={(e) => editingSlide 
                ? setEditingSlide({ ...editingSlide, codeSnippet: e.target.value })
                : setNewSlide({ ...newSlide, codeSnippet: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 font-mono text-sm"
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
                取消
              </button>
              <button type="submit" className="flex-1 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium">
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
