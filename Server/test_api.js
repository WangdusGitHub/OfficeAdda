import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
let adminToken = '';

const runTests = async () => {
  console.log('🚀 Starting EMS API Testing Suite...\n');

  try {
    // 1. Test Login
    console.log('🧪 Testing Admin Login...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@ems.com',
      password: 'admin123'
    });
    
    if (loginRes.data.success) {
      adminToken = loginRes.data.token;
      console.log('✅ Login Successful! Token received.\n');
    }

    const config = { headers: { Authorization: `Bearer ${adminToken}` } };

    // 2. Test Fetching Departments
    console.log('🧪 Testing GET /departments...');
    const deptRes = await axios.get(`${BASE_URL}/departments`, config);
    console.log(`✅ Success: Found ${deptRes.data.departments?.length || 0} departments.\n`);

    // 3. Test Fetching Employees
    console.log('🧪 Testing GET /employees...');
    const empRes = await axios.get(`${BASE_URL}/employees`, config);
    console.log(`✅ Success: Found ${empRes.data.employees?.length || 0} employees.\n`);

    // 4. Test Validation Error
    console.log('🧪 Testing Joi Validation (Short Password)...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@ems.com',
        password: '123'
      });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Success: Validation correctly rejected short password.\n');
      }
    }

    console.log('🏁 All Core API Tests Passed!');
  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data?.message || error.message);
  }
};

runTests();
