import Stripe from 'stripe';

// Initialize Stripe with secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('🔔 Webhook received:', event.type);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      
      case 'account.updated':
        await handleAccountUpdated(event.data.object);
        break;
      
      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('❌ Webhook handler error:', error);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
}

// Handle successful payment
async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log('✅ Payment succeeded:', paymentIntent.id);
  
  const { boatId, bookingId, customerEmail, type } = paymentIntent.metadata;
  
  console.log('📋 Processing successful payment for:', {
    bookingId,
    boatId,
    customerEmail,
    type,
    amount: paymentIntent.amount / 100
  });

  // TODO: Update booking status in your database
  // TODO: Send confirmation emails
  // TODO: Schedule balance payment
}

// Handle failed payment
async function handlePaymentIntentFailed(paymentIntent) {
  console.log('❌ Payment failed:', paymentIntent.id);
  
  const { boatId, bookingId, customerEmail } = paymentIntent.metadata;
  
  console.log('📋 Processing failed payment for:', {
    bookingId,
    boatId,
    customerEmail,
    lastPaymentError: paymentIntent.last_payment_error?.message
  });

  // TODO: Update booking status in your database
  // TODO: Send failure notification emails
}

// Handle Connect account updates
async function handleAccountUpdated(account) {
  console.log('🏢 Account updated:', account.id);
  
  // TODO: Update boat owner's Stripe account status in your database
  // TODO: Send notification when account is fully verified
} 