# WhatsApp Integration Setup Guide

## Overview

Your payment system now automatically sends:
- ✅ **Customer Receipts** - Order confirmation with payment details
- ✅ **Kitchen Notifications** - Alert kitchen staff of new orders

All sent via WhatsApp when payment is completed.

---

## 🚀 Quick Setup (15 minutes)

### Step 1: Choose WhatsApp Service Provider

We use **Green-API** (recommended for Nigeria/Africa):

**Alternatives:**
- Twilio WhatsApp Business API
- MessageBird
- Any REST-based WhatsApp service

### Step 2: Get WhatsApp Business Account

For **Green-API**:
1. Go to https://green-api.com
2. Sign up for free account
3. Get:
   - Instance ID
   - API Key
   - Business phone number (WhatsApp verified)

### Step 3: Update Environment Variables

Edit `apps/api/.env`:

```bash
# WhatsApp Configuration
WHATSAPP_INTEGRATION_ENABLED=true

# From your Green-API dashboard
WHATSAPP_INSTANCE_ID=YOUR_INSTANCE_ID
WHATSAPP_API_KEY=YOUR_API_KEY
WHATSAPP_BUSINESS_PHONE_NUMBER=+234XXXXXXXXXX

# Kitchen staff WhatsApp number
KITCHEN_WHATSAPP_NUMBER=+234XXXXXXXXXX
```

### Step 4: Test WhatsApp Setup

The system will automatically test on first payment completion. You should receive:
- Customer: Receipt with order details
- Kitchen: Order notification

---

## 📝 What Gets Sent

### Customer Receipt Message

```
🎉 KITCHEN PASTRIES - ORDER RECEIPT

✅ Payment Successful!

📋 Order Details
Order ID: ORD-1704067200-abc123
Date: 3/4/2026, 2:30:45 PM

👤 Customer Info
Name: John Doe
Phone: +234 800 123 4567
Email: john@example.com
Address: 123 Main St, Lagos

🍰 Order Items
• Chocolate Cake x2 = ₦25,000
• Vanilla Donut x3 = ₦7,500
• Coffee x2 = ₦5,000

💰 Payment Summary
Total: ₦37,500 NGN
Status: ✅ Confirmed

Thank you for your order! We'll prepare and deliver as soon as possible.
```

### Kitchen Notification

```
🔔 NEW ORDER ALERT!

📋 Order ID: ORD-1704067200-abc123
👤 Customer: John Doe
📞 Phone: +234 800 123 4567
📍 Address: 123 Main St, Lagos

🍰 Items to Prepare
• Chocolate Cake x2
• Vanilla Donut x3
• Coffee x2

💰 Amount: ₦37,500
⏰ Time: 2:30:45 PM

Status: Ready to prepare ✓
```

---

## 🔧 Configuration Details

### WhatsApp Phone Number Format

The system automatically handles phone number formatting:
- Accepts: `+234 800 123 4567`, `08001234567`, `2348001234567`
- Normalizes to: `234XXXXXXXXXX@c.us` (WhatsApp format)

### API Integration

The system uses **Green-API** endpoint:
```
https://api.green-api.com/waInstance{INSTANCE_ID}/sendMessage/{API_KEY}
```

To use a different provider, modify `apps/api/src/utils/whatsapp.js`:

1. Change the API endpoint URL
2. Adjust the request/response format
3. Update the phone number format if needed

### Error Handling

If WhatsApp sending fails:
- ✅ Payment is still processed successfully
- ⚠️ Error is logged for troubleshooting
- 🔄 You can manually resend via WhatsApp later

Webhook responds successfully regardless of WhatsApp status.

---

## 🎯 Features

### Automatic Triggering
- Sends when `payment.completed` webhook received
- Non-blocking (doesn't delay webhook response)
- Runs in parallel with database updates

### Rich Formatting
- Formatted numbers (₦37,500)
- Emoji for readability (🎉📞🍰)
- Timestamps
- Complete order details

### Error Resilience
- WhatsApp failures don't break payment
- Logs all attempts for debugging
- Can be disabled via `WHATSAPP_INTEGRATION_ENABLED=false`

### Multi-Contact Support
- Different numbers for customers and kitchen
- Easy to update in `.env`
- Supports multiple numbers via array (future enhancement)

---

## 📋 Troubleshooting

### "WhatsApp API error: 401"
- **Problem**: API key is invalid or expired
- **Solution**: Check `WHATSAPP_API_KEY` in `.env`

### "WhatsApp disabled"
- **Problem**: `WHATSAPP_INTEGRATION_ENABLED=false`
- **Solution**: Set to `true` in `.env`

### Messages not receiving
- **Problem**: WhatsApp business account not properly set up
- **Solution**: 
  1. Verify account is WhatsApp Business (not regular)
  2. Check phone number is verified
  3. Test with provider's dashboard first

### Wrong phone numbers
- **Problem**: Numbers formatted incorrectly
- **Solution**: Include country code (e.g., +234 for Nigeria)

### Kitchen not receiving orders
- **Problem**: `KITCHEN_WHATSAPP_NUMBER` not set
- **Solution**: Add to `.env` file

---

## 🔐 Security Notes

- ✅ API keys stored securely in `.env`
- ✅ `.env` is in `.gitignore` (won't be committed)
- ✅ All phone numbers verified before sending
- ✅ No sensitive data in logs (only numbers masked)

---

## 📊 Monitoring

### View WhatsApp Activity

Check `apps/api/src/utils/logger.js` output for:

```
[INFO] Sending WhatsApp message { to: '234XXXXXXXXXX' }
[INFO] WhatsApp message sent successfully { messageId: 'true_1234567890@c.us_xxxxx' }
[WARN] Failed to send customer receipt { orderId: 'ORD-123', reason: '...' }
[ERROR] WhatsApp API error { status: 401, error: '...' }
```

### Webhook Logs

All webhook events logged in database:
- Timestamp of webhook
- WhatsApp send attempts
- Success/failure status

---

## 🚀 Going Live

### Pre-Launch Checklist

- [ ] Green-API (or provider) account created
- [ ] Business WhatsApp account verified
- [ ] Instance ID obtained
- [ ] API Key obtained
- [ ] `.env` updated with credentials
- [ ] Test payment completed successfully
- [ ] Receipts received on both numbers
- [ ] Error messages checked and understood

### First Payment Test

1. Complete a test order
2. Should receive 2 WhatsApp messages (customer + kitchen)
3. Verify all details are correct
4. Check for any errors in logs
5. Adjust formatting if needed

---

## 💡 Future Enhancements

Potential additions:
- [ ] Multiple kitchen numbers (round-robin)
- [ ] Order status updates (preparing, ready, delivered)
- [ ] Customer tracking link
- [ ] Payment receipt PDF attachment
- [ ] Delivery updates via WhatsApp
- [ ] Customer reviews request

---

## 📞 Support

For issues with:
- **Paydestal**: Check `PAYMENT_INTEGRATION.md`
- **WhatsApp API**: Visit provider documentation
- **Database**: Check `PAYMENT_INTEGRATION.md` → Database section
- **Configuration**: See `.env.example`

---

## ✨ What's Next

Your system now has:
1. ✅ Live payment processing
2. ✅ Automatic webhooks
3. ✅ Database persistence
4. ✅ WhatsApp notifications

**You're production-ready!** 🎉
