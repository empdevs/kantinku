import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { to: '/admin',                icon: '📊', label: 'Dashboard',         end: true },
  { to: '/admin/users',         icon: '👥', label: 'Manajemen User' },
  { to: '/admin/kedai',         icon: '🏪', label: 'Manajemen Kedai' },
  { to: '/admin/kantin',        icon: '📍', label: 'Area Kantin' },
  { to: '/admin/orders',        icon: '📋', label: 'Semua Pesanan' },
  { to: '/admin/website-reviews', icon: '💬', label: 'Ulasan Website' },
];

const merchantLinks = [
  { to: '/merchant',         icon: '📊', label: 'Dashboard',     end: true },
  { to: '/merchant/kedai',   icon: '🏪', label: 'Kedai Saya' },
  { to: '/merchant/menu',    icon: '🍽️', label: 'Kelola Menu' },
  { to: '/merchant/orders',  icon: '📋', label: 'Pesanan Masuk' },
  { to: '/merchant/reviews', icon: '⭐', label: 'Ulasan Kedai' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = user?.role === 'admin' ? adminLinks : merchantLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🍱</div>
        <span>Kantin<em>Ku</em></span>
      </div>

      <nav>
        <div className="nav-label">Menu Utama</div>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Logout">🚪</button>
        </div>
      </div>
    </aside>
  );
}
