import axios from 'axios';

async function testAPI() {
  try {
    // First login to get a token
    console.log('Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@getfund.com',
      password: 'admin123',
    });

    const token = loginResponse.data.token;
    console.log('Token received:', token ? 'Yes' : 'No');

    // Now test the audit logs endpoint
    console.log('\nFetching audit logs...');
    const auditResponse = await axios.get('http://localhost:5000/api/audit-logs', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        limit: 10,
        offset: 0,
      },
    });

    console.log('\nAudit Logs Response:');
    console.log('Total:', auditResponse.data.total);
    console.log('Logs count:', auditResponse.data.logs.length);
    console.log('\nFirst 3 logs:');
    console.log(JSON.stringify(auditResponse.data.logs.slice(0, 3), null, 2));
  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAPI();
