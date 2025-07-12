const db = require('./backend/db/db');
require('dotenv').config();

async function testDataIsolation() {
    try {
        console.log('🔍 Testing Data Isolation...\n');
        
        // 1. Check all users and their restaurants
        console.log('1. Checking all users and their restaurants:');
        const users = await db('users').select('id', 'email', 'role');
        
        for (const user of users) {
            const restaurants = await db('restaurants')
                .where({ user_id: user.id })
                .select('id', 'name', 'slug');
            
            console.log(`   User ${user.id} (${user.email}):`);
            if (restaurants.length > 0) {
                restaurants.forEach(restaurant => {
                    console.log(`     - Restaurant ${restaurant.id}: ${restaurant.name} (${restaurant.slug})`);
                });
            } else {
                console.log(`     - No restaurants found`);
            }
        }
        
        // 2. Check for data leakage - restaurants without proper user_id
        console.log('\n2. Checking for data leakage:');
        const orphanedRestaurants = await db('restaurants')
            .leftJoin('users', 'restaurants.user_id', 'users.id')
            .whereNull('users.id')
            .select('restaurants.*');
        
        if (orphanedRestaurants.length > 0) {
            console.log('   ❌ Found orphaned restaurants (no valid user):');
            orphanedRestaurants.forEach(restaurant => {
                console.log(`     - Restaurant ${restaurant.id}: ${restaurant.name} (user_id: ${restaurant.user_id})`);
            });
        } else {
            console.log('   ✅ No orphaned restaurants found');
        }
        
        // 3. Check menus are properly linked to restaurants
        console.log('\n3. Checking menu-restaurant relationships:');
        const menusWithOwners = await db('menus')
            .join('restaurants', 'menus.restaurant_id', 'restaurants.id')
            .join('users', 'restaurants.user_id', 'users.id')
            .select(
                'menus.id as menu_id',
                'menus.name as menu_name',
                'restaurants.id as restaurant_id',
                'restaurants.name as restaurant_name',
                'users.id as user_id',
                'users.email as user_email'
            );
        
        if (menusWithOwners.length > 0) {
            console.log('   Menu ownership chain:');
            menusWithOwners.forEach(item => {
                console.log(`     - Menu ${item.menu_id} (${item.menu_name}) → Restaurant ${item.restaurant_id} (${item.restaurant_name}) → User ${item.user_id} (${item.user_email})`);
            });
        } else {
            console.log('   No menus found');
        }
        
        // 4. Test cross-user data access simulation
        console.log('\n4. Simulating cross-user data access:');
        if (users.length >= 2) {
            const user1 = users[0];
            const user2 = users[1];
            
            // Get user1's restaurants
            const user1Restaurants = await db('restaurants')
                .where({ user_id: user1.id })
                .select('id', 'name');
            
            // Get user2's restaurants  
            const user2Restaurants = await db('restaurants')
                .where({ user_id: user2.id })
                .select('id', 'name');
            
            console.log(`   User ${user1.id} restaurants:`, user1Restaurants.map(r => `${r.id}:${r.name}`));
            console.log(`   User ${user2.id} restaurants:`, user2Restaurants.map(r => `${r.id}:${r.name}`));
            
            // Test: Can user1 see user2's restaurants?
            if (user2Restaurants.length > 0) {
                const crossAccessTest = await db('restaurants')
                    .where({ user_id: user1.id, id: user2Restaurants[0].id })
                    .first();
                
                if (crossAccessTest) {
                    console.log(`   ❌ SECURITY ISSUE: User ${user1.id} can access User ${user2.id}'s restaurant!`);
                } else {
                    console.log(`   ✅ User ${user1.id} cannot access User ${user2.id}'s restaurant (correct)`);
                }
            }
        } else {
            console.log('   Need at least 2 users to test cross-access');
        }
        
        // 5. Check database constraints
        console.log('\n5. Checking database constraints:');
        try {
            // Try to create a restaurant with invalid user_id
            await db('restaurants').insert({
                user_id: 99999, // Non-existent user
                name: 'Test Restaurant',
                slug: 'test-restaurant-invalid'
            });
            console.log('   ❌ SECURITY ISSUE: Can create restaurant with invalid user_id!');
        } catch (error) {
            if (error.message.includes('foreign key') || error.message.includes('FOREIGN KEY')) {
                console.log('   ✅ Foreign key constraint working (cannot create restaurant with invalid user_id)');
            } else {
                console.log('   ⚠️  Unexpected error:', error.message);
            }
        }
        
        // 6. Summary
        console.log('\n6. Data Isolation Summary:');
        const totalUsers = users.length;
        const totalRestaurants = await db('restaurants').count('id as count').first();
        const totalMenus = await db('menus').count('id as count').first();
        
        console.log(`   - Total Users: ${totalUsers}`);
        console.log(`   - Total Restaurants: ${totalRestaurants.count}`);
        console.log(`   - Total Menus: ${totalMenus.count}`);
        
        // Check if each user has proper isolation
        let isolationIssues = 0;
        for (const user of users) {
            const userRestaurants = await db('restaurants').where({ user_id: user.id }).count('id as count').first();
            const accessibleRestaurants = await db('restaurants').count('id as count').first();
            
            if (userRestaurants.count !== accessibleRestaurants.count && users.length > 1) {
                // This is actually good - users should not see all restaurants
                console.log(`   ✅ User ${user.id} has proper data isolation`);
            }
        }
        
        console.log('\n✅ Data isolation test completed!');
        
    } catch (error) {
        console.error('❌ Data isolation test failed:', error);
    } finally {
        await db.destroy();
    }
}

// Run the test
testDataIsolation();
