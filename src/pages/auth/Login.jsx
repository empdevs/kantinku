import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../components/Toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {

    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);

      console.log(user)
      toast.success(`Selamat datang, ${user.name}!`);
      const map = { admin: '/admin', merchant: '/merchant', customer: '/home' };
      navigate(map[user.role] || '/');
    } catch (err) {
      console.error('LOGIN ERROR DETAILS:', err);
      toast.error(err.response?.data?.message || 'Login gagal. Periksa koneksi backend.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const creds = {
      admin: { email: 'admin@kantinku.id', password: 'password' },
      merchant: { email: 'budi@kantinku.id', password: 'password' },
      customer: { email: 'andi@student.ac.id', password: 'password' },
    };
    setForm(creds[role]);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,107,53,0.1) 0%, transparent 60%), var(--bg-dark)', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <div className="brand-icon" style={{ width: '32px', height: '32px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" fill="currentColor"/>
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.6rem' }}>Kantin<em style={{ color: 'var(--primary)', fontStyle: 'normal' }}>Ku</em></span>
          </Link>
          <h2 style={{ marginBottom: '0.35rem' }}>Selamat Datang!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Masuk ke akun KantinKu kamu</p>
        </div>

        <div className="card">
          {/* Demo accounts */}
          <div style={{ background: 'var(--bg-card2)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Demo Akun (password: password)</div>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button onClick={() => fillDemo('admin')} className="btn btn-sm btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"></path></svg>
                Admin
              </button>
              <button onClick={() => fillDemo('merchant')} className="btn btn-sm btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                Merchant
              </button>
              <button onClick={() => fillDemo('customer')} className="btn btn-sm btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                Customer
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-icon-wrap">
                <span className="icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </span>
                <input className="form-control" type="email" placeholder="email@kampus.ac.id" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-icon-wrap">
                <span className="icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </span>
                <input className="form-control" type="password" placeholder="Password kamu" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              {loading ? (
                <><span className="loading-spinner"></span> Memproses...</>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                  Masuk
                </>
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Belum punya akun? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Daftar sekarang</Link>
        </p>
      </div>
    </div>
  );
}
