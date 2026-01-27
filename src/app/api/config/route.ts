import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const configs = await prisma.siteConfig.findMany();
  return NextResponse.json(configs);
}

export async function PUT(req: Request) {
  const { configs } = await req.json(); // Array of { key, value }
  
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
