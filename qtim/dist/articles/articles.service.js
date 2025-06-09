"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ArticlesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticlesService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const article_entity_1 = require("../entities/article.entity");
const constants_article_service_1 = require("../config/constants.article.service");
let ArticlesService = ArticlesService_1 = class ArticlesService {
    constructor(articlesRepository, cacheManager) {
        this.articlesRepository = articlesRepository;
        this.cacheManager = cacheManager;
        this.logger = new common_1.Logger(ArticlesService_1.name);
        this.CACHE_PREFIX = 'articles';
        this.CACHE_TTL = 60 * 5;
    }
    async create(createArticleDto, authorId) {
        const article = this.articlesRepository.create({
            ...createArticleDto,
            author: { id: authorId },
            publicationDate: new Date(),
        });
        await this.invalidateCache();
        const savedArticle = await this.articlesRepository.save(article);
        this.logger.log(constants_article_service_1.ARTICLES_LOG.CREATED(article.id));
        return savedArticle;
    }
    async findAll(filterDto, paginationDto) {
        const cacheKey = this.getListCacheKey(filterDto, paginationDto);
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            this.logger.debug(constants_article_service_1.ARTICLES_LOG.CACHE_HIT(cacheKey));
            return cached;
        }
        const { page = 1, limit = 10 } = paginationDto;
        const { startDate, endDate, authorId } = filterDto;
        const where = {};
        if (startDate && endDate) {
            where.publicationDate = (0, typeorm_2.Between)(new Date(startDate), new Date(endDate));
        }
        else if (startDate) {
            where.publicationDate = (0, typeorm_2.Between)(new Date(startDate), new Date());
        }
        else if (endDate) {
            where.publicationDate = (0, typeorm_2.Between)(new Date(0), new Date(endDate));
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
        this.logger.debug(constants_article_service_1.ARTICLES_LOG.CACHE_SET(cacheKey));
        return result;
    }
    async findOne(id) {
        const cacheKey = this.getSingleCacheKey(id);
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            this.logger.debug(constants_article_service_1.ARTICLES_LOG.CACHE_HIT(cacheKey));
            return cached;
        }
        const article = await this.articlesRepository.findOne({
            where: { id },
            relations: ['author'],
        });
        if (!article) {
            throw new common_1.NotFoundException(constants_article_service_1.ARTICLES_LOG.NOT_FOUND(id));
        }
        await this.cacheManager.set(cacheKey, article, this.CACHE_TTL * 1000);
        this.logger.debug(constants_article_service_1.ARTICLES_LOG.CACHE_SET(cacheKey));
        return article;
    }
    async update(id, updateArticleDto, userId) {
        const article = await this.articlesRepository.findOne({
            where: { id, author: { id: userId } },
        });
        if (!article) {
            throw new common_1.NotFoundException(constants_article_service_1.ARTICLES_LOG.NOT_PERMITTED(id));
        }
        Object.assign(article, updateArticleDto);
        await this.invalidateCache();
        const updatedArticle = await this.articlesRepository.save(article);
        this.logger.log(constants_article_service_1.ARTICLES_LOG.UPDATED(id));
        return updatedArticle;
    }
    async remove(id, userId) {
        const result = await this.articlesRepository.delete({
            id,
            author: { id: userId },
        });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(constants_article_service_1.ARTICLES_LOG.NOT_PERMITTED(id));
        }
        await this.invalidateCache();
        this.logger.log(constants_article_service_1.ARTICLES_LOG.DELETED(id));
    }
    getListCacheKey(filter, pagination) {
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
    getSingleCacheKey(id) {
        return `${this.CACHE_PREFIX}:item:${id}`;
    }
    async invalidateCache() {
        try {
            const redisStore = this.cacheManager.stores;
            if (redisStore?.keys && typeof redisStore.keys === 'function') {
                const keys = await redisStore.keys(`${this.CACHE_PREFIX}:*`);
                if (keys.length > 0) {
                    await Promise.all(keys.map((key) => this.cacheManager.del(key)));
                }
            }
            else {
                this.logger.warn(constants_article_service_1.ARTICLES_LOG.CACHE_STORE);
            }
        }
        catch (error) {
            this.logger.error(constants_article_service_1.ARTICLES_LOG.CACHE_ERROR(error.stack));
        }
    }
};
exports.ArticlesService = ArticlesService;
exports.ArticlesService = ArticlesService = ArticlesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(article_entity_1.Article)),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository, Object])
], ArticlesService);
//# sourceMappingURL=articles.service.js.map