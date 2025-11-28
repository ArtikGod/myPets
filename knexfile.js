require("dotenv").config();

module.exports = {
    development: {
        client: "pg",
        connection: process.env.PG_CONNSTRING,
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: "knex_migrations",
            directory: "./db/migrations",
        },
        seeds: {
            directory: "./db/seeds",
        },
    },

    production: {
        client: "pg",
        connection: process.env.PG_CONNSTRING,
        pool: {
            min: 2,
            max: 20,
        },
        migrations: {
            tableName: "knex_migrations",
        },
    },
};
