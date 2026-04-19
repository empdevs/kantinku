import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import NotificationBell from './NotificationBell';

export default function Navbar({ onSearch }) {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');

  const handleLogout = () => { logout(); navigate('/'); };
  const handleSearch = (e) => {
    setSearchVal(e.target.value);
    onSearch && onSearch(e.target.value);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="brand-icon">🍱</div>
        <span>Kantin<em>Ku</em></span>
      </Link>

      {onSearch !== undefined && (
        <div className="navbar-search">
          <span>🔍</span>
          <input
            placeholder="Cari kedai atau makanan..."
            value={searchVal}
            onChange={handleSearch}
          />
        </div>
      )}

      <div className="navbar-actions">
        <Link to="/" className="navbar-link">Home</Link>
        {user ? (
          <>
            {user.role === 'customer' && (
              <Link to="/orders" className="navbar-link">Pesanan Saya</Link>
            )}
            {user.role === 'admin' && (
              <Link to="/admin" className="navbar-link">Dashboard</Link>
            )}
            {user.role === 'merchant' && (
              <Link to="/merchant" className="navbar-link">Dashboard</Link>
            )}

            {/* Task 6: Notification Bell (customer only) */}
            <NotificationBell />

            <div style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: 600 }}>
              👋 {user.name.split(' ')[0]}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary btn-sm">Masuk</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Daftar</Link>
          </>
        )}
        {user?.role === 'customer' && (
          <div className="cart-btn-wrap">
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/cart')}>
              🛒 Cart {count > 0 && <span className="cart-badge">{count}</span>}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
