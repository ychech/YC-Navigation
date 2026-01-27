import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { title, url, icon, snapshotUrl, description, categoryId } = await req.json();
  const link = await prisma.link.create({
    data: {
      title,
      url,
      icon,
      snapshotUrl,
      description,
      categoryId: parseInt(categoryId),
    },
  });
  return NextResponse.json(link);
}

export async function PUT(req: Request) {
  const { id, title, url, icon, snapshotUrl, description, categoryId } = await req.json();
  const link = await prisma.link.update({
    where: { id: parseInt(id) },
    data: {
      title,
      url,
      icon,
      snapshotUrl,
      description,
      categoryId: parseInt(categoryId),
    },
  });
  return NextResponse.json(link);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  
  await prisma.link.delete({
    where: { id: parseInt(id) },
  });
  
  return NextResponse.json({ success: true });
}
