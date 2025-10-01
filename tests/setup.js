process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_jwt_secret";
process.env.REFRESH_SECRET = "test_refresh_secret";
process.env.DB_HOST = "localhost";
process.env.DB_USER = "test_user";
process.env.DB_PASSWORD = "test_password";
process.env.DB_NAME = "test_db";
process.env.DB_PORT = "3306";

global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
};

jest.setTimeout(10000);
