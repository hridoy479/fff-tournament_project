import { NextResponse } from 'next/server';
import formidable, { File, Fields, Files } from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const rename = promisify(fs.rename);

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing for file upload
  },
};

export async function POST(req: Request) {
  return new Promise<NextResponse>((resolve) => {
    const form = formidable({ multiples: false });

    form.parse(req as any, async (err: any, fields: Fields, files: Files) => {
      if (err) {
        return resolve(
          NextResponse.json({ success: false, message: 'Upload error' }, { status: 500 })
        );
      }

      // Get file safely
      let uploadedFile: File | undefined;
      const fileField = files.file;
      if (!fileField) {
        return resolve(
          NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 })
        );
      }

      // If it's an array, take the first one
      uploadedFile = Array.isArray(fileField) ? fileField[0] : fileField;

      try {
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        if (!fs.existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true });
        }

        const ext = path.extname(uploadedFile.originalFilename || '');
        const newFilename = uuidv4() + ext;
        const newPath = path.join(uploadDir, newFilename);

        await rename(uploadedFile.filepath, newPath);

        const fileUrl = `/uploads/${newFilename}`;
        resolve(NextResponse.json({ success: true, url: fileUrl }));
      } catch (e) {
        console.error(e);
        resolve(
          NextResponse.json({ success: false, message: 'File save error' }, { status: 500 })
        );
      }
    });
  });
}
