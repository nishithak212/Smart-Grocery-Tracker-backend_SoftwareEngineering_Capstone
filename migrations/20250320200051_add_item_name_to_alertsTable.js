/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    return knex.schema.alterTable("alerts", (table) => {
        table.string("item_name").notNullable();
    });
  
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    return knex.schema.alterTable("alerts",(table) => {
        table.dropColumn("item_name");
    })
  
};
