export async function up(knex) {
  await knex.schema.createTable('slot_exceptions', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('slot_id').references('id').inTable('slots').onDelete('CASCADE');
    table.date('exception_date').notNullable();
    table.time('start_time'); // null if deleted
    table.time('end_time'); // null if deleted
    table.enum('type', ['modified', 'deleted']).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.unique(['slot_id', 'exception_date']);
    table.index(['exception_date']);
  });
}

export async function down(knex) {
  await knex.schema.dropTable('slot_exceptions');
}