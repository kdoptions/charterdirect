# 🚀 Stripe Backend Setup Guide

## Overview
This guide explains how to set up the Stripe backend for your Harbour Lux boat rental platform. The backend handles payment processing, Connect accounts, and webhooks.

## 🏗️ Architecture

### Backend Structure (Vercel Serverless)
```
/api/
├── create-payment-intent.js     # Create Stripe PaymentIntent
├── confirm-payment.js           # Confirm payment success
├── create-connect-account.js    # Create Stripe Connect account
├── webhook.js                   # Stripe webhook handler
└── get-payment-status.js        # Check payment status
```

### Payment Flow
```
Customer → Books → Pays Deposit (with platform fee) → Owner Approves → Calendar Event → Final Payment
```

## 🔧 Setup Steps

### 1. Install Dependencies
```bash
npm install stripe
```

### 2. Environment Variables
Create a `.env.local` file in your project root:

```env
# Stripe Keys (Get these from your Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_... # Test key for development
STRIPE_PUBLISHABLE_KEY=pk_test_... # Test key for development
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook secret

# Frontend URL (for Connect account links)
FRONTEND_URL=http://localhost:5174 # Development
# FRONTEND_URL=https://yourdomain.com # Production
```

### 3. Stripe Dashboard Setup

#### 3.1 Get API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to Developers → API Keys
3. Copy your publishable and secret keys

#### 3.2 Enable Connect
1. Go to Connect → Settings
2. Enable Connect for your account
3. Configure your business profile

#### 3.3 Set Up Webhooks
1. Go to Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `account.updated`
   - `transfer.created`
4. Copy the webhook secret

### 4. Deploy to Vercel

#### 4.1 Push to GitHub
```bash
git add .
git commit -m "feat: add Stripe backend API functions"
git push origin main
```

#### 4.2 Deploy on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Import your GitHub repository
3. Set environment variables in Vercel:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `FRONTEND_URL`

## 💳 How It Works

### Deposit Payment Flow
1. **Customer books boat** → Sets deposit amount (configurable %)
2. **Frontend calls** `/api/create-payment-intent`
3. **Backend creates** PaymentIntent with:
   - Customer amount (deposit)
   - Application fee (10% of total booking)
   - Transfer to boat owner's Connect account
4. **Frontend confirms** payment with Stripe Elements
5. **Webhook receives** payment success/failure
6. **Backend updates** booking status

### Platform Fee Structure
- **Total Booking**: $1000
- **Deposit Required**: 30% ($300)
- **Platform Fee**: 10% of total ($100)
- **Customer Pays**: $300 (deposit)
- **Boat Owner Receives**: $200 ($300 - $100 platform fee)
- **Platform Keeps**: $100

## 🔒 Security Features

- **Webhook Signature Verification** - Prevents fake webhooks
- **Server-Side Payment Creation** - Never expose secret keys
- **Application Fee Calculation** - Backend handles fee math
- **Metadata Validation** - Track payments with booking IDs

## 🧪 Testing

### Test Cards
Use these Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

### Test Mode
- Use test API keys for development
- Test webhooks with Stripe CLI
- Monitor events in Stripe Dashboard

## 🚨 Common Issues

### 1. Webhook Failures
- Check webhook secret in environment variables
- Verify webhook endpoint URL
- Check Stripe Dashboard for failed deliveries

### 2. Payment Intent Creation Fails
- Verify `STRIPE_SECRET_KEY` is set
- Check `connectedAccountId` is valid
- Ensure amounts are positive numbers

### 3. Connect Account Issues
- Verify account is properly onboarded
- Check account capabilities are enabled
- Ensure business verification is complete

## 📱 Frontend Integration

### Update Booking.jsx
The frontend now calls the backend API instead of simulating payments:

```javascript
// Old (demo mode)
console.log("✅ Deposit payment processed successfully (demo mode)");

// New (real Stripe)
const paymentIntent = await stripeService.createPaymentIntent({
  amount: depositAmount,
  connectedAccountId: boat.owner_stripe_account_id,
  applicationFeeAmount: platformFee,
  metadata: { boatId: boat.id, bookingId: newBooking.id }
});
```

### Environment Variables
Frontend needs:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 🔄 Next Steps

1. **Test the backend** with Stripe test mode
2. **Set up Connect accounts** for boat owners
3. **Configure webhooks** in production
4. **Monitor payments** in Stripe Dashboard
5. **Implement final payment** collection
6. **Add payment analytics** and reporting

## 📚 Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Connect Guide](https://stripe.com/docs/connect)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)

## 🆘 Support

If you encounter issues:
1. Check Stripe Dashboard for error logs
2. Verify environment variables are set
3. Test with Stripe CLI locally
4. Check Vercel function logs
5. Review webhook delivery attempts 