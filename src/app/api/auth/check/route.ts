import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session?.value) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Validate session format
  const parts = session.value.split(":");
  if (parts.length !== 2 || parts[1] !== "authenticated") {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Check if session is expired (24 hours)
  const timestamp = parseInt(parts[0]);
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours in ms

  if (now - timestamp > maxAge) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}
