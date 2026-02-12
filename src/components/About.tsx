"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { AboutContent, HeroSlide, Category, Link } from "@prisma/client";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface AboutProps {
  content: AboutContent;
  slides?: HeroSlide[];
  categories?: (Category & { links: Link[] })[];
}

// 打字机效果
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

// 代码高亮
function CodeBlock({ code, isDark }: { code: string; isDark: boolean }) {
  const lines = code.split('\n');
  
  const highlight = (line: string) => {
    return line
      .replace(/(".*?")/g, '<span class="text-[#7ee787]">$1</span>')
      .replace(/(\{|\}|\[|\])/g, '<span class="text-[#79c0ff]">$1</span>')
      .replace(/:/g, '<span class="text-white/50">:</span>')
      .replace(/,/g, '<span class="text-white/50">,</span>')
      .replace(/\b(true|false|null)\b/g, '<span class="text-[#ff7b72]">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="text-[#79c0ff]">$1</span>');
  };

  return (
    <div className={`font-mono text-base leading-relaxed ${isDark ? 'text-white' : 'text-gray-800'}`}>
      {lines.map((line, i) => (
        <div key={i} className="flex">
          <span className={`w-10 text-right mr-6 select-none text-sm ${isDark ? 'text-white/20' : 'text-gray-400'}`}>{i + 1}</span>
          <span dangerouslySetInnerHTML={{ __html: highlight(line) }} />
        </div>
      ))}
    </div>
  );
}

// 滑动指示器
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
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={`h-1.5 transition-all duration-300 ${
            i === current 
              ? 'w-10 bg-[#3fb950]' 
              : isDark ? 'w-3 bg-white/20 hover:bg-white/40' : 'w-3 bg-gray-300 hover:bg-gray-400'
          }`}
        />
      ))}
    </div>
  );
}

export const About = ({ content, slides = [], categories = [] }: AboutProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

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

  // 自动轮播
  useEffect(() => {
    if (displaySlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displaySlides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [displaySlides.length]);

  // 触摸/鼠标滑动
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
  };

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const diff = startX - clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentSlide < displaySlides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      } else if (diff < 0 && currentSlide > 0) {
        setCurrentSlide(currentSlide - 1);
      }
    }
  };

  // 键盘控制
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
    <section className={`relative py-24 md:py-32 overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#0d1117]' : 'bg-gray-50'}`}>
      {/* 背景 */}
      <div className={`absolute inset-0 ${isDark ? 'opacity-30' : 'opacity-10'}`}>
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: isDark 
              ? `linear-gradient(rgba(48,54,61,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(48,54,61,0.4) 1px, transparent 1px)`
              : `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        
        {/* 顶部状态栏 */}
        <div className={`flex items-center justify-between mb-12 text-xs font-mono ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
          <div className="flex items-center gap-4">
            <span className="text-[#3fb950]">●</span>
            <span>ONLINE</span>
            <span className={isDark ? 'text-white/20' : 'text-gray-300'}>|</span>
            <span>LATENCY: 12ms</span>
          </div>
          <div>
            {new Date().toISOString().split('T')[0]}
          </div>
        </div>

        {/* 主内容 - 可滑动 */}
        <div 
          ref={containerRef}
          className="cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          onMouseLeave={() => setIsDragging(false)}
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 gap-8 md:gap-12"
            >
              {/* 左侧：文字内容 */}
              <div className="space-y-6">
                {/* 标题 */}
                <div>
                  <div className={`text-[10px] font-mono mb-2 tracking-wider ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                    $ cat identity.txt
                  </div>
                  <h2 className={`text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {activeSlide.title}
                  </h2>
                </div>

                {/* 副标题 */}
                <div className={`font-mono text-lg ${isDark ? 'text-[#58a6ff]' : 'text-blue-600'}`}>
                  <TypeWriter text={activeSlide.subtitle} delay={300} />
                </div>

                {/* 描述 */}
                <p className={`leading-relaxed max-w-md text-lg ${isDark ? 'text-white/50' : 'text-gray-600'}`}>
                  {activeSlide.description || "一个精心整理的设计资源库。没有算法推荐，没有广告干扰，只有纯粹的链接。"}
                </p>

                {/* 分类快速链接 */}
                {categories.length > 0 && (
                  <div className="pt-6 space-y-2">
                    <div className={`text-[10px] font-mono tracking-wider ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                      $ ls -la categories/
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {categories.slice(0, 6).map((cat) => (
                        <a
                          key={cat.id}
                          href={`#category-${cat.id}`}
                          className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                            isDark 
                              ? 'bg-[#21262d] text-[#7ee787] hover:bg-[#30363d]' 
                              : 'bg-gray-100 text-green-700 hover:bg-gray-200'
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
                <div className={`flex items-center gap-2 px-5 py-4 border border-b-0 rounded-t-lg ${isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-gray-100 border-gray-200'}`}>
                  <div className="w-3.5 h-3.5 rounded-full bg-[#ff7b72]" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#ffa657]" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#3fb950]" />
                  <span className={`ml-4 text-sm font-mono ${isDark ? 'text-white/40' : 'text-gray-500'}`}>manifest.json</span>
                </div>
                
                {/* 代码内容 */}
                <div className={`p-8 border rounded-b-lg overflow-x-auto ${isDark ? 'bg-[#0d1117] border-[#30363d]' : 'bg-white border-gray-200'}`}>
                  <CodeBlock code={activeSlide.codeSnippet || "{}"} isDark={isDark} />
                </div>

                {/* 装饰角标 */}
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#3fb950]" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#3fb950]" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 底部控制栏 */}
        <div className={`flex items-center justify-between mt-12 pt-6 border-t ${isDark ? 'border-[#30363d]' : 'border-gray-200'}`}>
          {/* 滑动指示器 */}
          <Slider 
            total={displaySlides.length} 
            current={currentSlide} 
            onChange={setCurrentSlide}
            isDark={isDark}
          />

          {/* 统计 */}
          <div className={`flex items-center gap-6 text-xs font-mono ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
            <div>
              NODES: <span className={isDark ? 'text-[#79c0ff]' : 'text-blue-600'}>{totalLinks}</span>
            </div>
            <div>
              SLIDE: <span className={isDark ? 'text-[#79c0ff]' : 'text-blue-600'}>{currentSlide + 1}/{displaySlides.length}</span>
            </div>
          </div>

          {/* 键盘提示 */}
          <div className={`hidden md:flex items-center gap-2 text-[10px] font-mono ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
            <span className={`px-2 py-1 rounded ${isDark ? 'bg-[#21262d]' : 'bg-gray-100'}`}>←</span>
            <span className={`px-2 py-1 rounded ${isDark ? 'bg-[#21262d]' : 'bg-gray-100'}`}>→</span>
            <span>to navigate</span>
          </div>
        </div>
      </div>
    </section>
  );
};
