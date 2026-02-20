import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

const uploadsDir = 'uploads/media';

export const mediaMulterConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = extname(file.originalname) || '.jpg';
      cb(null, `img_${uniqueSuffix}${ext}`);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
};
