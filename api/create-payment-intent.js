import Stripe from 'stripe';

// Initialize Stripe with secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    // Validate required fields
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
} 