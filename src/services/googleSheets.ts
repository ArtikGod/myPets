import { google } from 'googleapis';
import { Tariff, GoogleSheetsRow } from '../types/tariff';
import path from 'path';
import { GOOGLE_SHEETS, LOG, DEFAULTS, STRINGS, NUMBERS } from '../constants/constants';

export class GoogleSheetsService {
  private sheets: any;
  private sheetIds: string[];

  constructor() {
    const credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH || path.resolve(DEFAULTS.GOOGLE.CREDENTIALS_PATH);

    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: GOOGLE_SHEETS.SCOPES
    });

    this.sheets = google.sheets({ version: 'v4', auth });

    this.sheetIds = (process.env.GOOGLE_SHEET_IDS || STRINGS.EMPTY)
      .split(STRINGS.COMMA)
      .map(id => id.trim())
      .filter(Boolean);
  }

  async updateAllSheets(tariffs: Tariff[]): Promise<void> {
    if (tariffs.length === NUMBERS.FIRST_INDEX) {
      return;
    }

    const sortedTariffs = tariffs.sort((a, b) => {
      if (a.box_delivery_base === null && b.box_delivery_base === null) return 0;
      if (a.box_delivery_base === null) return 1;
      if (b.box_delivery_base === null) return -1;
      
      return (a.box_delivery_base || 0) - (b.box_delivery_base || 0);
    });
    
    const rows = this.prepareSheetsData(sortedTariffs);

    for (const sheetId of this.sheetIds) {
      try {
        await this.updateSheet(sheetId, rows);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] ${LOG.SHEETS.SHEET_ERROR(sheetId)}`, error);
      }
    }
  }

  private async updateSheet(sheetId: string, rows: GoogleSheetsRow[]): Promise<void> {
    const startTime = Date.now();
    
    try {
      const spreadsheetInfo = await this.sheets.spreadsheets.get({
        spreadsheetId: sheetId
      });
      
      const sheets = spreadsheetInfo.data.sheets || [];
      let targetSheetName = GOOGLE_SHEETS.SHEET.STOCKS_COEFS;
      
      const stocksCoefsSheet = sheets.find((sheet: any) =>
        sheet.properties?.title === GOOGLE_SHEETS.SHEET.STOCKS_COEFS
      );
      
      if (!stocksCoefsSheet) {
        const firstSheet = sheets[NUMBERS.FIRST_INDEX];
        if (firstSheet?.properties?.title) {
          targetSheetName = firstSheet.properties.title;
        } else {
          throw new Error(LOG.SHEETS.NO_SHEETS_FOUND);
        }
      }

      const clearRange = `${targetSheetName}!${GOOGLE_SHEETS.SHEET.RANGE.CLEAR_RANGE}`;
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: sheetId,
        range: clearRange
      });

      const values = [
        GOOGLE_SHEETS.SHEET.HEADERS,
        ...rows.map(row => [
          row.warehouse_name,
          row.box_delivery_base,
          row.box_delivery_coef_expr,
          row.box_delivery_liter,
          row.box_delivery_marketplace_base,
          row.box_delivery_marketplace_coef_expr,
          row.box_delivery_marketplace_liter,
          row.box_storage_base,
          row.box_storage_coef_expr,
          row.box_storage_liter
        ])
      ];
      
      const writeRange = `${targetSheetName}!${GOOGLE_SHEETS.SHEET.RANGE.START_CELL}`;
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: writeRange,
        valueInputOption: GOOGLE_SHEETS.SHEET.VALUE_INPUT_OPTION,
        requestBody: {
          values
        }
      });
      
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] ${LOG.SHEETS.UPDATE_ERROR(sheetId)}`, {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        details: error.response?.data
      });
      throw error;
    }
  }

  private prepareSheetsData(tariffs: Tariff[]): GoogleSheetsRow[] {
    return tariffs.map(tariff => ({
      warehouse_name: tariff.warehouse_name,
      box_delivery_base: tariff.box_delivery_base,
      box_delivery_coef_expr: tariff.box_delivery_coef_expr,
      box_delivery_liter: tariff.box_delivery_liter,
      box_delivery_marketplace_base: tariff.box_delivery_marketplace_base,
      box_delivery_marketplace_coef_expr: tariff.box_delivery_marketplace_coef_expr,
      box_delivery_marketplace_liter: tariff.box_delivery_marketplace_liter,
      box_storage_base: tariff.box_storage_base,
      box_storage_coef_expr: tariff.box_storage_coef_expr,
      box_storage_liter: tariff.box_storage_liter
    }));
  }
}
