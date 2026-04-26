const mysql = require('mysql2/promise');
require('dotenv').config();

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kantinku',
    port: parseInt(process.env.DB_PORT || '3306'),
  });

  console.log('Seeding KantinKu with 7+7 menu items per shop...\n');

  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE order_items');
    await connection.query('TRUNCATE TABLE orders');
    await connection.query('TRUNCATE TABLE ulasan_kedai');
    await connection.query('TRUNCATE TABLE balasan_kedai');
    await connection.query('TRUNCATE TABLE notifications');
    await connection.query('TRUNCATE TABLE menu_items');
    await connection.query('TRUNCATE TABLE kedai');
    await connection.query('TRUNCATE TABLE kantin_areas');
    await connection.query('TRUNCATE TABLE users');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // 1. Kantin Areas
    await connection.query(`
      INSERT INTO kantin_areas (id, name, description, location_hint) VALUES
      (1, 'Kantin Belakang', 'Kantin di area belakang kampus',   'Gedung Utama Belakang'),
      (2, 'Kantin Basement', 'Kantin di lantai basement',         'Lantai B1 Gedung Rektorat'),
      (3, 'Kantin Masjid',   'Kantin dekat masjid kampus',        'Samping Masjid Al-Hikmah'),
      (4, 'Kantin Cemara',   'Kantin di bawah pohon cemara',      'Taman Cemara'),
      (5, 'Kantin Utama',    'Kantin pusat kampus',               'Pusat Kampus Lt. 1'),
      (6, 'Kantin Merah',    'Kantin gedung merah',               'Gedung Merah Fakultas Teknik'),
      (7, 'Kantin Depan',    'Kantin di depan kampus',            'Pintu Masuk Utama')
    `);

    // 2. Users (password: PASSWORD)
    await connection.query(`
      INSERT INTO users (id, name, email, password, role, phone) VALUES
      (1,  'Super Admin',    'admin@kantinku.id',    '$2b$10$PgRDJdzVRPFclpSTgvZbWuzEgnSx8b9qzmq4yLVpZRuSW8EyeARuu', 'admin',    '081234567890'),
      (2,  'Pak Budi',       'budi@kantinku.id',     '$2b$10$PgRDJdzVRPFclpSTgvZbWuzEgnSx8b9qzmq4yLVpZRuSW8EyeARuu', 'merchant', '081234567891'),
      (3,  'Bu Sri',         'sari@kantinku.id',     '$2b$10$PgRDJdzVRPFclpSTgvZbWuzEgnSx8b9qzmq4yLVpZRuSW8EyeARuu', 'merchant', '081234567892'),
      (4,  'Mas Joko',       'joko@kantinku.id',     '$2b$10$PgRDJdzVRPFclpSTgvZbWuzEgnSx8b9qzmq4yLVpZRuSW8EyeARuu', 'merchant', '081234567893'),
      (5,  'Pak Cemara',     'dewi@kantinku.id',     '$2b$10$PgRDJdzVRPFclpSTgvZbWuzEgnSx8b9qzmq4yLVpZRuSW8EyeARuu', 'merchant', '081234567894'),
      (6,  'Pak Hendra',     'hendra@kantinku.id',   '$2b$10$PgRDJdzVRPFclpSTgvZbWuzEgnSx8b9qzmq4yLVpZRuSW8EyeARuu', 'merchant', '081234567895'),
      (7,  'Bu Ratna',       'ratna@kantinku.id',    '$2b$10$PgRDJdzVRPFclpSTgvZbWuzEgnSx8b9qzmq4yLVpZRuSW8EyeARuu', 'merchant', '081234567896'),
      (8,  'Mas Fajar',      'fajar@kantinku.id',    '$2b$10$PgRDJdzVRPFclpSTgvZbWuzEgnSx8b9qzmq4yLVpZRuSW8EyeARuu', 'merchant', '081234567897'),
      (9,  'Andi Mahasiswa', 'andi@student.ac.id',   '$2b$10$PgRDJdzVRPFclpSTgvZbWuzEgnSx8b9qzmq4yLVpZRuSW8EyeARuu', 'customer', '081234567898'),
      (10, 'Siti Mahasiswi', 'siti@student.ac.id',   '$2b$10$PgRDJdzVRPFclpSTgvZbWuzEgnSx8b9qzmq4yLVpZRuSW8EyeARuu', 'customer', '081234567899')
    `);

    // 3. Kedai — Using premium branding images
    await connection.query(`
      INSERT INTO kedai (id, merchant_id, kantin_area_id, name, description, open_time, close_time, is_active, is_verified, rating, review_count, image_url) VALUES
      (1, 2, 1, 'Warung Pak Budi',      'Masakan rumahan lezat dengan cita rasa nusantara',        '07:00', '16:00', 1, 1, 4.8, 42, '/images/kedai_budi_premium.png'),
      (2, 3, 2, 'Dapur Bu Sri',         'Masakan Jawa otentik dengan bumbu rempah pilihan',        '08:00', '15:00', 1, 1, 4.7, 38, '/images/kedai_sari.png'),
      (3, 4, 3, 'Mie Ayam Mas Joko',    'Mie ayam spesial kuah kental resep turun-temurun',       '09:00', '17:00', 1, 1, 4.5, 29, '/images/kedai_joko.png'),
      (4, 5, 4, 'Bakso Selera Cemara',  'Bakso jumbo segar dengan kuah kaldu rempah pilihan',     '10:00', '18:00', 1, 1, 4.6, 33, '/images/kedai_bakso.png'),
      (5, 6, 5, 'Nasi Uduk Pak Hendra', 'Nasi uduk gurih dengan lauk pauk lengkap khas Betawi',   '06:30', '14:00', 1, 1, 4.9, 61, '/images/kedai_budi.png'),
      (6, 7, 6, 'Warung Bu Ratna',      'Aneka masakan Sunda segar dan sehat pilihan mahasiswa',  '07:30', '16:30', 1, 1, 4.4, 25, '/images/kedai_ratna_premium.png'),
      (7, 8, 7, 'Kedai Mas Fajar',      'Sajian modern fusion dengan sentuhan tradisional',       '08:00', '17:00', 1, 1, 4.6, 31, '/images/kedai_fajar_premium.png')
    `);

    // 4. Menu Items — 7 Makanan + 7 Minuman per Kedai
    const menus = [
      // Kedai 1: Warung Pak Budi
      { 
        kedai: 1, 
        makanan: [
          ['Nasi Ayam Bakar Kecap', 'Ayam bakar bumbu kecap meresap dengan sambal terasi', '/images/warung pak budi/nasi ayam bakar kecap.png'],
          ['Nasi Gudeg Spesial', 'Gudeg nangka manis dengan krecek pedas dan telur', '/images/warung pak budi/nasi gudeg spesial.png'],
          ['Rawon Daging Sapi', 'Rawon kuah hitam pekat dengan daging sapi empuk', '/images/warung pak budi/rawon daging sapi.png'],
          ['Nasi Goreng Kampung', 'Nasi goreng gurih dengan telur mata sapi', '/images/menu_nasi_goreng_kampung_premium.png'],
          ['Soto Ayam Lamongan', 'Soto ayam kuah kuning kental dengan koya', '/images/menu_soto_ayam_lamongan_premium.jpg'],
          ['Ayam Penyet Pedas', 'Ayam goreng dipenyet dengan sambal korek', '/images/menu_ayam_penyet_ijo_premium.png'],
          ['Sate Ayam Madura', 'Sate ayam bumbu kacang kental isi 10 tusuk', '/images/menu_sate_madura_premium.png']
        ],
        minuman: [
          ['Es Teh Manis Segar', 'Teh melati pilihan dengan es batu kristal', '/images/menu_es_teh_premium.png'],
          ['Es Jeruk Peras', 'Jeruk peras asli tanpa pemanis buatan', '/images/menu_es_jeruk_nipis_betawi_premium.jpg'],
          ['Es Campur Pelangi', 'Aneka buah dan jelly dengan sirup merah', '/images/menu_es_campur_premium.jpg'],
          ['Es Cendol Nangka', 'Cendol kenyal dengan santan dan gula merah', '/images/menu_es_cendol_premium.jpg'],
          ['Jus Alpukat', 'Jus alpukat mentega kental dengan susu coklat', '/images/menu_jus_alpukat_premium.jpg'],
          ['Es Lemon Tea', 'Teh lemon segar untuk pelepas dahaga', '/images/menu_es_teh_premium.png'],
          ['Air Mineral Dingin', 'Air mineral kemasan 600ml dingin', '/images/menu_air_mineral_premium.jpg']
        ]
      },
      // Kedai 2: Dapur Bu Sri
      {
        kedai: 2,
        makanan: [
          ['Ayam Goreng Lengkuas', 'Ayam goreng dengan taburan serundeng lengkuas', '/images/dapur bu sri/ayam goreng lengkuas.png'],
          ['Gudeg Jogja', 'Gudeg asli Jogja dengan cita rasa manis gurih', '/images/dapur bu sri/gudeg joga.png'],
          ['Rawon Setan', 'Rawon pedas nikmat dengan telur asin dan tauge', '/images/dapur bu sri/rawon setan.png'],
          ['Ayam Bakar Madu', 'Ayam bakar bumbu madu yang meresap ke tulang', '/images/menu_ayam_bakar_premium.jpg'],
          ['Soto Daging Sapi', 'Soto daging sapi kuah bening segar berempah', '/images/menu_soto_betawi_premium.png'],
          ['Nasi Goreng Spesial', 'Nasi goreng dengan bakso, sosis, dan telur', '/images/menu_nasi_goreng_kampung_premium.png'],
          ['Ikan Bakar Premium', 'Ikan bakar bumbu rempah pilihan', '/images/menu_ikan_bakar_premium.png']
        ],
        minuman: [
          ['Es Kelapa Muda', 'Air kelapa muda murni dengan es batu', '/images/dapur bu sri/es kelapa muda.png'],
          ['Iced Teh Tarik', 'Teh tarik creamy dengan busa melimpah', '/images/dapur bu sri/iced teh tarik.png'],
          ['Mango Juice', 'Jus mangga harum manis kental', '/images/dapur bu sri/mango juice.png'],
          ['Wedang Jahe', 'Minuman jahe hangat untuk stamina tubuh', '/images/dapur bu sri/wedang jahe.png'],
          ['Es Jeruk Nipis', 'Jeruk nipis segar kaya vitamin C', '/images/menu_es_jeruk_nipis_betawi_premium.jpg'],
          ['Jus Alpukat', 'Jus alpukat mentega segar', '/images/menu_jus_alpukat_premium.jpg'],
          ['Air Mineral', 'Air mineral dingin segar', '/images/menu_air_mineral_premium.jpg']
        ]
      },
      // Kedai 3: Mie Ayam Mas Joko
      {
        kedai: 3,
        makanan: [
          ['Bihun Ayam Jamur', 'Bihun lembut dengan topping ayam jamur spesial', '/images/mie ayam mas joko/bihun ayam jamur.png'],
          ['Bakso Urat Mas Joko', 'Bakso urat asli Wonogiri dengan kuah kaldu sapi', '/images/mie ayam mas joko/bakso urat mas joko.png'],
          ['Soto Ayam Spesial', 'Soto ayam dengan suwiran ayam melimpah', '/images/mie ayam mas joko/soto ayam spesial.png'],
          ['Mie Ayam Wonogiri', 'Mie ayam kenyal dengan bumbu khas Wonogiri', '/images/menu_mie_ayam_wonogiri_premium.jpg'],
          ['Mie Ayam Pangsit', 'Mie ayam dengan pangsit goreng renyah', '/images/menu_mie_ayam_pangsit_premium.png'],
          ['Mie Goreng Seafood', 'Mie goreng dengan udang dan cumi segar', '/images/menu_nasi_goreng_kampung_premium.png'],
          ['Kwetiau Siram Sapi', 'Kwetiau kuah kental dengan daging sapi', '/images/menu_kwetiau_siram_premium.jpg']
        ],
        minuman: [
          ['Es Sirup Melon', 'Sirup melon hijau segar dengan selasih', '/images/mie ayam mas joko/Es Sirup Melon.png'],
          ['Air Mineral', 'Air mineral kemasan 600ml', '/images/mie ayam mas joko/air mineral.png'],
          ['Es Jeruk Nipis Madu', 'Minuman segar jeruk nipis dengan madu asli', '/images/mie ayam mas joko/es jeruk nipis madu.png'],
          ['Kopi Hitam Mantap', 'Kopi hitam robusta murni tanpa gula', '/images/mie ayam mas joko/kopi hitam mantap.png'],
          ['Teh Botol Sosro', 'Teh dalam kemasan botol dingin', '/images/mie ayam mas joko/teh botol sosro.png'],
          ['Es Teh Manis', 'Teh manis dingin klasik', '/images/menu_es_teh_premium.png'],
          ['Es Jeruk Peras', 'Jeruk peras murni segar', '/images/menu_es_jeruk_nipis_betawi_premium.jpg']
        ]
      },
      // Kedai 4: Bakso Selera Cemara
      {
        kedai: 4,
        makanan: [
          ['Bakso Urat Besar', 'Bakso urat ukuran besar dengan kaldu sapi mantap', '/images/bakso selera cemara/bakso urat besar.png'],
          ['Bakso Telur Puyuh', 'Bakso isi telur puyuh dengan kuah bening gurih', '/images/bakso selera cemara/bakso telur puyuh.png'],
          ['Bakso Mercon', 'Bakso isi sambal mercon yang meledak di mulut', '/images/bakso selera cemara/bakso mercon.png'],
          ['Mie Bakso Komplit', 'Campuran mie kuning, bihun, dan 5 butir bakso', '/images/bakso selera cemara/mie bakso komplit.png'],
          ['Soto Ayam', 'Soto ayam dengan taburan koya yang gurih', '/images/bakso selera cemara/soto ayam.png'],
          ['Nasi Ayam Geprek', 'Ayam geprek crispy dengan sambal bawang', '/images/menu_ayam_penyet_ijo_premium.png'],
          ['Tahu Bakso Goreng', 'Tahu isi bakso isi 4 pcs dengan saus sambal', '/images/menu_tahu_bakso_premium.jpg']
        ],
        minuman: [
          ['Cincau', 'Cincau hitam dengan santan dan gula merah', '/images/bakso selera cemara/cincau.png'],
          ['Iced Susu Cokelat', 'Susu coklat segar bertenaga', '/images/bakso selera cemara/iced susu cokelat.png'],
          ['Tomato Juice', 'Jus tomat asli kaya lycopene', '/images/bakso selera cemara/tomato juice.png'],
          ['Es Campur Cemara', 'Es campur spesial dengan kelapa muda', '/images/menu_es_campur_premium.jpg'],
          ['Es Teh Manis', 'Teh manis dingin klasik', '/images/menu_es_teh_premium.png'],
          ['Es Jeruk Nipis', 'Jeruk nipis segar kaya vitamin C', '/images/menu_es_jeruk_nipis_betawi_premium.jpg'],
          ['Air Mineral Dingin', 'Air mineral kemasan 600ml', '/images/menu_air_mineral_premium.jpg']
        ]
      },
      // Kedai 5: Nasi Uduk Pak Hendra
      {
        kedai: 5,
        makanan: [
          ['Nasi Uduk Kebon Kacang', 'Nasi uduk harum dengan ayam goreng and serundeng', '/images/menu_nasi_uduk_premium.png'],
          ['Ketoprak Telur', 'Ketoprak with telur dadar and bumbu kacang', '/images/menu_ketoprak_premium.png'],
          ['Empal Sapi Goreng', 'Empal sapi gurih dan empuk', '/images/menu_empal_sapi_premium.png'],
          ['Soto Betawi Asli', 'Soto daging sapi kuah santan khas Betawi', '/images/menu_soto_betawi_premium.png'],
          ['Lontong Sayur Betawi', 'Lontong sayur labu siam dengan kerupuk merah', '/images/menu_lontong_sayur_betawi_premium.jpg'],
          ['Nasi Goreng Betawi', 'Nasi goreng dengan bumbu rempah khas Betawi', '/images/menu_nasi_goreng_kampung_premium.png'],
          ['Ayam Bakar Madu', 'Ayam bakar manis dengan sambal limau', '/images/menu_ayam_bakar_madu_premium.png']
        ],
        minuman: [
          ['Es Bir Pletok', 'Minuman rempah khas Betawi yang menyehatkan', '/images/menu_bir_pletok_premium.png'],
          ['Jus Jambu Biji', 'Jus jambu biji merah kental tanpa biji', '/images/menu_jus_jambu_premium.png'],
          ['Es Teh Manis', 'Teh manis dingin segar', '/images/menu_es_teh_premium.png'],
          ['Kopi Susu Betawi', 'Kopi susu hangat dengan krimer kental manis', '/images/menu_kopi_susu_betawi_premium.jpg'],
          ['Es Jeruk Nipis', 'Minuman segar jeruk nipis dingin', '/images/menu_es_jeruk_nipis_betawi_premium.jpg'],
          ['Es Kelapa Muda', 'Air kelapa muda segar langsung dari buahnya', '/images/menu_es_kelapa_muda_betawi_premium.jpg'],
          ['Air Mineral Dingin', 'Air mineral kemasan 600ml', '/images/menu_air_mineral_premium.jpg']
        ]
      },
      // Kedai 6: Warung Bu Ratna
      {
        kedai: 6,
        makanan: [
          ['Ikan Bakar Cianjur', 'Ikan nila bakar bumbu kecap pedas manis', '/images/warung bu ratna/ikan bakar cianjur.png'],
          ['Sayur Asam Segar', 'Sayur asem segar dengan kacang dan jagung', '/images/warung bu ratna/sayur asam segar.png'],
          ['Ayam Penyet Sambal Ijo', 'Ayam goreng dipenyet dengan sambal ijo', '/images/menu_ayam_penyet_ijo_premium.png'],
          ['Nasi Timbel Komplit', 'Nasi timbel daun pisang dengan ikan asin', '/images/menu_nasi_timbel_premium.jpg'],
          ['Karedok Bandung', 'Sayuran mentah segar dengan bumbu kacang', '/images/menu_karedok_premium.jpg'],
          ['Pepes Ikan Mas', 'Ikan mas bumbu kuning dikukus daun pisang', '/images/menu_pepes_ikan_premium.jpg'],
          ['Sate Maranggi', 'Sate sapi bumbu maranggi yang legendaris', '/images/menu_sate_madura_premium.png']
        ],
        minuman: [
          ['Bandrek Susu Hangat', 'Minuman jahe susu hangat penambah stamina', '/images/warung bu ratna/bandrek susu hangat.png'],
          ['Es Doger Spesial', 'Es doger dengan tape, ketan hitam, dan kelapa', '/images/warung bu ratna/es doger spesial.png'],
          ['Jus Alpukat Cokelat', 'Jus alpukat dengan topping susu coklat kental', '/images/warung bu ratna/jus alpukat cokelat.png'],
          ['Es Cendol Bandung', 'Es cendol dengan nangka dan gula merah', '/images/menu_es_cendol_premium.jpg'],
          ['Es Jeruk Peras', 'Jeruk peras segar dingin', '/images/menu_es_jeruk_nipis_betawi_premium.jpg'],
          ['Teh Botol Sosro', 'Teh dalam kemasan botol dingin', '/images/menu_es_teh_premium.png'],
          ['Air Mineral Dingin', 'Air mineral kemasan 600ml', '/images/menu_air_mineral_premium.jpg']
        ]
      },
      // Kedai 7: Kedai Mas Fajar
      {
        kedai: 7,
        makanan: [
          ['Nasi Bakar', 'Nasi bakar gurih dengan isi ikan peda dan kemangi', '/images/kedai mas fajar/nasi bakar.png'],
          ['Pasta Bolognese', 'Pasta spaghetti dengan saus daging sapi cincang', '/images/kedai mas fajar/pasta bolognese.png'],
          ['Sandwich Tuna Mayo', 'Roti gandum isi tuna dan sayuran segar', '/images/kedai mas fajar/sandwich tuna mayo.png'],
          ['Rice Bowl Teriyaki', 'Nasi bowl ayam teriyaki dengan topping wijen', '/images/menu_rice_bowl_teriyaki_premium.png'],
          ['Ayam Geprek Mozzarella', 'Ayam geprek pedas dengan lelehan keju mozzarella', '/images/menu_ayam_geprek_mozarella_premium.jpg'],
          ['Mie Goreng Spesial', 'Mie goreng telur dengan sayuran dan bakso', '/images/menu_mie_ayam_wonogiri_premium.jpg'],
          ['Sate Ayam Madura', 'Sate ayam isi 10 tusuk bumbu kacang', '/images/menu_sate_madura_premium.png']
        ],
        minuman: [
          ['Iced Americano', 'Espresso kopi arabika dengan air dingin/panas', '/images/kedai mas fajar/iced americano.png'],
          ['Mango Smoothies', 'Smoothie buah mangga asli dengan yogurt', '/images/kedai mas fajar/mango smoothies.png'],
          ['Thai Tea Creamy', 'Teh khas Thailand dengan susu evaporasi', '/images/menu_thai_tea_premium.jpg'],
          ['Matcha Latte Dingin', 'Bubuk matcha premium dengan susu segar', '/images/menu_matcha_latte_premium.png'],
          ['Es Teh Manis', 'Teh manis dingin klasik', '/images/menu_es_teh_premium.png'],
          ['Es Jeruk Peras', 'Jeruk peras murni segar', '/images/menu_es_jeruk_nipis_betawi_premium.jpg'],
          ['Air Mineral Dingin', 'Air mineral kemasan 600ml', '/images/menu_air_mineral_premium.jpg']
        ]
      }
    ];

    for (const m of menus) {
      for (const item of m.makanan) {
        await connection.query(
          'INSERT INTO menu_items (kedai_id, name, description, price, category, is_available, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [m.kedai, item[0], item[1], 15000, 'makanan', 1, item[2]]
        );
      }
      for (const item of m.minuman) {
        await connection.query(
          'INSERT INTO menu_items (kedai_id, name, description, price, category, is_available, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [m.kedai, item[0], item[1], 8000, 'minuman', 1, item[2]]
        );
      }
    }

    console.log('\n🚀 Integrated seed with 98 items completed successfully!');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await connection.end();
  }
}

seed();
