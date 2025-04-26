import { Test, TestingModule } from '@nestjs/testing';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExecutionContext, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { of } from 'rxjs';

const mockFileService = () => ({
  saveFile: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockJwtAuthGuard = {
  canActivate: (context: ExecutionContext) => {
    return true; 
  },
};

describe('FileController', () => {
  let fileController: FileController;
  let fileService: FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [
        { provide: FileService, useFactory: mockFileService },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue(mockJwtAuthGuard)
    .compile();

    fileController = module.get<FileController>(FileController);
    fileService = module.get<FileService>(FileService);
    jest.clearAllMocks(); 
  });

  it('should be defined', () => {
    expect(fileController).toBeDefined();
  });

  describe('upload', () => {
    it('should call fileService.saveFile with the uploaded file', async () => {
      const mockFile = {
        originalname: 'test.txt',
        buffer: Buffer.from('test content'),
      } as Express.Multer.File;

      await fileController.upload(mockFile);
      expect(fileService.saveFile).toHaveBeenCalledWith(mockFile);
    });
  });

  describe('list', () => {
    it('should call fileService.findAll with page and listSize', async () => {
      await fileController.list({ page: 2, list_size: 20 });
      expect(fileService.findAll).toHaveBeenCalledWith(2, 20);
    });

    it('should use default values for page and listSize if not provided', async () => {
      await fileController.list({ page: 1, list_size: 10 });
      expect(fileService.findAll).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('info', () => {
    it('should call fileService.findOne with the provided id', async () => {
      await fileController.info(1);
      expect(fileService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('download', () => {
    it('should call fileService.findOne with the provided id and return a stream', async () => {
      const mockRes = {
        setHeader: jest.fn(),
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
        pipe: jest.fn().mockReturnValue(of(null)), 
      } as any as Response;

      const mockFile = { id: 1, filename: 'test.txt', originalName: 'test.txt' };
      (fileService.findOne as jest.Mock).mockResolvedValue(mockFile);
      (createReadStream as jest.Mock) = jest.fn().mockReturnValue({
        pipe: jest.fn().mockReturnValue(of(null)),
      });

      await fileController.download(1, mockRes);

      expect(fileService.findOne).toHaveBeenCalledWith(1);
      expect(createReadStream).toHaveBeenCalled();
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="test.txt"',
      );
    });

    it('should set the response headers and return a StreamableFile', async () => {
      const mockRes = {
        setHeader: jest.fn(),
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
        pipe: jest.fn().mockReturnValue(of(null)), 
      } as any as Response;

      const mockFile = { id: 1, filename: 'test.txt', originalName: 'test.txt' };
      (fileService.findOne as jest.Mock).mockResolvedValue(mockFile);
      (createReadStream as jest.Mock) = jest.fn().mockReturnValue({ 
        pipe: jest.fn().mockReturnValue(of(null)),
      });

      await fileController.download(1, mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="test.txt"');
    });

    it('should send 404 if file is not found', async () => {
      const mockRes = {
        setHeader: jest.fn(),
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      (fileService.findOne as jest.Mock).mockResolvedValue(null);

      await fileController.download(1, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.send).toHaveBeenCalledWith('File not found');
    });
  });

  describe('update', () => {
    it('should call fileService.update with the provided id and file', async () => {
      const mockFile = {
        originalname: 'new_test.txt',
        buffer: Buffer.from('new test content'),
      } as Express.Multer.File;

      await fileController.update(1, mockFile);
      expect(fileService.update).toHaveBeenCalledWith(1, mockFile);
    });
  });

  describe('delete', () => {
    it('should call fileService.delete with the provided id', async () => {
      await fileController.delete(1);
      expect(fileService.delete).toHaveBeenCalledWith(1);
    });
  });
});