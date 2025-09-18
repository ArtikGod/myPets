import dotenv from 'dotenv';
import { db } from './config/knex';
import { scheduleFetchTariffs, scheduleSyncSheets } from './cron/scheduler';
import { DATABASE, LOG, SIGNALS, PROCESS_EVENTS } from './constants/constants';

dotenv.config();

async function startApplication() {
  try {
    await db.raw(DATABASE.QUERY.HEALTH_CHECK);

    await db.migrate.latest();

    scheduleFetchTariffs();
    scheduleSyncSheets();

    const shutdown = async (signal: string) => {
      await db.destroy();
      process.exit(0);
    };
    
    process.on(SIGNALS.SIGINT, () => shutdown(SIGNALS.SIGINT));
    process.on(SIGNALS.SIGTERM, () => shutdown(SIGNALS.SIGTERM));

    process.on(PROCESS_EVENTS.UNHANDLED_REJECTION, (reason) => {
      console.error(LOG.APP.UNHANDLED_REJECTION, reason);
    });
    process.on(PROCESS_EVENTS.UNCAUGHT_EXCEPTION, (error) => {
      console.error(LOG.APP.UNCAUGHT_EXCEPTION, error);
    });
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ${LOG.APP.START_ERROR}`, error);
    process.exit(1);
  }
}

startApplication();
