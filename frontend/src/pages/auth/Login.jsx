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
      toast.error(err.response?.data?.message || 'Login gagal');
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
            <span style={{ fontSize: '2rem' }}>🍱</span>
            <span style={{ fontWeight: 800, fontSize: '1.4rem' }}>Kantin<em style={{ color: 'var(--primary)', fontStyle: 'normal' }}>Ku</em></span>
          </Link>
          <h2 style={{ marginBottom: '0.35rem' }}>Selamat Datang!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Masuk ke akun KantinKu kamu</p>
        </div>

        <div className="card">
          {/* Demo accounts */}
          <div style={{ background: 'var(--bg-card2)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Demo Akun (password: password)</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={() => fillDemo('admin')} className="btn btn-sm btn-secondary">👑 Admin</button>
              <button onClick={() => fillDemo('merchant')} className="btn btn-sm btn-secondary">🏪 Merchant</button>
              <button onClick={() => fillDemo('customer')} className="btn btn-sm btn-secondary">🎓 Customer</button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-icon-wrap">
                <span className="icon">📧</span>
                <input className="form-control" type="email" placeholder="email@kampus.ac.id" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-icon-wrap">
                <span className="icon">🔒</span>
                <input className="form-control" type="password" placeholder="Password kamu" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? <><span className="loading-spinner"></span> Memproses...</> : '🚀 Masuk'}
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
