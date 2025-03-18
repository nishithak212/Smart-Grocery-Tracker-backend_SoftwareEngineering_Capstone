/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable("grocery_items", (table) => {
    table.increments("id").primary(); // Auto-increment primary key
    table.integer("user_id").unsigned().notNullable(); // Match type with users.user_id
    table.string("item_name", 256).notNullable();
    table.integer("quantity").notNullable().checkPositive(); // Ensure positive quantity
    table
      .enu("unit", ["kg", "mg", "g", "ml", "ltr", "gallon", "lbs", "ct"])
      .notNullable()
      .defaultTo("kg");
    table.string("category", 256).notNullable();
    table.date("expiration_date").nullable();
    table
      .enu("status", ["available", "low", "finished", "expired"])
      .notNullable()
      .defaultTo("available");
    table.integer("threshold_qty").notNullable().defaultTo(1);
    table.integer("threshold_alert").notNullable().defaultTo(1);
    table.timestamp("added_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    // Define Foreign Key Constraint
    table
      .foreign("user_id")
      .references("user_id")
      .inTable("users")
      .onDelete("CASCADE"); // Cascade deletion when user is removed
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable("grocery_items");
}
