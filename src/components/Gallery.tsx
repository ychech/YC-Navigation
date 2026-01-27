"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { GalleryImage } from "@prisma/client";
import React, { useState } from "react";
import { X } from "lucide-react";

interface GalleryProps {
  images: GalleryImage[];
}

export const Gallery = ({ images }: GalleryProps) => {
  const [errorImages, setErrorImages] = useState<Set<number>>(new Set());
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[400px]">
        {images.map((img, i) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setSelectedImage(img)}
            className={`relative overflow-hidden group bg-gray-500/5 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 cursor-pointer ${
              i === 0 ? "lg:col-span-2 lg:row-span-2 aspect-square lg:aspect-auto" : "aspect-square"
            }`}
          >
            {!errorImages.has(img.id) ? (
              <motion.img
                src={img.url}
                alt={img.title || ""}
                onError={() => setErrorImages(prev => new Set(prev).add(img.id))}
                className="w-full h-full object-cover transition-all duration-1000 ease-in-out scale-110 group-hover:scale-100"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-gray-500/5 dark:bg-white/5 flex items-center justify-center">
                  <span className="text-gray-400 dark:text-gray-600">!</span>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600">图片无法加载</p>
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center p-6 text-center">
              <p className="text-[10px] uppercase tracking-[0.5em] text-white mb-2">{img.title || "View Project"}</p>
              <div className="w-8 h-[1px] bg-white/40 scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 md:p-12"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X size={32} strokeWidth={1} />
            </button>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative max-w-5xl w-full aspect-video md:aspect-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedImage.url} 
                alt={selectedImage.title || ""} 
                className="w-full h-auto max-h-[80vh] object-contain shadow-2xl"
              />
              <div className="mt-8 text-center">
                <p className="text-sm uppercase tracking-[0.5em] text-white/60">{selectedImage.title || "Untitled Artwork"}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
