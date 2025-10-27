import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import NavigationBar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import ProductCheckout from './pages/ProductCheckout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import Contact from './pages/Contact';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import MyReviews from './pages/MyReviews';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminUsers from './pages/AdminUsers';
import AdminOrders from './pages/AdminOrders';
import AdminIncome from './pages/AdminIncome';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { useAuth } from './context/AuthContext';
import './App.css';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/product-checkout" element={<ProductCheckout />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-failed" element={<PaymentFailed />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />} />
      <Route path="/admin/products" element={user?.role === 'admin' ? <AdminProducts /> : <Navigate to="/" replace />} />
      <Route path="/admin/users" element={user?.role === 'admin' ? <AdminUsers /> : <Navigate to="/" replace />} />
      <Route path="/admin/orders" element={user?.role === 'admin' ? <AdminOrders /> : <Navigate to="/" replace />} />
      <Route path="/admin/income" element={user?.role === 'admin' ? <AdminIncome /> : <Navigate to="/" replace />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/my-reviews" element={<MyReviews />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      offset: 100,
      once: true,
      easing: 'ease-out-cubic',
    });
  }, []);

  return (
    <CartProvider>
      <WishlistProvider>
        <NavigationBar />
        <main>
          <AppRoutes />
        </main>
        <Footer />
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;
