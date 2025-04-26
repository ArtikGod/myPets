const mysql = require("mysql2/promise");
const config = require("./config");
const { ERROR_MESSAGES } = require("./shared/constants");

let pool;

module.exports = {
    initialize: () => {
        pool = mysql.createPool({
            host: config.DB.HOST,
            user: config.DB.USER,
            password: config.DB.PASSWORD,
            database: config.DB.DATABASE,
            port: config.DB.PORT,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
    },
    getPool: () => {
        if (!pool) throw new Error(ERROR_MESSAGES.DB_NOT_INITIALIZED);
        return pool;
    },
};
