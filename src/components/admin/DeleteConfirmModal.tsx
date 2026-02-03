"use client";

import { motion, AnimatePresence } from "framer-motion";
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
  const defaultMessage = `此操作将永久移除该${
    type === 'link' ? '链接' : 
    type === 'category' ? '分类及其所有链接' : 
    type === 'gallery' ? '画廊图片' : 
    type === 'slide' ? 'Hero 幻灯片' : '项目'
  }，且无法撤销。`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-sm bg-white dark:bg-[#0f0f0f] border border-gray-100 dark:border-white/5 rounded-[32px] p-8 shadow-2xl"
          >
            <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6">
              <AlertCircle size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-8 leading-relaxed">
              {message || defaultMessage}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 py-4 text-[13px] font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                取消
              </button>
              <button 
                onClick={onConfirm}
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl text-[13px] font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
              >
                确认删除
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
