import prisma from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { Gallery } from "@/components/Gallery";
import { AnimatedSectionHeader } from "@/components/AnimatedSectionHeader";

export default async function GalleryPage() {
  const galleryImages = await prisma.galleryImage.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="min-h-screen transition-colors duration-300">
      <Navbar />
      
      {/* Ambient Decorative Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-50 dark:opacity-100">
        <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] floating-element" />
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] floating-element" style={{ animationDelay: '-5s' }} />
        <div className="scanline" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-48 pb-24 relative z-10">
        <AnimatedSectionHeader 
          index={1} 
          title="沉浸画廊" 
          count={galleryImages.length} 
        />
        
        <div className="mt-12 mb-24 max-w-2xl">
          <p className="text-gray-500 dark:text-gray-400 text-xl font-extralight leading-relaxed">
            这是一个纯粹的数字展览空间，每一张图片都是关于光影与构思的沉思。
          </p>
        </div>

        {galleryImages.length > 0 ? (
          <Gallery images={galleryImages} />
        ) : (
          <div className="py-48 text-center border border-gray-200 dark:border-white/5 bg-gray-500/5 dark:bg-white/[0.02]">
            <p className="text-[10px] uppercase tracking-[0.5em] text-gray-400 dark:text-gray-600">暂无图片展示</p>
          </div>
        )}
      </div>

      <footer className="max-w-7xl mx-auto px-6 md:px-12 py-24 border-t border-gray-200 dark:border-white/5 flex justify-center relative z-10 text-gray-500">
        <a href="/" className="text-[10px] uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-colors">
          返回首页
        </a>
      </footer>
    </main>
  );
}
