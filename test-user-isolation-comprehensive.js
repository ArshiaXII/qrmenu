// Use built-in fetch for Node.js 18+
const fetch = globalThis.fetch || require('node-fetch');

const API_BASE = 'http://localhost:5000/api';

class UserIsolationTester {
    constructor() {
        this.users = [];
    }

    async clearAllSessions() {
        try {
            await fetch(`${API_BASE}/auth/clear-session`, {
                method: 'POST'
            });
            console.log('✅ Cleared all sessions');
        } catch (error) {
            console.log('⚠️ Could not clear sessions:', error.message);
        }
    }

    async registerUser(email, password) {
        try {
            console.log(`\n🔄 Registering user: ${email}`);
            
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email, 
                    password, 
                    confirmPassword: password 
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                console.log(`✅ User ${email} registered successfully`);
                console.log(`   User ID: ${data.user.id}`);
                console.log(`   Restaurant ID: ${data.user.restaurant_id || 'None'}`);
                
                return {
                    email,
                    token: data.token,
                    user: data.user,
                    success: true
                };
            } else {
                console.log(`❌ Registration failed for ${email}: ${data.message}`);
                return { email, success: false, error: data.message };
            }
        } catch (error) {
            console.log(`❌ Registration error for ${email}: ${error.message}`);
            return { email, success: false, error: error.message };
        }
    }

    async loginUser(email, password) {
        try {
            console.log(`\n🔄 Logging in user: ${email}`);
            
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            
            if (data.success) {
                console.log(`✅ User ${email} logged in successfully`);
                console.log(`   User ID: ${data.user.id}`);
                console.log(`   Restaurant ID: ${data.user.restaurant_id || 'None'}`);
                console.log(`   Restaurant Slug: ${data.user.restaurantSlug || 'None'}`);
                
                return {
                    email,
                    token: data.token,
                    user: data.user,
                    success: true
                };
            } else {
                console.log(`❌ Login failed for ${email}: ${data.message}`);
                return { email, success: false, error: data.message };
            }
        } catch (error) {
            console.log(`❌ Login error for ${email}: ${error.message}`);
            return { email, success: false, error: error.message };
        }
    }

    async debugSession(token) {
        try {
            const response = await fetch(`${API_BASE}/auth/debug-session`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.log(`❌ Debug session error: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async getRestaurant(token) {
        try {
            const response = await fetch(`${API_BASE}/restaurants/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.log(`❌ Get restaurant error: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async createRestaurant(token, name) {
        try {
            const response = await fetch(`${API_BASE}/restaurants/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ 
                    name,
                    description: `Test restaurant for ${name}`
                }),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.log(`❌ Create restaurant error: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async runComprehensiveTest() {
        console.log('🧪 STARTING COMPREHENSIVE USER ISOLATION TEST\n');
        
        // Step 1: Clear all sessions
        await this.clearAllSessions();
        
        // Step 2: Register multiple users with unique timestamps
        const timestamp = Date.now();
        const user1 = await this.registerUser(`testuser1-${timestamp}@isolation.test`, 'TestPass123!');
        const user2 = await this.registerUser(`testuser2-${timestamp}@isolation.test`, 'TestPass123!');
        const user3 = await this.registerUser(`testuser3-${timestamp}@isolation.test`, 'TestPass123!');
        
        if (!user1.success || !user2.success || !user3.success) {
            console.log('❌ User registration failed, stopping test');
            return;
        }
        
        this.users = [user1, user2, user3];
        
        // Step 3: Create restaurants for each user
        console.log('\n📝 CREATING RESTAURANTS FOR EACH USER');
        
        const restaurant1 = await this.createRestaurant(user1.token, 'User1 Restaurant');
        const restaurant2 = await this.createRestaurant(user2.token, 'User2 Restaurant');
        const restaurant3 = await this.createRestaurant(user3.token, 'User3 Restaurant');
        
        console.log('\n🏪 RESTAURANT CREATION RESULTS:');
        console.log('User 1 Restaurant:', restaurant1.restaurant?.name || 'FAILED');
        console.log('User 2 Restaurant:', restaurant2.restaurant?.name || 'FAILED');
        console.log('User 3 Restaurant:', restaurant3.restaurant?.name || 'FAILED');
        
        // Step 4: Test data isolation
        console.log('\n🔒 TESTING DATA ISOLATION');
        
        for (let i = 0; i < this.users.length; i++) {
            const user = this.users[i];
            console.log(`\n--- Testing User ${i + 1}: ${user.email} ---`);
            
            // Debug session
            const debug = await this.debugSession(user.token);
            if (debug.success) {
                console.log(`🔍 Debug Info:`);
                console.log(`   Middleware User ID: ${debug.debug.middleware_user?.id}`);
                console.log(`   Middleware Restaurant ID: ${debug.debug.middleware_user?.restaurant_id}`);
                console.log(`   DB User ID: ${debug.debug.database.user?.id}`);
                console.log(`   DB Restaurant: ${debug.debug.database.restaurant?.name} (ID: ${debug.debug.database.restaurant?.id})`);
            }
            
            // Get restaurant
            const restaurant = await this.getRestaurant(user.token);
            if (restaurant.restaurant) {
                console.log(`🏪 Restaurant: ${restaurant.restaurant.name} (ID: ${restaurant.restaurant.id})`);
            } else {
                console.log(`❌ No restaurant found for user ${user.email}`);
            }
        }
        
        // Step 5: Cross-user access test
        console.log('\n🚫 TESTING CROSS-USER ACCESS (Should all fail)');
        
        // Try to access User 2's restaurant with User 1's token
        console.log('\n--- Cross-access test: User 1 trying to access User 2\'s data ---');
        const crossAccessDebug = await this.debugSession(user1.token);
        if (crossAccessDebug.success) {
            const user1RestaurantId = crossAccessDebug.debug.middleware_user?.restaurant_id;
            const user2RestaurantId = restaurant2.restaurant?.id;
            
            if (user1RestaurantId === user2RestaurantId) {
                console.log('❌ CRITICAL BUG: User 1 can see User 2\'s restaurant!');
                console.log(`   User 1 sees restaurant ID: ${user1RestaurantId}`);
                console.log(`   User 2 restaurant ID: ${user2RestaurantId}`);
            } else {
                console.log('✅ Data isolation working: User 1 cannot see User 2\'s restaurant');
                console.log(`   User 1 sees restaurant ID: ${user1RestaurantId}`);
                console.log(`   User 2 restaurant ID: ${user2RestaurantId}`);
            }
        }
        
        // Step 6: Login switching test
        console.log('\n🔄 TESTING LOGIN SWITCHING');
        
        // Login as User 1
        const loginUser1 = await this.loginUser(`testuser1-${timestamp}@isolation.test`, 'TestPass123!');
        if (loginUser1.success) {
            const debug1 = await this.debugSession(loginUser1.token);
            console.log(`After login as User 1: Restaurant ID = ${debug1.debug?.middleware_user?.restaurant_id}`);
        }

        // Login as User 2
        const loginUser2 = await this.loginUser(`testuser2-${timestamp}@isolation.test`, 'TestPass123!');
        if (loginUser2.success) {
            const debug2 = await this.debugSession(loginUser2.token);
            console.log(`After login as User 2: Restaurant ID = ${debug2.debug?.middleware_user?.restaurant_id}`);
        }

        // Login as User 3
        const loginUser3 = await this.loginUser(`testuser3-${timestamp}@isolation.test`, 'TestPass123!');
        if (loginUser3.success) {
            const debug3 = await this.debugSession(loginUser3.token);
            console.log(`After login as User 3: Restaurant ID = ${debug3.debug?.middleware_user?.restaurant_id}`);
        }
        
        console.log('\n✅ COMPREHENSIVE TEST COMPLETED');
        console.log('\nIf you see different restaurant IDs for each user, isolation is working.');
        console.log('If you see the same restaurant ID, there is a BUG that needs fixing.');
    }
}

// Run the test
async function runTest() {
    const tester = new UserIsolationTester();
    await tester.runComprehensiveTest();
    process.exit(0);
}

runTest().catch(console.error);
