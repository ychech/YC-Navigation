"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import type { Link } from "@prisma/client";
import React, { useState, memo, useMemo } from "react";
import { useTheme } from "next-themes";

interface LinkGridProps {
  links: Link[];
  categoryIndex?: number;
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
  const colors = getCardColors(index);

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
      {/* 卡片主体 */}
      <div 
        className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
          isDark 
            ? 'bg-[#141414]' 
            : 'bg-white'
        }`}
        style={{
          border: `1px solid ${
            isHovered 
              ? (isDark ? colors.accent : colors.lightAccent) 
              : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')
          }`,
          boxShadow: isHovered 
            ? `0 8px 30px ${colors.glow}` 
            : 'none',
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        }}
      >
        {/* 渐变光晕背景 */}
        <div 
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${colors.soft} 0%, transparent 70%)`,
            opacity: isHovered ? 1 : 0.5,
          }}
        />

        {/* 封面区域 */}
        <div className="relative w-full aspect-[16/10] overflow-hidden">
          {link.snapshotUrl ? (
            <div className="w-full h-full relative">
              <img 
                src={link.snapshotUrl} 
                alt="" 
                className="w-full h-full object-cover"
                style={{
                  opacity: isHovered ? 1 : 0.85,
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.5s ease-out',
                }}
                loading="lazy"
                decoding="async"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-[#141414]' : 'from-gray-100'} via-transparent to-transparent opacity-80`} />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center relative">
              {/* 彩色光晕 */}
              <div 
                className="absolute w-24 h-24 rounded-full blur-2xl transition-opacity duration-500"
                style={{
                  background: colors.accent,
                  opacity: isHovered ? 0.3 : 0.15,
                }}
              />
              <div 
                className="relative w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                {link.icon ? (
                  <img src={link.icon} alt="" className="w-6 h-6 object-contain" />
                ) : (
                  <span 
                    className="text-xl font-medium"
                    style={{ color: colors.accent }}
                  >
                    {link.title[0]}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* 点击数 */}
          <div 
            className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs backdrop-blur-sm"
            style={{
              background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)',
              color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
            }}
          >
            <Activity size={10} style={{ color: colors.accent }} />
            <span className="font-mono">{(link.clicks || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* 信息区域 */}
        <div className="p-3 relative">
          <h3 className={`text-sm font-bold mb-1 truncate ${
            isDark ? 'text-white' : 'text-gray-900'
          }`} style={{ textShadow: isDark ? '0 1px 2px rgba(0,0,0,0.5)' : 'none' }}>
            {link.title}
          </h3>
          
          <p className={`text-xs line-clamp-1 mb-2 ${
            isDark ? 'text-white/60' : 'text-gray-500'
          }`}>
            {link.description || "探索数字边界"}
          </p>
          
          <div className={`flex items-center justify-between pt-2 border-t ${
            isDark ? 'border-white/5' : 'border-black/5'
          }`}>
            <span className={`text-[10px] font-mono truncate max-w-[100px] ${
              isDark ? 'text-white/40' : 'text-gray-400'
            }`}>
              {(() => {
                try {
                  if (!link.url || link.url.startsWith('#')) return '-';
                  const url = link.url.startsWith('http') ? link.url : `https://${link.url}`;
                  return new URL(url).hostname.replace(/^www\./, '');
                } catch {
                  return '-';
                }
              })()}
            </span>
            <ArrowUpRight 
              size={14} 
              style={{ 
                color: colors.accent,
                opacity: isHovered ? 1 : 0.6,
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

// 单个分类的链接网格（带分页）
const CategoryLinkGrid = ({ 
  links, 
  categoryIndex,
  isDark 
}: { 
  links: Link[]; 
  categoryIndex: number;
  isDark: boolean;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const { paginatedLinks, totalPages } = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return {
      paginatedLinks: links.slice(start, end),
      totalPages: Math.ceil(links.length / ITEMS_PER_PAGE),
    };
  }, [links, currentPage]);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {paginatedLinks.map((link, i) => (
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
export const LinkGrid = ({ links, categoryIndex = 0 }: LinkGridProps) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  if (!links || links.length === 0) {
    return (
      <div className={`w-full h-32 flex flex-col items-center justify-center rounded-2xl border border-dashed ${
        isDark ? 'border-white/10 bg-white/[0.02]' : 'border-gray-200 bg-gray-50'
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
    />
  );
};

LinkGrid.displayName = "LinkGrid";
