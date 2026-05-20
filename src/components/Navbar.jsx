import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProducts, CATEGORIES } from '../context/ProductContext';

/* ── Zanny custom SVG icons ────────────────────────────────────── */
const IconGrid = ({ color }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.4">
    <rect x="2" y="2" width="6" height="6" rx="1" />
    <rect x="12" y="2" width="6" height="6" rx="1" />
    <rect x="2" y="12" width="6" height="6" rx="1" />
    <rect x="12" y="12" width="6" height="6" rx="1" />
  </svg>
);

const IconSearch = ({ color }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.4">
    <circle cx="8.5" cy="8.5" r="5" />
    <path d="M13 13 L18 18" strokeLinecap="round" />
  </svg>
);

const IconBag = ({ color }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.4">
    <path d="M4 7h12l-1.5 9H5.5L4 7z" strokeLinejoin="round" />
    <path d="M7 7V6a3 3 0 016 0v1" strokeLinecap="round" />
  </svg>
);

const IconX = ({ color, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" fill="none" stroke={color} strokeWidth="1.5">
    <path d="M4 4 L18 18M18 4 L4 18" strokeLinecap="round" />
  </svg>
);

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const isHomePage = location.pathname === '/';
  const shouldBeSolid = !isHomePage || isScrolled;
  const iconColor = shouldBeSolid ? '#1a1a1a' : '#fff';
  const { cartCount } = useCart();
  const { products } = useProducts();
  const navigate = useNavigate();

  const PAGES = [
    { id: 'collections', title: 'Collections', path: '/#collections' },
    { id: 'discover', title: 'Discover', path: '/discover' },
    { id: 'world-of-zanny', title: 'World of Zanny', path: '/world-of-zanny' },
    { id: 'contact', title: 'Contact Us', path: '/contact' },
    { id: 'shipping', title: 'Shipping & Returns', path: '/shipping' },
    { id: 'faqs', title: 'FAQs', path: '/faqs' },
    { id: 'care', title: 'Care Guide', path: '/care' },
  ];

  const getSearchResults = () => {
    const sq = searchQuery.toLowerCase().trim();
    if (sq.length < 2) return [];

    const results = [];

    // 1. Match Pages
    PAGES.forEach(page => {
      if (page.title.toLowerCase().includes(sq)) {
        results.push({ type: 'page', id: page.id, title: page.title, subtitle: 'Page', path: page.path });
      }
    });

    // 2. Match Categories
    CATEGORIES.forEach(cat => {
      if (cat.label.toLowerCase().includes(sq) || cat.description.toLowerCase().includes(sq)) {
        results.push({ type: 'category', id: cat.id, title: cat.label, subtitle: 'Category', path: `/collections/${cat.id}` });
      }
    });

    // 3. Match Products
    products.forEach(p => {
      const catLabel = CATEGORIES.find(c => c.id === p.category)?.label || 'Product';
      if (p.name.toLowerCase().includes(sq) || catLabel.toLowerCase().includes(sq) || (p.description && p.description.toLowerCase().includes(sq))) {
        results.push({ 
          type: 'product', 
          id: p.id, 
          title: p.name, 
          subtitle: catLabel,
          price: p.price,
          path: `/product/${p.id}`
        });
      }
    });

    // 4. Admin Portal
    if (sq === 'zanny-admin') {
      results.push({ type: 'admin', id: 'admin', title: 'Admin Console', subtitle: 'System', path: '/admin' });
    }

    return results.slice(0, 8); // Return top 8 results
  };

  const searchResults = getSearchResults();

  const handleSearchSelect = (path) => {
    setSearchOpen(false);
    setSearchQuery('');
    if (!path) return;
    
    if (path.startsWith('/#')) {
      navigate('/');
      setTimeout(() => {
        const id = path.split('#')[1];
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      navigate(path);
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="navbar-container"
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 50,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: shouldBeSolid ? 'rgba(255,255,255,0.97)' : 'transparent',
          backdropFilter: shouldBeSolid ? 'blur(14px)' : 'none',
          color: iconColor,
          borderBottom: shouldBeSolid ? '1px solid rgba(0,0,0,0.06)' : 'none',
          transition: 'all 0.35s ease',
        }}
      >
        {/* ── LEFT: grid menu + search ── */}
        <div style={{ display: 'flex', gap: '1.6rem', flex: 1, alignItems: 'center' }}>
          {/* Grid / Menu pill */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setMobileMenuOpen(true)}
            className="zanny-pill-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: shouldBeSolid ? '#f4f4f4' : 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50px',
              padding: '0.45rem 0.9rem',
              cursor: 'pointer',
              color: iconColor,
              fontFamily: 'var(--font-body)',
              fontSize: '0.78rem',
              fontWeight: 500,
              letterSpacing: '1px',
              backdropFilter: 'blur(4px)',
              transition: 'background 0.35s',
            }}
          >
            <IconGrid color={iconColor} />
            <span className="nav-pill-text">EXPLORE</span>
          </motion.button>

          {/* Search trigger */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setSearchOpen(true)}
            className="zanny-icon-ghost search-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'none', border: 'none',
              cursor: 'pointer', color: iconColor,
              fontFamily: 'var(--font-body)',
              fontSize: '0.78rem', fontWeight: 500, letterSpacing: '1px',
              padding: 0,
            }}
          >
            <IconSearch color={iconColor} />
            <span className="nav-pill-text">SEARCH</span>
          </motion.button>
        </div>

        {/* ── CENTER: Wordmark ── */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <Link
            to="/"
            className="navbar-logo"
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              letterSpacing: '5px',
              fontSize: '1.75rem',
              color: iconColor,
              textDecoration: 'none',
              transition: 'color 0.35s',
            }}
          >
            ZANNY
          </Link>
        </div>

        {/* ── RIGHT: contact + monogram + cart ── */}
        <div style={{ display: 'flex', gap: '1.2rem', flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
          {/* Auth Link */}
          {!isAuthenticated ? (
            <Link
              to="/login"
              className="zanny-text-link"
              style={{
                fontSize: '0.78rem', fontWeight: 700, letterSpacing: '1px',
                color: iconColor, textDecoration: 'none',
                paddingBottom: '1px',
                transition: 'opacity 0.2s',
              }}
            >
              SIGN IN
            </Link>
          ) : (
            <Link
              to="/account"
              className="zanny-text-link"
              style={{
                fontSize: '0.78rem', fontWeight: 700, letterSpacing: '1px',
                color: iconColor, textDecoration: 'none',
                paddingBottom: '1px', padding: 0,
                transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', gap: '0.3rem'
              }}
            >
              {user.firstName.toUpperCase()}
            </Link>
          )}

          {/* Monogram avatar (unique to Zanny) */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="user-btn"
            style={{
              width: '32px', height: '32px',
              borderRadius: '50%',
              border: `1.5px solid ${iconColor}`,
              background: 'transparent',
              color: iconColor,
              cursor: 'default',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              letterSpacing: 0,
              transition: 'all 0.35s',
              flexShrink: 0,
            }}
          >
            {isAuthenticated ? user.firstName[0] : "Z"}
          </motion.button>

          {/* Cart link with live diamond badge */}
          <Link
            to="/cart"
            style={{
              position: 'relative',
              color: iconColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              textDecoration: 'none',
            }}
          >
            <motion.span whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} style={{ display: 'flex' }}>
              <IconBag color={iconColor} />
            </motion.span>
            {/* Diamond badge — unique to Zanny */}
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.6 }} animate={{ scale: 1 }} exit={{ scale: 0.6 }}
                  style={{
                    position: 'absolute', top: '-6px', right: '-7px',
                    width: '15px', height: '15px',
                    background: shouldBeSolid ? '#1a1a1a' : '#fff',
                    color: shouldBeSolid ? '#fff' : '#1a1a1a',
                    fontSize: '0.5rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transform: 'rotate(45deg)', transition: 'background 0.35s, color 0.35s',
                  }}
                >
                  <span style={{ transform: 'rotate(-45deg)' }}>{cartCount}</span>
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </motion.nav>

      {/* ── SEARCH OVERLAY ── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.92)',
              zIndex: 200,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: '15vh',
              gap: '1.5rem',
              padding: '15vh 2rem 2rem',
            }}
          >
            <button
              onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
              style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <IconX color="#fff" size={28} />
            </button>
            <p style={{ color: '#666', fontFamily: 'var(--font-heading)', letterSpacing: '3px', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              Search the Collection
            </p>
            {/* Input */}
            <motion.div
              initial={{ width: '200px', opacity: 0 }}
              animate={{ width: 'min(600px, 90vw)', opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.25)',
                display: 'flex', alignItems: 'center', gap: '1rem',
                paddingBottom: '0.75rem', width: 'min(600px, 90vw)',
              }}
            >
              <IconSearch color="#aaa" />
              <input
                autoFocus
                type="text"
                placeholder="Products, categories..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  background: 'none', border: 'none', outline: 'none',
                  color: '#fff', fontSize: '1.3rem',
                  fontFamily: 'var(--font-body)', width: '100%',
                  caretColor: '#fff',
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: '1.2rem' }}>×</button>
              )}
            </motion.div>

            {/* Category quick links */}
            {!searchQuery && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', width: 'min(600px, 90vw)', marginTop: '0.5rem' }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleSearchSelect(`/collections/${cat.id}`)}
                    style={{
                      padding: '0.4rem 1rem', border: '1px solid #333',
                      background: 'transparent', color: '#aaa',
                      cursor: 'pointer', fontSize: '0.75rem', letterSpacing: '1px',
                      textTransform: 'uppercase', fontFamily: 'var(--font-body)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#aaa'; }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}

            {/* Live results */}
            {searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{ width: 'min(600px, 90vw)', display: 'flex', flexDirection: 'column', gap: '0' }}
              >
                {searchResults.map((res, i) => (
                  <button
                    key={`${res.type}-${res.id}-${i}`}
                    onClick={() => handleSearchSelect(res.path)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.9rem 0', borderBottom: '1px solid #222',
                      background: 'none', border: 'none',
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                    }}
                  >
                    <div>
                      <p style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.15rem', fontFamily: 'var(--font-heading)' }}>{res.title}</p>
                      <p style={{ color: '#666', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        {res.subtitle}
                      </p>
                    </div>
                    {res.price !== undefined && (
                      <p style={{ color: '#aaa', fontSize: '0.85rem', flexShrink: 0, marginLeft: '1rem' }}>KSh {res.price.toLocaleString()}</p>
                    )}
                  </button>
                ))}
              </motion.div>
            )}

            {searchQuery && searchResults.length === 0 && (
              <p style={{ color: '#555', fontSize: '0.9rem' }}>No results for "{searchQuery}"</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SIDEBAR MENU ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(5px)',
                zIndex: 90,
              }}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed', top: 0, left: 0, bottom: 0,
                width: '380px', maxWidth: '85vw',
                background: '#fafafa',
                color: '#1a1a1a',
                zIndex: 100,
                display: 'flex', flexDirection: 'column',
                boxShadow: '6px 0 30px rgba(0,0,0,0.12)',
                overflowY: 'auto',
              }}
            >
              {/* Sidebar header */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1.5rem 2rem',
                borderBottom: '1px solid #eee',
              }}>
                <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', letterSpacing: '4px', fontWeight: 800, color: '#1a1a1a', textDecoration: 'none' }}>
                  ZANNY
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                  <IconX color="#1a1a1a" size={22} />
                </button>
              </div>

              {/* Nav sections */}
              <div style={{ padding: '2rem', flex: 1 }}>
                <p style={{ fontSize: '0.7rem', letterSpacing: '2px', color: '#aaa', marginBottom: '1.2rem', textTransform: 'uppercase' }}>Discover</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {[
                    { label: 'Collections', to: '/#collections' },
                    { label: 'Discover', to: '/discover' },
                    { label: 'World of Zanny', to: '/world-of-zanny' },
                  ].map((item) => (
                    item.to.startsWith('/#') ? (
                      <a
                        key={item.label}
                        href={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className="sidebar-nav-item"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '1rem 0',
                          borderBottom: '1px solid #f0f0f0',
                          fontFamily: 'var(--font-heading)',
                          fontSize: '1.1rem',
                          color: '#1a1a1a',
                          textDecoration: 'none',
                          letterSpacing: '1px',
                        }}
                      >
                        {item.label}
                        <span style={{ fontSize: '1.2rem', color: '#ccc' }}>›</span>
                      </a>
                    ) : (
                      <Link
                        key={item.label}
                        to={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className="sidebar-nav-item"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '1rem 0',
                          borderBottom: '1px solid #f0f0f0',
                          fontFamily: 'var(--font-heading)',
                          fontSize: '1.1rem',
                          color: '#1a1a1a',
                          textDecoration: 'none',
                          letterSpacing: '1px',
                        }}
                      >
                        {item.label}
                        <span style={{ fontSize: '1.2rem', color: '#ccc' }}>›</span>
                      </Link>
                    )
                  ))}
                </div>

                <p style={{ fontSize: '0.7rem', letterSpacing: '2px', color: '#aaa', marginTop: '2rem', marginBottom: '1.2rem', textTransform: 'uppercase' }}>Client Services</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {[
                    { label: 'Contact Us', to: '/contact' },
                    { label: 'Shipping & Returns', to: '/shipping' },
                    { label: 'FAQs', to: '/faqs' },
                    { label: 'Care Guide', to: '/care' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.85rem 0',
                        borderBottom: '1px solid #f0f0f0',
                        fontSize: '0.9rem',
                        color: '#555',
                        textDecoration: 'none',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {item.label}
                      <span style={{ fontSize: '1rem', color: '#ddd' }}>›</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Bottom monogram */}
              <div style={{
                padding: '1.5rem 2rem',
                borderTop: '1px solid #eee',
                display: 'flex', alignItems: 'center', gap: '1rem',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  border: '1.5px solid #1a1a1a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem',
                }}>
                  {isAuthenticated ? user.firstName[0].toUpperCase() : 'Z'}
                </div>
                <div style={{ flex: 1 }}>
                  {isAuthenticated ? (
                    <>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px', margin: 0, textTransform: 'uppercase' }}>{user.firstName} {user.lastName}</p>
                      <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.3rem' }}>
                        <Link to="/account" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '0.75rem', color: '#555', textDecoration: 'underline' }}>Manage Account</Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px', margin: 0 }}>MY ACCOUNT</p>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                        <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '0.75rem', color: '#555', textDecoration: 'none' }}>Sign In</Link>
                        <span style={{ color: '#ccc', fontSize: '0.75rem' }}>|</span>
                        <Link to="/register" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '0.75rem', color: '#555', textDecoration: 'none' }}>Register</Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .navbar-container { padding: 0.85rem 2rem; }
        .navbar-logo { transition: opacity 0.2s; }
        .navbar-logo:hover { opacity: 0.7; }
        .zanny-text-link:hover { opacity: 0.7; }
        .sidebar-nav-item:hover { color: #666 !important; }
        .sidebar-nav-item:hover span { color: #999 !important; }

        @media (max-width: 900px) {
          .nav-pill-text { display: none; }
          .search-btn { display: none !important; }
          .user-btn { display: none !important; }
        }
        @media (max-width: 768px) {
          .navbar-container { padding: 0.75rem 1.2rem !important; }
          .navbar-logo { font-size: 1.3rem !important; }
        }
      `}</style>
    </>
  );
}
