"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Activity, ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { Link } from "@prisma/client";
import React, { useState, memo, useMemo, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";

interface LinkGridProps {
  links: Link[];
  categoryIndex?: number;
  featuredLinks?: Link[];
}

// 为每个卡片生成独特颜色
const getCardColors = (index: number) => {
  const hue = (index * 137.5) % 360;
  return {
    accent: `hsl(${hue}, 70%, 55%)`,
    lightAccent: `hsl(${hue}, 60%, 45%)`,
    glow: `hsla(${hue}, 70%, 50%, 0.2)`,
    soft: `hsla(${hue}, 60%, 50%, 0.1)`,
  };
};

// 2x2 轮播精选区域
const FeaturedCarousel = memo(({ 
  links, 
  isDark 
}: { 
  links: Link[]; 
  isDark: boolean;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // 自动轮播
  useEffect(() => {
    if (isHovered || links.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % links.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isHovered, links.length]);

  const currentLink = links[currentIndex];
  const colors = getCardColors(currentIndex);

  const handleClick = async () => {
    try {
      await fetch("/api/links/click", {
        method: "POST",
        body: JSON.stringify({ id: currentLink.id }),
      });
    } catch {}
    window.open(currentLink.url, '_blank', 'noopener,noreferrer');
  };

  const goToPrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + links.length) % links.length);
  }, [links.length]);

  const goToNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % links.length);
  }, [links.length]);

  if (!links || links.length === 0) return null;

  return (
    <div 
      className="col-span-2 row-span-2 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative cursor-pointer h-full"
          onClick={handleClick}
        >
          <div 
            className={`relative rounded-2xl overflow-hidden transition-all duration-300 h-full ${
              isDark ? 'bg-black' : 'bg-white'
            }`}
            style={{
              border: `1px solid ${
                isHovered ? colors.accent : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
              }`,
              boxShadow: isHovered ? `0 12px 40px ${colors.glow}` : isDark ? '0 4px 20px rgba(0,0,0,0.5)' : 'none',
            }}
          >
            {/* 背景图 */}
            <div className="absolute inset-0">
              {currentLink.snapshotUrl ? (
                <img 
                  src={currentLink.snapshotUrl} 
                  alt="" 
                  className="w-full h-full object-cover"
                  style={{
                    opacity: isHovered ? 0.9 : 0.7,
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.5s ease-out',
                  }}
                />
              ) : (
                <div 
                  className="w-full h-full"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${colors.soft} 0%, transparent 70%)`,
                  }}
                />
              )}
              <div className={`absolute inset-0 ${isDark ? 'bg-black/60' : 'bg-gray-100/60'}`} />
            </div>

            {/* 内容 */}
            <div className="relative h-full p-6 flex flex-col justify-between">
              {/* 顶部 */}
              <div className="flex items-start justify-between">
                <div 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{
                    background: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)',
                    color: colors.accent,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  }}
                >
                  <Star size={12} className="fill-current" />
                  精选推荐
                </div>
                
                {/* 指示器 */}
                {links.length > 1 && (
                  <div className="flex items-center gap-1">
                    {links.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentIndex(idx);
                        }}
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: idx === currentIndex ? '16px' : '4px',
                          background: idx === currentIndex ? colors.accent : 'rgba(255,255,255,0.3)',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* 中间信息 */}
              <div className="flex-1 flex flex-col justify-center py-4">
                <div className="flex items-center gap-3 mb-3">
                  {currentLink.icon ? (
                    <img src={currentLink.icon} alt="" className="w-10 h-10 rounded-xl object-contain bg-black/20 p-1" />
                  ) : (
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                      style={{ background: colors.soft, color: colors.accent }}
                    >
                      {currentLink.title[0]}
                    </div>
                  )}
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {currentLink.title}
                  </h3>
                </div>
                
                <p className={`text-sm mb-3 line-clamp-2 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                  {currentLink.description || "精选优质资源推荐"}
                </p>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                    {(() => {
                      try {
                        if (!currentLink.url) return '-';
                        const url = currentLink.url.startsWith('http') ? currentLink.url : `https://${currentLink.url}`;
                        return new URL(url).hostname.replace(/^www\./, '');
                      } catch { return '-'; }
                    })()}
                  </span>
                </div>
              </div>

              {/* 底部 */}
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                  style={{
                    background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)',
                    color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                  }}
                >
                  <Activity size={12} style={{ color: colors.accent }} />
                  <span className="font-mono">{(currentLink.clicks || 0).toLocaleString()}</span>
                </div>

                <div 
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300"
                  style={{
                    background: isHovered ? colors.accent : 'transparent',
                    color: isHovered ? '#000' : colors.accent,
                    border: `2px solid ${colors.accent}`,
                  }}
                >
                  <span>访问</span>
                  <ArrowUpRight size={14} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 轮播控制按钮 */}
      {links.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-all z-10"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-all z-10"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}
    </div>
  );
});

FeaturedCarousel.displayName = "FeaturedCarousel";

const LinkCard = memo(({ 
  link, 
  index,
  isDark
}: { 
  link: Link; 
  index: number;
  isDark: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const colors = getCardColors(index + 1);
  
  // 获取链接的标签（支持多个，用逗号分隔）
  const tagString = (link as any).tag || "";
  const tags = tagString.split(',').map((t: string) => t.trim()).filter(Boolean);
  const displayTag = tags[0] || ["热门", "推荐", "工具", "资源", "设计"][index % 5];

  const handleClick = async () => {
    try {
      await fetch("/api/links/click", {
        method: "POST",
        body: JSON.stringify({ id: link.id }),
      });
    } catch {}
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.4, 
        ease: "easeOut",
        delay: Math.min(index * 0.02, 0.15)
      }}
      className="relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* 卡片主体 - 纯黑背景 */}
      <div 
        className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
          isDark ? 'bg-black' : 'bg-white'
        }`}
        style={{
          border: `1px solid ${
            isHovered 
              ? (isDark ? colors.accent : colors.lightAccent) 
              : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)')
          }`,
          boxShadow: isHovered 
            ? `0 8px 30px ${colors.glow}` 
            : isDark ? '0 4px 20px rgba(0,0,0,0.5)' : 'none',
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        }}
      >
        {/* 封面区域 */}
        <div className="relative w-full aspect-[16/10] overflow-hidden">
          {link.snapshotUrl ? (
            <div className="w-full h-full relative">
              <img 
                src={link.snapshotUrl} 
                alt="" 
                className="w-full h-full object-cover"
                style={{
                  opacity: isHovered ? 1 : 0.9,
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.5s ease-out',
                }}
                loading="lazy"
                decoding="async"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-black' : 'from-gray-100'} via-transparent to-transparent opacity-90`} />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center relative">
              {/* 彩色光晕 */}
              <div 
                className="absolute w-20 h-20 rounded-full blur-2xl transition-opacity duration-500"
                style={{
                  background: colors.accent,
                  opacity: isHovered ? 0.3 : 0.15,
                }}
              />
              <div 
                className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
                  transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                {link.icon ? (
                  <img src={link.icon} alt="" className="w-5 h-5 object-contain" />
                ) : (
                  <span 
                    className="text-lg font-medium"
                    style={{ color: colors.accent }}
                  >
                    {link.title[0]}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* 标签 */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[calc(100%-16px)]">
            {tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{
                  background: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)',
                  color: isDark ? colors.accent : colors.lightAccent,
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                }}
              >
                <span className="w-1 h-1 rounded-full" style={{ background: colors.accent }} />
                {tag}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-400"
                style={{
                  background: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                }}
              >
                +{tags.length - 2}
              </span>
            )}
          </div>
          
          {/* 点击数 */}
          <div 
            className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] backdrop-blur-sm"
            style={{
              background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.95)',
              color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
            }}
          >
            <Activity size={8} style={{ color: colors.accent }} />
            <span className="font-mono">{(link.clicks || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* 信息区域 */}
        <div className="p-3 relative">
          <h3 className={`text-sm font-bold mb-1 truncate ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {link.title}
          </h3>
          
          <p className={`text-xs line-clamp-1 mb-2 ${
            isDark ? 'text-white/50' : 'text-gray-500'
          }`}>
            {link.description || "探索数字边界"}
          </p>
          
          <div className={`flex items-center justify-between pt-2 border-t ${
            isDark ? 'border-white/[0.06]' : 'border-black/5'
          }`}>
            <span className={`text-[10px] font-mono truncate max-w-[80px] ${
              isDark ? 'text-white/30' : 'text-gray-400'
            }`}>
              {(() => {
                try {
                  if (!link.url || link.url.startsWith('#')) return '-';
                  const url = link.url.startsWith('http') ? link.url : `https://${link.url}`;
                  return new URL(url).hostname.replace(/^www\./, '');
                } catch { return '-'; }
              })()}
            </span>
            <ArrowUpRight 
              size={12} 
              style={{ 
                color: colors.accent,
                opacity: isHovered ? 1 : 0.5,
                transform: isHovered ? 'translate(2px, -2px)' : 'none',
                transition: 'all 0.3s',
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
});

LinkCard.displayName = "LinkCard";

// 分页组件
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number; 
  totalPages: number; 
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 transition-colors hover:bg-white/5"
      >
        <ChevronLeft size={16} className="text-gray-400" />
      </button>
      
      <span className="text-sm text-gray-400">
        {currentPage} / {totalPages}
      </span>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 transition-colors hover:bg-white/5"
      >
        <ChevronRight size={16} className="text-gray-400" />
      </button>
    </div>
  );
};

// 单个分类的链接网格（带分页）- 支持精选
const CategoryLinkGrid = ({ 
  links, 
  categoryIndex,
  isDark,
  featuredLinks
}: { 
  links: Link[]; 
  categoryIndex: number;
  isDark: boolean;
  featuredLinks: Link[];
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // 第一个分类的第一页显示精选
  const showFeatured = categoryIndex === 0 && currentPage === 1 && featuredLinks.length > 0;
  const ITEMS_PER_PAGE = showFeatured ? 8 : 10;

  const { displayLinks, totalPages } = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return {
      displayLinks: links.slice(start, end),
      totalPages: Math.ceil(links.length / ITEMS_PER_PAGE),
    };
  }, [links, currentPage, ITEMS_PER_PAGE]);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {/* 精选轮播 - 2x2 */}
        {showFeatured && (
          <FeaturedCarousel links={featuredLinks} isDark={isDark} />
        )}
        {displayLinks.map((link, i) => (
          <LinkCard 
            key={link.id} 
            link={link} 
            index={categoryIndex * 100 + i}
            isDark={isDark}
          />
        ))}
      </div>
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

CategoryLinkGrid.displayName = "CategoryLinkGrid";

// 导出给 page.tsx 使用
export const LinkGrid = ({ links, categoryIndex = 0, featuredLinks = [] }: LinkGridProps) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  if (!links || links.length === 0) {
    return (
      <div className={`w-full h-32 flex flex-col items-center justify-center rounded-2xl border border-dashed ${
        isDark ? 'border-white/10 bg-black' : 'border-gray-200 bg-gray-50'
      }`}>
        <Activity size={20} className={isDark ? 'text-white/20' : 'text-gray-300'} />
        <p className={`text-sm mt-2 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>暂无链接</p>
      </div>
    );
  }

  return (
    <CategoryLinkGrid 
      links={links} 
      categoryIndex={categoryIndex}
      isDark={isDark}
      featuredLinks={featuredLinks}
    />
  );
};

LinkGrid.displayName = "LinkGrid";
