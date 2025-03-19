/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    return knex.schema.alterTable("alerts", (table) => {
        table.string("message").notNullable();
        table.boolean("is_read").defaultTo(false);
        table
        .foreign("user_id")
        .references("user_id")
        .inTable("users")
        .onDelete("CASCADE");
    });
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    return knex.schema.alterTable("alerts",(table) => {
        table.dropColumn("message");
        table.dropColumn("is_read");
    })
  
};
