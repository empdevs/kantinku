import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';
import { toast } from '../../components/Toast';

export default function AdminKantin() {
  const [areas, setAreas] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', location_hint: '' });

  const load = () => api.get('/admin/kantin').then(r => setAreas(r.data));
  useEffect(() => { load(); }, []);

  const open = (a = null) => {
    setEditing(a);
    setForm(a ? { name: a.name, description: a.description || '', location_hint: a.location_hint || '' } : { name: '', description: '', location_hint: '' });
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/admin/kantin/${editing.id}`, form); toast.success('Area diperbarui'); }
      else { await api.post('/admin/kantin', form); toast.success('Area ditambahkan'); }
      setModal(false); load();
    } catch { toast.error('Gagal menyimpan'); }
  };

  const del = async (id) => {
    if (!confirm('Hapus area kantin ini?')) return;
    try { await api.delete(`/admin/kantin/${id}`); toast.success('Area dihapus'); load(); }
    catch { toast.error('Gagal menghapus'); }
  };

  const ICONS = ['🏫','🏢','🕌','🌲','⭐','🔴','🚪','🍽️','🏬','🌿'];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="with-sidebar main-content">
        <div className="page-header-row">
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h2>Area Kantin</h2>
            <p>Kelola lokasi kantin kampus</p>
          </div>
          <button className="btn btn-primary" onClick={() => open()}>+ Tambah Area</button>
        </div>

        <div className="grid-3" style={{ marginTop: '1.5rem' }}>
          {areas.map((a, i) => (
            <div key={a.id} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ fontSize: '2.5rem', width: 56, height: 56, background: 'var(--primary-glow)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {ICONS[i % ICONS.length]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{a.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{a.description || '-'}</div>
                  {a.location_hint && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {a.location_hint}</div>}
                  <div style={{ marginTop: '0.5rem' }}><span className="badge badge-info">{a.kedai_count} kedai</span></div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-sm btn-secondary" style={{ flex: 1 }} onClick={() => open(a)}>✏️ Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => del(a.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Area Kantin' : 'Tambah Area Kantin'}</div>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={save}>
              <div className="form-group"><label className="form-label">Nama Area</label><input className="form-control" placeholder="cth: Kantin Utama" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Deskripsi</label><textarea className="form-control" placeholder="Deskripsi singkat..." rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Petunjuk Lokasi</label><input className="form-control" placeholder="cth: Gedung Utama Lantai 1" value={form.location_hint} onChange={e => setForm({...form, location_hint: e.target.value})} /></div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
