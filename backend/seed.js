const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, './kantinku.sqlite');
const db = new sqlite3.Database(dbPath);

const schema = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  phone TEXT,
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kantin_areas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  location_hint TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kedai (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  merchant_id INTEGER NOT NULL,
  kantin_area_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  open_time TEXT NOT NULL DEFAULT '07:00:00',
  close_time TEXT NOT NULL DEFAULT '17:00:00',
  is_active INTEGER DEFAULT 1,
  is_verified INTEGER DEFAULT 0,
  rating REAL DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  image_url TEXT,
  banner_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (merchant_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (kantin_area_id) REFERENCES kantin_areas(id)
);

CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kedai_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  category TEXT NOT NULL DEFAULT 'makanan',
  is_available INTEGER DEFAULT 1,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kedai_id) REFERENCES kedai(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  kedai_id INTEGER NOT NULL,
  order_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  pickup_time DATETIME NOT NULL,
  total_price REAL NOT NULL DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (kedai_id) REFERENCES kedai(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  menu_item_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price REAL NOT NULL,
  subtotal REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  kedai_id INTEGER NOT NULL,
  order_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (kedai_id) REFERENCES kedai(id),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);
`;

const seedData = `
INSERT INTO kantin_areas (name, description, location_hint) VALUES
('Kantin Belakang', 'Kantin di area belakang kampus', 'Gedung Utama Belakang'),
('Kantin Basement', 'Kantin di lantai basement', 'Lantai B1 Gedung Rektorat'),
('Kantin Masjid', 'Kantin dekat masjid kampus', 'Samping Masjid Al-Hikmah'),
('Kantin Cemara', 'Kantin di bawah pohon cemara', 'Taman Cemara'),
('Kantin Utama', 'Kantin pusat kampus', 'Pusat Kampus Lt. 1'),
('Kantin Merah', 'Kantin gedung merah', 'Gedung Merah Fakultas Teknik'),
('Kantin Depan', 'Kantin di depan kampus', 'Pintu Masuk Utama');

INSERT INTO users (name, email, password, role, phone) VALUES
('Super Admin', 'admin@kantinku.id', '$2b$10$ZUwY4gnSxc11OU5plLSvx.pxVFVEtfVuyWk4ifwTz9fwjYzl9BeTS', 'admin', '081234567890'),
('Pak Budi', 'budi@kantinku.id', '$2b$10$ZUwY4gnSxc11OU5plLSvx.pxVFVEtfVuyWk4ifwTz9fwjYzl9BeTS', 'merchant', '081234567891'),
('Bu Sari', 'sari@kantinku.id', '$2b$10$ZUwY4gnSxc11OU5plLSvx.pxVFVEtfVuyWk4ifwTz9fwjYzl9BeTS', 'merchant', '081234567892'),
('Mas Joko', 'joko@kantinku.id', '$2b$10$ZUwY4gnSxc11OU5plLSvx.pxVFVEtfVuyWk4ifwTz9fwjYzl9BeTS', 'merchant', '081234567893'),
('Andi Mahasiswa', 'andi@student.ac.id', '$2b$10$ZUwY4gnSxc11OU5plLSvx.pxVFVEtfVuyWk4ifwTz9fwjYzl9BeTS', 'customer', '081234567894'),
('Siti Mahasiswi', 'siti@student.ac.id', '$2b$10$ZUwY4gnSxc11OU5plLSvx.pxVFVEtfVuyWk4ifwTz9fwjYzl9BeTS', 'customer', '081234567895');

INSERT INTO kedai (merchant_id, kantin_area_id, name, description, open_time, close_time, is_active, is_verified, rating, review_count, image_url) VALUES
(2, 5, 'Warung Pak Budi', 'Masakan rumahan yang lezat dan terjangkau', '07:00:00', '16:00:00', 1, 1, 4.5, 24, 'https://picsum.photos/seed/warung1/400/300'),
(3, 1, 'Dapur Bu Sari', 'Masakan Jawa otentik dengan bumbu rempah pilihan', '08:00:00', '15:00:00', 1, 1, 4.8, 56, 'https://picsum.photos/seed/warung2/400/300'),
(4, 3, 'Mie Ayam Mas Joko', 'Mie ayam spesial dengan kuah kental', '09:00:00', '17:00:00', 1, 1, 4.3, 18, 'https://picsum.photos/seed/warung3/400/300'),
(2, 2, 'Bakso Selera', 'Bakso jumbo dengan kuah segar bumbu rempah', '10:00:00', '18:00:00', 1, 1, 4.6, 31, 'https://picsum.photos/seed/warung4/400/300');

INSERT INTO menu_items (kedai_id, name, description, price, category, is_available, image_url) VALUES
(1, 'Nasi Goreng Spesial', 'Nasi goreng dengan telur, ayam, dan sayuran', 18000, 'makanan', 1, 'https://picsum.photos/seed/menu1/300/200'),
(1, 'Ayam Bakar', 'Ayam bakar kecap dengan sambal lalapan', 25000, 'makanan', 1, 'https://picsum.photos/seed/menu2/300/200'),
(1, 'Soto Ayam', 'Soto ayam segar dengan lontong', 15000, 'makanan', 1, 'https://picsum.photos/seed/menu3/300/200'),
(1, 'Es Teh Manis', 'Teh manis dingin segar', 5000, 'minuman', 1, 'https://picsum.photos/seed/menu4/300/200'),
(1, 'Jus Alpukat', 'Jus alpukat segar dengan susu', 12000, 'minuman', 1, 'https://picsum.photos/seed/menu5/300/200'),
(2, 'Gudeg Nangka', 'Gudeg nangka khas Yogyakarta dengan opor ayam', 22000, 'makanan', 1, 'https://picsum.photos/seed/menu6/300/200'),
(2, 'Rawon Sapi', 'Rawon berkuah hitam dengan daging sapi empuk', 28000, 'makanan', 1, 'https://picsum.photos/seed/menu7/300/200'),
(2, 'Pecel Sayur', 'Sayuran segar dengan bumbu kacang', 13000, 'makanan', 1, 'https://picsum.photos/seed/menu8/300/200'),
(2, 'Es Dawet', 'Minuman dawet segar dengan santan', 8000, 'minuman', 1, 'https://picsum.photos/seed/menu9/300/200'),
(3, 'Mie Ayam Original', 'Mie ayam dengan kuah kaldu ayam', 14000, 'makanan', 1, 'https://picsum.photos/seed/menu10/300/200'),
(3, 'Mie Ayam Bakso', 'Mie ayam + bakso sapi', 18000, 'makanan', 1, 'https://picsum.photos/seed/menu11/300/200'),
(3, 'Pangsit Goreng', 'Pangsit goreng crispy renyah', 8000, 'snack', 1, 'https://picsum.photos/seed/menu12/300/200'),
(3, 'Es Jeruk', 'Jeruk segar diperas dengan es', 6000, 'minuman', 1, 'https://picsum.photos/seed/menu13/300/200'),
(4, 'Bakso Jumbo', 'Bakso sapi ukuran besar dengan kuah kaldu', 20000, 'makanan', 1, 'https://picsum.photos/seed/menu14/300/200'),
(4, 'Bakso Urat', 'Bakso urat dengan tekstur kenyal', 18000, 'makanan', 1, 'https://picsum.photos/seed/menu15/300/200'),
(4, 'Tahu Baso', 'Tahu isi bakso goreng', 10000, 'snack', 1, 'https://picsum.photos/seed/menu16/300/200'),
(4, 'Es Campur', 'Es campur segar aneka topping', 10000, 'minuman', 1, 'https://picsum.photos/seed/menu17/300/200');
`;

db.serialize(() => {
  db.exec(schema, (err) => {
    if (err) console.error('Gagal membuat tabel:', err.message);
    else {
      console.log('Tabel berhasil dibuat.');
      db.exec(seedData, (err) => {
        if (err) console.error('Gagal memasukkan seed data:', err.message);
        else console.log('Seed data berhasil dimasukkan! Database siap.');
      });
    }
  });
});
