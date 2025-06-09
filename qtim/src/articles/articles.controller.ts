import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { FilterArticleDto } from './dto/filter-article.dto';
import { PaginationArticleDto } from './dto/pagination-article.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { User } from '../entities/user.entity';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { MESSAGE, SUMMARY, QUERY } from '../config/constants.article.controller';

@ApiTags('articles')
@Controller('articles')
@UseInterceptors(CacheInterceptor)
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: SUMMARY.CREATE })
  @ApiResponse({ status: HttpStatus.CREATED, description: MESSAGE.CREATED })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: MESSAGE.VALIDATION_ERROR })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: MESSAGE.UNAUTHORIZED })
  create(@Body() dto: CreateArticleDto, @CurrentUser() user: User) {
    return this.articlesService.create(dto, user.id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: SUMMARY.GET_ALL })
  @ApiQuery({ name: QUERY.PAGE, required: false, type: Number })
  @ApiQuery({ name: QUERY.LIMIT, required: false, type: Number })
  @ApiQuery({ name: QUERY.START_DATE, required: false, type: String })
  @ApiQuery({ name: QUERY.END_DATE, required: false, type: String })
  @ApiQuery({ name: QUERY.AUTHOR_ID, required: false, type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: MESSAGE.LIST_RETRIEVED })
  findAll(@Query() filterDto: FilterArticleDto, @Query() paginationDto: PaginationArticleDto) {
    return this.articlesService.findAll(filterDto, paginationDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: SUMMARY.GET_ONE })
  @ApiResponse({ status: HttpStatus.OK, description: MESSAGE.RETRIEVED })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: MESSAGE.NOT_FOUND })
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: SUMMARY.UPDATE })
  @ApiResponse({ status: HttpStatus.OK, description: MESSAGE.UPDATED })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: MESSAGE.NO_PERMISSION })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: MESSAGE.UNAUTHORIZED })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateArticleDto,
    @CurrentUser() user: User,
  ) {
    return this.articlesService.update(+id, updateDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: SUMMARY.DELETE })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: MESSAGE.DELETED })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: MESSAGE.NO_PERMISSION })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: MESSAGE.UNAUTHORIZED })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.articlesService.remove(+id, user.id);
  }
}
