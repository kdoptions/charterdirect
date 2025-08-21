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
      accountId, 
      refreshUrl, 
      returnUrl, 
      type = 'account_onboarding'
    } = req.body;

    // Validate required fields
    if (!accountId || !refreshUrl || !returnUrl) {
      return res.status(400).json({ 
        error: 'Missing required fields: accountId, refreshUrl, and returnUrl' 
      });
    }

    console.log('🔗 Creating account link for:', {
      accountId,
      refreshUrl,
      returnUrl,
      type
    });

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: type
    });

    console.log('✅ Account link created:', accountLink.url);

    return res.status(200).json({
      success: true,
      url: accountLink.url
    });

  } catch (error) {
    console.error('❌ Error creating account link:', error);
    return res.status(500).json({ 
      error: 'Failed to create account link',
      details: error.message 
    });
  }
}
