"use client";

import { AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const defaultMessage = `此操作将永久删除该${
    type === 'link' ? '链接' : 
    type === 'category' ? '分类及其所有链接' : 
    type === 'gallery' ? '图片' : 
    type === 'slide' ? '幻灯片' : '项目'
  }，无法撤销。`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl p-6 
                     border border-gray-200/50 dark:border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 
                          flex items-center justify-center text-white shadow-lg shadow-red-500/25">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">{title}</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              {message || defaultMessage}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-medium 
                         hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={onConfirm}
                className="flex-1 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white 
                         rounded-xl font-medium shadow-lg shadow-red-500/25 
                         hover:shadow-xl hover:shadow-red-500/30 transition-all"
              >
                确认删除
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
