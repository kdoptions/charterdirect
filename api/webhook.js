import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
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
      
      case 'transfer.created':
        await handleTransferCreated(event.data.object);
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
  
  // Here you would:
  // 1. Update booking status in your database
  // 2. Send confirmation emails
  // 3. Create calendar events
  // 4. Update payment records
  
  console.log('📋 Processing successful payment for:', {
    bookingId,
    boatId,
    customerEmail,
    type,
    amount: paymentIntent.amount / 100
  });
}

// Handle failed payment
async function handlePaymentIntentFailed(paymentIntent) {
  console.log('❌ Payment failed:', paymentIntent.id);
  
  const { boatId, bookingId, customerEmail } = paymentIntent.metadata;
  
  // Here you would:
  // 1. Update booking status to payment_failed
  // 2. Send failure notification emails
  // 3. Log the failure for admin review
  
  console.log('📋 Processing failed payment for:', {
    bookingId,
    boatId,
    customerEmail,
    lastPaymentError: paymentIntent.last_payment_error?.message
  });
}

// Handle Connect account updates
async function handleAccountUpdated(account) {
  console.log('🏢 Account updated:', account.id);
  
  // Here you would:
  // 1. Update account status in your database
  // 2. Notify boat owner of account status changes
  // 3. Update boat listing status if needed
  
  console.log('📋 Account status:', {
    accountId: account.id,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    requirements: account.requirements
  });
}

// Handle transfers (payouts to boat owners)
async function handleTransferCreated(transfer) {
  console.log('💸 Transfer created:', transfer.id);
  
  // Here you would:
  // 1. Log the transfer in your database
  // 2. Update payment records
  // 3. Send confirmation to boat owner
  
  console.log('📋 Transfer details:', {
    transferId: transfer.id,
    amount: transfer.amount / 100,
    destination: transfer.destination,
    status: transfer.status
  });
} 