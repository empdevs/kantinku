import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';

const AREA_ICONS = ['🏫','🏢','🕌','🌲','⭐','🔴','🚪'];

export default function CustomerHome() {
  const [areas, setAreas] = useState([]);
  const [kedai, setKedai] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const activeArea = searchParams.get('kantin') || 'all';

  useEffect(() => {
    api.get('/kantin').then(r => setAreas(r.data));
  }, []);

  useEffect(() => {
    const params = {};
    if (activeArea !== 'all') params.kantin_area_id = activeArea;
    if (search) params.search = search;
    setLoading(true);
    api.get('/kedai', { params }).then(r => { setKedai(r.data); setLoading(false); });
  }, [activeArea, search]);

  const setArea = (id) => {
    if (id === 'all') searchParams.delete('kantin');
    else setSearchParams({ kantin: id });
  };

  return (
    <div>
      <Navbar onSearch={setSearch} />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        {/* Area Filter */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 className="section-title">Pilih Area Kantin</h2>
          <div className="kantin-area-grid" style={{ marginTop: '1rem' }}>
            <div className={`kantin-area-card ${activeArea === 'all' ? 'active' : ''}`} onClick={() => setArea('all')}>
              <div className="area-icon">🗺️</div>
              <div className="area-name">Semua Area</div>
              <div className="area-count">{kedai.length} kedai</div>
            </div>
            {areas.map((area, i) => (
              <div key={area.id} className={`kantin-area-card ${activeArea == area.id ? 'active' : ''}`} onClick={() => setArea(area.id)}>
                <div className="area-icon">{AREA_ICONS[i % AREA_ICONS.length]}</div>
                <div className="area-name">{area.name.replace('Kantin ', '')}</div>
                <div className="area-count">{area.kedai_count} kedai</div>
              </div>
            ))}
          </div>
        </div>

        {/* Kedai Grid */}
        <div className="page-header-row">
          <div>
            <h2 className="section-title">
              {activeArea === 'all' ? 'Semua Kedai' : areas.find(a => a.id == activeArea)?.name || 'Kedai'}
            </h2>
            <p className="section-sub">{kdnLabel(kedai.length, search)}</p>
          </div>
        </div>

        {loading ? (
          <div className="page-loading"><div className="loading-spinner" style={{ width: 36, height: 36, borderWidth: 3 }}></div></div>
        ) : kedai.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>Tidak ada kedai ditemukan</h3>
            <p>Coba ubah filter atau kata kunci pencarian</p>
          </div>
        ) : (
          <div className="grid-kedai">
            {kedai.map(k => (
              <Link to={`/kedai/${k.id}`} key={k.id} className="kedai-card">
                <div className="kedai-card-img" style={{ position: 'relative' }}>
                  <img src={k.image_url || `https://picsum.photos/seed/${k.id}/400/300`} alt={k.name} />
                  <div className="kedai-badge">📍 {k.kantin_name?.replace('Kantin ', '')}</div>
                </div>
                <div className="kedai-card-body">
                  <div className="kedai-card-name">{k.name}</div>
                  <div className="kedai-card-loc">🏪 {k.kantin_name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{k.description?.substring(0, 55)}...</div>
                  <div className="kedai-card-meta">
                    <span className="kedai-rating">⭐ {parseFloat(k.rating || 0).toFixed(1)} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({k.review_count})</span></span>
                    <span className={k.is_active ? 'kedai-status-open' : 'kedai-status-closed'}>{k.is_active ? 'Buka' : 'Tutup'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function kdnLabel(count, search) {
  if (search) return `${count} hasil untuk "${search}"`;
  return `${count} kedai tersedia`;
}
