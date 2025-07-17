import { ProductService } from "../services/productService";
import { Route, Tags, Post, Put, Delete, Get, Body, Path, SuccessResponse } from "tsoa";
import { Product } from "../entities/Product.entity";
import httpStatus from "http-status";
import { CreateProductDto, UpdateProductDto } from "../dto/product.dto";

@Route("/api/products")
@Tags("Products")
export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  @Post("/")
  @SuccessResponse(httpStatus.CREATED)
  async createProduct(@Body() data: CreateProductDto): Promise<Product> {
    return this.productService.create(data);
  }

  @Put("/{id}")
  @SuccessResponse(httpStatus.OK)
  async updateProduct(
    @Path() id: number,
    @Body() data: UpdateProductDto
  ): Promise<Product> {
    return this.productService.update(id, data);
  }

  @Delete("/{id}")
  @SuccessResponse(httpStatus.NO_CONTENT)
  async deleteProduct(@Path() id: number): Promise<void> {
    await this.productService.delete(id);
  }

  @Get("/")
  @SuccessResponse(httpStatus.OK)
  async getAllProducts(): Promise<Product[]> {
    return this.productService.getAll();
  }

  @Get("/by-category/{categoryId}")
  @SuccessResponse(httpStatus.OK)
  async getProductsByCategory(@Path() categoryId: number): Promise<Product[]> {
    return this.productService.getByCategory(categoryId);
  }
} 