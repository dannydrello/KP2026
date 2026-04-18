import 'dotenv/config';
import express from 'express';
import crypto from 'crypto';
import logger from '../utils/logger.js';
import db from '../utils/mariadb.js';
import { sendCustomerReceipt, sendKitchenNotification } from '../utils/whatsapp.js';

const router = express.Router();

const PAYDESTAL_PUBLIC_KEY = process.env.PAYDESTAL_PUBLIC_KEY;
const PAYDESTAL_SECRET_KEY = process.env.PAYDESTAL_SECRET_KEY;
const PAYDESTAL_MODE = process.env.PAYDESTAL_MODE || 'live';

// Constants for timeout and retry configuration
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

// Generate unique idempotency key for payment requests
function generateIdempotencyKey(orderId) {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(4).toString('hex');
  return `${orderId}-${timestamp}-${randomBytes}`;
}

// Fetch with retry logic and exponential backoff
async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return response;
      }

      // Don't retry on successful responses
      if (response.ok) {
        return response;
      }

      // Retry on server errors (5xx) or rate limit
      if (attempt < retries) {
        const delay = RETRY_DELAYS[attempt] || 4000;
        logger.warn(`Request failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay}ms`, {
          url,
          status: response.status,
          statusText: response.statusText
        });
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (error) {
      if (error.name === 'AbortError') {
        logger.error('Request timeout', { url, attempt: attempt + 1 });
        if (attempt < retries) {
          const delay = RETRY_DELAYS[attempt] || 4000;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw new Error('Request timeout after all retries');
      }

      // Retry on network errors
      if (attempt < retries) {
        const delay = RETRY_DELAYS[attempt] || 4000;
        logger.warn(`Network error (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay}ms`, {
          url,
          error: error.message
        });
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }
}

// Helper function to verify payment status with Paydestal API
async function verifyPaymentWithPaydestal(transactionReference) {
  try {
    const baseUrl = PAYDESTAL_MODE === 'live' ? 'https://api.paydestal.com' : 'https://devbox.paydestal.com';
    const url = `${baseUrl}/pay/api/v1/verify-transaction?transactionReference=${transactionReference}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PAYDESTAL_SECRET_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Paydestal API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      const status = data.data.paymentStatus;
      // Map Paydestal status to our status
      let mappedStatus = 'pending';
      if (status === 'SUCCESSFUL') {
        mappedStatus = 'completed';
      } else if (['FAILED', 'DECLINED', 'CANCELED', 'ABANDONED'].includes(status)) {
        mappedStatus = 'failed';
      }
      
      return {
        status: mappedStatus,
        paydestalStatus: status,
        amount: data.data.amountPaid || data.data.amount,
        reference: data.data.payReference || data.data.reference
      };
    }
    
    return null;
  } catch (error) {
    logger.error('Paydestal verification error', error.message);
    return null;
  }
}

// GET /payment/config - Get Paydestal configuration for client-side popup
router.get('/config', async (req, res) => {
  try {
    if (!PAYDESTAL_PUBLIC_KEY) {
      logger.error('Missing Paydestal public key configuration');
      return res.status(500).json({
        error: 'Payment gateway configuration error',
      });
    }

    res.json({
      clientId: PAYDESTAL_PUBLIC_KEY,
      environment: (PAYDESTAL_MODE === 'production' || PAYDESTAL_MODE === 'live') ? 'live' : 'sandbox',
    });
  } catch (error) {
    logger.error('Failed to get Paydestal config', error.message);
    res.status(500).json({
      error: 'Failed to retrieve payment configuration',
    });
  }
});

// POST /payment/initiate - Initiate payment with Paydestal and return payment URL
router.post('/initiate', async (req, res) => {
  try {
    const { orderId, amount, currency, customerEmail, customerName, customerPhone, street, city, country, orderItems } = req.body;

    // Validate required fields
    if (!orderId || !amount || !currency || !customerEmail || !customerName || !orderItems) {
      return res.status(400).json({
        error: 'Missing required fields',
      });
    }

    // Generate idempotency key
    const idempotencyKey = generateIdempotencyKey(orderId);

    // Prepare Paydestal payment request
    const baseUrl = PAYDESTAL_MODE === 'live' ? 'https://api.paydestal.com' : 'https://devbox.paydestal.com';
    const callbackUrl = PAYDESTAL_MODE === 'live' 
      ? process.env.PAYDESTAL_LIVE_WEBHOOK_URL || 'https://kp-2026-web.vercel.app/api/payment/webhook'
      : process.env.PAYDESTAL_SANDBOX_WEBHOOK_URL || 'http://localhost:3000/api/payment/webhook';
    
    const paymentUrl = `${baseUrl}/pay/api/v1/card/init?clientId=${PAYDESTAL_PUBLIC_KEY}`;

    const paymentData = {
      reference: orderId,
      amount: parseFloat(amount),
      currency: currency || 'NGN',
      callbackUrl,
      customerName,
      customerEmail,
      customerPhone: customerPhone || '',
      sourceUrl: PAYDESTAL_MODE === 'live' ? 'https://kp-2026-web.vercel.app' : 'http://localhost:3000',
      city: city || '',
      country: country || 'NGA',
      address: street || '',
      stateProvinceCode: 'FC'
    };

    logger.info('Initiating payment with Paydestal', { orderId, amount, paymentUrl });

    // Call Paydestal API with retry logic
    const response = await fetchWithRetry(paymentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PAYDESTAL_SECRET_KEY}`,
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Paydestal API error', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });

      // Handle specific error codes
      if (response.status === 503) {
        return res.status(503).json({
          error: 'Payment gateway temporarily unavailable. Please try again later.'
        });
      }

      return res.status(response.status).json({
        error: 'Failed to initiate payment',
        details: response.status === 400 ? 'Invalid payment data' : 'Payment gateway error'
      });
    }

    const paymentResponse = await response.json();
    logger.info('Paydestal payment initiated', {
      orderId,
      paydestalReference: paymentResponse.reference,
      paymentUrl: paymentResponse.redirect_url || paymentResponse.payment_url || paymentResponse.url
    });

    // Store order in database
    let conn;
    try {
      conn = await db.getConnection();
      const result = await conn.query(
        `INSERT INTO transactions
         (orderId, status, amount, currency, customerEmail, customerName, customerPhone, street, city, country, orderItems, paydestal_reference)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          'pending',
          parseFloat(amount),
          currency,
          customerEmail,
          customerName,
          customerPhone || '',
          street || '',
          city || '',
          country || 'NG',
          JSON.stringify(orderItems),
          paymentResponse.reference || orderId
        ]
      );

      logger.info('Order stored in database', { orderId, transactionId: result.insertId });

      // Return payment URL to client
      res.json({
        success: true,
        orderId,
        paymentUrl: paymentResponse.redirect_url || paymentResponse.payment_url || paymentResponse.url,
        reference: paymentResponse.reference || orderId
      });

    } catch (dbError) {
      logger.error('Failed to store order in database', {
        orderId,
        errorCode: dbError.code,
        errorMessage: dbError.message,
        sqlMessage: dbError.sqlMessage
      });

      // Still return payment URL even if DB storage fails
      res.json({
        success: true,
        orderId,
        paymentUrl: paymentResponse.redirect_url || paymentResponse.payment_url || paymentResponse.url,
        reference: paymentResponse.reference || orderId,
        warning: 'Order stored temporarily, may not persist if payment fails'
      });
    } finally {
      if (conn) {
        try {
          conn.release();
        } catch (releaseError) {
          logger.warn('Failed to release DB connection', { error: releaseError.message });
        }
      }
    }
  } catch (error) {
    logger.error('Payment initiation error', error.message);

    if (error.message.includes('timeout')) {
      return res.status(504).json({
        error: 'Payment gateway timeout. Please try again.'
      });
    }

    res.status(500).json({
      error: 'Failed to initiate payment',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /payment/verify/:orderId - Verify payment status with retry logic
router.get('/verify/:orderId', async (req, res) => {
  const maxAttempts = 5;
  const delays = [1000, 2000, 4000, 8000]; // Exponential backoff

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        return res.status(400).json({ error: 'Order ID is required' });
      }

      // Get transaction from database
      let conn = await db.getConnection();
      const rows = await conn.query('SELECT * FROM transactions WHERE orderId = ? OR paydestal_reference = ?', [orderId, orderId]);
      conn.release();

      if (rows.length === 0) {
        return res.status(404).json({
          error: 'Order not found',
        });
      }

      const transaction = rows[0];

      // If payment is already completed or failed, return immediately
      if (transaction.status === 'completed') {
        return res.json({
          orderId: transaction.orderId,
          status: transaction.status,
          amount: transaction.amount,
          currency: transaction.currency,
          paydestal_reference: transaction.paydestal_reference,
        });
      }

      if (transaction.status === 'failed') {
        return res.json({
          orderId: transaction.orderId,
          status: transaction.status,
          amount: transaction.amount,
          currency: transaction.currency,
          paydestal_reference: transaction.paydestal_reference,
        });
      }

      // Verify with Paydestal API
      const referenceToCheck = transaction.paydestal_reference || orderId;
      const verification = await verifyPaymentWithPaydestal(referenceToCheck);

      if (verification) {
        // Update status if it changed
        if (verification.status !== transaction.status) {
          await updateTransactionStatus(orderId, verification.status, verification.reference);
        }

        return res.json({
          orderId: transaction.orderId,
          status: verification.status,
          amount: verification.amount || transaction.amount,
          currency: transaction.currency,
          paydestal_reference: verification.reference || transaction.paydestal_reference,
        });
      }

      // If verification failed and this is not the last attempt, wait and retry
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, delays[attempt] || 8000));
        continue;
      }

      // Return current status if all verification attempts failed
      return res.json({
        orderId: transaction.orderId,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        paydestal_reference: transaction.paydestal_reference,
      });

    } catch (error) {
      logger.error('Payment verification error', {
        orderId: req.params.orderId,
        attempt: attempt + 1,
        error: error.message
      });

      // If this is not the last attempt, wait and retry
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, delays[attempt] || 8000));
        continue;
      }

      // Return error on last attempt
      return res.status(500).json({
        error: 'Failed to verify payment',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
});

// POST /payment/check-status/:orderId - Check and update payment status with Paydestal API
router.post('/check-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Get transaction from database
    let conn = await db.getConnection();
    const rows = await conn.query('SELECT * FROM transactions WHERE orderId = ? OR paydestal_reference = ?', [orderId, orderId]);
    
    if (rows.length === 0) {
      conn.release();
      return res.status(404).json({
        error: 'Order not found',
      });
    }

    const transaction = rows[0];
    conn.release();

    // If already completed, return current status
    if (transaction.status === 'completed') {
      return res.json({
        orderId: transaction.orderId,
        status: transaction.status,
        message: 'Payment already completed'
      });
    }

    // Use paydestal_reference if available, otherwise use orderId
    const referenceToCheck = transaction.paydestal_reference || orderId;
    
    // Verify with Paydestal API
    const verification = await verifyPaymentWithPaydestal(referenceToCheck);
    
    if (verification) {
      // Update status if it changed
      if (verification.status !== transaction.status) {
        await updateTransactionStatus(orderId, verification.status, verification.reference);
        
        // Send notifications if payment completed
        if (verification.status === 'completed') {
          const orderData = {
            orderId: orderId,
            amount: verification.amount,
            currency: 'NGN',
            items: JSON.parse(transaction.orderItems || '[]')
          };
          
          const customerData = {
            customerName: transaction.customerName,
            customerEmail: transaction.customerEmail,
            phone: transaction.customerPhone || '',
            street: transaction.street || '',
            city: transaction.city || ''
          };
          
          // Send receipts in parallel (non-blocking)
          Promise.all([
            sendCustomerReceipt(orderData, customerData),
            sendKitchenNotification(orderData, customerData)
          ]).catch(err => logger.error('Error sending WhatsApp messages', err.message));
        }
      }

      res.json({
        orderId: orderId,
        status: verification.status,
        paydestalStatus: verification.paydestalStatus,
        amount: verification.amount,
        reference: verification.reference
      });
    } else {
      res.status(500).json({
        error: 'Failed to verify payment with Paydestal'
      });
    }

  } catch (error) {
    logger.error('Payment status check error', { orderId: req.params.orderId, error: error.message });
    res.status(500).json({
      error: 'Failed to check payment status',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// POST /payment/webhook - Receive Paydestal payment callbacks
router.post('/webhook', async (req, res) => {
  try {
    const { event, data } = req.body;
    const nmac = req.headers.nmac || req.headers['x-nmac'] || req.headers['X-NMAC'];

    logger.info('Received Paydestal webhook', {
      event,
      payReference: data?.payReference,
      nmacProvided: !!nmac,
      nmacValue: nmac,
      payload: data
    });

    // Verify webhook signature using HMAC-SHA512 with payReference
    if (!verifyWebhookSignature(data?.payReference, nmac)) {
      logger.warn('Invalid webhook signature', {
        payReference: data?.payReference,
        nmacProvided: nmac,
      });
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    // Handle different payment events
    try {
      if (event === 'success' || event === 'charge.success' || event === 'fixed.payment.success') {
        logger.info('Payment completed', { payReference: data.payReference, amount: data.amount });
        await updateTransactionStatus(data.payReference, 'completed', data.payReference);
        
        // Send WhatsApp receipts
        try {
          let conn = await db.getConnection();
          const rows = await conn.query(
            'SELECT * FROM transactions WHERE orderId = ? OR paydestal_reference = ?',
            [data.payReference, data.payReference]
          );
          conn.release();

          if (rows.length === 0) {
            logger.warn('Transaction not found for WhatsApp', { payReference: data.payReference, query: 'orderId OR paydestal_reference' });
            return;
          }

          const transaction = rows[0];
          
          const orderData = {
            orderId: data.payReference,
            amount: data.amount,
            currency: data.currency || 'NGN',
            items: JSON.parse(transaction.orderItems || '[]')
          };
          
          const customerData = {
            customerName: data.customerName || transaction.customerName,
            customerEmail: data.customerEmail || transaction.customerEmail,
            phone: transaction.customerPhone || '',
            street: transaction.street || '',
            city: transaction.city || ''
          };
          
          // Send receipts in parallel (non-blocking)
          Promise.all([
            sendCustomerReceipt(orderData, customerData),
            sendKitchenNotification(orderData, customerData)
          ]).catch(err => logger.error('Error sending WhatsApp messages', err.message));
          
        } catch (waError) {
          logger.warn('Could not send WhatsApp receipts', { payReference: data.payReference, error: waError.message });
          // Don't fail the webhook if WhatsApp fails
        }
        
      } else if (event === 'failed' || event === 'charge.failed' || event === 'fixed.payment.failed') {
        logger.warn('Payment failed', { payReference: data.payReference });
        await updateTransactionStatus(data.payReference, 'failed', data.payReference);
      }

    } catch (dbError) {
      logger.error('Failed to update transaction status', { payReference: data.payReference, error: dbError.message });
      // Still acknowledge the webhook even if DB update fails
    }

    // Acknowledge receipt of webhook
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Webhook processing error', error.message);
    res.status(500).json({
      error: 'Failed to process webhook',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Helper function to verify webhook signature using HMAC-SHA512
function verifyWebhookSignature(payReference, providedNmac) {
  if (!payReference || !providedNmac) {
    return false;
  }

  try {
    const hmac = crypto.createHmac('sha512', PAYDESTAL_SECRET_KEY);
    hmac.update(payReference);
    const computedNmac = hmac.digest('hex');
    
    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(Buffer.from(computedNmac, 'hex'), Buffer.from(providedNmac, 'hex'));
  } catch (error) {
    logger.error('Webhook signature verification error', error.message);
    return false;
  }
}

// Ensure transaction status is updated in the database
async function updateTransactionStatus(orderIdOrReference, status, paydestalReference) {
  let conn;
  try {
    conn = await db.getConnection();

    // Update existing transaction by orderId or paydestal_reference
    await conn.query(
      'UPDATE transactions SET status = ?, paydestal_reference = ? WHERE orderId = ? OR paydestal_reference = ?',
      [status, paydestalReference, orderIdOrReference, orderIdOrReference]
    );

    // If no existing row, insert a minimal record (safe-guard)
    await conn.query(
      `INSERT INTO transactions (orderId, status, amount, currency, customerEmail, customerName, customerPhone, street, city, country, orderItems, paydestal_reference)
       SELECT ?, ?, 0, 'NGN', '', '', '', '', '', 'NG', '[]', ?
       WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE orderId = ? OR paydestal_reference = ?)`,
      [orderIdOrReference, status, paydestalReference, orderIdOrReference, orderIdOrReference]
    );

    conn.release();
  } catch (error) {
    if (conn) conn.release();
    logger.error('updateTransactionStatus error', error.message);
    throw error;
  }
}

// GET /payment/check-orders - Check recent test orders in database
router.get('/check-orders', async (req, res) => {
  try {
    let conn = await db.getConnection();
    const rows = await conn.query(
      'SELECT orderId, status, amount, customerName, customerPhone, created_at FROM transactions WHERE orderId LIKE ? ORDER BY created_at DESC LIMIT 20',
      ['TEST-%']
    );
    conn.release();

    res.json(rows);
  } catch (error) {
    logger.error('check-orders error', error.message);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

export default router;