# Xcel Payment Gateway - Deployment Checklist

## ✅ Completed
- [x] Backend API endpoints created
- [x] Frontend payment integration complete
- [x] Xcel credentials configured locally
- [x] Code committed and pushed to GitHub

## 📋 Next Steps

### 1. Add Environment Variables to Vercel (Backend)

Go to: https://vercel.com/dashboard → `getfund-cms-backend` → Settings → Environment Variables

Add these variables:

```env
XCEL_API_KEY=undefined
XCEL_PUBLIC_KEY=XCLPUBK_LIVE-555a9e52427af72b9e82758f27e0b4be0cb0fe80
XCEL_WEBHOOK_SECRET=JKqkIWDi4sgRvh5bmSe2ctK9DVKiLM3t
NEXT_PUBLIC_WEBSITE_URL=https://getfund-website.vercel.app
```

**Important**: Add them to **Production**, **Preview**, and **Development** environments.

### 2. Redeploy Backend

After adding environment variables:
- Vercel will automatically redeploy
- Or manually trigger: Deployments → Click latest → Redeploy

### 3. Configure Webhook URL in Xcel Dashboard

In your Xcel dashboard, set the webhook URL to:

```
https://getfund-cms-backend.vercel.app/api/payments/webhook
```

This allows Xcel to notify your backend when payments are completed.

### 4. Test the Integration

#### Test Payment Flow:
1. Go to: https://getfund-website.vercel.app/fundraising/ways-to-donate
2. Click any "Donate" button
3. Fill in the donation form:
   - Amount (use a small amount for testing)
   - Email address
   - Phone (optional)
   - Name (optional)
   - Payment method
4. Click "Donate" button
5. Should redirect to Xcel payment page
6. Complete the payment
7. Should redirect back to success page

#### Check Logs:
- Vercel Dashboard → getfund-cms-backend → Logs
- Monitor for any errors during payment processing

### 5. Monitor First Transactions

Watch for:
- ✅ Payment initialization successful
- ✅ User redirected to Xcel correctly
- ✅ Webhook received after payment
- ✅ User redirected back to success page
- ✅ Payment verification working

### 6. Troubleshooting

**If payment initialization fails:**
- Check Vercel environment variables are set correctly
- Check backend logs for errors
- Verify API keys are correct

**If webhook not received:**
- Confirm webhook URL is registered in Xcel dashboard
- Check webhook URL is publicly accessible
- Review Xcel dashboard for webhook delivery status

**If verification fails:**
- Check reference parameter is passed correctly
- Verify API credentials have correct permissions

## 📞 Support

**Xcel Support**: Contact Xcel if issues with their API  
**Backend Logs**: https://vercel.com/dashboard (getfund-cms-backend → Logs)  
**Frontend Logs**: Browser console on payment pages

## 🎉 Success Criteria

- [ ] Vercel environment variables added
- [ ] Backend successfully deployed
- [ ] Webhook URL configured in Xcel
- [ ] Test payment completed successfully
- [ ] Webhook received and processed
- [ ] Payment verification working
- [ ] User sees success message

Once all checkboxes are completed, the payment gateway is fully operational! 🚀
