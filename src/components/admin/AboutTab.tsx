"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
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
    <div className="max-w-2xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">关于页面内容</h2>
        {editingAbout && (
          <form onSubmit={handleUpdateAbout} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">标题</label>
              <input
                type="text"
                value={editingAbout.title || ""}
                onChange={(e) => setEditingAbout({...editingAbout, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">内容</label>
              <textarea
                value={editingAbout.description || ""}
                onChange={(e) => setEditingAbout({...editingAbout, description: e.target.value})}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 resize-none"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium flex items-center gap-2">
              <Save size={18} /> 保存
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
