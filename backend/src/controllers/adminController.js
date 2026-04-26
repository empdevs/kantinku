const pool = require('../config/db');

// ─────────────────────────────────────────────────────────────────
// GET /api/admin/dashboard
// ─────────────────────────────────────────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const [[{ totalUsers }]]   = await pool.query('SELECT COUNT(*) AS totalUsers FROM users WHERE role != "admin"');
    const [[{ totalKedai }]]   = await pool.query('SELECT COUNT(*) AS totalKedai FROM kedai');
    const [[{ activeKedai }]]  = await pool.query('SELECT COUNT(*) AS activeKedai FROM kedai WHERE is_active = 1 AND is_verified = 1');
    const [[{ totalOrders }]]  = await pool.query('SELECT COUNT(*) AS totalOrders FROM orders');
    const [[{ totalRevenue }]] = await pool.query('SELECT COALESCE(SUM(total_price), 0) AS totalRevenue FROM orders WHERE status = "selesai"');
    const [[{ pendingKedai }]] = await pool.query('SELECT COUNT(*) AS pendingKedai FROM kedai WHERE is_verified = 0');
    const [[{ totalUlasan }]]  = await pool.query('SELECT COUNT(*) AS totalUlasan FROM ulasan_website');

    const [areaStats] = await pool.query(`
      SELECT ka.name, COUNT(o.id) AS order_count
      FROM kantin_areas ka
      LEFT JOIN kedai k ON k.kantin_area_id = ka.id
      LEFT JOIN orders o ON o.kedai_id = k.id
      GROUP BY ka.id, ka.name ORDER BY order_count DESC`);

    const [recentOrders] = await pool.query(`
      SELECT o.*, u.name AS customer_name, k.name AS kedai_name, ka.name AS kantin_name
      FROM orders o
      JOIN users u ON u.id = o.customer_id
      JOIN kedai k ON k.id = o.kedai_id
      JOIN kantin_areas ka ON ka.id = k.kantin_area_id
      ORDER BY o.created_at DESC LIMIT 10`);

    res.json({ totalUsers, totalKedai, activeKedai, totalOrders, totalRevenue, pendingKedai, totalUlasan, areaStats, recentOrders });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/admin/users
// ─────────────────────────────────────────────────────────────────
const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/admin/users
const createUser = async (req, res) => {
  const bcrypt = require('bcryptjs');
  const { name, email, password, role, phone } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (name, email, password, role, phone) VALUES (?,?,?,?,?)', [name, email, hashed, role, phone]);
    res.status(201).json({ id: result.insertId, name, email, role, phone });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/admin/users/:id
const updateUser = async (req, res) => {
  const { name, email, role, phone } = req.body;
  try {
    await pool.query('UPDATE users SET name=?, email=?, role=?, phone=? WHERE id=?', [name, email, role, phone, req.params.id]);
    res.json({ message: 'User berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id=?', [req.params.id]);
    res.json({ message: 'User berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// KEDAI management
// ─────────────────────────────────────────────────────────────────
const getKedai = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT k.*, u.name AS merchant_name, ka.name AS kantin_name
      FROM kedai k JOIN users u ON u.id = k.merchant_id
      JOIN kantin_areas ka ON ka.id = k.kantin_area_id
      ORDER BY k.created_at DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const verifyKedai = async (req, res) => {
  try {
    await pool.query('UPDATE kedai SET is_verified = 1 WHERE id=?', [req.params.id]);
    res.json({ message: 'Kedai berhasil diverifikasi' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteKedai = async (req, res) => {
  try {
    await pool.query('DELETE FROM kedai WHERE id=?', [req.params.id]);
    res.json({ message: 'Kedai berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// KANTIN AREAS management
// ─────────────────────────────────────────────────────────────────
const getKantin = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ka.*, COUNT(k.id) AS kedai_count
      FROM kantin_areas ka LEFT JOIN kedai k ON k.kantin_area_id = ka.id
      GROUP BY ka.id`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const createKantin = async (req, res) => {
  const { name, description, location_hint } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO kantin_areas (name, description, location_hint) VALUES (?,?,?)', [name, description, location_hint]);
    res.status(201).json({ id: result.insertId, name, description, location_hint });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateKantin = async (req, res) => {
  const { name, description, location_hint } = req.body;
  try {
    await pool.query('UPDATE kantin_areas SET name=?, description=?, location_hint=? WHERE id=?', [name, description, location_hint, req.params.id]);
    res.json({ message: 'Area kantin berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteKantin = async (req, res) => {
  try {
    await pool.query('DELETE FROM kantin_areas WHERE id=?', [req.params.id]);
    res.json({ message: 'Area kantin berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/admin/orders
// ─────────────────────────────────────────────────────────────────
const getOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.*, u.name AS customer_name, k.name AS kedai_name, ka.name AS kantin_name
      FROM orders o JOIN users u ON u.id = o.customer_id
      JOIN kedai k ON k.id = o.kedai_id
      JOIN kantin_areas ka ON ka.id = k.kantin_area_id
      ORDER BY o.created_at DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/admin/website-reviews
// Tampilkan semua ulasan website beserta status balasan
// ─────────────────────────────────────────────────────────────────
const getWebsiteReviews = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        uw.id, uw.nama, uw.no_telp, uw.keterangan, uw.created_at,
        ba.id AS balasan_id, ba.balasan AS balasan_admin, ba.created_at AS balasan_at,
        u.name AS admin_name
      FROM ulasan_website uw
      LEFT JOIN balasan_admin ba ON ba.ulasan_website_id = uw.id
      LEFT JOIN users u ON u.id = ba.admin_id
      ORDER BY uw.created_at DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// POST /api/admin/website-reviews/:id/reply
// Admin membalas ulasan website (1 balasan per ulasan)
// ─────────────────────────────────────────────────────────────────
const replyWebsiteReview = async (req, res) => {
  const { balasan } = req.body;
  const ulasan_website_id = req.params.id;

  if (!balasan?.trim()) {
    return res.status(400).json({ message: 'Isi balasan tidak boleh kosong' });
  }

  try {
    // Cek ulasan ada
    const [ulasan] = await pool.query('SELECT id FROM ulasan_website WHERE id = ?', [ulasan_website_id]);
    if (ulasan.length === 0) return res.status(404).json({ message: 'Ulasan tidak ditemukan' });

    // Cek sudah ada balasan
    const [existing] = await pool.query('SELECT id FROM balasan_admin WHERE ulasan_website_id = ?', [ulasan_website_id]);
    if (existing.length > 0) {
      // Update balasan lama
      await pool.query('UPDATE balasan_admin SET balasan = ?, admin_id = ? WHERE ulasan_website_id = ?',
        [balasan.trim(), req.user.id, ulasan_website_id]);
    } else {
      // Insert balasan baru
      await pool.query('INSERT INTO balasan_admin (ulasan_website_id, admin_id, balasan) VALUES (?, ?, ?)',
        [ulasan_website_id, req.user.id, balasan.trim()]);
    }
    res.json({ message: 'Balasan berhasil dikirim' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/admin/website-reviews/:id/reply
const deleteWebsiteReviewReply = async (req, res) => {
  try {
    await pool.query('DELETE FROM balasan_admin WHERE ulasan_website_id = ?', [req.params.id]);
    res.json({ message: 'Balasan dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getDashboard,
  getUsers, createUser, updateUser, deleteUser,
  getKedai, verifyKedai, deleteKedai,
  getKantin, createKantin, updateKantin, deleteKantin,
  getOrders,
  getWebsiteReviews, replyWebsiteReview, deleteWebsiteReviewReply
};
