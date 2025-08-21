/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('tenants', (table) => {
        table.increments('id').primary(); // auto-increment ID
        table.string('name', 255).notNullable();
        table.string('domain', 255).notNullable().unique();
        table.string('logo'); // path or URL to logo
        table.string('status', 20).defaultTo('active');
        table.timestamp('created_at').defaultTo(knex.fn.now());
      }).then(() => {
        // Insert the first tenant record
        return knex('tenants').insert({
          name: 'Default Tenant',
          domain: 'default.lmsapp.com',
          status: 'active',
          created_at: knex.fn.now()
        });
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('tenants');
};
