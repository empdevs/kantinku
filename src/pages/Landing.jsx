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

  const [selectedArea, setSelectedArea] = useState(null);

  useEffect(() => {
    // Area Fallback
    api.get('/kantin')
      .then(r => setAreas(r.data))
      .catch(() => {
        setAreas([
          { id: 1, name: 'Kantin Belakang', kedai_count: 5 },
          { id: 2, name: 'Kantin Basement', kedai_count: 3 },
          { id: 3, name: 'Kantin Utama', kedai_count: 8 },
          { id: 4, name: 'Kantin Masjid', kedai_count: 4 }
        ]);
      });

    // Kedai Fallback
    api.get('/kedai')
      .then(r => setKedai(r.data))
      .catch(() => {
        setKedai([
          { id: 1, name: 'Warung Pak Budi', kantin_name: 'Kantin Utama', kantin_id: 3, rating: 4.8, is_active: 1, image_url: '/images/kedai_budi.png' },
          { id: 2, name: 'Dapur Bu Sari', kantin_name: 'Kantin Belakang', kantin_id: 1, rating: 4.7, is_active: 1, image_url: '/images/kedai_sari.png' },
          { id: 3, name: 'Mie Ayam Mas Joko', kantin_name: 'Kantin Basement', kantin_id: 2, rating: 4.5, is_active: 1, image_url: '/images/kedai_joko.png' },
          { id: 4, name: 'Bakso Selera', kantin_name: 'Kantin Basement', kantin_id: 2, rating: 4.6, is_active: 1, image_url: '/images/kedai_bakso.png' }
        ]);
      });
  }, []);

  const handleAreaClick = (id) => {
    setSelectedArea(id);
    const section = document.getElementById('kedai-populer');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredKedai = selectedArea 
    ? kedai.filter(k => {
        const area = areas.find(a => a.id === selectedArea);
        return k.kantin_area_id === selectedArea || (area && k.kantin_name === area.name);
      })
    : kedai.slice(0, 8);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navbar */}
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
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
              <Link to="/home" className="btn btn-primary btn-sm">Mulai Pesan</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" style={{ background: 'radial-gradient(ellipse at 50% -20%, rgba(255,107,53,0.15) 0%, var(--bg-dark) 80%), radial-gradient(circle at 100% 100%, rgba(255,107,53,0.05) 0%, transparent 40%)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <div className="hero-badge">
              <span></span> Sistem Kantin Digital Kampus
            </div>
            <h1>Pesan Makanan Kampus<br />Lebih Mudah & Cepat</h1>
            <p>Temukan berbagai pilihan makanan dari kedai favorit di kampus. Pesan sekarang, ambil sendiri — tanpa antre panjang!</p>
            <div className="hero-actions">
              <Link to="/home" className="btn btn-primary btn-lg">
                🚀 Mulai Sekarang
              </Link>
              <Link to="/home" className="btn btn-secondary btn-lg">Lihat Kedai →</Link>
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
          </div>
        </div>
      </section>

      {/* Area Filter (Image 2 Style) */}
      <section style={{ padding: '2rem 0', background: 'var(--bg-dark)', borderBottom: '1px solid rgba(255,107,53,0.1)' }}>
        <div className="container">
          <div className="filter-row">
            <span className="filter-label">Filter Area:</span>
            <button 
              className={`filter-pill ${!selectedArea ? 'active' : ''}`} 
              onClick={() => setSelectedArea(null)}
            >
              Semua Area
            </button>
            {areas.map((area) => (
              <button 
                key={area.id} 
                className={`filter-pill ${selectedArea === area.id ? 'active' : ''}`} 
                onClick={() => setSelectedArea(area.id)}
              >
                {area.name.replace('Kantin ', '')}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Kedai */}
      <section id="kedai-populer" style={{ padding: '6rem 0', background: 'linear-gradient(180deg, var(--bg-dark) 0%, rgba(255,107,53,0.08) 40%, var(--bg-dark) 100%)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <h2 className="section-title">
                {selectedArea ? `Kedai di Area ${areas.find(a => a.id === selectedArea)?.name.replace('Kantin ', '')}` : 'Kedai Populer'}
              </h2>
              <p className="section-sub" style={{ marginBottom: 0 }}>Pilihan terbaik untuk mahasiswa hari ini</p>
            </div>
          </div>
          <div className="grid-kedai">
            {filteredKedai.length > 0 ? filteredKedai.map(k => (
              <Link to={`/kedai/${k.id}`} key={k.id} className="kedai-card">
                <div className="kedai-card-img">
                  <img src={k.image_url || (k.name.includes('Budi') ? '/images/kedai_budi.png' : k.name.includes('Sari') ? '/images/kedai_sari.png' : k.name.includes('Joko') ? '/images/kedai_joko.png' : '/images/kedai_bakso.png')} alt={k.name} />
                  <div className="kedai-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'inline',verticalAlign:'middle',marginRight:'3px'}}>
                      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                    </svg> {k.kantin_name?.replace('Kantin ', '')}
                  </div>
                  {k.rating >= 4.5 && (
                    <div className="populer-pill">🔥 POPULER</div>
                  )}
                  <div className={k.is_active ? 'kedai-status-badge open' : 'kedai-status-badge closed'}>
                    {k.is_active ? '● BUKA' : '● TUTUP'}
                  </div>
                </div>
                <div className="kedai-card-body">
                  <div className="kedai-card-name">{k.name}</div>
                  <div className="kedai-card-loc">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'inline',verticalAlign:'middle',marginRight:'4px',color:'var(--primary)'}}>
                      <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg> {k.kantin_name}
                  </div>
                  <div className="kedai-card-meta">
                    <span className="kedai-rating">⭐ {parseFloat(k.rating || 0).toFixed(1)}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mulai Rp 5rb</span>
                  </div>
                </div>
              </Link>
            )) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏗️</div>
                <h3 style={{ color: 'var(--text-secondary)' }}>Belum ada kedai di area ini</h3>
                <p style={{ color: 'var(--text-muted)' }}>Silakan pilih area lain</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '4rem 0', background: 'linear-gradient(135deg, rgba(255,107,53,0.1) 0%, var(--bg-dark) 50%, rgba(255,107,53,0.06) 100%)', borderTop: '1px solid rgba(255,107,53,0.15)', borderBottom: '1px solid rgba(255,107,53,0.15)' }}>
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
      <footer style={{ background: 'linear-gradient(180deg, var(--bg-dark) 0%, rgba(255,107,53,0.08) 100%)', borderTop: '1px solid rgba(255,107,53,0.2)', padding: '4rem 0 2rem', textAlign: 'center' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <div className="brand-icon" style={{ width: '28px', height: '28px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" fill="currentColor"/>
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Kantin<em style={{ color: 'var(--primary)', fontStyle: 'normal' }}>Ku</em></span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>© 2024 KantinKu — Sistem Pemesanan Makanan Digital Kampus</p>
        </div>
      </footer>
    </div>
  );
}
