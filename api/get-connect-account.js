import Stripe from 'stripe';

// Initialize Stripe with secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { accountId } = req.query;

    // Validate required parameter
    if (!accountId) {
      return res.status(400).json({ 
        error: 'Missing required parameter: accountId' 
      });
    }

    console.log('🔗 Retrieving Connect account:', accountId);

    const account = await stripe.accounts.retrieve(accountId);

    console.log('✅ Account retrieved:', account.id);

    return res.status(200).json({
      success: true,
      account: {
        id: account.id,
        object: account.object,
        business_type: account.business_type,
        capabilities: account.capabilities,
        charges_enabled: account.charges_enabled,
        country: account.country,
        default_currency: account.default_currency,
        details_submitted: account.details_submitted,
        email: account.email,
        payouts_enabled: account.payouts_enabled,
        requirements: account.requirements,
        settings: account.settings,
        type: account.type
      }
    });

  } catch (error) {
    console.error('❌ Error retrieving Connect account:', error);
    return res.status(500).json({ 
      error: 'Failed to retrieve connected account',
      details: error.message 
    });
  }
}
