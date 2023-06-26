import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

export const uploadInterceptor = () =>
  FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        if (file) {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileExtension = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
        } else {
          cb(null, null); // Skip file upload and return null filename
        }
      },
    }),
  });
