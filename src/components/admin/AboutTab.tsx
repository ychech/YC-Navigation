"use client";

import { useState, useEffect } from "react";
import { Save, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function AboutTab() {
  const [editingAbout, setEditingAbout] = useState<any>(null);

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    const res = await fetch("/api/about");
    const data = await res.json();
    setEditingAbout(data);
  };

  const handleUpdateAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/about", { method: "PUT", body: JSON.stringify(editingAbout) });
    fetchAbout();
    toast.success("内容已保存");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl"
    >
      <div className="rounded-2xl bg-white/60 dark:bg-slate-700/30 backdrop-blur 
                   border border-gray-200/50 dark:border-white/10 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 
                       flex items-center justify-center text-white">
            <FileText size={20} />
          </div>
          <h2 className="text-lg font-semibold">关于页面内容</h2>
        </div>
        
        {editingAbout && (
          <form onSubmit={handleUpdateAbout} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-500 mb-2">页面标题</label>
              <input
                type="text"
                value={editingAbout.title || ""}
                onChange={(e) => setEditingAbout({...editingAbout, title: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200/50 dark:border-white/10 
                         bg-white/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-2">页面内容</label>
              <textarea
                value={editingAbout.description || ""}
                onChange={(e) => setEditingAbout({...editingAbout, description: e.target.value})}
                rows={12}
                className="w-full px-4 py-3 rounded-xl border border-gray-200/50 dark:border-white/10 
                         bg-white/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-emerald-500/20
                         resize-none leading-relaxed"
              />
            </div>
            <button type="submit" 
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white 
                       rounded-xl font-medium shadow-lg shadow-emerald-500/25 
                       hover:shadow-xl hover:shadow-emerald-500/30 transition-all
                       flex items-center justify-center gap-2">
              <Save size={18} /> 保存内容
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
}
