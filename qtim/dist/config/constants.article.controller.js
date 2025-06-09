"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUERY = exports.SUMMARY = exports.MESSAGE = void 0;
exports.MESSAGE = {
    CREATED: 'Article successfully created',
    RETRIEVED: 'Article successfully retrieved',
    LIST_RETRIEVED: 'Articles successfully retrieved',
    UPDATED: 'Article successfully updated',
    DELETED: 'Article successfully deleted',
    VALIDATION_ERROR: 'Validation error',
    UNAUTHORIZED: 'Unauthorized',
    NOT_FOUND: 'Article not found',
    NO_PERMISSION: 'No permission',
};
exports.SUMMARY = {
    CREATE: 'Create new article',
    GET_ALL: 'Get all articles with pagination and filtering',
    GET_ONE: 'Get article by ID',
    UPDATE: 'Update article by ID',
    DELETE: 'Delete article by ID',
};
exports.QUERY = {
    PAGE: 'page',
    LIMIT: 'limit',
    START_DATE: 'startDate',
    END_DATE: 'endDate',
    AUTHOR_ID: 'authorId',
};
//# sourceMappingURL=constants.article.controller.js.map