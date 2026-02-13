"use client";

import { useEffect, useRef } from "react";

export const WaterEffect = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };

    const drawWater = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      // 清空画布
      ctx.clearRect(0, 0, width, height);
      
      // 绘制水波纹
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;
      
      for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
          // 计算波纹扭曲
          const waveX = Math.sin(y * 0.02 + time * 0.02) * 3;
          const waveY = Math.cos(x * 0.015 + time * 0.015) * 2;
          
          // 涟漪效果
          const ripple = Math.sin((x + y) * 0.05 + time * 0.03) * 0.5;
          
          // 综合波纹
          const offset = waveX + waveY + ripple;
          
          // 水的颜色 - 深蓝到浅蓝渐变
          const depth = y / height;
          const r = Math.floor(10 + depth * 20 + offset * 2);
          const g = Math.floor(30 + depth * 40 + offset * 3);
          const b = Math.floor(60 + depth * 80 + offset * 5);
          const a = 0.3 + Math.abs(offset) * 0.1;
          
          // 设置像素
          const px = Math.floor(x);
          const py = Math.floor(y + offset);
          
          if (px >= 0 && px < width && py >= 0 && py < height) {
            const index = (py * width + px) * 4;
            data[index] = r;
            data[index + 1] = g;
            data[index + 2] = b;
            data[index + 3] = Math.floor(a * 255);
          }
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      // 添加高光反射
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.05)");
      gradient.addColorStop(0.5, "rgba(255, 255, 255, 0)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0.03)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      time += 1;
      animationId = requestAnimationFrame(drawWater);
    };

    resize();
    window.addEventListener("resize", resize);
    drawWater();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative h-32 w-full overflow-hidden bg-[#0a0f1a]">
      {/* 深水背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0c1220] via-[#0f2644] to-[#1a4a6e]" />
      
      {/* Canvas 水波纹 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-60"
        style={{ 
          filter: "blur(0.5px)",
          mixBlendMode: "overlay"
        }}
      />
      
      {/* 水面反光 */}
      <div 
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,100,200,0.1) 100%)"
        }}
      />
      
      {/* 扫描线效果 */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
          animation: "scanline 8s linear infinite"
        }}
      />
      
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
};
