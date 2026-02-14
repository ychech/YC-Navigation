"use client";

import { useEffect, useRef } from "react";

export const WaterRipple = () => {
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

    // 水波纹渲染 - 模拟光影扭曲
    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      
      // 创建渐变背景 - 深水色
      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, "#0a0f1a");
      gradient.addColorStop(0.5, "#0f1729");
      gradient.addColorStop(1, "#1a2332");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // 绘制水波纹线条
      ctx.lineWidth = 1;
      
      for (let i = 0; i < 20; i++) {
        const y = (i / 20) * h + Math.sin(time * 0.02 + i * 0.5) * 3;
        
        ctx.beginPath();
        
        for (let x = 0; x <= w; x += 5) {
          // 波浪扭曲计算
          const wave1 = Math.sin(x * 0.01 + time * 0.03 + i * 0.3) * 2;
          const wave2 = Math.sin(x * 0.005 + time * 0.02 + i * 0.2) * 1;
          const ripple = Math.sin((x + y) * 0.008 + time * 0.04) * 1.5;
          
          const offsetY = wave1 + wave2 + ripple;
          
          if (x === 0) {
            ctx.moveTo(x, y + offsetY);
          } else {
            ctx.lineTo(x, y + offsetY);
          }
        }
        
        // 线条透明度渐变
        const alpha = 0.05 + Math.sin(time * 0.01 + i) * 0.03;
        ctx.strokeStyle = `rgba(100, 180, 255, ${alpha})`;
        ctx.stroke();
      }

      // 添加光斑反射
      for (let i = 0; i < 5; i++) {
        const x = (i / 5) * w + Math.sin(time * 0.01 + i) * 50;
        const y = h * 0.3 + Math.cos(time * 0.015 + i * 0.5) * 20;
        const width = 30 + Math.sin(time * 0.02 + i) * 10;
        
        const shineGradient = ctx.createLinearGradient(x - width, y, x + width, y);
        shineGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
        shineGradient.addColorStop(0.5, `rgba(200, 230, 255, ${0.1 + Math.sin(time * 0.03 + i) * 0.05})`);
        shineGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        
        ctx.fillStyle = shineGradient;
        ctx.fillRect(x - width, y - 1, width * 2, 2);
      }

      time += 1;
      animationId = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative h-32 w-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ imageRendering: "crisp-edges" }}
      />
    </div>
  );
};
