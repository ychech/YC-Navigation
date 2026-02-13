"use client";

import { useEffect, useRef } from "react";

export const RealWater = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 简化的水波纹效果 - 使用 CSS 动画和渐变
    const style = document.createElement("style");
    style.textContent = `
      @keyframes wave {
        0%, 100% { transform: translateX(0) translateY(0); }
        25% { transform: translateX(-5px) translateY(-2px); }
        50% { transform: translateX(0) translateY(0); }
        75% { transform: translateX(5px) translateY(2px); }
      }
      @keyframes shimmer {
        0%, 100% { opacity: 0.1; }
        50% { opacity: 0.3; }
      }
      @keyframes ripple {
        0% { transform: scale(1); opacity: 0.4; }
        100% { transform: scale(1.5); opacity: 0; }
      }
      .water-layer {
        animation: wave 6s ease-in-out infinite;
      }
      .water-layer-2 {
        animation: wave 8s ease-in-out infinite reverse;
        animation-delay: -2s;
      }
      .shimmer-line {
        animation: shimmer 4s ease-in-out infinite;
      }
      .ripple-ring {
        animation: ripple 3s ease-out infinite;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative h-40 w-full overflow-hidden">
      {/* 深水背景 */}
      <div className="absolute inset-0 bg-[#0a0f1a]" />
      
      {/* 水波纹理层 1 */}
      <div 
        className="absolute inset-0 water-layer opacity-40"
        style={{
          background: `repeating-linear-gradient(
            90deg,
            transparent 0px,
            rgba(100, 180, 255, 0.03) 1px,
            transparent 2px,
            transparent 60px
          )`
        }}
      />
      
      {/* 水波纹理层 2 */}
      <div 
        className="absolute inset-0 water-layer-2 opacity-30"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent 0px,
            rgba(150, 200, 255, 0.02) 1px,
            transparent 3px,
            transparent 80px
          )`
        }}
      />

      {/* 波浪形状层 */}
      <div className="absolute bottom-0 left-0 w-full h-full">
        <svg 
          viewBox="0 0 1440 120" 
          className="absolute bottom-0 w-[200%] h-full opacity-20 water-layer"
          preserveAspectRatio="none"
        >
          <path 
            fill="rgba(50, 150, 255, 0.3)"
            d="M0,60 C360,100 720,20 1080,60 C1260,80 1380,50 1440,60 L1440,120 L0,120 Z"
          />
        </svg>
        <svg 
          viewBox="0 0 1440 120" 
          className="absolute bottom-0 w-[200%] h-full opacity-30 water-layer-2"
          preserveAspectRatio="none"
        >
          <path 
            fill="rgba(80, 170, 255, 0.2)"
            d="M0,80 C480,40 960,100 1440,60 L1440,120 L0,120 Z"
          />
        </svg>
      </div>

      {/* 闪光线条 */}
      <div className="absolute top-1/4 left-0 w-full h-px shimmer-line">
        <div className="w-32 h-full bg-gradient-to-r from-transparent via-cyan-200/30 to-transparent blur-sm" />
      </div>
      <div className="absolute top-1/2 left-0 w-full h-px shimmer-line" style={{ animationDelay: "1.5s" }}>
        <div className="w-24 h-full bg-gradient-to-r from-transparent via-blue-200/20 to-transparent blur-sm" />
      </div>
      <div className="absolute top-3/4 left-0 w-full h-px shimmer-line" style={{ animationDelay: "3s" }}>
        <div className="w-40 h-full bg-gradient-to-r from-transparent via-cyan-100/25 to-transparent blur-sm" />
      </div>

      {/* 扩散涟漪效果 */}
      <div className="absolute top-1/2 left-1/4 w-16 h-4 rounded-full border border-white/10 ripple-ring" />
      <div className="absolute top-1/2 left-1/4 w-16 h-4 rounded-full border border-white/10 ripple-ring" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/3 left-3/4 w-12 h-3 rounded-full border border-white/10 ripple-ring" style={{ animationDelay: "2s" }} />

      {/* 底部渐变过渡 */}
      <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#0d1117]/50 to-transparent" />
    </div>
  );
};
