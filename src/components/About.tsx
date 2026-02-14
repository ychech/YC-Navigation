"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { AboutContent, HeroSlide, Category, Link } from "@prisma/client";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface AboutProps {
  content: AboutContent;
  slides?: HeroSlide[];
  categories?: (Category & { links: Link[] })[];
  codeFileName?: string;
}

function TypeWriter({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayText, setDisplayText] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let index = 0;
    const timer = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [started, text]);

  return (
    <span>
      {displayText}
      <span className="animate-pulse">_</span>
    </span>
  );
}

function CodeBlock({ code, isDark }: { code: string; isDark: boolean }) {
  const lines = code.split('\n');
  
  return (
    <div className={`font-mono text-xs md:text-sm leading-relaxed ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
      {lines.map((line, i) => (
        <div key={i} className="flex">
          <span className={`w-6 md:w-8 text-right mr-3 md:mr-4 select-none text-xs ${isDark ? 'text-white/30' : 'text-[#58a6ff]'}`}>{i + 1}</span>
          <span className="truncate">{line}</span>
        </div>
      ))}
    </div>
  );
}

function Slider({ 
  total, 
  current, 
  onChange,
  isDark
}: { 
  total: number; 
  current: number; 
  onChange: (i: number) => void;
  isDark: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === current 
              ? 'w-6 md:w-8 bg-[#3fb950]' 
              : isDark ? 'w-1.5 bg-white/20 hover:bg-white/40' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
          }`}
        />
      ))}
    </div>
  );
}

export const About = ({ content, slides = [], categories = [], codeFileName = "manifest.json" }: AboutProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDark = mounted ? resolvedTheme === "dark" : true;

  const totalLinks = categories.reduce((acc, cat) => acc + (cat.links?.length || 0), 0);

  const displaySlides = slides.length > 0 ? slides : [{
    id: 0,
    title: content.title || "ROOT",
    subtitle: content.description || "system.init()",
    description: "一个精心整理的设计资源库。没有算法推荐，没有广告干扰，只有纯粹的链接。",
    codeSnippet: `{
  "identity": "archive",
  "version": "2.0.0",
  "status": "running",
  "nodes": ${totalLinks || 0},
  "mode": "${isDark ? 'dark' : 'light'}"
}`,
  }];

  const activeSlide = displaySlides[currentSlide];

  useEffect(() => {
    if (displaySlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displaySlides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [displaySlides.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentSlide < displaySlides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      } else if (e.key === 'ArrowLeft' && currentSlide > 0) {
        setCurrentSlide(currentSlide - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, displaySlides.length]);

  return (
    <section className="relative">
      {/* 圆角卡片容器 */}
      <div className={`
        relative overflow-hidden rounded-2xl md:rounded-3xl
        ${isDark 
          ? 'bg-[#0d1117] border border-white/5' 
          : 'bg-white border border-gray-200 shadow-lg'
        }
      `}>
        {/* 蓝色水波纹背景 - 全屏 */}
        <div className="absolute inset-0 overflow-hidden">
          <svg className="absolute w-full h-full opacity-40" viewBox="0 0 1440 600" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waterGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#1d4ed8" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#1e40af" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <path fill="url(#waterGrad1)" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
              <animate attributeName="d" dur="20s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" values="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
            </path>
          </svg>
          <svg className="absolute w-full h-full opacity-30" viewBox="0 0 1440 600" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waterGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path fill="url(#waterGrad2)" d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,106.7C672,96,768,128,864,154.7C960,181,1056,203,1152,197.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
              <animate attributeName="d" dur="15s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" values="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,106.7C672,96,768,128,864,154.7C960,181,1056,203,1152,197.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;M0,128L48,138.7C96,149,192,171,288,181.3C384,192,480,192,576,170.7C672,149,768,107,864,101.3C960,96,1056,128,1152,149.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,106.7C672,96,768,128,864,154.7C960,181,1056,203,1152,197.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
            </path>
          </svg>
        </div>

        {/* 内容区域 */}
        <div className="relative z-10 px-5 md:px-8 py-8 md:py-10">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 gap-6 md:gap-10"
            >
              {/* 左侧：文字内容 */}
              <div className="space-y-4">
                <div>
                  <div className={`text-[10px] font-mono mb-2 tracking-wider uppercase ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                    $ cat identity.txt
                  </div>
                  <h2 className={`text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {activeSlide.title}
                  </h2>
                </div>

                <div className={`font-mono text-sm md:text-base ${isDark ? 'text-gray-400' : 'text-blue-600'}`}>
                  <TypeWriter text={activeSlide.subtitle} delay={300} />
                </div>

                <p className={`leading-relaxed text-sm md:text-base max-w-md ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                  {activeSlide.description || "一个精心整理的设计资源库。没有算法推荐，没有广告干扰，只有纯粹的链接。"}
                </p>

                {categories.length > 0 && (
                  <div className="pt-4 space-y-2">
                    <div className={`text-[10px] font-mono tracking-wider uppercase ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                      $ ls -la categories/
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {categories.slice(0, 6).map((cat) => (
                        <a
                          key={cat.id}
                          href={`#category-${cat.id}`}
                          className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-all ${
                            isDark 
                              ? 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10' 
                              : 'bg-gray-100 text-green-700 border border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          {cat.name.toLowerCase()}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 右侧：代码块 */}
              <div className="relative">
                {/* 窗口标题栏 */}
                <div className={`flex items-center gap-2 px-4 py-3 rounded-t-lg border-b ${isDark ? 'bg-[#21262d] border-white/10' : 'bg-gray-100 border-gray-200'}`}>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27ca40]" />
                  </div>
                  <span className={`ml-3 text-xs font-mono ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{codeFileName}</span>
                </div>
                
                {/* 代码内容 */}
                <div className={`p-4 md:p-5 rounded-b-lg overflow-x-auto ${isDark ? 'bg-[#0d1117]/80' : 'bg-gray-50'}`}>
                  <CodeBlock code={activeSlide.codeSnippet || "{}"} isDark={isDark} />
                </div>
                
                {/* 装饰角标 */}
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-gray-400" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-gray-400" />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* 底部控制栏 */}
          <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between mt-8 pt-6 border-t gap-4 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <Slider 
              total={displaySlides.length} 
              current={currentSlide} 
              onChange={setCurrentSlide}
              isDark={isDark}
            />

            <div className={`flex items-center gap-4 text-[10px] md:text-xs font-mono ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
              <div>
                NODES: <span className={isDark ? 'text-gray-400' : 'text-blue-600'}>{totalLinks}</span>
              </div>
              <div>
                SLIDE: <span className={isDark ? 'text-[#79c0ff]' : 'text-blue-600'}>{currentSlide + 1}/{displaySlides.length}</span>
              </div>
            </div>

            <div className={`hidden lg:flex items-center gap-2 text-[10px] font-mono ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
              <span className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>←</span>
              <span className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>→</span>
              <span>navigate</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
