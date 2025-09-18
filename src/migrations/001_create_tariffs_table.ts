import type { Knex } from 'knex';
import { DATABASE } from '../constants/constants';


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(DATABASE.TABLE.TARIFFS, (table) => {
    table.increments(DATABASE.COLUMN.ID).primary();
    table.date(DATABASE.COLUMN.DATE).notNullable();
    table.timestamp(DATABASE.COLUMN.CREATED_AT).defaultTo(knex.fn.now()).notNullable();
    table.timestamp(DATABASE.COLUMN.UPDATED_AT).defaultTo(knex.fn.now()).notNullable();
    
    table.string(DATABASE.COLUMN.WAREHOUSE_NAME).notNullable();
    table.string(DATABASE.COLUMN.GEO_NAME).notNullable();
    
    table.decimal(DATABASE.COLUMN.BOX_DELIVERY_BASE, 10, 2).nullable();
    table.decimal(DATABASE.COLUMN.BOX_DELIVERY_COEF_EXPR, 10, 2).nullable();
    table.decimal(DATABASE.COLUMN.BOX_DELIVERY_LITER, 10, 2).nullable();
    
    table.decimal(DATABASE.COLUMN.BOX_DELIVERY_MARKETPLACE_BASE, 10, 2).nullable();
    table.decimal(DATABASE.COLUMN.BOX_DELIVERY_MARKETPLACE_COEF_EXPR, 10, 2).nullable();
    table.decimal(DATABASE.COLUMN.BOX_DELIVERY_MARKETPLACE_LITER, 10, 2).nullable();
    
    table.decimal(DATABASE.COLUMN.BOX_STORAGE_BASE, 10, 4).nullable();
    table.decimal(DATABASE.COLUMN.BOX_STORAGE_COEF_EXPR, 10, 2).nullable();
    table.decimal(DATABASE.COLUMN.BOX_STORAGE_LITER, 10, 4).nullable();
    
    table.string(DATABASE.COLUMN.DT_NEXT_BOX).nullable();
    table.string(DATABASE.COLUMN.DT_TILL_MAX).nullable();

    table.unique([
      DATABASE.COLUMN.WAREHOUSE_NAME,
      DATABASE.COLUMN.GEO_NAME,
      DATABASE.COLUMN.DATE
    ], DATABASE.INDEX.UNIQUE_CONSTRAINT);

    table.index([DATABASE.COLUMN.DATE], DATABASE.INDEX.DATE_INDEX);
    table.index([DATABASE.COLUMN.WAREHOUSE_NAME], DATABASE.INDEX.WAREHOUSE_NAME_INDEX);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(DATABASE.TABLE.TARIFFS);
}