"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface AnimatedSectionHeaderProps {
  index: number;
  title: string;
  count: number;
  compact?: boolean;
}

export const AnimatedSectionHeader = ({ index, title, count, compact }: AnimatedSectionHeaderProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className={`flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-200 dark:border-white/5 ${compact ? 'mb-6 pb-4' : 'mb-12 pb-8'}`}>
      <div>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`flex items-center gap-3 ${compact ? 'mb-2' : 'mb-3'}`}
        >
          <span className="text-[10px] font-mono text-indigo-500">0{index + 1}</span>
          <div className="h-[1px] w-8 bg-indigo-500/30" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">Section / {title}</p>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`font-black tracking-tighter text-gray-900 dark:text-white ${compact ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'}`}
        >
          <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-600 to-gray-400 dark:from-white dark:via-white dark:to-gray-500">
            {title}
          </span>
        </motion.h2>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 0.5 }}
        className="flex items-center gap-4"
      >
        <div className="flex flex-col items-end">
           <span className="text-[10px] uppercase tracking-widest text-indigo-500/60 dark:text-indigo-500/40 font-bold">Assets</span>
           <span className="text-xl font-mono text-indigo-600 dark:text-indigo-400 font-bold leading-none">{count.toString().padStart(2, '0')}</span>
        </div>
        <div className="w-[1px] h-8 bg-gray-200 dark:bg-white/10" />
      </motion.div>
    </div>
  );
};
