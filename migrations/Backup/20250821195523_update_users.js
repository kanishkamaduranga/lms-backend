/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    // 1. Add tenant_id column as nullable
    await knex.schema.alterTable('users', (table) => {
      table
        .integer('tenant_id')
        .unsigned()
        .references('id')
        .inTable('tenants')
        .onDelete('CASCADE')
        .nullable();
    });
  
    // 2. Backfill existing users with tenant_id = 1
    await knex('users').update({ tenant_id: 1 });
  
    // 3. Make column NOT NULL
    await knex.schema.alterTable('users', (table) => {
      table.integer('tenant_id').notNullable().alter();
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = async function (knex) {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('tenant_id');
    });
  };
  