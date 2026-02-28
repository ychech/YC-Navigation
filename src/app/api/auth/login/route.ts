import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  
  // Default credentials
  const defaultUsername = "admin";
  const defaultPassword = "admin123";
  
  // Get stored credentials from config
  const storedUsername = await prisma.siteConfig.findUnique({
    where: { key: "admin_username" }
  });
  const storedPassword = await prisma.siteConfig.findUnique({
    where: { key: "admin_password" }
  });

  const validUsername = storedUsername ? storedUsername.value : defaultUsername;
  const validPassword = storedPassword ? storedPassword.value : defaultPassword;

  if (username === validUsername && password === validPassword) {
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
    return NextResponse.json({ success: false, message: "用户名或密码错误" }, { status: 401 });
  }
}
