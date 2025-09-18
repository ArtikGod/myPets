import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { PaymentHistory } from '../payment-history/entities/payment-history.entity';
import { APP_CONSTANTS } from '../common/constants/app.constants';

export const AppDataSource = new DataSource({
  type: APP_CONSTANTS.DATABASE.TYPE_POSTGRES,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, PaymentHistory],
  migrations: [APP_CONSTANTS.DATABASE.MIGRATIONS_PATH],
  synchronize: APP_CONSTANTS.DATABASE.SYNCHRONIZE_FALSE,
  logging: process.env.NODE_ENV === APP_CONSTANTS.DATABASE.NODE_ENV_DEVELOPMENT,
});
