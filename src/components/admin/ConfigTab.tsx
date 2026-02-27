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
    <div className="space-y-6 max-w-2xl">
      {/* Site Config */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">站点配置</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">站点名称</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={siteSlogan}
                onChange={(e) => setSiteSlogan(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
              <button 
                onClick={() => handleSaveConfig("site_slogan", siteSlogan)}
                className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg"
              >
                <Save size={18} />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">首页标题</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
              <button 
                onClick={() => handleSaveConfig("hero_title", heroTitle)}
                className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg"
              >
                <Save size={18} />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">首页副标题</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
              <button 
                onClick={() => handleSaveConfig("hero_subtitle", heroSubtitle)}
                className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg"
              >
                <Save size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">链接标签</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="新标签"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          />
          <button 
            onClick={handleAddTag}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
              {tag}
              <button onClick={() => handleRemoveTag(tag)} className="text-gray-400 hover:text-red-500">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Password */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock size={18} /> 修改密码
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <input
            type="password"
            placeholder="当前密码"
            value={passwordChange.oldPassword}
            onChange={(e) => setPasswordChange({...passwordChange, oldPassword: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            required
          />
          <input
            type="password"
            placeholder="新密码"
            value={passwordChange.newPassword}
            onChange={(e) => setPasswordChange({...passwordChange, newPassword: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            required
          />
          <input
            type="password"
            placeholder="确认新密码"
            value={passwordChange.confirmPassword}
            onChange={(e) => setPasswordChange({...passwordChange, confirmPassword: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            required
          />
          <button type="submit" className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium">
            修改密码
          </button>
        </form>
      </div>
    </div>
  );
}
