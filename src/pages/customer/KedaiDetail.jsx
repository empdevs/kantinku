import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../components/Toast';

const CAT_ICONS = { 
  makanan: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 3V11C6 13.12 7.39 14.92 9.3 15.55V21H10.7V15.55C12.61 14.92 14 13.12 14 11V3H12.6V8H11.2V3H9.8V8H8.4V3H6ZM19 3V12H16V15.5C16 18.54 18.46 21 21.5 21V3H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ), 
  minuman: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 5V3H5V5L7 20C7 21.1 7.9 22 9 22H15C16.1 22 17 21.1 17 20L19 5ZM15 20H9L7.27 7H16.73L15 20ZM11 10H13V12H11V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ), 
  snack: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6H6C4.9 6 4 6.9 4 8V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8C20 6.9 19.1 6 18 6ZM18 20H6V8H18V20ZM12 10V10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 13H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  all: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};

export default function KedaiDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState('all');
  const { addItem, items } = useCart();
  const { user } = useAuth();
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get(`/kedai/${id}`)
      .then(r => { 
        setData(r.data); 
        setLoading(false); 
      })
      .catch(err => { 
        console.error('Error fetching kedai:', err);
        setError(err.response?.data?.message || 'Gagal terhubung ke server');
        setLoading(false); 
      });
  }, [id]);

  const getQty = (menuId) => items.find(i => i.id === menuId)?.qty || 0;

  const handleAdd = (item) => {
    if (!user) { navigate('/login'); return; }
    addItem({ id: item.id, name: item.name, price: item.price, image_url: item.image_url }, data.id, data.name);
    toast.success(`${item.name} ditambahkan ke cart`);
  };

  const menuByCategory = (cat) => data?.menu?.filter(m => cat === 'all' || m.category === cat) || [];
  const categories = ['all', ...new Set(data?.menu?.map(m => m.category) || [])];

  if (loading) return <div className="page-loading"><div className="loading-spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div></div>;
  if (!data) return (
    <div className="page-loading" style={{ flexDirection: 'column', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
      <div style={{ fontSize: '4rem' }}>😕</div>
      <h2 style={{ color: 'var(--text-primary)' }}>{error || 'Kedai tidak ditemukan'}</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>Maaf, kami tidak dapat menemukan informasi kedai yang Anda cari. Pastikan link sudah benar.</p>
      <Link to="/home" className="btn btn-primary" style={{ marginTop: '1rem' }}>← Kembali ke Beranda</Link>
    </div>
  );

  return (
    <div>
      <Navbar />
      {/* Banner */}
      <div style={{ height: 380, position: 'relative', overflow: 'hidden' }}>
        <img src={data.image_url || '/images/kedai_budi.png'} alt={data.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 20%, rgba(15,15,18,0.95) 100%)' }}></div>
        <div className="container" style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>{data.name}</h1>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>{data.kantin_name}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>⭐ {parseFloat(data.rating || 0).toFixed(1)} ({data.review_count} ulasan)</span>
                <span className={`badge ${data.is_active ? 'badge-success' : 'badge-danger'}`}>{data.is_active ? 'Buka' : 'Tutup'}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              🕐 {data.open_time?.substring(0,5)} – {data.close_time?.substring(0,5)}
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'flex-start' }}>
          {/* Menu */}
          <div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.7' }}>{data.description}</p>

            {/* Category Filter */}
            <div className="filter-row" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
                {categories.map(cat => (
                  <button key={cat} className={`filter-pill ${catFilter === cat ? 'active' : ''}`} onClick={() => setCatFilter(cat)}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {cat === 'all' ? CAT_ICONS.all : CAT_ICONS[cat]}
                      {cat === 'all' ? 'Semua' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </span>
                  </button>
                ))}
              </div>
              
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/home')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-full)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Kembali
              </button>
            </div>

            <div className="grid-menu">
              {menuByCategory(catFilter).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)', border: '1px dashed var(--border)' }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem' }}>🍽️</div>
                  <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Belum Ada Menu</h3>
                  <p>Kedai ini belum menambahkan menu untuk kategori ini.</p>
                </div>
              ) : (
                menuByCategory(catFilter).map(item => (
                  <div key={item.id} className="menu-card">
                    <div className="menu-card-img">
                      <img 
                        src={item.image_url || '/images/menu_nasi_goreng.png'} 
                        alt={item.name} 
                        onError={(e) => { e.target.src = '/images/menu_nasi_goreng.png'; }}
                      />
                    </div>
                    <div className="menu-card-info">
                      <div className="menu-card-name" style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>{item.name}</div>
                      <div className="menu-card-desc" style={{ marginBottom: '0.75rem', fontSize: '0.85rem' }}>{item.description}</div>
                      <div className="menu-card-price" style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 800 }}>
                        Rp {parseInt(item.price).toLocaleString('id')}
                      </div>
                    </div>
                    <div className="menu-card-actions" style={{ minWidth: '100px' }}>
                      {item.is_available ? (
                        <>
                          {getQty(item.id) > 0 && (
                            <div className="qty-control" style={{ marginBottom: '0.5rem', background: 'var(--primary-glow)', border: '1px solid var(--primary)' }}>
                              <span className="qty-value" style={{ color: 'var(--primary)' }}>{getQty(item.id)}x di Cart</span>
                            </div>
                          )}
                          <button className="btn btn-primary btn-sm btn-block" onClick={() => handleAdd(item)} style={{ padding: '0.6rem 1rem' }}>
                            + Tambah
                          </button>
                        </>
                      ) : (
                        <span className="badge badge-muted" style={{ padding: '0.5rem 1rem' }}>Habis</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Reviews Sidebar */}
          <div className="sticky-sidebar">
            <div className="card" style={{ border: '1px solid var(--border)', background: 'rgba(26, 26, 32, 0.5)', backdropFilter: 'blur(10px)' }}>
              <div className="card-title" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--accent)' }}>★</span> Ulasan Pelanggan
              </div>
              
              {/* Form Ulasan (Public) */}
              <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--bg-card2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Tulis Ulasan Kamu</h4>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const payload = {
                    nama: user?.name || formData.get('nama'),
                    no_telp: user?.phone || formData.get('no_telp'),
                    rating: formData.get('rating'),
                    komentar: formData.get('komentar')
                  };
                  
                  try {
                    await api.post(`/kedai/${data.id}/reviews`, payload);
                    toast.success('Terima kasih atas ulasan kamu!');
                    e.target.reset();
                    // Refresh data
                    api.get(`/kedai/${data.id}`).then(r => setData(r.data));
                  } catch (err) {
                    toast.error(err.response?.data?.message || 'Gagal mengirim ulasan');
                  }
                }}>
                  {!user && (
                    <div className="grid-2" style={{ marginBottom: '0.75rem' }}>
                      <input name="nama" className="form-control text-sm" placeholder="Nama kamu" required />
                      <input name="no_telp" className="form-control text-sm" placeholder="No. Telp" required />
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rating:</span>
                    <select name="rating" className="form-control text-sm" style={{ width: 'auto', padding: '0.25rem 0.5rem' }}>
                      {[5,4,3,2,1].map(n => <option key={n} value={n}>{'⭐'.repeat(n)} ({n})</option>)}
                    </select>
                  </div>
                  <textarea name="komentar" className="form-control text-sm" rows={3} placeholder="Apa pendapatmu tentang kedai ini?" required style={{ marginBottom: '0.75rem' }} />
                  <button type="submit" className="btn btn-primary btn-sm btn-block">Kirim Ulasan</button>
                </form>
              </div>

              {data.reviews?.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>Belum ada ulasan</div>
              ) : data.reviews?.map(r => (
                <div key={r.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.875rem', marginBottom: '0.875rem' }}>
                  {/* Header ulasan */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{r.customer_name}</div>
                      {r.menu_name ? (
                        <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 9H9V2H7V9H5V2H3V9C3 11.12 4.39 12.92 6.3 13.55V22H7.7V13.55C9.61 12.92 11 11.12 11 9ZM16 2V12H13V15.5C13 18.54 15.46 21 18.5 21V2H16Z" fill="currentColor"/>
                          </svg>
                          {r.menu_name}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.72rem', color: 'var(--info)', fontWeight: 600, marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 9L12 2L21 9V20C21 21.1 20.1 22 19 22H5C3.9 22 3 21.1 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Pelayanan Kedai
                        </div>
                      )}
                    </div>
                    <span style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>
                      {r.rating ? '⭐'.repeat(r.rating) : <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Tanpa rating</span>}
                    </span>
                  </div>
                  {/* Komentar */}
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0' }}>{r.komentar}</p>

                  {/* Balasan pemilik kedai (thread reply) */}
                  {r.balasan_kedai && (
                    <div style={{
                      marginTop: '0.5rem',
                      marginLeft: '0.75rem',
                      paddingLeft: '0.75rem',
                      borderLeft: '2px solid var(--success, #22c55e)',
                      background: 'rgba(34,197,94,0.05)',
                      borderRadius: '0 4px 4px 0',
                      padding: '0.5rem 0.75rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span style={{
                          background: 'var(--success, #22c55e)', color: '#fff',
                          fontSize: '0.62rem', fontWeight: 700, padding: '0.1rem 0.4rem',
                          borderRadius: 'var(--radius-full)'
                        }}>Pemilik</span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>{r.balasan_kedai}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
