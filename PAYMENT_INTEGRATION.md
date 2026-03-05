# Payment Gateway Integration Guide

This document outlines the Paydestal payment gateway integration and important setup steps before going live.

## Overview

The application uses **Paydestal** as the payment gateway with the following features:
- Idempotency key support to prevent duplicate charges
- Automatic retry logic with exponential backoff
- Webhook support for payment status updates
- Database persistence for all payment transactions

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
# Paydestal credentials (get from your Paydestal dashboard)
PAYDESTAL_PUBLIC_KEY=your_public_key_here
PAYDESTAL_SECRET_KEY=your_secret_key_here

# For production, set this to 'production'
PAYDESTAL_MODE=sandbox

# PocketBase URL
POCKETBASE_URL=http://localhost:8090
```

⚠️ **IMPORTANT**: Never commit `.env` file. Always use `.env.example` as a template.

### 2. Install Dependencies

```bash
cd apps/api
npm install
```

### 3. Webhook Configuration

Register your webhook endpoint in Paydestal dashboard:

**Webhook URL**: `https://your-domain.com/payment/webhook`

**Events to subscribe**:
- `payment.completed` - Payment successful
- `payment.failed` - Payment failed
- `payment.pending` - Payment pending

### 4. Payment Flow

```
User → Checkout Form → Initiate Payment → Redirect to Paydestal
                                              ↓
                                        User Completes Payment
                                              ↓
                            Paydestal sends webhook → API updates DB
                                              ↓
                                  User returns to success page
```

## Key Features

### Idempotency Keys
- Prevents duplicate charges if a request is retried
- Automatically generated for each payment initiation
- Format: `{orderId}-{timestamp}-{random}`

### Retry Logic
- Automatic retries with exponential backoff (1s, 2s, 4s)
- Max 3 attempts before failing
- 30-second timeout per request

### Database Persistence
Transactions are stored in PocketBase with fields:
- `orderId` - Unique order identifier
- `status` - Payment status (pending, completed, failed)
- `amount` - Payment amount in NGN
- `paydestal_reference` - Paydestal payment ID
- `customerEmail` / `customerName` - Customer details

### Webhook Verification
- Signature validation using HMAC-SHA256
- Prevents unauthorized webhook calls
- Database updates only on successful verification

## API Endpoints

### POST `/payment/initiate`
Initiates a payment with Paydestal.

**Request**:
```json
{
  "amount": 50000,
  "currency": "NGN",
  "orderId": "ORD-123456",
  "customerEmail": "user@example.com",
  "customerName": "John Doe",
  "orderItems": [
    {
      "id": "item-1",
      "name": "Pizza",
      "price": 50000,
      "quantity": 1
    }
  ]
}
```

**Response**:
```json
{
  "paymentUrl": "https://paydestal.com/pay/...",
  "paymentId": "pay_xxxxx",
  "idempotencyKey": "ORD-123456-1704067200000-abcdef123456"
}
```

### GET `/payment/verify/:paymentId`
Verifies payment status (can be called multiple times).

**Response**:
```json
{
  "status": "completed",
  "amount": 50000,
  "currency": "NGN"
}
```

### POST `/payment/webhook`
Receives payment status updates from Paydestal (auto-configured).

## Before Going Live

### 1. ✅ Credentials
- [ ] Obtain live Paydestal API keys
- [ ] Update `.env` with production keys
- [ ] Set `PAYDESTAL_MODE=production`

### 2. ✅ Webhook Setup
- [ ] Register webhook endpoint in Paydestal dashboard
- [ ] Test webhook delivery with Paydestal's webhook test tool
- [ ] Ensure webhook signature verification is enabled

### 3. ✅ Database
- [ ] Run PocketBase migrations
- [ ] Verify `transactions` and `orders` collections exist
- [ ] Test database connectivity from API

### 4. ✅ Security
- [ ] Enable HTTPS on all endpoints
- [ ] Configure CORS to only allow your domain
- [ ] Use environment variables for all secrets
- [ ] Never expose secret keys in logs

### 5. ✅ Testing
- [ ] Test payment flow end-to-end
- [ ] Test payment verification after return from Paydestal
- [ ] Test webhook handling with different payment statuses
- [ ] Test error scenarios (network timeout, invalid response, etc.)

### 6. ✅ Monitoring
- [ ] Set up logging for payment events
- [ ] Monitor webhook delivery and failures
- [ ] Set up alerts for payment failures
- [ ] Track idempotency key usage

## Error Handling

### Idempotency Protection
If a payment initiation request fails and is retried:
1. The same idempotency key is generated
2. Paydestal recognizes the duplicate
3. Returns the same payment URL and ID
4. No duplicate transaction is created

### Retry Logic
The API automatically retries failed requests:
- Network timeouts
- 5xx server errors
- Connection refused

It does NOT retry:
- 4xx client errors (validation failures)
- Invalid credentials
- Missing required fields

## Production Checklist

- [ ] Live Paydestal API keys configured
- [ ] PAYDESTAL_MODE set to 'production'
- [ ] Webhook endpoint registered and tested
- [ ] SSL/TLS certificate installed
- [ ] CORS properly configured
- [ ] Error monitoring/logging active
- [ ] Database backups configured
- [ ] Load testing completed
- [ ] Payment flow tested end-to-end
- [ ] Disaster recovery plan in place
