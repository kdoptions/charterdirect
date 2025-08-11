import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      email, 
      businessName, 
      firstName, 
      lastName,
      phone,
      address,
      boatId
    } = req.body;

    // Validate required fields
    if (!email || !businessName || !firstName || !lastName) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, businessName, firstName, lastName' 
      });
    }

    console.log('🏢 Creating Connect account for:', { email, businessName, boatId });

    // Create a Connect account
    const account = await stripe.accounts.create({
      type: 'express', // Use Express for easier onboarding
      country: 'AU', // Australia
      email: email,
      business_type: 'individual',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: businessName,
        url: process.env.FRONTEND_URL || 'https://yourdomain.com',
        mcc: '7999', // Amusement and recreation services
      },
      individual: {
        email: email,
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        address: address ? {
          line1: address.line1,
          city: address.city,
          state: address.state,
          postal_code: address.postal_code,
          country: 'AU'
        } : undefined,
      },
      metadata: {
        boatId,
        businessName,
        type: 'boat_owner'
      }
    });

    console.log('✅ Connect account created:', account.id);

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL || 'https://yourdomain.com'}/stripe-connect/refresh`,
      return_url: `${process.env.FRONTEND_URL || 'https://yourdomain.com'}/stripe-connect/return`,
      type: 'account_onboarding',
    });

    return res.status(200).json({
      success: true,
      accountId: account.id,
      accountLink: accountLink.url,
      status: account.charges_enabled ? 'active' : 'pending'
    });

  } catch (error) {
    console.error('❌ Error creating Connect account:', error);
    
    return res.status(500).json({ 
      error: 'Failed to create Connect account',
      details: error.message 
    });
  }
} 