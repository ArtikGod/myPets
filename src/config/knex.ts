import knex from 'knex';
import dotenv from 'dotenv';
import { DATABASE, DEFAULTS } from '../constants/constants';

dotenv.config();

const config = {
  client: DATABASE.CLIENT,
  connection: {
    host: process.env.DB_HOST || DEFAULTS.DB.HOST,
    port: parseInt(process.env.DB_PORT || DEFAULTS.DB.PORT),
    database: process.env.DB_NAME || DEFAULTS.DB.NAME,
    user: process.env.DB_USER || DEFAULTS.DB.USER,
    password: process.env.DB_PASSWORD || DEFAULTS.DB.PASSWORD,
  },
  pool: {
    min: DATABASE.POOL.MIN,
    max: DATABASE.POOL.MAX
  },
  migrations: {
    directory: DATABASE.MIGRATIONS.DIRECTORY,
    extension: DATABASE.MIGRATIONS.EXTENSION
  }
};

export const db = knex(config);
export default config;