"use client";

import { useState, useEffect, useMemo } from "react";
import { Trash2, Upload, ChevronLeft, ChevronRight, Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { getImageUrl } from "@/lib/image-url";

const ITEMS_PER_PAGE = 12;

interface GalleryImage {
  id: number;
  url: string;
  title?: string;
  sortOrder: number;
}

export function GalleryTab() {
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isReordering, setIsReordering] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [sortInputs, setSortInputs] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const res = await fetch("/api/gallery");
      const data = await res.json();
      setGallery(data);
      // 初始化排序输入框状态
      const inputs: Record<number, string> = {};
      data.forEach((img: GalleryImage, index: number) => {
        inputs[img.id] = String(index + 1);
      });
      setSortInputs(inputs);
      setCurrentPage(1);
    } catch (error) {
      toast.error("获取画廊数据失败");
    }
  };

  // 分页计算
  const { paginatedGallery, totalPages } = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return {
      paginatedGallery: gallery.slice(start, end),
      totalPages: Math.ceil(gallery.length / ITEMS_PER_PAGE),
    };
  }, [gallery, currentPage]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", { 
        method: "POST", 
        credentials: "include",
        body: formData 
      });
      
      const uploadData = await uploadRes.json();
      
      if (!uploadRes.ok) {
        throw new Error(uploadData.error || "上传失败");
      }

      const title = file.name.replace(/\.[^/.]+$/, "");
      const addRes = await fetch("/api/gallery", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: uploadData.url, title }) 
      });
      
      if (!addRes.ok) {
        throw new Error("添加到画廊失败");
      }
      
      toast.success("图片已上传并添加到画廊");
      fetchGallery();
    } catch (error: any) {
      toast.error(error.message || "上传失败");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const confirmDeleteGalleryImg = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/gallery?id=${deleteConfirm}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
      toast.success("图片已删除");
      setDeleteConfirm(null);
      fetchGallery();
    } catch (error) {
      toast.error("删除失败");
    }
  };

  // 处理排序输入变化
  const handleSortInputChange = (imgId: number, value: string) => {
    setSortInputs(prev => ({ ...prev, [imgId]: value }));
  };

  // 提交排序
  const handleSortSubmit = async (imgId: number, currentGlobalIndex: number) => {
    const inputValue = sortInputs[imgId];
    const newIndex = parseInt(inputValue) - 1;
    
    if (isNaN(newIndex) || newIndex === currentGlobalIndex) return;
    if (newIndex < 0 || newIndex >= gallery.length) {
      toast.error(`请输入 1-${gallery.length} 之间的数字`);
      // 重置为当前值
      setSortInputs(prev => ({ ...prev, [imgId]: String(currentGlobalIndex + 1) }));
      return;
    }

    await moveImageToIndex(currentGlobalIndex, newIndex);
  };

  // 移动图片到指定位置
  const moveImageToIndex = async (fromIndex: number, toIndex: number) => {
    if (isReordering) return;
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= gallery.length) return;

    setIsReordering(true);
    try {
      const newGallery = [...gallery];
      const [movedItem] = newGallery.splice(fromIndex, 1);
      newGallery.splice(toIndex, 0, movedItem);
      
      // 更新排序
      const updatedGallery = newGallery.map((img, i) => ({ ...img, sortOrder: i }));
      setGallery(updatedGallery);
      
      // 更新输入框值
      const newInputs: Record<number, string> = {};
      updatedGallery.forEach((img, i) => {
        newInputs[img.id] = String(i + 1);
      });
      setSortInputs(newInputs);
      
      // 保存到服务器
      await fetch("/api/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedGallery.map(img => ({ id: img.id, sortOrder: img.sortOrder })))
      });
      
      toast.success("排序已更新");
    } catch (error) {
      toast.error("排序失败");
      fetchGallery();
    } finally {
      setIsReordering(false);
    }
  };

  // 开始编辑标题
  const startEditTitle = (img: GalleryImage) => {
    setEditingId(img.id);
    setEditTitle(img.title || "");
  };

  // 保存标题
  const saveTitle = async (id: number) => {
    try {
      const res = await fetch("/api/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title: editTitle })
      });
      
      if (!res.ok) throw new Error("保存失败");
      
      toast.success("标题已更新");
      setEditingId(null);
      fetchGallery();
    } catch (error) {
      toast.error("保存失败");
    }
  };

  // 分页控制
  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="p-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        
        <span className="text-sm text-black/60 dark:text-white/60">
          第 {currentPage} / {totalPages} 页
        </span>
        
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="p-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <DeleteConfirmModal 
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDeleteGalleryImg}
        type="gallery"
      />

      {/* Upload Area */}
      <div className="border border-black/10 dark:border-white/10 p-6">
        <h2 className="text-lg font-light mb-4">上传图片</h2>
        
        <div className="border-2 border-dashed border-black/10 dark:border-white/10 p-12 text-center hover:border-black/30 dark:hover:border-white/30 transition-colors relative">
          <input
            type="file"
            id="gallery-upload"
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <label 
            htmlFor="gallery-upload"
            className={`cursor-pointer flex flex-col items-center gap-4 ${isUploading ? 'opacity-50' : ''}`}
          >
            <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
              {isUploading ? (
                <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <Upload size={32} className="text-black/40 dark:text-white/40" />
              )}
            </div>
            <div>
              <p className="text-black/60 dark:text-white/60">
                {isUploading ? "上传中..." : "点击选择图片"}
              </p>
              <p className="text-sm text-black/40 dark:text-white/40 mt-1">
                支持 JPG、PNG、GIF、WebP，最大 5MB
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Gallery Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-light">画廊列表 ({gallery.length})</h3>
          {totalPages > 1 && (
            <span className="text-sm text-black/40 dark:text-white/40">
              每页 {ITEMS_PER_PAGE} 张
            </span>
          )}
        </div>
        
        {gallery.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginatedGallery.map((img, index) => {
                const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
                
                return (
                  <div key={img.id} className="group border border-black/10 dark:border-white/10 overflow-hidden bg-black/5 dark:bg-white/5">
                    {/* Image */}
                    <div className="relative aspect-square">
                      <img 
                        src={getImageUrl(img.url)} 
                        alt={img.title || ""} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-black/30 dark:text-white/30 text-sm">加载失败</div>';
                          }
                        }}
                      />
                      
                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button 
                          onClick={() => startEditTitle(img)}
                          className="p-3 border border-white/30 text-white hover:bg-white hover:text-black transition-colors"
                          title="编辑标题"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm(img.id)}
                          className="p-3 border border-white/30 text-white hover:bg-white hover:text-black transition-colors"
                          title="删除"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      {/* Title Overlay */}
                      {img.title && editingId !== img.id && (
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/80">
                          <p className="text-white text-xs truncate">{img.title}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Edit Title Form */}
                    {editingId === img.id && (
                      <div className="p-2 bg-black dark:bg-white border-t border-black/10 dark:border-white/10">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-2 py-1 text-xs bg-transparent border border-black/20 dark:border-white/20 focus:outline-none focus:border-black dark:focus:border-white"
                          placeholder="输入标题"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveTitle(img.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <div className="flex gap-2 mt-2">
                          <button 
                            onClick={() => saveTitle(img.id)}
                            className="flex-1 py-1 text-xs bg-black text-white dark:bg-white dark:text-black hover:opacity-80"
                          >
                            保存
                          </button>
                          <button 
                            onClick={() => setEditingId(null)}
                            className="flex-1 py-1 text-xs border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Sort Control - Below Image */}
                    <div className="p-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between bg-white dark:bg-black">
                      <span className="text-xs text-black/40 dark:text-white/40">排序</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          max={gallery.length}
                          value={sortInputs[img.id] || String(globalIndex + 1)}
                          onChange={(e) => handleSortInputChange(img.id, e.target.value)}
                          onBlur={() => handleSortSubmit(img.id, globalIndex)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSortSubmit(img.id, globalIndex);
                            }
                          }}
                          className="w-10 px-1 py-1 text-center text-xs border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
                          disabled={isReordering}
                        />
                        <span className="text-xs text-black/30 dark:text-white/30">/ {gallery.length}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Pagination />
          </>
        ) : (
          <div className="text-center py-16 text-black/30 dark:text-white/30 border border-black/10 dark:border-white/10">
            <p>画廊为空</p>
            <p className="text-sm mt-2">点击上方上传区域添加图片</p>
          </div>
        )}
      </div>
    </div>
  );
}
