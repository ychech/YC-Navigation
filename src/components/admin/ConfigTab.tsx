"use client";

import { useState, useEffect } from "react";
import { Save, Lock, Plus, X } from "lucide-react";
import { toast } from "sonner";

export function ConfigTab() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [passwordChange, setPasswordChange] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [siteSlogan, setSiteSlogan] = useState("艺术导航");
  const [heroTitle, setHeroTitle] = useState("灵感与设计的边界");
  const [heroSubtitle, setHeroSubtitle] = useState("一个精心策划的数字档案馆");
  const [tags, setTags] = useState<string[]>(["热门", "推荐", "工具", "资源"]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    const res = await fetch("/api/config");
    const data = await res.json();
    setConfigs(data);
    
    const slogan = data.find((c: any) => c.key === "site_slogan");
    if (slogan) setSiteSlogan(slogan.value);
    
    const title = data.find((c: any) => c.key === "hero_title");
    if (title) setHeroTitle(title.value);
    
    const subtitle = data.find((c: any) => c.key === "hero_subtitle");
    if (subtitle) setHeroSubtitle(subtitle.value);
    
    const tagsConfig = data.find((c: any) => c.key === "link_tags");
    if (tagsConfig) {
      try {
        const loadedTags = JSON.parse(tagsConfig.value);
        if (Array.isArray(loadedTags)) setTags(loadedTags);
      } catch {}
    }
  };

  const handleSaveConfig = async (key: string, value: string) => {
    await fetch("/api/config", { 
      method: "POST", 
      body: JSON.stringify({ key, value }) 
    });
    toast.success("保存成功");
    fetchConfigs();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      return toast.error("两次输入的密码不一致");
    }
    const res = await fetch("/api/auth/password", {
      method: "POST",
      body: JSON.stringify(passwordChange)
    });
    if (res.ok) {
      toast.success("密码已修改");
      setPasswordChange({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      toast.error("密码修改失败");
    }
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    if (tags.includes(newTag.trim())) return toast.error("标签已存在");
    const newTags = [...tags, newTag.trim()];
    setTags(newTags);
    handleSaveConfig("link_tags", JSON.stringify(newTags));
    setNewTag("");
  };

  const handleRemoveTag = (tag: string) => {
    const newTags = tags.filter(t => t !== tag);
    setTags(newTags);
    handleSaveConfig("link_tags", JSON.stringify(newTags));
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Site Config */}
      <div className="border border-black/10 dark:border-white/10 p-6">
        <h2 className="text-lg font-light mb-6">站点配置</h2>
        <div className="space-y-4">
          {[
            { label: "站点名称", value: siteSlogan, setter: setSiteSlogan, key: "site_slogan" },
            { label: "首页标题", value: heroTitle, setter: setHeroTitle, key: "hero_title" },
            { label: "首页副标题", value: heroSubtitle, setter: setHeroSubtitle, key: "hero_subtitle" },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm text-black/50 dark:text-white/50 mb-2">{field.label}</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  className="flex-1 px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
                />
                <button 
                  onClick={() => handleSaveConfig(field.key, field.value)}
                  className="px-4 py-3 bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity"
                >
                  <Save size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="border border-black/10 dark:border-white/10 p-6">
        <h2 className="text-lg font-light mb-6">链接标签</h2>
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="新标签"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            className="flex-1 px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
          />
          <button 
            onClick={handleAddTag}
            className="px-4 py-3 border border-black/10 dark:border-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-2 px-3 py-2 border border-black/10 dark:border-white/10 text-sm">
              {tag}
              <button onClick={() => handleRemoveTag(tag)} className="text-black/30 hover:text-red-600 dark:text-white/30 dark:hover:text-red-400">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Password */}
      <div className="border border-black/10 dark:border-white/10 p-6">
        <h2 className="text-lg font-light mb-6 flex items-center gap-2">
          <Lock size={18} /> 修改密码
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <input type="password" placeholder="当前密码"
            value={passwordChange.oldPassword}
            onChange={(e) => setPasswordChange({...passwordChange, oldPassword: e.target.value})}
            className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white" required />
          <input type="password" placeholder="新密码"
            value={passwordChange.newPassword}
            onChange={(e) => setPasswordChange({...passwordChange, newPassword: e.target.value})}
            className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white" required />
          <input type="password" placeholder="确认新密码"
            value={passwordChange.confirmPassword}
            onChange={(e) => setPasswordChange({...passwordChange, confirmPassword: e.target.value})}
            className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white" required />
          <button type="submit" className="w-full py-3 bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity">
            修改密码
          </button>
        </form>
      </div>
    </div>
  );
}
