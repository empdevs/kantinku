import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';
import { toast } from '../../components/Toast';

export default function MerchantKedai() {
  const [kedai, setKedai] = useState([]);
  const [areas, setAreas] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ kantin_area_id: '', name: '', description: '', open_time: '07:00', close_time: '17:00', image_url: '', is_active: true });

  const load = () => {
    api.get('/merchant/kedai').then(r => setKedai(r.data));
    api.get('/kantin').then(r => setAreas(r.data));
  };
  useEffect(() => { load(); }, []);

  const open = (k = null) => {
    setEditing(k);
    setForm(k ? { kantin_area_id: k.kantin_area_id, name: k.name, description: k.description || '', open_time: k.open_time?.substring(0,5) || '07:00', close_time: k.close_time?.substring(0,5) || '17:00', image_url: k.image_url || '', is_active: k.is_active } : { kantin_area_id: areas[0]?.id || '', name: '', description: '', open_time: '07:00', close_time: '17:00', image_url: '', is_active: true });
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/merchant/kedai/${editing.id}`, form); toast.success('Kedai diperbarui'); }
      else { await api.post('/merchant/kedai', form); toast.success('Kedai dibuat! Menunggu verifikasi admin.'); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal'); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="with-sidebar main-content">
        <div className="page-header-row">
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h2>Kedai Saya</h2>
            <p>Kelola informasi kedai kamu</p>
          </div>
          <button className="btn btn-primary" onClick={() => open()}>+ Daftarkan Kedai</button>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          {kedai.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏪</div>
              <h3>Belum ada kedai</h3>
              <p>Daftarkan kedai kamu untuk mulai berjualan</p>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => open()}>+ Daftarkan Sekarang</button>
            </div>
          ) : (
            <div className="grid-2">
              {kedai.map(k => (
                <div key={k.id} className="card">
                  <img src={k.image_url || `https://picsum.photos/seed/${k.id}kd/400/200`} alt={k.name} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{k.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}><span className="badge badge-info">{k.kantin_name}</span></div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
                      <span className={`badge ${k.is_verified ? 'badge-success' : 'badge-warning'}`}>{k.is_verified ? '✓ Terverifikasi' : '⏳ Pending'}</span>
                      <span className={`badge ${k.is_active ? 'badge-info' : 'badge-muted'}`}>{k.is_active ? 'Aktif' : 'Nonaktif'}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>{k.description}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    <span>🕐 {k.open_time?.substring(0,5)} – {k.close_time?.substring(0,5)}</span>
                    <span>⭐ {parseFloat(k.rating || 0).toFixed(1)} ({k.review_count} ulasan)</span>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => open(k)}>✏️ Edit Kedai</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Kedai' : 'Daftarkan Kedai Baru'}</div>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={save}>
              <div className="form-group"><label className="form-label">Nama Kedai</label><input className="form-control" placeholder="Nama kedai kamu" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="form-group">
                <label className="form-label">Area Kantin</label>
                <select className="form-control" value={form.kantin_area_id} onChange={e => setForm({...form, kantin_area_id: e.target.value})} required>
                  <option value="">Pilih Area Kantin</option>
                  {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Deskripsi</label><textarea className="form-control" rows={3} placeholder="Deskripsi kedai kamu..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Buka</label><input className="form-control" type="time" value={form.open_time} onChange={e => setForm({...form, open_time: e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Tutup</label><input className="form-control" type="time" value={form.close_time} onChange={e => setForm({...form, close_time: e.target.value})} /></div>
              </div>
              <div className="form-group"><label className="form-label">URL Foto Kedai (opsional)</label><input className="form-control" placeholder="https://..." value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} /></div>
              {editing && (
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input type="checkbox" id="isActive" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} style={{ width: 18, height: 18 }} />
                  <label htmlFor="isActive" className="form-label" style={{ margin: 0 }}>Kedai Aktif</label>
                </div>
              )}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Simpan Perubahan' : 'Daftarkan Kedai'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
