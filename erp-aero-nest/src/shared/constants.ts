export const ERROR_MESSAGES = {
    INVALID_INPUT: 'Invalid input provided.',
    NETWORK_ERROR: 'Network error occurred.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    INVALID_TOKEN: 'Invalid refresh token',
    USER_NOT_FOUND: 'User not found',
    USER_ALREADY_EXISTS: 'User already exists',
    PASSWORD_MISMATCH: 'Password does not match',
    SIGNUP_SUCCESS: 'Signup successful',
    SIGNIN_SUCCESS: 'Signin successful',
    REFRESH_SUCCESS: 'Token refreshed successfully',
    LOGOUT_SUCCESS: 'Logged out successfully',
    LOGOUT_FAILURE: 'Logout failed',
    BLACKLIST_SUCCESS: 'Token blacklisted successfully',
    BLACKLIST_FAILURE: 'Token blacklisting failed',
    FILE_NOT_FOUND: 'File not found',
    FILE_UPLOAD_SUCCESS: 'File uploaded successfully',
    FILE_UPLOAD_FAILURE: 'File upload failed',
    FILE_DELETE_SUCCESS: 'File deleted successfully',
    FILE_DELETE_FAILURE: 'File deletion failed',
};


export const MAX_RETRIES = 3;
export const TIMEOUT_MS = 5000;
export const MILLISECONDS_IN_SECOND = 1000;
export const PAGE_SIZE = 20;
export const MAX_FILE_SIZE_MB = 5;
export const HASH_DIFFICULTY = 10;
export const TOKEN_EXPIRATION_TIME = '1h';
export const REFRESH_TOKEN_EXPIRATION_TIME = '30d';

export const JWT_ACCESS_SECRET_KEY = 'JWT_ACCESS_SECRET';
export const AUTH_HEADER = 'authorization';
export const DATE_FORMAT = 'YYYY-MM-DD';

export const UPLOAD_DIR = './uploads';

