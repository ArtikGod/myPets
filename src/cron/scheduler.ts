import * as cron from 'node-cron';
import { WildberriesService } from '../services/wildberries';
import { DatabaseService } from '../services/database';
import { GoogleSheetsService } from '../services/googleSheets';
import { CRON, LOG, STRINGS } from '../constants/constants';

export const scheduleFetchTariffs = () => {
  const cronExpression = process.env.CRON_FETCH_TARIFFS || CRON.FETCH_TARIFFS;

  cron.schedule(cronExpression, async () => {
    try {
      const wbService = new WildberriesService();
      const dbService = new DatabaseService();
      
      const tariffs = await wbService.fetchTariffs();
      await dbService.upsertTariffs(tariffs);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ${LOG.WB.FETCH_ERROR}`, error);
    }
  });
};

export const scheduleSyncSheets = () => {
  const cronExpression = process.env.CRON_SYNC_SHEETS || CRON.SYNC_SHEETS;

  cron.schedule(cronExpression, async () => {
    try {
      const dbService = new DatabaseService();
      const sheetsService = new GoogleSheetsService();
      
      const latestTariffs = await dbService.getLatestTariffs();
      if (latestTariffs && latestTariffs.length > 0) {
        await sheetsService.updateAllSheets(latestTariffs);
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ${LOG.SHEETS.SHEET_ERROR(STRINGS.EMPTY)}`, error);
    }
  });
};
