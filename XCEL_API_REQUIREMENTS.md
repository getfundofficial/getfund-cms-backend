# Xcel Payment Gateway - Integration Requirements

**Project**: GetFund Website Donation System  
**Date**: December 3, 2025  
**Purpose**: Process donations via multiple payment methods (Mobile Money, Cards, Bank Transfer, PayPal)

---

## Executive Summary

We are integrating the Xcel payment gateway to process donations on the GetFund website. We require API credentials, documentation, and technical support to complete the integration successfully.

---

## 1. API Credentials Required

### Production Environment
- [ ] **API Key** (Public Key)
- [ ] **Secret Key** (Private Key)
- [ ] **Merchant ID** (if applicable)
- [ ] **Account/Business ID**

### Test/Sandbox Environment
- [ ] **Test API Key**
- [ ] **Test Secret Key**
- [ ] **Test Merchant ID** (if applicable)

### Access Requirements
- [ ] Dashboard access credentials
- [ ] Webhook configuration access
- [ ] Transaction history/reporting access
- [ ] Settlement account details

---

## 2. API Documentation Needed

### Core Documentation
- [ ] **API Reference Guide** - Complete endpoint documentation
- [ ] **Authentication Guide** - How to authenticate API requests
- [ ] **Payment Flow Diagram** - Visual representation of payment process
- [ ] **Webhook Documentation** - Event types and payload structures
- [ ] **Error Code Reference** - Complete list of error codes and meanings

### Integration Guides
- [ ] **Quick Start Guide** - Basic integration steps
- [ ] **Best Practices Guide** - Security and optimization recommendations
- [ ] **Testing Guide** - How to test in sandbox environment
- [ ] **Go-Live Checklist** - Requirements before production deployment

### Code Examples
- [ ] **Node.js/JavaScript Examples** - Sample integration code
- [ ] **API Request/Response Examples** - Real payload examples
- [ ] **Webhook Handler Examples** - How to process callbacks
- [ ] **Error Handling Examples** - How to handle failures

---

## 3. Payment Methods Configuration

### Mobile Money
- [ ] **Supported Networks**:
  - [ ] MTN Mobile Money
  - [ ] Vodafone Cash
  - [ ] AirtelTigo Money
- [ ] **Transaction Limits** (min/max amounts per network)
- [ ] **Processing Times** (estimated completion time)
- [ ] **Network-specific Requirements** (if any)

### Credit/Debit Cards
- [ ] **Supported Card Types**:
  - [ ] Visa
  - [ ] Mastercard
  - [ ] American Express
  - [ ] Discover
  - [ ] Local cards (GhanaCard, etc.)
- [ ] **3D Secure Support** - Authentication requirements
- [ ] **PCI Compliance Documentation**
- [ ] **Card Testing Numbers** (for sandbox)

### Bank Transfer
- [ ] **Supported Banks** - List of integrated banks
- [ ] **Transfer Methods** (Direct Debit, Bank Account, etc.)
- [ ] **Verification Process** - How transfers are verified
- [ ] **Settlement Timeline** - When funds are available

### PayPal
- [ ] **Integration Type** (Direct, Express Checkout, etc.)
- [ ] **Configuration Requirements**
- [ ] **Transaction Fees Structure**

---

## 4. Technical Specifications

### API Endpoints
Please provide the base URLs for:
- [ ] **Production API Base URL** (e.g., `https://api.xcelapp.com`)
- [ ] **Sandbox API Base URL** (e.g., `https://sandbox-api.xcelapp.com`)
- [ ] **Checkout/Payment Page URL** (where users complete payment)

### Required Endpoints
Confirm availability and documentation for:
- [ ] **Initialize Payment** - `POST /v1/payments/initialize`
- [ ] **Verify Payment** - `GET /v1/payments/verify/{reference}`
- [ ] **Get Transaction Status** - `GET /v1/transactions/{id}`
- [ ] **List Transactions** - `GET /v1/transactions`
- [ ] **Refund Payment** - `POST /v1/payments/refund` (if supported)
- [ ] **Get Payment Methods** - `GET /v1/payment-methods`

### Webhook Configuration
- [ ] **Webhook Events List**:
  - [ ] `payment.success`
  - [ ] `payment.failed`
  - [ ] `payment.pending`
  - [ ] `payment.refunded`
  - [ ] `payment.cancelled`
- [ ] **Webhook Signature Verification** - How to verify webhook authenticity
- [ ] **Webhook Retry Policy** - How many times/how long Xcel retries failed webhooks
- [ ] **Webhook IP Whitelist** - IP addresses webhooks come from (for firewall rules)

### Security Requirements
- [ ] **Authentication Method**:
  - [ ] Bearer Token
  - [ ] API Key in Header
  - [ ] Basic Auth
  - [ ] Other
- [ ] **Signature/Hash Algorithm** (for webhook verification)
- [ ] **SSL/TLS Requirements** - Minimum TLS version
- [ ] **IP Whitelisting** - If required for API access
- [ ] **Rate Limiting** - Request limits per minute/hour

---

## 5. Transaction & Business Details

### Transaction Information
- [ ] **Minimum Transaction Amount** (in GHS)
- [ ] **Maximum Transaction Amount** (in GHS)
- [ ] **Daily Transaction Limits** (if any)
- [ ] **Supported Currencies**:
  - [ ] GHS (Ghanaian Cedi) - Primary
  - [ ] USD (US Dollar)
  - [ ] EUR (Euro)
  - [ ] GBP (British Pound)
  - [ ] Other currencies

### Fees & Charges
- [ ] **Transaction Fees Structure**:
  - [ ] Percentage per transaction
  - [ ] Fixed fee per transaction
  - [ ] Different rates by payment method
- [ ] **Settlement Fees** (if any)
- [ ] **Refund Fees** (if applicable)
- [ ] **Currency Conversion Fees** (if multi-currency)

### Settlement Details
- [ ] **Settlement Schedule** (Daily, Weekly, etc.)
- [ ] **Settlement Method** (Bank transfer, etc.)
- [ ] **Bank Account Setup Process**
- [ ] **Settlement Reporting** - How to access settlement reports
- [ ] **Payout Timeline** (T+1, T+2, etc.)

---

## 6. Compliance & Documentation

### Legal & Compliance
- [ ] **Terms of Service** - Full terms document
- [ ] **Privacy Policy** - How customer data is handled
- [ ] **PCI DSS Compliance Certificate** (for card payments)
- [ ] **Data Protection Documentation** (GDPR, etc.)
- [ ] **AML/KYC Requirements** - Know Your Customer documentation needed

### Business Requirements
- [ ] **Business Verification Documents** needed:
  - [ ] Business Registration Certificate
  - [ ] Tax Identification Number
  - [ ] Bank Account Verification
  - [ ] Director/Owner Identification
  - [ ] Other documents
- [ ] **Approval Timeline** - How long verification takes
- [ ] **Ongoing Requirements** - Periodic re-verification, etc.

---

## 7. Testing & Sandbox

### Sandbox Environment
- [ ] **Sandbox Account Setup** - How to create test account
- [ ] **Test API Credentials** - Separate from production
- [ ] **Test Cards/Numbers**:
  - [ ] Successful payment test card
  - [ ] Failed payment test card
  - [ ] 3D Secure test card
  - [ ] Insufficient funds test card
- [ ] **Test Mobile Money Numbers**:
  - [ ] MTN test number
  - [ ] Vodafone test number
  - [ ] AirtelTigo test number
- [ ] **Reset/Clear Test Data** - How to clean sandbox data

### Testing Scenarios
Please provide test cases for:
- [ ] Successful payment flow
- [ ] Failed payment flow
- [ ] Pending payment flow
- [ ] Cancelled payment flow
- [ ] Refund flow
- [ ] Webhook delivery
- [ ] Timeout scenarios
- [ ] Network error handling

---

## 8. Support & Monitoring

### Technical Support
- [ ] **Support Contact Details**:
  - [ ] Email: _______________
  - [ ] Phone: _______________
  - [ ] Support Portal: _______________
- [ ] **Support Hours** - Available time zones and hours
- [ ] **SLA (Service Level Agreement)** - Response times
- [ ] **Escalation Process** - For urgent issues
- [ ] **Dedicated Account Manager** (if available)

### Monitoring & Alerts
- [ ] **API Status Page** - Real-time API health status
- [ ] **Scheduled Maintenance Notifications** - How you notify customers
- [ ] **Incident Reporting** - How issues are communicated
- [ ] **Performance Metrics** - API uptime guarantees

### Developer Resources
- [ ] **Developer Portal Access**
- [ ] **API Changelog** - Track updates and changes
- [ ] **Community Forum** (if available)
- [ ] **SDK/Libraries**:
  - [ ] Node.js SDK
  - [ ] React/JavaScript SDK
  - [ ] Other languages
- [ ] **Postman Collection** - Pre-built API requests

---

## 9. Integration Timeline

### Milestones
Please confirm expected timeline for:
- [ ] **Account Setup & Approval** - ___ business days
- [ ] **API Access Provisioning** - ___ business days
- [ ] **Sandbox Testing Period** - ___ days recommended
- [ ] **Production Go-Live Approval** - ___ business days
- [ ] **Total Integration Timeline** - ___ weeks estimated

### Pre-Launch Requirements
- [ ] **Security Review** - Checklist or requirements
- [ ] **Integration Testing** - Required test scenarios
- [ ] **Documentation Review** - What needs approval
- [ ] **Go-Live Approval Process** - Steps to production access

---

## 10. Our Technical Setup

### Our Infrastructure
**Frontend**: React + Vite + TypeScript  
**Backend**: Next.js API Routes (Node.js)  
**Hosting**: Vercel (Serverless)  
**Database**: Neon PostgreSQL  

**Website URL**: https://getfund-website.vercel.app  
**API URL**: https://getfund-cms-backend.vercel.app/api  

### Our Requirements
- RESTful API integration (JSON)
- HTTPS/SSL for all communications
- Webhook support for async notifications
- Mobile-responsive payment pages
- Support for Ghanaian payment methods
- Multi-currency support (primarily GHS)

### Expected Transaction Volume
- **Monthly Donations**: 50-200 transactions
- **Average Transaction**: GHS 100 - GHS 50,000
- **Peak Periods**: Campaign launches, year-end giving

---

## 11. Additional Questions

### General Questions
1. Is there a one-time setup fee?
2. Are there any hidden charges or fees?
3. Can we use custom branding on the payment page?
4. Do you support recurring/subscription payments?
5. Can we customize the payment success/failure redirect URLs?
6. Is there a test mode we can use indefinitely for demos?
7. How long do you retain transaction data?
8. Can we export transaction data for accounting?
9. Do you provide dispute/chargeback management tools?
10. What analytics/reporting features are available?

### Technical Questions
1. What's the API request timeout duration?
2. Do you support idempotency keys to prevent duplicate payments?
3. Can we pass custom metadata with transactions?
4. Is there a rate limit on API requests?
5. How do you handle concurrent payment requests?
6. What happens if a webhook fails to deliver?
7. Can we manually retry failed webhooks?
8. Do you support batch/bulk operations?
9. Is there a staging environment separate from sandbox?
10. What logging/debugging tools do you provide?

---

## 12. Contact Information

**Organization**: GetFund  
**Project Name**: GetFund Website Donation System  
**Technical Contact**: [Your Name]  
**Email**: [Your Email]  
**Phone**: [Your Phone]  

**Preferred Communication**:
- [ ] Email
- [ ] Phone Call
- [ ] Video Conference
- [ ] In-Person Meeting

**Best Time to Reach**: _______________

**Integration Start Date**: December 3, 2025  
**Target Go-Live Date**: _______________

---

## 13. Next Steps

Once we receive the above information:

1. ✅ Set up sandbox environment and test credentials
2. ✅ Complete integration development
3. ✅ Test all payment methods and edge cases
4. ✅ Submit for production approval
5. ✅ Deploy to production
6. ✅ Monitor initial transactions
7. ✅ Scale based on usage

---

## Appendix: Current Integration Status

### Completed
✅ Frontend donation modal with form validation  
✅ Payment service layer for API communication  
✅ Backend API endpoints structure  
✅ Webhook handler structure  
✅ Payment verification flow  
✅ Error handling and user feedback  

### Pending Xcel Configuration
⏳ API credentials (production & sandbox)  
⏳ Webhook URL configuration  
⏳ Payment method enablement  
⏳ Testing and validation  
⏳ Production deployment  

---

**Please provide the information marked with [ ] checkboxes above to ensure successful integration.**

Thank you for supporting GetFund's mission to improve education in Ghana! 🇬🇭
