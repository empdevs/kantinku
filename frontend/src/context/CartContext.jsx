import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [kedaiId, setKedaiId] = useState(null);
  const [kedaiName, setKedaiName] = useState('');

  const addItem = (item, fromKedaiId, fromKedaiName) => {
    if (kedaiId && kedaiId !== fromKedaiId) {
      if (!window.confirm('Cart Anda berisi item dari kedai lain. Hapus dan mulai dari kedai ini?')) return;
      setItems([]);
    }
    setKedaiId(fromKedaiId);
    setKedaiName(fromKedaiName);
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeItem = (id) => {
    setItems(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0);
      if (updated.length === 0) { setKedaiId(null); setKedaiName(''); }
      return updated;
    });
  };

  const clearCart = () => { setItems([]); setKedaiId(null); setKedaiName(''); };

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, kedaiId, kedaiName, addItem, removeItem, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
