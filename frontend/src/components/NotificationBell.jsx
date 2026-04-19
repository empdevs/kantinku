import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function NotificationBell() {
  const { user } = useAuth();
  const [data, setData] = useState({ notifications: [], unread_count: 0 });
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const load = () => {
    if (!user) return;
    api.get('/notifications').then(r => setData(r.data)).catch(() => {});
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, [user]);

  // Close panel ketika klik di luar
  useEffect(() => {
    const handle = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const markRead = async () => {
    await api.put('/notifications/read-all').catch(() => {});
    load();
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Baru saja';
    if (mins < 60) return `${mins} mnt lalu`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} jam lalu`;
    return `${Math.floor(hrs / 24)} hari lalu`;
  };

  if (!user || user.role !== 'customer') return null;

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      {/* Bell button */}
      <button
        id="notif-bell"
        onClick={() => { setOpen(v => !v); if (!open && data.unread_count > 0) markRead(); }}
        style={{
          position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
          padding: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '50%', transition: 'background 0.2s',
        }}
        title="Notifikasi"
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <span style={{ fontSize: '1.3rem' }}>🔔</span>
        {data.unread_count > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0,
            background: 'var(--danger)', color: '#fff',
            borderRadius: '50%', width: 18, height: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.65rem', fontWeight: 700,
            animation: 'pulse 1.5s infinite',
            boxShadow: '0 0 0 2px var(--bg-main)'
          }}>
            {data.unread_count > 9 ? '9+' : data.unread_count}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0,
          width: 340, maxHeight: 420,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)',
          zIndex: 1000, overflow: 'hidden',
          animation: 'fadeIn 0.2s ease',
        }}>
          {/* Header */}
          <div style={{
            padding: '0.875rem 1rem', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>🔔 Notifikasi</span>
            {data.unread_count > 0 && (
              <button
                onClick={markRead}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--primary)' }}
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', maxHeight: 350 }}>
            {data.notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔕</div>
                Belum ada notifikasi
              </div>
            ) : (
              data.notifications.map(n => (
                <Link
                  key={n.id}
                  to={n.order_id ? `/orders/${n.order_id}` : '#'}
                  onClick={() => setOpen(false)}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid var(--border)',
                    background: n.is_read ? 'transparent' : 'rgba(255,107,53,0.04)',
                    transition: 'background 0.2s',
                    display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                    cursor: 'pointer',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card2)'}
                    onMouseLeave={e => e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(255,107,53,0.04)'}
                  >
                    {!n.is_read && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 5 }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                        {n.message}
                      </div>
                      {n.order_number && (
                        <div style={{
                          display: 'inline-block', marginTop: '0.25rem',
                          background: 'var(--primary)', color: '#fff',
                          borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.5rem',
                          fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 700
                        }}>
                          {n.order_number}
                        </div>
                      )}
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {timeAgo(n.created_at)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
