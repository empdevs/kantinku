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
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🛒</div>
          <h2 style={{ marginBottom: '0.75rem' }}>Cart Kamu Kosong</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Yuk mulai pilih makanan dari kedai favoritmu!</p>
          <Link to="/home" className="btn btn-primary btn-lg">🔍 Cari Kedai</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div className="page-header">
          <h2>🛒 Cart Saya</h2>
          <p>Periksa pesanan kamu sebelum checkout</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'flex-start' }}>
          {/* Items */}
          <div>
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '1.25rem' }}>🏪</span>
                <div><div style={{ fontWeight: 700 }}>{kedaiName}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{count} item</div></div>
                <button className="btn btn-danger btn-sm" style={{ marginLeft: 'auto' }} onClick={() => { if(confirm('Hapus semua item?')) clearCart(); }}>🗑️ Kosongkan</button>
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
              <div className="card-title" style={{ marginBottom: '0.75rem' }}>📝 Catatan Pesanan</div>
              <textarea className="form-control" rows={3} placeholder="Contoh: tanpa pedas, tambah nasi, dll..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>

          {/* Summary */}
          <div className="card" style={{ position: 'sticky', top: '1rem' }}>
            <div className="card-title" style={{ marginBottom: '1rem' }}>Ringkasan Pesanan</div>

            {/* Pickup Time */}
            <div className="form-group">
              <label className="form-label">⏰ Pilih Waktu Pickup</label>
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

            <button className="btn btn-primary btn-block btn-lg" onClick={handleOrder} disabled={loading || !pickupTime}>
              {loading ? <><span className="loading-spinner"></span> Memproses...</> : '🚀 Buat Pesanan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
