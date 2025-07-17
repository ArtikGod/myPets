import { db } from "../database/connection";
import type { Knex } from "knex";
import { Category, CategoryWithCount, CategoryTree } from "../entities/Category.entity";
import { 
  NotFoundError, 
  CategoryDepthError, 
  CategoryHasProductsError,
  DatabaseError 
} from "../errors/AppError";
import { CONFIG } from "../constants/config";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { DATABASE } from "../constants/database";

export class CategoryService {
  async create(name: string, parentId: number | null = null): Promise<Category> {
    try {
      let level = 1;
      
      if (parentId) {
        const parent = await db(DATABASE.TABLES.CATEGORIES)
          .where(DATABASE.FIELDS.ID, parentId)
          .first();
        if (!parent) {
          throw new NotFoundError(ERROR_MESSAGES.CATEGORY.PARENT_NOT_FOUND);
        }
        if (parent.level >= CONFIG.CATEGORY.MAX_DEPTH) {
          throw new CategoryDepthError();
        }
        level = parent.level + 1;
      }

      const [category] = await db(DATABASE.TABLES.CATEGORIES)
        .insert({
          [DATABASE.FIELDS.NAME]: name,
          [DATABASE.FIELDS.PARENT_ID]: parentId,
          [DATABASE.FIELDS.LEVEL]: level,
          [DATABASE.FIELDS.IS_ACTIVE]: true,
        })
        .returning("*");

      return category;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof CategoryDepthError) {
        throw error;
      }
      throw new DatabaseError(ERROR_MESSAGES.DATABASE.QUERY_ERROR, error);
    }
  }

  async update(id: number, name: string): Promise<Category> {
    try {
      const category = await db(DATABASE.TABLES.CATEGORIES)
        .where(DATABASE.FIELDS.ID, id)
        .first();

      if (!category) {
        throw new NotFoundError(ERROR_MESSAGES.CATEGORY.NOT_FOUND);
      }

      const [updatedCategory] = await db(DATABASE.TABLES.CATEGORIES)
        .where(DATABASE.FIELDS.ID, id)
        .update({
          [DATABASE.FIELDS.NAME]: name,
        })
        .returning("*");

      return updatedCategory;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(ERROR_MESSAGES.DATABASE.QUERY_ERROR, error);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const category = await db(DATABASE.TABLES.CATEGORIES)
        .where(DATABASE.FIELDS.ID, id)
        .first();

      if (!category) {
        throw new NotFoundError(ERROR_MESSAGES.CATEGORY.NOT_FOUND);
      }

      const [{ count }] = await db(DATABASE.TABLES.PRODUCTS)
        .where(DATABASE.FIELDS.CATEGORY_ID, id)
        .count();

      if (Number(count) > 0) {
        throw new CategoryHasProductsError();
      }

      await db(DATABASE.TABLES.CATEGORIES)
        .where(DATABASE.FIELDS.ID, id)
        .delete();
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof CategoryHasProductsError) {
        throw error;
      }
      throw new DatabaseError(ERROR_MESSAGES.DATABASE.QUERY_ERROR, error);
    }
  }

  async getActiveCategories(): Promise<CategoryWithCount[]> {
    try {
      return await db(DATABASE.TABLES.CATEGORIES)
        .select([
          `${DATABASE.TABLES.CATEGORIES}.${DATABASE.FIELDS.ID}`,
          `${DATABASE.TABLES.CATEGORIES}.${DATABASE.FIELDS.NAME}`,
          `${DATABASE.TABLES.CATEGORIES}.${DATABASE.FIELDS.PARENT_ID}`,
          `${DATABASE.TABLES.CATEGORIES}.${DATABASE.FIELDS.LEVEL}`,
          `${DATABASE.TABLES.CATEGORIES}.${DATABASE.FIELDS.IS_ACTIVE}`,
          `${DATABASE.TABLES.CATEGORIES}.${DATABASE.FIELDS.CREATED_AT}`,
          `${DATABASE.TABLES.CATEGORIES}.${DATABASE.FIELDS.UPDATED_AT}`,
        ])
        .count(`${DATABASE.TABLES.PRODUCTS}.${DATABASE.FIELDS.ID} as products_count`)
        .leftJoin(
          DATABASE.TABLES.PRODUCTS,
          `${DATABASE.TABLES.CATEGORIES}.${DATABASE.FIELDS.ID}`,
          `${DATABASE.TABLES.PRODUCTS}.${DATABASE.FIELDS.CATEGORY_ID}`
        )
        .where(`${DATABASE.TABLES.CATEGORIES}.${DATABASE.FIELDS.IS_ACTIVE}`, true)
        .groupBy(
          `${DATABASE.TABLES.CATEGORIES}.${DATABASE.FIELDS.ID}`,
          `${DATABASE.TABLES.CATEGORIES}.${DATABASE.FIELDS.NAME}`,
          `${DATABASE.TABLES.CATEGORIES}.${DATABASE.FIELDS.PARENT_ID}`,
          `${DATABASE.TABLES.CATEGORIES}.${DATABASE.FIELDS.LEVEL}`,
          `${DATABASE.TABLES.CATEGORIES}.${DATABASE.FIELDS.IS_ACTIVE}`,
          `${DATABASE.TABLES.CATEGORIES}.${DATABASE.FIELDS.CREATED_AT}`,
          `${DATABASE.TABLES.CATEGORIES}.${DATABASE.FIELDS.UPDATED_AT}`
        );
    } catch (error) {
      throw new DatabaseError(ERROR_MESSAGES.DATABASE.QUERY_ERROR, error);
    }
  }

  async getCategoryHierarchy(): Promise<CategoryTree[]> {
    try {
      const categories = await this.getActiveCategories();
      return this.buildCategoryTree(categories);
    } catch (error) {
      throw new DatabaseError(ERROR_MESSAGES.DATABASE.QUERY_ERROR, error);
    }
  }

  private buildCategoryTree(categories: CategoryWithCount[], parentId: number | null = null): CategoryTree[] {
    return categories
      .filter(category => category.parent_id === parentId)
      .map(category => ({
        ...category,
        children: this.buildCategoryTree(categories, category.id),
      }));
  }
} 