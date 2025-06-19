/**
 * Migration to add multiple menu support
 * Allows restaurants to have separate Breakfast, Lunch, Dinner, Drinks menus
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Check if columns already exist to avoid conflicts
  const hasMenuType = await knex.schema.hasColumn('menus', 'menu_type');
  const hasActiveHours = await knex.schema.hasColumn('menus', 'active_hours');
  const hasDisplayOrder = await knex.schema.hasColumn('menus', 'display_order');
  const hasIsActive = await knex.schema.hasColumn('menus', 'is_active');

  return knex.schema.alterTable('menus', function(table) {
    // Menu type (breakfast, lunch, dinner, drinks, all_day, etc.)
    if (!hasMenuType) {
      table.string('menu_type').defaultTo('all_day');
    }

    // Active hours for this menu (JSON string)
    if (!hasActiveHours) {
      table.text('active_hours').nullable(); // Store as JSON: {"start": "06:00", "end": "11:00"}
    }

    // Display order for multiple menus
    if (!hasDisplayOrder) {
      table.integer('display_order').defaultTo(0);
    }

    // Whether this menu is currently active (skip if already exists)
    if (!hasIsActive) {
      table.boolean('is_active').defaultTo(true);
    }
  });
};

/**
 * Rollback: Remove multiple menu support fields
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('menus', function(table) {
    table.dropColumn('menu_type');
    table.dropColumn('active_hours');
    table.dropColumn('display_order');
    table.dropColumn('is_active');
  });
};
