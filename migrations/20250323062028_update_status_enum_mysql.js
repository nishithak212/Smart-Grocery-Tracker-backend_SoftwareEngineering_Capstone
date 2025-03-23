/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up (knex) {

    await knex.schema.alterTable('grocery_items', (table) => {
        table
          .enu('status', ['available', 'low', 'finished', 'out of stock', 'expired'])
          .notNullable()
          .defaultTo('available')
          .alter();
      });

   await knex('grocery_items')
    .where('status', 'finished')
    .update({ status: 'out of stock' });

    await knex.schema.alterTable('grocery_items', (table) => {
        table
          .enu('status', ['available', 'low', 'out of stock', 'expired'])
          .notNullable()
          .defaultTo('available')
          .alter();
      });


};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {

    await knex.schema.alterTable('grocery_items', (table) => {
    table
      .enu('status', ['available', 'low', 'finished', 'out of stock', 'expired'])
      .notNullable()
      .defaultTo('available')
      .alter();
  });

  await knex('grocery_items')
    .where('status', 'out of stock')
    .update({ status: 'finished' });


  await knex.schema.alterTable('grocery_items', (table) => {
    table
      .enu('status', ['available', 'low', 'finished', 'expired'])
      .notNullable()
      .defaultTo('available')
      .alter();
  });
};
