import Stripe from 'stripe';

// Initialize Stripe with secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Debug: Log environment variables (without exposing secrets)
    console.log('🔍 Environment check:', {
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
      stripeKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7),
      businessUrl: process.env.BUSINESS_URL,
      nodeEnv: process.env.NODE_ENV
    });

    const { 
      boatId, 
      boatName, 
      ownerEmail, 
      ownerName, 
      businessType = 'individual',
      country = 'US'
    } = req.body;

    // Validate required fields
    if (!boatId || !ownerEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields: boatId and ownerEmail' 
      });
    }

    console.log('🔗 Creating Stripe Connect account for:', {
      boatId,
      boatName,
      ownerEmail,
      ownerName,
      businessType,
      country
    });

    // Create Express account (simplified onboarding)
    const account = await stripe.accounts.create({
      type: 'express',
      country: country,
      email: ownerEmail,
      business_type: businessType,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      business_profile: {
        name: boatName || 'Boat Charter Business',
        url: process.env.BUSINESS_URL || 'https://charterdirect.vercel.app',
        mcc: '7999', // Amusement and Recreation Services
        product_description: 'Boat charter and rental services'
      },
      tos_acceptance: {
        date: Math.floor(Date.now() / 1000),
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
      }
    });

    console.log('✅ Stripe Connect account created:', account.id);

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
    console.error('❌ Error creating Connect account:', error);
    
    // Return detailed error for debugging
    return res.status(500).json({ 
      error: 'Failed to create connected account',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      type: error.constructor.name
    });
  }
} 