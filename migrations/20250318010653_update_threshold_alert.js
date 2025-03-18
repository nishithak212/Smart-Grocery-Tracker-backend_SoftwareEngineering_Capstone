/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.alterTable("grocery_items", (table) => {
      table.dropColumn("threshold_alert"); // Drop the existing integer column
    });
  
    await knex.schema.alterTable("grocery_items", (table) => {
      table.date("threshold_alert").nullable(); // Recreate it as a date column
    });
  }

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.alterTable("grocery_items", (table) => {
      table.dropColumn("threshold_alert"); // Drop the date column
    });
  
    await knex.schema.alterTable("grocery_items", (table) => {
      table.integer("threshold_alert").notNullable().defaultTo(1); // Recreate as an integer
    });
  }