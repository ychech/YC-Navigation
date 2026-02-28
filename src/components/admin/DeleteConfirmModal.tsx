"use client";

import { AlertTriangle, X } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: "category" | "link" | "gallery";
  itemName?: string;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, type, itemName }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  const messages = {
    category: "删除分类将同时删除该分类下的所有链接。此操作不可撤销。",
    link: "确定要删除此链接吗？此操作不可撤销。",
    gallery: "确定要删除此图片吗？此操作不可撤销。",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 p-8 max-w-md w-full mx-4">
        <div className="flex items-start gap-4">
          <div className="p-2 border border-red-500/30 text-red-500">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-light mb-2">确认删除</h3>
            {itemName && (
              <p className="text-sm text-black/70 dark:text-white/70 mb-2 font-medium">
                「{itemName}」
              </p>
            )}
            <p className="text-sm text-black/50 dark:text-white/50">
              {messages[type]}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 mt-8">
          <button 
            onClick={onClose}
            className="flex-1 py-3 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            取消
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
}
