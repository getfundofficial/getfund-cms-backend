# Request to Xcel for Full API Integration

Dear Xcel Support Team,

We are integrating your payment gateway for **GETFund** (https://getfund-website.vercel.app) and need full API access to customize the payment experience for our donors.

## Current Setup
- **Payment Link ID**: j6ulbdt0c
- **Public Key**: XXCLPUBK_LIVE-2f4a27553228e75852a2dd5729d182eaf538121f
- **Webhook Secret**: Configured

## Requirements for Full API Integration

We need the following to implement a custom payment flow that removes the "What are you paying for?" dropdown:

### 1. API Credentials
- [ ] **Full API Merchant ID** (different from the payment link ID)
  - Current ID `j6ulbdt0c` appears to be a payment link code
  - We need the actual Merchant ID for API authentication
- [ ] **API Secret Key** (if different from Public Key)
- [ ] Confirm the Public Key we have is correct for API calls

### 2. API Endpoints
Please confirm or provide the correct endpoints for:
- [ ] **Payment Initialization**: Currently using `/transactions-service/paygate/generate-payment-link`
- [ ] **Transaction Verification**: Currently using `/transactions-service/paygate/tsq/{reference}`
- [ ] **Base URL**: Currently using `https://api.xcelapp.com`

### 3. Payment Customization
- [ ] How to pre-fill or hide the "What are you paying for?" dropdown
- [ ] Can we set a default payment category (e.g., "Donation") via API?
- [ ] Parameters to customize the payment page appearance

### 4. Webhook Configuration
- [ ] Webhook URL to configure in dashboard: `https://getfund-cms-backend.vercel.app/api/payments/webhook`
- [ ] Webhook events we should listen for:
  - `payment.success`
  - `payment.failed`
  - `payment.pending`
- [ ] Webhook signature verification method

### 5. Integration Details

**Current Flow Issue:**
When using the payment link `https://paygate.xcelapp.com/pay/j6ulbdt0c`, users see a form asking "What are you paying for?" with a dropdown. We want to:
1. Remove this dropdown (all payments are donations)
2. Or pre-fill it with "Donation" as the default value
3. Provide a seamless payment experience without extra form fields

**Desired Flow:**
1. User clicks "Donate" on our website
2. User enters amount and email on our website
3. User is redirected to Xcel payment page with:
   - Amount already set
   - Email already set
   - Purpose already set to "Donation"
   - **No additional form fields to fill**
4. User completes payment via Mobile Money/Card
5. User is redirected back to our website with payment confirmation

## Technical Stack
- **Backend**: Next.js API Routes (Node.js)
- **Hosting**: Vercel (Serverless)
- **Website**: https://getfund-website.vercel.app
- **API Backend**: https://getfund-cms-backend.vercel.app

## Questions
1. Is `j6ulbdt0c` a payment link ID or an API Merchant ID?
2. If it's only a payment link ID, what is our API Merchant ID?
3. What parameters can we pass to customize the payment page?
4. Can we use the API to generate payment pages without the "What are you paying for?" field?
5. Is there a sandbox/test environment for testing the API integration?

## Expected Response Time
Please provide this information as soon as possible so we can complete our integration and start accepting donations.

## Contact Information
- **Organization**: GETFund
- **Website**: https://getfund-website.vercel.app
- **Technical Contact**: [Your Name]
- **Email**: [Your Email]

Thank you for your support!

---

**Attachments:**
- Screenshot showing the "What are you paying for?" dropdown we want to remove/pre-fill
- Current payment flow documentation
