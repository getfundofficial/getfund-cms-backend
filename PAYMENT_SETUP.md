# Payment System Setup Guide

## Current Status

✅ **CORS Issue Fixed** - Frontend can now communicate with backend API
✅ **Error Handling Improved** - Better error messages for debugging
✅ **Test Mode Implemented** - Can test donation flow without real payment gateway

## Test Mode (CURRENTLY ACTIVE)

The payment system is running in **TEST MODE** to allow testing the full donation flow while Xcel API credentials are being configured.

### How Test Mode Works

1. User fills out donation form and clicks "Continue"
2. Backend simulates a successful payment without calling Xcel API
3. User is redirected to a test success page showing:
   - ⚠️ Clear indication this is a TEST transaction
   - Payment reference number
   - Donation amount
   - Message about configuring real credentials

### Enable Test Mode in Vercel

Go to: https://vercel.com/thehansguy-projects/getfund-cms-backend/settings/environment-variables

Add this environment variable:
```
PAYMENT_TEST_MODE=true
```

Click **Save** and redeploy the backend.

---

## Production Mode (Real Payments)

Once you have valid Xcel API credentials, follow these steps:

### 1. Get Xcel API Credentials

Contact Xcel Payment Gateway to obtain:
- ✅ Production API Key (XCEL_PUBLIC_KEY)
- ✅ Webhook Secret (XCEL_WEBHOOK_SECRET)
- ✅ API Documentation
- ✅ Test/Sandbox credentials for testing

### 2. Configure Vercel Environment Variables

Go to: https://vercel.com/thehansguy-projects/getfund-cms-backend/settings/environment-variables

Set these variables:

```env
# Required for Production Payments
XCEL_PUBLIC_KEY=your-actual-xcel-public-key-here
XCEL_WEBHOOK_SECRET=your-actual-xcel-webhook-secret-here
NEXT_PUBLIC_WEBSITE_URL=https://getfund-website.vercel.app

# Set to 'false' or remove to use real Xcel API
PAYMENT_TEST_MODE=false
```

### 3. Test in Sandbox First

Before going live:
1. Get Xcel sandbox/test credentials
2. Set `XCEL_PUBLIC_KEY` to the test key
3. Test all payment methods:
   - Mobile Money (MTN, Vodafone, AirtelTigo)
   - Credit/Debit Cards
   - Bank Transfer
4. Verify webhooks are received correctly
5. Test error scenarios (failed payments, cancellations)

### 4. Configure Xcel Dashboard Webhook

**IMPORTANT:** Log into your Xcel dashboard and configure these URLs:

1. **Webhook URL** (required for payment notifications):
   ```
   https://getfund-cms-backend.vercel.app/api/payments/webhook
   ```

2. **Callback URL** (optional - for redirect after payment):
   ```
   https://getfund-website.vercel.app/payment/callback
   ```

Without the webhook URL configured, Xcel cannot notify your backend about payment status changes.

### 5. Go Live

Once testing is complete:
1. Replace test credentials with production credentials
2. Configure webhook URL in Xcel dashboard (see step 4 above)
3. Set `PAYMENT_TEST_MODE=false` (or remove the variable)
4. Redeploy both frontend and backend
5. Test with small real transaction
6. Monitor Vercel logs for any issues

---

## Troubleshooting

### "Payment initialization failed" Error

**Possible Causes:**
1. **Test Mode Disabled but No Valid Credentials**
   - Solution: Enable test mode OR add valid Xcel credentials

2. **Invalid Xcel API Credentials**
   - Check credentials are correct
   - Verify credentials are for the right environment (test vs production)
   - Contact Xcel support to verify account status

3. **Xcel API is Down**
   - Check Xcel API status page
   - Contact Xcel support

### CORS Errors

✅ Already fixed! CORS headers are properly configured for:
- All Vercel deployment URLs (*.vercel.app)
- Production domains (getfund.gov.gh)
- Local development (localhost:5173, etc.)

### View Backend Logs

1. Go to: https://vercel.com/thehansguy-projects/getfund-cms-backend
2. Click on the latest deployment
3. Click "Functions" tab
4. Click on any function to see logs
5. Look for payment-related errors

### Test the API Directly

Use this curl command to test the payment endpoint:

```bash
curl -X POST https://getfund-cms-backend.vercel.app/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "currency": "GHS",
    "paymentMethod": "mobile-money",
    "customerEmail": "test@example.com",
    "reference": "TEST-123456",
    "description": "Test donation"
  }'
```

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `XCEL_PUBLIC_KEY` | Yes* | Xcel API public key | `XCLPUBK_LIVE-xxx` |
| `XCEL_WEBHOOK_SECRET` | Yes* | Xcel webhook secret for verification | `JKqkIWDi4sgRvh5bmSe2ctK9DVKiLM3t` |
| `NEXT_PUBLIC_WEBSITE_URL` | Yes | Frontend website URL for redirects | `https://getfund-website.vercel.app` |
| `PAYMENT_TEST_MODE` | No | Enable test mode (true/false) | `true` |

\* Required only when `PAYMENT_TEST_MODE=false` or not set

---

## Payment Flow Diagram

### Test Mode Flow
```
User clicks "Donate"
    ↓
Fill donation form
    ↓
Click "Continue"
    ↓
Frontend → Backend API
    ↓
Backend checks: PAYMENT_TEST_MODE=true
    ↓
Return mock success + test URL
    ↓
User redirected to /payment/test-success
    ↓
Shows "Test Mode" success message
    ↓
Auto-redirect to homepage after 5 seconds
```

### Production Mode Flow
```
User clicks "Donate"
    ↓
Fill donation form
    ↓
Click "Continue"
    ↓
Frontend → Backend API
    ↓
Backend calls Xcel API
    ↓
Xcel returns payment URL
    ↓
User redirected to Xcel payment page
    ↓
User completes payment on Xcel
    ↓
Xcel sends webhook to backend
    ↓
User redirected back to website
    ↓
Shows success/failure message
```

---

## Next Steps

### Immediate (Test Mode Active)
- ✅ Test donation form UI/UX
- ✅ Test validation and error messages
- ✅ Test email collection
- ✅ Test payment method selection
- ✅ Test redirect flow

### To Enable Real Payments
1. ⏳ Contact Xcel to get API credentials
2. ⏳ Configure Xcel dashboard (webhook URL, callback URL)
3. ⏳ Test in Xcel sandbox environment
4. ⏳ Update Vercel environment variables
5. ⏳ Disable test mode
6. ⏳ Deploy and test with real transaction
7. ⏳ Monitor transactions and logs

---

## Support

### Xcel Payment Gateway
- Website: https://xcelapp.com (or their actual URL)
- Support: Contact Xcel for technical support

### Development Team
- Backend API: https://getfund-cms-backend.vercel.app
- Frontend: https://getfund-website.vercel.app
- GitHub: https://github.com/thehansguy

---

**Last Updated:** December 5, 2025
**Status:** Test Mode Active - Awaiting Xcel API Credentials
**Version:** 1.0.1
