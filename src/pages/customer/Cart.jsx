import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import { toast } from '../../components/Toast';

export default function Cart() {
  const { items, kedaiId, kedaiName, addItem, removeItem, clearCart, total, count } = useCart();
  const [pickupTime, setPickupTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const minTime = () => {
    const d = new Date(Date.now() + 15 * 60 * 1000);
    d.setSeconds(0, 0);
    return d.toISOString().slice(0, 16);
  };

  const handleOrder = async () => {
    if (!pickupTime) { toast.error('Pilih waktu pickup terlebih dahulu'); return; }
    if (items.length === 0) { toast.error('Cart kosong'); return; }
    setLoading(true);
    try {
      const payload = {
        kedai_id: kedaiId,
        items: items.map(i => ({ menu_item_id: i.id, quantity: i.qty })),
        pickup_time: pickupTime,
        notes,
      };
      const res = await api.post('/orders', payload);
      clearCart();
      toast.success('Pesanan berhasil dibuat!');
      navigate(`/orders/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
          <div style={{ marginBottom: '1.5rem', color: 'rgba(255,107,53,0.15)' }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6924 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 style={{ marginBottom: '0.75rem' }}>Cart Kamu Kosong</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Yuk mulai pilih makanan dari kedai favoritmu!</p>
          <Link to="/home" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg> Cari Kedai
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div className="page-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{color:'var(--primary)'}}>
              <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6924 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg> Cart Saya
          </h2>
          <p>Periksa pesanan kamu sebelum checkout</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'flex-start' }}>
          {/* Items */}
          <div>
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{color:'var(--primary)'}}>
                  <path d="M3 9L12 2L21 9V20C21 21.1 20.1 22 19 22H5C3.9 22 3 21.1 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div><div style={{ fontWeight: 700 }}>{kedaiName}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{count} item</div></div>
                <button className="btn btn-danger btn-sm" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={() => { if(confirm('Hapus semua item?')) clearCart(); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19 6V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 6V4C8 3.4 8.4 3 9 3H15C15.6 3 16 3.4 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg> Kosongkan
                </button>
              </div>

              {items.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={item.image_url || `https://picsum.photos/seed/${item.id}ci/64/64`} alt={item.name} style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">Rp {parseInt(item.price).toLocaleString('id')}</div>
                  </div>
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => removeItem(item.id)}>−</button>
                    <span className="qty-value">{item.qty}</span>
                    <button className="qty-btn" onClick={() => addItem({ id: item.id, name: item.name, price: item.price, image_url: item.image_url }, kedaiId, kedaiName)}>+</button>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)', minWidth: '80px', textAlign: 'right' }}>
                    Rp {parseInt(item.price * item.qty).toLocaleString('id')}
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{color:'var(--primary)'}}>
                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg> Catatan Pesanan
              </div>
              <textarea className="form-control" rows={3} placeholder="Contoh: tanpa pedas, tambah nasi, dll..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>

          {/* Summary */}
          <div className="card" style={{ position: 'sticky', top: '1rem' }}>
            <div className="card-title" style={{ marginBottom: '1rem' }}>Ringkasan Pesanan</div>

            {/* Pickup Time */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{color:'var(--primary)'}}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg> Pilih Waktu Pickup
              </label>
              <input className="form-control" type="datetime-local" min={minTime()} value={pickupTime} onChange={e => setPickupTime(e.target.value)} />
              <div className="form-hint">Minimal 15 menit dari sekarang</div>
            </div>

            <hr className="divider" />

            {items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{item.name} x{item.qty}</span>
                <span>Rp {parseInt(item.price * item.qty).toLocaleString('id')}</span>
              </div>
            ))}

            <div className="cart-total">
              <span>Total Pembayaran</span>
              <span style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>Rp {parseInt(total).toLocaleString('id')}</span>
            </div>

            <div style={{ background: 'var(--bg-card2)', borderRadius: 'var(--radius-md)', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              📌 <strong>Pickup Only</strong> — Ambil pesananmu langsung di <strong>{kedaiName}</strong>
            </div>

            <button className="btn btn-primary btn-block btn-lg" onClick={handleOrder} disabled={loading || !pickupTime} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              {loading ? <><span className="loading-spinner"></span> Memproses...</> : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg> Buat Pesanan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
