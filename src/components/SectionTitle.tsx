"use client";

import { motion } from "framer-motion";

interface SectionTitleProps {
  number: string;
  title: string;
  subtitle: string;
}

export const SectionTitle = ({ number, title, subtitle }: SectionTitleProps) => {
  return (
    <div className="flex items-end gap-6 mb-16">
      <motion.span 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="text-6xl font-extralight text-gray-500/10 dark:text-white/5 tracking-tighter"
      >
        {number}
      </motion.span>
      <div className="pb-2">
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-[10px] uppercase tracking-[0.5em] text-gray-400 dark:text-gray-600 mb-1"
        >
          {subtitle}
        </motion.p>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-extralight tracking-tight text-gray-900 dark:text-white"
        >
          {title}
        </motion.h2>
      </div>
      <motion.div 
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        className="flex-1 h-[1px] bg-gray-200 dark:bg-white/5 origin-left mb-3"
      />
    </div>
  );
};
