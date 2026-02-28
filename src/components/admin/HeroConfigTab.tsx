"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";

export function HeroConfigTab() {
  const [config, setConfig] = useState({
    hero_title: "",
    hero_subtitle: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/config");
      const data = await res.json();
      const configMap = Object.fromEntries(data.map((c: any) => [c.key, c.value]));
      setConfig({
        hero_title: configMap.hero_title || "",
        hero_subtitle: configMap.hero_subtitle || "",
      });
    } catch {}
  };

  const handleSave = async (key: string, value: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) {
        toast.success("保存成功");
      } else {
        toast.error("保存失败");
      }
    } catch {
      toast.error("保存失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="border border-black/10 dark:border-white/10 p-6">
        <h2 className="text-lg font-light mb-6">首页 Hero 配置</h2>
        <p className="text-sm text-black/50 dark:text-white/50 mb-6">
          配置首页顶部的大标题和副标题
        </p>
        
        <div className="space-y-6">
          {/* Hero Title */}
          <div>
            <label className="block text-sm text-black/50 dark:text-white/50 mb-2">首页大标题</label>
            <input
              type="text"
              value={config.hero_title}
              onChange={(e) => setConfig({ ...config, hero_title: e.target.value })}
              placeholder="灵感与设计的边界"
              className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={() => handleSave("hero_title", config.hero_title)}
                disabled={isLoading}
                className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={16} />
                保存标题
              </button>
            </div>
          </div>

          {/* Hero Subtitle */}
          <div>
            <label className="block text-sm text-black/50 dark:text-white/50 mb-2">首页副标题</label>
            <textarea
              value={config.hero_subtitle}
              onChange={(e) => setConfig({ ...config, hero_subtitle: e.target.value })}
              placeholder="一个精心策划的数字档案馆..."
              rows={3}
              className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={() => handleSave("hero_subtitle", config.hero_subtitle)}
                disabled={isLoading}
                className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={16} />
                保存副标题
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="border border-black/10 dark:border-white/10 p-6">
        <h3 className="text-sm text-black/50 dark:text-white/50 mb-4">预览</h3>
        <div className="p-8 bg-black/5 dark:bg-white/5 text-center">
          <h1 className="text-3xl md:text-4xl font-light mb-4">
            {config.hero_title || "灵感与设计的边界"}
          </h1>
          <p className="text-black/60 dark:text-white/60">
            {config.hero_subtitle || "一个精心策划的数字档案馆..."}
          </p>
        </div>
      </div>
    </div>
  );
}
