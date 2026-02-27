"use client";

import { useState, useEffect } from "react";
import { Plus, Image as ImageIcon, Trash2 } from "lucide-react";
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
    <div className="space-y-6">
      <DeleteConfirmModal 
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDeleteGalleryImg}
        type="gallery"
      />

      {/* Add Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">添加图片</h2>
        <form onSubmit={handleAddGalleryImg} className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="图片 URL"
              value={newGalleryImg.url}
              onChange={(e) => setNewGalleryImg({...newGalleryImg, url: e.target.value})}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              required
            />
            <label className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 flex items-center">
              <ImageIcon size={20} />
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
          </div>
          <input
            type="text"
            placeholder="图片描述（可选）"
            value={newGalleryImg.title}
            onChange={(e) => setNewGalleryImg({...newGalleryImg, title: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          />
          <button type="submit" className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium">
            <Plus size={18} className="inline mr-1" /> 添加
          </button>
        </form>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {gallery.map((img) => (
          <div key={img.id} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={() => setDeleteConfirm(img.id)}
                className="p-2 bg-white text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
            {img.title && (
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60">
                <p className="text-white text-xs truncate">{img.title}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {gallery.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          暂无图片，点击上方添加
        </div>
      )}
    </div>
  );
}
