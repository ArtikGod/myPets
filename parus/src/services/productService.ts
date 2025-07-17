import { db } from "../database/connection";
import { Product } from "../entities/Product.entity";
import { CreateProductDto, UpdateProductDto } from "../dto/product.dto";
import { 
  NotFoundError, 
  InvalidPriceError, 
  DatabaseError 
} from "../errors/AppError";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { DATABASE } from "../constants/database";

export class ProductService {
  async create(data: CreateProductDto): Promise<Product> {
    try {
      if (data.price < 0) {
        throw new InvalidPriceError();
      }

      const category = await db(DATABASE.TABLES.CATEGORIES)
        .where(DATABASE.FIELDS.ID, data.category_id)
        .first();

      if (!category) {
        throw new NotFoundError(ERROR_MESSAGES.CATEGORY.NOT_FOUND);
      }

      const [product] = await db(DATABASE.TABLES.PRODUCTS)
        .insert({
          [DATABASE.FIELDS.NAME]: data.name,
          [DATABASE.FIELDS.DESCRIPTION]: data.description,
          [DATABASE.FIELDS.PRICE]: data.price,
          [DATABASE.FIELDS.CATEGORY_ID]: data.category_id,
          [DATABASE.FIELDS.IS_ACTIVE]: true,
        })
        .returning("*");

      return product;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof InvalidPriceError) {
        throw error;
      }
      throw new DatabaseError(ERROR_MESSAGES.DATABASE.QUERY_ERROR, error);
    }
  }

  async update(id: number, data: UpdateProductDto): Promise<Product> {
    try {
      const existingProduct = await db(DATABASE.TABLES.PRODUCTS)
        .where(DATABASE.FIELDS.ID, id)
        .first();

      if (!existingProduct) {
        throw new NotFoundError(ERROR_MESSAGES.PRODUCT.NOT_FOUND);
      }

      if (data.category_id) {
        const category = await db(DATABASE.TABLES.CATEGORIES)
          .where(DATABASE.FIELDS.ID, data.category_id)
          .first();

        if (!category) {
          throw new NotFoundError(ERROR_MESSAGES.CATEGORY.NOT_FOUND);
        }
      }

      const [product] = await db(DATABASE.TABLES.PRODUCTS)
        .where(DATABASE.FIELDS.ID, id)
        .update({
          [DATABASE.FIELDS.NAME]: data.name,
          [DATABASE.FIELDS.DESCRIPTION]: data.description,
          [DATABASE.FIELDS.PRICE]: data.price,
          [DATABASE.FIELDS.CATEGORY_ID]: data.category_id,
        })
        .returning("*");

      return product;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(ERROR_MESSAGES.DATABASE.QUERY_ERROR, error);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const existingProduct = await db(DATABASE.TABLES.PRODUCTS)
        .where(DATABASE.FIELDS.ID, id)
        .first();

      if (!existingProduct) {
        throw new NotFoundError(ERROR_MESSAGES.PRODUCT.NOT_FOUND);
      }

      await db(DATABASE.TABLES.PRODUCTS)
        .where(DATABASE.FIELDS.ID, id)
        .delete();
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(ERROR_MESSAGES.DATABASE.QUERY_ERROR, error);
    }
  }

  async getAll(): Promise<Product[]> {
    try {
      return await db(DATABASE.TABLES.PRODUCTS)
        .where(DATABASE.FIELDS.IS_ACTIVE, true)
        .orderBy(DATABASE.FIELDS.NAME);
    } catch (error) {
      throw new DatabaseError(ERROR_MESSAGES.DATABASE.QUERY_ERROR, error);
    }
  }

  async getByCategory(categoryId: number): Promise<Product[]> {
    try {
      const category = await db(DATABASE.TABLES.CATEGORIES)
        .where(DATABASE.FIELDS.ID, categoryId)
        .first();

      if (!category) {
        throw new NotFoundError(ERROR_MESSAGES.CATEGORY.NOT_FOUND);
      }

      return await db(DATABASE.TABLES.PRODUCTS)
        .where({
          [DATABASE.FIELDS.CATEGORY_ID]: categoryId,
          [DATABASE.FIELDS.IS_ACTIVE]: true,
        })
        .orderBy(DATABASE.FIELDS.NAME);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(ERROR_MESSAGES.DATABASE.QUERY_ERROR, error);
    }
  }
} 