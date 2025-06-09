"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_SELECT_FIELDS = exports.JWT_CONFIG = exports.MESSAGE = void 0;
exports.MESSAGE = {
    INVALID_CREDENTIALS: 'Invalid credentials',
    USER_NOT_FOUND: 'User not found',
    PASSWORD_SALT_ROUNDS: 10
};
exports.JWT_CONFIG = {
    EXPIRES_IN: 'jwt.expiresIn'
};
exports.USER_SELECT_FIELDS = {
    id: true,
    email: true,
    password: true,
    name: true,
};
//# sourceMappingURL=constants.auth.service.js.map