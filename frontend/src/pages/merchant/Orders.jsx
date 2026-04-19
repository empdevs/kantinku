import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';
import { toast } from '../../components/Toast';

// Task 4: Status map dengan aksi Terima/Tolak
const STATUS_MAP = {
  pending:      { label: 'Menunggu Konfirmasi', cls: 'status-pending' },
  diterima:     { label: 'Diterima',            cls: 'status-diterima' },
  diproses:     { label: 'Diproses',            cls: 'status-diproses' },
  siap_diambil: { label: 'Siap Diambil',        cls: 'status-siap_diambil' },
  selesai:      { label: 'Selesai',             cls: 'status-selesai' },
  ditolak:      { label: 'Ditolak',             cls: 'status-dibatalkan' },
  dibatalkan:   { label: 'Dibatalkan',          cls: 'status-dibatalkan' },
};

// Aksi yang tersedia per status (sesuai validasi backend)
const ACTIONS = {
  pending:      [{ label: '✅ Terima Pesanan', status: 'diterima', cls: 'btn-success' }, { label: '❌ Tolak', status: 'ditolak', cls: 'btn-danger' }],
  diterima:     [{ label: '▶ Mulai Proses',   status: 'diproses', cls: 'btn-primary' }, { label: '❌ Tolak', status: 'ditolak', cls: 'btn-danger' }],
  diproses:     [{ label: '🎯 Siap Diambil',  status: 'siap_diambil', cls: 'btn-primary' }],
  siap_diambil: [{ label: '✅ Selesai',       status: 'selesai', cls: 'btn-success' }],
  selesai:      [],
  ditolak:      [],
  dibatalkan:   [],
};

export default function MerchantOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [processing, setProcessing] = useState(null);

  const load = () => api.get('/merchant/orders').then(r => { setOrders(r.data); setLoading(false); });
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);

  const updateStatus = async (id, status, label) => {
    if (!confirm(`${label} pesanan ini?`)) return;
    setProcessing(id + status);
    try {
      const res = await api.put(`/merchant/orders/${id}/status`, { status });
      toast.success(`Status diperbarui: ${label}`);
      // Jika diterima, tampilkan order_number
      if (res.data.order_number) {
        toast.success(`Nomor Pesanan: ${res.data.order_number}`, 5000);
      }
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal update status');
    } finally {
      setProcessing(null);
    }
  };

  const filtered = orders.filter(o => {
    if (filter === 'pending') return o.status === 'pending';
    if (filter === 'active') return ['diterima', 'diproses', 'siap_diambil'].includes(o.status);
    if (filter === 'done') return ['selesai', 'ditolak', 'dibatalkan'].includes(o.status);
    return true;
  });

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="with-sidebar main-content">
        <div className="page-header-row">
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h2>Pesanan Masuk {pendingCount > 0 && <span style={{ marginLeft: '0.5rem', background: 'var(--danger)', color: '#fff', borderRadius: '999px', padding: '0 0.5rem', fontSize: '0.8rem', fontWeight: 700, animation: 'pulse 1.5s infinite' }}>{pendingCount}</span>}</h2>
            <p>Konfirmasi pesanan dari pelanggan — auto-refresh setiap 30 detik</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={load}>🔄 Refresh</button>
        </div>

        {/* Filter tabs */}
        <div className="filter-row" style={{ marginTop: '1.5rem' }}>
          {[
            ['pending', `Menunggu${pendingCount > 0 ? ` (${pendingCount})` : ''}`],
            ['active', 'Aktif'],
            ['done', 'Selesai/Ditolak'],
            ['all', 'Semua']
          ].map(([v, l]) => (
            <button key={v} className={`filter-pill ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>
              {l}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="page-loading"><div className="loading-spinner" style={{ width: 36, height: 36, borderWidth: 3 }} /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{filter === 'pending' ? '✅' : '📭'}</div>
            <h3>{filter === 'pending' ? 'Tidak ada pesanan menunggu' : 'Tidak ada pesanan'}</h3>
            <p>Pesanan baru akan muncul di sini</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map(order => (
              <div key={order.id} className="card" style={{
                borderLeft: order.status === 'pending' ? '4px solid var(--warning)' :
                            order.status === 'diterima' ? '4px solid var(--success)' :
                            order.status === 'ditolak' ? '4px solid var(--danger)' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    {/* Task 5: Tampilkan order_number di dashboard kedai */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      {order.order_number ? (
                        <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '1.1rem', color: 'var(--primary)', background: 'rgba(255,107,53,0.1)', padding: '0.1rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                          {order.order_number}
                        </span>
                      ) : (
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                          {order.order_code}
                        </span>
                      )}
                      <span className={`badge ${STATUS_MAP[order.status]?.cls}`}>{STATUS_MAP[order.status]?.label}</span>
                      {order.status === 'pending' && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--warning)', fontWeight: 600, animation: 'pulse 2s infinite' }}>
                          ⚠️ Perlu konfirmasi
                        </span>
                      )}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{order.customer_name}</div>
                    {order.customer_phone && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📞 {order.customer_phone}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>Rp {parseInt(order.total_price).toLocaleString('id')}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>⏰ Pickup: {new Date(order.pickup_time).toLocaleString('id', { dateStyle: 'short', timeStyle: 'short' })}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      🕐 {new Date(order.created_at).toLocaleString('id', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div style={{ marginTop: '0.75rem', background: 'var(--bg-card2)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
                  {order.items?.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                      <span>{item.quantity}x {item.menu_name}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>Rp {parseInt(item.subtotal).toLocaleString('id')}</span>
                    </div>
                  ))}
                  {order.notes && (
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(255,107,53,0.05)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-secondary)', borderLeft: '2px solid var(--primary)' }}>
                      📝 {order.notes}
                    </div>
                  )}
                </div>

                {/* Task 4: Action buttons — Terima / Tolak */}
                {ACTIONS[order.status]?.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    {ACTIONS[order.status].map(action => (
                      <button
                        key={action.status}
                        className={`btn ${action.cls} btn-sm`}
                        disabled={processing === order.id + action.status}
                        onClick={() => updateStatus(order.id, action.status, action.label)}
                      >
                        {processing === order.id + action.status
                          ? <><span className="loading-spinner" /> Memproses...</>
                          : action.label
                        }
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
