const knex = require('./db/db');
const bcrypt = require('bcrypt');

async function checkUserPasswords() {
  try {
    console.log('🔍 Checking user passwords...');
    
    // Get all users with their password hashes
    const users = await knex('users').select('id', 'email', 'password_hash', 'role', 'created_at');
    
    console.log('\nFound users:');
    users.forEach(user => {
      console.log(`\n- ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Password Hash: ${user.password_hash ? 'EXISTS' : 'MISSING'}`);
      console.log(`  Created: ${user.created_at}`);
    });
    
    // Test common passwords
    const commonPasswords = ['password', 'test123', 'admin', '123456', 'arshia', 'password123'];
    
    for (const user of users) {
      console.log(`\n🔐 Testing passwords for ${user.email}:`);
      
      if (!user.password_hash) {
        console.log('  ❌ No password hash found');
        continue;
      }
      
      for (const testPassword of commonPasswords) {
        try {
          const isMatch = await bcrypt.compare(testPassword, user.password_hash);
          if (isMatch) {
            console.log(`  ✅ Password found: "${testPassword}"`);
            break;
          } else {
            console.log(`  ❌ Not: "${testPassword}"`);
          }
        } catch (error) {
          console.log(`  ❌ Error testing "${testPassword}":`, error.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await knex.destroy();
  }
}

checkUserPasswords();
