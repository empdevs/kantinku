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
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6981 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
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
            <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{color:'var(--primary)'}}>
                <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6981 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg> Notifikasi
            </span>
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
                <div style={{ marginBottom: '1rem', color: 'rgba(255,107,53,0.2)' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6981 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10.34 4.88C9.43 5.3 8.59 5.89 7.87 6.63C6.63 7.87 6 9.55 6 11.3V18.3H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18 8.3C18 6.55 17.37 4.87 16.13 3.63C14.89 2.39 13.21 1.76 11.46 1.76C10.23 1.76 9.04 2.11 8.01 2.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 18.3H10.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 22L2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
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
