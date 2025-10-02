import dotenv from 'dotenv';
import app from './app';
import { LOG_MESSAGES } from './constants';

dotenv.config();

const PORT = process.env.PORT!;

console.log(LOG_MESSAGES.SERVER_STARTING);
console.log(LOG_MESSAGES.NODE_ENV, process.env.NODE_ENV);

app.listen(PORT, () => {
  console.log(`${LOG_MESSAGES.SERVER_STARTED} ${PORT}`);
});