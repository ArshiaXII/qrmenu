const knex = require('./db/db');
const bcrypt = require('bcrypt');

async function createTestUser() {
  try {
    console.log('🔧 Creating test user...');
    
    const email = 'test@qrmenu.com';
    const password = 'test123';
    const restaurantName = 'Test Restaurant';
    
    // Check if user already exists
    const existingUser = await knex('users').where({ email }).first();
    if (existingUser) {
      console.log('❌ User already exists with email:', email);
      
      // Update the password instead
      console.log('🔄 Updating password for existing user...');
      const hashedPassword = await bcrypt.hash(password, 10);
      await knex('users').where({ email }).update({ password_hash: hashedPassword });
      console.log('✅ Password updated successfully!');
      
      console.log('\n🎯 LOGIN CREDENTIALS:');
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const [userId] = await knex('users').insert({
      email: email,
      password_hash: hashedPassword,
      role: 'owner'
    });
    
    console.log('✅ User created with ID:', userId);
    
    // Create restaurant for the user
    const [restaurantId] = await knex('restaurants').insert({
      user_id: userId,
      name: restaurantName,
      slug: 'test-restaurant',
      onboarding_completed: true
    });
    
    console.log('✅ Restaurant created with ID:', restaurantId);
    
    // Create a default menu
    const [menuId] = await knex('menus').insert({
      restaurant_id: restaurantId,
      name: 'Main Menu',
      description: 'Our main menu',
      is_active: true
    });
    
    console.log('✅ Menu created with ID:', menuId);
    
    console.log('\n🎉 Test account created successfully!');
    console.log('\n🎯 LOGIN CREDENTIALS:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Restaurant: ${restaurantName}`);
    
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    console.error('Full error:', error);
  } finally {
    await knex.destroy();
  }
}

createTestUser();
