"use client";

import { useState, useEffect, useMemo } from "react";
import { Settings, Lock, Trash2, LayoutDashboard, Star, Tag, Plus } from "lucide-react";
import { toast } from "sonner";

// 后台标题配置项
const ADMIN_TITLE_KEYS = [
  { key: "admin_title_links", label: "链接管理", default: "链接管理" },
  { key: "admin_title_gallery", label: "图库管理", default: "图库管理" },
  { key: "admin_title_about", label: "关于页面", default: "关于页面" },
  { key: "admin_title_config", label: "系统配置", default: "系统配置" },
  { key: "admin_title_hero", label: "首页轮播", default: "首页轮播" },
];

interface Link {
  id: number;
  title: string;
  url: string;
  description: string | null;
  icon: string | null;
  snapshotUrl: string | null;
  clicks: number;
  categoryId: number;
}

export function ConfigTab() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [passwordChange, setPasswordChange] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [adminTitles, setAdminTitles] = useState<Record<string, string>>({});
  const [siteSlogan, setSiteSlogan] = useState("ART.NAV");
  
  // 精选管理
  const [allLinks, setAllLinks] = useState<Link[]>([]);
  const [featuredIds, setFeaturedIds] = useState<number[]>([]);
  
  // 标签管理
  const [tags, setTags] = useState<string[]>(["热门", "推荐", "官方", "工具", "资源", "社区", "学习", "设计", "开发"]);
  const [newTag, setNewTag] = useState("");
  
  // 搜索
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchConfigs();
    fetchLinks();
  }, []);

  const fetchConfigs = async () => {
    const res = await fetch("/api/config");
    const data = await res.json();
    setConfigs(data);
    
    // 加载后台标题配置
    const titles: Record<string, string> = {};
    ADMIN_TITLE_KEYS.forEach(item => {
      const config = data.find((c: any) => c.key === item.key);
      titles[item.key] = config?.value || item.default;
    });
    setAdminTitles(titles);
    
    // 加载站点标语
    const sloganConfig = data.find((c: any) => c.key === "site_slogan");
    if (sloganConfig) setSiteSlogan(sloganConfig.value);
    
    // 加载精选配置
    const featuredConfig = data.find((c: any) => c.key === "featured_links");
    if (featuredConfig) {
      try {
        const ids = JSON.parse(featuredConfig.value);
        setFeaturedIds(Array.isArray(ids) ? ids : []);
      } catch {
        setFeaturedIds([]);
      }
    }
    
    // 加载标签配置
    const tagsConfig = data.find((c: any) => c.key === "link_tags");
    if (tagsConfig) {
      try {
        const loadedTags = JSON.parse(tagsConfig.value);
        if (Array.isArray(loadedTags) && loadedTags.length > 0) {
          setTags(loadedTags);
        }
      } catch {
        // 使用默认标签
      }
    }
    

  };

  const fetchLinks = async () => {
    const res = await fetch("/api/categories");
    if (res.ok) {
      const categories = await res.json();
      const links = categories.flatMap((cat: any) => cat.links || []);
      setAllLinks(links);
    }
  };

  const handleUpdateConfigs = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/config", { method: "PUT", body: JSON.stringify({ configs }) });
    fetchConfigs();
    toast.success("配置更新成功");
  };

  const handleDeleteConfig = async (key: string) => {
    const newConfigs = configs.filter(c => c.key !== key);
    await fetch("/api/config", { method: "PUT", body: JSON.stringify({ configs: newConfigs }) });
    fetchConfigs();
    toast.success("配置删除成功");
  };

  // 保存后台标题
  const handleSaveAdminTitles = async () => {
    const newConfigs = [...configs];
    
    // 保存站点标语
    const sloganIndex = newConfigs.findIndex((c: any) => c.key === "site_slogan");
    if (sloganIndex >= 0) {
      newConfigs[sloganIndex].value = siteSlogan;
    } else {
      newConfigs.push({ key: "site_slogan", value: siteSlogan });
    }
    
    // 保存各个菜单标题
    ADMIN_TITLE_KEYS.forEach(item => {
      const index = newConfigs.findIndex((c: any) => c.key === item.key);
      const value = adminTitles[item.key] || item.default;
      if (index >= 0) {
        newConfigs[index].value = value;
      } else {
        newConfigs.push({ key: item.key, value });
      }
    });
    
    await fetch("/api/config", { method: "PUT", body: JSON.stringify({ configs: newConfigs }) });
    setConfigs(newConfigs);
    toast.success("后台标题更新成功，刷新页面后生效");
  };

  // 保存精选
  const handleSaveFeatured = async () => {
    const newConfigs = [...configs];
    const index = newConfigs.findIndex((c: any) => c.key === "featured_links");
    if (index >= 0) {
      newConfigs[index].value = JSON.stringify(featuredIds);
    } else {
      newConfigs.push({ key: "featured_links", value: JSON.stringify(featuredIds) });
    }
    await fetch("/api/config", { method: "PUT", body: JSON.stringify({ configs: newConfigs }) });
    setConfigs(newConfigs);
    toast.success("精选链接更新成功，刷新页面后生效");
  };

  // 保存标签
  const handleSaveTags = async () => {
    const newConfigs = [...configs];
    const index = newConfigs.findIndex((c: any) => c.key === "link_tags");
    if (index >= 0) {
      newConfigs[index].value = JSON.stringify(tags);
    } else {
      newConfigs.push({ key: "link_tags", value: JSON.stringify(tags) });
    }
    await fetch("/api/config", { method: "PUT", body: JSON.stringify({ configs: newConfigs }) });
    setConfigs(newConfigs);
    toast.success("标签更新成功，刷新页面后生效");
  };

  // 添加标签
  const handleAddTag = () => {
    if (!newTag.trim()) {
      toast.error("标签名称不能为空");
      return;
    }
    if (tags.includes(newTag.trim())) {
      toast.error("标签已存在");
      return;
    }
    if (tags.length >= 15) {
      toast.error("最多只能有15个标签");
      return;
    }
    setTags([...tags, newTag.trim()]);
    setNewTag("");
  };

  // 删除标签
  const handleDeleteTag = (tagToDelete: string) => {
    setTags(tags.filter(t => t !== tagToDelete));
  };

  const filteredLinks = useMemo(() => {
    if (!searchQuery.trim()) return allLinks;
    const query = searchQuery.toLowerCase();
    return allLinks.filter(link => 
      link.title.toLowerCase().includes(query) ||
      link.url.toLowerCase().includes(query)
    );
  }, [allLinks, searchQuery]);

  // 切换精选状态
  const toggleFeatured = (id: number) => {
    if (featuredIds.includes(id)) {
      setFeaturedIds(featuredIds.filter(fid => fid !== id));
    } else {
      if (featuredIds.length >= 5) {
        toast.error("最多只能选择5个精选链接");
        return;
      }
      setFeaturedIds([...featuredIds, id]);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      return toast.error("新密码与确认密码不匹配");
    }
    
    const res = await fetch("/api/auth/password", {
      method: "PUT",
      body: JSON.stringify({
        oldPassword: passwordChange.oldPassword,
        newPassword: passwordChange.newPassword
      })
    });
    
    const data = await res.json();
    if (data.success) {
      toast.success("密码修改成功");
      setPasswordChange({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      toast.error(data.message || "密码修改失败");
    }
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* 精选管理 */}
      <section className="nm-flat p-8 rounded-[40px] border border-yellow-500/10 dark:border-yellow-400/10 relative overflow-hidden">
        <h2 className="text-[11px] uppercase tracking-[0.5em] text-yellow-600 dark:text-yellow-400 font-black mb-6 flex items-center gap-4">
          <Star size={14} />
          精选推荐管理
        </h2>
        <p className="text-xs text-gray-400 mb-6">
          选择最多 5 个链接作为首页精选推荐，将显示在轮播区域。
        </p>
        
        {/* 已选择的精选 */}
        {featuredIds.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/10">
            <div className="text-[10px] uppercase tracking-widest text-yellow-600/60 font-black mb-3">
              已选择 ({featuredIds.length}/5)
            </div>
            <div className="flex flex-wrap gap-2">
              {featuredIds.map(id => {
                const link = allLinks.find(l => l.id === id);
                if (!link) return null;
                return (
                  <button
                    key={id}
                    onClick={() => toggleFeatured(id)}
                    className="px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30 transition-colors flex items-center gap-1"
                  >
                    {link.title}
                    <span className="text-yellow-600/50">×</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        {/* 搜索框 */}
        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="搜索链接名称或URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 pl-10 text-sm font-bold focus:outline-none glow-border transition-all"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        {/* 链接列表 */}
        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {filteredLinks.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              {searchQuery ? "没有找到匹配的链接" : "暂无链接"}
            </div>
          ) : filteredLinks.map(link => {
            const isFeatured = featuredIds.includes(link.id);
            return (
              <button
                key={link.id}
                onClick={() => toggleFeatured(link.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  isFeatured 
                    ? 'bg-yellow-500/10 border border-yellow-500/30' 
                    : 'bg-gray-50/50 dark:bg-white/[0.02] border border-transparent hover:border-gray-200 dark:hover:border-white/10'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                  isFeatured 
                    ? 'bg-yellow-500 border-yellow-500 text-black' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {isFeatured && <Star size={12} className="fill-current" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{link.title}</div>
                  <div className="text-xs text-gray-400 truncate">{link.url}</div>
                </div>
              </button>
            );
          })}
        </div>
        
        <button 
          onClick={handleSaveFeatured}
          className="w-full mt-6 bg-yellow-600 dark:bg-yellow-500 text-white py-5 rounded-2xl text-[10px] uppercase tracking-[0.4em] font-black hover:bg-yellow-500 dark:hover:bg-yellow-400 transition-all shadow-2xl hover:shadow-yellow-500/20 active:scale-[0.98]"
        >
          保存精选配置
        </button>
      </section>

      {/* 标签管理 */}
      <section className="nm-flat p-8 rounded-[40px] border border-pink-500/10 dark:border-pink-400/10 relative overflow-hidden">
        <h2 className="text-[11px] uppercase tracking-[0.5em] text-pink-600 dark:text-pink-400 font-black mb-6 flex items-center gap-4">
          <Tag size={14} />
          标签管理
        </h2>
        <p className="text-xs text-gray-400 mb-6">
          管理可供链接选择的标签，最多15个。
        </p>
        
        {/* 标签列表 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag) => (
            <div 
              key={tag} 
              className="group flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-pink-500/10 text-pink-600 border border-pink-500/20 hover:border-pink-500/40 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
              {tag}
              <button
                onClick={() => handleDeleteTag(tag)}
                className="ml-1 w-4 h-4 rounded-full flex items-center justify-center text-pink-600/50 hover:text-pink-600 hover:bg-pink-500/20 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        {/* 添加新标签 */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            placeholder="输入新标签名称"
            className="flex-1 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none glow-border transition-all"
          />
          <button
            onClick={handleAddTag}
            className="px-6 py-3 rounded-2xl bg-pink-500/10 text-pink-600 font-bold hover:bg-pink-500/20 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            添加
          </button>
        </div>
        
        <button 
          onClick={handleSaveTags}
          className="w-full bg-pink-600 dark:bg-pink-500 text-white py-5 rounded-2xl text-[10px] uppercase tracking-[0.4em] font-black hover:bg-pink-500 dark:hover:bg-pink-400 transition-all shadow-2xl hover:shadow-pink-500/20 active:scale-[0.98]"
        >
          保存标签配置
        </button>
      </section>

      {/* 后台标题配置 */}
      <section className="nm-flat p-8 rounded-[40px] border border-blue-500/10 dark:border-blue-400/10 relative overflow-hidden">
        <h2 className="text-[11px] uppercase tracking-[0.5em] text-blue-600 dark:text-blue-400 font-black mb-10 flex items-center gap-4">
          <LayoutDashboard size={14} />
          后台显示设置
        </h2>
        
        <div className="space-y-6">
          {/* 站点标语 */}
          <div className="space-y-3">
            <label className="text-[9px] uppercase tracking-[0.5em] text-gray-400 font-black ml-1 opacity-50">
              左侧菜单栏标题
            </label>
            <input
              type="text"
              value={siteSlogan}
              onChange={(e) => setSiteSlogan(e.target.value)}
              className="w-full bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl px-6 py-5 text-sm font-bold focus:outline-none glow-border transition-all"
              placeholder="ART.NAV"
            />
          </div>
          
          {/* 各个菜单标题 */}
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
            <label className="text-[9px] uppercase tracking-[0.5em] text-gray-400 font-black ml-1 opacity-50">
              各菜单标题
            </label>
            {ADMIN_TITLE_KEYS.map((item) => (
              <div key={item.key} className="flex items-center gap-4">
                <span className="text-xs text-gray-500 w-20">{item.label}</span>
                <input
                  type="text"
                  value={adminTitles[item.key] || item.default}
                  onChange={(e) => setAdminTitles(prev => ({ ...prev, [item.key]: e.target.value }))}
                  className="flex-1 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none glow-border transition-all"
                />
              </div>
            ))}
          </div>
          
          <button 
            onClick={handleSaveAdminTitles}
            className="w-full bg-blue-600 dark:bg-blue-500 text-white py-5 rounded-2xl text-[10px] uppercase tracking-[0.4em] font-black hover:bg-blue-500 dark:hover:bg-blue-400 transition-all shadow-2xl hover:shadow-blue-500/20 active:scale-[0.98]"
          >
            保存后台标题
          </button>
        </div>
      </section>

      {/* 系统参数 */}
      <section className="nm-flat p-8 rounded-[40px] border border-gray-100/50 dark:border-white/[0.03] relative overflow-hidden">
        <h2 className="text-[11px] uppercase tracking-[0.5em] text-[#6ee7b7] font-black mb-10 flex items-center gap-4">
          <Settings size={14} />
          系统参数
        </h2>
        <form onSubmit={handleUpdateConfigs} className="space-y-6">
          {configs.filter((c: any) => !c.key.startsWith('admin_') && c.key !== 'site_slogan' && c.key !== 'featured_links').map((config: any, index: number) => (
            <div key={config.key} className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[9px] uppercase tracking-[0.5em] text-gray-400 font-black ml-1 opacity-50">{config.key}</label>
                <button
                  type="button"
                  onClick={() => handleDeleteConfig(config.key)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <input
                type="text"
                value={config.value}
                onChange={(e) => {
                  const newConfigs = [...configs];
                  const idx = newConfigs.findIndex((c: any) => c.key === config.key);
                  if (idx >= 0) newConfigs[idx].value = e.target.value;
                  setConfigs(newConfigs);
                }}
                className="w-full bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl px-6 py-5 text-sm font-bold focus:outline-none glow-border transition-all"
              />
            </div>
          ))}
          <button type="submit" className="w-full bg-gray-900 dark:bg-white text-white dark:text-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.4em] font-black hover:bg-[#6ee7b7] dark:hover:bg-[#6ee7b7] hover:text-white dark:hover:text-black transition-all shadow-2xl hover:shadow-[#6ee7b7]/20 active:scale-[0.98]">
            更新配置
          </button>
        </form>
      </section>

      {/* 安全设置 */}
      <section className="nm-flat p-8 rounded-[40px] border border-red-500/10 relative overflow-hidden">
        <h2 className="text-[11px] uppercase tracking-[0.5em] text-red-500 font-black mb-10 flex items-center gap-4">
          <Lock size={14} />
          安全设置
        </h2>
        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div className="space-y-3">
            <input
              type="password"
              placeholder="当前密码"
              value={passwordChange.oldPassword}
              onChange={(e) => setPasswordChange({...passwordChange, oldPassword: e.target.value})}
              className="w-full bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl px-6 py-5 text-sm font-bold focus:outline-none glow-border transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="password"
              placeholder="新密码"
              value={passwordChange.newPassword}
              onChange={(e) => setPasswordChange({...passwordChange, newPassword: e.target.value})}
              className="w-full bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl px-6 py-5 text-sm font-bold focus:outline-none glow-border transition-all"
            />
            <input
              type="password"
              placeholder="确认新密码"
              value={passwordChange.confirmPassword}
              onChange={(e) => setPasswordChange({...passwordChange, confirmPassword: e.target.value})}
              className="w-full bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl px-6 py-5 text-sm font-bold focus:outline-none glow-border transition-all"
            />
          </div>
          <button type="submit" className="w-full bg-red-500 text-white py-5 rounded-2xl text-[10px] uppercase tracking-[0.4em] font-black hover:bg-red-600 transition-all shadow-2xl hover:shadow-red-500/20 active:scale-[0.98]">
            修改密码
          </button>
        </form>
      </section>
    </div>
  );
}
