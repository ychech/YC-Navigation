"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("admin_auth", "true");
        router.push("/admin");
      } else {
        setError(data.message || "密码错误，请重试。");
        setLoading(false);
      }
    } catch (err) {
      setError("登录失败，请检查网络连接。");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6 selection:bg-white selection:text-black">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="mb-12 text-center">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={24} className="text-gray-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-extralight tracking-tight mb-2">身份验证</h1>
          <p className="text-[10px] uppercase tracking-[0.5em] text-gray-600">Secure Access Required</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <input
              type="password"
              placeholder="请输入管理员密码"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="w-full bg-white/[0.02] border border-white/10 p-5 text-sm focus:outline-none focus:border-white transition-all font-light tracking-widest"
              required
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-400 text-[10px] uppercase tracking-widest text-center"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black p-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <>进入后台 <ArrowRight size={14} /></>}
          </button>
        </form>

        <div className="mt-12 text-center">
          <a href="/" className="text-[10px] uppercase tracking-[0.3em] text-gray-600 hover:text-white transition-colors">
            返回首页
          </a>
        </div>
      </motion.div>
    </div>
  );
}

import { AnimatePresence } from "framer-motion";
