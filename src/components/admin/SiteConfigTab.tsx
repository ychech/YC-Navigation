"use client";

import { useState, useEffect } from "react";
import { Save, Lock, Image, Upload, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getImageUrl } from "@/lib/image-url";

export function SiteConfigTab() {
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [passwordChange, setPasswordChange] = useState({ 
    oldPassword: "", 
    newPassword: "", 
    confirmPassword: "" 
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await fetch("/api/config");
      const data = await res.json();
      const configMap = Object.fromEntries(data.map((c: any) => [c.key, c.value]));
      setConfigs(configMap);
    } catch {}
  };

  const handleSaveConfig = async (key: string, value: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) {
        toast.success("保存成功");
        // 触发全局更新事件
        window.dispatchEvent(new Event("site-config-updated"));
        fetchConfigs();
      } else {
        toast.error("保存失败");
      }
    } catch {
      toast.error("保存失败");
    } finally {
      setIsLoading(false);
    }
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

  const configFields = [
    { key: "site_name", label: "站点名称 (浏览器标签标题)", placeholder: "艺术导航" },
    { key: "site_title_suffix", label: "标题后缀", placeholder: "设计师的灵感宝库" },
    { key: "site_slogan", label: "站点标语", placeholder: "ARTISTIC NAV" },
    { key: "footer_copyright", label: "版权信息", placeholder: "© 2026 艺术导航" },
    { key: "contact_email", label: "联系邮箱", placeholder: "hello@artistic-nav.com" },
  ];

  const handleUploadFavicon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error("未选择文件");
      return;
    }

    console.log("Selected file:", file.name, file.type, file.size);

    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("文件大小不能超过 2MB");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log("Uploading...");
      const res = await fetch("/api/upload", { 
        method: "POST", 
        credentials: "include",
        body: formData 
      });
      
      const data = await res.json();
      console.log("Upload response:", res.status, data);
      
      if (!res.ok) throw new Error(data.error || "上传失败");

      console.log("Saving config with URL:", data.url);
      // 保存为站点图标配置
      await handleSaveConfig("site_favicon", data.url);
      // 触发全局更新事件
      window.dispatchEvent(new Event("site-config-updated"));
      toast.success("站点图标已更新");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "上传失败");
    } finally {
      setIsLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Site Config */}
      <div className="border border-black/10 dark:border-white/10 p-6">
        <h2 className="text-lg font-light mb-6">站点配置</h2>
        
        {/* Favicon Upload */}
        <div className="mb-6 pb-6 border-b border-black/10 dark:border-white/10">
          <label className="block text-sm text-black/50 dark:text-white/50 mb-3">
            站点图标 (Favicon)
          </label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center justify-center overflow-hidden">
              {configs.site_favicon ? (
                <img 
                  src={getImageUrl(configs.site_favicon)} 
                  alt="Favicon" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <Image size={24} className="text-black/30 dark:text-white/30" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex gap-2">
                <label className="inline-flex items-center gap-2 px-4 py-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors">
                  <Upload size={16} />
                  <span className="text-sm">上传新图标</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadFavicon}
                    disabled={isLoading}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    // 强制刷新浏览器标签页图标
                    const links = document.querySelectorAll('link[rel*="icon"]');
                    links.forEach(l => l.remove());
                    
                    const link = document.createElement('link');
                    link.rel = 'icon';
                    link.href = `${configs.site_favicon}?t=${Date.now()}`;
                    document.head.appendChild(link);
                    
                    // 触发更新事件
                    window.dispatchEvent(new Event("site-config-updated"));
                    
                    toast.success("图标已刷新");
                  }}
                  disabled={!configs.site_favicon}
                  className="px-4 py-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 transition-colors"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
              <p className="text-xs text-black/40 dark:text-white/40 mt-2">
                建议尺寸: 100x100px, 支持 SVG/PNG/JPG, 最大 2MB
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {configFields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm text-black/50 dark:text-white/50 mb-2">
                {field.label}
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={configs[field.key] || ""}
                  onChange={(e) => setConfigs({ ...configs, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="flex-1 px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
                />
                <button 
                  onClick={() => handleSaveConfig(field.key, configs[field.key] || "")}
                  disabled={isLoading}
                  className="px-4 py-3 bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  <Save size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Password */}
      <div className="border border-black/10 dark:border-white/10 p-6">
        <h2 className="text-lg font-light mb-6 flex items-center gap-2">
          <Lock size={18} /> 修改密码
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <input 
            type="password" 
            placeholder="当前密码"
            value={passwordChange.oldPassword}
            onChange={(e) => setPasswordChange({...passwordChange, oldPassword: e.target.value})}
            className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white" 
            required 
          />
          <input 
            type="password" 
            placeholder="新密码"
            value={passwordChange.newPassword}
            onChange={(e) => setPasswordChange({...passwordChange, newPassword: e.target.value})}
            className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white" 
            required 
          />
          <input 
            type="password" 
            placeholder="确认新密码"
            value={passwordChange.confirmPassword}
            onChange={(e) => setPasswordChange({...passwordChange, confirmPassword: e.target.value})}
            className="w-full px-4 py-3 border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white" 
            required 
          />
          <button 
            type="submit" 
            className="w-full py-3 bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity"
          >
            修改密码
          </button>
        </form>
      </div>
    </div>
  );
}
