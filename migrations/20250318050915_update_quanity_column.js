/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex){
    return knex.schema.alterTable("grocery_items",(table) => {
        table.integer("quantity").notNullable().alter();
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex){
    return knex.schema.alterTable("grocery_items", (table) => {
        table.integer("quantity").notNullable().defaultTo(1).checkPositive().alter();
    });
}

