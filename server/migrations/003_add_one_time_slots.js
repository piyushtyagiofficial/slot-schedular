// 003_add_one_time_slots.js
export async function up(knex) {
  // Create one_time_slots table for non-recurring slots
  await knex.schema.createTable('one_time_slots', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.date('slot_date').notNullable();
    table.time('start_time').notNullable();
    table.time('end_time').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index(['slot_date']);
  });
}

export async function down(knex) {
  await knex.schema.dropTable('one_time_slots');
}
