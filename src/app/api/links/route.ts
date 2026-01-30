import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { title, url, icon, snapshotUrl, description, categoryId } = await req.json();
  
  // Get max sortOrder for this category
  const lastLink = await prisma.link.findFirst({
    where: { categoryId: parseInt(categoryId) },
    orderBy: { sortOrder: 'desc' }
  });
  const newSortOrder = (lastLink?.sortOrder || 0) + 1;

  const link = await prisma.link.create({
    data: {
      title,
      url,
      icon,
      snapshotUrl,
      description,
      categoryId: parseInt(categoryId),
      sortOrder: newSortOrder,
    },
  });
  return NextResponse.json(link);
}

export async function PUT(req: Request) {
  const body = await req.json();

  // Handle reordering if array
  if (Array.isArray(body)) {
    try {
      await Promise.all(
        body.map((link: any, index: number) => 
          prisma.link.update({
            where: { id: link.id },
            data: { sortOrder: index }
          })
        )
      );
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: 'Reorder failed' }, { status: 500 });
    }
  }

  const { id, title, url, icon, snapshotUrl, description, categoryId } = body;
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
