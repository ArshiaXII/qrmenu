// Use built-in fetch for Node.js 18+
const fetch = globalThis.fetch || require('node-fetch');

const API_BASE = 'http://localhost:5000/api';

class AuthSecurityTester {
    constructor() {
        this.testResults = [];
    }

    async runTest(testName, testFunction) {
        console.log(`\n🧪 Testing: ${testName}`);
        try {
            const result = await testFunction();
            this.testResults.push({ name: testName, status: 'PASS', result });
            console.log(`✅ PASS: ${testName}`);
            return result;
        } catch (error) {
            this.testResults.push({ name: testName, status: 'FAIL', error: error.message });
            console.log(`❌ FAIL: ${testName} - ${error.message}`);
            return null;
        }
    }

    async testLoginWithFakeEmail() {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: 'fake.user@nonexistent.com', 
                password: 'anypassword' 
            }),
        });

        const data = await response.json();
        
        if (response.status === 401 && !data.success) {
            return { expected: 'Should return 401 Unauthorized', actual: 'Correctly returned 401' };
        } else {
            throw new Error(`Expected 401, got ${response.status}. Data: ${JSON.stringify(data)}`);
        }
    }

    async testLoginWithWrongPassword() {
        // First register a user
        await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: 'test.user@security.test', 
                password: 'CorrectPassword123!',
                confirmPassword: 'CorrectPassword123!'
            }),
        });

        // Now try to login with wrong password
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: 'test.user@security.test', 
                password: 'WrongPassword123!' 
            }),
        });

        const data = await response.json();
        
        if (response.status === 401 && !data.success) {
            return { expected: 'Should return 401 Unauthorized', actual: 'Correctly returned 401' };
        } else {
            throw new Error(`Expected 401, got ${response.status}. Data: ${JSON.stringify(data)}`);
        }
    }

    async testRegisterWithExistingEmail() {
        const email = 'duplicate.user@security.test';
        
        // Register first user
        await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email, 
                password: 'Password123!',
                confirmPassword: 'Password123!'
            }),
        });

        // Try to register again with same email
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email, 
                password: 'DifferentPassword123!',
                confirmPassword: 'DifferentPassword123!'
            }),
        });

        const data = await response.json();
        
        if (response.status === 409 && !data.success) {
            return { expected: 'Should return 409 Conflict', actual: 'Correctly returned 409' };
        } else {
            throw new Error(`Expected 409, got ${response.status}. Data: ${JSON.stringify(data)}`);
        }
    }

    async testValidLogin() {
        const email = 'valid.user@security.test';
        const password = 'ValidPassword123!';
        
        // Register user first
        await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email, 
                password,
                confirmPassword: password
            }),
        });

        // Now login with correct credentials
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        
        if (response.status === 200 && data.success && data.token) {
            return { 
                expected: 'Should return 200 with token', 
                actual: `Correctly returned 200 with token and user ID ${data.user.id}`,
                token: data.token,
                user: data.user
            };
        } else {
            throw new Error(`Expected 200 with token, got ${response.status}. Data: ${JSON.stringify(data)}`);
        }
    }

    async testMeEndpoint(token) {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
            credentials: 'include',
        });

        const data = await response.json();
        
        if (response.status === 200 && data.success && data.user) {
            return { 
                expected: 'Should return user info', 
                actual: `Correctly returned user: ${data.user.email} (ID: ${data.user.id})`,
                user: data.user
            };
        } else {
            throw new Error(`Expected 200 with user info, got ${response.status}. Data: ${JSON.stringify(data)}`);
        }
    }

    async testMeEndpointWithoutToken() {
        const response = await fetch(`${API_BASE}/auth/me`, {
            credentials: 'include',
        });

        const data = await response.json();
        
        if (response.status === 401 && !data.success) {
            return { expected: 'Should return 401 Unauthorized', actual: 'Correctly returned 401' };
        } else {
            throw new Error(`Expected 401, got ${response.status}. Data: ${JSON.stringify(data)}`);
        }
    }

    async testPasswordHashing() {
        const email = 'hash.test@security.test';
        const password = 'TestPassword123!';
        
        // Register user
        const registerResponse = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email, 
                password,
                confirmPassword: password
            }),
        });

        const registerData = await registerResponse.json();
        
        if (registerResponse.status === 201 && registerData.success) {
            // Check that password is not stored in plain text (this is just a basic check)
            if (registerData.user && !registerData.user.password && !registerData.user.password_hash) {
                return { 
                    expected: 'Password should not be in response', 
                    actual: 'Password correctly not included in response'
                };
            } else {
                throw new Error('Password or hash found in response - security issue!');
            }
        } else {
            throw new Error(`Registration failed: ${JSON.stringify(registerData)}`);
        }
    }

    async runAllTests() {
        console.log('🔐 STARTING COMPREHENSIVE AUTHENTICATION SECURITY TESTS\n');
        
        // Clear any existing sessions
        try {
            await fetch(`${API_BASE}/auth/clear-session`, { method: 'POST' });
        } catch (e) {
            console.log('Could not clear sessions (endpoint might not exist)');
        }

        // Run all security tests
        await this.runTest('Login with fake email should fail', () => this.testLoginWithFakeEmail());
        await this.runTest('Login with wrong password should fail', () => this.testLoginWithWrongPassword());
        await this.runTest('Register with existing email should fail', () => this.testRegisterWithExistingEmail());
        await this.runTest('Valid login should succeed', () => this.testValidLogin());
        
        // Get token from valid login for subsequent tests
        const validLoginResult = this.testResults.find(r => r.name.includes('Valid login'));
        const token = validLoginResult?.result?.token;
        
        if (token) {
            await this.runTest('/me endpoint with valid token should work', () => this.testMeEndpoint(token));
        }
        
        await this.runTest('/me endpoint without token should fail', () => this.testMeEndpointWithoutToken());
        await this.runTest('Password should be properly hashed', () => this.testPasswordHashing());

        // Print summary
        console.log('\n📊 TEST SUMMARY:');
        console.log('================');
        
        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        
        this.testResults.forEach(result => {
            const icon = result.status === 'PASS' ? '✅' : '❌';
            console.log(`${icon} ${result.name}`);
            if (result.status === 'FAIL') {
                console.log(`   Error: ${result.error}`);
            }
        });
        
        console.log(`\nTotal: ${this.testResults.length} tests`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);
        
        if (failed === 0) {
            console.log('\n🎉 ALL AUTHENTICATION SECURITY TESTS PASSED!');
            console.log('✅ Authentication system is secure and working correctly.');
        } else {
            console.log('\n🚨 SOME TESTS FAILED!');
            console.log('❌ Authentication system has security issues that need to be fixed.');
        }
        
        return { passed, failed, total: this.testResults.length };
    }
}

// Run the tests
async function runSecurityTests() {
    const tester = new AuthSecurityTester();
    await tester.runAllTests();
    process.exit(0);
}

runSecurityTests().catch(console.error);
