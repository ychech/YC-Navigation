"use client";

import { motion } from "framer-motion";

export const InkLoading = () => {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-[100] bg-white dark:bg-[#080808] flex items-center justify-center"
    >
      <div className="relative">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1.2, 1],
            opacity: [0, 0.4, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
          className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl"
        />
        <div className="relative flex flex-col items-center gap-8">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  y: [0, -10, 0],
                  opacity: [0.2, 1, 0.2]
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
              />
            ))}
          </div>
          <div className="space-y-2 text-center">
            <p className="text-[10px] uppercase tracking-[0.8em] text-indigo-500 font-black animate-pulse">
              Accessing Archive
            </p>
            <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent mx-auto" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
