import app from './app';
import { AppDataSource } from './config/database';

const PORT = process.env.PORT || 3000;
const DB_NAME = process.env.DB_NAME;

AppDataSource.initialize()
  .then(() => {
    console.log(`Database connected ${DB_NAME}`);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed', error);
    process.exit(1);
  });