import dotenv from 'dotenv';
import type { Knex } from 'knex';
import { DATABASE, DEFAULTS } from './src/constants/constants';

dotenv.config();

const config: Knex.Config = {
  client: DATABASE.CLIENT,
  connection: {
    host: process.env.DB_HOST || DEFAULTS.DB.HOST,
    port: parseInt(process.env.DB_PORT || DEFAULTS.DB.PORT),
    database: process.env.DB_NAME || DEFAULTS.DB.NAME,
    user: process.env.DB_USER || DEFAULTS.DB.USER,
    password: process.env.DB_PASSWORD || DEFAULTS.DB.PASSWORD,
  },
  migrations: {
    directory: DATABASE.MIGRATIONS.DIRECTORY,
    extension: DATABASE.MIGRATIONS.EXTENSION
  }
};

export default config;