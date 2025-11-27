const knex = require("knex");
const knexConfig = require("../../knexfile");

const environment = process.env.NODE_ENV || "development";
const config = {
    ...knexConfig[environment],
    pool: {
        min: 2,
        max: 20,
        createTimeoutMillis: 3000,
        acquireTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 100,
        propagateCreateError: false,
    },
    acquireConnectionTimeout: 60000,
    asyncStackTraces: process.env.NODE_ENV === "development",
};

const db = knex(config);

db.on("query-error", (error, obj) => {
    console.error("Database query error:", {
        error: error.message,
        sql: obj.sql,
        bindings: obj.bindings,
    });
});

const gracefulShutdown = async () => {
    console.log("Shutting down, closing DB connections...");
    await db.destroy();
    process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

module.exports = db;
