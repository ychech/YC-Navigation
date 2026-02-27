"use client";

import { useState, useEffect } from "react";
import { Plus, Image as ImageIcon, Trash2, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

export function GalleryTab() {
  const [gallery, setGallery] = useState<any[]>([]);
  const [newGalleryImg, setNewGalleryImg] = useState({ url: "", title: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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

      {/* Upload Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 
                 dark:from-indigo-900/20 dark:to-purple-900/20
                 border border-dashed border-indigo-300 dark:border-indigo-500/30
                 p-8 text-center"
      >
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 
                       flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Upload size={28} />
          </div>
          <h3 className="text-lg font-semibold mb-2">上传图片</h3>
          <p className="text-sm text-gray-500 mb-4">支持拖拽上传或点击选择文件</p>
          
          <form onSubmit={handleAddGalleryImg} className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="图片 URL 或上传文件"
                value={newGalleryImg.url}
                onChange={(e) => setNewGalleryImg({...newGalleryImg, url: e.target.value})}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 
                         bg-white/50 dark:bg-slate-700/50"
              />
              <label className="px-4 py-3 bg-white dark:bg-slate-700 rounded-xl cursor-pointer 
                           hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-600">
                <ImageIcon size={20} className="text-indigo-500" />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            </div>
            <input
              type="text"
              placeholder="图片描述（可选）"
              value={newGalleryImg.title}
              onChange={(e) => setNewGalleryImg({...newGalleryImg, title: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 
                       bg-white/50 dark:bg-slate-700/50"
            />
            <button type="submit" disabled={!newGalleryImg.url}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white 
                       rounded-xl font-medium shadow-lg shadow-indigo-500/25 
                       hover:shadow-xl hover:shadow-indigo-500/30 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed">
              <Plus size={18} className="inline mr-2" /> 添加到画廊
            </button>
          </form>
        </div>
      </motion.div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {gallery.map((img, index) => (
          <motion.div 
            key={img.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="group relative aspect-square rounded-2xl overflow-hidden 
                     bg-gray-100 dark:bg-slate-700 shadow-lg"
          >
            <img src={img.url} alt={img.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent 
                         opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-medium truncate">{img.title || "未命名"}</p>
              </div>
              <button 
                onClick={() => setDeleteConfirm(img.id)}
                className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur text-white 
                         rounded-xl hover:bg-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {gallery.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <ImageIcon size={48} className="mx-auto mb-4 opacity-30" />
          <p>画廊为空，上传第一张图片</p>
        </div>
      )}
    </div>
  );
}
