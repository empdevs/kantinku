import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';

const ICONS = {
  orders: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  calendar: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  revenue: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 1V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  empty: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{opacity: 0.3}}>
      <path d="M22 12H16L14 15H10L8 12H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.45 5.11L2 12V18C2 18.5304 2.21071 19.0391 2.58579 19.4142C2.96086 19.7893 3.46957 20 4 20H20C20.5304 20 21.0391 19.7893 21.4142 19.4142C21.7893 19.0391 22 18.5304 22 18V12L18.55 5.11C18.3744 4.77583 18.1101 4.49479 17.7853 4.29705C17.4606 4.09931 17.0869 3.99181 16.7046 3.98583H7.2954C6.91312 3.99181 6.53942 4.09931 6.21468 4.29705C5.88994 4.49479 5.6256 4.77583 5.45 5.11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};

export default function MerchantDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/merchant/stats'), api.get('/merchant/orders')])
      .then(([s, o]) => { setStats(s.data); setOrders(o.data.slice(0, 5)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const STATUS_MAP = {
    pending: { label: 'Menunggu', cls: 'status-pending' },
    diproses: { label: 'Diproses', cls: 'status-diproses' },
    siap_diambil: { label: 'Siap Diambil', cls: 'status-siap_diambil' },
    selesai: { label: 'Selesai', cls: 'status-selesai' },
    dibatalkan: { label: 'Dibatalkan', cls: 'status-dibatalkan' },
  };

  if (loading) return (
    <div className="app-layout"><Sidebar /><div className="with-sidebar main-content page-loading"><div className="loading-spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div></div></div>
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="with-sidebar main-content">
        <div className="page-header">
          <h2>Dashboard Merchant</h2>
          <p>Pantau performa kedai kamu hari ini</p>
        </div>

        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="stat-card"><div className="stat-icon orange">{ICONS.orders}</div><div className="stat-info"><div className="stat-label">Hari Ini</div><div className="stat-value">{stats?.today || 0}</div><div className="stat-sub">pesanan</div></div></div>
          <div className="stat-card"><div className="stat-icon blue">{ICONS.calendar}</div><div className="stat-info"><div className="stat-label">7 Hari</div><div className="stat-value">{stats?.week || 0}</div><div className="stat-sub">pesanan</div></div></div>
          <div className="stat-card"><div className="stat-icon green">{ICONS.calendar}</div><div className="stat-info"><div className="stat-label">Bulan Ini</div><div className="stat-value">{stats?.month || 0}</div><div className="stat-sub">pesanan</div></div></div>
          <div className="stat-card"><div className="stat-icon yellow">{ICONS.revenue}</div><div className="stat-info"><div className="stat-label">Total Revenue</div><div className="stat-value" style={{ fontSize: '1.2rem' }}>Rp {parseInt(stats?.revenue || 0).toLocaleString('id')}</div></div></div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'8px', color:'var(--primary)'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              Pesanan Terbaru
            </div>
            <a href="/merchant/orders" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>Lihat Semua →</a>
          </div>
          {orders.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-icon">{ICONS.empty}</div>
              <h3>Belum ada pesanan</h3>
              <p>Pesanan masuk akan tampil di sini</p>
            </div>
          ) : orders.map(order => (
            <div key={order.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ background: 'var(--bg-card2)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem', fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>{order.order_code}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{order.customer_name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {order.items?.length || 0} item · Rp {parseInt(order.total_price).toLocaleString('id')}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${STATUS_MAP[order.status]?.cls}`}>{STATUS_MAP[order.status]?.label}</span>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{new Date(order.created_at).toLocaleDateString('id')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
