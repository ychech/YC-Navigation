import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const configs = await prisma.siteConfig.findMany();
  return NextResponse.json(configs);
}

export async function PUT(req: Request) {
  const { configs } = await req.json(); // Array of { key, value }
  
  // 获取现有配置
  const existingConfigs = await prisma.siteConfig.findMany();
  const existingKeys = existingConfigs.map(c => c.key);
  const newKeys = configs.map((c: { key: string }) => c.key);
  
  // 找出需要删除的 key（存在于数据库但不在新列表中）
  const keysToDelete = existingKeys.filter(k => !newKeys.includes(k));
  
  // 删除被移除的配置
  if (keysToDelete.length > 0) {
    await prisma.siteConfig.deleteMany({
      where: { key: { in: keysToDelete } }
    });
  }
  
  // 更新或创建配置
  const updates = configs.map((cfg: { key: string, value: string }) => 
    prisma.siteConfig.upsert({
      where: { key: cfg.key },
      update: { value: cfg.value },
      create: { key: cfg.key, value: cfg.value },
    })
  );
  
  await Promise.all(updates);
  return NextResponse.json({ success: true });
}
