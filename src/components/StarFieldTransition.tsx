"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export const StarFieldTransition = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Star[] = [];
    let shootingStars: ShootingStar[] = [];
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = 600; // Taller transition area for deep space feel
    };

    class Star {
      x: number;
      y: number;
      size: number;
      opacity: number;
      speed: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 1.5;
        this.opacity = Math.random();
        this.speed = Math.random() * 0.05;
      }

      update() {
        this.opacity += this.speed;
        if (this.opacity > 1 || this.opacity < 0) {
          this.speed = -this.speed;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        // Use dark gray for stars in light mode, white for dark mode
        ctx.fillStyle = isDark 
          ? `rgba(255, 255, 255, ${this.opacity})`
          : `rgba(71, 85, 105, ${this.opacity * 0.6})`; // slate-600
        ctx.fill();
      }
    }

    class ShootingStar {
      x: number;
      y: number;
      length: number;
      speed: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * (canvas!.height / 2);
        this.length = Math.random() * 80 + 10;
        this.speed = Math.random() * 10 + 5;
        this.opacity = 0;
      }

      reset() {
        this.x = Math.random() * canvas!.width + 200;
        this.y = Math.random() * (canvas!.height / 2);
        this.length = Math.random() * 80 + 10;
        this.speed = Math.random() * 10 + 5;
        this.opacity = 0;
      }

      update() {
        this.x -= this.speed;
        this.y += this.speed / 2;
        
        if (this.opacity < 1) this.opacity += 0.1;
        
        if (this.x < -100 || this.y > canvas!.height + 100) {
          this.reset();
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.length, this.y - this.length / 2);
        gradient.addColorStop(0, isDark ? "rgba(255, 255, 255, 0)" : "rgba(71, 85, 105, 0)");
        gradient.addColorStop(1, isDark ? `rgba(99, 102, 241, ${this.opacity})` : `rgba(99, 102, 241, ${this.opacity * 0.8})`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.length, this.y - this.length / 2);
        ctx.stroke();
      }
    }

    const init = () => {
      stars = [];
      shootingStars = [];
      
      // Create dense starfield
      const starCount = Math.floor(window.innerWidth / 3);
      for (let i = 0; i < starCount; i++) {
        stars.push(new Star());
      }

      // Create shooting stars
      for (let i = 0; i < 3; i++) {
        shootingStars.push(new ShootingStar());
      }
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach(star => {
        star.update();
        star.draw();
      });

      // Randomly spawn shooting stars
      if (Math.random() < 0.02 && shootingStars.length < 5) {
        shootingStars.push(new ShootingStar());
      }

      shootingStars.forEach(star => {
        star.update();
        star.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", () => {
      resizeCanvas();
      init();
    });

    resizeCanvas();
    init();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
       <canvas ref={canvasRef} className="w-full h-full opacity-80" />
    </div>
  );
};
