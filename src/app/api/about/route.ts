import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const about = await prisma.aboutContent.findFirst();
  return NextResponse.json(about);
}

export async function PUT(req: Request) {
  const { id, title, description } = await req.json();
  const about = await prisma.aboutContent.update({
    where: { id: parseInt(id) },
    data: { title, description },
  });
  return NextResponse.json(about);
}

export async function POST(req: Request) {
  const { title, description } = await req.json();
  const about = await prisma.aboutContent.create({
    data: { title, description },
  });
  return NextResponse.json(about);
}
