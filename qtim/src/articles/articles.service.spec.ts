import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { ArticlesService } from './articles.service';
import { Article } from '../entities/article.entity';
import { User } from '../entities/user.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { FilterArticleDto } from './dto/filter-article.dto';
import { PaginationArticleDto } from './dto/pagination-article.dto';
import { NotFoundException } from '@nestjs/common';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let articlesRepository: Repository<Article>;
  let cacheManager: Cache;

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    stores: {
      keys: jest.fn(),
    },
  };

  const mockArticlesRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: getRepositoryToken(Article),
          useValue: mockArticlesRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
    articlesRepository = module.get<Repository<Article>>(getRepositoryToken(Article));
    cacheManager = module.get<Cache>(CACHE_MANAGER);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return an article, invalidate cache', async () => {
      const dto: CreateArticleDto = { title: 'Test', description: 'Test Desc', author: 1 };
      const savedArticle = { id: 1, ...dto, publicationDate: new Date(), author: { id: 1 } };

      mockArticlesRepository.create.mockReturnValue(savedArticle);
      mockArticlesRepository.save.mockResolvedValue(savedArticle);
      mockCacheManager.stores.keys.mockResolvedValue(['articles:list:...']);
      mockCacheManager.del.mockResolvedValue(undefined);

      const result = await service.create(dto, 1);

      expect(result).toEqual(savedArticle);
      expect(mockArticlesRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        title: dto.title,
        description: dto.description,
        author: { id: 1 },
      }));
      expect(mockCacheManager.del).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return cached articles if cache hit', async () => {
      const cachedData = { data: [], count: 0 };
      mockCacheManager.get.mockResolvedValue(cachedData);

      const result = await service.findAll({}, { page: 1, limit: 10 });

      expect(result).toEqual(cachedData);
      expect(mockCacheManager.get).toHaveBeenCalled();
    });

    it('should fetch from DB if cache miss and cache the result', async () => {
      const filterDto: FilterArticleDto = {};
      const paginationDto: PaginationArticleDto = { page: 1, limit: 2 };
      const dbData = [{ id: 1 }, { id: 2 }] as Article[];

      mockCacheManager.get.mockResolvedValue(null);
      mockArticlesRepository.findAndCount.mockResolvedValue([dbData, 2]);
      mockCacheManager.set.mockResolvedValue(undefined);

      const result = await service.findAll(filterDto, paginationDto);

      expect(result.data).toEqual(dbData);
      expect(result.count).toBe(2);
      expect(mockArticlesRepository.findAndCount).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return cached article if cache hit', async () => {
      const article = { id: 1 } as Article;
      mockCacheManager.get.mockResolvedValue(article);

      const result = await service.findOne(1);

      expect(result).toEqual(article);
      expect(mockCacheManager.get).toHaveBeenCalled();
    });

    it('should return article from DB and cache it if not in cache', async () => {
      const article = { id: 1 } as Article;
      mockCacheManager.get.mockResolvedValue(null);
      mockArticlesRepository.findOne.mockResolvedValue(article);

      const result = await service.findOne(1);

      expect(result).toEqual(article);
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should throw NotFoundException if article not found', async () => {
      mockArticlesRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return article if found and owned by user', async () => {
      const existingArticle = { id: 1, title: 'Old', author: { id: 1 } };
      const dto: UpdateArticleDto = { title: 'New' };
      const updatedArticle = { ...existingArticle, ...dto };

      mockArticlesRepository.findOne.mockResolvedValue(existingArticle);
      mockArticlesRepository.save.mockResolvedValue(updatedArticle);
      mockCacheManager.stores.keys.mockResolvedValue(['articles:list:...']);
      mockCacheManager.del.mockResolvedValue(undefined);

      const result = await service.update(1, dto, 1);

      expect(result.title).toBe('New');
      expect(mockCacheManager.del).toHaveBeenCalled();
    });

    it('should throw NotFoundException if not found or not owner', async () => {
      mockArticlesRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, { title: 'x' }, 2)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete article if owned and found', async () => {
      mockArticlesRepository.delete.mockResolvedValue({ affected: 1 });
      mockCacheManager.stores.keys.mockResolvedValue(['articles:list:...']);
      mockCacheManager.del.mockResolvedValue(undefined);

      await expect(service.remove(1, 1)).resolves.not.toThrow();
      expect(mockCacheManager.del).toHaveBeenCalled();
    });

    it('should throw NotFoundException if article not found or not owned', async () => {
      mockArticlesRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(1, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
