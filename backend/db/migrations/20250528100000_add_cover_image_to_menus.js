/**
 * Migration to add cover_image_path to menus table
 * This allows menus to have a cover/hero image for visual appeal
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('menus', function(table) {
    table.string('cover_image_path').nullable(); // Path to the menu cover image
  });
};

/**
 * Rollback: Remove cover_image_path from menus table
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('menus', function(table) {
    table.dropColumn('cover_image_path');
  });
};
