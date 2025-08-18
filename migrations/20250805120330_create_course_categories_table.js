/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('course_categories', table => {
    table.increments('id').primary();
    table.integer('course_id').unsigned().references('id').inTable('courses').onDelete('CASCADE');
    table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('CASCADE');
    table.unique(['course_id', 'category_id']);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('course_categories');
};
