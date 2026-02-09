import { cookies } from "next/headers";
import { NextRequest } from "next/server";

// 简单的 session 验证
export async function verifyAuth(request?: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;
    
    if (!session) {
      return false;
    }
    
    // 验证 session 格式（时间戳:hash）
    const [timestamp, hash] = session.split(":");
    if (!timestamp || !hash) {
      return false;
    }
    
    // 检查是否过期（24小时）
    const sessionTime = parseInt(timestamp);
    const now = Date.now();
    if (now - sessionTime > 24 * 60 * 60 * 1000) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

// 验证 API 请求
export async function requireAuth(request: NextRequest) {
  const isAuth = await verifyAuth(request);
  
  if (!isAuth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  return null;
}
