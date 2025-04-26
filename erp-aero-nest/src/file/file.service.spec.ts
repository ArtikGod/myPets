import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from './file.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';

const mockFileRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
});

describe('FileService', () => {
  let fileService: FileService;
  let fileRepo: Repository<FileEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        {
          provide: getRepositoryToken(FileEntity),
          useFactory: mockFileRepository,
        },
      ],
    }).compile();

    fileService = module.get<FileService>(FileService);
    fileRepo = module.get<Repository<FileEntity>>(getRepositoryToken(FileEntity));
    jest.clearAllMocks(); 
  });

  it('should be defined', () => {
    expect(fileService).toBeDefined();
  });

  describe('saveFile', () => {
    it('should save a file and return the saved file entity', async () => {
      const mockFile: Express.Multer.File = {
        originalname: 'test.txt',
        filename: 'unique-test.txt',
        mimetype: 'text/plain',
        size: 1024,
        buffer: Buffer.from('test content'),
      } as Express.Multer.File;

      const mockFileEntity = {
        id: 1,
        originalName: 'test.txt',
        filename: 'unique-test.txt',
        mimetype: 'text/plain',
        size: 1024,
      };

      (fileRepo.create as jest.Mock).mockReturnValue(mockFileEntity);
      (fileRepo.save as jest.Mock).mockResolvedValue(mockFileEntity);

      const result = await fileService.saveFile(mockFile);

      expect(fileRepo.create).toHaveBeenCalledWith({
        originalName: 'test.txt',
        filename: 'unique-test.txt',
        mimetype: 'text/plain',
        size: 1024,
      });
      expect(fileRepo.save).toHaveBeenCalledWith(mockFileEntity);
      expect(result).toEqual(mockFileEntity);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of files', async () => {
      const mockFileEntities = [
        { id: 1, originalName: 'test1.txt', filename: '1-test.txt', mimetype: 'text/plain', size: 1024 },
        { id: 2, originalName: 'test2.txt', filename: '2-test.txt', mimetype: 'image/jpeg', size: 2048 },
      ];
      const mockTotal = 2;

      (fileRepo.findAndCount as jest.Mock).mockResolvedValue([mockFileEntities, mockTotal]);

      const result = await fileService.findAll(1, 10);

      expect(fileRepo.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
      expect(result).toEqual({
        total: mockTotal,
        page: 1,
        listSize: 10,
        items: mockFileEntities,
      });
    });
  });

  describe('findOne', () => {
    it('should return a file entity by id', async () => {
      const mockFileEntity = { id: 1, originalName: 'test.txt', filename: 'test.txt' };
      (fileRepo.findOne as jest.Mock).mockResolvedValue(mockFileEntity);

      const result = await fileService.findOne(1);

      expect(fileRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockFileEntity);
    });

    it('should return undefined if file is not found', async () => {
      (fileRepo.findOne as jest.Mock).mockResolvedValue(undefined);

      const result = await fileService.findOne(1);

      expect(fileRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete a file by id and return the deleted file', async () => {
      const mockFileEntity = { id: 1, originalName: 'test.txt', filename: 'test.txt' };
      (fileRepo.findOne as jest.Mock).mockResolvedValue(mockFileEntity);
      (fileRepo.delete as jest.Mock).mockResolvedValue(undefined); 

      const result = await fileService.delete(1);

      expect(fileRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(fileRepo.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockFileEntity);
    });

    it('should return null if file is not found', async () => {
      (fileRepo.findOne as jest.Mock).mockResolvedValue(null);

      const result = await fileService.delete(1);

      expect(fileRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(fileRepo.delete).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a file and return the updated file entity', async () => {
      const mockFile: Express.Multer.File = {
        originalname: 'new_test.txt',
        filename: 'new-unique-test.txt',
        mimetype: 'image/png',
        size: 4096,
        buffer: Buffer.from('new test content'),
      } as Express.Multer.File;

      const mockExistingFileEntity = {
        id: 1,
        originalName: 'test.txt',
        filename: 'unique-test.txt',
        mimetype: 'text/plain',
        size: 1024,
      };

      const mockUpdatedFileEntity = {
        id: 1,
        originalName: 'new_test.txt',
        filename: 'new-unique-test.txt',
        mimetype: 'image/png',
        size: 4096,
      };

      (fileRepo.findOne as jest.Mock).mockResolvedValue(mockExistingFileEntity);
      (fileRepo.save as jest.Mock).mockResolvedValue(mockUpdatedFileEntity);

      const result = await fileService.update(1, mockFile);

      expect(fileRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(fileRepo.save).toHaveBeenCalledWith(mockUpdatedFileEntity);
      expect(result).toEqual(mockUpdatedFileEntity);
    });

    it('should return null if file to update is not found', async () => {
      (fileRepo.findOne as jest.Mock).mockResolvedValue(undefined);

      const mockFile: Express.Multer.File = {
        originalname: 'new_test.txt',
        filename: 'new-unique-test.txt',
        mimetype: 'image/png',
        size: 4096,
        buffer: Buffer.from('new test content'),
      } as Express.Multer.File;

      const result = await fileService.update(1, mockFile);

      expect(fileRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(fileRepo.save).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});