import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';
import { toast } from '../../components/Toast';
import { QRCodeSVG as QRCode } from 'qrcode.react';

// Task 3: Status flow baru dengan konfirmasi kedai
const STEPS = [
  { key: 'pending',      label: 'Menunggu',     desc: 'Pesanan dikirim — menunggu konfirmasi kedai', icon: '⏳' },
  { key: 'diterima',     label: 'Diterima',     desc: 'Kedai telah menerima pesananmu', icon: '✅' },
  { key: 'diproses',     label: 'Diproses',     desc: 'Kedai sedang menyiapkan pesananmu', icon: '👨‍🍳' },
  { key: 'siap_diambil', label: 'Siap Diambil', desc: 'Pesananmu sudah siap! Segera ke kedai', icon: '🎯' },
  { key: 'selesai',      label: 'Selesai',      desc: 'Pesanan telah diambil. Selamat menikmati!', icon: '🎉' },
];

// Task 6: Pesan notifikasi kontekstual
const STATUS_NOTIF = {
  pending:      { bg: '#fff9e6', color: '#856404', icon: '⏳', msg: 'Menunggu konfirmasi kedai...' },
  diterima:     { bg: '#e6f7e6', color: '#155724', icon: '✅', msg: 'Pesanan Anda diterima oleh kedai!' },
  diproses:     { bg: '#e6f0ff', color: '#004085', icon: '👨‍🍳', msg: 'Pesanan Anda sedang diproses' },
  siap_diambil: { bg: 'rgba(255,107,53,0.08)', color: 'var(--primary)', icon: '🎯', msg: 'Pesanan SIAP DIAMBIL! Tunjukkan nomor pesanan Anda' },
  selesai:      { bg: '#e6f7e6', color: '#155724', icon: '🎉', msg: 'Pesanan selesai. Terima kasih!' },
  ditolak:      { bg: '#f8e6e6', color: '#721c24', icon: '❌', msg: 'Pesanan ditolak oleh kedai' },
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [review, setReview] = useState({ rating: null, comment: '' });

  const load = () => api.get(`/orders/${id}`).then(r => { setOrder(r.data); setLoading(false); });

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!review.comment.trim()) { toast.error('Keterangan wajib diisi'); return; }
    try {
      await api.post('/reviews', {
        kedai_id: order.kedai_id,
        order_id: order.id,
        menu_item_id: review.menu_item_id,
        rating: review.rating,
        comment: review.comment
      });
      toast.success('Ulasan berhasil dikirim! Terima kasih 🙏');
      setShowReview(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim ulasan');
    }
  };

  const currentStep = STEPS.findIndex(s => s.key === order?.status);
  const isRejected = order?.status === 'ditolak';
  const notif = order ? STATUS_NOTIF[order.status] : null;

  if (loading) return <div className="page-loading"><div className="loading-spinner" style={{ width: 40, height: 40, borderWidth: 3 }} /></div>;
  if (!order) return (
    <div className="page-loading">
      <p>Pesanan tidak ditemukan</p>
      <Link to="/orders" className="btn btn-primary" style={{ marginTop: '1rem' }}>← Kembali</Link>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: 820 }}>
        <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          ← Kembali ke Pesanan
        </Link>

        {/* Task 6: Status Notification Banner */}
        {notif && (
          <div style={{
            background: notif.bg, color: notif.color,
            borderRadius: 'var(--radius-md)', padding: '0.875rem 1.25rem',
            marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
            fontSize: '0.9rem', fontWeight: 500, border: `1px solid ${notif.color}22`
          }}>
            <span style={{ fontSize: '1.3rem' }}>{notif.icon}</span>
            <div style={{ flex: 1 }}>
              <strong>{notif.msg}</strong>
              {/* Task 5 & 6: Tampilkan nomor pesanan saat siap diambil */}
              {order.status === 'siap_diambil' && order.order_number && (
                <div style={{ marginTop: '0.4rem' }}>
                  Tunjukkan nomor pesanan:{' '}
                  <span style={{
                    fontFamily: 'monospace', fontWeight: 800, fontSize: '1rem',
                    background: 'var(--primary)', color: '#fff',
                    padding: '0.15rem 0.6rem', borderRadius: 'var(--radius-sm)'
                  }}>
                    {order.order_number}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Header Card */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              {/* Task 5: Tampilkan order_number jika sudah diterima */}
              {order.order_number ? (
                <>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Nomor Pesanan / Kode Pickup
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.05em' }}>
                    {order.order_number}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontFamily: 'monospace' }}>
                    Internal: {order.order_code}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Kode Pesanan</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                    {order.order_code}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Nomor pesanan akan muncul setelah dikonfirmasi kedai
                  </div>
                </>
              )}
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ fontWeight: 600 }}>{order.kedai_name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 {order.kantin_name}</div>
              </div>
            </div>
            {/* QR Code — hanya jika sudah ada order_number */}
            {order.order_number && (
              <div style={{ background: '#fff', padding: '0.75rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
                <QRCode value={`KANTINKU:${order.order_number}`} size={100} level="M" renderAs="svg" />
                <div style={{ textAlign: 'center', fontSize: '0.65rem', color: '#666', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                  {order.order_number}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Pickup: </span><strong>{new Date(order.pickup_time).toLocaleString('id', { dateStyle: 'long', timeStyle: 'short' })}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Total: </span><strong style={{ color: 'var(--primary)' }}>Rp {parseInt(order.total_price).toLocaleString('id')}</strong></div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Status: </span>
              <span className={`badge status-${order.status}`}>{order.status?.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Status Timeline / Rejected State */}
          {isRejected ? (
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>❌</div>
              <h3 style={{ color: 'var(--danger)' }}>Pesanan Ditolak</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Pesanan ini ditolak oleh kedai.</p>
              <Link to="/home" className="btn btn-primary" style={{ marginTop: '1rem' }}>Pesan Lagi →</Link>
            </div>
          ) : (
            <div className="card">
              <div className="card-title" style={{ marginBottom: '1.25rem' }}>📍 Status Pesanan</div>
              <div className="order-timeline">
                {STEPS.map((step, i) => {
                  const isDone = currentStep > i;
                  const isActive = currentStep === i;
                  return (
                    <div key={step.key} className={`timeline-step ${isDone ? 'done' : isActive ? 'active' : ''}`}>
                      <div className={`timeline-dot ${isDone ? 'done' : isActive ? 'active' : ''}`}>{step.icon}</div>
                      <div className="timeline-info">
                        <h4>{step.label}</h4>
                        <p>{isActive ? step.desc : isDone ? '✓ Selesai' : 'Menunggu'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: '1rem' }}>🍽️ Detail Pesanan</div>
            {order.items?.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                <img src={item.image_url || `https://picsum.photos/seed/${item.menu_item_id}di/48/48`} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.menu_name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Rp {parseInt(item.price).toLocaleString('id')} × {item.quantity}</div>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.875rem' }}>Rp {parseInt(item.subtotal).toLocaleString('id')}</div>
              </div>
            ))}
            {order.notes && (
              <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--bg-card2)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', borderLeft: '2px solid var(--primary)' }}>
                📝 <span style={{ color: 'var(--text-secondary)' }}>{order.notes}</span>
              </div>
            )}
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>Rp {parseInt(order.total_price).toLocaleString('id')}</span>
            </div>
          </div>
        </div>

        {/* Task 2B: Ulasan setelah selesai (rating opsional) */}
        {order.status === 'selesai' && (
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <div className="card-title" style={{ marginBottom: '0.75rem' }}>⭐ Berikan Ulasan</div>
            {!showReview ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <p style={{ flex: 1, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Bagaimana pengalaman kamu di <strong>{order.kedai_name}</strong>?
                </p>
                <button className="btn btn-primary" onClick={() => setShowReview(true)}>⭐ Tulis Ulasan</button>
              </div>
            ) : (
              <form onSubmit={submitReview}>
                {/* Ulasan Untuk Makanan atau Kedai */}
                <div className="form-group">
                  <label className="form-label">Ulasan Untuk</label>
                  <select className="form-control" value={review.menu_item_id || ''} onChange={e => setReview(r => ({ ...r, menu_item_id: e.target.value || null }))}>
                    <option value="">🏪 Pelayanan Kedai ({order.kedai_name})</option>
                    {order.items?.map(item => (
                      <option key={item.menu_item_id} value={item.menu_item_id}>🍽️ Menu: {item.menu_name}</option>
                    ))}
                  </select>
                </div>

                {/* Rating opsional */}
                <div className="form-group">
                  <label className="form-label">Rating <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opsional)</span></label>
                  <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} type="button"
                        onClick={() => setReview(r => ({ ...r, rating: r.rating === n ? null : n }))}
                        style={{ fontSize: '1.75rem', background: 'none', border: 'none', cursor: 'pointer', filter: (review.rating && n <= review.rating) ? 'none' : 'grayscale(1)', transition: 'filter 0.1s' }}>
                        ⭐
                      </button>
                    ))}
                    {review.rating && (
                      <button type="button" onClick={() => setReview(r => ({ ...r, rating: null }))}
                        style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        Hapus rating
                      </button>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Keterangan <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <textarea className="form-control" rows={3}
                    placeholder="Ceritakan pengalamanmu..."
                    value={review.comment}
                    onChange={e => setReview(r => ({ ...r, comment: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowReview(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary">Kirim Ulasan</button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
