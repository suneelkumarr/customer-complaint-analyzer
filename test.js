const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

const testCases = [
  {
    name: 'Refund Complaint',
    message: "I've been waiting 3 days for my refund and your support hasn't replied. This is really frustrating."
  },
  {
    name: 'Shipping Delay',
    message: "My order was supposed to arrive yesterday but it's still not here. Can you please check the status?"
  },
  {
    name: 'Account Access Issue',
    message: "I can't log into my account anymore. I keep getting an error message saying my credentials are invalid."
  },
  {
    name: 'Positive Feedback',
    message: "Thank you for the excellent customer service! The representative was very helpful and resolved my issue quickly."
  },
  {
    name: 'Billing Inquiry',
    message: "I noticed an extra charge on my credit card statement. Could you please explain what this is for?"
  }
];

async function runTests() {
  console.log('🧪 Starting API tests...\n');
  
  // Test health endpoint
  try {
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.status);
  } catch (error) {
    console.log('❌ Health check failed. Is the server running?');
    return;
  }
  
  // Test complaint analysis
  for (const testCase of testCases) {
    try {
      console.log(`📝 Testing: ${testCase.name}`);
      console.log(`Message: "${testCase.message}"`);
      
      const response = await axios.post(`${BASE_URL}/api/summarize`, {
        message: testCase.message
      });
      
      console.log('✅ Response:', response.data);
      console.log('---');
    } catch (error) {
      console.log('❌ Test failed:', error.response?.data || error.message);
      console.log('---');
    }
  }
  
  // Test validation
  console.log('🧪 Testing validation...');
  try {
    await axios.post(`${BASE_URL}/api/summarize`, {});
  } catch (error) {
    console.log('✅ Validation test passed:', error.response.data.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
