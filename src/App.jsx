import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { ProductProvider } from './context/ProductContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import ScrollToTop from './components/ScrollToTop'
import CookieConsent from './components/CookieConsent'
import AppBanner from './components/AppBanner'
import ReviewPopup from './components/ReviewPopup'
import { ThemeProvider } from './context/ThemeContext'

// Public pages
import Home from './pages/Home'
import ContactUs from './pages/ContactUs'
import ShippingReturns from './pages/ShippingReturns'
import FAQs from './pages/FAQs'
import CareGuide from './pages/CareGuide'
import TermsOfService from './pages/TermsOfService'
import PrivacyPolicy from './pages/PrivacyPolicy'
import CookiePolicy from './pages/CookiePolicy'
import CartPage from './pages/CartPage'
import CategoryPage from './pages/CategoryPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CustomerLogin from './pages/CustomerLogin'
import CustomerRegister from './pages/CustomerRegister'
import AccountPage from './pages/AccountPage'
import Discover from './pages/Discover'
import WorldOfZanny from './pages/WorldOfZanny'
import Checkout from './pages/Checkout'
import CollectionsPage from './pages/CollectionsPage'
import OrderSuccess from './pages/OrderSuccess'
import OrderDetailPage from './pages/OrderDetailPage'
import AppPage from './pages/AppPage'

// Admin pages (no Navbar/Footer)
import AdminDashboard from './pages/admin/AdminDashboard'
import AddProduct from './pages/admin/AddProduct'
import EditProduct from './pages/admin/EditProduct'
import NotFound from './pages/NotFound'

import './index.css'

// Route guard for admin (Strict RBAC + Obfuscation + Step-Up Auth)
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return null; // Wait for session check
  
  const isUnlocked = sessionStorage.getItem('zanny_admin_unlocked') === 'true';
  
  // Strict check: only allow if user is logged in, is an admin, AND has unlocked the dashboard
  if (!user || user.role !== 'admin' || !isUnlocked) {
    // Obfuscate the existence of the admin panel by showing a 404
    return <Navigate to="/404" replace />;
  }
  
  return children;
}

// Route guard for customers (Checkout protection)
function UserRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" state={{ from: location }} replace />;
}

// Layout with Navbar + Footer
function PublicLayout({ children }) {
  const location = useLocation();
  const hideHeader = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      {!hideHeader && <AppBanner />}
      <Navbar />
      {children}
      <CookieConsent />
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <Router>
            <ScrollToTop />
            <ReviewPopup />
            <Routes>
              {/* ── Admin (no navbar/footer) ── */}
              <Route path="/admin" element={<AdminRoute><ThemeProvider><AdminDashboard /></ThemeProvider></AdminRoute>} />
              <Route path="/admin/add-product" element={<AdminRoute><ThemeProvider><AddProduct /></ThemeProvider></AdminRoute>} />
              <Route path="/admin/product/edit/:id" element={<AdminRoute><ThemeProvider><EditProduct /></ThemeProvider></AdminRoute>} />

              {/* ── Public pages ── */}
              <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
              <Route path="/contact" element={<PublicLayout><ContactUs /></PublicLayout>} />
              <Route path="/shipping" element={<PublicLayout><ShippingReturns /></PublicLayout>} />
              <Route path="/faqs" element={<PublicLayout><FAQs /></PublicLayout>} />
              <Route path="/care" element={<PublicLayout><CareGuide /></PublicLayout>} />
              <Route path="/terms" element={<PublicLayout><TermsOfService /></PublicLayout>} />
              <Route path="/privacy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
              <Route path="/cookie" element={<PublicLayout><CookiePolicy /></PublicLayout>} />
              
              <Route path="/login" element={<PublicLayout><CustomerLogin /></PublicLayout>} />
              <Route path="/register" element={<PublicLayout><CustomerRegister /></PublicLayout>} />
              <Route path="/account" element={<UserRoute><PublicLayout><AccountPage /></PublicLayout></UserRoute>} />
              
              {/* Protected Order Flow */}
              <Route path="/cart" element={<PublicLayout><CartPage /></PublicLayout>} />
              <Route path="/checkout" element={<UserRoute><PublicLayout><Checkout /></PublicLayout></UserRoute>} />
              <Route path="/order-success" element={<UserRoute><PublicLayout><OrderSuccess /></PublicLayout></UserRoute>} />
              <Route path="/order/:orderId" element={<UserRoute><PublicLayout><OrderDetailPage /></PublicLayout></UserRoute>} />
              
              <Route path="/discover" element={<PublicLayout><Discover /></PublicLayout>} />
              <Route path="/world-of-zanny" element={<PublicLayout><WorldOfZanny /></PublicLayout>} />
              <Route path="/app" element={<PublicLayout><AppPage /></PublicLayout>} />
              
              <Route path="/collections" element={<PublicLayout><CollectionsPage /></PublicLayout>} />
              <Route path="/collections/:categoryId" element={<PublicLayout><CategoryPage /></PublicLayout>} />
              <Route path="/product/:productId" element={<PublicLayout><ProductDetailPage /></PublicLayout>} />
              
              {/* Catch-all for 404 Not Found */}
              <Route path="/404" element={<PublicLayout><NotFound /></PublicLayout>} />
              <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
            </Routes>
          </Router>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  )
}

export default App
