const pool = require('../config/db');

// ─────────────────────────────────────────────────────────────────
// PUBLIC — GET /api/kantin
// ─────────────────────────────────────────────────────────────────
const getKantinAreas = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ka.*, COUNT(k.id) AS kedai_count
      FROM kantin_areas ka
      LEFT JOIN kedai k ON k.kantin_area_id = ka.id AND k.is_active = 1 AND k.is_verified = 1
      GROUP BY ka.id`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// PUBLIC — GET /api/kedai
// ─────────────────────────────────────────────────────────────────
const getKedai = async (req, res) => {
  const { kantin_area_id, search } = req.query;
  try {
    let sql = `
      SELECT DISTINCT k.*, ka.name AS kantin_name, u.name AS merchant_name
      FROM kedai k
      LEFT JOIN kantin_areas ka ON ka.id = k.kantin_area_id
      LEFT JOIN users u ON u.id = k.merchant_id
      LEFT JOIN menu_items mi ON mi.kedai_id = k.id
      WHERE k.is_active = 1 AND k.is_verified = 1`;
    
    const params = [];
    if (kantin_area_id) { 
      sql += ' AND k.kantin_area_id = ?'; 
      params.push(kantin_area_id); 
    }
    
    if (search) { 
      sql += ' AND (k.name LIKE ? OR mi.name LIKE ?)'; 
      params.push(`%${search}%`, `%${search}%`); 
    }
    
    sql += ' ORDER BY k.rating DESC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// PUBLIC — GET /api/kedai/:id
// Termasuk menu + ulasan_kedai + balasan_kedai
// ─────────────────────────────────────────────────────────────────
const getKedaiDetail = async (req, res) => {
  const { id } = req.params;
  console.log(`[GET] /api/kedai/${id} - Fetching kedai detail...`);

  try {
    // 1. Ambil data kedai
    const [kedaiRows] = await pool.query(`
      SELECT k.*, ka.name AS kantin_name, u.name AS merchant_name
      FROM kedai k
      LEFT JOIN kantin_areas ka ON ka.id = k.kantin_area_id
      LEFT JOIN users u ON u.id = k.merchant_id
      WHERE k.id = ?`, [id]);

    if (kedaiRows.length === 0) {
      console.log(`[GET] /api/kedai/${id} - Kedai not found`);
      return res.status(404).json({ message: `Kedai dengan ID ${id} tidak ditemukan.` });
    }

    const kedaiId = parseInt(id);
    const kedai = kedaiRows[0];
    console.log(`[GET] /api/kedai/${id} - Kedai found: ${kedai.name}`);

    // 2. Ambil data menu (robust fetch)
    let menu = [];
    try {
      const [menuRows] = await pool.query(
        'SELECT * FROM menu_items WHERE kedai_id = ? AND is_available = 1 ORDER BY category',
        [kedaiId]);
      menu = menuRows;

      if (menu.length === 0) {
        console.log(`[GET] /api/kedai/${id} - No available menu, trying to fetch all menu items...`);
        const [allMenuRows] = await pool.query(
          'SELECT * FROM menu_items WHERE kedai_id = ? ORDER BY category',
          [kedaiId]);
        menu = allMenuRows;
      }
      console.log(`[GET] /api/kedai/${id} - Menu items found: ${menu.length}`);
    } catch (menuErr) {
      console.error(`[GET] /api/kedai/${id} - Error fetching menu:`, menuErr.message);
    }

    // 3. Ambil data ulasan (robust fetch)
    let reviews = [];
    try {
      const [reviewRows] = await pool.query(`
        SELECT
          uk.id, uk.rating, uk.komentar, uk.created_at,
          COALESCE(u.name, uk.nama_guest, 'Pelanggan') AS customer_name,
          uk.nama_guest, uk.no_telp_guest,
          CASE WHEN uk.menu_item_id IS NOT NULL THEN m.name ELSE NULL END AS menu_name,
          bk.balasan AS balasan_kedai, bk.created_at AS balasan_at
        FROM ulasan_kedai uk
        LEFT JOIN users u ON u.id = uk.customer_id
        LEFT JOIN menu_items m ON m.id = uk.menu_item_id
        LEFT JOIN balasan_kedai bk ON bk.ulasan_kedai_id = uk.id
        WHERE uk.kedai_id = ?
        ORDER BY uk.created_at DESC
        LIMIT 20`, [kedaiId]);
      reviews = reviewRows;
      console.log(`[GET] /api/kedai/${id} - Reviews found: ${reviews.length}`);
    } catch (revErr) {
      console.error(`[GET] /api/kedai/${id} - Error fetching reviews:`, revErr.message);
    }

    res.json({ ...kedai, menu, reviews });
  } catch (err) {
    console.error(`[GET] /api/kedai/${id} - Critical Error:`, err);
    res.status(500).json({
      message: 'Gagal memuat detail kedai.',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// ─────────────────────────────────────────────────────────────────
// PROTECTED — POST /api/orders
// ─────────────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  const { kedai_id, items, pickup_time, notes } = req.body;
  if (!kedai_id || !items?.length || !pickup_time) {
    return res.status(400).json({ message: 'Data order tidak lengkap' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [kedai] = await conn.query(
      'SELECT id FROM kedai WHERE id = ? AND is_active = 1 AND is_verified = 1', [kedai_id]);
    if (kedai.length === 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Kedai tidak tersedia' });
    }

    let total = 0;
    const itemsWithPrice = [];
    for (const item of items) {
      const [menu] = await conn.query(
        'SELECT id, price FROM menu_items WHERE id = ? AND kedai_id = ? AND is_available = 1',
        [item.menu_item_id, kedai_id]);
      if (menu.length === 0) {
        await conn.rollback();
        return res.status(400).json({ message: `Menu ID ${item.menu_item_id} tidak tersedia` });
      }
      const subtotal = menu[0].price * item.quantity;
      total += subtotal;
      itemsWithPrice.push({ menu_item_id: item.menu_item_id, quantity: item.quantity, price: menu[0].price, subtotal });
    }

    const order_code = 'KTK' + Date.now().toString().slice(-8).toUpperCase();

    const [orderResult] = await conn.query(
      `INSERT INTO orders (customer_id, kedai_id, order_code, status, pickup_time, total_price, notes)
       VALUES (?, ?, ?, 'pending', ?, ?, ?)`,
      [req.user.id, kedai_id, order_code, pickup_time, total, notes || null]);

    for (const item of itemsWithPrice) {
      await conn.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?)',
        [orderResult.insertId, item.menu_item_id, item.quantity, item.price, item.subtotal]);
    }

    await conn.query(
      'INSERT INTO notifications (user_id, order_id, message) VALUES (?, ?, ?)',
      [req.user.id, orderResult.insertId,
      `⏳ Pesanan #${order_code} dikirim — menunggu konfirmasi kedai`]);

    await conn.commit();
    res.status(201).json({
      id: orderResult.insertId,
      order_code,
      total_price: total,
      message: 'Pesanan berhasil dibuat, menunggu konfirmasi kedai'
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    conn.release();
  }
};

// ─────────────────────────────────────────────────────────────────
// PROTECTED — GET /api/orders/my
// ─────────────────────────────────────────────────────────────────
const getMyOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.*, k.name AS kedai_name, ka.name AS kantin_name
      FROM orders o
      JOIN kedai k ON k.id = o.kedai_id
      JOIN kantin_areas ka ON ka.id = k.kantin_area_id
      WHERE o.customer_id = ?
      ORDER BY o.created_at DESC`, [req.user.id]);

    for (const order of rows) {
      const [items] = await pool.query(
        `SELECT oi.*, m.name AS menu_name, m.image_url
         FROM order_items oi JOIN menu_items m ON m.id = oi.menu_item_id
         WHERE oi.order_id = ?`, [order.id]);
      order.items = items;
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// PROTECTED — GET /api/orders/:id
// ─────────────────────────────────────────────────────────────────
const getOrderDetail = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.*, k.name AS kedai_name, ka.name AS kantin_name, k.image_url AS kedai_image
      FROM orders o
      JOIN kedai k ON k.id = o.kedai_id
      JOIN kantin_areas ka ON ka.id = k.kantin_area_id
      WHERE o.id = ? AND o.customer_id = ?`, [req.params.id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Order tidak ditemukan' });

    const [items] = await pool.query(
      `SELECT oi.*, m.name AS menu_name, m.image_url
       FROM order_items oi JOIN menu_items m ON m.id = oi.menu_item_id
       WHERE oi.order_id = ?`, [rows[0].id]);

    res.json({ ...rows[0], items });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// PROTECTED — POST /api/reviews  (Ulasan kedai setelah login)
// Data user diambil otomatis dari token JWT (req.user.id)
// ─────────────────────────────────────────────────────────────────
const createReview = async (req, res) => {
  const { kedai_id, order_id, menu_item_id, rating, komentar } = req.body;
  if (!kedai_id || !order_id || !komentar?.trim()) {
    return res.status(400).json({ message: 'kedai_id, order_id, dan komentar wajib diisi' });
  }
  if (rating !== undefined && rating !== null && (rating < 1 || rating > 5)) {
    return res.status(400).json({ message: 'Rating harus antara 1-5' });
  }
  try {
    const [order] = await pool.query(
      `SELECT id FROM orders WHERE id = ? AND customer_id = ? AND status = 'selesai'`,
      [order_id, req.user.id]);
    if (order.length === 0) return res.status(400).json({ message: 'Pesanan belum selesai atau bukan milik Anda' });

    const [existing] = await pool.query(
      'SELECT id FROM ulasan_kedai WHERE order_id = ? AND kedai_id = ?', [order_id, kedai_id]);
    if (existing.length > 0) return res.status(400).json({ message: 'Anda sudah memberikan ulasan untuk pesanan ini' });

    await pool.query(
      `INSERT INTO ulasan_kedai (customer_id, kedai_id, order_id, menu_item_id, rating, komentar)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, kedai_id, order_id, menu_item_id || null, rating || null, komentar]);

    // Update rata-rata rating kedai
    if (rating) {
      await pool.query(`
        UPDATE kedai SET
          rating       = (SELECT ROUND(AVG(rating), 2) FROM ulasan_kedai WHERE kedai_id = ? AND rating IS NOT NULL),
          review_count = (SELECT COUNT(*) FROM ulasan_kedai WHERE kedai_id = ?)
        WHERE id = ?`, [kedai_id, kedai_id, kedai_id]);
    }
    res.status(201).json({ message: 'Ulasan berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// PUBLIC — POST /api/kedai/:id/reviews (Ulasan tanpa login)
// ─────────────────────────────────────────────────────────────────
const createPublicReview = async (req, res) => {
  const { id } = req.params;
  const { nama, no_telp, rating, komentar } = req.body;

  if (!nama?.trim() || !no_telp?.trim() || !komentar?.trim()) {
    return res.status(400).json({ message: 'Nama, No Telp, dan Komentar wajib diisi' });
  }

  try {
    const [kedai] = await pool.query('SELECT id FROM kedai WHERE id = ?', [id]);
    if (kedai.length === 0) return res.status(404).json({ message: 'Kedai tidak ditemukan' });

    await pool.query(
      `INSERT INTO ulasan_kedai (kedai_id, nama_guest, no_telp_guest, rating, komentar)
       VALUES (?, ?, ?, ?, ?)`,
      [id, nama.trim(), no_telp.trim(), rating || null, komentar.trim()]);

    // Update rata-rata rating kedai
    if (rating) {
      await pool.query(`
        UPDATE kedai SET
          rating       = (SELECT ROUND(AVG(rating), 2) FROM ulasan_kedai WHERE kedai_id = ? AND rating IS NOT NULL),
          review_count = (SELECT COUNT(*) FROM ulasan_kedai WHERE kedai_id = ?)
        WHERE id = ?`, [id, id, id]);
    }

    res.status(201).json({ message: 'Ulasan berhasil dikirim. Terima kasih!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// PUBLIC — POST /api/website-reviews  (Ulasan tanpa login)
// Field: nama, no_telp, keterangan  (NIM & Kelas sudah dihapus)
// ─────────────────────────────────────────────────────────────────
const createWebsiteReview = async (req, res) => {
  const { nama, no_telp, keterangan } = req.body;
  if (!nama?.trim() || !no_telp?.trim() || !keterangan?.trim()) {
    return res.status(400).json({ message: 'Nama, nomor telepon, dan keterangan wajib diisi' });
  }
  // Validasi format no_telp (minimal 9 digit)
  if (!/^[\d\s\+\-]{9,20}$/.test(no_telp.trim())) {
    return res.status(400).json({ message: 'Format nomor telepon tidak valid' });
  }
  try {
    await pool.query(
      'INSERT INTO ulasan_website (nama, no_telp, keterangan) VALUES (?, ?, ?)',
      [nama.trim(), no_telp.trim(), keterangan.trim()]);
    res.status(201).json({ message: 'Ulasan berhasil dikirim. Terima kasih!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// PUBLIC — GET /api/website-reviews  (Tampilkan ulasan + balasan admin)
// ─────────────────────────────────────────────────────────────────
const getWebsiteReviews = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        uw.id, uw.nama, uw.no_telp, uw.keterangan, uw.created_at,
        ba.balasan AS balasan_admin, ba.created_at AS balasan_at,
        u.name AS admin_name
      FROM ulasan_website uw
      LEFT JOIN balasan_admin ba ON ba.ulasan_website_id = uw.id
      LEFT JOIN users u ON u.id = ba.admin_id
      ORDER BY uw.created_at DESC
      LIMIT 50`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// PROTECTED — GET /api/notifications
// ─────────────────────────────────────────────────────────────────
const getNotifications = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT n.*, o.order_number, o.order_code
       FROM notifications n
       LEFT JOIN orders o ON o.id = n.order_id
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC LIMIT 30`, [req.user.id]);
    const [[{ count }]] = await pool.query(
      'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0', [req.user.id]);
    res.json({ notifications: rows, unread_count: count });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PROTECTED — PUT /api/notifications/read-all
const markAllNotificationsRead = async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Semua notifikasi sudah dibaca' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getKantinAreas, getKedai, getKedaiDetail,
  createOrder, getMyOrders, getOrderDetail,
  createReview, createPublicReview, createWebsiteReview, getWebsiteReviews,
  getNotifications, markAllNotificationsRead
};
