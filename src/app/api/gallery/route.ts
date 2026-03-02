import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const images = await prisma.galleryImage.findMany({
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json(images);
}

export async function POST(req: Request) {
  try {
    const { url, title } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });
    
    // Get max sortOrder
    const lastImage = await prisma.galleryImage.findFirst({
      orderBy: { sortOrder: 'desc' }
    });
    const newSortOrder = (lastImage?.sortOrder || 0) + 1;
    
    const image = await prisma.galleryImage.create({
      data: { url, title, sortOrder: newSortOrder },
    });
    return NextResponse.json(image);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add image' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    
    // Handle reordering if array
    if (Array.isArray(body)) {
      await Promise.all(
        body.map((img: any, index: number) => 
          prisma.galleryImage.update({
            where: { id: img.id },
            data: { sortOrder: index }
          })
        )
      );
      return NextResponse.json({ success: true });
    }
    
    // Handle single update
    const { id, title, sortOrder } = body;
    const image = await prisma.galleryImage.update({
      where: { id: parseInt(id) },
      data: { title, sortOrder },
    });
    return NextResponse.json(image);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
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
