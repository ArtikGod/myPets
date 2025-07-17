import { CategoryService } from "../categoryService";
import { mockDb } from "../../test/setup";
import { Category, CategoryWithCount } from "../../entities/Category.entity";
import { ERROR_MESSAGES } from "../../constants/errorMessages";
import { CONFIG } from "../../constants/config";
import { DATABASE } from "../../constants/database";
import { DatabaseError } from "../../errors/AppError";

describe("CategoryService", () => {
  let categoryService: CategoryService;

  beforeEach(() => {
    categoryService = new CategoryService();
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a root category successfully", async () => {
      const mockCategory: Category = {
        id: 1,
        name: "Test Category",
        parent_id: null,
        level: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      (mockDb().returning as jest.Mock).mockResolvedValue([mockCategory]);

      const result = await categoryService.create("Test Category");

      expect(result).toEqual(mockCategory);
      expect(mockDb().insert).toHaveBeenCalledWith({
        [DATABASE.FIELDS.NAME]: "Test Category",
        [DATABASE.FIELDS.PARENT_ID]: null,
        [DATABASE.FIELDS.LEVEL]: 1,
        [DATABASE.FIELDS.IS_ACTIVE]: true,
      });
    });

    it("should create a subcategory successfully", async () => {
      const mockParent: Category = {
        id: 1,
        name: "Parent",
        level: 1,
        parent_id: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      const mockCategory: Category = {
        id: 2,
        name: "Child",
        parent_id: 1,
        level: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      (mockDb().first as jest.Mock).mockResolvedValueOnce(mockParent);
      (mockDb().returning as jest.Mock).mockResolvedValue([mockCategory]);

      const result = await categoryService.create("Child", 1);

      expect(result).toEqual(mockCategory);
    });

    it("should throw error when parent category not found", async () => {
      (mockDb().first as jest.Mock).mockResolvedValue(null);

      await expect(categoryService.create("Child", 999))
        .rejects
        .toThrow(ERROR_MESSAGES.CATEGORY.PARENT_NOT_FOUND);
    });

    it("should throw error when exceeding maximum depth", async () => {
      const mockParent: Category = {
        id: 1,
        name: "Deep Parent",
        level: CONFIG.CATEGORY.MAX_DEPTH,
        parent_id: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      (mockDb().first as jest.Mock).mockResolvedValue(mockParent);

      await expect(categoryService.create("Too Deep", 1))
        .rejects
        .toThrow(ERROR_MESSAGES.CATEGORY.MAX_DEPTH_EXCEEDED);
    });

    it("should throw DatabaseError when insert query fails", async () => {
      const mockCategory: Category = {
        id: 1,
        name: "Parent",
        level: 1,
        parent_id: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      (mockDb().first as jest.Mock).mockResolvedValue(mockCategory);
      (mockDb().insert as jest.Mock).mockImplementation(() => {
        throw new Error("Database error");
      });

      await expect(categoryService.create("Test Category", 1))
        .rejects
        .toThrow(ERROR_MESSAGES.DATABASE.QUERY_ERROR);
    });
  });

  describe("update", () => {
    it("should update category successfully", async () => {
      const mockCategory: Category = {
        id: 1,
        name: "Updated Category",
        parent_id: null,
        level: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      (mockDb().first as jest.Mock).mockResolvedValue(mockCategory);
      (mockDb().returning as jest.Mock).mockResolvedValue([mockCategory]);

      const result = await categoryService.update(1, "Updated Category");

      expect(result).toEqual(mockCategory);
    });

    it("should throw error when category not found", async () => {
      (mockDb().first as jest.Mock).mockResolvedValue(null);

      await expect(categoryService.update(999, "Not Found"))
        .rejects
        .toThrow(ERROR_MESSAGES.CATEGORY.NOT_FOUND);
    });

    it("should throw DatabaseError when update query fails", async () => {
      const mockCategory: Category = {
        id: 1,
        name: "Category",
        parent_id: null,
        level: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      (mockDb().first as jest.Mock).mockResolvedValue(mockCategory);
      (mockDb().update as jest.Mock).mockImplementation(() => {
        throw new Error("Database error");
      });

      await expect(categoryService.update(1, "Updated Name"))
        .rejects
        .toThrow(ERROR_MESSAGES.DATABASE.QUERY_ERROR);
    });
  });

  describe("delete", () => {
    it("should delete category successfully", async () => {
      const mockCategory: Category = {
        id: 1,
        name: "Category",
        parent_id: null,
        level: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      (mockDb().first as jest.Mock).mockResolvedValue(mockCategory);
      (mockDb().count as jest.Mock).mockResolvedValue([{ count: "0" }]);
      (mockDb().delete as jest.Mock).mockResolvedValue(1);

      await expect(categoryService.delete(1)).resolves.not.toThrow();
    });

    it("should throw error when category not found", async () => {
      (mockDb().first as jest.Mock).mockResolvedValue(null);

      await expect(categoryService.delete(999))
        .rejects
        .toThrow(ERROR_MESSAGES.CATEGORY.NOT_FOUND);
    });

    it("should throw error when category has products", async () => {
      const mockCategory: Category = {
        id: 1,
        name: "Category",
        parent_id: null,
        level: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      (mockDb().first as jest.Mock).mockResolvedValue(mockCategory);
      (mockDb().count as jest.Mock).mockResolvedValue([{ count: "1" }]);

      await expect(categoryService.delete(1))
        .rejects
        .toThrow(ERROR_MESSAGES.CATEGORY.HAS_PRODUCTS);
    });

    it("should throw DatabaseError when delete query fails", async () => {
      const mockCategory: Category = {
        id: 1,
        name: "Category",
        parent_id: null,
        level: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      (mockDb().first as jest.Mock).mockResolvedValue(mockCategory);
      (mockDb().count as jest.Mock).mockResolvedValue([{ count: "0" }]);
      (mockDb().delete as jest.Mock).mockImplementation(() => {
        throw new Error("Database error");
      });

      await expect(categoryService.delete(1))
        .rejects
        .toThrow(ERROR_MESSAGES.DATABASE.QUERY_ERROR);
    });
  });

  describe("getActiveCategories", () => {
    it("should return active categories with product counts", async () => {
      const mockCategories: CategoryWithCount[] = [{
        id: 1,
        name: "Category 1",
        parent_id: null,
        level: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        products_count: 5
      }];

      (mockDb as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockResolvedValue(mockCategories),
        count: jest.fn().mockReturnThis(),
      }));

      const result = await categoryService.getActiveCategories();

      expect(result).toEqual(mockCategories);
    });

    it("should throw DatabaseError when query fails", async () => {
      (mockDb as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockImplementation(() => {
          throw new Error("Database error");
        }),
        count: jest.fn().mockReturnThis(),
      }));

      await expect(categoryService.getActiveCategories())
        .rejects
        .toThrow(ERROR_MESSAGES.DATABASE.QUERY_ERROR);
    });
  });

  describe("getCategoryHierarchy", () => {
    it("should return categories in hierarchical structure", async () => {
      const mockCategories: CategoryWithCount[] = [
        {
          id: 1,
          name: "Parent 1",
          parent_id: null,
          level: 1,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
          products_count: 2
        },
        {
          id: 2,
          name: "Child 1",
          parent_id: 1,
          level: 2,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
          products_count: 1
        },
        {
          id: 3,
          name: "Parent 2",
          parent_id: null,
          level: 1,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
          products_count: 0
        }
      ];

      (mockDb as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockResolvedValue(mockCategories),
        count: jest.fn().mockReturnThis(),
      }));

      const result = await categoryService.getCategoryHierarchy();

      expect(result).toHaveLength(2); // Two root categories
      expect(result[0].children).toHaveLength(1); // First root has one child
      expect(result[1].children).toHaveLength(0); // Second root has no children
      expect(result[0].id).toBe(1);
      expect(result[0].children[0].id).toBe(2);
      expect(result[1].id).toBe(3);
    });

    it("should handle empty category list", async () => {
      const mockCategories: CategoryWithCount[] = [];

      (mockDb as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockResolvedValue(mockCategories),
        count: jest.fn().mockReturnThis(),
      }));

      const result = await categoryService.getCategoryHierarchy();

      expect(result).toEqual([]);
    });

    it("should throw DatabaseError when query fails", async () => {
      (mockDb as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockImplementation(() => {
          throw new Error("Database error");
        }),
        count: jest.fn().mockReturnThis(),
      }));

      await expect(categoryService.getCategoryHierarchy())
        .rejects
        .toThrow(ERROR_MESSAGES.DATABASE.QUERY_ERROR);
    });
  });
}); 