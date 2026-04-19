import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';
import { toast } from '../../components/Toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer', phone: '' });

  const load = () => api.get('/admin/users').then(r => { setUsers(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', email: '', password: '', role: 'customer', phone: '' }); setModal(true); };
  const openEdit = (u) => { setEditing(u); setForm({ name: u.name, email: u.email, password: '', role: u.role, phone: u.phone || '' }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/admin/users/${editing.id}`, form); toast.success('User diperbarui'); }
      else { await api.post('/admin/users', form); toast.success('User dibuat'); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus user ini?')) return;
    try { await api.delete(`/admin/users/${id}`); toast.success('User dihapus'); load(); }
    catch { toast.error('Gagal menghapus'); }
  };

  const roleColor = (role) => ({ admin: 'badge-danger', merchant: 'badge-warning', customer: 'badge-info' })[role];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="with-sidebar main-content">
        <div className="page-header-row">
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h2>Manajemen User</h2>
            <p>Kelola seluruh pengguna sistem</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ Tambah User</button>
        </div>
        <div style={{ marginTop: '1.5rem' }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>No. HP</th><th>Bergabung</th><th>Aksi</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Memuat...</td></tr>
                ) : users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td><span className={`badge ${roleColor(u.role)}`}>{u.role}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.phone || '-'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(u.created_at).toLocaleDateString('id')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(u)}>✏️</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit User' : 'Tambah User Baru'}</div>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Nama</label><input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-control" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
              {!editing && <div className="form-group"><label className="form-label">Password</label><input className="form-control" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required /></div>}
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-control" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                  <option value="customer">Customer</option>
                  <option value="merchant">Merchant</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">No. HP</label><input className="form-control" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Simpan' : 'Buat User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
