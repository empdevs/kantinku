import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../components/Toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer', phone: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password minimal 6 karakter'); return; }
    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Registrasi berhasil!');
      const map = { admin: '/admin', merchant: '/merchant', customer: '/home' };
      navigate(map[user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,107,53,0.1) 0%, transparent 60%), var(--bg-dark)', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2rem' }}>🍱</span>
            <span style={{ fontWeight: 800, fontSize: '1.4rem' }}>Kantin<em style={{ color: 'var(--primary)', fontStyle: 'normal' }}>Ku</em></span>
          </Link>
          <h2 style={{ marginBottom: '0.35rem' }}>Buat Akun Baru</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Bergabung dengan komunitas KantinKu</p>
        </div>

        <div className="card">
          {/* Role Selection */}
          <div className="form-group">
            <label className="form-label">Daftar Sebagai</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { value: 'customer', icon: '🎓', label: 'Mahasiswa', desc: 'Pesan makanan' },
                { value: 'merchant', icon: '🏪', label: 'Pemilik Kedai', desc: 'Jual makanan' },
              ].map(r => (
                <div
                  key={r.value}
                  onClick={() => setForm({...form, role: r.value})}
                  style={{
                    padding: '1rem', borderRadius: 'var(--radius-md)', border: `2px solid ${form.role === r.value ? 'var(--primary)' : 'var(--border)'}`,
                    background: form.role === r.value ? 'var(--primary-glow)' : 'var(--bg-card2)',
                    cursor: 'pointer', transition: 'var(--transition)', textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>{r.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input className="form-control" placeholder="Nama kamu" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" placeholder="email@kampus.ac.id" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">No. HP</label>
              <input className="form-control" placeholder="081234567890" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" placeholder="Min. 6 karakter" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? <><span className="loading-spinner"></span> Memproses...</> : '✨ Buat Akun'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Sudah punya akun? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}
