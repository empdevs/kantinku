/**
 * KantinKu Migration Script
 * Jalankan: node migrate.js
 *
 * Menambah semua tabel baru dan memperbaiki tabel lama agar
 * kompatibel dengan fitur ulasan website + ulasan kedai terbaru.
 */
const sqlite3 = require('sqlite3').verbose();
const path    = require('path');

const dbPath = path.resolve(__dirname, 'kantinku.sqlite');
const db     = new sqlite3.Database(dbPath);

const run = (sql) =>
  new Promise((resolve, reject) =>
    db.run(sql, (err) => (err ? reject(err) : resolve()))
  );

const get = (sql) =>
  new Promise((resolve, reject) =>
    db.get(sql, (err, row) => (err ? reject(err) : resolve(row)))
  );

const columnExists = async (table, column) => {
  const row = await get(`PRAGMA table_info(${table})`).catch(() => null);
  // Gunakan all() bukan get() untuk PRAGMA
  return new Promise((resolve) => {
    db.all(`PRAGMA table_info(${table})`, (err, rows) => {
      if (err || !rows) return resolve(false);
      resolve(rows.some((r) => r.name === column));
    });
  });
};

const tableExists = (table) =>
  new Promise((resolve) => {
    db.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
      [table],
      (err, row) => resolve(!!row)
    );
  });

async function migrate() {
  console.log('🔄 Running KantinKu migrations...\n');

  // ── PRAGMA ───────────────────────────────────────────────────────
  await run('PRAGMA foreign_keys = ON');

  // ── 1. orders.order_number ───────────────────────────────────────
  if (!(await columnExists('orders', 'order_number'))) {
    await run('ALTER TABLE orders ADD COLUMN order_number TEXT');
    console.log('✅ orders.order_number added');
  } else {
    console.log('ℹ️  orders.order_number already exists');
  }

  // ── 2. reviews.menu_item_id ──────────────────────────────────────
  if ((await tableExists('reviews')) && !(await columnExists('reviews', 'menu_item_id'))) {
    await run('ALTER TABLE reviews ADD COLUMN menu_item_id INTEGER REFERENCES menu_items(id)');
    console.log('✅ reviews.menu_item_id added');
  }

  // ── 3. notifications ─────────────────────────────────────────────
  if (!(await tableExists('notifications'))) {
    await run(`
      CREATE TABLE notifications (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id    INTEGER NOT NULL,
        order_id   INTEGER,
        message    TEXT    NOT NULL,
        is_read    INTEGER DEFAULT 0,
        created_at TEXT    DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ notifications table created');
  } else {
    console.log('ℹ️  notifications already exists');
  }

  // ── 4. ulasan_website (baru: no_telp, hapus nim/kelas) ──────────
  //    Cek apakah tabel lama ada dengan kolom nim/kelas
  const hasOldWebsiteReviews = await tableExists('website_reviews');
  const hasNewUlasanWebsite  = await tableExists('ulasan_website');

  if (!hasNewUlasanWebsite) {
    await run(`
      CREATE TABLE ulasan_website (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        nama       TEXT NOT NULL,
        no_telp    TEXT NOT NULL,
        keterangan TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now','localtime'))
      )
    `);
    console.log('✅ ulasan_website table created');

    // Migrasi data lama dari website_reviews (jika ada)
    if (hasOldWebsiteReviews) {
      await run(`
        INSERT INTO ulasan_website (nama, no_telp, keterangan, created_at)
        SELECT nama, COALESCE(nim, '-'), keterangan, created_at
        FROM website_reviews
      `);
      console.log('✅ Migrated old website_reviews data → ulasan_website');
    }
  } else {
    console.log('ℹ️  ulasan_website already exists');
  }

  // ── 5. balasan_admin ─────────────────────────────────────────────
  if (!(await tableExists('balasan_admin'))) {
    await run(`
      CREATE TABLE balasan_admin (
        id                INTEGER PRIMARY KEY AUTOINCREMENT,
        ulasan_website_id INTEGER NOT NULL UNIQUE,
        admin_id          INTEGER NOT NULL,
        balasan           TEXT    NOT NULL,
        created_at        TEXT    DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (ulasan_website_id) REFERENCES ulasan_website(id) ON DELETE CASCADE,
        FOREIGN KEY (admin_id)          REFERENCES users(id)           ON DELETE CASCADE
      )
    `);
    console.log('✅ balasan_admin table created');
  } else {
    console.log('ℹ️  balasan_admin already exists');
  }

  // ── 6. ulasan_kedai ──────────────────────────────────────────────
  if (!(await tableExists('ulasan_kedai'))) {
    await run(`
      CREATE TABLE ulasan_kedai (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id  INTEGER NOT NULL,
        kedai_id     INTEGER NOT NULL,
        order_id     INTEGER NOT NULL,
        menu_item_id INTEGER,
        rating       INTEGER CHECK (rating BETWEEN 1 AND 5),
        komentar     TEXT    NOT NULL,
        created_at   TEXT    DEFAULT (datetime('now','localtime')),
        UNIQUE (order_id, kedai_id),
        FOREIGN KEY (customer_id)  REFERENCES users(id)       ON DELETE CASCADE,
        FOREIGN KEY (kedai_id)     REFERENCES kedai(id)       ON DELETE CASCADE,
        FOREIGN KEY (order_id)     REFERENCES orders(id)      ON DELETE CASCADE,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)  ON DELETE SET NULL
      )
    `);
    console.log('✅ ulasan_kedai table created');
  } else {
    console.log('ℹ️  ulasan_kedai already exists');
  }

  // ── 7. balasan_kedai ─────────────────────────────────────────────
  if (!(await tableExists('balasan_kedai'))) {
    await run(`
      CREATE TABLE balasan_kedai (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        ulasan_kedai_id INTEGER NOT NULL UNIQUE,
        merchant_id     INTEGER NOT NULL,
        balasan         TEXT    NOT NULL,
        created_at      TEXT    DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (ulasan_kedai_id) REFERENCES ulasan_kedai(id) ON DELETE CASCADE,
        FOREIGN KEY (merchant_id)     REFERENCES users(id)        ON DELETE CASCADE
      )
    `);
    console.log('✅ balasan_kedai table created');
  } else {
    console.log('ℹ️  balasan_kedai already exists');
  }

  console.log('\n✨ All migrations completed successfully!');
  db.close();
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  db.close();
  process.exit(1);
});
