import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
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

    // Calculate amounts in cents
    const amountInCents = Math.round(amount * 100);
    const applicationFeeInCents = Math.round(applicationFeeAmount * 100);

    console.log('💰 Creating PaymentIntent:', {
      amount: amountInCents,
      applicationFee: applicationFeeInCents,
      connectedAccount: connectedAccountId,
      metadata
    });

    // Create PaymentIntent with application fee
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
      // Optional: Add customer if you have one
      ...(customerEmail && { receipt_email: customerEmail }),
      // Optional: Add description
      description: `Deposit payment for boat booking`,
      // Optional: Add statement descriptor
      statement_descriptor: 'HARBOUR LUX',
      // Optional: Add statement descriptor suffix
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