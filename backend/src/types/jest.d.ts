// Глобальные типы Jest для TypeScript
import '@types/jest';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOneOf(expected: any[]): R;
    }
  }
}