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
  title: "艺术导航 | 大师级数字档案馆",
  description: "一个精心策划的数字体验、工具和灵感集合，专为追求实用之美的人士打造。",
  keywords: ["设计", "导航", "艺术", "工具", "灵感"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} ${jetbrains.variable} font-sans antialiased overflow-x-hidden transition-colors duration-300`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
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
