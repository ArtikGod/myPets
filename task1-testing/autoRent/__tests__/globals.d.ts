/// <reference types="jest" />

declare global {
  var describe: any;
  var it: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
  var afterEach: any;
  var beforeAll: any;
  var afterAll: any;
  var jest: {
    fn: <T extends (...args: any[]) => any>(implementation?: T) => jest.MockedFunction<T>;
    mock: (moduleName: string, factory?: () => any, options?: any) => void;
    spyOn: <T extends {}, M extends keyof T>(object: T, method: M) => jest.SpyInstance<any, any>;
    clearAllMocks: () => void;
    resetAllMocks: () => void;
    restoreAllMocks: () => void;
  };

  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
    }
    
    interface Mock<T = any, Y extends any[] = any> {
      (...args: Y): T;
      mockReturnValue(value: T): this;
      mockReturnValueOnce(value: T): this;
      mockResolvedValue(value: T): this;
      mockResolvedValueOnce(value: T): this;
      mockRejectedValue(value: any): this;
      mockRejectedValueOnce(value: any): this;
      mockImplementation(fn?: (...args: Y) => T): this;
      mockImplementationOnce(fn?: (...args: Y) => T): this;
      mockReturnThis(): this;
      mockClear(): this;
      mockReset(): this;
      mockRestore(): void;
    }
    
    interface MockedFunction<T extends (...args: any[]) => any> extends Mock<ReturnType<T>, Parameters<T>> {
      (...args: Parameters<T>): ReturnType<T>;
    }
    
    interface SpyInstance<T = any, Y extends any[] = any> extends MockedFunction<(...args: Y) => T> {
      mockRestore(): void;
    }
  }
}

export {};