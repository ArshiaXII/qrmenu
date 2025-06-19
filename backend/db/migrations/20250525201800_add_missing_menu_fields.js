/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Check if columns exist before adding them
  const hasMenuIsActive = await knex.schema.hasColumn('menus', 'is_active');
  const hasCategoryMenuId = await knex.schema.hasColumn('categories', 'menu_id');
  const hasCategoryParentId = await knex.schema.hasColumn('categories', 'parent_id');
  const hasCategoryImagePath = await knex.schema.hasColumn('categories', 'image_path');
  const hasCategoryIsVisible = await knex.schema.hasColumn('categories', 'is_visible');
  const hasCategoryDisplayOrder = await knex.schema.hasColumn('categories', 'display_order');
  const hasItemPriceMin = await knex.schema.hasColumn('menu_items', 'price_min');
  const hasItemPriceMax = await knex.schema.hasColumn('menu_items', 'price_max');
  const hasItemImagePath = await knex.schema.hasColumn('menu_items', 'image_path');
  const hasItemIsAvailable = await knex.schema.hasColumn('menu_items', 'is_available');
  const hasItemDisplayOrder = await knex.schema.hasColumn('menu_items', 'display_order');
  const hasRestaurantSlug = await knex.schema.hasColumn('restaurants', 'slug');
  const hasRestaurantItemLimit = await knex.schema.hasColumn('restaurants', 'item_limit');

  // Add missing fields to menus table
  if (!hasMenuIsActive) {
    await knex.schema.alterTable('menus', function(table) {
      table.boolean('is_active').defaultTo(true);
    });
  }

  // Add missing fields to categories table
  await knex.schema.alterTable('categories', function(table) {
    if (!hasCategoryMenuId) {
      table.integer('menu_id').unsigned().nullable();
      table.foreign('menu_id').references('id').inTable('menus').onDelete('CASCADE');
    }
    if (!hasCategoryParentId) {
      table.integer('parent_id').unsigned().nullable();
      table.foreign('parent_id').references('id').inTable('categories').onDelete('SET NULL');
    }
    if (!hasCategoryImagePath) {
      table.string('image_path').nullable();
    }
    if (!hasCategoryIsVisible) {
      table.boolean('is_visible').defaultTo(true);
    }
    if (!hasCategoryDisplayOrder) {
      table.integer('display_order').defaultTo(0);
    }
  });

  // Add missing fields to menu_items table
  await knex.schema.alterTable('menu_items', function(table) {
    if (!hasItemPriceMin) {
      table.decimal('price_min', 10, 2).nullable();
    }
    if (!hasItemPriceMax) {
      table.decimal('price_max', 10, 2).nullable();
    }
    if (!hasItemImagePath) {
      table.string('image_path').nullable();
    }
    if (!hasItemIsAvailable) {
      table.boolean('is_available').defaultTo(true);
    }
    if (!hasItemDisplayOrder) {
      table.integer('display_order').defaultTo(0);
    }
  });

  // Add missing fields to restaurants table
  await knex.schema.alterTable('restaurants', function(table) {
    if (!hasRestaurantSlug) {
      table.string('slug').nullable().unique();
    }
    if (!hasRestaurantItemLimit) {
      table.integer('item_limit').defaultTo(80);
    }
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .alterTable('menus', function(table) {
      table.dropColumn('is_active');
    })
    .alterTable('categories', function(table) {
      table.dropForeign('menu_id');
      table.dropColumn('menu_id');
      table.dropForeign('parent_id');
      table.dropColumn('parent_id');
      table.dropColumn('image_path');
      table.dropColumn('is_visible');
      table.dropColumn('display_order');
    })
    .alterTable('menu_items', function(table) {
      table.dropColumn('price_min');
      table.dropColumn('price_max');
      table.dropColumn('image_path');
      table.dropColumn('is_available');
      table.dropColumn('display_order');
    })
    .alterTable('restaurants', function(table) {
      table.dropColumn('slug');
      table.dropColumn('item_limit');
    });
};
