import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from './Toast';

export default function WebsiteReviews() {
  const [reviews, setReviews]     = useState([]);
  const [showForm, setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ nama: '', no_telp: '', keterangan: '' });

  const loadReviews = () => {
    api.get('/website-reviews').then(r => setReviews(r.data)).catch(() => {});
  };

  useEffect(() => { loadReviews(); }, []);

  const handleChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nama, no_telp, keterangan } = form;
    if (!nama.trim() || !no_telp.trim() || !keterangan.trim()) {
      toast.error('Semua field wajib diisi');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/website-reviews', form);
      toast.success('Ulasan berhasil dikirim! Terima kasih 🙏');
      setForm({ nama: '', no_telp: '', keterangan: '' });
      setShowForm(false);
      loadReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim ulasan');
    } finally {
      setSubmitting(false);
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'baru saja';
    if (mins < 60) return `${mins} menit lalu`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs} jam lalu`;
    return `${Math.floor(hrs / 24)} hari lalu`;
  };

  /** Avatar warna dinamis berbasis nama */
  const avatarBg = (name) =>
    `hsl(${(name.charCodeAt(0) * 37) % 360}, 55%, 45%)`;

  return (
    <section id="ulasan-website" style={{ padding: '5rem 0', background: 'var(--bg-card)' }}>
      <div className="container">
        <h2 className="section-title">💬 Ulasan Pengguna</h2>
        <p className="section-sub">Pendapat nyata dari pengguna KantinKu</p>

        {/* CTA Button */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <button
            id="btn-toggle-review-form"
            className="btn btn-primary btn-lg"
            onClick={() => setShowForm(v => !v)}
          >
            {showForm ? '✕ Tutup Form' : '✍️ Tulis Ulasan'}
          </button>
        </div>

        {/* Form Ulasan */}
        {showForm && (
          <div className="card" style={{ maxWidth: 600, margin: '0 auto 2.5rem', animation: 'fadeIn 0.3s ease' }}>
            <div className="card-title" style={{ marginBottom: '1.25rem' }}>✍️ Bagikan Pendapat Kamu</div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Nama */}
                <div className="form-group">
                  <label className="form-label">
                    Nama Lengkap <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    id="review-nama"
                    className="form-control"
                    placeholder="Nama kamu"
                    value={form.nama}
                    onChange={handleChange('nama')}
                  />
                </div>
                {/* No Telepon */}
                <div className="form-group">
                  <label className="form-label">
                    No. Telepon <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    id="review-no-telp"
                    className="form-control"
                    placeholder="08xxxxxxxxxx"
                    inputMode="tel"
                    value={form.no_telp}
                    onChange={handleChange('no_telp')}
                  />
                </div>
              </div>

              {/* Keterangan */}
              <div className="form-group">
                <label className="form-label">
                  Keterangan / Feedback <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <textarea
                  id="review-keterangan"
                  className="form-control"
                  rows={4}
                  placeholder="Ceritakan pengalamanmu menggunakan KantinKu..."
                  value={form.keterangan}
                  onChange={handleChange('keterangan')}
                />
                <div className="form-hint">Feedback ini akan ditampilkan secara publik</div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <><span className="loading-spinner" /> Mengirim...</> : '🚀 Kirim Ulasan'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List Ulasan (thread view: ulasan + balasan admin) */}
        {reviews.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem' }}>
            <div className="empty-icon">💬</div>
            <h3>Belum ada ulasan</h3>
            <p>Jadilah yang pertama memberikan ulasan!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 760, margin: '0 auto' }}>
            {reviews.map(r => (
              <div key={r.id} className="card card-hover" style={{ position: 'relative', overflow: 'hidden' }}>
                {/* Decorative quote */}
                <div style={{
                  position: 'absolute', top: '-8px', left: '1rem',
                  fontSize: '5rem', lineHeight: 1, color: 'var(--primary)',
                  opacity: 0.06, fontFamily: 'Georgia, serif', userSelect: 'none'
                }}>"</div>

                {/* Header ulasan */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                    background: avatarBg(r.nama),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: '1.1rem'
                  }}>
                    {r.nama.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{r.nama}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      📞 {r.no_telp.substring(0, 4) + '*'.repeat(Math.max(4, r.no_telp.length - 4))} · {timeAgo(r.created_at)}
                    </div>
                  </div>
                </div>

                {/* Isi ulasan */}
                <p style={{
                  fontSize: '0.9rem', color: 'var(--text-secondary)',
                  lineHeight: 1.7, margin: 0, position: 'relative', zIndex: 1
                }}>
                  {r.keterangan}
                </p>

                {/* Balasan admin (thread reply) */}
                {r.balasan_admin && (
                  <div style={{
                    marginTop: '0.875rem',
                    marginLeft: '1.25rem',
                    paddingLeft: '1rem',
                    borderLeft: '3px solid var(--primary)',
                    background: 'rgba(var(--primary-rgb, 99,102,241), 0.06)',
                    borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                    padding: '0.75rem 1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{
                        background: 'var(--primary)', color: '#fff',
                        fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-full)'
                      }}>Admin</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {r.admin_name} · {timeAgo(r.balasan_at)}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                      {r.balasan_admin}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
