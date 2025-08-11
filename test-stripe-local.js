#!/usr/bin/env node

// Simple test script for local Stripe testing
console.log('🧪 Stripe Local Testing Setup');
console.log('==============================');
console.log('');

console.log('1️⃣ Install Stripe CLI:');
console.log('   brew install stripe/stripe-cli/stripe');
console.log('');

console.log('2️⃣ Login to Stripe:');
console.log('   stripe login');
console.log('');

console.log('3️⃣ Start webhook forwarding (in one terminal):');
console.log('   stripe listen --forward-to localhost:5174/api/webhook');
console.log('');

console.log('4️⃣ Copy the webhook secret to your .env file');
console.log('   STRIPE_WEBHOOK_SECRET=whsec_...');
console.log('');

console.log('5️⃣ Test webhook delivery (in another terminal):');
console.log('   stripe trigger payment_intent.succeeded');
console.log('');

console.log('6️⃣ Check your server logs for webhook events');
console.log('');

console.log('🎯 Your local webhook URL: http://localhost:5174/api/webhook');
console.log('📝 Make sure your .env has STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET');
console.log('');

console.log('🚀 Ready to test! Start with step 3 above.'); 