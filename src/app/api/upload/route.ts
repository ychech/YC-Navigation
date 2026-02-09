import { NextResponse } from "next/server";
import { StorageFactory } from "@/lib/storage";
import { verifyAuth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // 验证管理员身份
    const isAuth = await verifyAuth();
    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Use the storage factory to get the configured provider
    const storage = StorageFactory.getProvider();
    const result = await storage.upload(file);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    
    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
