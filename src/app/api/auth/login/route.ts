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
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false, message: "密码错误" }, { status: 401 });
  }
}
