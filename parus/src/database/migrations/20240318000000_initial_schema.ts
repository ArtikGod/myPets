import type { Knex } from "knex";
import { DATABASE } from "../../constants/database";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(DATABASE.TABLES.CATEGORIES, (table) => {
    table.increments(DATABASE.FIELDS.ID).primary();
    table.string(DATABASE.FIELDS.NAME).notNullable();
    table.integer(DATABASE.FIELDS.PARENT_ID)
      .references(DATABASE.FIELDS.ID)
      .inTable(DATABASE.TABLES.CATEGORIES)
      .onDelete("CASCADE");
    table.integer(DATABASE.FIELDS.LEVEL).notNullable();
    table.boolean(DATABASE.FIELDS.IS_ACTIVE).notNullable().defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.createTable(DATABASE.TABLES.PRODUCTS, (table) => {
    table.increments(DATABASE.FIELDS.ID).primary();
    table.string(DATABASE.FIELDS.NAME).notNullable();
    table.text(DATABASE.FIELDS.DESCRIPTION);
    table.decimal(DATABASE.FIELDS.PRICE, DATABASE.CONSTRAINTS.DECIMAL_PRECISION, DATABASE.CONSTRAINTS.DECIMAL_SCALE).notNullable();
    table.integer(DATABASE.FIELDS.CATEGORY_ID)
      .references(DATABASE.FIELDS.ID)
      .inTable(DATABASE.TABLES.CATEGORIES)
      .onDelete("CASCADE")
      .notNullable();
    table.boolean(DATABASE.FIELDS.IS_ACTIVE).notNullable().defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("products");
  await knex.schema.dropTable("categories");
} 