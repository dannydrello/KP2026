# Payment Integration Fixes

## Summary

This document details the fixes applied to resolve the Paydestal payment integration issues.

## Issues Fixed

### 1. Cross-Origin Embedder Policy (COEP) Blocking Popup

**Problem:** The Paydestal payment popup was blocked by browser security policies.

```
Because your site has the Cross-Origin Embedder Policy (COEP) enabled, 
each resource must specify a suitable Cross-Origin Resource Policy (CORP).
```

**Solution:** 
- Disabled COEP headers in `apps/web/vite.config.js`
- Added `Cross-Origin-Embedder-Policy: unsafe-none` meta tag in `index.html`

**Files Modified:**
- `apps/web/vite.config.js`
- `apps/web/index.html`

---

### 2. Popup Blocked Due to Async Operations

**Problem:** Browser blocked the popup because `openPopup()` was called after async operations (API calls).

**Solution:** Restructured the payment flow:
1. Create order in background (fire-and-forget)
2. Open popup synchronously (immediately on button click)
3. Use localStorage as backup for order data

**Files Modified:**
- `apps/web/src/components/CheckoutForm.jsx`

---

### 3. Database Collection Missing

**Problem:** PocketBase `transactions` collection did not exist.

```
Failed to store order { error: 'Missing or invalid collection context.' }
```

**Solution:**
- Created migration file `apps/pocketbase/pb_migrations/1772731200_create_transactions_collection.js`
- Made order creation non-blocking (payment proceeds even if DB fails)

**Files Modified:**
- `apps/pocketbase/pb_migrations/1772731200_create_transactions_collection.js`
- `apps/api/src/routes/payment.js`

---

### 4. Wrong Amount Format

**Problem:** Amount was being sent in kobo (cents) instead of Naira.

**Before:** `amount: Math.round(paymentAmount * 100)` → Sent 710000 for ₦7,100
**After:** `amount: Math.round(paymentAmount)` → Sends 7100 for ₦7,100

**Files Modified:**
- `apps/web/src/components/CheckoutForm.jsx`

---

### 5. Phone Number Formatting

**Problem:** Leading zero was being stripped from phone numbers.

**Before:** `+2348013456000` → `8013456000` (wrong)
**After:** `+2348013456000` → `08013456000` (correct)

**Solution:** Proper regex replacement to handle both `+234` and `0` prefixes.

**Files Modified:**
- `apps/web/src/components/CheckoutForm.jsx`

---

### 6. Order Persistence

**Problem:** Orders were lost if API server was temporarily unavailable.

**Solution:**
- Save orders to `localStorage` before attempting API call
- Retry logic with exponential backoff (3 attempts)
- Automatic reconciliation on payment success page

**Files Modified:**
- `apps/web/src/components/CheckoutForm.jsx`
- `apps/web/src/pages/PaymentSuccessPage.jsx`

---

### 7. CORS/CORP Headers

**Problem:** API was not allowing cross-origin requests from frontend.

**Solution:** 
- Updated CORS configuration in API
- Added `Cross-Origin-Resource-Policy: cross-origin` header

**Files Modified:**
- `apps/api/src/main.js`

---

## Architecture Overview

```
User clicks "Complete Payment"
    ↓
Order saved to localStorage (backup)
    ↓
POST /payment/initiate → Creates order in PocketBase
    ↓
window.PaydestalInit.create(config) → Opens popup
    ↓
User completes payment in Paydestal
    ↓
Paydestal webhook POST /payment/webhook
    ↓
Order status updated to "completed"
    ↓
WhatsApp notifications sent (customer + kitchen)
```

## Environment Variables Required

Create `apps/api/.env`:

```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://localhost:3000

# Paydestal Payment Gateway
PAYDESTAL_PUBLIC_KEY=your_paydestal_public_key
PAYDESTAL_SECRET_KEY=your_paydestal_secret_key
PAYDESTAL_MODE=sandbox  # or 'production'

# PocketBase Database
POCKETBASE_URL=http://localhost:8090

# WhatsApp Notifications (Optional)
WHATSAPP_INTEGRATION_ENABLED=false
```

## Testing Checklist

- [ ] All services running (PocketBase, API, Web)
- [ ] Add items to cart
- [ ] Fill checkout form with valid phone number
- [ ] Click "Complete Payment"
- [ ] Paydestal popup opens with correct amount
- [ ] Complete test payment
- [ ] Redirected to success page
- [ ] Order appears in PocketBase with "completed" status

## Important Notes

1. **Paydestal Amount Format:** Paydestal expects amount in Naira, NOT kobo.
2. **Phone Format:** Must include leading zero (e.g., `08032834562`).
3. **Popup Blocker:** Users must allow popups for the site.
4. **Client ID:** Must be a valid Paydestal public key (starts with `PYD_`).

5. **Environment Mode:** Use `PAYDESTAL_MODE=production` or `PAYDESTAL_MODE=live` for live payments. Anything else defaults to sandbox.

---

## Additional Fix: Environment Mode Detection

**Problem:** API was checking for `PAYDESTAL_MODE === 'production'` only, but `.env` had `PAYDESTAL_MODE=live`, causing it to return 'sandbox' instead of 'live'.

**Solution:** Updated the condition to accept both 'production' and 'live':

```javascript
environment: (PAYDESTAL_MODE === 'production' || PAYDESTAL_MODE === 'live') ? 'live' : 'sandbox',
```

**File Modified:** `apps/api/src/routes/payment.js`
