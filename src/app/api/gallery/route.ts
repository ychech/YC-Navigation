import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const images = await prisma.galleryImage.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(images);
}

export async function POST(req: Request) {
  try {
    const { url, title } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });
    
    const image = await prisma.galleryImage.create({
      data: { url, title },
    });
    return NextResponse.json(image);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add image' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  
  await prisma.galleryImage.delete({
    where: { id: parseInt(id) },
  });
  return NextResponse.json({ success: true });
}
