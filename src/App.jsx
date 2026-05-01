import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { ProductProvider } from './context/ProductContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import CookieConsent from './components/CookieConsent'
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

// Admin pages (no Navbar/Footer)
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AddProduct from './pages/admin/AddProduct'

import './index.css'

// Route guard for admin
function AdminRoute({ children }) {
  const isAuth = sessionStorage.getItem('zanny_admin') === 'true'
  return isAuth ? children : <Navigate to="/admin/login" replace />
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
  return (
    <>
      <Navbar />
      {children}
      <Footer />
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
            <Routes>
              {/* ── Admin (no navbar/footer) ── */}
              <Route path="/admin/login" element={<ThemeProvider><AdminLogin /></ThemeProvider>} />
              <Route path="/admin" element={<AdminRoute><ThemeProvider><AdminDashboard /></ThemeProvider></AdminRoute>} />
              <Route path="/admin/add-product" element={<AdminRoute><ThemeProvider><AddProduct /></ThemeProvider></AdminRoute>} />

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
              
              {/* Protected Order Flow */}
              <Route path="/cart" element={<PublicLayout><CartPage /></PublicLayout>} />
              
              <Route path="/collections/:categoryId" element={<PublicLayout><CategoryPage /></PublicLayout>} />
              <Route path="/product/:productId" element={<PublicLayout><ProductDetailPage /></PublicLayout>} />
            </Routes>
          </Router>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  )
}

export default App
