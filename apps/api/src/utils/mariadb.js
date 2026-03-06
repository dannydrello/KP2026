import * as mariadb from 'mariadb';

const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kp2026',
  connectionLimit: 5
});

export default pool;
