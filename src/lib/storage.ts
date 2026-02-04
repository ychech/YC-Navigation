import { join } from "path";
import { mkdir, writeFile } from "fs/promises";
import OSS from "ali-oss";

// --- Types ---
export interface UploadResult {
  url: string;
  error?: string;
}

export interface StorageProvider {
  upload(file: File): Promise<UploadResult>;
}

// --- Factory ---
export class StorageFactory {
  static getProvider(): StorageProvider {
    const type = process.env.STORAGE_TYPE || "local";
    
    if (type === "oss") {
      return new AliOssStorage();
    }
    
    return new LocalStorage();
  }
}

// --- Implementations ---

// 1. Local Storage (Default)
export class LocalStorage implements StorageProvider {
  async upload(file: File): Promise<UploadResult> {
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Ensure uploads directory exists
      const uploadDir = join(process.cwd(), "public/uploads");
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (e) {
        // Ignore if exists
      }

      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `image-${uniqueSuffix}.${ext}`;
      const path = join(uploadDir, filename);

      await writeFile(path, buffer);
      
      return { url: `/uploads/${filename}` };
    } catch (error) {
      console.error("Local upload error:", error);
      return { url: "", error: "Local upload failed" };
    }
  }
}

// 2. Alibaba Cloud OSS Storage
export class AliOssStorage implements StorageProvider {
  private client: OSS;

  constructor() {
    // Check for required env vars
    if (!process.env.OSS_REGION || !process.env.OSS_ACCESS_KEY_ID || !process.env.OSS_ACCESS_KEY_SECRET || !process.env.OSS_BUCKET) {
      console.error("Missing OSS environment variables");
      throw new Error("OSS configuration missing");
    }

    this.client = new OSS({
      region: process.env.OSS_REGION,
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
      bucket: process.env.OSS_BUCKET,
      secure: true, // Use HTTPS
    });
  }

  async upload(file: File): Promise<UploadResult> {
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `uploads/${uniqueSuffix}.${ext}`;

      // Upload to OSS
      const result = await this.client.put(filename, buffer);
      
      // Return the public URL (ensure your bucket has public read or CDN configured)
      // If you have a custom domain, you might want to use process.env.OSS_DOMAIN
      const url = process.env.OSS_DOMAIN 
        ? `${process.env.OSS_DOMAIN}/${filename}`
        : result.url;

      return { url };
    } catch (error) {
      console.error("OSS upload error:", error);
      return { url: "", error: "OSS upload failed" };
    }
  }
}
