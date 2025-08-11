import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentIntentId, bookingId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ 
        error: 'Missing paymentIntentId' 
      });
    }

    // Retrieve the PaymentIntent to get current status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    console.log('🔍 PaymentIntent status:', paymentIntent.status);

    if (paymentIntent.status === 'succeeded') {
      // Payment was successful
      console.log('✅ Payment confirmed for booking:', bookingId);
      
      // Here you would typically:
      // 1. Update your database with payment confirmation
      // 2. Send confirmation emails
      // 3. Create calendar events
      // 4. Update booking status

      return res.status(200).json({
        success: true,
        status: 'confirmed',
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100, // Convert back to dollars
        applicationFee: paymentIntent.application_fee_amount / 100,
        transferAmount: (paymentIntent.amount - paymentIntent.application_fee_amount) / 100,
        metadata: paymentIntent.metadata
      });

    } else if (paymentIntent.status === 'requires_payment_method') {
      // Payment failed or was cancelled
      return res.status(400).json({
        success: false,
        status: 'failed',
        error: 'Payment requires a valid payment method'
      });

    } else if (paymentIntent.status === 'processing') {
      // Payment is being processed (e.g., bank transfer)
      return res.status(200).json({
        success: true,
        status: 'processing',
        message: 'Payment is being processed'
      });

    } else {
      // Other statuses
      return res.status(400).json({
        success: false,
        status: paymentIntent.status,
        error: `Payment status: ${paymentIntent.status}`
      });
    }

  } catch (error) {
    console.error('❌ Error confirming payment:', error);
    
    return res.status(500).json({ 
      error: 'Failed to confirm payment',
      details: error.message 
    });
  }
} 