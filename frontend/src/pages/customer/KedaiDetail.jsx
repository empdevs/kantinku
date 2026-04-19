import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../components/Toast';

const CAT_ICONS = { makanan: '🍽️', minuman: '🥤', snack: '🍿' };

export default function KedaiDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState('all');
  const { addItem, items } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/kedai/${id}`).then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
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
  if (!data) return <div className="page-loading" style={{ flexDirection: 'column', gap: '1rem' }}><div style={{ fontSize: '3rem' }}>😕</div><p>Kedai tidak ditemukan</p></div>;

  return (
    <div>
      <Navbar />
      {/* Banner */}
      <div style={{ height: 280, position: 'relative', overflow: 'hidden' }}>
        <img src={data.image_url || `https://picsum.photos/seed/${data.id}detail/1200/400`} alt={data.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 20%, rgba(15,15,18,0.95) 100%)' }}></div>
        <div className="container" style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>{data.name}</h1>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span className="badge badge-info">📍 {data.kantin_name}</span>
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
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{data.description}</p>

            {/* Category Filter */}
            <div className="filter-row">
              {categories.map(cat => (
                <button key={cat} className={`filter-pill ${catFilter === cat ? 'active' : ''}`} onClick={() => setCatFilter(cat)}>
                  {cat === 'all' ? '🔥 Semua' : `${CAT_ICONS[cat]} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
                </button>
              ))}
            </div>

            <div className="grid-menu">
              {menuByCategory(catFilter).map(item => (
                <div key={item.id} className="menu-card">
                  <div className="menu-card-img">
                    <img src={item.image_url || `https://picsum.photos/seed/${item.id}item/120/120`} alt={item.name} />
                  </div>
                  <div className="menu-card-info">
                    <div className="menu-card-name">{item.name}</div>
                    <div className="menu-card-desc">{item.description}</div>
                    <div className="menu-card-price">Rp {parseInt(item.price).toLocaleString('id')}</div>
                  </div>
                  <div className="menu-card-actions">
                    {item.is_available ? (
                      getQty(item.id) > 0 ? (
                        <div className="qty-control">
                          <span className="qty-value">{getQty(item.id)}x</span>
                        </div>
                      ) : null
                    ) : <span className="badge badge-muted">Habis</span>}
                    {item.is_available && (
                      <button className="btn btn-primary btn-sm" onClick={() => handleAdd(item)}>+ Tambah</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Sidebar */}
          <div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: '1rem' }}>⭐ Ulasan Pelanggan</div>
              {data.reviews?.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>Belum ada ulasan</div>
              ) : data.reviews?.map(r => (
                <div key={r.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.875rem', marginBottom: '0.875rem' }}>
                  {/* Header ulasan */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{r.customer_name}</div>
                      {r.menu_name ? (
                        <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.1rem' }}>🍽️ {r.menu_name}</div>
                      ) : (
                        <div style={{ fontSize: '0.72rem', color: 'var(--info)', fontWeight: 600, marginTop: '0.1rem' }}>🏪 Pelayanan Kedai</div>
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
