import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Query,
    UploadedFile,
    UseInterceptors,
    UseGuards,
    Res,
    Req,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { FileService } from './file.service';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { diskStorage } from 'multer';
  import { join } from 'path';
  import { createReadStream } from 'fs';
import { UPLOAD_DIR, ERROR_MESSAGES } from '../shared/constants';
import { ListQueryDto } from './dto/list-query.dto';
  
  @Controller('file')
  @UseGuards(JwtAuthGuard)
  export class FileController {
    constructor(private readonly fileService: FileService) {}
  
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + '-' + file.originalname);
        },
      }),
    }))
    async upload(@UploadedFile() file: Express.Multer.File) {
      return this.fileService.saveFile(file);
    }
  
    @Get('list')
    async list(@Query() query: ListQueryDto) {
      const { page, list_size } = query;
      return this.fileService.findAll(page, list_size);
    }
  
    @Get(':id')
    async info(@Param('id') id: number) {
      return this.fileService.findOne(id);
    }
  
    @Get('download/:id')
    async download(@Param('id') id: number, @Res() res) {
      const file = await this.fileService.findOne(id);
      if (!file) return res.status(404).send(ERROR_MESSAGES.FILE_NOT_FOUND);
  
      const filePath = join(process.cwd(), 'uploads', file.filename);
      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
      return createReadStream(filePath).pipe(res);
    }
  
    @Put('update/:id')
    @UseInterceptors(FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + '-' + file.originalname);
        },
      }),
    }))
    async update(@Param('id') id: number, @UploadedFile() file: Express.Multer.File) {
      return this.fileService.update(id, file);
    }
  
    @Delete('delete/:id')
    async delete(@Param('id') id: number) {
      return this.fileService.delete(id);
    }
  }
  