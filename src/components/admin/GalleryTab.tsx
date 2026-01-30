"use client";

import { useState, useEffect } from "react";
import { Sparkles, Image as ImageIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

export function GalleryTab() {
  const [gallery, setGallery] = useState<any[]>([]);
  const [newGalleryImg, setNewGalleryImg] = useState({ url: "", title: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    const res = await fetch("/api/gallery");
    const data = await res.json();
    setGallery(data);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    setNewGalleryImg({ ...newGalleryImg, url: data.url });
    toast.success("文件上传成功");
  };

  const handleAddGalleryImg = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/gallery", { method: "POST", body: JSON.stringify(newGalleryImg) });
    setNewGalleryImg({ url: "", title: "" });
    toast.success("图片已添加到画廊");
    fetchGallery();
  };

  const confirmDeleteGalleryImg = async () => {
    if (!deleteConfirm) return;
    await fetch(`/api/gallery?id=${deleteConfirm}`, { method: "DELETE" });
    toast.success("图片已删除");
    setDeleteConfirm(null);
    fetchGallery();
  };

  return (
    <div className="space-y-12">
      <DeleteConfirmModal 
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDeleteGalleryImg}
        type="gallery"
      />

      <section className="nm-flat p-10 rounded-[40px] border border-gray-100/50 dark:border-white/[0.03] group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#6ee7b7]/10 to-transparent blur-3xl pointer-events-none" />
        <h2 className="text-[11px] uppercase tracking-[0.5em] text-[#6ee7b7] font-black mb-10 flex items-center gap-4">
          <Sparkles size={14} />
          添加陈列
        </h2>
        <form onSubmit={handleAddGalleryImg} className="space-y-8">
          <div className="flex gap-4">
            <div className="flex-1 space-y-3">
              <label className="text-[9px] uppercase tracking-[0.5em] text-gray-400 font-black ml-1 opacity-50">图片地址</label>
              <input
                type="text"
                placeholder="输入图片URL..."
                value={newGalleryImg.url}
                onChange={(e) => setNewGalleryImg({...newGalleryImg, url: e.target.value})}
                className="w-full bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl px-6 py-5 text-sm font-bold focus:outline-none glow-border transition-all"
                required
              />
            </div>
            <div className="w-16 pt-7">
              <label className="w-16 h-[62px] nm-flat cursor-pointer flex items-center justify-center hover:bg-[#6ee7b7]/10 transition-all rounded-2xl border border-gray-100 dark:border-white/5 active:scale-95">
                <ImageIcon size={24} className="text-[#6ee7b7]" strokeWidth={2.5} />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[9px] uppercase tracking-[0.5em] text-gray-400 font-black ml-1 opacity-50">图片描述</label>
            <input
              type="text"
              placeholder="输入图片描述..."
              value={newGalleryImg.title}
              onChange={(e) => setNewGalleryImg({...newGalleryImg, title: e.target.value})}
              className="w-full bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl px-6 py-5 text-sm font-bold focus:outline-none glow-border transition-all"
            />
          </div>
          <button type="submit" className="w-full bg-gray-900 dark:bg-white text-white dark:text-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.4em] font-black hover:bg-[#6ee7b7] dark:hover:bg-[#6ee7b7] hover:text-white dark:hover:text-black transition-all shadow-2xl hover:shadow-[#6ee7b7]/20 active:scale-[0.98]">
            添加至陈列室
          </button>
        </form>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {gallery.map((img) => (
          <div key={img.id} className="group relative aspect-square rounded-[32px] overflow-hidden nm-flat">
            <img src={img.url} alt={img.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
              <button 
                onClick={() => setDeleteConfirm(img.id)}
                className="w-12 h-12 bg-white text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all scale-0 group-hover:scale-100 duration-300 delay-100"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-xs font-bold truncate">{img.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
