import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import WebsiteReviews from '../components/WebsiteReviews';

const AREA_ICONS = ['🏫','🏢','🕌','🌲','⭐','🔴','🚪'];

export default function Landing() {
  const [areas, setAreas] = useState([]);
  const [kedai, setKedai] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/kantin').then(r => setAreas(r.data)).catch(() => {});
    api.get('/kedai').then(r => setKedai(r.data.slice(0, 6))).catch(() => {});
  }, []);

  const handleAreaClick = (id) => navigate(`/?kantin=${id}`);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navbar */}
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">🍱</div>
          <span>Kantin<em>Ku</em></span>
        </Link>
        <div className="navbar-actions">
          {user ? (
            <Link to={user.role === 'admin' ? '/admin' : user.role === 'merchant' ? '/merchant' : '/home'} className="btn btn-primary btn-sm">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Masuk</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Daftar Sekarang</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <div className="hero-badge">
              <span></span> Sistem Kantin Digital Kampus
            </div>
            <h1>Pesan Makanan Kampus<br />Lebih Mudah & Cepat</h1>
            <p>Temukan berbagai pilihan makanan dari kedai favorit di kampus. Pesan sekarang, ambil sendiri — tanpa antre panjang!</p>
            <div className="hero-actions">
              <Link to={user ? '/home' : '/register'} className="btn btn-primary btn-lg">
                🚀 {user ? 'Pesan Sekarang' : 'Mulai Sekarang'}
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">Pelajari Lebih →</Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-value">{areas.length || 7}</div>
                <div className="hero-stat-label">Area Kantin</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">{kedai.length || '20'}+</div>
                <div className="hero-stat-label">Kedai Aktif</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">100%</div>
                <div className="hero-stat-label">Pickup</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="floating-card" style={{ alignSelf: 'flex-end', maxWidth: '260px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🍱</div>
                <div><div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Nasi Goreng Spesial</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Warung Pak Budi</div></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Rp 18.000</span>
                <span className="badge badge-success">⚡ Siap 15 mnt</span>
              </div>
            </div>
            <div className="floating-card" style={{ maxWidth: '240px', animationDelay: '3s' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Status Pesanan</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {['✅ Pesanan diterima', '🔄 Sedang diproses', '🎯 Siap diambil'].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === 2 ? 'var(--primary)' : 'var(--success)' }}></div>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Area Kantin */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-card)' }}>
        <div className="container">
          <h2 className="section-title">Area Kantin Kampus</h2>
          <p className="section-sub">Temukan kedai berdasarkan lokasi kantin favorit kamu</p>
          <div className="kantin-area-grid">
            {areas.map((area, i) => (
              <Link to={`/home?kantin=${area.id}`} key={area.id} className="kantin-area-card">
                <div className="area-icon">{AREA_ICONS[i % AREA_ICONS.length]}</div>
                <div className="area-name">{area.name}</div>
                <div className="area-count">{area.kedai_count} kedai</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Kedai */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 className="section-title">Kedai Populer</h2>
          <p className="section-sub">Rating tertinggi dari para mahasiswa</p>
          <div className="grid-kedai">
            {kedai.map(k => (
              <Link to={`/kedai/${k.id}`} key={k.id} className="kedai-card">
                <div className="kedai-card-img">
                  <img src={k.image_url || `https://picsum.photos/seed/${k.id}/400/300`} alt={k.name} />
                  <div className="kedai-badge">📍 {k.kantin_name}</div>
                </div>
                <div className="kedai-card-body">
                  <div className="kedai-card-name">{k.name}</div>
                  <div className="kedai-card-loc">🏪 {k.kantin_name}</div>
                  <div className="kedai-card-meta">
                    <span className="kedai-rating">⭐ {parseFloat(k.rating || 0).toFixed(1)}</span>
                    <span className={k.is_active ? 'kedai-status-open' : 'kedai-status-closed'}>
                      {k.is_active ? 'Buka' : 'Tutup'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/home" className="btn btn-outline btn-lg">Lihat Semua Kedai →</Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-card)' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>Cara Pemesanan</h2>
          <p className="section-sub" style={{ textAlign: 'center' }}>Pesan dalam 3 langkah mudah</p>
          <div className="grid-3" style={{ marginTop: '2rem' }}>
            {[
              { icon: '🔍', title: '1. Pilih Kedai', desc: 'Browse kedai berdasarkan area kantin atau kategori makanan favoritmu' },
              { icon: '🛒', title: '2. Tambah ke Cart', desc: 'Pilih menu yang kamu inginkan, atur jumlah, dan tentukan waktu pickup' },
              { icon: '🎯', title: '3. Ambil Pesanan', desc: 'Datang ke kedai sesuai waktu yang dipilih, tunjukkan kode order, dan nikmati!' },
            ].map((step, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{step.icon}</div>
                <h3 style={{ marginBottom: '0.75rem' }}>{step.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Task 2A: Ulasan Website */}
      <WebsiteReviews />

      {/* Footer */}
      <footer style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', padding: '2rem 0', textAlign: 'center' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🍱</span>
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Kantin<em style={{ color: 'var(--primary)', fontStyle: 'normal' }}>Ku</em></span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>© 2024 KantinKu — Sistem Pemesanan Makanan Digital Kampus</p>
        </div>
      </footer>
    </div>
  );
}
