import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';

const STATUS_MAP = {
  pending:      { label: '⏳ Menunggu',     cls: 'status-pending',      step: 0 },
  diterima:     { label: '✅ Diterima',     cls: 'status-diterima',     step: 1 },
  diproses:     { label: '🔄 Diproses',     cls: 'status-diproses',     step: 2 },
  siap_diambil: { label: '🎯 Siap Diambil', cls: 'status-siap_diambil', step: 3 },
  selesai:      { label: '🎉 Selesai',      cls: 'status-selesai',      step: 4 },
  ditolak:      { label: '❌ Ditolak',      cls: 'status-dibatalkan',   step: -1 },
  dibatalkan:   { label: '❌ Dibatalkan',   cls: 'status-dibatalkan',   step: -1 },
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    api.get('/orders/my').then(r => { setOrders(r.data); setLoading(false); });
  }, []);

  const filtered = orders.filter(o => {
    if (filter === 'active') return ['pending','diterima','diproses','siap_diambil'].includes(o.status);
    if (filter === 'done') return o.status === 'selesai';
    if (filter === 'cancel') return ['ditolak','dibatalkan'].includes(o.status);
    return true;
  });

  return (
    <div>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div className="page-header">
          <h2>📋 Pesanan Saya</h2>
          <p>Pantau status pesanan kamu secara real-time</p>
        </div>

        <div className="filter-row">
          {[['active','Aktif'],['done','Selesai'],['cancel','Dibatalkan'],['all','Semua']].map(([v,l]) => (
            <button key={v} className={`filter-pill ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>

        {loading ? (
          <div className="page-loading"><div className="loading-spinner" style={{ width: 36, height: 36, borderWidth: 3 }}></div></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{filter === 'active' ? '📭' : '📋'}</div>
            <h3>{filter === 'active' ? 'Tidak ada pesanan aktif' : 'Tidak ada pesanan'}</h3>
            <p>
              {filter === 'active' && <Link to="/home" style={{ color: 'var(--primary)', fontWeight: 600 }}>Mulai pesan sekarang →</Link>}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filtered.map(order => (
              <Link to={`/orders/${order.id}`} key={order.id} style={{ textDecoration: 'none' }}>
                <div className="card card-hover">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>{order.order_code}</span>
                        <span className={`badge ${STATUS_MAP[order.status]?.cls}`}>{STATUS_MAP[order.status]?.label}</span>
                      </div>
                      <div style={{ fontWeight: 600 }}>{order.kedai_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 {order.kantin_name}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>Rp {parseInt(order.total_price).toLocaleString('id')}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>⏰ {new Date(order.pickup_time).toLocaleString('id', { dateStyle: 'short', timeStyle: 'short' })}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{order.items?.length || 0} item</div>
                    </div>
                  </div>

                  {/* Status progress bar */}
                  {!['ditolak','dibatalkan'].includes(order.status) && (
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.35rem' }}>
                      {['Menunggu','Diterima','Diproses','Siap Diambil','Selesai'].map((s, i) => (
                        <div key={i} title={s} style={{ flex: 1, height: 4, borderRadius: 999, background: i <= (STATUS_MAP[order.status]?.step || 0) ? 'var(--primary)' : 'var(--bg-card2)', transition: 'background 0.3s ease' }} />
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
