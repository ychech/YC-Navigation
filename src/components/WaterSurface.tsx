"use client";

import { useEffect, useRef, useState } from "react";

export const WaterSurface = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-40 w-full bg-gradient-to-b from-[#0a0f1a] to-[#1a2332]" />;

  return (
    <div 
      ref={containerRef}
      className="relative h-40 w-full overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0a0f1a 0%, #0f1729 30%, #1a2332 70%, #243447 100%)"
      }}
    >
      <style>{`
        @keyframes wave-flow {
          0% { transform: translateX(0) scaleY(1); }
          50% { transform: translateX(-25%) scaleY(1.1); }
          100% { transform: translateX(-50%) scaleY(1); }
        }
        @keyframes ripple {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.4; }
        }
        .water-wave {
          animation: wave-flow 15s linear infinite;
        }
        .ripple-effect {
          animation: ripple 4s ease-in-out infinite;
        }
        .light-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>

      {/* 水波纹理层 - 使用重复渐变 */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(100, 180, 255, 0.03) 2px,
            rgba(100, 180, 255, 0.03) 4px
          )`
        }}
      />

      {/* 主波浪层 */}
      <div className="absolute bottom-0 left-0 w-[200%] h-full water-wave">
        <svg 
          viewBox="0 0 1440 320" 
          className="absolute bottom-0 w-full h-full opacity-40"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(80, 160, 255, 0.2)" />
              <stop offset="50%" stopColor="rgba(60, 140, 230, 0.3)" />
              <stop offset="100%" stopColor="rgba(40, 120, 210, 0.4)" />
            </linearGradient>
          </defs>
          <path 
            fill="url(#waveGrad1)"
            d="M0,160 C240,220 480,100 720,160 C960,220 1200,100 1440,160 L1440,320 L0,320 Z"
          />
        </svg>
      </div>

      {/* 第二层波浪 */}
      <div className="absolute bottom-0 left-0 w-[200%] h-full water-wave" style={{ animationDelay: '-5s', animationDuration: '12s' }}>
        <svg 
          viewBox="0 0 1440 320" 
          className="absolute bottom-0 w-full h-full opacity-30"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(100, 180, 255, 0.15)" />
              <stop offset="100%" stopColor="rgba(80, 160, 230, 0.25)" />
            </linearGradient>
          </defs>
          <path 
            fill="url(#waveGrad2)"
            d="M0,200 C360,140 720,260 1080,200 C1260,170 1380,210 1440,200 L1440,320 L0,320 Z"
          />
        </svg>
      </div>

      {/* 水面高光 */}
      <div className="absolute top-1/4 left-0 w-full h-px light-shimmer">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent" />
      </div>
      <div className="absolute top-1/2 left-0 w-full h-px light-shimmer" style={{ animationDelay: '1.5s' }}>
        <div className="w-full h-full bg-gradient-to-r from-transparent via-blue-300/15 to-transparent" />
      </div>
      <div className="absolute top-2/3 left-0 w-full h-px light-shimmer" style={{ animationDelay: '3s' }}>
        <div className="w-full h-full bg-gradient-to-r from-transparent via-cyan-200/10 to-transparent" />
      </div>

      {/* 水波纹扩散效果 */}
      <div className="absolute top-1/2 left-1/4 w-32 h-8 rounded-full border border-white/5 ripple-effect" />
      <div className="absolute top-1/2 left-1/4 w-32 h-8 rounded-full border border-white/5 ripple-effect" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/3 left-3/4 w-24 h-6 rounded-full border border-white/5 ripple-effect" style={{ animationDelay: '1s' }} />

      {/* 底部渐变过渡到About */}
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#0d1117]/80 to-transparent" />
    </div>
  );
};
