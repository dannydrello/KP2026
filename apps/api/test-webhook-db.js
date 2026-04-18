// Test script to verify database persistence on payment completion
import fetch from 'node-fetch';
import 'dotenv/config';

const API_BASE = 'http://localhost:3001';

// Test data for webhook simulation
const testWebhookData = {
  event: 'payment.completed',
  data: {
    reference: 'TEST_WEBHOOK_' + Date.now(),
    amount: 2500,
    currency: 'NGN',
    status: 'completed',
    customer: {
      email: 'test@example.com',
      name: 'Test Customer',
      phone: '+2348069747505'
    },
    metadata: {
      orderId: 'TEST_ORDER_' + Date.now(),
      items: JSON.stringify([{ id: 1, name: 'Chocolate Cake', price: 2500, quantity: 1 }]),
      customerName: 'Test Customer',
      customerPhone: '+2348069747505',
      customerEmail: 'test@example.com',
      street: '123 Test Street',
      city: 'Lagos',
      country: 'NG'
    }
  }
};

async function testDatabasePersistence() {
  console.log('🧪 Testing Database Persistence on Payment Completion\n');

  try {
    // Step 1: Test webhook endpoint directly
    console.log('1️⃣ Testing webhook endpoint...');
    const webhookResponse = await fetch(`${API_BASE}/payment/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Paydestal-Signature': 'test_signature' // Mock signature
      },
      body: JSON.stringify(testWebhookData)
    });

    const webhookResult = await webhookResponse.json();
    console.log('   Webhook response:', webhookResult);

    if (webhookResponse.ok) {
      console.log('   ✅ Webhook accepted');
    } else {
      console.log('   ❌ Webhook failed:', webhookResult);
    }

    // Step 2: Check if transaction was saved to database
    console.log('\n2️⃣ Checking database for transaction...');
    const checkResponse = await fetch(`${API_BASE}/check-orders`);
    const orders = await checkResponse.json();

    console.log('   Found transactions:', orders.length);
    if (orders.length > 0) {
      const latestOrder = orders[orders.length - 1];
      console.log('   Latest order:', {
        orderId: latestOrder.orderId,
        status: latestOrder.status,
        amount: latestOrder.amount,
        created: latestOrder.created_at
      });

      if (latestOrder.status === 'completed') {
        console.log('   ✅ Transaction successfully saved to database!');
        return true;
      } else {
        console.log('   ⚠️ Transaction saved but status is:', latestOrder.status);
        return false;
      }
    } else {
      console.log('   ❌ No transactions found in database');
      return false;
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Run the test
testDatabasePersistence().then(success => {
  console.log('\n' + (success ? '🎉 SUCCESS: Database persistence works!' : '💥 FAILURE: Database persistence failed'));
  process.exit(success ? 0 : 1);
});