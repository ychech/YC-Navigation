import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const slides = await prisma.heroSlide.findMany({
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json(slides);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { title, subtitle, description, codeSnippet, isActive } = body;
  
  const slide = await prisma.heroSlide.create({
    data: {
      title,
      subtitle,
      description,
      codeSnippet,
      isActive: isActive ?? true,
    },
  });
  return NextResponse.json(slide);
}

export async function PUT(req: Request) {
  const body = await req.json();
  
  // Handle array for reordering
  if (Array.isArray(body)) {
    const updates = body.map((slide, index) => 
      prisma.heroSlide.update({
        where: { id: slide.id },
        data: { sortOrder: index },
      })
    );
    await prisma.$transaction(updates);
    return NextResponse.json({ success: true });
  }

  // Handle single update
  const { id, title, subtitle, description, codeSnippet, isActive } = body;
  const slide = await prisma.heroSlide.update({
    where: { id },
    data: {
      title,
      subtitle,
      description,
      codeSnippet,
      isActive,
    },
  });
  return NextResponse.json(slide);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.heroSlide.delete({
    where: { id: Number(id) },
  });
  return NextResponse.json({ success: true });
}
