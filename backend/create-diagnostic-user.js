const knex = require('./db/db');
const bcrypt = require('bcrypt');

async function createDiagnosticUser() {
  try {
    console.log('🔧 Creating diagnostic test user...');
    
    const email = 'test@example.com';
    const password = 'password123';
    
    // Check if user already exists
    const existingUser = await knex('users').where({ email }).first();
    if (existingUser) {
      console.log('❌ User already exists with email:', email);
      
      // Update the password instead
      console.log('🔄 Updating password for existing user...');
      const hashedPassword = await bcrypt.hash(password, 12);
      await knex('users').where({ email }).update({ password_hash: hashedPassword });
      console.log('✅ Password updated successfully!');
      
      console.log('\n🎯 DIAGNOSTIC LOGIN CREDENTIALS:');
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const [userId] = await knex('users').insert({
      email: email,
      password_hash: hashedPassword,
      role: 'owner'
    });
    
    console.log('✅ User created with ID:', userId);
    
    console.log('\n🎯 DIAGNOSTIC LOGIN CREDENTIALS:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await knex.destroy();
  }
}

createDiagnosticUser();
