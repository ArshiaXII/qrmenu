/**
 * Migration to remove menu_id from menu_items table
 * Since we now use category_id to link items to categories, and categories link to menus,
 * the direct menu_id reference in menu_items is redundant and causing insertion issues.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('menu_items', function(table) {
    // For MySQL, we need to drop the foreign key constraint by name
    // The constraint name is typically auto-generated as tablename_columnname_foreign
    table.dropForeign(['menu_id'], 'menu_items_menu_id_foreign');
    // Then drop the column
    table.dropColumn('menu_id');
  });
};

/**
 * Rollback: Add menu_id back to menu_items table
 * Note: This rollback will only work if there's no data that depends on the removed column
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('menu_items', function(table) {
    // Add menu_id column back
    table.integer('menu_id').unsigned().nullable(); // Making it nullable for rollback safety
    // Add foreign key constraint back
    table.foreign('menu_id').references('id').inTable('menus').onDelete('CASCADE');
  });
};
