"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ARTICLES_LOG = void 0;
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
//# sourceMappingURL=constants.article.service.js.map