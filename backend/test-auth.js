const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

async function testAuthentication() {
    console.log('🧪 Starting Authentication Tests...\n');

    // Test 1: Login with non-existent email
    console.log('Test 1: Login with non-existent email');
    try {
        const response = await axios.post(`${BASE_URL}/login`, {
            email: 'nonexistent@fake.com',
            password: 'wrongpassword'
        });
        console.log('❌ FAILED: Should have returned 401');
        console.log('Response:', response.data);
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log('✅ PASSED: Correctly returned 401');
            console.log('Response:', error.response.data);
        } else {
            console.log('❌ FAILED: Unexpected error');
            console.log('Error:', error.message);
        }
    }
    console.log('');

    // Test 2: Register a new user
    console.log('Test 2: Register a new user');
    try {
        const response = await axios.post(`${BASE_URL}/register`, {
            email: 'test@example.com',
            password: 'TestPass123!'
        });
        console.log('✅ PASSED: User registered successfully');
        console.log('Response:', response.data);
        console.log('Token received:', response.data.token ? 'Yes' : 'No');
    } catch (error) {
        if (error.response && error.response.status === 409) {
            console.log('ℹ️  User already exists, continuing with tests...');
            console.log('Response:', error.response.data);
        } else {
            console.log('❌ FAILED: Registration error');
            console.log('Error:', error.response ? error.response.data : error.message);
        }
    }
    console.log('');

    // Test 3: Login with correct credentials
    console.log('Test 3: Login with correct credentials');
    try {
        const response = await axios.post(`${BASE_URL}/login`, {
            email: 'test@example.com',
            password: 'TestPass123!'
        });
        console.log('✅ PASSED: Login successful');
        console.log('Response:', response.data);
        
        // Store token for next test
        const token = response.data.token;
        
        // Test 4: Call debug endpoint with token
        console.log('\nTest 4: Call /api/debug/me with token');
        try {
            const debugResponse = await axios.get(`${BASE_URL}/debug/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('✅ PASSED: Debug endpoint returned user data');
            console.log('User data:', debugResponse.data);
        } catch (debugError) {
            console.log('❌ FAILED: Debug endpoint error');
            console.log('Error:', debugError.response ? debugError.response.data : debugError.message);
        }
        
    } catch (error) {
        console.log('❌ FAILED: Login error');
        console.log('Error:', error.response ? error.response.data : error.message);
    }
    console.log('');

    // Test 5: Login with wrong password
    console.log('Test 5: Login with wrong password');
    try {
        const response = await axios.post(`${BASE_URL}/login`, {
            email: 'test@example.com',
            password: 'WrongPassword123!'
        });
        console.log('❌ FAILED: Should have returned 401');
        console.log('Response:', response.data);
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log('✅ PASSED: Correctly returned 401 for wrong password');
            console.log('Response:', error.response.data);
        } else {
            console.log('❌ FAILED: Unexpected error');
            console.log('Error:', error.message);
        }
    }

    console.log('\n🏁 Authentication tests completed!');
}

testAuthentication().catch(console.error);
