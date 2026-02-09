import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CustomCursor } from "@/components/CustomCursor";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "艺术导航 | 设计师的灵感宝库",
  description: "精选全球优质设计资源、灵感网站和生产力工具。为设计师、开发者和创意工作者打造的高效导航站。",
  keywords: ["设计导航", "设计师工具", "灵感网站", "UI设计", "UX设计", "前端工具", "设计资源", "创意导航"],
  authors: [{ name: "艺术导航" }],
  creator: "艺术导航",
  metadataBase: new URL("https://your-domain.com"),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.svg", type: "image/svg+xml", sizes: "180x180" },
    ],
  },
  openGraph: {
    type: "website",
    title: "艺术导航 | 设计师的灵感宝库",
    description: "精选全球优质设计资源、灵感网站和生产力工具",
    siteName: "艺术导航",
  },
  twitter: {
    card: "summary_large_image",
    title: "艺术导航 | 设计师的灵感宝库",
    description: "精选全球优质设计资源、灵感网站和生产力工具",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <style>{`
          /* 关键 CSS - 防止首次渲染闪烁 */
          html { background-color: rgb(253, 253, 253); }
          html.dark { background-color: rgb(2, 6, 23); }
          /* 确保内容可见 */
          #__next { min-height: 100vh; }
          /* 减少动画偏好支持 */
          @media (prefers-reduced-motion: reduce) {
            * { animation-duration: 0.01ms !important; }
          }
        `}</style>
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${jetbrains.variable} font-sans antialiased overflow-x-hidden`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          <div className="paper-texture" />
          <div className="ink-flow-bg" />
          <CustomCursor />
          <Toaster theme="system" position="bottom-right" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
