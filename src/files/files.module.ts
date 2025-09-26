import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MulterModule } from '@nestjs/platform-express';

import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { File } from './entities/file.entity';
import { createMulterOptions } from './config/multer.config';

@Module({
  imports: [
    SequelizeModule.forFeature([File]),
    MulterModule.registerAsync({
      useFactory: createMulterOptions,
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}