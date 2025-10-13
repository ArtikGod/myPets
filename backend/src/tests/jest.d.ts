import '@types/jest';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeDefined(): R;
      toBeUndefined(): R;
      toBe(expected: any): R;
      toEqual(expected: any): R;
      toContain(expected: any): R;
      toBeGreaterThan(expected: number): R;
      toBeLessThanOrEqual(expected: number): R;
      toBeNull(): R;
    }
  }
}