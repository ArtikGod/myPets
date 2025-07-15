export function throwError(message: string, status: number): never {
  const error = new Error(message) as any;
  error.status = status;
  throw error;
}
