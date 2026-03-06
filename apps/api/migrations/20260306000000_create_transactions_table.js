export function up(knex) {
  return knex.schema.createTable('transactions', (table) => {
    table.increments('id').primary();
    table.string('orderId', 100).notNullable().unique();
    table.enu('status', ['pending', 'completed', 'failed']).notNullable().defaultTo('pending');
    table.decimal('amount', 10, 2).notNullable();
    table.string('currency', 3).notNullable();
    table.string('customerEmail', 255).notNullable();
    table.string('customerName', 255).notNullable();
    table.string('customerPhone', 50);
    table.string('street', 255);
    table.string('city', 100);
    table.string('country', 2).defaultTo('NG');
    table.json('orderItems');
    table.string('paydestal_reference', 255);
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('transactions');
}