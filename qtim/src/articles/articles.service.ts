import {
  Injectable,
  NotFoundException,
  Inject,
  Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Article } from '../entities/article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { FilterArticleDto } from './dto/filter-article.dto';
import { PaginationArticleDto } from './dto/pagination-article.dto';
import { Cache } from 'cache-manager';
import { ARTICLES_LOG } from '../config/constants.article.service';

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);
  private readonly CACHE_PREFIX = 'articles';
  private readonly CACHE_TTL = 60 * 5; 

  constructor(
    @InjectRepository(Article)
    private articlesRepository: Repository<Article>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(
    createArticleDto: CreateArticleDto,
    authorId: number,
  ): Promise<Article> {
    const article = this.articlesRepository.create({
      ...createArticleDto,
      author: { id: authorId },
      publicationDate: new Date(),
    });

    await this.invalidateCache();
    const savedArticle = await this.articlesRepository.save(article);
    
    this.logger.log(ARTICLES_LOG.CREATED(article.id));
    return savedArticle;
  }

  async findAll(
    filterDto: FilterArticleDto,
    paginationDto: PaginationArticleDto,
  ): Promise<{ data: Article[]; count: number }> {
    const cacheKey = this.getListCacheKey(filterDto, paginationDto);
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      this.logger.debug(ARTICLES_LOG.CACHE_HIT(cacheKey));
      return cached as { data: Article[]; count: number };
    }

    const { page = 1, limit = 10 } = paginationDto;
    const { startDate, endDate, authorId } = filterDto;

    const where: any = {};
    if (startDate && endDate) {
      where.publicationDate = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.publicationDate = Between(new Date(startDate), new Date());
    } else if (endDate) {
      where.publicationDate = Between(new Date(0), new Date(endDate));
    }

    if (authorId) {
      where.author = { id: authorId };
    }

    const [data, count] = await this.articlesRepository.findAndCount({
      where,
      relations: ['author'],
      skip: (page - 1) * limit,
      take: limit,
      order: { publicationDate: 'DESC' },
    });

    const result = { data, count };
    await this.cacheManager.set(cacheKey, result, this.CACHE_TTL * 1000);
    
    this.logger.debug(ARTICLES_LOG.CACHE_SET(cacheKey));
    return result;
  }

  async findOne(id: number): Promise<Article> {
    const cacheKey = this.getSingleCacheKey(id);
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      this.logger.debug(ARTICLES_LOG.CACHE_HIT(cacheKey));
      return cached as Article;
    }

    const article = await this.articlesRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!article) {
      throw new NotFoundException(ARTICLES_LOG.NOT_FOUND(id));
    }

    await this.cacheManager.set(cacheKey, article, this.CACHE_TTL * 1000);
    this.logger.debug(ARTICLES_LOG.CACHE_SET(cacheKey));
    return article;
  }

  async update(
    id: number,
    updateArticleDto: UpdateArticleDto,
    userId: number,
  ): Promise<Article> {
    const article = await this.articlesRepository.findOne({
      where: { id, author: { id: userId } },
    });

    if (!article) {
      throw new NotFoundException(
        ARTICLES_LOG.NOT_PERMITTED(id));
    }

    Object.assign(article, updateArticleDto);
    await this.invalidateCache();
    
    const updatedArticle = await this.articlesRepository.save(article);
    this.logger.log(ARTICLES_LOG.UPDATED(id))
    return updatedArticle;
  }

  async remove(id: number, userId: number): Promise<void> {
    const result = await this.articlesRepository.delete({
      id,
      author: { id: userId },
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        ARTICLES_LOG.NOT_PERMITTED(id),
      );
    }

    await this.invalidateCache();
    this.logger.log(ARTICLES_LOG.DELETED(id));
  }

  private getListCacheKey(
    filter: FilterArticleDto,
    pagination: PaginationArticleDto,
  ): string {
    const filterKey = JSON.stringify({
      startDate: filter.startDate,
      endDate: filter.endDate,
      authorId: filter.authorId,
    });
    
    const paginationKey = JSON.stringify({
      page: pagination.page,
      limit: pagination.limit,
    });

    return `${this.CACHE_PREFIX}:list:${filterKey}:${paginationKey}`;
  }

  private getSingleCacheKey(id: number): string {
    return `${this.CACHE_PREFIX}:item:${id}`;
  }

  private async invalidateCache(): Promise<void> {
  try {
    const redisStore = (this.cacheManager.stores as any);

    if (redisStore?.keys && typeof redisStore.keys === 'function') {
      const keys: string[] = await redisStore.keys(`${this.CACHE_PREFIX}:*`);
      if (keys.length > 0) {
        await Promise.all(keys.map((key) => this.cacheManager.del(key)));
      }
    } else {
      this.logger.warn(ARTICLES_LOG.CACHE_STORE);
    }
  } catch (error) {
    this.logger.error(ARTICLES_LOG.CACHE_ERROR(error.stack));
  }
}
}