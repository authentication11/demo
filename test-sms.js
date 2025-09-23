require('dotenv').config();
const { sendSMS } = require('./utils/sms');

/**
 * Test script for Africa's Talking SMS integration
 * 
 * This script tests the SMS sending functionality using the sandbox environment.
 * Make sure to add +2348082225459 to your Africa's Talking Sandbox Simulator first!
 */

async function testSMS() {
    console.log('🧪 Testing Africa\'s Talking SMS API with dotenv...\n');
    
    // Test phone number - MUST be added to Sandbox Simulator first!
    const testPhoneNumber = '+2348082225459';
    
    // Test message
    const testMessage = 'Hello Sandbox SMS!';

    try {
        console.log(`📱 Sending test SMS to: ${testPhoneNumber}`);
        console.log(`📝 Message: "${testMessage}"\n`);
        
        const result = await sendSMS(testPhoneNumber, testMessage);
        
        console.log('\n🎉 SMS Test PASSED!');
        console.log('✅ Result:', JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.log('\n❌ SMS Test FAILED!');
        console.error('❌ Error:', error.message);
        
        // Provide helpful troubleshooting tips
        if (error.message.includes('InvalidSenderId')) {
            console.log('\n💡 TROUBLESHOOTING TIPS:');
            console.log('- Verify AT_USERNAME is set to "sandbox" in .env file');
            console.log('- Ensure the from field is forced to "sandbox" in sandbox mode');
            console.log('- Check that you\'re using the correct sandbox API key');
        } else if (error.message.includes('Authentication error')) {
            console.log('\n💡 TROUBLESHOOTING TIPS:');
            console.log('- Check your AT_API_KEY in the .env file');
            console.log('- Verify AT_USERNAME is set to "sandbox"');
            console.log('- Make sure you\'re using a valid sandbox API key');
        } else if (error.message.includes('Network error')) {
            console.log('\n💡 TROUBLESHOOTING TIPS:');
            console.log('- Check your internet connection');
            console.log('- Verify Africa\'s Talking API is accessible');
        } else {
            console.log('\n💡 TROUBLESHOOTING TIPS:');
            console.log('- Add your phone number to the Sandbox Simulator first');
            console.log('- Go to: https://account.africastalking.com/apps/sandbox');
            console.log('- Navigate to SMS → Simulator');
            console.log(`- Add ${testPhoneNumber} to the simulator`);
        }
    }
}

// Run the test
if (require.main === module) {
    testSMS();
}

module.exports = {
    testSMS
};