"use client";

import { useState, useEffect } from "react";
import { Save, Lock } from "lucide-react";
import { toast } from "sonner";

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
    { key: "site_name", label: "站点名称", placeholder: "艺术导航" },
    { key: "site_slogan", label: "站点标语", placeholder: "ARTISTIC NAV" },
    { key: "footer_copyright", label: "版权信息", placeholder: "© 2026 艺术导航" },
    { key: "contact_email", label: "联系邮箱", placeholder: "hello@artistic-nav.com" },
  ];

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Site Config */}
      <div className="border border-black/10 dark:border-white/10 p-6">
        <h2 className="text-lg font-light mb-6">站点配置</h2>
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
