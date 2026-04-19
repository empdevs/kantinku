import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';
import { toast } from '../../components/Toast';

export default function MerchantMenu() {
  const [menu, setMenu] = useState([]);
  const [kedai, setKedai] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ kedai_id: '', name: '', description: '', price: '', category: 'makanan', image_url: '', is_available: true });
  const [filterKedai, setFilterKedai] = useState('all');

  const load = () => {
    api.get('/merchant/kedai').then(r => { setKedai(r.data); if (r.data.length > 0 && form.kedai_id === '') setForm(f => ({...f, kedai_id: r.data[0].id})); });
    api.get('/merchant/menu').then(r => setMenu(r.data));
  };
  useEffect(() => { load(); }, []);

  const open = (item = null) => {
    setEditing(item);
    setForm(item ? { kedai_id: item.kedai_id, name: item.name, description: item.description || '', price: item.price, category: item.category, image_url: item.image_url || '', is_available: item.is_available } : { kedai_id: kedai[0]?.id || '', name: '', description: '', price: '', category: 'makanan', image_url: '', is_available: true });
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/merchant/menu/${editing.id}`, form); toast.success('Menu diperbarui'); }
      else { await api.post('/merchant/menu', form); toast.success('Menu ditambahkan'); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menyimpan'); }
  };

  const del = async (id) => {
    if (!confirm('Hapus menu ini?')) return;
    try { await api.delete(`/merchant/menu/${id}`); toast.success('Menu dihapus'); load(); }
    catch { toast.error('Gagal menghapus'); }
  };

  const filtered = filterKedai === 'all' ? menu : menu.filter(m => m.kedai_id == filterKedai);
  const catIcon = { makanan: '🍽️', minuman: '🥤', snack: '🍿' };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="with-sidebar main-content">
        <div className="page-header-row">
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h2>Kelola Menu</h2>
            <p>Tambah, edit, dan hapus menu kedai kamu</p>
          </div>
          <button className="btn btn-primary" onClick={() => open()}>+ Tambah Menu</button>
        </div>

        <div className="filter-row" style={{ marginTop: '1.5rem' }}>
          <button className={`filter-pill ${filterKedai === 'all' ? 'active' : ''}`} onClick={() => setFilterKedai('all')}>Semua Kedai</button>
          {kedai.map(k => <button key={k.id} className={`filter-pill ${filterKedai == k.id ? 'active' : ''}`} onClick={() => setFilterKedai(k.id)}>{k.name}</button>)}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🍽️</div><h3>Belum ada menu</h3><p>Tambahkan menu untuk kedai kamu</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Menu</th><th>Kedai</th><th>Kategori</th><th>Harga</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={m.image_url || `https://picsum.photos/seed/${m.id}m/48/48`} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{m.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.description?.substring(0, 35)}...</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>{kedai.find(k => k.id === m.kedai_id)?.name || '-'}</td>
                    <td><span className="badge badge-info">{catIcon[m.category]} {m.category}</span></td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>Rp {parseInt(m.price).toLocaleString('id')}</td>
                    <td>
                      <span className={`badge ${m.is_available ? 'badge-success' : 'badge-muted'}`}>
                        {m.is_available ? '✓ Tersedia' : '✗ Habis'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => open(m)}>✏️</button>
                        <button className="btn btn-sm btn-danger" onClick={() => del(m.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Menu' : 'Tambah Menu Baru'}</div>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={save}>
              <div className="form-group">
                <label className="form-label">Kedai</label>
                <select className="form-control" value={form.kedai_id} onChange={e => setForm({...form, kedai_id: e.target.value})}>
                  {kedai.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Nama Menu</label><input className="form-control" placeholder="Nama makanan/minuman" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Deskripsi</label><textarea className="form-control" rows={2} placeholder="Deskripsi singkat..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Harga (Rp)</label>
                  <input className="form-control" type="number" min={0} placeholder="15000" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Kategori</label>
                  <select className="form-control" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="makanan">🍽️ Makanan</option>
                    <option value="minuman">🥤 Minuman</option>
                    <option value="snack">🍿 Snack</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label className="form-label">URL Gambar (opsional)</label><input className="form-control" placeholder="https://..." value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} /></div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input type="checkbox" id="available" checked={form.is_available} onChange={e => setForm({...form, is_available: e.target.checked})} style={{ width: 18, height: 18 }} />
                <label htmlFor="available" className="form-label" style={{ margin: 0 }}>Menu Tersedia</label>
              </div>
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
