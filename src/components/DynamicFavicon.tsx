"use client";

import { useEffect, useState } from "react";

export function DynamicFavicon() {
  const [favicon, setFavicon] = useState<string | null>(null);

  useEffect(() => {
    // 从 API 获取站点配置
    fetch("/api/config")
      .then(res => res.json())
      .then((configs: any[]) => {
        const faviconConfig = configs.find(c => c.key === "site_favicon");
        if (faviconConfig?.value) {
          setFavicon(faviconConfig.value);
        }
      })
      .catch(() => {
        // 使用默认图标
      });
  }, []);

  useEffect(() => {
    if (!favicon) return;

    // 更新 favicon
    const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (link) {
      link.href = favicon;
    }
  }, [favicon]);

  return null;
}
