/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
    return knex.schema
    .createTable("alerts", (table) => {
        table.increments("id").primary();
        table.integer("user_id").unsigned().notNullable();
        table
        .enu("status", ["available", "low", "finished", "expired"])
        .notNullable();
        table.timestamp("alert_date").defaultTo(knex.fn.now());
    })
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable("alerts");
};