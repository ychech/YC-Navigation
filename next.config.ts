import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 开发测试时不使用 standalone 模式
  // output: "standalone",
  
  // 确保静态文件被正确处理
  images: {
    unoptimized: true,
  },
  
  // 禁用源码映射（防止泄露代码）
  productionBrowserSourceMaps: false,
  
  // 配置安全响应头
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
