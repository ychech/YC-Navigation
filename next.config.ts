import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  
  // 禁用开发指示器
  devIndicators: false,
  
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
