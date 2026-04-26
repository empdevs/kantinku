import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';
import { toast } from '../../components/Toast';

const STATUS_MAP = {
  pending: { label: 'Menunggu', cls: 'badge status-pending' },
  diproses: { label: 'Diproses', cls: 'badge status-diproses' },
  siap_diambil: { label: 'Siap Diambil', cls: 'badge status-siap_diambil' },
  selesai: { label: 'Selesai', cls: 'badge status-selesai' },
  dibatalkan: { label: 'Dibatalkan', cls: 'badge status-dibatalkan' },
};

const ICONS = {
  users: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  kedai: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  orders: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  revenue: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 1V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.29 3.86L1.82 18C1.64531 18.3024 1.55299 18.6452 1.55299 18.9939C1.55299 19.3426 1.64531 19.6854 1.82 19.9878C1.99469 20.2903 2.24715 20.5407 2.55013 20.7126C2.85311 20.8845 3.19532 20.9715 3.54 20.9639H20.46C20.8047 20.9715 21.1469 20.8845 21.4499 20.7126C21.7529 20.5407 22.0053 20.2903 22.18 19.9878C22.3547 19.6854 22.447 19.3426 22.447 18.9939C22.447 18.6452 22.3547 18.3024 22.18 18L13.71 3.86C13.5317 3.56619 13.2807 3.32319 12.9812 3.15449C12.6817 2.98579 12.3437 2.89722 12 2.89722C11.6563 2.89722 11.3183 2.98579 11.0188 3.15449C10.7193 3.32319 10.4683 3.56619 10.29 3.86V3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="app-layout">
      <Sidebar />
      <div className="with-sidebar main-content page-loading"><div className="loading-spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div></div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="with-sidebar main-content">
        <div className="page-header">
          <h2>Dashboard Admin</h2>
          <p>Ringkasan sistem KantinKu</p>
        </div>

        {/* Stat Cards */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-icon orange">{ICONS.users}</div>
            <div className="stat-info">
              <div className="stat-label">Total User</div>
              <div className="stat-value">{stats?.totalUsers || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">{ICONS.kedai}</div>
            <div className="stat-info">
              <div className="stat-label">Kedai Aktif</div>
              <div className="stat-value">{stats?.activeKedai || 0}</div>
              <div className="stat-sub">dari {stats?.totalKedai || 0} total</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue">{ICONS.orders}</div>
            <div className="stat-info">
              <div className="stat-label">Total Order</div>
              <div className="stat-value">{stats?.totalOrders || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow">{ICONS.revenue}</div>
            <div className="stat-info">
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value" style={{ fontSize: '1.3rem' }}>Rp {parseInt(stats?.totalRevenue || 0).toLocaleString('id')}</div>
            </div>
          </div>
        </div>

        {/* Pending Verification */}
        {stats?.pendingKedai > 0 && (
          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: 'var(--warning)' }}>{ICONS.warning}</span>
            <span style={{ color: 'var(--warning)', fontWeight: 600 }}>{stats.pendingKedai} kedai menunggu verifikasi</span>
            <a href="/admin/kedai" style={{ marginLeft: 'auto', color: 'var(--warning)', fontSize: '0.85rem', fontWeight: 600 }}>Lihat →</a>
          </div>
        )}

        <div className="grid-2">
          {/* Area Stats */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'8px', color:'var(--primary)'}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                Statistik per Area Kantin
              </div>
            </div>
            {stats?.areaStats?.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }}></div>
                <div style={{ flex: 1, fontSize: '0.875rem' }}>{a.name}</div>
                <div style={{ background: 'var(--bg-card2)', borderRadius: 'var(--radius-full)', height: 8, flex: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'linear-gradient(to right, var(--primary), var(--accent))', width: `${Math.max(5, (a.order_count / Math.max(...stats.areaStats.map(x=>x.order_count), 1)) * 100)}%`, borderRadius: 'inherit' }}></div>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', width: 30, textAlign: 'right' }}>{a.order_count}</div>
              </div>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'8px', color:'var(--primary)'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                Pesanan Terbaru
              </div>
            </div>
            {stats?.recentOrders?.slice(0, 5).map(order => (
              <div key={order.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{order.customer_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.kedai_name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>Rp {parseInt(order.total_price).toLocaleString('id')}</div>
                  <span className={STATUS_MAP[order.status]?.cls || 'badge badge-muted'}>{STATUS_MAP[order.status]?.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
