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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const activeArea = searchParams.get('kantin') || 'all';

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // Tunggu 500ms setelah berhenti mengetik
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    api.get('/kantin')
      .then(r => setAreas(r.data))
      .catch(err => console.error('Gagal memuat area kantin:', err));
  }, []);

  useEffect(() => {
    const params = {};
    if (activeArea !== 'all') params.kantin_area_id = activeArea;
    if (debouncedSearch) params.search = debouncedSearch;
    setLoading(true);
    api.get('/kedai', { params })
      .then(r => { setKedai(r.data); setLoading(false); })
      .catch(err => { 
        console.error('Gagal memuat kedai:', err);
        setLoading(false); 
      });
  }, [activeArea, debouncedSearch]);

  const setArea = (id) => {
    if (id === 'all') {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('kantin');
      setSearchParams(newParams);
    } else {
      setSearchParams({ kantin: id });
    }
  };

  return (
    <div>
      <Navbar onSearch={setSearch} />
      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
        {/* Page Header */}
        <div className="page-header-row" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 className="section-title" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>
              {activeArea === 'all' ? 'Pilih Kedai Favoritmu' : `Kedai di ${areas.find(a => a.id == activeArea)?.name}`}
            </h1>
            <p className="section-sub" style={{ fontSize: '1rem' }}>{kdnLabel(kedai.length, search)}</p>
          </div>
        </div>

        {/* Compact Area Filter (Pills - Image 2 Style) */}
        <div className="filter-row" style={{ marginBottom: '2.5rem' }}>
          <span className="filter-label">Filter Area:</span>
          <button 
            className={`filter-pill ${activeArea === 'all' ? 'active' : ''}`} 
            onClick={() => setArea('all')}
          >
            Semua Area
          </button>
          {areas.map((area) => (
            <button 
              key={area.id} 
              className={`filter-pill ${activeArea == area.id ? 'active' : ''}`} 
              onClick={() => setArea(area.id)}
            >
              {area.name.replace('Kantin ', '')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="page-loading"><div className="loading-spinner" style={{ width: 36, height: 36, borderWidth: 3 }}></div></div>
        ) : kedai.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity: 0.2}}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
            </div>
            <h3>Tidak ada kedai ditemukan</h3>
            <p>Coba ubah filter atau kata kunci pencarian</p>
          </div>
        ) : (
          <div className="grid-kedai">
            {kedai.map(k => (
              <Link to={`/kedai/${k.id}`} key={k.id} className="kedai-card">
                <div className="kedai-card-img">
                  <img 
                    src={k.image_url || '/images/kedai_budi_premium.png'} 
                    alt={k.name} 
                    onError={(e) => { e.target.src = '/images/kedai_budi_premium.png'; }}
                  />
                  <div className="kedai-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'inline',verticalAlign:'middle',marginRight:'3px'}}>
                      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                    </svg> {k.kantin_name?.replace('Kantin ', '')}
                  </div>
                  {k.rating >= 4.5 && (
                    <div className="populer-pill">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.5 0.670044C13.5 0.670044 14.92 3.42004 14.92 5.11004C14.92 7.30004 13.6 8.59004 12 8.59004C10.4 8.59004 9.08 7.30004 9.08 5.11004C9.08 3.42004 10.5 0.670044 10.5 0.670044C10.5 0.670044 4.5 4.39004 4.5 12.01C4.5 16.14 7.86 19.5 12 19.5C16.14 19.5 19.5 16.14 19.5 12.01C19.5 4.39004 13.5 0.670044 13.5 0.670044ZM12 17.5C9.79 17.5 8 15.71 8 13.5C8 11.29 9.79 9.5 12 9.5C14.21 9.5 16 11.29 16 13.5C16 15.71 14.21 17.5 12 17.5Z" fill="currentColor"/>
                      </svg>
                      POPULER
                    </div>
                  )}
                  <div className={k.is_active ? 'kedai-status-badge open' : 'kedai-status-badge closed'}>
                    {k.is_active ? '● BUKA' : '● TUTUP'}
                  </div>
                </div>
                <div className="kedai-card-body">
                  <div className="kedai-card-name">{k.name}</div>
                  <div className="kedai-card-loc">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'inline',verticalAlign:'middle',marginRight:'4px',color:'var(--primary)'}}>
                      <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
 {k.kantin_name}
                  </div>
                  <div className="kedai-card-meta">
                    <span className="kedai-rating">⭐ {parseFloat(k.rating || 0).toFixed(1)}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mulai Rp 5rb</span>
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
