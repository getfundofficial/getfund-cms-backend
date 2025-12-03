# Xcel Payment Gateway - Integration Request

**Organization**: GetFund  
**Website**: https://getfund-website.vercel.app  
**Purpose**: Process donations via Mobile Money, Cards, and other payment methods

---

## What We Need to Get Started

### 1. API Credentials

**Production Environment:**
- [ ] API Key
- [ ] Secret Key

**Test/Sandbox Environment:**
- [ ] Test API Key
- [ ] Test Secret Key

### 2. API Documentation

- [ ] **API Base URLs**
  - Production: `https://api.xcelapp.com` (or your actual URL)
  - Sandbox: `https://sandbox-api.xcelapp.com` (or your actual URL)

- [ ] **Core Endpoints Documentation**
  - Initialize Payment endpoint
  - Verify Payment endpoint
  - Webhook/Callback endpoint

- [ ] **Code Examples**
  - Node.js/JavaScript integration examples
  - Request/Response payload samples

### 3. Webhook Configuration

- [ ] Webhook URL to configure in dashboard:
  ```
  https://getfund-cms-backend.vercel.app/api/payments/webhook
  ```

- [ ] List of webhook events (e.g., `payment.success`, `payment.failed`)
- [ ] How to verify webhook signatures/authenticity

### 4. Testing Information

- [ ] Test card numbers (for successful/failed payments)
- [ ] Test mobile money numbers (MTN, Vodafone, AirtelTigo)
- [ ] How to access test dashboard

### 5. Payment Methods

- [ ] Supported payment methods:
  - [ ] Mobile Money (MTN, Vodafone, AirtelTigo)
  - [ ] Credit/Debit Cards
  - [ ] Bank Transfer
  - [ ] Other methods

- [ ] Transaction limits (min/max amounts)
- [ ] Supported currencies (GHS, USD, etc.)

### 6. Business Information

- [ ] Transaction fees structure
- [ ] Settlement schedule (when funds are paid out)
- [ ] Required business verification documents

### 7. Support Contact

- [ ] Technical support email
- [ ] Support phone number (if available)
- [ ] Developer portal/dashboard access

---

## Our Technical Setup

**Frontend**: React + TypeScript  
**Backend**: Next.js API (Node.js)  
**Hosting**: Vercel

**Expected Use Case**: Processing donations ranging from GHS 50 to GHS 50,000

---

## Next Steps

Once we receive:
1. ✅ API credentials (sandbox & production)
2. ✅ Documentation links
3. ✅ Test payment methods
4. ✅ Webhook configuration details

We can:
1. Complete the integration
2. Test in sandbox environment
3. Submit for production approval
4. Go live

---

**Contact Information**  
Name: [Your Name]  
Email: [Your Email]  
Phone: [Your Phone]

Thank you for supporting GetFund's mission! 🇬🇭
