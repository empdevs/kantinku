const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * MySQL connection pool via mysql2/promise.
 * Semua controller menggunakan: const [rows] = await pool.query(sql, params)
 */
const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT || '3306'),
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'kantinku',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+07:00',
});

// Test koneksi saat startup
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL (XAMPP) connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  });

module.exports = pool;
