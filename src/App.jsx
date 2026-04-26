import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastContainer } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminKedai from './pages/admin/Kedai';
import AdminKantin from './pages/admin/Kantin';
import AdminOrders from './pages/admin/Orders';
import AdminWebsiteReviews from './pages/admin/WebsiteReviews';

// Merchant
import MerchantDashboard from './pages/merchant/Dashboard';
import MerchantKedai from './pages/merchant/Kedai';
import MerchantMenu from './pages/merchant/Menu';
import MerchantOrders from './pages/merchant/Orders';
import MerchantReviews from './pages/merchant/Reviews';

// Customer
import CustomerHome from './pages/customer/Home';
import KedaiDetail from './pages/customer/KedaiDetail';
import Cart from './pages/customer/Cart';
import MyOrders from './pages/customer/Orders';
import OrderDetail from './pages/customer/OrderDetail';
import OrderStatusCard from './components/OrderStatusCard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/kedai/:id" element={<KedaiDetail />} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/kedai" element={<ProtectedRoute roles={['admin']}><AdminKedai /></ProtectedRoute>} />
            <Route path="/admin/kantin" element={<ProtectedRoute roles={['admin']}><AdminKantin /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute roles={['admin']}><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/website-reviews" element={<ProtectedRoute roles={['admin']}><AdminWebsiteReviews /></ProtectedRoute>} />

            {/* Merchant */}
            <Route path="/merchant" element={<ProtectedRoute roles={['merchant']}><MerchantDashboard /></ProtectedRoute>} />
            <Route path="/merchant/kedai" element={<ProtectedRoute roles={['merchant']}><MerchantKedai /></ProtectedRoute>} />
            <Route path="/merchant/menu" element={<ProtectedRoute roles={['merchant']}><MerchantMenu /></ProtectedRoute>} />
            <Route path="/merchant/orders" element={<ProtectedRoute roles={['merchant']}><MerchantOrders /></ProtectedRoute>} />
            <Route path="/merchant/reviews" element={<ProtectedRoute roles={['merchant']}><MerchantReviews /></ProtectedRoute>} />

            {/* Customer (Browse is public) */}
            <Route path="/home" element={<CustomerHome />} />
            <Route path="/cart" element={<ProtectedRoute roles={['customer']}><Cart /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute roles={['customer']}><MyOrders /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute roles={['customer']}><OrderDetail /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <OrderStatusCard />
          <ToastContainer />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
