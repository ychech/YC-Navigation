import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
  const { oldPassword, newPassword } = await req.json();
  
  // Get stored password
  let storedPassword = await prisma.siteConfig.findUnique({
    where: { key: "admin_password" }
  });

  const currentPassword = storedPassword ? storedPassword.value : "admin123";

  if (oldPassword !== currentPassword) {
    return NextResponse.json({ success: false, message: "旧密码不正确" }, { status: 400 });
  }

  // Update or create the password config
  await prisma.siteConfig.upsert({
    where: { key: "admin_password" },
    update: { value: newPassword },
    create: { key: "admin_password", value: newPassword }
  });

  return NextResponse.json({ success: true });
}
