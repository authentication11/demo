require('dotenv').config();
const AfricasTalking = require('africastalking');

/**
 * Africa's Talking SMS Integration Module with dotenv support
 * 
 * This module handles SMS sending using the Africa's Talking API with proper
 * sandbox authentication and environment variable management.
 */

// Read configuration from environment variables
const AT_API_KEY = process.env.AT_API_KEY;
const AT_USERNAME = process.env.AT_USERNAME;
const AT_SENDER = process.env.AT_SENDER;

// Validate required environment variables
if (!AT_API_KEY) {
    throw new Error('AT_API_KEY environment variable is required. Check your .env file.');
}

if (!AT_USERNAME) {
    throw new Error('AT_USERNAME environment variable is required. Check your .env file.');
}

// Initialize Africa's Talking SDK
const africastalking = AfricasTalking({
    apiKey: AT_API_KEY,
    username: AT_USERNAME
});

// Get the SMS service
const sms = africastalking.SMS;

/**
 * Sanitize phone number by removing spaces, dashes, and non-digit chars except leading +
 * @param {string} phoneNumber - Raw phone number input
 * @returns {string} - Sanitized phone number
 */
function sanitizePhoneNumber(phoneNumber) {
    if (!phoneNumber || typeof phoneNumber !== 'string') {
        throw new Error('Phone number must be a non-empty string');
    }
    
    let sanitized = phoneNumber.trim();
    
    // Keep leading + and remove all non-digits from the rest
    if (sanitized.startsWith('+')) {
        sanitized = '+' + sanitized.substring(1).replace(/[^0-9]/g, '');
    } else {
        sanitized = sanitized.replace(/[^0-9]/g, '');
    }
    
    if (!sanitized || sanitized === '+') {
        throw new Error('Invalid phone number format');
    }
    
    return sanitized;
}

/**
 * Mask API key for logging (show first 6 chars + ...)
 * @param {string} apiKey - Full API key
 * @returns {string} - Masked API key
 */
function maskApiKey(apiKey) {
    if (!apiKey || apiKey.length < 6) {
        return 'invalid_key';
    }
    return apiKey.substring(0, 6) + '...';
}

/**
 * Send SMS using Africa's Talking API
 * @param {string} to - Recipient phone number (will be sanitized)
 * @param {string} message - SMS message content
 * @returns {Promise<Object>} - Success response with recipient info
 * @throws {Error} - On API errors, network issues, or validation failures
 */
async function sendSMS(to, message) {
    try {
        // Validate inputs
        if (!to || typeof to !== 'string') {
            throw new Error('Recipient phone number is required and must be a string');
        }
        
        if (!message || typeof message !== 'string') {
            throw new Error('Message is required and must be a string');
        }
        
        // Sanitize phone number
        const sanitizedNumber = sanitizePhoneNumber(to);
        console.log(`📱 Sanitized phone number: ${to} → ${sanitizedNumber}`);
        
        // Force sandbox sender for sandbox mode
        let fromSender;
        if (AT_USERNAME === 'sandbox') {
            fromSender = 'sandbox'; // Always use 'sandbox' for sandbox mode
            console.log('🧪 Using sandbox mode - forcing from: "sandbox"');
        } else {
            fromSender = AT_SENDER || 'SMS';
            console.log(`🚀 Using production mode with from: "${fromSender}"`);
        }
        
        // Prepare SMS options
        const options = {
            to: [sanitizedNumber], // Africa's Talking expects an array
            message: message,
            from: fromSender
        };
        
        // Log exact options for debugging (mask API key)
        console.log('📤 SMS Options:', JSON.stringify(options, null, 2));
        console.log(`🔑 Using API Key: ${maskApiKey(AT_API_KEY)}`);
        console.log(`👤 Using Username: ${AT_USERNAME}`);
        
        // Send SMS via Africa's Talking API
        console.log('🔄 Calling Africa\'s Talking SMS API...');
        const response = await sms.send(options);
        
        console.log('📥 Raw API Response:', JSON.stringify(response, null, 2));
        
        // Validate response structure
        if (!response || !response.SMSMessageData) {
            throw new Error('Invalid API response structure');
        }
        
        const { SMSMessageData } = response;
        
        // Check for InvalidSenderId error
        if (SMSMessageData.Message === "InvalidSenderId") {
            throw new Error('SMS API Error: InvalidSenderId — are you using sandbox credentials AND using from: "sandbox"?');
        }
        
        // Check if recipients array exists and has entries
        if (!SMSMessageData.Recipients || SMSMessageData.Recipients.length === 0) {
            const errorMessage = SMSMessageData.Message || 'No recipients processed';
            if (errorMessage.includes('InvalidSenderId')) {
                throw new Error('SMS API Error: InvalidSenderId — are you using sandbox credentials AND using from: "sandbox"?');
            }
            throw new Error(`SMS API Error: ${errorMessage}`);
        }
        
        // Check first recipient status
        const recipient = SMSMessageData.Recipients[0];
        if (recipient.status !== 'Success') {
            console.error(`❌ SMS failed for ${recipient.number}: ${recipient.status}`);
            throw new Error(`SMS failed: ${recipient.status}`);
        }
        
        // Success!
        console.log(`✅ SMS sent successfully to ${recipient.number}`);
        console.log(`💰 Cost: ${recipient.cost}`);
        console.log(`🆔 Message ID: ${recipient.messageId}`);
        
        return {
            success: true,
            recipient: recipient.number,
            messageId: recipient.messageId,
            cost: recipient.cost,
            status: recipient.status
        };
        
    } catch (error) {
        // Handle different types of errors
        if (error.response && error.response.status === 401) {
            throw new Error('Authentication error: check AT_API_KEY and AT_USERNAME (sandbox key required for sandbox mode)');
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            throw new Error('Network error: could not reach Africa\'s Talking API');
        } else if (error.message && error.message.includes('SMS API Error:')) {
            // Re-throw API errors as-is
            throw error;
        } else {
            console.error('💥 Unexpected SMS Error:', error.message);
            throw new Error(`SMS sending failed: ${error.message}`);
        }
    }
}

module.exports = {
    sendSMS
};