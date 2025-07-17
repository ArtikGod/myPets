import { ProductService } from "../productService";
import { mockDb } from "../../test/setup";
import { Product } from "../../entities/Product.entity";
import { Category } from "../../entities/Category.entity";
import { ERROR_MESSAGES } from "../../constants/errorMessages";
import { DATABASE } from "../../constants/database";
import { DatabaseError } from "../../errors/AppError";

describe("ProductService", () => {
  let productService: ProductService;

  beforeEach(() => {
    productService = new ProductService();
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a product successfully", async () => {
      const mockCategory: Category = {
        id: 1,
        name: "Test Category",
        parent_id: null,
        level: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      const mockProduct: Product = {
        id: 1,
        name: "Test Product",
        description: "Test Description",
        price: 99.99,
        category_id: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      (mockDb().first as jest.Mock).mockResolvedValue(mockCategory);
      (mockDb().returning as jest.Mock).mockResolvedValue([mockProduct]);

      const result = await productService.create({
        name: "Test Product",
        description: "Test Description",
        price: 99.99,
        category_id: 1,
      });

      expect(result).toEqual(mockProduct);
      expect(mockDb().insert).toHaveBeenCalledWith({
        [DATABASE.FIELDS.NAME]: "Test Product",
        [DATABASE.FIELDS.DESCRIPTION]: "Test Description",
        [DATABASE.FIELDS.PRICE]: 99.99,
        [DATABASE.FIELDS.CATEGORY_ID]: 1,
        [DATABASE.FIELDS.IS_ACTIVE]: true,
      });
    });

    it("should throw error when category not found", async () => {
      (mockDb().first as jest.Mock).mockResolvedValue(null);

      await expect(productService.create({
        name: "Test Product",
        price: 99.99,
        category_id: 999,
      }))
        .rejects
        .toThrow(ERROR_MESSAGES.CATEGORY.NOT_FOUND);
    });

    it("should throw error when price is negative", async () => {
      await expect(productService.create({
        name: "Test Product",
        price: -10,
        category_id: 1,
      }))
        .rejects
        .toThrow(ERROR_MESSAGES.PRODUCT.INVALID_PRICE);
    });

    it("should throw DatabaseError when query fails", async () => {
      const mockCategory: Category = {
        id: 1,
        name: "Test Category",
        parent_id: null,
        level: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      (mockDb().first as jest.Mock).mockResolvedValue(mockCategory);
      (mockDb().insert as jest.Mock).mockImplementation(() => {
        throw new Error("Database error");
      });

      await expect(productService.create({
        name: "Test Product",
        price: 99.99,
        category_id: 1,
      }))
        .rejects
        .toThrow(ERROR_MESSAGES.DATABASE.QUERY_ERROR);
    });
  });

  describe("update", () => {
    it("should update product successfully", async () => {
      const mockProduct: Product = {
        id: 1,
        name: "Updated Product",
        description: "Updated Description",
        price: 149.99,
        category_id: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      (mockDb().first as jest.Mock).mockResolvedValue(mockProduct);
      (mockDb().returning as jest.Mock).mockResolvedValue([mockProduct]);

      const result = await productService.update(1, {
        name: "Updated Product",
        price: 149.99,
      });

      expect(result).toEqual(mockProduct);
    });

    it("should throw error when product not found", async () => {
      (mockDb().first as jest.Mock).mockResolvedValue(null);

      await expect(productService.update(999, { name: "Not Found" }))
        .rejects
        .toThrow(ERROR_MESSAGES.PRODUCT.NOT_FOUND);
    });

    it("should throw error when updating to non-existent category", async () => {
      const mockProduct: Product = {
        id: 1,
        name: "Product",
        price: 99.99,
        category_id: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      (mockDb().first as jest.Mock)
        .mockResolvedValueOnce(mockProduct) // First call for product
        .mockResolvedValueOnce(null); // Second call for category

      await expect(productService.update(1, {
        name: "Updated Product",
        category_id: 999,
      }))
        .rejects
        .toThrow(ERROR_MESSAGES.CATEGORY.NOT_FOUND);
    });

    it("should throw DatabaseError when update query fails", async () => {
      const mockProduct: Product = {
        id: 1,
        name: "Product",
        price: 99.99,
        category_id: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      (mockDb().first as jest.Mock).mockResolvedValue(mockProduct);
      (mockDb().update as jest.Mock).mockImplementation(() => {
        throw new Error("Database error");
      });

      await expect(productService.update(1, { name: "Updated" }))
        .rejects
        .toThrow(ERROR_MESSAGES.DATABASE.QUERY_ERROR);
    });
  });

  describe("delete", () => {
    it("should delete product successfully", async () => {
      const mockProduct: Product = {
        id: 1,
        name: "Product",
        price: 99.99,
        category_id: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      (mockDb().first as jest.Mock).mockResolvedValue(mockProduct);
      (mockDb().delete as jest.Mock).mockResolvedValue(1);

      await expect(productService.delete(1)).resolves.not.toThrow();
    });

    it("should throw error when product not found", async () => {
      (mockDb().first as jest.Mock).mockResolvedValue(null);

      await expect(productService.delete(999))
        .rejects
        .toThrow(ERROR_MESSAGES.PRODUCT.NOT_FOUND);
    });

    it("should throw DatabaseError when delete query fails", async () => {
      const mockProduct: Product = {
        id: 1,
        name: "Product",
        price: 99.99,
        category_id: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      (mockDb().first as jest.Mock).mockResolvedValue(mockProduct);
      (mockDb().delete as jest.Mock).mockImplementation(() => {
        throw new Error("Database error");
      });

      await expect(productService.delete(1))
        .rejects
        .toThrow(ERROR_MESSAGES.DATABASE.QUERY_ERROR);
    });
  });

  describe("getAll", () => {
    it("should return all active products", async () => {
      const mockProducts: Product[] = [
        {
          id: 1,
          name: "Product 1",
          price: 99.99,
          category_id: 1,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          name: "Product 2",
          price: 149.99,
          category_id: 1,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      (mockDb().orderBy as jest.Mock).mockResolvedValue(mockProducts);

      const result = await productService.getAll();

      expect(result).toEqual(mockProducts);
      expect(mockDb().where).toHaveBeenCalledWith(DATABASE.FIELDS.IS_ACTIVE, true);
      expect(mockDb().orderBy).toHaveBeenCalledWith(DATABASE.FIELDS.NAME);
    });

    it("should throw DatabaseError when query fails", async () => {
      (mockDb as jest.Mock).mockImplementation(() => ({
        where: jest.fn().mockImplementation(() => {
          throw new Error("Database error");
        }),
      }));

      await expect(productService.getAll())
        .rejects
        .toThrow(ERROR_MESSAGES.DATABASE.QUERY_ERROR);
    });
  });

  describe("getByCategory", () => {
    it("should return products by category", async () => {
      const mockCategory: Category = {
        id: 1,
        name: "Test Category",
        parent_id: null,
        level: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      const mockProducts: Product[] = [
        {
          id: 1,
          name: "Product 1",
          price: 99.99,
          category_id: 1,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          name: "Product 2",
          price: 149.99,
          category_id: 1,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      (mockDb as jest.Mock).mockImplementation(() => ({
        first: jest.fn().mockResolvedValue(mockCategory),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue(mockProducts),
      }));

      const result = await productService.getByCategory(1);

      expect(result).toEqual(mockProducts);
    });

    it("should throw error when category not found", async () => {
      (mockDb as jest.Mock).mockImplementation(() => ({
        first: jest.fn().mockResolvedValue(null),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue([]),
      }));

      await expect(productService.getByCategory(999))
        .rejects
        .toThrow(ERROR_MESSAGES.CATEGORY.NOT_FOUND);
    });

    it("should throw DatabaseError when query fails", async () => {
      (mockDb as jest.Mock).mockImplementation(() => ({
        first: jest.fn().mockResolvedValue({
          id: 1,
          name: "Test Category",
          parent_id: null,
          level: 1,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }),
        where: jest.fn().mockImplementation(() => {
          throw new Error("Database error");
        }),
      }));

      await expect(productService.getByCategory(1))
        .rejects
        .toThrow(ERROR_MESSAGES.DATABASE.QUERY_ERROR);
    });
  });
}); 