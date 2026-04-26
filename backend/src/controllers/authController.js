const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

const register = async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  console.log('--- Attempting Registration ---');
  console.log('Data:', { name, email, role, phone });

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const allowedRoles = ['customer', 'merchant'];
  const userRole = allowedRoles.includes(role) ? role : 'customer';

  try {
    // 1. Check if email exists
    console.log('Checking existing email...');
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing.length > 0) {
      console.log('Email already exists');
      return res.status(409).json({ message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' });
    }

    // 2. Hash password
    const hashed = await bcrypt.hash(password, 10);

    // 3. Insert user
    console.log('Inserting user into DB...');
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      [name, cleanEmail, hashed, userRole, phone || null]
    );

    const userId = result.insertId;
    console.log('User created with ID:', userId);

    // 4. Generate Token
    const token = jwt.sign(
      { id: userId, email: cleanEmail, role: userRole, name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(201).json({
      message: 'Registrasi berhasil',
      token,
      user: { id: userId, name, email: cleanEmail, role: userRole, phone }
    });
  } catch (err) {
    console.error('CRITICAL REGISTRATION ERROR:', err);
    res.status(500).json({
      message: 'Gagal mendaftar. Terjadi kesalahan pada server database.',
      error: err.message,
      code: err.code
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email dan password wajib diisi' });

  const cleanEmail = email.toLowerCase().trim();

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (rows.length === 0) return res.status(401).json({ message: 'Email atau password salah' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Email atau password salah' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({ message: 'Login berhasil', token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, avatar_url: user.avatar_url } });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error saat login', error: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, role, phone, avatar_url, created_at FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { register, login, getMe };
