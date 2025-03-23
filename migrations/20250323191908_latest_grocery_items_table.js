/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable("grocery_items", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable();
    table.string("item_name", 256).notNullable();
    table.integer("quantity").notNullable().defaultTo(0);
    table
      .enu("unit", ["kg", "mg", "g", "ml", "ltr", "gallon", "lbs", "ct"])
      .notNullable()
      .defaultTo("kg");
    table.string("category", 256).notNullable();
    table.date("expiration_date").nullable();
    table
      .enu("status", ["available", "low", "out of stock", "expired"])
      .notNullable()
      .defaultTo("available");
    table.integer("threshold_qty").notNullable().defaultTo(1);
    table.date("threshold_alert").nullable();
    table.timestamp("added_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

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
  return knex.schema.dropTable("grocery_items");
}
