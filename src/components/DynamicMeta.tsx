"use client";

import { useEffect, useState, useCallback } from "react";

// 强制清除所有浏览器缓存的函数
const forceClearCache = () => {
  // 清除所有 storage
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {}
  
  // 清除所有缓存的 favicon
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
};

export function DynamicMeta() {
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [siteName, setSiteName] = useState<string | null>(null);
  const [titleSuffix, setTitleSuffix] = useState<string>("设计师的灵感宝库");

  const fetchConfig = useCallback(() => {
    fetch("/api/config")
      .then(res => res.json())
      .then((configs: any[]) => {
        const faviconConfig = configs.find(c => c.key === "site_favicon");
        const nameConfig = configs.find(c => c.key === "site_name");
        const suffixConfig = configs.find(c => c.key === "site_title_suffix");
        
        console.log("Config fetched:", { favicon: faviconConfig?.value, name: nameConfig?.value });
        
        if (faviconConfig?.value) {
          setFaviconUrl(faviconConfig.value);
        } else {
          setFaviconUrl(null);
        }
        if (nameConfig?.value) {
          setSiteName(nameConfig.value);
        } else {
          setSiteName(null);
        }
        if (suffixConfig?.value) {
          setTitleSuffix(suffixConfig.value);
        }
      })
      .catch((err) => {
        console.error("Config fetch error:", err);
      });
  }, []);

  useEffect(() => {
    // 强制清除缓存
    forceClearCache();
    
    fetchConfig();
    
    const handleConfigUpdate = () => {
      console.log("Config update event received");
      fetchConfig();
    };
    
    window.addEventListener("site-config-updated", handleConfigUpdate);
    
    return () => {
      window.removeEventListener("site-config-updated", handleConfigUpdate);
    };
  }, [fetchConfig]);

  useEffect(() => {
    const name = siteName || "艺术导航";
    const suffix = titleSuffix || "设计师的灵感宝库";
    document.title = `${name} | ${suffix}`;
  }, [siteName, titleSuffix]);

  useEffect(() => {
    console.log("Favicon effect triggered, url:", faviconUrl);
    
    // 强制清除所有可能的缓存
    const clearAllFavicons = () => {
      const selectors = [
        'link[rel="icon"]',
        'link[rel="shortcut icon"]',
        'link[rel="apple-touch-icon"]',
        'link[rel="mask-icon"]',
        'meta[name="msapplication-TileImage"]'
      ];
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          console.log("Removing:", selector);
          el.remove();
        });
      });
    };
    
    clearAllFavicons();

    if (faviconUrl) {
      const timestamp = Date.now();
      const urlWithTimestamp = `${faviconUrl}?t=${timestamp}`;
      
      console.log("Setting favicon to:", urlWithTimestamp);
      
      // 创建新的 favicon
      const link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/png";
      link.href = urlWithTimestamp;
      document.head.appendChild(link);
      
      // 强制浏览器刷新图标 - 创建一个 iframe 来触发刷新
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 100);
    }
  }, [faviconUrl]);

  return null;
}
