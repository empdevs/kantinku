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
    console.error('\n❌ ERROR: Gagal terhubung ke MySQL!');
    console.error('Pesan Error:', err.message);
    console.error('\nLangkah Perbaikan:');
    console.error('1. Pastikan XAMPP (MySQL) sudah AKTIF.');
    console.error('2. Pastikan database "kantinku" sudah DIBUAT di phpMyAdmin.');
    console.error('3. Periksa file "backend/.env" untuk kecocokan USER/PASSWORD.');
    console.error('--------------------------------------------------\n');
    process.exit(1);
  });

module.exports = pool;
