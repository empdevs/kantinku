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
            <div className="stat-icon orange">👥</div>
            <div className="stat-info">
              <div className="stat-label">Total User</div>
              <div className="stat-value">{stats?.totalUsers || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">🏪</div>
            <div className="stat-info">
              <div className="stat-label">Kedai Aktif</div>
              <div className="stat-value">{stats?.activeKedai || 0}</div>
              <div className="stat-sub">dari {stats?.totalKedai || 0} total</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue">📋</div>
            <div className="stat-info">
              <div className="stat-label">Total Order</div>
              <div className="stat-value">{stats?.totalOrders || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow">💰</div>
            <div className="stat-info">
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value" style={{ fontSize: '1.3rem' }}>Rp {parseInt(stats?.totalRevenue || 0).toLocaleString('id')}</div>
            </div>
          </div>
        </div>

        {/* Pending Verification */}
        {stats?.pendingKedai > 0 && (
          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem' }}>⚠️</span>
            <span style={{ color: 'var(--warning)', fontWeight: 600 }}>{stats.pendingKedai} kedai menunggu verifikasi</span>
            <a href="/admin/kedai" style={{ marginLeft: 'auto', color: 'var(--warning)', fontSize: '0.85rem', fontWeight: 600 }}>Lihat →</a>
          </div>
        )}

        <div className="grid-2">
          {/* Area Stats */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">📍 Statistik per Area Kantin</div>
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
              <div className="card-title">📋 Pesanan Terbaru</div>
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
