import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from './entities/file.entity';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepo: Repository<FileEntity>,
  ) {}

  async saveFile(file: Express.Multer.File) {
    const newFile = this.fileRepo.create({
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
    });
    return this.fileRepo.save(newFile);
  }

  async findAll(page: number, listSize: number) {
    const [items, total] = await this.fileRepo.findAndCount({
      skip: (page - 1) * listSize,
      take: listSize,
    });
    return { total, page, listSize, items };
  }

  async findOne(id: number) {
    return this.fileRepo.findOne({ where: { id } });
  }

  async delete(id: number) {
    const file = await this.findOne(id);
    if (file) {
      await this.fileRepo.delete(id);
    }
    return file;
  }

  async update(id: number, file: Express.Multer.File) {
    const entity = await this.findOne(id);
    if (!entity) return null;

    entity.originalName = file.originalname;
    entity.filename = file.filename;
    entity.mimetype = file.mimetype;
    entity.size = file.size;
    return this.fileRepo.save(entity);
  }
}
