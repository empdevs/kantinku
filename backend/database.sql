-- KantinKu Database Schema
CREATE DATABASE IF NOT EXISTS kantinku;
USE kantinku;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','merchant','customer') NOT NULL DEFAULT 'customer',
  phone VARCHAR(20),
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Kantin areas
CREATE TABLE IF NOT EXISTS kantin_areas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  location_hint VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kedai (stalls)
CREATE TABLE IF NOT EXISTS kedai (
  id INT AUTO_INCREMENT PRIMARY KEY,
  merchant_id INT NOT NULL,
  kantin_area_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  open_time TIME NOT NULL DEFAULT '07:00:00',
  close_time TIME NOT NULL DEFAULT '17:00:00',
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INT DEFAULT 0,
  image_url VARCHAR(255),
  banner_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (merchant_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (kantin_area_id) REFERENCES kantin_areas(id)
);

-- Menu items
CREATE TABLE IF NOT EXISTS menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kedai_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category ENUM('makanan','minuman','snack') NOT NULL DEFAULT 'makanan',
  is_available BOOLEAN DEFAULT TRUE,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (kedai_id) REFERENCES kedai(id) ON DELETE CASCADE
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  kedai_id INT NOT NULL,
  order_code VARCHAR(20) UNIQUE NOT NULL,
  status ENUM('pending','diproses','siap_diambil','selesai','dibatalkan') DEFAULT 'pending',
  pickup_time DATETIME NOT NULL,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (kedai_id) REFERENCES kedai(id)
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  kedai_id INT NOT NULL,
  order_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (kedai_id) REFERENCES kedai(id),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Seed: Kantin Areas
INSERT INTO kantin_areas (name, description, location_hint) VALUES
('Kantin Belakang', 'Kantin di area belakang kampus', 'Gedung Utama Belakang'),
('Kantin Basement', 'Kantin di lantai basement', 'Lantai B1 Gedung Rektorat'),
('Kantin Masjid', 'Kantin dekat masjid kampus', 'Samping Masjid Al-Hikmah'),
('Kantin Cemara', 'Kantin di bawah pohon cemara', 'Taman Cemara'),
('Kantin Utama', 'Kantin pusat kampus', 'Pusat Kampus Lt. 1'),
('Kantin Merah', 'Kantin gedung merah', 'Gedung Merah Fakultas Teknik'),
('Kantin Depan', 'Kantin di depan kampus', 'Pintu Masuk Utama');

-- Seed: Admin user (password: admin123)
INSERT INTO users (name, email, password, role, phone) VALUES
('Super Admin', 'admin@kantinku.id', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '081234567890');

-- Seed: Merchants (password: merchant123)
INSERT INTO users (name, email, password, role, phone) VALUES
('Pak Budi', 'budi@kantinku.id', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'merchant', '081234567891'),
('Bu Sari', 'sari@kantinku.id', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'merchant', '081234567892'),
('Mas Joko', 'joko@kantinku.id', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'merchant', '081234567893');

-- Seed: Customer (password: customer123)
INSERT INTO users (name, email, password, role, phone) VALUES
('Andi Mahasiswa', 'andi@student.ac.id', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer', '081234567894'),
('Siti Mahasiswi', 'siti@student.ac.id', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer', '081234567895');

-- Seed: Kedai
INSERT INTO kedai (merchant_id, kantin_area_id, name, description, open_time, close_time, is_active, is_verified, rating, review_count, image_url) VALUES
(2, 5, 'Warung Pak Budi', 'Masakan rumahan yang lezat dan terjangkau', '07:00:00', '16:00:00', TRUE, TRUE, 4.5, 24, 'https://picsum.photos/seed/warung1/400/300'),
(3, 1, 'Dapur Bu Sari', 'Masakan Jawa otentik dengan bumbu rempah pilihan', '08:00:00', '15:00:00', TRUE, TRUE, 4.8, 56, 'https://picsum.photos/seed/warung2/400/300'),
(4, 3, 'Mie Ayam Mas Joko', 'Mie ayam spesial dengan kuah kental', '09:00:00', '17:00:00', TRUE, TRUE, 4.3, 18, 'https://picsum.photos/seed/warung3/400/300'),
(2, 2, 'Bakso Selera', 'Bakso jumbo dengan kuah segar bumbu rempah', '10:00:00', '18:00:00', TRUE, TRUE, 4.6, 31, 'https://picsum.photos/seed/warung4/400/300');

-- Seed: Menu Items for Warung Pak Budi
INSERT INTO menu_items (kedai_id, name, description, price, category, is_available, image_url) VALUES
(1, 'Nasi Goreng Spesial', 'Nasi goreng dengan telur, ayam, dan sayuran', 18000, 'makanan', TRUE, 'https://picsum.photos/seed/menu1/300/200'),
(1, 'Ayam Bakar', 'Ayam bakar kecap dengan sambal lalapan', 25000, 'makanan', TRUE, 'https://picsum.photos/seed/menu2/300/200'),
(1, 'Soto Ayam', 'Soto ayam segar dengan lontong', 15000, 'makanan', TRUE, 'https://picsum.photos/seed/menu3/300/200'),
(1, 'Es Teh Manis', 'Teh manis dingin segar', 5000, 'minuman', TRUE, 'https://picsum.photos/seed/menu4/300/200'),
(1, 'Jus Alpukat', 'Jus alpukat segar dengan susu', 12000, 'minuman', TRUE, 'https://picsum.photos/seed/menu5/300/200');

-- Seed: Menu Items for Dapur Bu Sari
INSERT INTO menu_items (kedai_id, name, description, price, category, is_available, image_url) VALUES
(2, 'Gudeg Nangka', 'Gudeg nangka khas Yogyakarta dengan opor ayam', 22000, 'makanan', TRUE, 'https://picsum.photos/seed/menu6/300/200'),
(2, 'Rawon Sapi', 'Rawon berkuah hitam dengan daging sapi empuk', 28000, 'makanan', TRUE, 'https://picsum.photos/seed/menu7/300/200'),
(2, 'Pecel Sayur', 'Sayuran segar dengan bumbu kacang', 13000, 'makanan', TRUE, 'https://picsum.photos/seed/menu8/300/200'),
(2, 'Es Dawet', 'Minuman dawet segar dengan santan', 8000, 'minuman', TRUE, 'https://picsum.photos/seed/menu9/300/200');

-- Seed: Menu Items for Mie Ayam Mas Joko
INSERT INTO menu_items (kedai_id, name, description, price, category, is_available, image_url) VALUES
(3, 'Mie Ayam Original', 'Mie ayam dengan kuah kaldu ayam', 14000, 'makanan', TRUE, 'https://picsum.photos/seed/menu10/300/200'),
(3, 'Mie Ayam Bakso', 'Mie ayam + bakso sapi', 18000, 'makanan', TRUE, 'https://picsum.photos/seed/menu11/300/200'),
(3, 'Pangsit Goreng', 'Pangsit goreng crispy renyah', 8000, 'snack', TRUE, 'https://picsum.photos/seed/menu12/300/200'),
(3, 'Es Jeruk', 'Jeruk segar diperas dengan es', 6000, 'minuman', TRUE, 'https://picsum.photos/seed/menu13/300/200');

-- Seed: Menu Items for Bakso Selera
INSERT INTO menu_items (kedai_id, name, description, price, category, is_available, image_url) VALUES
(4, 'Bakso Jumbo', 'Bakso sapi ukuran besar dengan kuah kaldu', 20000, 'makanan', TRUE, 'https://picsum.photos/seed/menu14/300/200'),
(4, 'Bakso Urat', 'Bakso urat dengan tekstur kenyal', 18000, 'makanan', TRUE, 'https://picsum.photos/seed/menu15/300/200'),
(4, 'Tahu Baso', 'Tahu isi bakso goreng', 10000, 'snack', TRUE, 'https://picsum.photos/seed/menu16/300/200'),
(4, 'Es Campur', 'Es campur segar aneka topping', 10000, 'minuman', TRUE, 'https://picsum.photos/seed/menu17/300/200');
