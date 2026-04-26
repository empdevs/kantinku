import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';
import { toast } from '../../components/Toast';

export default function AdminKedai() {
  const [kedai, setKedai] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = () => api.get('/admin/kedai').then(r => { setKedai(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const verify = async (id) => {
    try { await api.put(`/admin/kedai/${id}/verify`); toast.success('Kedai terverifikasi!'); load(); }
    catch { toast.error('Gagal memverifikasi'); }
  };

  const deleteKedai = async (id) => {
    if (!confirm('Hapus kedai ini? Semua menu dan order terkait juga akan dihapus.')) return;
    try { await api.delete(`/admin/kedai/${id}`); toast.success('Kedai dihapus'); load(); }
    catch { toast.error('Gagal menghapus'); }
  };

  const filtered = kedai.filter(k => {
    if (filter === 'verified') return k.is_verified && k.is_active;
    if (filter === 'pending') return !k.is_verified;
    if (filter === 'inactive') return !k.is_active;
    return true;
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="with-sidebar main-content">
        <div className="page-header">
          <h2>Manajemen Kedai</h2>
          <p>Verifikasi dan kelola semua kedai di kampus</p>
        </div>

        <div className="filter-row" style={{ marginBottom: '1.5rem' }}>
          {[['all','Semua'],['verified','Aktif & Terverifikasi'],['pending','Menunggu Verifikasi'],['inactive','Tidak Aktif']].map(([v, l]) => (
            <button key={v} className={`filter-pill ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>

        <div className="table-wrap">
          <table>
            <thead><tr><th>Kedai</th><th>Merchant</th><th>Area Kantin</th><th>Jam Operasi</th><th>Rating</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Memuat...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">🏪</div><h3>Tidak Ada Kedai</h3></div></td></tr>
              ) : filtered.map(k => (
                <tr key={k.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={k.image_url || `https://picsum.photos/seed/${k.id}k/64/64`} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{k.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{k.description?.substring(0, 40)}...</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.875rem' }}>{k.merchant_name}</td>
                  <td><span className="badge badge-info">{k.kantin_name}</span></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{k.open_time?.substring(0,5)} - {k.close_time?.substring(0,5)}</td>
                  <td style={{ color: 'var(--accent)', fontWeight: 600 }}>⭐ {parseFloat(k.rating || 0).toFixed(1)}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span className={`badge ${k.is_verified ? 'badge-success' : 'badge-warning'}`}>
                        {k.is_verified ? 'Terverifikasi' : 'Pending'}
                      </span>
                      <span className={`badge ${k.is_active ? 'badge-info' : 'badge-muted'}`}>{k.is_active ? 'Aktif' : 'Nonaktif'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {!k.is_verified && (
                        <button className="btn btn-sm btn-success" onClick={() => verify(k.id)} title="Verifikasi">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </button>
                      )}
                      <button className="btn btn-sm btn-danger" onClick={() => deleteKedai(k.id)} title="Hapus">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
