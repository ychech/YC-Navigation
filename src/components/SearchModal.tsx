"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, X, ArrowUpRight, Command } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [allLinks, setAllLinks] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/categories")
        .then(res => res.json())
        .then(data => {
          const links = data.flatMap((cat: any) => 
            cat.links.map((link: any) => ({ ...link, categoryName: cat.name }))
          );
          setAllLinks(links);
        });
      
      // Focus input on open
      setTimeout(() => {
        document.getElementById("search-input")?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }
    const filtered = allLinks.filter(link => 
      link.title.toLowerCase().includes(query.toLowerCase()) ||
      link.description?.toLowerCase().includes(query.toLowerCase()) ||
      link.categoryName.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  }, [query, allLinks]);

  // Close on ESC and handle Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!isOpen) {
            // This is a bit tricky since the parent controls isOpen
            // But we can trigger a custom event or rely on the parent
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-[#111] border border-white/10 overflow-hidden shadow-2xl"
          >
            <div className="flex items-center p-6 border-b border-white/5">
              <SearchIcon size={20} className="text-gray-500 mr-4" />
              <input
                id="search-input"
                type="text"
                placeholder="搜索链接、描述或分类..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-lg font-extralight focus:outline-none placeholder:text-gray-700"
              />
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-gray-500">
                  <Command size={10} /> ESC
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 transition-colors rounded-full">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 hover:bg-white/[0.03] group transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm font-light text-white group-hover:text-white transition-colors">
                            {link.title}
                          </span>
                          <span className="text-[9px] uppercase tracking-widest text-gray-600 px-2 py-0.5 border border-white/5">
                            {link.categoryName}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-extralight truncate">
                          {link.description || link.url}
                        </p>
                      </div>
                      <ArrowUpRight size={14} className="text-gray-700 group-hover:text-white transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </a>
                  ))}
                </div>
              ) : query.trim() !== "" ? (
                <div className="py-20 text-center">
                  <p className="text-[10px] uppercase tracking-[0.5em] text-gray-600">No results found for "{query}"</p>
                </div>
              ) : (
                <div className="py-20 text-center">
                  <p className="text-[10px] uppercase tracking-[0.5em] text-gray-700 italic">Type something to search...</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-white/5 bg-black/20 flex justify-between items-center text-[9px] uppercase tracking-[0.2em] text-gray-600">
              <p>{results.length} results found</p>
              <p>Press ESC to close</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
