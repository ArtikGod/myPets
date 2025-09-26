import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';
import { FILES_CONSTANTS } from '../constants/files.constants';

export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = join(process.cwd(), FILES_CONSTANTS.UPLOAD.DIRECTORY);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimes = FILES_CONSTANTS.UPLOAD.ALLOWED_MIMES;

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException(
          `${FILES_CONSTANTS.MESSAGES.UNSUPPORTED_FILE_TYPE}: ${file.mimetype}. ${FILES_CONSTANTS.MESSAGES.ALLOWED_TYPES}: ${allowedMimes.join(', ')}`
        ),
        false
      );
    }
  },
  limits: {
    fileSize: FILES_CONSTANTS.UPLOAD.MAX_FILE_SIZE,
    files: FILES_CONSTANTS.UPLOAD.MAX_FILES_COUNT,
  },
};

export const createMulterOptions = (): MulterOptions => multerConfig;