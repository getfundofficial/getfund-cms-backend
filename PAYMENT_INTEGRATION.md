# Xcel Payment Gateway Integration

This document explains how to set up and use the Xcel payment gateway integration for processing donations on the GetFund website.

## Overview

The payment integration allows users to donate via multiple payment methods:
- Mobile Money (MTN, Vodafone, AirtelTigo)
- Credit/Debit Cards
- Bank Transfer
- PayPal

## Architecture

### Frontend (React)
- **DonationModal Component**: Collects donation amount, email, phone, and payment method
- **PaymentService**: Handles API communication with backend
- **PaymentCallback Page**: Verifies and displays payment results

### Backend (Next.js API Routes)
- **`/api/payments` POST**: Initialize payment transaction
- **`/api/payments` GET**: Verify payment status
- **`/api/payments/webhook` POST**: Receive payment notifications from Xcel

## Setup Instructions

### 1. Get Xcel API Credentials

1. Visit [Xcel Documentation](https://docs.xcelapp.com/)
2. Sign up for an account
3. Navigate to API Settings
4. Copy your API Key and Secret Key

### 2. Configure Environment Variables

Add the following to your backend `.env` file:

```env
XCEL_API_KEY=your-xcel-api-key
XCEL_SECRET_KEY=your-xcel-secret-key
NEXT_PUBLIC_WEBSITE_URL=https://getfund-website.vercel.app
```

### 3. Deploy Backend Changes

The backend API endpoints are deployed at:
- Production: `https://getfund-cms-backend.vercel.app/api/payments`

Deploy your changes:
```bash
cd getfund-cms/backend
git add .
git commit -m "Add Xcel payment integration"
git push
```

### 4. Configure Webhook URL

In your Xcel dashboard, set the webhook URL to:
```
https://getfund-cms-backend.vercel.app/api/payments/webhook
```

This allows Xcel to notify your backend when payments are completed.

## Usage

### Making a Donation

1. User clicks "Donate" button on any fundraising page
2. Modal opens with donation form
3. User enters:
   - Amount (can select quick amounts or enter custom)
   - Email address (required)
   - Phone number (optional)
   - Name (optional)
   - Payment method (required)
4. User clicks "Donate" button
5. System validates inputs and initiates payment
6. User is redirected to Xcel payment page
7. User completes payment on Xcel
8. User is redirected back to `/payment/callback`
9. Payment is verified and success/failure message shown

### Payment Flow Diagram

```
User → DonationModal → PaymentService → Backend API → Xcel Gateway
                                                           ↓
User ← PaymentCallback ← Backend API ← Webhook ← Xcel Gateway
```

## API Endpoints

### Initialize Payment

**POST** `/api/payments`

Request:
```json
{
  "amount": 100,
  "currency": "GHS",
  "paymentMethod": "mobile-money",
  "customerEmail": "donor@example.com",
  "customerPhone": "+233123456789",
  "reference": "GETFUND-1234567890-123456",
  "description": "Donation for Classroom Construction",
  "metadata": {
    "campaignTitle": "Classroom Construction",
    "donorName": "John Doe"
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://checkout.xcelapp.com/pay/abc123",
    "reference": "GETFUND-1234567890-123456",
    "accessCode": "abc123"
  }
}
```

### Verify Payment

**GET** `/api/payments?reference=GETFUND-1234567890-123456`

Response:
```json
{
  "success": true,
  "data": {
    "status": "success",
    "amount": 100,
    "currency": "GHS",
    "reference": "GETFUND-1234567890-123456",
    "paidAt": "2025-12-03T10:30:00Z"
  }
}
```

## Testing

### Test Mode

Xcel provides test API keys for development. Use these to test without real transactions:

```env
XCEL_API_KEY=test_your_api_key
XCEL_SECRET_KEY=test_your_secret_key
```

### Test Cards

Refer to [Xcel Test Cards Documentation](https://docs.xcelapp.com/#/testing) for test card numbers.

### Test Mobile Money

Test mobile money numbers are typically provided in the Xcel sandbox environment.

## Security

### Best Practices

1. **Never expose API keys in frontend code** - All API calls go through backend
2. **Validate webhook signatures** - Verify requests from Xcel are authentic
3. **Use HTTPS** - All payment requests must use secure connections
4. **Validate amounts** - Check minimum/maximum donation limits
5. **Log transactions** - Keep audit trail of all payment attempts
6. **Handle errors gracefully** - Show user-friendly error messages

### PCI Compliance

- Payment card data is never stored on your servers
- Xcel handles all sensitive payment information
- Your application only stores payment references and status

## Troubleshooting

### Payment Initialization Fails

**Error**: "Payment gateway not configured"
- Check that `XCEL_API_KEY` and `XCEL_SECRET_KEY` are set in backend `.env`
- Verify environment variables are deployed to Vercel

**Error**: "Invalid API credentials"
- Confirm API keys are correct
- Check if using test keys in production or vice versa

### Payment Verification Fails

**Error**: "Payment reference not found"
- Reference may be invalid or expired
- Check Xcel dashboard for transaction status

### Webhook Not Receiving Events

1. Verify webhook URL is correctly configured in Xcel dashboard
2. Check webhook URL is publicly accessible (not localhost)
3. Review backend logs for webhook requests
4. Test webhook endpoint manually using tools like Postman

## Future Enhancements

- [ ] Store donation records in database
- [ ] Send email receipts to donors
- [ ] Generate PDF receipts
- [ ] Add donation analytics dashboard
- [ ] Support recurring donations
- [ ] Add donor authentication/profiles
- [ ] Implement refund processing
- [ ] Add support for multiple currencies

## Support

For Xcel-specific issues:
- Documentation: https://docs.xcelapp.com/
- Support: support@xcelapp.com

For GetFund integration issues:
- Contact the development team

## License

This integration is part of the GetFund website project.
