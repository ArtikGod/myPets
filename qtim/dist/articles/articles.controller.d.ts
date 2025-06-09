import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { FilterArticleDto } from './dto/filter-article.dto';
import { PaginationArticleDto } from './dto/pagination-article.dto';
import { User } from '../entities/user.entity';
export declare class ArticlesController {
    private readonly articlesService;
    constructor(articlesService: ArticlesService);
    create(dto: CreateArticleDto, user: User): Promise<import("../entities/article.entity").Article>;
    findAll(filterDto: FilterArticleDto, paginationDto: PaginationArticleDto): Promise<{
        data: import("../entities/article.entity").Article[];
        count: number;
    }>;
    findOne(id: string): Promise<import("../entities/article.entity").Article>;
    update(id: string, updateDto: UpdateArticleDto, user: User): Promise<import("../entities/article.entity").Article>;
    remove(id: string, user: User): Promise<void>;
}
