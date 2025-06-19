const knex = require('./db/db');

async function debugLogin() {
  try {
    console.log('🔍 Debugging login issue...');
    
    // Test database connection
    console.log('\n1. Testing database connection...');
    const testQuery = await knex.raw('SELECT 1 as test');
    console.log('✅ Database connection successful:', testQuery[0]);
    
    // Check if users table exists
    console.log('\n2. Checking users table...');
    const hasUsersTable = await knex.schema.hasTable('users');
    console.log('Users table exists:', hasUsersTable);
    
    if (hasUsersTable) {
      // Get all users
      console.log('\n3. Checking existing users...');
      const users = await knex('users').select('id', 'email', 'role', 'created_at');
      console.log('Found users:', users.length);
      users.forEach(user => {
        console.log(`- ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
      });
      
      // Check restaurants table
      console.log('\n4. Checking restaurants table...');
      const hasRestaurantsTable = await knex.schema.hasTable('restaurants');
      console.log('Restaurants table exists:', hasRestaurantsTable);
      
      if (hasRestaurantsTable) {
        const restaurants = await knex('restaurants').select('id', 'user_id', 'name');
        console.log('Found restaurants:', restaurants.length);
        restaurants.forEach(restaurant => {
          console.log(`- ID: ${restaurant.id}, User ID: ${restaurant.user_id}, Name: ${restaurant.name}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await knex.destroy();
  }
}

debugLogin();
