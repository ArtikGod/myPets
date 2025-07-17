const { DATABASE } = require("./src/constants/database");

const baseConfig = {
    client: "postgresql",
    pool: {
        min: DATABASE.CONSTRAINTS.MIN_POOL_SIZE,
        max: DATABASE.CONSTRAINTS.MAX_POOL_SIZE,
    },
    migrations: {
        tableName: DATABASE.MIGRATIONS.TABLE_NAME,
        directory: "./src/database/migrations",
    },
};

const development = {
    ...baseConfig,
    connection: {
        host: process.env.DB_HOST || "localhost",
        database: process.env.DB_NAME || "product_catalog",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
        port: Number(process.env.DB_PORT) || 5432,
    },
};

const test = {
    ...baseConfig,
    connection: {
        host: process.env.TEST_DB_HOST || "localhost",
        database: process.env.TEST_DB_NAME || "product_catalog_test",
        user: process.env.TEST_DB_USER || "postgres",
        password: process.env.TEST_DB_PASSWORD || "postgres",
        port: Number(process.env.TEST_DB_PORT) || 5432,
    },
};

const production = {
    ...baseConfig,
    connection: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT),
    },
};

module.exports = {
    development,
    test,
    production,
};
