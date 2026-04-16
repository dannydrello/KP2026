import * as mariadb from 'mariadb';

const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Dominion7.kitchenpastries',
  database: process.env.DB_NAME || 'u819626310_kp2026',
  connectionLimit: 5
});

export default pool;
