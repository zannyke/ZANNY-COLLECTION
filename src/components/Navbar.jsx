import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Menu, X, Heart, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="navbar-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        color: isScrolled ? '#000' : '#fff',
        borderBottom: isScrolled ? '1px solid rgba(0,0,0,0.05)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', gap: '2rem', flex: 1, alignItems: 'center' }}>
        <button onClick={() => setMobileMenuOpen(true)} className="nav-icon-btn">
          <Menu size={20} strokeWidth={1.5} />
          <span className="nav-text">Menu</span>
        </button>
        <button className="nav-icon-btn search-btn">
          <Search size={20} strokeWidth={1.5} />
          <span className="nav-text">Search</span>
        </button>
      </div>

      <div style={{ flex: 1, textAlign: 'center' }}>
        <Link to="/" className="navbar-logo" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, letterSpacing: '4px' }}>
          ZANNY
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
        <Link to="/contact" className="nav-text contact-link" style={{ marginRight: '1rem' }}>Contact Us</Link>
        <button className="nav-icon-btn">
          <Heart size={20} strokeWidth={1.5} />
        </button>
        <button className="nav-icon-btn user-btn">
          <User size={20} strokeWidth={1.5} />
        </button>
        <button className="nav-icon-btn" style={{ position: 'relative' }}>
          <ShoppingBag size={20} strokeWidth={1.5} />
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-8px',
            background: isScrolled ? '#000' : '#fff',
            color: isScrolled ? '#fff' : '#000',
            fontSize: '0.6rem',
            fontWeight: 'bold',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}>0</span>
        </button>
      </div>

      {/* Professional Sidebar Menu Implementation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 90,
                backdropFilter: 'blur(4px)'
              }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: '-100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '-100%' }}
              transition={{ type: 'tween', duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: '400px',
                maxWidth: '85vw',
                background: '#fff',
                color: '#000',
                zIndex: 100,
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '4px 0 24px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', letterSpacing: '2px', fontWeight: 'bold' }}>MENU</span>
                <X size={24} cursor="pointer" onClick={() => setMobileMenuOpen(false)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '4rem', fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
                 {['Collections', 'Discover', 'World of Zanny'].map((item) => (
                  <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} onClick={() => setMobileMenuOpen(false)} style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                    {item}
                  </a>
                ))}
                <Link to="/contact" onClick={() => setMobileMenuOpen(false)} style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>Contact Us</Link>
                <Link to="/shipping" onClick={() => setMobileMenuOpen(false)} style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>Shipping & Returns</Link>
                <Link to="/faqs" onClick={() => setMobileMenuOpen(false)} style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>FAQs</Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <style>{`
        .navbar-container {
          padding: 1rem 2rem;
        }
        .navbar-logo {
          font-size: 1.8rem;
          letter-spacing: 2px !important;
        }
        .nav-icon-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          font-family: inherit;
          padding: 0;
        }
        .nav-icon-btn:hover {
          opacity: 0.7;
        }
        .nav-text {
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 1px;
        }
        .contact-link {
          text-decoration: none;
        }
        .contact-link:hover {
          text-decoration: underline;
        }
        @media (max-width: 900px) {
          .nav-text { display: none; }
          .search-btn { display: none; }
          .user-btn { display: none; }
        }
        @media (max-width: 768px) {
          .navbar-container { padding: 1rem !important; }
          .navbar-logo { font-size: 1.3rem !important; }
        }
      `}</style>
    </motion.nav>
  );
}
