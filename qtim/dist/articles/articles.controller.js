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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticlesController = void 0;
const common_1 = require("@nestjs/common");
const articles_service_1 = require("./articles.service");
const create_article_dto_1 = require("./dto/create-article.dto");
const update_article_dto_1 = require("./dto/update-article.dto");
const filter_article_dto_1 = require("./dto/filter-article.dto");
const pagination_article_dto_1 = require("./dto/pagination-article.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const user_decorator_1 = require("../common/decorators/user.decorator");
const user_entity_1 = require("../entities/user.entity");
const cache_interceptor_1 = require("../common/interceptors/cache.interceptor");
const swagger_1 = require("@nestjs/swagger");
const constants_article_controller_1 = require("../config/constants.article.controller");
let ArticlesController = class ArticlesController {
    constructor(articlesService) {
        this.articlesService = articlesService;
    }
    create(dto, user) {
        return this.articlesService.create(dto, user.id);
    }
    findAll(filterDto, paginationDto) {
        return this.articlesService.findAll(filterDto, paginationDto);
    }
    findOne(id) {
        return this.articlesService.findOne(+id);
    }
    update(id, updateDto, user) {
        return this.articlesService.update(+id, updateDto, user.id);
    }
    async remove(id, user) {
        await this.articlesService.remove(+id, user.id);
    }
};
exports.ArticlesController = ArticlesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: constants_article_controller_1.SUMMARY.CREATE }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: constants_article_controller_1.MESSAGE.CREATED }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: constants_article_controller_1.MESSAGE.VALIDATION_ERROR }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: constants_article_controller_1.MESSAGE.UNAUTHORIZED }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_article_dto_1.CreateArticleDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: constants_article_controller_1.SUMMARY.GET_ALL }),
    (0, swagger_1.ApiQuery)({ name: constants_article_controller_1.QUERY.PAGE, required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: constants_article_controller_1.QUERY.LIMIT, required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: constants_article_controller_1.QUERY.START_DATE, required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: constants_article_controller_1.QUERY.END_DATE, required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: constants_article_controller_1.QUERY.AUTHOR_ID, required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: constants_article_controller_1.MESSAGE.LIST_RETRIEVED }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_article_dto_1.FilterArticleDto, pagination_article_dto_1.PaginationArticleDto]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: constants_article_controller_1.SUMMARY.GET_ONE }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: constants_article_controller_1.MESSAGE.RETRIEVED }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: constants_article_controller_1.MESSAGE.NOT_FOUND }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: constants_article_controller_1.SUMMARY.UPDATE }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: constants_article_controller_1.MESSAGE.UPDATED }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: constants_article_controller_1.MESSAGE.NO_PERMISSION }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: constants_article_controller_1.MESSAGE.UNAUTHORIZED }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_article_dto_1.UpdateArticleDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: constants_article_controller_1.SUMMARY.DELETE }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NO_CONTENT, description: constants_article_controller_1.MESSAGE.DELETED }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: constants_article_controller_1.MESSAGE.NO_PERMISSION }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: constants_article_controller_1.MESSAGE.UNAUTHORIZED }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "remove", null);
exports.ArticlesController = ArticlesController = __decorate([
    (0, swagger_1.ApiTags)('articles'),
    (0, common_1.Controller)('articles'),
    (0, common_1.UseInterceptors)(cache_interceptor_1.CacheInterceptor),
    __metadata("design:paramtypes", [articles_service_1.ArticlesService])
], ArticlesController);
//# sourceMappingURL=articles.controller.js.map