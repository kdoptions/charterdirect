# Stripe Connect Backend Setup Guide

## Overview
This guide explains how to set up the backend APIs for Stripe Connect integration, allowing boat owners to receive payments through your platform.

## Prerequisites
- Stripe account (test mode recommended for development)
- Node.js backend server running
- Environment variables configured

## Environment Variables

Add these to your `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...  # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_...  # Webhook endpoint secret
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Your Stripe publishable key

# Optional Business Configuration
BUSINESS_URL=https://charterdirect.vercel.app
```

## API Endpoints Added

### 1. Create Connect Account
**POST** `/api/create-connect-account`

Creates a Stripe Connect account for boat owners.

**Request Body:**
```json
{
  "boatId": "boat_123",
  "boatName": "Sunset Cruiser",
  "ownerEmail": "owner@example.com",
  "ownerName": "John Doe",
  "businessType": "individual",
  "country": "US"
}
```

**Response:**
```json
{
  "success": true,
  "account": {
    "id": "acct_1234567890",
    "object": "account",
    "business_type": "individual",
    "capabilities": {...},
    "charges_enabled": false,
    "country": "US",
    "details_submitted": false,
    "email": "owner@example.com",
    "type": "express"
  }
}
```

### 2. Create Account Link
**POST** `/api/create-account-link`

Generates onboarding links for account setup.

**Request Body:**
```json
{
  "accountId": "acct_1234567890",
  "refreshUrl": "https://yourapp.com/owner-dashboard",
  "returnUrl": "https://yourapp.com/owner-dashboard?stripe_connected=true",
  "type": "account_onboarding"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://connect.stripe.com/setup/s/..."
}
```

### 3. Get Connect Account
**GET** `/api/get-connect-account?accountId=acct_1234567890`

Retrieves account information and status.

**Response:**
```json
{
  "success": true,
  "account": {
    "id": "acct_1234567890",
    "charges_enabled": true,
    "payouts_enabled": true,
    "details_submitted": true,
    "requirements": {...}
  }
}
```

## How It Works

### 1. Account Creation Flow
1. Owner clicks "Connect Stripe" button
2. Frontend calls `/api/create-connect-account`
3. Backend creates Stripe Connect account
4. Account ID is stored with the boat
5. Frontend receives account details

### 2. Onboarding Flow
1. Frontend calls `/api/create-account-link`
2. Backend generates Stripe onboarding link
3. User is redirected to Stripe onboarding
4. User completes business verification
5. User returns to your app via return URL

### 3. Account Status Monitoring
1. Frontend can check account status via `/api/get-connect-account`
2. Webhooks notify you of account updates
3. Monitor `charges_enabled` and `payouts_enabled` flags

## Testing

### Test Mode
- Use Stripe test keys (`sk_test_...`)
- Create test Connect accounts
- Test onboarding flow
- No real money involved

### Test Data
- Test email: `test@example.com`
- Test business: "Test Boat Charter"
- Test verification documents available in Stripe dashboard

## Production Deployment

### 1. Switch to Live Keys
- Replace test keys with live keys
- Update webhook endpoints
- Test with small amounts first

### 2. Webhook Configuration
- Set up webhook endpoint in Stripe dashboard
- Configure events: `account.updated`, `payment_intent.succeeded`
- Verify webhook signature

### 3. Compliance
- Ensure proper business verification
- Follow Stripe's terms of service
- Implement proper error handling

## Error Handling

### Common Errors
- **400**: Missing required fields
- **401**: Invalid Stripe key
- **403**: Insufficient permissions
- **500**: Server error

### Error Response Format
```json
{
  "error": "Error description",
  "details": "Detailed error message"
}
```

## Security Considerations

### 1. API Protection
- Validate all input data
- Implement rate limiting
- Use HTTPS in production
- Authenticate API requests

### 2. Stripe Security
- Never expose secret keys in frontend
- Verify webhook signatures
- Use test keys for development
- Monitor for suspicious activity

## Monitoring & Debugging

### 1. Logs
- All API calls are logged
- Check console for detailed information
- Monitor Stripe dashboard for account status

### 2. Stripe Dashboard
- View Connect accounts
- Monitor onboarding progress
- Check compliance requirements
- View payment activity

## Next Steps

1. **Test the flow** with test Stripe keys
2. **Verify webhooks** are working
3. **Test payment processing** through connected accounts
4. **Deploy to production** when ready
5. **Monitor account status** and compliance

## Support

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Stripe Support](https://support.stripe.com/)
- [Connect Onboarding Guide](https://stripe.com/docs/connect/express-dashboard)

## Troubleshooting

### Account Creation Fails
- Check Stripe secret key
- Verify account type permissions
- Check business information

### Onboarding Link Issues
- Verify return URLs are whitelisted
- Check account status
- Ensure proper permissions

### Webhook Failures
- Verify webhook secret
- Check endpoint URL
- Monitor webhook delivery
