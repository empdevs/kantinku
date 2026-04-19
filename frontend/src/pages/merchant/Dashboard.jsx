import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';

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
    pending: { label: '⏳ Menunggu', cls: 'status-pending' },
    diproses: { label: '🔄 Diproses', cls: 'status-diproses' },
    siap_diambil: { label: '🎯 Siap Diambil', cls: 'status-siap_diambil' },
    selesai: { label: '✅ Selesai', cls: 'status-selesai' },
    dibatalkan: { label: '❌ Dibatalkan', cls: 'status-dibatalkan' },
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
          <div className="stat-card"><div className="stat-icon orange">📋</div><div className="stat-info"><div className="stat-label">Hari Ini</div><div className="stat-value">{stats?.today || 0}</div><div className="stat-sub">pesanan</div></div></div>
          <div className="stat-card"><div className="stat-icon blue">📅</div><div className="stat-info"><div className="stat-label">7 Hari</div><div className="stat-value">{stats?.week || 0}</div><div className="stat-sub">pesanan</div></div></div>
          <div className="stat-card"><div className="stat-icon green">📆</div><div className="stat-info"><div className="stat-label">Bulan Ini</div><div className="stat-value">{stats?.month || 0}</div><div className="stat-sub">pesanan</div></div></div>
          <div className="stat-card"><div className="stat-icon yellow">💰</div><div className="stat-info"><div className="stat-label">Total Revenue</div><div className="stat-value" style={{ fontSize: '1.2rem' }}>Rp {parseInt(stats?.revenue || 0).toLocaleString('id')}</div></div></div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">📋 Pesanan Terbaru</div>
            <a href="/merchant/orders" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>Lihat Semua →</a>
          </div>
          {orders.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-icon">📭</div>
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
