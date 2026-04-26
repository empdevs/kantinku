import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';
import { toast } from '../../components/Toast';

export default function MerchantReviews() {
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [replyMap, setReplyMap] = useState({});
  const [sending, setSending]   = useState(null);

  const load = () => {
    api.get('/merchant/reviews')
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
      await api.post(`/merchant/reviews/${id}/reply`, { balasan });
      toast.success('Balasan berhasil dikirim');
      setReplyMap(m => ({ ...m, [id]: '' }));
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim balasan');
    } finally {
      setSending(null);
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
          <h2>⭐ Ulasan Kedai</h2>
          <p>{reviews.length} ulasan dari pelanggan</p>
        </div>

        {reviews.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⭐</div>
            <h3>Belum ada ulasan</h3>
            <p>Ulasan dari pelanggan akan tampil di sini</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {reviews.map(r => (
              <div key={r.id} className="card">
                {/* Header */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                    background: avatarBg(r.customer_name),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: '1rem'
                  }}>
                    {r.customer_name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{r.customer_name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      🏪 {r.kedai_name}
                      {r.menu_name && <> · 🍽️ {r.menu_name}</>}
                      &nbsp;·&nbsp;{timeAgo(r.created_at)}
                    </div>
                  </div>
                  {r.rating && (
                    <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
                      {'⭐'.repeat(r.rating)} ({r.rating})
                    </span>
                  )}
                </div>

                {/* Komentar */}
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1rem' }}>
                  {r.komentar}
                </p>

                {/* Balasan kedai yang sudah ada */}
                {r.balasan_kedai && (
                  <div style={{
                    marginLeft: '1rem',
                    paddingLeft: '1rem',
                    borderLeft: '3px solid var(--success, #22c55e)',
                    background: 'rgba(34,197,94,0.06)',
                    borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                    padding: '0.6rem 1rem',
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{
                        background: 'var(--success, #22c55e)', color: '#fff',
                        fontSize: '0.68rem', fontWeight: 700, padding: '0.12rem 0.45rem',
                        borderRadius: 'var(--radius-full)'
                      }}>Pemilik Kedai</span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {timeAgo(r.balasan_at)}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{r.balasan_kedai}</p>
                  </div>
                )}

                {/* Form balas */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    id={`merchant-reply-${r.id}`}
                    className="form-control"
                    placeholder={r.balasan_kedai ? 'Edit balasan...' : 'Tulis balasan untuk ulasan ini...'}
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
                    {sending === r.id ? '...' : (r.balasan_kedai ? 'Edit' : 'Balas')}
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
