import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ title: "" });

    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    const response = await fetch(targetUrl, {
      next: { revalidate: 3600 }
    });
    
    const html = await response.text();
    const match = html.match(/<title>([^<]*)<\/title>/i);
    const title = match ? match[1].trim() : "";

    return NextResponse.json({ title });
  } catch (error) {
    return NextResponse.json({ title: "" });
  }
}
