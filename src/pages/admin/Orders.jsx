import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';

const STATUS_MAP = {
  pending: { label: 'Menunggu', cls: 'badge status-pending' },
  diproses: { label: 'Diproses', cls: 'badge status-diproses' },
  siap_diambil: { label: 'Siap Diambil', cls: 'badge status-siap_diambil' },
  selesai: { label: 'Selesai', cls: 'badge status-selesai' },
  dibatalkan: { label: 'Dibatalkan', cls: 'badge status-dibatalkan' },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { api.get('/admin/orders').then(r => { setOrders(r.data); setLoading(false); }); }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="with-sidebar main-content">
        <div className="page-header">
          <h2>Semua Pesanan</h2>
          <p>Monitor semua transaksi di seluruh kantin</p>
        </div>

        <div className="filter-row">
          {[['all','Semua'], ...Object.entries(STATUS_MAP).map(([v,{label}]) => [v, label])].map(([v,l]) => (
            <button key={v} className={`filter-pill ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>

        <div className="table-wrap">
          <table>
            <thead><tr><th>Kode</th><th>Customer</th><th>Kedai</th><th>Area</th><th>Pickup</th><th>Total</th><th>Status</th><th>Waktu</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Memuat...</td></tr>
              ) : filtered.map(o => (
                <tr key={o.id}>
                  <td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)', fontSize: '0.8rem' }}>{o.order_code}</span></td>
                  <td style={{ fontSize: '0.875rem', fontWeight: 500 }}>{o.customer_name}</td>
                  <td style={{ fontSize: '0.875rem' }}>{o.kedai_name}</td>
                  <td><span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{o.kantin_name}</span></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(o.pickup_time).toLocaleString('id', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>Rp {parseInt(o.total_price).toLocaleString('id')}</td>
                  <td><span className={STATUS_MAP[o.status]?.cls || 'badge badge-muted'}>{STATUS_MAP[o.status]?.label}</span></td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(o.created_at).toLocaleDateString('id')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
