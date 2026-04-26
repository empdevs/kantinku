const pool = require('../config/db');

// ─────────────────────────────────────────────────────────────────
// Helper: Generate order_number format ORD-YYYYMMDD-NNN
// ─────────────────────────────────────────────────────────────────
const generateOrderNumber = async () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const prefix = `ORD-${dateStr}-`;

  const [rows] = await pool.query(
    `SELECT order_number FROM orders
     WHERE order_number LIKE ?
     ORDER BY order_number DESC LIMIT 1`,
    [`${prefix}%`]);

  let seq = 1;
  if (rows.length > 0 && rows[0].order_number) {
    const lastSeq = parseInt(rows[0].order_number.split('-').pop(), 10);
    seq = lastSeq + 1;
  }
  return `${prefix}${String(seq).padStart(3, '0')}`;
};

// ─────────────────────────────────────────────────────────────────
// Helper: Kirim notifikasi ke customer
// ─────────────────────────────────────────────────────────────────
const notifyCustomer = async (customerId, orderId, message) => {
  try {
    await pool.query(
      'INSERT INTO notifications (user_id, order_id, message) VALUES (?, ?, ?)',
      [customerId, orderId, message]);
  } catch (e) {
    console.error('Notification error:', e.message);
  }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/merchant/kedai
// ─────────────────────────────────────────────────────────────────
const getMyKedai = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT k.*, ka.name AS kantin_name FROM kedai k
       JOIN kantin_areas ka ON ka.id = k.kantin_area_id
       WHERE k.merchant_id = ?`, [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// POST /api/merchant/kedai
// ─────────────────────────────────────────────────────────────────
const createKedai = async (req, res) => {
  const { kantin_area_id, name, description, open_time, close_time, image_url } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO kedai (merchant_id, kantin_area_id, name, description, open_time, close_time, image_url) VALUES (?,?,?,?,?,?,?)',
      [req.user.id, kantin_area_id, name, description, open_time || '07:00', close_time || '17:00', image_url || null]);
    res.status(201).json({ id: result.insertId, message: 'Kedai berhasil dibuat, menunggu verifikasi admin' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// PUT /api/merchant/kedai/:id
// ─────────────────────────────────────────────────────────────────
const updateKedai = async (req, res) => {
  const { name, description, open_time, close_time, image_url, is_active } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT id FROM kedai WHERE id = ? AND merchant_id = ?', [req.params.id, req.user.id]);
    if (rows.length === 0) return res.status(403).json({ message: 'Anda bukan pemilik kedai ini' });
    await pool.query(
      'UPDATE kedai SET name=?, description=?, open_time=?, close_time=?, image_url=?, is_active=? WHERE id=?',
      [name, description, open_time, close_time, image_url, is_active, req.params.id]);
    res.json({ message: 'Kedai berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/merchant/menu
// ─────────────────────────────────────────────────────────────────
const getMenu = async (req, res) => {
  try {
    const [kedai] = await pool.query('SELECT id FROM kedai WHERE merchant_id = ?', [req.user.id]);
    if (kedai.length === 0) return res.json([]);
    const ids = kedai.map(k => k.id).join(',');
    const [rows] = await pool.query(`SELECT * FROM menu_items WHERE kedai_id IN (${ids})`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/merchant/menu
const createMenu = async (req, res) => {
  const { kedai_id, name, description, price, category, image_url } = req.body;
  try {
    const [kedai] = await pool.query(
      'SELECT id FROM kedai WHERE id = ? AND merchant_id = ?', [kedai_id, req.user.id]);
    if (kedai.length === 0) return res.status(403).json({ message: 'Tidak bisa menambah menu ke kedai orang lain' });
    const [result] = await pool.query(
      'INSERT INTO menu_items (kedai_id, name, description, price, category, image_url) VALUES (?,?,?,?,?,?)',
      [kedai_id, name, description, price, category, image_url || null]);
    res.status(201).json({ id: result.insertId, message: 'Menu berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/merchant/menu/:id
const updateMenu = async (req, res) => {
  const { name, description, price, category, image_url, is_available } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT m.id FROM menu_items m JOIN kedai k ON k.id = m.kedai_id WHERE m.id = ? AND k.merchant_id = ?',
      [req.params.id, req.user.id]);
    if (rows.length === 0) return res.status(403).json({ message: 'Menu tidak ditemukan atau bukan milik Anda' });
    await pool.query(
      'UPDATE menu_items SET name=?, description=?, price=?, category=?, image_url=?, is_available=? WHERE id=?',
      [name, description, price, category, image_url, is_available, req.params.id]);
    res.json({ message: 'Menu berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/merchant/menu/:id
const deleteMenu = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT m.id FROM menu_items m JOIN kedai k ON k.id = m.kedai_id WHERE m.id = ? AND k.merchant_id = ?',
      [req.params.id, req.user.id]);
    if (rows.length === 0) return res.status(403).json({ message: 'Menu tidak ditemukan atau bukan milik Anda' });
    await pool.query('DELETE FROM menu_items WHERE id = ?', [req.params.id]);
    res.json({ message: 'Menu berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/merchant/orders
// ─────────────────────────────────────────────────────────────────
const getOrders = async (req, res) => {
  try {
    const [kedai] = await pool.query('SELECT id FROM kedai WHERE merchant_id = ?', [req.user.id]);
    if (kedai.length === 0) return res.json([]);
    
    const ids = kedai.map(k => k.id);
    // Gunakan placeholder (?) untuk keamanan dan konsistensi tipe data
    const [rows] = await pool.query(`
      SELECT o.*, u.name AS customer_name, u.phone AS customer_phone
      FROM orders o JOIN users u ON u.id = o.customer_id
      WHERE o.kedai_id IN (?)
      ORDER BY o.created_at DESC`, [ids]);

    for (const order of rows) {
      const [items] = await pool.query(
        'SELECT oi.*, m.name AS menu_name FROM order_items oi JOIN menu_items m ON m.id = oi.menu_item_id WHERE oi.order_id = ?',
        [order.id]);
      order.items = items;
    }
    res.json(rows);
  } catch (err) {
    console.error('getOrders error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// PUT /api/merchant/orders/:id/status
// ─────────────────────────────────────────────────────────────────
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['diterima', 'diproses', 'siap_diambil', 'selesai', 'ditolak'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Status tidak valid' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT o.id, o.customer_id, o.order_code, o.status AS current_status
       FROM orders o JOIN kedai k ON k.id = o.kedai_id
       WHERE o.id = ? AND k.merchant_id = ?`,
      [req.params.id, req.user.id]);
    if (rows.length === 0) return res.status(403).json({ message: 'Order tidak ditemukan' });

    const order = rows[0];
    const allowedTransitions = {
      pending:      ['diterima', 'ditolak'],
      diterima:     ['diproses', 'ditolak'],
      diproses:     ['siap_diambil'],
      siap_diambil: ['selesai'],
    };
    if (!allowedTransitions[order.current_status]?.includes(status)) {
      return res.status(400).json({
        message: `Tidak bisa mengubah status dari "${order.current_status}" ke "${status}"`
      });
    }

    let orderNumber = null;
    if (status === 'diterima') {
      orderNumber = await generateOrderNumber();
      await pool.query('UPDATE orders SET status = ?, order_number = ? WHERE id = ?',
        [status, orderNumber, req.params.id]);
    } else {
      await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    }

    const notifMessages = {
      diterima:     `✅ Pesanan ${order.order_code} diterima! Nomor: ${orderNumber}`,
      diproses:     `👨‍🍳 Pesanan ${order.order_code} sedang diproses`,
      siap_diambil: `🎯 Pesanan ${order.order_code} SIAP DIAMBIL!`,
      selesai:      `✅ Pesanan ${order.order_code} selesai. Terima kasih!`,
      ditolak:      `❌ Maaf, pesanan ${order.order_code} ditolak oleh kedai`,
    };
    await notifyCustomer(order.customer_id, req.params.id, notifMessages[status]);

    res.json({ message: 'Status order berhasil diperbarui', order_number: orderNumber, status });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/merchant/stats  (MySQL-compatible queries)
// ─────────────────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [kedai] = await pool.query('SELECT id FROM kedai WHERE merchant_id = ?', [req.user.id]);
    if (kedai.length === 0) return res.json({ today: 0, week: 0, month: 0, revenue: 0, pending: 0 });
    
    const ids = kedai.map(k => k.id);

    const [[{ today }]]   = await pool.query(
      `SELECT COUNT(*) AS today FROM orders WHERE kedai_id IN (?) AND DATE(created_at) = CURDATE()`, [ids]);
    const [[{ week }]]    = await pool.query(
      `SELECT COUNT(*) AS week FROM orders WHERE kedai_id IN (?) AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`, [ids]);
    const [[{ month }]]   = await pool.query(
      `SELECT COUNT(*) AS month FROM orders WHERE kedai_id IN (?) AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())`, [ids]);
    const [[{ revenue }]] = await pool.query(
      `SELECT COALESCE(SUM(total_price),0) AS revenue FROM orders WHERE kedai_id IN (?) AND status='selesai'`, [ids]);
    const [[{ pending }]] = await pool.query(
      `SELECT COUNT(*) AS pending FROM orders WHERE kedai_id IN (?) AND status='pending'`, [ids]);

    res.json({ today, week, month, revenue, pending });
  } catch (err) {
    console.error('getStats error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/merchant/reviews
// Pemilik kedai melihat ulasan untuk kedainya
// ─────────────────────────────────────────────────────────────────
const getMyReviews = async (req, res) => {
  try {
    const [kedai] = await pool.query('SELECT id FROM kedai WHERE merchant_id = ?', [req.user.id]);
    if (kedai.length === 0) return res.json([]);
    const ids = kedai.map(k => k.id).join(',');

    const [rows] = await pool.query(`
      SELECT
        uk.id, uk.kedai_id, uk.rating, uk.komentar, uk.created_at,
        u.name AS customer_name,
        k.name AS kedai_name,
        CASE WHEN uk.menu_item_id IS NOT NULL THEN m.name ELSE NULL END AS menu_name,
        bk.id AS balasan_id, bk.balasan AS balasan_kedai, bk.created_at AS balasan_at
      FROM ulasan_kedai uk
      JOIN users u ON u.id = uk.customer_id
      JOIN kedai k ON k.id = uk.kedai_id
      LEFT JOIN menu_items m ON m.id = uk.menu_item_id
      LEFT JOIN balasan_kedai bk ON bk.ulasan_kedai_id = uk.id
      WHERE uk.kedai_id IN (${ids})
      ORDER BY uk.created_at DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// POST /api/merchant/reviews/:id/reply
// Pemilik kedai membalas ulasan (1 balasan per ulasan)
// ─────────────────────────────────────────────────────────────────
const replyReview = async (req, res) => {
  const { balasan } = req.body;
  const ulasan_kedai_id = req.params.id;

  if (!balasan?.trim()) {
    return res.status(400).json({ message: 'Isi balasan tidak boleh kosong' });
  }

  try {
    // Verifikasi ulasan milik kedai si merchant
    const [ul] = await pool.query(`
      SELECT uk.id FROM ulasan_kedai uk
      JOIN kedai k ON k.id = uk.kedai_id
      WHERE uk.id = ? AND k.merchant_id = ?`, [ulasan_kedai_id, req.user.id]);
    if (ul.length === 0) return res.status(403).json({ message: 'Ulasan tidak ditemukan atau bukan milik kedai Anda' });

    const [existing] = await pool.query('SELECT id FROM balasan_kedai WHERE ulasan_kedai_id = ?', [ulasan_kedai_id]);
    if (existing.length > 0) {
      await pool.query('UPDATE balasan_kedai SET balasan = ?, merchant_id = ? WHERE ulasan_kedai_id = ?',
        [balasan.trim(), req.user.id, ulasan_kedai_id]);
    } else {
      await pool.query('INSERT INTO balasan_kedai (ulasan_kedai_id, merchant_id, balasan) VALUES (?, ?, ?)',
        [ulasan_kedai_id, req.user.id, balasan.trim()]);
    }
    res.json({ message: 'Balasan berhasil dikirim' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getMyKedai, createKedai, updateKedai,
  getMenu, createMenu, updateMenu, deleteMenu,
  getOrders, updateOrderStatus, getStats,
  getMyReviews, replyReview
};
