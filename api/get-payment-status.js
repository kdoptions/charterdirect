import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentIntentId, accountId } = req.query;

    if (!paymentIntentId && !accountId) {
      return res.status(400).json({ 
        error: 'Missing required parameter: paymentIntentId or accountId' 
      });
    }

    if (paymentIntentId) {
      // Get payment intent status
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      return res.status(200).json({
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          applicationFee: paymentIntent.application_fee_amount / 100,
          transferAmount: (paymentIntent.amount - paymentIntent.application_fee_amount) / 100,
          created: new Date(paymentIntent.created * 1000),
          metadata: paymentIntent.metadata,
          lastPaymentError: paymentIntent.last_payment_error,
          charges: paymentIntent.charges?.data.map(charge => ({
            id: charge.id,
            status: charge.status,
            amount: charge.amount / 100,
            created: new Date(charge.created * 1000)
          }))
        }
      });

    } else if (accountId) {
      // Get Connect account status
      const account = await stripe.accounts.retrieve(accountId);
      
      return res.status(200).json({
        success: true,
        account: {
          id: account.id,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
          detailsSubmitted: account.details_submitted,
          requirements: account.requirements,
          businessProfile: account.business_profile,
          individual: account.individual,
          metadata: account.metadata
        }
      });
    }

  } catch (error) {
    console.error('❌ Error retrieving payment status:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(404).json({ 
        error: 'Payment intent or account not found',
        details: error.message 
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to retrieve payment status',
      details: error.message 
    });
  }
} 