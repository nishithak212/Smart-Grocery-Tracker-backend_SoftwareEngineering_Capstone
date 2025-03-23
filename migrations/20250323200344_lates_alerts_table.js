/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable("alerts", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable();
    table
      .enu("status", ["available", "low", "out of stock", "expired"])
      .notNullable();
    table.timestamp("alert_date").defaultTo(knex.fn.now());
    table.string("message", 255).notNullable();
    table.tinyint("is_read").notNullable().defaultTo(0);
    table.string("item_name", 255).notNullable();
    table
      .foreign("user_id")
      .references("user_id")
      .inTable("users")
      .onDelete("CASCADE");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable("alerts");
}
