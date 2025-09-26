import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  Response,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Response as ExpressResponse } from 'express';

import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { multerConfig } from './config/multer.config';
import { FILES_CONSTANTS } from './constants/files.constants';

@ApiTags(FILES_CONSTANTS.CONTROLLER.TAG)
@Controller(FILES_CONSTANTS.CONTROLLER.PATH)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post(FILES_CONSTANTS.ROUTES.UPLOAD)
  @UseInterceptors(FileInterceptor(FILES_CONSTANTS.UPLOAD.FIELD_NAME_SINGLE, multerConfig))
  @ApiOperation({ summary: FILES_CONSTANTS.API.UPLOAD_SUMMARY })
  @ApiConsumes(FILES_CONSTANTS.API.CONSUMES_MULTIPART)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: FILES_CONSTANTS.MESSAGES.FILE_UPLOADED,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: `${FILES_CONSTANTS.MESSAGES.UNSUPPORTED_FILE_TYPE} ${FILES_CONSTANTS.MESSAGES.OR} ${FILES_CONSTANTS.MESSAGES.FILE_NOT_PROVIDED}`,
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: { user: User },
  ) {
    if (!file) {
      throw new BadRequestException(FILES_CONSTANTS.MESSAGES.FILE_NOT_PROVIDED);
    }

    const uploadedFile = await this.filesService.uploadFile(file, req.user.id);

    return {
      success: true,
      message: FILES_CONSTANTS.MESSAGES.FILE_UPLOADED,
      data: uploadedFile,
    };
  }

  @Post(FILES_CONSTANTS.ROUTES.UPLOAD_MULTIPLE)
  @UseInterceptors(FilesInterceptor(FILES_CONSTANTS.UPLOAD.FIELD_NAME_MULTIPLE, FILES_CONSTANTS.UPLOAD.MAX_FILES_COUNT, multerConfig))
  @ApiOperation({ summary: `${FILES_CONSTANTS.API.UPLOAD_MULTIPLE_SUMMARY} (до ${FILES_CONSTANTS.UPLOAD.MAX_FILES_COUNT})` })
  @ApiConsumes(FILES_CONSTANTS.API.CONSUMES_MULTIPART)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: FILES_CONSTANTS.MESSAGES.FILES_UPLOADED,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: `${FILES_CONSTANTS.MESSAGES.FILES_NOT_PROVIDED} ${FILES_CONSTANTS.MESSAGES.OR} ${FILES_CONSTANTS.MESSAGES.LIMIT_EXCEEDED}`,
  })
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: { user: User },
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException(FILES_CONSTANTS.MESSAGES.FILES_NOT_PROVIDED);
    }

    const uploadedFiles = await this.filesService.uploadMultipleFiles(
      files,
      req.user.id,
    );

    return {
      success: true,
      message: `${FILES_CONSTANTS.MESSAGES.FILES_UPLOADED}: ${uploadedFiles.length}`,
      data: uploadedFiles,
    };
  }

  @Get()
  @ApiOperation({ summary: FILES_CONSTANTS.API.GET_FILES_SUMMARY })
  @ApiResponse({
    status: HttpStatus.OK,
    description: FILES_CONSTANTS.MESSAGES.FILES_LIST,
  })
  @ApiQuery({ name: FILES_CONSTANTS.QUERY_PARAMS.PAGE, required: false, type: Number })
  @ApiQuery({ name: FILES_CONSTANTS.QUERY_PARAMS.LIMIT, required: false, type: Number })
  async getUserFiles(
    @Request() req: { user: User },
    @Query(FILES_CONSTANTS.QUERY_PARAMS.PAGE) page?: string,
    @Query(FILES_CONSTANTS.QUERY_PARAMS.LIMIT) limit?: string,
  ) {
    const result = await this.filesService.getUserFiles(req.user.id, {
      page: page ? parseInt(page, FILES_CONSTANTS.PARSING.DECIMAL_RADIX) : undefined,
      limit: limit ? parseInt(limit, FILES_CONSTANTS.PARSING.DECIMAL_RADIX) : undefined,
    });

    return {
      success: true,
      message: FILES_CONSTANTS.MESSAGES.FILES_LIST,
      ...result,
    };
  }

  @Get(FILES_CONSTANTS.ROUTES.STATS)
  @ApiOperation({ summary: FILES_CONSTANTS.API.GET_STATS_SUMMARY })
  @ApiResponse({
    status: HttpStatus.OK,
    description: FILES_CONSTANTS.MESSAGES.FILE_STATS,
  })
  async getFileStats(@Request() req: { user: User }) {
    const stats = await this.filesService.getFileStats(req.user.id);

    return {
      success: true,
      message: FILES_CONSTANTS.MESSAGES.FILE_STATS,
      data: stats,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: FILES_CONSTANTS.API.GET_FILE_INFO_SUMMARY })
  @ApiResponse({
    status: HttpStatus.OK,
    description: FILES_CONSTANTS.MESSAGES.FILE_INFO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: FILES_CONSTANTS.MESSAGES.FILE_NOT_FOUND,
  })
  @ApiParam({ name: FILES_CONSTANTS.QUERY_PARAMS.ID, type: Number })
  async getFileInfo(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: User },
  ) {
    const file = await this.filesService.getFileInfo(id, req.user.id);

    return {
      success: true,
      message: FILES_CONSTANTS.MESSAGES.FILE_INFO,
      data: file,
    };
  }

  @Get(FILES_CONSTANTS.ROUTES.DOWNLOAD)
  @ApiOperation({ summary: FILES_CONSTANTS.API.DOWNLOAD_FILE_SUMMARY })
  @ApiResponse({
    status: HttpStatus.OK,
    description: FILES_CONSTANTS.API.DOWNLOAD_DESCRIPTION,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: FILES_CONSTANTS.MESSAGES.FILE_NOT_FOUND,
  })
  @ApiParam({ name: FILES_CONSTANTS.QUERY_PARAMS.ID, type: Number })
  async downloadFile(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: User },
    @Response() res: ExpressResponse,
  ) {
    const { stream, file } = await this.filesService.getFileStream(
      id,
      req.user.id,
    );

    res.set({
      [FILES_CONSTANTS.HTTP_HEADERS.CONTENT_TYPE]: file.mimetype || FILES_CONSTANTS.HTTP_HEADERS.DEFAULT_CONTENT_TYPE,
      [FILES_CONSTANTS.HTTP_HEADERS.CONTENT_DISPOSITION]: `attachment; filename="${encodeURIComponent(file.originalName)}"`,
      [FILES_CONSTANTS.HTTP_HEADERS.CONTENT_LENGTH]: file.size?.toString() || '',
    });

    stream.pipe(res);
  }

  @Delete(':id')
  @ApiOperation({ summary: FILES_CONSTANTS.API.DELETE_FILE_SUMMARY })
  @ApiResponse({
    status: HttpStatus.OK,
    description: FILES_CONSTANTS.MESSAGES.FILE_DELETED,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: FILES_CONSTANTS.MESSAGES.FILE_NOT_FOUND,
  })
  @ApiParam({ name: FILES_CONSTANTS.QUERY_PARAMS.ID, type: Number })
  async deleteFile(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: User },
  ) {
    await this.filesService.deleteFile(id, req.user.id);

    return {
      success: true,
      message: FILES_CONSTANTS.MESSAGES.FILE_DELETED,
    };
  }

  @Post(FILES_CONSTANTS.ROUTES.CLEANUP)
  @ApiOperation({ summary: FILES_CONSTANTS.API.CLEANUP_SUMMARY })
  @ApiResponse({
    status: HttpStatus.OK,
    description: FILES_CONSTANTS.MESSAGES.CLEANUP_COMPLETED,
  })
  async cleanupOrphanedFiles() {
    const result = await this.filesService.cleanupOrphanedFiles();

    return {
      success: true,
      message: FILES_CONSTANTS.MESSAGES.CLEANUP_COMPLETED,
      data: result,
    };
  }
}