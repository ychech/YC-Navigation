"use client";

import { AlertCircle } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
  onConfirm: () => void;
  type?: 'link' | 'category' | 'gallery' | 'slide';
}

export function DeleteConfirmModal({ 
  isOpen, 
  title = "确认删除？", 
  message,
  onClose, 
  onConfirm,
  type 
}: DeleteConfirmModalProps) {
  const defaultMessage = `此操作将永久删除该$${
    type === 'link' ? '链接' : 
    type === 'category' ? '分类及其所有链接' : 
    type === 'gallery' ? '图片' : 
    type === 'slide' ? '幻灯片' : '项目'
  }，无法撤销。`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="text-red-500" size={24} />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          {message || defaultMessage}
        </p>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium"
          >
            取消
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
}
