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
  pending: [
    { label: 'Terima Pesanan', status: 'diterima', cls: 'btn-success', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'6px'}}><polyline points="20 6 9 17 4 12"></polyline></svg> },
    { label: 'Tolak', status: 'ditolak', cls: 'btn-danger', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'6px'}}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> }
  ],
  diterima: [
    { label: 'Mulai Proses', status: 'diproses', cls: 'btn-primary', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'6px'}}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> },
    { label: 'Tolak', status: 'ditolak', cls: 'btn-danger', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'6px'}}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> }
  ],
  diproses: [
    { label: 'Siap Diambil', status: 'siap_diambil', cls: 'btn-primary', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'6px'}}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> }
  ],
  siap_diambil: [
    { label: 'Selesai', status: 'selesai', cls: 'btn-success', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'6px'}}><polyline points="20 6 9 17 4 12"></polyline></svg> }
  ],
  selesai: [],
  ditolak: [],
  dibatalkan: [],
};

export default function MerchantOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
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
          <button className="btn btn-secondary btn-sm" style={{display:'flex', alignItems:'center', gap:'6px'}} onClick={load}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            Refresh
          </button>
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
            <div className="empty-icon" style={{opacity:0.2}}>
               <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"></path><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
            </div>
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
                        <span style={{ fontSize: '0.72rem', color: 'var(--warning)', fontWeight: 600, animation: 'pulse 2s infinite', display:'flex', alignItems:'center', gap:'4px' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                          Perlu konfirmasi
                        </span>
                      )}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{order.customer_name}</div>
                    {order.customer_phone && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display:'flex', alignItems:'center', gap:'4px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      {order.customer_phone}
                    </div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>Rp {parseInt(order.total_price).toLocaleString('id')}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Pickup: {new Date(order.pickup_time).toLocaleString('id', { dateStyle: 'short', timeStyle: 'short' })}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      Order: {new Date(order.created_at).toLocaleString('id', { dateStyle: 'short', timeStyle: 'short' })}
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
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(255,107,53,0.05)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-secondary)', borderLeft: '2px solid var(--primary)', display:'flex', alignItems:'center', gap:'4px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                      {order.notes}
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
                        style={{display:'flex', alignItems:'center'}}
                        disabled={processing === order.id + action.status}
                        onClick={() => updateStatus(order.id, action.status, action.label)}
                      >
                        {processing === order.id + action.status
                          ? <><span className="loading-spinner" /> Memproses...</>
                          : <>{action.icon}{action.label}</>
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
