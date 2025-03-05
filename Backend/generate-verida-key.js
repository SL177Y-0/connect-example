const crypto = require('crypto');

// Generate a random 32-byte (256-bit) hex string with 0x prefix
const privateKey = '0x' + crypto.randomBytes(32).toString('hex');

console.log('Your Verida private key:', privateKey);
console.log('\nAdd this to your .env file:');
console.log('VERIDA_PRIVATE_KEY=' + privateKey);
