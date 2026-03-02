/**
 * 转换图片 URL，确保使用 /api/uploads/ 路径
 * 这样可以避免 Next.js 静态文件缓存问题，新上传的图片可以立即访问
 */
export function getImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  
  // 如果已经是 /api/uploads/ 开头，直接返回
  if (url.startsWith("/api/uploads/")) {
    return url;
  }
  
  // 如果是 /uploads/ 开头，转换为 /api/uploads/
  if (url.startsWith("/uploads/")) {
    return url.replace("/uploads/", "/api/uploads/");
  }
  
  // 如果是完整 URL（http:// 或 https://），直接返回
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  
  // 其他情况，假设是相对路径，添加 /api/uploads/ 前缀
  if (url.startsWith("/")) {
    return `/api/uploads${url}`;
  }
  
  return `/api/uploads/${url}`;
}
