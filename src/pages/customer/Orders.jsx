import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';

const STATUS_MAP = {
  pending:      { label: 'Menunggu',     cls: 'status-pending',      step: 0 },
  diterima:     { label: 'Diterima',     cls: 'status-diterima',     step: 1 },
  diproses:     { label: 'Diproses',     cls: 'status-diproses',     step: 2 },
  siap_diambil: { label: 'Siap Diambil', cls: 'status-siap_diambil', step: 3 },
  selesai:      { label: 'Selesai',      cls: 'status-selesai',      step: 4 },
  ditolak:      { label: 'Ditolak',      cls: 'status-dibatalkan',   step: -1 },
  dibatalkan:   { label: 'Dibatalkan',   cls: 'status-dibatalkan',   step: -1 },
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 42, height: 42, background: 'var(--primary-glow)', color: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyCenter: 'center', flexShrink: 0 }}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 13H8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17H8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
            </div>
            <div>
              <h2 style={{ margin: 0 }}>Pesanan Saya</h2>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Pantau status pesanan kamu secara real-time</p>
            </div>
          </div>
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
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{opacity:0.2}}>
                <path d="M22 12H16L14 15H10L8 12H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.45 5.11L2 12V18C2 18.5304 2.21071 19.0391 2.58579 19.4142C2.96086 19.7893 3.46957 20 4 20H20C20.5304 20 21.0391 19.7893 21.4142 19.4142C21.7893 19.0391 22 18.5304 22 18V12L18.55 5.11C18.3744 4.77583 18.1101 4.49479 17.7853 4.29705C17.4606 4.09931 17.0869 3.99181 16.7046 3.98583H7.2954C6.91312 3.99181 6.53942 4.09931 6.21468 4.29705C5.88994 4.49479 5.6256 4.77583 5.45 5.11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
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
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {order.kantin_name}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>Rp {parseInt(order.total_price).toLocaleString('id')}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {new Date(order.pickup_time).toLocaleString('id', { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
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
