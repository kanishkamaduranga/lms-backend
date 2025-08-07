/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('users', table => {
    table.renameColumn('name', 'full_name');
    table.string('username').unique();
    table.enum('role', ['Admin', 'Instructor', 'Student', 'Guest']).defaultTo('Student');
    table.enum('enrollment_status', ['Active', 'Suspended']).defaultTo('Active');
    table.date('suspension_date');
    table.date('reactivation_date');
    table.timestamp('last_login_date');
    table.string('department_group');
    table.string('profile_picture');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('users', table => {
    table.renameColumn('full_name', 'name');
    table.dropColumn('username');
    table.dropColumn('role');
    table.dropColumn('enrollment_status');
    table.dropColumn('suspension_date');
    table.dropColumn('reactivation_date');
    table.dropColumn('last_login_date');
    table.dropColumn('department_group');
    table.dropColumn('profile_picture');
  });
};
