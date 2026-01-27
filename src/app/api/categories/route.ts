import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { links: true },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const { name } = await req.json();
  const category = await prisma.category.create({
    data: { name },
  });
  return NextResponse.json(category);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  
  // Also delete associated links first if needed, but Prisma schema might handle this with cascades
  // For now, let's just delete the category.
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
  const { id, name } = await req.json();
  const category = await prisma.category.update({
    where: { id: parseInt(id) },
    data: { name },
  });
  return NextResponse.json(category);
}
