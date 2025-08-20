import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs/promises'; // Use fs.promises for async operations
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authenticateAdmin } from '@/lib/auth';

export const config = {
  api: {
    bodyParser: false, // Ensure body parsing is disabled for file uploads
  },
};

export async function POST(req: NextRequest) {
  // Authenticate and Authorize
  const authResult = await authenticateAdmin(req);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as Blob | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    // Basic file type validation
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ success: false, message: 'Invalid file type. Only images (JPEG, PNG, GIF, WEBP) are allowed.' }, { status: 400 });
    }

    // Basic file size validation (5MB limit)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, message: 'File size exceeds limit (5MB)' }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name || '');
    const newFilename = uuidv4() + ext;
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    const newPath = path.join(uploadDir, newFilename);

    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Write the file to the filesystem
    await fs.writeFile(newPath, buffer);

    const fileUrl = `/uploads/${newFilename}`;
    return NextResponse.json({ success: true, url: fileUrl });
  } catch (e: any) {
    console.error('File upload error:', e);
    return NextResponse.json({ success: false, message: 'File upload failed' }, { status: 500 });
  }
}