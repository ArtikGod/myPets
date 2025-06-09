"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ARTICLES_LOG = exports.PAGINATION_CONFIG = void 0;
exports.PAGINATION_CONFIG = {
    DEFAULT_LIMIT: 10,
    DEFAULT_PAGE: 1,
    MAX_LIMIT: 100,
};
exports.ARTICLES_LOG = {
    CREATED: (id) => `Article created with ID: ${id}`,
    UPDATED: (id) => `Article updated with ID: ${id}`,
    DELETED: (id) => `Article deleted with ID: ${id}`,
    NOT_FOUND: (id) => `Article with ID ${id} not found`,
    NOT_PERMITTED: (id) => `No permission or not found article with ID: ${id}`,
    CACHE_HIT: (key) => `Returning cached data for key: ${key}`,
    CACHE_SET: (key) => `Cached data with key: ${key}`,
    CACHE_STORE: 'Cache store does not support keys() method',
    CACHE_ERROR: (stack) => `Error invalidating cache: ${stack}`,
};
//# sourceMappingURL=constants.js.map