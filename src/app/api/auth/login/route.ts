import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { password } = await req.json();
  
  // Get stored password from config
  let storedPassword = await prisma.siteConfig.findUnique({
    where: { key: "admin_password" }
  });

  // Default password if not set
  const defaultPassword = "admin123";
  const validPassword = storedPassword ? storedPassword.value : defaultPassword;

  if (password === validPassword) {
    // Create session cookie
    const response = NextResponse.json({ success: true });
    const timestamp = Date.now();
    const sessionValue = `${timestamp}:authenticated`;
    
    // Set cookie - 24 hours expiry
    response.cookies.set("admin_session", sessionValue, {
      httpOnly: true,
      secure: false, // Allow http for localhost
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours in seconds
      path: "/",
    });
    
    return response;
  } else {
    return NextResponse.json({ success: false, message: "密码错误" }, { status: 401 });
  }
}
