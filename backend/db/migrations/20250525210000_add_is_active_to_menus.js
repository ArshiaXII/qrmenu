/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Check if is_active column exists before adding it
  const hasIsActive = await knex.schema.hasColumn('menus', 'is_active');
  
  if (!hasIsActive) {
    await knex.schema.alterTable('menus', function(table) {
      table.boolean('is_active').defaultTo(true);
    });
    console.log('Added is_active column to menus table');
  } else {
    console.log('is_active column already exists in menus table');
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('menus', function(table) {
    table.dropColumn('is_active');
  });
};
