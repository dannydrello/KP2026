import 'dotenv/config';
const fetch = (await import('node-fetch')).default;
globalThis.fetch = fetch;

import { sendCustomerReceipt, sendKitchenNotification } from './src/utils/whatsapp.js';

(async () => {
  const orderData = {
    orderId: 'TEST-REF-123',
    amount: 1500,
    currency: 'NGN',
    items: [{ name: 'Test Cake', price: 1500, quantity: 1 }]
  };

  const customerData = {
    customerName: 'Test User',
    customerEmail: 'test@example.com',
    phone: process.env.WHATSAPP_BUSINESS_PHONE_NUMBER || '+2348069747505',
    street: 'Test St',
    city: 'Lagos'
  };

  console.log('Sending customer receipt...');
  const res1 = await sendCustomerReceipt(orderData, customerData);
  console.log('Customer result:', res1);

  console.log('Sending kitchen notification...');
  const res2 = await sendKitchenNotification(orderData, customerData);
  console.log('Kitchen result:', res2);

  process.exit(0);
})().catch(err => {
  console.error('Test script error:', err);
  process.exit(1);
});
