// Wait a bit for server to start
setTimeout(async () => {
  const testData = {
    orderId: 'TEST' + Math.floor(Math.random() * 1000000).toString().slice(0, 11),
    amount: 1500,
    currency: 'NGN',
    customerEmail: 'test@example.com',
    customerName: 'Test User',
    customerPhone: '+2348069747505',
    street: 'Test Street',
    city: 'Lagos',
    country: 'NG',
    orderItems: [{ id: 1, name: 'Test Cake', price: 1500, quantity: 1 }]
  };

  try {
    console.log('Testing database insertion...');
    const response = await fetch('http://localhost:3001/payment/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('✅ Database insertion successful!');
    } else {
      console.log('❌ Database insertion failed:', data.error);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}, 2000);