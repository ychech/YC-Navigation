import { join } from "path";
import { mkdir, writeFile } from "fs/promises";
import { randomUUID } from "crypto";

// 允许的文件类型白名单
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

// 最大文件大小：5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// 验证文件
function validateFile(file: File): { valid: boolean; error?: string } {
  // 检查文件大小
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Max: 5MB` };
  }
  
  if (file.size === 0) {
    return { valid: false, error: "File is empty" };
  }

  // 检查 MIME 类型
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: `Invalid file type: ${file.type}` };
  }

  // 检查文件扩展名
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `Invalid extension: ${ext}` };
  }

  return { valid: true };
}

// 生成安全文件名
function generateSafeFilename(originalName: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'bin';
  const uuid = randomUUID();
  return `${uuid}.${ext}`;
}

// Storage Types
export interface UploadResult {
  url: string;
  error?: string;
}

export interface StorageProvider {
  upload(file: File): Promise<UploadResult>;
}

// Local Storage
export class LocalStorage implements StorageProvider {
  async upload(file: File): Promise<UploadResult> {
    try {
      // 验证文件
      const validation = validateFile(file);
      if (!validation.valid) {
        return { url: "", error: validation.error };
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // 创建上传目录
      const uploadDir = join(process.cwd(), "public/uploads");
      await mkdir(uploadDir, { recursive: true });

      // 生成安全文件名（不使用原始文件名）
      const filename = generateSafeFilename(file.name);
      const filepath = join(uploadDir, filename);

      await writeFile(filepath, buffer);
      
      return { url: `/uploads/${filename}` };
    } catch (error) {
      console.error("Upload error:", error);
      return { url: "", error: "Upload failed" };
    }
  }
}

// Factory
export class StorageFactory {
  static getProvider(): StorageProvider {
    return new LocalStorage();
  }
}
