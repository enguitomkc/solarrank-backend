const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api';

async function testAuthentication() {
  console.log('🧪 Testing SolarRank Authentication System\n');

  try {
    // Test 1: Register a new user
    console.log('1. Testing user registration...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPassword123'
    });
    
    console.log('✅ Registration successful');
    console.log('User:', registerResponse.data.user);
    console.log('Token received:', !!registerResponse.data.token);
    
    const token = registerResponse.data.token;

    // Test 2: Login with the same user
    console.log('\n2. Testing user login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'TestPassword123'
    });
    
    console.log('✅ Login successful');
    console.log('User:', loginResponse.data.user);

    // Test 3: Access protected route (get profile)
    console.log('\n3. Testing protected route access...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Protected route access successful');
    console.log('Profile:', profileResponse.data.user);

    // Test 4: Verify token
    console.log('\n4. Testing token verification...');
    const verifyResponse = await axios.get(`${BASE_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Token verification successful');
    console.log('Token is valid:', verifyResponse.data.success);

    console.log('\n🎉 All authentication tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testAuthentication(); 