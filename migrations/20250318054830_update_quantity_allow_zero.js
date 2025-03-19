/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    return knex.schema.alterTable("grocery_items", (table) => {
        // Ensure quantity allows 0 (if database rejects it)
        table.integer("quantity").notNullable().defaultTo(0).alter();
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    return knex.schema.alterTable("grocery_items", (table) => {
        table.integer("quantity").notNullable().alter();
    });
}