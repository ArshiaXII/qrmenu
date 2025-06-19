/**
 * Migration to add restaurant_type for intelligent menu suggestions
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('restaurants', function(table) {
    // Restaurant type for intelligent suggestions
    table.enum('restaurant_type', [
      'pizzeria',
      'cafe',
      'fine_dining',
      'burger_joint',
      'fast_food',
      'bakery',
      'bar_pub',
      'asian_cuisine',
      'mexican_cuisine',
      'italian_cuisine',
      'steakhouse',
      'seafood',
      'vegetarian_vegan',
      'food_truck',
      'other'
    ]).defaultTo('other');
  });
};

/**
 * Rollback: Remove restaurant_type
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('restaurants', function(table) {
    table.dropColumn('restaurant_type');
  });
};
