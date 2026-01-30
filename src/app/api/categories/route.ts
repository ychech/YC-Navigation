import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { links: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const { name } = await req.json();
  
  // Get max sortOrder
  const lastCategory = await prisma.category.findFirst({
    orderBy: { sortOrder: 'desc' }
  });
  const newSortOrder = (lastCategory?.sortOrder || 0) + 1;

  const category = await prisma.category.create({
    data: { name, sortOrder: newSortOrder },
  });
  return NextResponse.json(category);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  
  try {
    await prisma.link.deleteMany({
      where: { categoryId: parseInt(id) }
    });
    await prisma.category.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const body = await req.json();
  
  // Handle sorting update if body is array
  if (Array.isArray(body)) {
    try {
      await Promise.all(
        body.map((cat: any, index: number) => 
          prisma.category.update({
            where: { id: cat.id },
            data: { sortOrder: index }
          })
        )
      );
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: 'Reorder failed' }, { status: 500 });
    }
  }

  // Handle single update
  const { id, name } = body;
  const category = await prisma.category.update({
    where: { id: parseInt(id) },
    data: { name },
  });
  return NextResponse.json(category);
}
