import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { createReadStream, existsSync, unlink, readdir } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

import { File } from './entities/file.entity';
import { PaginationOptions, PaginatedResult } from '../common/interfaces/auth.interface';
import { FILES_CONSTANTS } from './constants/files.constants';

const unlinkAsync = promisify(unlink);
const readdirAsync = promisify(readdir);

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(File) private fileModel: typeof File,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    userId: number,
  ): Promise<File> {
    try {
      const fileRecord = await this.fileModel.create({
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        userId,
      });

      return fileRecord;
    } catch (error) {
      await this.deleteFileFromDisk(file.path);
      throw new InternalServerErrorException(FILES_CONSTANTS.MESSAGES.SAVE_ERROR);
    }
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    userId: number,
  ): Promise<File[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, userId));

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      await Promise.all(
        files.map(file => this.deleteFileFromDisk(file.path))
      );
      throw error;
    }
  }

  async getFileById(fileId: number, userId: number): Promise<File> {
    const file = await this.fileModel.findOne({
      where: {
        id: fileId,
        userId,
      },
    });

    if (!file) {
      throw new NotFoundException(FILES_CONSTANTS.MESSAGES.FILE_NOT_FOUND);
    }

    return file;
  }

  async getUserFiles(
    userId: number,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<File>> {
    const { page = FILES_CONSTANTS.PAGINATION.DEFAULT_PAGE, limit = FILES_CONSTANTS.PAGINATION.DEFAULT_LIMIT } = options;
    const offset = (page - 1) * limit;

    const { count, rows } = await this.fileModel.findAndCountAll({
      where: { userId },
      limit,
      offset,
      order: [[FILES_CONSTANTS.DATABASE.ORDER_BY, FILES_CONSTANTS.DATABASE.ORDER_DIRECTION]],
    });

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async deleteFile(fileId: number, userId: number): Promise<void> {
    const file = await this.getFileById(fileId, userId);

    await this.deleteFileFromDisk(file.path);

    await file.destroy();
  }

  async getFileStream(fileId: number, userId: number): Promise<{
    stream: NodeJS.ReadableStream;
    file: File;
  }> {
    const file = await this.getFileById(fileId, userId);

    if (!existsSync(file.path)) {
      throw new NotFoundException(FILES_CONSTANTS.MESSAGES.FILE_NOT_FOUND_ON_DISK);
    }

    const stream = createReadStream(file.path);

    return { stream, file };
  }

  async getFileInfo(fileId: number, userId: number): Promise<File> {
    return this.getFileById(fileId, userId);
  }

  private async deleteFileFromDisk(filePath: string): Promise<void> {
    try {
      if (existsSync(filePath)) {
        await unlinkAsync(filePath);
      }
    } catch (error) {
      console.error(`${FILES_CONSTANTS.MESSAGES.DELETE_ERROR} ${filePath}:`, error);
    }
  }

  async cleanupOrphanedFiles(): Promise<{ cleaned: number; errors: string[] }> {
    const uploadDir = join(process.cwd(), FILES_CONSTANTS.UPLOAD.DIRECTORY);
    const errors: string[] = [];
    let cleaned = 0;

    try {
      const filesOnDisk = await readdirAsync(uploadDir);

      const filesInDb = await this.fileModel.findAll({
        attributes: [FILES_CONSTANTS.DATABASE.ATTRIBUTES.FILENAME],
      });

      const dbFilenames = new Set(filesInDb.map(f => f.filename));

      const orphanedFiles = filesOnDisk.filter(
        filename => !dbFilenames.has(filename)
      );

      for (const filename of orphanedFiles) {
        try {
          await this.deleteFileFromDisk(join(uploadDir, filename));
          cleaned++;
        } catch (error) {
          errors.push(`${FILES_CONSTANTS.MESSAGES.DELETE_ERROR} ${filename}: ${error.message}`);
        }
      }

      return { cleaned, errors };
    } catch (error) {
      throw new InternalServerErrorException(
        `${FILES_CONSTANTS.MESSAGES.CLEANUP_ERROR}: ${error.message}`
      );
    }
  }

  async getFileStats(userId: number): Promise<{
    totalFiles: number;
    totalSize: number;
    totalSizeMB: number;
    fileTypes: Record<string, number>;
  }> {
    const files = await this.fileModel.findAll({
      where: { userId },
      attributes: [FILES_CONSTANTS.DATABASE.ATTRIBUTES.MIMETYPE, FILES_CONSTANTS.DATABASE.ATTRIBUTES.SIZE],
    });

    const totalFiles = files.length;
    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
    const totalSizeMB = Math.round(totalSize / FILES_CONSTANTS.SIZE.BYTES_IN_MB * 100) / 100;

    const fileTypes = files.reduce((acc, file) => {
      const type = file.mimetype || FILES_CONSTANTS.MESSAGES.UNKNOWN_TYPE;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalFiles,
      totalSize,
      totalSizeMB,
      fileTypes,
    };
  }
}