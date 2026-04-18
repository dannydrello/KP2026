import 'dotenv/config';
import db from './src/utils/mariadb.js';

(async () => {
  try {
    const conn = await db.getConnection();
    const rows = await conn.query('SELECT orderId, status, amount, customerName, customerPhone, created_at FROM transactions WHERE orderId LIKE ? ORDER BY created_at DESC LIMIT 10', ['TEST-%']);
    conn.release();
    
    console.log('\n📊 TEST ORDERS IN DATABASE:\n');
    if (rows.length === 0) {
      console.log('❌ No test orders found in database');
    } else {
      rows.forEach((row, idx) => {
        console.log(`${idx + 1}. Order ID: ${row.orderId}`);
        console.log(`   Status: ${row.status}`);
        console.log(`   Amount: ₦${row.amount}`);
        console.log(`   Customer: ${row.customerName}`);
        console.log(`   Phone: ${row.customerPhone}`);
        console.log(`   Created: ${row.created_at}`);
        console.log('');
      });
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Database error:', err.message);
    process.exit(1);
  }
})();
