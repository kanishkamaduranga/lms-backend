/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('courses', table => {
    table.integer('duration_minutes');
    table.date('start_date');
    table.date('end_date');
    table.specificType('tags', 'text[]');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('courses', table => {
    table.dropColumn('duration_minutes');
    table.dropColumn('start_date');
    table.dropColumn('end_date');
    table.dropColumn('tags');
  });
};
