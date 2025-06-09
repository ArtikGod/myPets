import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Article } from '../entities/article.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';

describe('ArticlesController', () => {
  let controller: ArticlesController;
  let service: ArticlesService;

  const mockArticleRepository: Partial<Record<keyof Repository<Article>, jest.Mock>> = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockCacheManager: Partial<Cache> = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [
        ArticlesService,
        {
          provide: getRepositoryToken(Article),
          useValue: mockArticleRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    controller = module.get<ArticlesController>(ArticlesController);
    service = module.get<ArticlesService>(ArticlesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an article', async () => {
      const createDto: CreateArticleDto = {
        title: 'Test Article',
        description: 'Test Description',
        author: 0,
      };

      const user = { id: 1 } as any;
      const result = {
        id: 1,
        ...createDto,
        author: user,
      } as Article;

      const createSpy = jest.spyOn(service, 'create').mockResolvedValue(result);

      const response = await controller.create(createDto, user);
      expect(response).toEqual(result);
      expect(createSpy).toHaveBeenCalledWith(createDto, user.id);
    });
  });

  describe('findAll', () => {
    it('should return a list of articles with count', async () => {
      const articles = [
        {
          id: 1,
          title: 'Test',
          description: 'Desc',
          publicationDate: new Date(),
          author: { id: 1 },
        },
      ];

      const result = {
        data: articles as Article[],
        count: 1,
      };

      const findAllSpy = jest.spyOn(service, 'findAll').mockResolvedValue(result);

      const response = await controller.findAll({}, {});
      expect(response).toEqual(result);
      expect(findAllSpy).toHaveBeenCalledWith({}, {});
    });
  });

  describe('findOne', () => {
    it('should return a single article', async () => {
      const article = {
        id: 1,
        title: 'Test',
        description: 'Desc',
      } as Article;

      const findOneSpy = jest.spyOn(service, 'findOne').mockResolvedValue(article);

      const response = await controller.findOne('1');
      expect(response).toEqual(article);
      expect(findOneSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update and return the article', async () => {
      const updateDto: UpdateArticleDto = {
        title: 'Updated Title',
      };

      const user = { id: 1 } as any;

      const updatedArticle = {
        id: 1,
        ...updateDto,
        author: user,
      } as Article;

      const updateSpy = jest.spyOn(service, 'update').mockResolvedValue(updatedArticle);

      const response = await controller.update('1', updateDto, user);
      expect(response).toEqual(updatedArticle);
      expect(updateSpy).toHaveBeenCalledWith(1, updateDto, user.id);
    });
  });

  describe('remove', () => {
    it('should remove the article', async () => {
      const user = { id: 1 } as any;
      const removeSpy = jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await expect(controller.remove('1', user)).resolves.toBeUndefined();
      expect(removeSpy).toHaveBeenCalledWith(1, user.id);
    });
  });
});
