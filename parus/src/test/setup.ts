import "jest";

export const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  returning: jest.fn().mockReturnThis(),
  first: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  count: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  leftJoin: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
};

const chainedMethods = (returnValue: any) => ({
  ...mockQueryBuilder,
  where: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  leftJoin: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockResolvedValue(returnValue),
});

export const mockDb = Object.assign(
  jest.fn(() => mockQueryBuilder),
  { 
    fn: { now: jest.fn() },
    raw: jest.fn().mockResolvedValue([{ exists: true }])
  }
);

jest.mock("../database/connection", () => ({
  db: mockDb,
})); 