import { loadStripe } from '@stripe/stripe-js';

class StripeService {
  constructor() {
    this.stripe = null;
    this.elements = null;
    this.paymentElement = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Load Stripe
      const { loadStripe } = await import('@stripe/stripe-js');
      const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      
      if (!publishableKey) {
        console.warn('⚠️ Stripe publishable key not found. Running in demo mode.');
        return false;
      }

      this.stripe = await loadStripe(publishableKey);
      
      if (!this.stripe) {
        console.error('❌ Failed to load Stripe');
        return false;
      }

      this.isInitialized = true;
      console.log('✅ Stripe initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Stripe initialization error:', error);
      return false;
    }
  }

  async createPaymentIntent({ amount, connectedAccountId, applicationFeeAmount, metadata = {} }) {
    try {
      console.log('💳 Creating Stripe payment intent:', { amount, connectedAccountId, applicationFeeAmount });
      
      if (!this.stripe) {
        throw new Error('Stripe not initialized');
      }

      // For development without backend, create a mock payment intent
      if (import.meta.env.DEV) {
        console.log('🔄 Development mode - creating mock payment intent for testing');
        
        // Simulate Stripe API response
        const mockPaymentIntent = {
          id: `pi_mock_${Date.now()}`,
          client_secret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
          amount: amount,
          currency: 'usd',
          status: 'requires_payment_method',
          application_fee_amount: applicationFeeAmount,
          transfer_data: {
            destination: connectedAccountId
          },
          metadata: metadata
        };
        
        console.log('✅ Mock payment intent created:', mockPaymentIntent);
        return mockPaymentIntent;
      }

      // Production API call (when you have a backend)
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          connectedAccountId,
          applicationFeeAmount,
          metadata
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId } = await response.json();
      return { id: paymentIntentId, clientSecret };
      
    } catch (error) {
      console.error('❌ Error creating payment intent:', error);
      throw error;
    }
  }

  async processPaymentWithElements(clientSecret, connectedAccountId) {
    try {
      // For demo mode, just return a mock payment result
      if (import.meta.env.DEV || !this.stripe) {
        console.log('🎭 Demo mode - simulating payment confirmation');
        return await this.processDemoPayment(clientSecret, connectedAccountId);
      }

      if (!this.elements) {
        throw new Error('Stripe Elements not initialized');
      }

      // Confirm the payment with the connected account
      const { error, paymentIntent } = await this.stripe.confirmPayment({
        elements: this.elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/booking-confirmation`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      return paymentIntent;
    } catch (error) {
      console.error('❌ Payment confirmation error:', error);
      throw error;
    }
  }

  // Demo mode fallback for testing
  async processDemoPayment(amountOrClientSecret, connectedAccountId) {
    console.log('🎭 Processing demo payment:', { amountOrClientSecret, connectedAccountId });
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // If amountOrClientSecret is a number, treat it as amount in cents
    // If it's a string, treat it as a client secret and extract amount from it
    let amount = amountOrClientSecret;
    if (typeof amountOrClientSecret === 'string' && amountOrClientSecret.includes('pi_mock_')) {
      // Extract amount from mock client secret or use a default
      amount = 1000; // Default demo amount in cents ($10.00)
    }
    
    return {
      id: `pi_demo_${Date.now()}`,
      status: 'succeeded',
      amount: amount,
      connectedAccountId: connectedAccountId,
      applicationFeeAmount: Math.round(amount * 0.10),
    };
  }

  // Get Stripe instance
  async getStripe() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.stripe;
  }

  // Get payment method details (for stored payment methods)
  async getPaymentMethod(paymentMethodId) {
    try {
      const stripe = await this.getStripe();
      if (!stripe) {
        console.log('💳 Stripe not loaded, returning mock payment method');
        return {
          success: true,
          paymentMethod: {
            id: paymentMethodId,
            card: { last4: '4242', brand: 'visa' }
          }
        };
      }

      const { paymentMethod, error } = await stripe.retrievePaymentMethod(paymentMethodId);
      
      if (error) {
        console.error('❌ Error retrieving payment method:', error);
        return { success: false, error: error.message };
      }

      return { success: true, paymentMethod };
    } catch (error) {
      console.error('❌ Error in getPaymentMethod:', error);
      return { success: false, error: error.message };
    }
  }

  // Create a payment method from card details
  async createPaymentMethod(cardElement) {
    try {
      const stripe = await this.getStripe();
      if (!stripe) {
        console.log('💳 Stripe not loaded, simulating payment method creation');
        return {
          success: true,
          paymentMethod: {
            id: `pm_${Date.now()}`,
            card: { last4: '4242', brand: 'visa' }
          }
        };
      }

      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        console.error('❌ Error creating payment method:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Payment method created:', paymentMethod);
      return { success: true, paymentMethod };
    } catch (error) {
      console.error('❌ Error in createPaymentMethod:', error);
      return { success: false, error: error.message };
    }
  }

  // Stripe Connect methods for boat owners
  async createConnectAccount(boatData, ownerData) {
    try {
      console.log('🔗 Creating Stripe Connect account for boat:', boatData.name);
      
      // For development, create a mock connected account
      if (import.meta.env.DEV) {
        console.log('🔄 Development mode - creating mock connected account');
        
        const mockAccountId = `acct_connect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Simulate Stripe API response
        const mockAccount = {
          id: mockAccountId,
          object: 'account',
          business_type: 'individual',
          capabilities: {
            card_payments: { requested: true, status: 'active' },
            transfers: { requested: true, status: 'active' }
          },
          charges_enabled: true,
          country: 'US',
          default_currency: 'usd',
          details_submitted: false,
          email: ownerData.email,
          payouts_enabled: false,
          requirements: {
            currently_due: ['individual.verification.document'],
            eventually_due: ['individual.verification.document'],
            past_due: []
          },
          settings: {
            payouts: {
              schedule: {
                delay_days: 7,
                interval: 'daily'
              }
            }
          },
          type: 'express'
        };
        
        console.log('✅ Mock connected account created:', mockAccount);
        return { success: true, account: mockAccount };
      }

      // Production API call to your backend
      const response = await fetch('/api/create-connect-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boatId: boatData.id,
          boatName: boatData.name,
          ownerEmail: ownerData.email,
          ownerName: ownerData.display_name || ownerData.email,
          businessType: 'individual',
          country: 'US'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create connected account');
      }

      const accountData = await response.json();
      return { success: true, account: accountData.account };
      
    } catch (error) {
      console.error('❌ Error creating Connect account:', error);
      return { success: false, error: error.message };
    }
  }

  async createAccountLink(accountId, refreshUrl, returnUrl) {
    try {
      console.log('🔗 Creating account link for account:', accountId);
      
      // For development, create a mock account link
      if (import.meta.env.DEV) {
        console.log('🔄 Development mode - creating mock account link');
        
        const mockLink = `https://dashboard.stripe.com/express/onboarding/${accountId}?mock=true`;
        
        console.log('✅ Mock account link created:', mockLink);
        return { success: true, url: mockLink };
      }

      // Production API call to your backend
      const response = await fetch('/api/create-account-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId,
          refreshUrl,
          returnUrl,
          type: 'account_onboarding'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create account link');
      }

      const linkData = await response.json();
      return { success: true, url: linkData.url };
      
    } catch (error) {
      console.error('❌ Error creating account link:', error);
      return { success: false, error: error.message };
    }
  }

  async getConnectAccount(accountId) {
    try {
      console.log('🔗 Retrieving Connect account:', accountId);
      
      // For development, return mock account data
      if (import.meta.env.DEV) {
        console.log('🔄 Development mode - returning mock account data');
        
        const mockAccount = {
          id: accountId,
        object: 'account',
          business_type: 'individual',
          capabilities: {
            card_payments: { requested: true, status: 'active' },
            transfers: { requested: true, status: 'active' }
          },
          charges_enabled: true,
          country: 'US',
          default_currency: 'usd',
          details_submitted: true,
          email: 'owner@example.com',
          payouts_enabled: true,
          requirements: {
            currently_due: [],
            eventually_due: [],
            past_due: []
          },
          settings: {
            payouts: {
              schedule: {
                delay_days: 7,
                interval: 'daily'
              }
            }
          },
          type: 'express'
        };
        
        console.log('✅ Mock account data retrieved:', mockAccount);
        return { success: true, account: mockAccount };
      }

      // Production API call to your backend
      const response = await fetch(`/api/get-connect-account?accountId=${accountId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to retrieve connected account');
      }

      const accountData = await response.json();
      return { success: true, account: accountData.account };
      
    } catch (error) {
      console.error('❌ Error retrieving Connect account:', error);
      return { success: false, error: error.message };
    }
  }
}

export default StripeService; 