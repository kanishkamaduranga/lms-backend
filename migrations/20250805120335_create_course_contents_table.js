/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('course_contents', table => {
    table.increments('id').primary();
    table.integer('course_id').unsigned().references('id').inTable('courses').onDelete('CASCADE');
    table.enum('content_type', ['text', 'pdf', 'ppt', 'video', 'quiz']).notNullable();
    table.text('content_text');
    table.string('file_url');
    table.jsonb('metadata');
    table.integer('position').notNullable().defaultTo(0);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('course_contents');
};
