import 'dotenv/config';
import express from 'express';
import crypto from 'crypto';
import logger from '../utils/logger.js';
import db from '../utils/mariadb.js';
import { sendCustomerReceipt, sendKitchenNotification } from '../utils/whatsapp.js';

const router = express.Router();

const PAYDESTAL_PUBLIC_KEY = process.env.PAYDESTAL_PUBLIC_KEY;
const PAYDESTAL_SECRET_KEY = process.env.PAYDESTAL_SECRET_KEY;
const PAYDESTAL_MODE = process.env.PAYDESTAL_MODE || 'sandbox';

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
        amount: data.data.amount,
        reference: data.data.payReference
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

// POST /payment/initiate - Store order and prepare for payment
router.post('/initiate', async (req, res) => {
  try {
    const { orderId, amount, currency, customerEmail, customerName, customerPhone, street, city, country, orderItems } = req.body;

    // Validate required fields
    if (!orderId || !amount || !currency || !customerEmail || !customerName || !orderItems) {
      return res.status(400).json({
        error: 'Missing required fields',
      });
    }

    try {
      // Store order in MariaDB
      let conn = await db.getConnection();
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
          ''
        ]
      );
      conn.release();

      logger.info('Order created in database', { orderId, transactionId: result.insertId });

      res.json({
        success: true,
        orderId,
        transactionId: result.insertId,
      });
    } catch (dbError) {
      // Log error but don't fail - payment can still proceed
      // Webhook will handle reconciliation
      logger.error('Failed to store order in database', { 
        orderId, 
        error: dbError.message,
        hint: 'Make sure the "transactions" table exists in MariaDB'
      });

      // Return success anyway so payment can proceed
      res.json({
        success: true,
        orderId,
        transactionId: null,
        warning: 'Order not stored in database - will be reconciled via webhook',
        error: dbError.message
      });
    }
  } catch (error) {
    logger.error('Payment initiation error', error.message);
    res.status(500).json({
      error: 'Failed to initiate payment',
    });
  }
});

// GET /payment/verify/:orderId - Verify payment status from database
router.get('/verify/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    try {
      let conn = await db.getConnection();
      const rows = await conn.query('SELECT * FROM transactions WHERE orderId = ?', [orderId]);
      conn.release();

      if (rows.length === 0) {
        return res.status(404).json({
          error: 'Order not found',
        });
      }

      const transaction = rows[0];

      logger.info('Order status retrieved', { orderId, status: transaction.status });

      res.json({
        orderId: transaction.orderId,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        paydestal_reference: transaction.paydestal_reference,
      });
    } catch (error) {
      if (error.code === 'ER_NO_SUCH_TABLE') {
        return res.status(404).json({
          error: 'Order not found',
        });
      }
      throw error;
    }
  } catch (error) {
    logger.error('Payment verification error', { orderId: req.params.orderId, error: error.message });
    res.status(500).json({
      error: 'Failed to verify payment',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
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
    const rows = await conn.query('SELECT * FROM transactions WHERE orderId = ?', [orderId]);
    
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

    // Verify with Paydestal API
    const verification = await verifyPaymentWithPaydestal(orderId);
    
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
    const { event, data, signature } = req.body;

    logger.info('Received Paydestal webhook', { event, paymentId: data?.id });

    // Verify webhook signature
    if (!verifyWebhookSignature(req.body, signature)) {
      logger.warn('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    // Handle different payment events
    try {
      if (event === 'payment.completed') {
        logger.info('Payment completed', { paymentId: data.id, orderId: data.order_id });
        await updateTransactionStatus(data.order_id, 'completed', data.id);
        
        // Send WhatsApp receipts
        try {
          let conn = await db.getConnection();
          const rows = await conn.query('SELECT * FROM transactions WHERE orderId = ?', [data.order_id]);
          conn.release();

          if (rows.length === 0) {
            logger.warn('Transaction not found for WhatsApp', { orderId: data.order_id });
            return;
          }

          const transaction = rows[0];
          
          const orderData = {
            orderId: data.order_id,
            amount: data.amount / 100, // Convert from cents
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
          
        } catch (waError) {
          logger.warn('Could not send WhatsApp receipts', { orderId: data.order_id, error: waError.message });
          // Don't fail the webhook if WhatsApp fails
        }
        
      } else if (event === 'payment.failed') {
        logger.warn('Payment failed', { paymentId: data.id, orderId: data.order_id });
        await updateTransactionStatus(data.order_id, 'failed', data.id);
      } else if (event === 'payment.pending') {
        logger.info('Payment pending', { paymentId: data.id, orderId: data.order_id });
        await updateTransactionStatus(data.order_id, 'pending', data.id);
      }
    } catch (dbError) {
      logger.error('Failed to update transaction status', { orderId: data.order_id, error: dbError.message });
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

// Helper function to verify webhook signature
function verifyWebhookSignature(payload, signature) {
  // Create a string representation of the payload (excluding signature)
  const { signature: _, ...payloadWithoutSignature } = payload;
  const payloadString = JSON.stringify(payloadWithoutSignature);

  // Create HMAC-SHA256 hash
  const hash = crypto
    .createHmac('sha256', PAYDESTAL_SECRET_KEY)
    .update(payloadString)
    .digest('hex');

  // Compare with provided signature
  return hash === signature;
}

export default router;