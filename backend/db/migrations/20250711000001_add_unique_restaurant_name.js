/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('restaurants', function(table) {
        // Add unique constraint to restaurant name only (slug already exists)
        table.unique('name', 'restaurants_name_unique');

        console.log('Added unique constraint to restaurants table: name');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('restaurants', function(table) {
        // Remove unique constraint from name only
        table.dropUnique('name', 'restaurants_name_unique');

        console.log('Removed unique constraint from restaurants table: name');
    });
};
