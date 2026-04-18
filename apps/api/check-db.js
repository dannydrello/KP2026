import 'dotenv/config';
import db from './src/utils/mariadb.js';

(async () => {
  try {
    const conn = await db.getConnection();
    const tables = await conn.query('SHOW TABLES');
    console.log('Available tables:', tables.map(t => Object.values(t)[0]));

    if (tables.some(t => Object.values(t)[0] === 'transactions')) {
      const count = await conn.query('SELECT COUNT(*) as count FROM transactions');
      console.log('Transactions table has', count[0].count, 'records');

      const recent = await conn.query('SELECT orderId, status, amount, created_at FROM transactions ORDER BY created_at DESC LIMIT 5');
      console.log('Recent transactions:');
      recent.forEach((row, i) => {
        console.log(`${i+1}. ${row.orderId} - ${row.status} - ₦${row.amount} - ${row.created_at}`);
      });
    }
    conn.release();
  } catch (err) {
    console.error('Database error:', err.message);
  }
})();