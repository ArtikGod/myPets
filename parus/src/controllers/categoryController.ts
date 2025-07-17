import { CategoryService } from "../services/categoryService";
import { Route, Tags, Post, Put, Delete, Get, Body, Path, SuccessResponse } from "tsoa";
import { Category, CategoryWithCount, CategoryTree } from "../entities/Category.entity";
import httpStatus from "http-status";
import { CreateCategoryDto, UpdateCategoryDto } from "../dto/category.dto";

@Route("/api/categories")
@Tags("Categories")
export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  @Post("/")
  @SuccessResponse(httpStatus.CREATED)
  async createCategory(@Body() data: CreateCategoryDto): Promise<Category> {
    return this.categoryService.create(data.name, data.parent_id);
  }

  @Put("/{id}")
  @SuccessResponse(httpStatus.OK)
  async updateCategory(
    @Path() id: number,
    @Body() data: UpdateCategoryDto
  ): Promise<Category> {
    return this.categoryService.update(id, data.name);
  }

  @Delete("/{id}")
  @SuccessResponse(httpStatus.NO_CONTENT)
  async deleteCategory(@Path() id: number): Promise<void> {
    await this.categoryService.delete(id);
  }

  @Get("/")
  @SuccessResponse(httpStatus.OK)
  async getActiveCategories(): Promise<CategoryWithCount[]> {
    return this.categoryService.getActiveCategories();
  }

  @Get("/hierarchy")
  @SuccessResponse(httpStatus.OK)
  async getCategoryHierarchy(): Promise<CategoryTree[]> {
    return this.categoryService.getCategoryHierarchy();
  }
} 