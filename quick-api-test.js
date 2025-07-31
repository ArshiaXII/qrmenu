const axios = require('axios');

async function testAPI() {
    const BASE_URL = 'http://localhost:5000/api/auth';
    
    console.log('🔍 Testing Backend API Directly...\n');
    
    // Test 1: Login with test user
    console.log('Test 1: Login with test@example.com');
    try {
        const response = await axios.post(`${BASE_URL}/login`, {
            email: 'test@example.com',
            password: 'password123'
        });
        console.log('✅ LOGIN SUCCESS');
        console.log('Status:', response.status);
        console.log('Token received:', !!response.data.token);
        console.log('User data:', response.data.user?.email);
    } catch (error) {
        console.log('❌ LOGIN FAILED');
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data || error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: Register new user
    console.log('Test 2: Register new-test-user-12345@example.com');
    try {
        const response = await axios.post(`${BASE_URL}/register`, {
            email: 'new-test-user-12345@example.com',
            password: 'password123'
        });
        console.log('✅ REGISTRATION SUCCESS');
        console.log('Status:', response.status);
        console.log('Token received:', !!response.data.token);
        console.log('User data:', response.data.user?.email);
    } catch (error) {
        console.log('❌ REGISTRATION FAILED');
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data || error.message);
    }
}

testAPI();
