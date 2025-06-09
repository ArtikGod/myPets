export const ARTICLES_LOG = {
  CREATED: (id: number) => `Article created with ID: ${id}`,
  UPDATED: (id: number) => `Article updated with ID: ${id}`,
  DELETED: (id: number) => `Article deleted with ID: ${id}`,
  NOT_FOUND: (id: number) => `Article with ID ${id} not found`,
  NOT_PERMITTED: (id: number) => `No permission or not found article with ID: ${id}`,
  CACHE_HIT: (key: string) => `Returning cached data for key: ${key}`,
  CACHE_SET: (key: string) => `Cached data with key: ${key}`,
  CACHE_STORE: 'Cache store does not support keys() method',
  CACHE_ERROR: (stack: string) => `Error invalidating cache: ${stack}`,
};
