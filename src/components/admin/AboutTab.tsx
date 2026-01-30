"use client";

import { useState, useEffect } from "react";
import { Info } from "lucide-react";
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
    <div className="max-w-2xl mx-auto space-y-12">
      <section className="nm-flat p-10 rounded-[40px] border border-gray-100/50 dark:border-white/[0.03] relative overflow-hidden">
        <h2 className="text-[11px] uppercase tracking-[0.5em] text-[#6ee7b7] font-black mb-10 flex items-center gap-4">
          <Info size={14} />
          馆主资料
        </h2>
        {editingAbout && (
          <form onSubmit={handleUpdateAbout} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[9px] uppercase tracking-[0.5em] text-gray-400 font-black ml-1 opacity-50">称谓</label>
              <input
                type="text"
                value={editingAbout.title || ""}
                onChange={(e) => setEditingAbout({...editingAbout, title: e.target.value})}
                className="w-full bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl px-6 py-5 text-sm font-bold focus:outline-none glow-border transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[9px] uppercase tracking-[0.5em] text-gray-400 font-black ml-1 opacity-50">自述</label>
              <textarea
                value={editingAbout.description || ""}
                onChange={(e) => setEditingAbout({...editingAbout, description: e.target.value})}
                className="w-full h-64 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[24px] px-6 py-6 text-sm font-medium focus:outline-none glow-border transition-all resize-none leading-relaxed"
              />
            </div>
            <button type="submit" className="w-full bg-gray-900 dark:bg-white text-white dark:text-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.4em] font-black hover:bg-[#6ee7b7] dark:hover:bg-[#6ee7b7] hover:text-white dark:hover:text-black transition-all shadow-2xl hover:shadow-[#6ee7b7]/20 active:scale-[0.98]">
              保存资料
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
