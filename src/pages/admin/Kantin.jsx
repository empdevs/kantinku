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

  const ICONS = [
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"></path><path d="M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4"></path><path d="M5 21V10.85"></path><path d="M19 21V10.85"></path><path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"></path></svg>,
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22"></line><line x1="15" y1="22" x2="15" y2="22"></line></svg>,
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"></path><path d="M5 21V7l8-4v18"></path><path d="M13 21V11l6-3v13"></path></svg>
  ];

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
                <div style={{ color:'var(--primary)', width: 56, height: 56, background: 'var(--primary-glow)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {ICONS[i % ICONS.length]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{a.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{a.description || '-'}</div>
                  {a.location_hint && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      {a.location_hint}
                    </div>
                  )}
                  <div style={{ marginTop: '0.5rem' }}><span className="badge badge-info">{a.kedai_count} kedai</span></div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-sm btn-secondary" style={{ flex: 1, display: 'flex', alignItems:'center', justifyContent:'center', gap:'6px' }} onClick={() => open(a)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  Edit
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => del(a.id)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
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
              <button className="modal-close" onClick={() => setModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
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
