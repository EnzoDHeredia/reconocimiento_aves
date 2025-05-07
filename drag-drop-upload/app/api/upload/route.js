import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

// Desactivar el body parser de Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  const form = new IncomingForm();
  const uploadDir = path.join(process.cwd(), '/public/uploads');

  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  return new Promise((resolve, reject) => {
    form.uploadDir = uploadDir;
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(new Response(JSON.stringify({ error: 'Upload failed' }), { status: 500 }));
        return;
      }

      const file = files.file[0];
      const filePath = `/uploads/${path.basename(file.filepath)}`;
      resolve(Response.json({ filePath }));
    });
  });
}
