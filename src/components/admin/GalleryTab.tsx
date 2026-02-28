"use client";

import { useState, useEffect } from "react";
import { Plus, Image as ImageIcon, Trash2, Upload } from "lucide-react";
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

    const res = await fetch("/api/upload", { 
      method: "POST", 
      credentials: "include",
      body: formData 
    });
    const data = await res.json();

    setNewGalleryImg({ ...newGalleryImg, url: data.url });
    toast.success("上传成功");
  };

  const handleAddGalleryImg = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/gallery", { method: "POST", body: JSON.stringify(newGalleryImg) });
    setNewGalleryImg({ url: "", title: "" });
    toast.success("图片已添加");
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
    <div className="space-y-8">
      <DeleteConfirmModal 
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDeleteGalleryImg}
        type="gallery"
      />

      {/* Upload */}
      <div className="border border-black/10 dark:border-white/10 p-6">
        <h2 className="text-lg font-light mb-6">上传图片</h2>
        <form onSubmit={handleAddGalleryImg} className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="图片 URL"
              value={newGalleryImg.url}
              onChange={(e) => setNewGalleryImg({...newGalleryImg, url: e.target.value})}
              className="flex-1 px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
            />
            <label className="px-4 py-3 border border-black/10 dark:border-white/10 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 flex items-center transition-colors">
              <Upload size={20} />
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
          </div>
          <input
            type="text"
            placeholder="描述（可选）"
            value={newGalleryImg.title}
            onChange={(e) => setNewGalleryImg({...newGalleryImg, title: e.target.value})}
            className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
          />
          <button type="submit" disabled={!newGalleryImg.url}
            className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity disabled:opacity-30">
            添加
          </button>
        </form>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {gallery.map((img) => (
          <div key={img.id} className="group relative aspect-square border border-black/10 dark:border-white/10 overflow-hidden">
            <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={() => setDeleteConfirm(img.id)}
                className="p-3 border border-white/30 text-white hover:bg-white hover:text-black transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
            {img.title && (
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/80">
                <p className="text-white text-xs truncate">{img.title}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {gallery.length === 0 && (
        <div className="text-center py-16 text-black/30 dark:text-white/30 border border-black/10 dark:border-white/10">
          <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
          <p>画廊为空</p>
        </div>
      )}
    </div>
  );
}
