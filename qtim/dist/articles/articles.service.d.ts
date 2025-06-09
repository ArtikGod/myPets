import { Repository } from 'typeorm';
import { Article } from '../entities/article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { FilterArticleDto } from './dto/filter-article.dto';
import { PaginationArticleDto } from './dto/pagination-article.dto';
import { Cache } from 'cache-manager';
export declare class ArticlesService {
    private articlesRepository;
    private cacheManager;
    private readonly logger;
    private readonly CACHE_PREFIX;
    private readonly CACHE_TTL;
    constructor(articlesRepository: Repository<Article>, cacheManager: Cache);
    create(createArticleDto: CreateArticleDto, authorId: number): Promise<Article>;
    findAll(filterDto: FilterArticleDto, paginationDto: PaginationArticleDto): Promise<{
        data: Article[];
        count: number;
    }>;
    findOne(id: number): Promise<Article>;
    update(id: number, updateArticleDto: UpdateArticleDto, userId: number): Promise<Article>;
    remove(id: number, userId: number): Promise<void>;
    private getListCacheKey;
    private getSingleCacheKey;
    private invalidateCache;
}
