import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const isHomePage = location.pathname === '/';
  const shouldBeSolid = !isHomePage || isScrolled;
  const iconColor = shouldBeSolid ? '#1a1a1a' : '#fff';

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
          {/* Contact text link */}
          <Link
            to="/contact"
            className="zanny-text-link"
            style={{
              fontSize: '0.78rem', fontWeight: 500, letterSpacing: '1px',
              color: iconColor, textDecoration: 'none',
              borderBottom: `1px solid ${shouldBeSolid ? 'transparent' : 'rgba(255,255,255,0.4)'}`,
              paddingBottom: '1px',
              transition: 'border-color 0.2s, color 0.35s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderBottomColor = iconColor}
            onMouseLeave={e => e.currentTarget.style.borderBottomColor = shouldBeSolid ? 'transparent' : 'rgba(255,255,255,0.4)'}
          >
            CONTACT
          </Link>

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
              cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              letterSpacing: 0,
              transition: 'all 0.35s',
              flexShrink: 0,
            }}
          >
            Z
          </motion.button>

          {/* Cart with diamond badge */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            style={{
              position: 'relative',
              background: 'none', border: 'none',
              cursor: 'pointer', color: iconColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0,
              flexShrink: 0,
            }}
          >
            <IconBag color={iconColor} />
            {/* Diamond-shaped badge — unique to Zanny */}
            <span style={{
              position: 'absolute',
              top: '-6px', right: '-7px',
              width: '14px', height: '14px',
              background: shouldBeSolid ? '#1a1a1a' : '#fff',
              color: shouldBeSolid ? '#fff' : '#1a1a1a',
              fontSize: '0.55rem',
              fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: 'rotate(45deg)',
              transition: 'all 0.35s',
            }}>
              <span style={{ transform: 'rotate(-45deg)' }}>0</span>
            </span>
          </motion.button>
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
              background: 'rgba(0,0,0,0.85)',
              zIndex: 200,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2rem',
              padding: '2rem',
            }}
          >
            <button
              onClick={() => setSearchOpen(false)}
              style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <IconX color="#fff" size={28} />
            </button>
            <p style={{ color: '#aaa', fontFamily: 'var(--font-heading)', letterSpacing: '3px', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              Search the Collection
            </p>
            <motion.div
              initial={{ width: '200px', opacity: 0 }}
              animate={{ width: 'min(600px, 90vw)', opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.3)',
                display: 'flex', alignItems: 'center', gap: '1rem',
                paddingBottom: '0.75rem',
              }}
            >
              <IconSearch color="#fff" />
              <input
                autoFocus
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  background: 'none', border: 'none', outline: 'none',
                  color: '#fff', fontSize: '1.2rem',
                  fontFamily: 'var(--font-body)', width: '100%',
                  caretColor: '#fff',
                }}
              />
            </motion.div>
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
                    { label: 'Collections', href: '/#collections' },
                    { label: 'Discover', href: '/#discover' },
                    { label: 'World of Zanny', href: '/#world-of-zanny' },
                  ].map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
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
                }}>Z</div>
                <div>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px', margin: 0 }}>MY ACCOUNT</p>
                  <p style={{ fontSize: '0.7rem', color: '#aaa', margin: 0 }}>Sign in or register</p>
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
