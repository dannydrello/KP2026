# 🚀 Payment Gateway: Live Keys Setup Guide

## Quick Start (5 Minutes)

### Step 1: Get Your Live Keys
1. Log in to your Paydestal dashboard
2. Navigate to API Settings or Credentials
3. Copy your **Live Public Key** and **Live Secret Key**

### Step 2: Update Environment
Edit `apps/api/.env`:

```bash
# Change from sandbox to production
PAYDESTAL_MODE=production

# Replace with your LIVE keys (from Step 1)
PAYDESTAL_PUBLIC_KEY=your_live_public_key
PAYDESTAL_SECRET_KEY=your_live_secret_key

# Ensure PocketBase is running
POCKETBASE_URL=http://localhost:8090
```

⚠️ **DO NOT COMMIT THIS FILE** - It's in `.gitignore`

### Step 3: Configure Webhook
In Paydestal Dashboard:
1. Go to **Webhook Settings**
2. Add new webhook endpoint:
   ```
   URL: https://yourdomain.com/payment/webhook
   Events: payment.completed, payment.failed, payment.pending
   ```
3. Test the webhook connection

### Step 4: Test Payment Flow
1. Make a test purchase with an amount ≤ 1000 (if available)
2. Check that transaction appears in PocketBase
3. Verify success page shows correct status
4. Check webhook delivery in Paydestal dashboard

## What's Different from Sandbox?

| Feature | Sandbox | Production |
|---------|---------|-----------|
| API URL | https://devbox.paydestal.com/api | https://api.paydestal.com/api |
| Keys | Test keys (pk_test, sk_test) | Live keys (pk_live, sk_live) |
| Real Charges | ❌ No | ✅ Yes |
| Webhook Test Tool | ✅ Available | ✅ Available |
| Rate Limits | Generous | Standard |

## Safety Checklist Before First Live Transaction

- [ ] PAYDESTAL_MODE set to `production`
- [ ] Live public key configured (starts with `pk_` or similar)
- [ ] Live secret key configured (starts with `sk_` or similar)
- [ ] Webhook endpoint registered
- [ ] HTTPS enabled on your server
- [ ] `.env` file is NOT committed to git
- [ ] Test transaction verified in PocketBase
- [ ] Success page displays correctly

## Key Features Active

✅ **Duplicate Prevention**: Idempotency keys prevent charging twice if retry occurs  
✅ **Reliability**: Automatic retries with exponential backoff  
✅ **Data Safety**: All transactions stored in PocketBase  
✅ **Webhook Safety**: Signature verification prevents unauthorized updates  
✅ **Error Handling**: Graceful timeout and network error handling  

## Emergency: Disable Payments

If you need to quickly disable payments:

1. **Stop new payments**: Comment out the payment route in `apps/api/src/routes/index.js`
2. **Hide checkout**: Set checkout button to disabled in UI
3. **Keep verification**: Keep verification endpoint active for pending payments

## Need Help?

📖 **Full Documentation**: See [PAYMENT_INTEGRATION.md](./PAYMENT_INTEGRATION.md)  
📋 **Changes Made**: See [FIXES_SUMMARY.md](./FIXES_SUMMARY.md)  
🔧 **Environment Setup**: See `.env.example` for all variables  

## Common Issues

**Q: "Invalid signature" error?**  
A: Webhook signature validation failed. Check that Paydestal is sending the webhook.

**Q: Payment initiated but no URL returned?**  
A: Check API logs. Paydestal response format might differ. Verify with Paydestal support.

**Q: Payment never marked as completed?**  
A: Webhook may not be configured or delivery failing. Check Paydestal webhook logs.

**Q: Duplicate charges?**  
A: This should NOT happen - idempotency keys prevent it. If it does, contact support.

---

**Ready?** Update the credentials and run your first test transaction! 🎉
