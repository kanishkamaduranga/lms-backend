/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('courses', table => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.text('description');
    table.integer('instructor_id').unsigned().references('id').inTable('users');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('courses');
};
