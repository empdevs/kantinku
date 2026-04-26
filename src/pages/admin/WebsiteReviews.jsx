import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';
import { toast } from '../../components/Toast';

export default function AdminWebsiteReviews() {
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [replyMap, setReplyMap] = useState({}); // { [id]: text }
  const [sending, setSending]   = useState(null);

  const load = () => {
    api.get('/admin/website-reviews')
      .then(r => { setReviews(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'baru saja';
    if (mins < 60) return `${mins} menit lalu`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs} jam lalu`;
    return `${Math.floor(hrs / 24)} hari lalu`;
  };

  const handleReply = async (id) => {
    const balasan = replyMap[id]?.trim();
    if (!balasan) { toast.error('Balasan tidak boleh kosong'); return; }
    setSending(id);
    try {
      await api.post(`/admin/website-reviews/${id}/reply`, { balasan });
      toast.success('Balasan berhasil dikirim');
      setReplyMap(m => ({ ...m, [id]: '' }));
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim balasan');
    } finally {
      setSending(null);
    }
  };

  const handleDeleteReply = async (id) => {
    if (!window.confirm('Hapus balasan ini?')) return;
    try {
      await api.delete(`/admin/website-reviews/${id}/reply`);
      toast.success('Balasan dihapus');
      load();
    } catch {
      toast.error('Gagal menghapus balasan');
    }
  };

  const avatarBg = (name) =>
    `hsl(${(name.charCodeAt(0) * 37) % 360}, 55%, 45%)`;

  if (loading) return (
    <div className="app-layout">
      <Sidebar />
      <div className="with-sidebar main-content page-loading">
        <div className="loading-spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="with-sidebar main-content">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 42, height: 42, background: 'var(--primary-glow)', color: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <div>
              <h2 style={{ margin: 0 }}>Ulasan Website</h2>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{reviews.length} ulasan masuk dari pengguna umum</p>
            </div>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon" style={{opacity:0.2}}>
               <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <h3>Belum ada ulasan</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {reviews.map(r => (
              <div key={r.id} className="card">
                {/* Header */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                    background: avatarBg(r.nama),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: '1rem'
                  }}>
                    {r.nama.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{r.nama}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display:'flex', alignItems:'center', gap:'8px' }}>
                      <span style={{display:'flex', alignItems:'center', gap:'3px'}}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        {r.no_telp}
                      </span>
                      <span style={{display:'flex', alignItems:'center', gap:'3px'}}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        {timeAgo(r.created_at)}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{r.id}</span>
                </div>

                {/* Isi ulasan */}
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1rem' }}>
                  {r.keterangan}
                </p>

                {/* Balasan admin yang sudah ada */}
                {r.balasan_admin && (
                  <div style={{
                    marginLeft: '1rem',
                    paddingLeft: '1rem',
                    borderLeft: '3px solid var(--primary)',
                    background: 'rgba(99,102,241,0.06)',
                    borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                    padding: '0.6rem 1rem',
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          background: 'var(--primary)', color: '#fff',
                          fontSize: '0.68rem', fontWeight: 700, padding: '0.12rem 0.45rem',
                          borderRadius: 'var(--radius-full)'
                        }}>Admin</span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {r.admin_name} · {timeAgo(r.balasan_at)}
                        </span>
                      </div>
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem' }}
                        onClick={() => handleDeleteReply(r.id)}
                      >Hapus</button>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{r.balasan_admin}</p>
                  </div>
                )}

                {/* Form balas */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    id={`reply-input-${r.id}`}
                    className="form-control"
                    placeholder={r.balasan_admin ? 'Edit balasan...' : 'Tulis balasan admin...'}
                    value={replyMap[r.id] || ''}
                    onChange={e => setReplyMap(m => ({ ...m, [r.id]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleReply(r.id)}
                    style={{ fontSize: '0.85rem' }}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={sending === r.id}
                    onClick={() => handleReply(r.id)}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {sending === r.id ? '...' : (r.balasan_admin ? 'Edit' : 'Balas')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
