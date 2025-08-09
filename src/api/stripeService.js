import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with test publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

class StripeService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  }

  // Get Stripe instance
  async getStripe() {
    return await stripePromise;
  }

  // Create payment intent for a booking
  async createPaymentIntent(bookingData) {
    try {
      console.log('💳 Creating payment intent for booking:', bookingData.id);
      console.log('💰 Amount to charge:', bookingData.total_amount);
      
      // In a real app, this would call your backend API
      // For demo purposes, we'll simulate the payment intent creation
      const paymentIntent = {
        id: `pi_${Math.random().toString(36).substr(2, 16)}`,
        client_secret: `pi_${Math.random().toString(36).substr(2, 16)}_secret_${Math.random().toString(36).substr(2, 16)}`,
        amount: Math.round(bookingData.total_amount * 100), // Convert to cents
        currency: 'aud',
        status: 'requires_payment_method',
        created: Date.now(),
        metadata: {
          booking_id: bookingData.id,
          boat_id: bookingData.boat_id,
          customer_email: bookingData.customer_email,
          payment_type: 'deposit'
        }
      };

      console.log('✅ Payment intent created:', paymentIntent.id);
      return {
        success: true,
        paymentIntent: paymentIntent
      };
    } catch (error) {
      console.error('❌ Payment intent creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Process payment using Stripe Elements (for real implementation)
  async processPaymentWithElements(paymentIntent, paymentMethod) {
    try {
      console.log('💳 Processing payment with Stripe Elements...');
      
      const stripe = await this.getStripe();
      if (!stripe) {
        throw new Error('Stripe not loaded');
      }

      // Confirm the payment with Stripe
      const result = await stripe.confirmCardPayment(paymentIntent.client_secret, {
        payment_method: paymentMethod
      });

      if (result.error) {
        console.error('❌ Payment failed:', result.error);
        return {
          success: false,
          error: result.error.message
        };
      }

      if (result.paymentIntent.status === 'succeeded') {
        console.log('✅ Payment successful:', result.paymentIntent.id);
        return {
          success: true,
          paymentIntent: result.paymentIntent
        };
      }

      return {
        success: false,
        error: 'Payment was not successful'
      };
    } catch (error) {
      console.error('❌ Payment processing failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Process payment using Stripe Elements
  async processPayment(paymentIntent, paymentMethod) {
    try {
      console.log('💳 Processing payment for intent:', paymentIntent.id);
      
      const stripe = await this.getStripe();
      if (!stripe) {
        throw new Error('Stripe not loaded');
      }

      // Confirm the payment
      const result = await stripe.confirmCardPayment(paymentIntent.client_secret, {
        payment_method: paymentMethod
      });

      if (result.error) {
        console.error('❌ Payment failed:', result.error);
        return {
          success: false,
          error: result.error.message
        };
      }

      if (result.paymentIntent.status === 'succeeded') {
        console.log('✅ Payment successful:', result.paymentIntent.id);
        return {
          success: true,
          paymentIntent: result.paymentIntent
        };
      }

      return {
        success: false,
        error: 'Payment was not successful'
      };
    } catch (error) {
      console.error('❌ Payment processing failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create Stripe Connect account for boat owners
  async createConnectAccount(ownerData) {
    try {
      console.log('🔗 Creating Stripe Connect account for owner:', ownerData.id);
      
      // In a real app, this would call your backend API
      // For now, we'll simulate the account creation
      const connectAccount = {
        id: `acct_${Math.random().toString(36).substr(2, 16)}`,
        charges_enabled: true,
        payouts_enabled: true,
        details_submitted: true,
        email: ownerData.email || 'owner@example.com',
        country: 'AU',
        business_type: 'individual'
      };

      console.log('✅ Connect account created:', connectAccount.id);
      return {
        success: true,
        account: connectAccount
      };
    } catch (error) {
      console.error('❌ Connect account creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Transfer funds to boat owner (platform fee handling)
  async transferToOwner(paymentIntentId, amount, ownerAccountId) {
    try {
      console.log('💰 Transferring funds to owner:', ownerAccountId);
      
      // Calculate platform fee (10%)
      const platformFee = amount * 0.10;
      const ownerAmount = amount - platformFee;
      
      // In a real app, this would call your backend API
      // For now, we'll simulate the transfer
      const transfer = {
        id: `tr_${Math.random().toString(36).substr(2, 16)}`,
        amount: Math.round(ownerAmount * 100),
        currency: 'aud',
        destination: ownerAccountId,
        status: 'paid',
        created: Date.now()
      };

      console.log('✅ Transfer completed:', transfer.id);
      console.log('💰 Owner receives:', ownerAmount);
      console.log('💸 Platform fee:', platformFee);
      
      return {
        success: true,
        transfer: transfer,
        ownerAmount: ownerAmount,
        platformFee: platformFee
      };
    } catch (error) {
      console.error('❌ Transfer failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get payment status
  async getPaymentStatus(paymentIntentId) {
    try {
      // In a real app, this would call your backend API
      // For now, we'll simulate the status check
      return {
        success: true,
        status: 'succeeded',
        amount: 10000, // $100.00 in cents
        currency: 'aud'
      };
    } catch (error) {
      console.error('❌ Payment status check failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Refund payment
  async refundPayment(paymentIntentId, amount = null) {
    try {
      console.log('🔄 Processing refund for:', paymentIntentId);
      
      // In a real app, this would call your backend API
      // For now, we'll simulate the refund
      const refund = {
        id: `re_${Math.random().toString(36).substr(2, 16)}`,
        amount: amount || 10000, // Full refund if no amount specified
        currency: 'aud',
        status: 'succeeded',
        created: Date.now()
      };

      console.log('✅ Refund processed:', refund.id);
      return {
        success: true,
        refund: refund
      };
    } catch (error) {
      console.error('❌ Refund failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const stripeService = new StripeService(); 