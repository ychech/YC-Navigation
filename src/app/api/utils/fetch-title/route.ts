import { NextResponse } from "next/server";

// SSRF 防护：禁止访问的内网地址
const BLOCKED_HOSTS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '[::1]',
  '169.254.169.254',  // AWS/GCP/阿里云元数据
  '100.100.100.200',  // 阿里云元数据
  'metadata.google.internal',
  'metadata.azure.internal',
];

// 验证 URL 是否安全
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
    
    // 只允许 http 和 https
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }
    
    // 禁止访问内网地址
    const hostname = url.hostname.toLowerCase();
    if (BLOCKED_HOSTS.includes(hostname)) {
      return false;
    }
    
    // 禁止纯 IP 地址（可选）
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Regex.test(hostname)) {
      const parts = hostname.split('.').map(Number);
      // 禁止私有 IP 段
      if (parts[0] === 10) return false;                          // 10.x.x.x
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return false;  // 172.16-31.x.x
      if (parts[0] === 192 && parts[1] === 168) return false;     // 192.168.x.x
      if (parts[0] === 127) return false;                         // 127.x.x.x
    }
    
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ title: "" });

    // 验证 URL 安全性
    if (!isValidUrl(url)) {
      return NextResponse.json({ error: "Invalid or blocked URL" }, { status: 400 });
    }

    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // 设置超时
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ArtisticNav/1.0)',
      },
      next: { revalidate: 3600 }
    });
    
    clearTimeout(timeout);
    
    // 限制响应大小
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 1024 * 1024) {
      return NextResponse.json({ error: "Response too large" }, { status: 400 });
    }
    
    const html = await response.text();
    
    // 限制解析的 HTML 大小
    if (html.length > 1024 * 1024) {
      return NextResponse.json({ error: "HTML too large" }, { status: 400 });
    }
    
    const match = html.match(/<title>([^<]*)<\/title>/i);
    const title = match ? match[1].trim().slice(0, 200) : "";

    return NextResponse.json({ title });
  } catch (error) {
    return NextResponse.json({ title: "" });
  }
}
