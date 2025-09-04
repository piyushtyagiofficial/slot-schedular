// 001_create_slots.js
export async function up(knex) {
  await knex.schema.createTable('slots', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.integer('day_of_week').notNullable();
    table.time('start_time').notNullable();
    table.time('end_time').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index(['day_of_week']);
  });
}

export async function down(knex) {
  await knex.schema.dropTable('slots');
}
