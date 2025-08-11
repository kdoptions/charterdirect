import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const port = 3001;

// Middleware for Stripe webhooks (raw body)
app.use('/api/webhook', express.raw({ type: 'application/json' }));
// Middleware for other API routes (JSON)
app.use('/api', express.json());

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Webhook endpoint
app.post('/api/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
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
});

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
}

// Handle Connect account updates
async function handleAccountUpdated(account) {
  console.log('🏢 Account updated:', account.id);
}

// Create payment intent endpoint
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { 
      amount, 
      connectedAccountId, 
      applicationFeeAmount, 
      metadata = {},
      customerEmail,
      boatId,
      bookingId
    } = req.body;

    if (!amount || !connectedAccountId) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount and connectedAccountId' 
      });
    }

    const amountInCents = Math.round(amount * 100);
    const applicationFeeInCents = Math.round(applicationFeeAmount * 100);

    console.log('💰 Creating PaymentIntent:', {
      amount: amountInCents,
      applicationFee: applicationFeeInCents,
      connectedAccount: connectedAccountId,
      metadata
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      application_fee_amount: applicationFeeInCents,
      transfer_data: {
        destination: connectedAccountId,
      },
      metadata: {
        ...metadata,
        boatId,
        bookingId,
        customerEmail,
        type: 'deposit_payment'
      },
      receipt_email: customerEmail,
      description: `Deposit payment for boat booking`,
      statement_descriptor: 'HARBOUR LUX',
      statement_descriptor_suffix: 'DEPOSIT'
    });

    console.log('✅ PaymentIntent created:', paymentIntent.id);

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amountInCents,
      applicationFee: applicationFeeInCents
    });

  } catch (error) {
    console.error('❌ Error creating PaymentIntent:', error);
    return res.status(500).json({ 
      error: 'Failed to create payment intent',
      details: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API Server running' });
});

app.listen(port, () => {
  console.log(`🚀 API Server running on http://localhost:${port}`);
  console.log(`🔗 Webhook endpoint: http://localhost:${port}/api/webhook`);
  console.log(`💳 Payment endpoint: http://localhost:${port}/api/create-payment-intent`);
  console.log(`📱 Frontend will proxy /api/* to this server`);
}); 