import { db } from '../config/knex';
import { Tariff } from '../types/tariff';
import { DATABASE, LOG } from '../constants/constants';

export class DatabaseService {
  async upsertTariffs(tariffs: Tariff[]): Promise<void> {
    if (tariffs.length === 0) return;

    const trx = await db.transaction();
    try {
      await trx(DATABASE.TABLE.TARIFFS)
        .insert(tariffs)
        .onConflict([DATABASE.COLUMN.WAREHOUSE_NAME, DATABASE.COLUMN.GEO_NAME, DATABASE.COLUMN.DATE])
        .merge({
          box_delivery_base: trx.raw(DATABASE.SQL.EXCLUDED.BOX_DELIVERY_BASE),
          box_delivery_coef_expr: trx.raw(DATABASE.SQL.EXCLUDED.BOX_DELIVERY_COEF_EXPR),
          box_delivery_liter: trx.raw(DATABASE.SQL.EXCLUDED.BOX_DELIVERY_LITER),
          box_delivery_marketplace_base: trx.raw(DATABASE.SQL.EXCLUDED.BOX_DELIVERY_MARKETPLACE_BASE),
          box_delivery_marketplace_coef_expr: trx.raw(DATABASE.SQL.EXCLUDED.BOX_DELIVERY_MARKETPLACE_COEF_EXPR),
          box_delivery_marketplace_liter: trx.raw(DATABASE.SQL.EXCLUDED.BOX_DELIVERY_MARKETPLACE_LITER),
          box_storage_base: trx.raw(DATABASE.SQL.EXCLUDED.BOX_STORAGE_BASE),
          box_storage_coef_expr: trx.raw(DATABASE.SQL.EXCLUDED.BOX_STORAGE_COEF_EXPR),
          box_storage_liter: trx.raw(DATABASE.SQL.EXCLUDED.BOX_STORAGE_LITER),
          dt_next_box: trx.raw(DATABASE.SQL.EXCLUDED.DT_NEXT_BOX),
          dt_till_max: trx.raw(DATABASE.SQL.EXCLUDED.DT_TILL_MAX),
          updated_at: trx.fn.now()
        });

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      console.error(LOG.DB.ERROR_UPDATING, error);
      throw error;
    }
  }

  async getTariffsByDate(date: string): Promise<Tariff[]> {
    return db<Tariff>(DATABASE.TABLE.TARIFFS)
      .where(DATABASE.COLUMN.DATE, date)
      .orderBy([DATABASE.COLUMN.GEO_NAME, DATABASE.COLUMN.WAREHOUSE_NAME]);
  }

  async getLatestTariffs(): Promise<Tariff[]> {
    const latestDateRow = await db(DATABASE.TABLE.TARIFFS)
      .max<{ max_date: string }>(`${DATABASE.COLUMN.DATE} as ${DATABASE.SQL.ALIAS.MAX_DATE}`)
      .first();

    if (!latestDateRow?.max_date) {
      return [];
    }

    return this.getTariffsByDate(latestDateRow.max_date);
  }
}
