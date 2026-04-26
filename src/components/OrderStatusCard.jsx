import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function OrderStatusCard() {
  const [order, setOrder] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setOrder(null);
      return;
    }

    const fetchActiveOrder = async () => {
      try {
        const res = await api.get('/orders/my');
        // Cari pesanan paling baru yang statusnya belum selesai/ditolak
        const active = res.data.find(o => !['selesai', 'ditolak'].includes(o.status));
        setOrder(active);
      } catch (err) {
        console.error('Gagal memuat status pesanan:', err);
      }
    };

    fetchActiveOrder();
    const interval = setInterval(fetchActiveOrder, 20000); // Update setiap 20 detik
    return () => clearInterval(interval);
  }, [user]);

  if (!order) return null;

  const firstItemName = order.items?.[0]?.menu_name || 'Pesanan Anda';
  const otherItemsCount = (order.items?.length || 1) - 1;

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'diterima': return 'Diterima';
      case 'diproses': return 'Diproses';
      case 'siap_diambil': return 'Siap Diambil';
      default: return 'Siap 15 mnt';
    }
  };

  return (
    <div className="floating-order-card" onClick={() => navigate(`/orders/${order.id}`)}>
      <div className="order-icon-box">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" fill="currentColor"/>
        </svg>
      </div>
      <div className="order-info-wrap">
        <div className="order-food-name">
          {firstItemName} {otherItemsCount > 0 ? `+${otherItemsCount}` : ''}
        </div>
        <div className="order-stall-name">{order.kedai_name}</div>
        <div className="order-meta-bottom">
          <div className="order-price-label">Rp {parseInt(order.total_price).toLocaleString('id')}</div>
          <div className="order-status-pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            {getStatusLabel(order.status)}
          </div>
        </div>
      </div>
    </div>
  );
}
