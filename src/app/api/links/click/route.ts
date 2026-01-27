import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const text = await req.text();
    if (!text) return NextResponse.json({ error: "Empty body" }, { status: 400 });
    
    const { id } = JSON.parse(text);
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    
    const link = await prisma.link.update({
      where: { id: parseInt(id) },
      data: {
        clicks: {
          increment: 1
        }
      }
    });
    
    return NextResponse.json(link);
  } catch (e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
