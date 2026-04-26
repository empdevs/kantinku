-- ===============================================================
-- KantinKu Database Schema (MySQL)
-- Versi baru: termasuk ulasan website + balasan admin,
--             ulasan kedai + balasan kedai
-- ===============================================================

CREATE DATABASE IF NOT EXISTS kantinku;
USE kantinku;

-- ─────────────────────────────────────────────────────────────────
-- 1. USERS
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(100) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('admin','merchant','customer') NOT NULL DEFAULT 'customer',
  phone       VARCHAR(20),
  avatar_url  VARCHAR(255),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────────
-- 2. KANTIN AREAS
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kantin_areas (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  description    TEXT,
  location_hint  VARCHAR(255),
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────────
-- 3. KEDAI
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kedai (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  merchant_id     INT NOT NULL,
  kantin_area_id  INT NOT NULL,
  name            VARCHAR(100) NOT NULL,
  description     TEXT,
  open_time       TIME NOT NULL DEFAULT '07:00:00',
  close_time      TIME NOT NULL DEFAULT '17:00:00',
  is_active       TINYINT(1) DEFAULT 1,
  is_verified     TINYINT(1) DEFAULT 0,
  rating          DECIMAL(3,2) DEFAULT 0.00,
  review_count    INT DEFAULT 0,
  image_url       VARCHAR(255),
  banner_url      VARCHAR(255),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (merchant_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (kantin_area_id) REFERENCES kantin_areas(id) ON DELETE RESTRICT
);

-- ─────────────────────────────────────────────────────────────────
-- 4. MENU (menu_items)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  kedai_id     INT NOT NULL,
  name         VARCHAR(100) NOT NULL,
  description  TEXT,
  price        DECIMAL(10,2) NOT NULL,
  category     ENUM('makanan','minuman','snack') NOT NULL DEFAULT 'makanan',
  is_available TINYINT(1) DEFAULT 1,
  image_url    VARCHAR(255),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (kedai_id) REFERENCES kedai(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────────────
-- 5. PESANAN (orders + order_items)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  customer_id   INT NOT NULL,
  kedai_id      INT NOT NULL,
  order_code    VARCHAR(20) UNIQUE NOT NULL,
  order_number  VARCHAR(20),
  status        ENUM('pending','diterima','diproses','siap_diambil','selesai','ditolak','dibatalkan') DEFAULT 'pending',
  pickup_time   DATETIME NOT NULL,
  total_price   DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes         TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (kedai_id)    REFERENCES kedai(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  order_id     INT NOT NULL,
  menu_item_id INT NOT NULL,
  quantity     INT NOT NULL DEFAULT 1,
  price        DECIMAL(10,2) NOT NULL,
  subtotal     DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id)     REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT
);

-- ─────────────────────────────────────────────────────────────────
-- 6. NOTIFIKASI
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  order_id   INT,
  message    TEXT NOT NULL,
  is_read    TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────────────────────────
-- 7. ULASAN WEBSITE (publik, tanpa login)
--    Field: nama, no_telp, keterangan
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ulasan_website (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nama       VARCHAR(100) NOT NULL,
  no_telp    VARCHAR(20)  NOT NULL,
  keterangan TEXT         NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────────
-- 8. BALASAN ADMIN (1 balasan per ulasan_website)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS balasan_admin (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  ulasan_website_id INT NOT NULL UNIQUE,   -- 1 balasan per ulasan
  admin_id         INT NOT NULL,
  balasan          TEXT NOT NULL,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ulasan_website_id) REFERENCES ulasan_website(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id)          REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────────────
-- 9. ULASAN KEDAI (user login → review untuk kedai/menu)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ulasan_kedai (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  customer_id  INT NULL,                        -- NULL jika guest
  kedai_id     INT NOT NULL,
  order_id     INT NULL,                        -- NULL jika guest
  nama_guest   VARCHAR(100),                    -- Untuk review tanpa login
  no_telp_guest VARCHAR(20),                     -- Untuk review tanpa login
  menu_item_id INT,                             -- opsional (jika review spesifik menu)
  rating       TINYINT CHECK (rating BETWEEN 1 AND 5),
  komentar     TEXT NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_order_kedai (order_id, kedai_id),  -- 1 ulasan per pesanan per kedai
  FOREIGN KEY (customer_id)  REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (kedai_id)     REFERENCES kedai(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id)     REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────────────────────────
-- 10. BALASAN KEDAI (pemilik kedai membalas ulasan_kedai)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS balasan_kedai (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  ulasan_kedai_id INT NOT NULL UNIQUE,      -- 1 balasan per ulasan
  merchant_id    INT NOT NULL,
  balasan        TEXT NOT NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ulasan_kedai_id) REFERENCES ulasan_kedai(id) ON DELETE CASCADE,
  FOREIGN KEY (merchant_id)     REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────────────
-- SEED DATA
-- ─────────────────────────────────────────────────────────────────

INSERT INTO kantin_areas (name, description, location_hint) VALUES
('Kantin Belakang', 'Kantin di area belakang kampus', 'Gedung Utama Belakang'),
('Kantin Basement',  'Kantin di lantai basement',     'Lantai B1 Gedung Rektorat'),
('Kantin Masjid',    'Kantin dekat masjid kampus',    'Samping Masjid Al-Hikmah'),
('Kantin Cemara',    'Kantin di bawah pohon cemara',  'Taman Cemara'),
('Kantin Utama',     'Kantin pusat kampus',           'Pusat Kampus Lt. 1'),
('Kantin Merah',     'Kantin gedung merah',           'Gedung Merah Fakultas Teknik'),
('Kantin Depan',     'Kantin di depan kampus',        'Pintu Masuk Utama');

-- Password hash untuk semua akun seed = "password123"
INSERT INTO users (name, email, password, role, phone) VALUES
('Super Admin',    'admin@kantinku.id',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin',    '081234567890'),
('Pak Budi',       'budi@kantinku.id',     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'merchant', '081234567891'),
('Bu Sari',        'sari@kantinku.id',     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'merchant', '081234567892'),
('Mas Joko',       'joko@kantinku.id',     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'merchant', '081234567893'),
('Andi Mahasiswa', 'andi@student.ac.id',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer', '081234567894'),
('Siti Mahasiswi', 'siti@student.ac.id',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer', '081234567895');

INSERT INTO kedai (merchant_id, kantin_area_id, name, description, open_time, close_time, is_active, is_verified, rating, review_count, image_url) VALUES
(2, 5, 'Warung Pak Budi',  'Masakan rumahan yang lezat dan terjangkau',               '07:00:00', '16:00:00', 1, 1, 4.5, 24, 'https://picsum.photos/seed/warung1/400/300'),
(3, 1, 'Dapur Bu Sari',    'Masakan Jawa otentik dengan bumbu rempah pilihan',         '08:00:00', '15:00:00', 1, 1, 4.8, 56, 'https://picsum.photos/seed/warung2/400/300'),
(4, 3, 'Mie Ayam Mas Joko','Mie ayam spesial dengan kuah kental',                     '09:00:00', '17:00:00', 1, 1, 4.3, 18, 'https://picsum.photos/seed/warung3/400/300'),
(2, 2, 'Bakso Selera',     'Bakso jumbo dengan kuah segar bumbu rempah',              '10:00:00', '18:00:00', 1, 1, 4.6, 31, 'https://picsum.photos/seed/warung4/400/300');

INSERT INTO menu_items (kedai_id, name, description, price, category, is_available, image_url) VALUES
(1, 'Nasi Goreng Spesial', 'Nasi goreng dengan telur, ayam, dan sayuran', 18000, 'makanan', 1, 'https://picsum.photos/seed/menu1/300/200'),
(1, 'Ayam Bakar',          'Ayam bakar kecap dengan sambal lalapan',      25000, 'makanan', 1, 'https://picsum.photos/seed/menu2/300/200'),
(1, 'Soto Ayam',           'Soto ayam segar dengan lontong',              15000, 'makanan', 1, 'https://picsum.photos/seed/menu3/300/200'),
(1, 'Es Teh Manis',        'Teh manis dingin segar',                       5000, 'minuman', 1, 'https://picsum.photos/seed/menu4/300/200'),
(1, 'Jus Alpukat',         'Jus alpukat segar dengan susu',               12000, 'minuman', 1, 'https://picsum.photos/seed/menu5/300/200'),
(2, 'Gudeg Nangka',        'Gudeg nangka khas Yogyakarta dengan opor ayam',22000, 'makanan', 1, 'https://picsum.photos/seed/menu6/300/200'),
(2, 'Rawon Sapi',          'Rawon berkuah hitam dengan daging sapi empuk', 28000, 'makanan', 1, 'https://picsum.photos/seed/menu7/300/200'),
(2, 'Pecel Sayur',         'Sayuran segar dengan bumbu kacang',           13000, 'makanan', 1, 'https://picsum.photos/seed/menu8/300/200'),
(2, 'Es Dawet',            'Minuman dawet segar dengan santan',            8000, 'minuman', 1, 'https://picsum.photos/seed/menu9/300/200'),
(3, 'Mie Ayam Original',   'Mie ayam dengan kuah kaldu ayam',             14000, 'makanan', 1, 'https://picsum.photos/seed/menu10/300/200'),
(3, 'Mie Ayam Bakso',      'Mie ayam + bakso sapi',                       18000, 'makanan', 1, 'https://picsum.photos/seed/menu11/300/200'),
(3, 'Pangsit Goreng',      'Pangsit goreng crispy renyah',                 8000, 'snack',   1, 'https://picsum.photos/seed/menu12/300/200'),
(3, 'Es Jeruk',            'Jeruk segar diperas dengan es',                6000, 'minuman', 1, 'https://picsum.photos/seed/menu13/300/200'),
(4, 'Bakso Jumbo',         'Bakso sapi ukuran besar dengan kuah kaldu',   20000, 'makanan', 1, 'https://picsum.photos/seed/menu14/300/200'),
(4, 'Bakso Urat',          'Bakso urat dengan tekstur kenyal',             18000, 'makanan', 1, 'https://picsum.photos/seed/menu15/300/200'),
(4, 'Tahu Baso',           'Tahu isi bakso goreng',                       10000, 'snack',   1, 'https://picsum.photos/seed/menu16/300/200'),
(4, 'Es Campur',           'Es campur segar aneka topping',               10000, 'minuman', 1, 'https://picsum.photos/seed/menu17/300/200');
