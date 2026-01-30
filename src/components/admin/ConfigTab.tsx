"use client";

import { useState, useEffect } from "react";
import { Settings, Lock } from "lucide-react";
import { toast } from "sonner";

export function ConfigTab() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [passwordChange, setPasswordChange] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    const res = await fetch("/api/config");
    const data = await res.json();
    setConfigs(data);
  };

  const handleUpdateConfigs = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/config", { method: "PUT", body: JSON.stringify({ configs }) });
    fetchConfigs();
    toast.success("配置更新成功");
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
    <div className="max-w-2xl mx-auto space-y-12">
      <section className="nm-flat p-10 rounded-[40px] border border-gray-100/50 dark:border-white/[0.03] relative overflow-hidden">
        <h2 className="text-[11px] uppercase tracking-[0.5em] text-[#6ee7b7] font-black mb-10 flex items-center gap-4">
          <Settings size={14} />
          系统参数
        </h2>
        <form onSubmit={handleUpdateConfigs} className="space-y-6">
          {configs.map((config: any, index: number) => (
            <div key={config.key} className="space-y-3">
              <label className="text-[9px] uppercase tracking-[0.5em] text-gray-400 font-black ml-1 opacity-50">{config.key}</label>
              <input
                type="text"
                value={config.value}
                onChange={(e) => {
                  const newConfigs = [...configs];
                  newConfigs[index].value = e.target.value;
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

      <section className="nm-flat p-10 rounded-[40px] border border-red-500/10 relative overflow-hidden">
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
