import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
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
      <div style={{ display: 'flex', gap: '2rem', flex: 1 }} className="nav-links">
        {['Collections', 'Discover', 'World of Zanny'].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase().replace(/ /g, '-')}`}
            style={{ fontSize: '0.875rem', fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase' }}
          >
            {item}
          </a>
        ))}
      </div>

      <div style={{ flex: 1, textAlign: 'center' }}>
        <Link to="/" className="navbar-logo" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, letterSpacing: '4px' }}>
          ZANNY
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
        <Search size={20} style={{ cursor: 'pointer' }} />
        <ShoppingBag size={20} style={{ cursor: 'pointer' }} />
        <Menu size={20} style={{ cursor: 'pointer', display: 'none' }} className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)} />
      </div>

      {/* Basic Mobile Menu Implementation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.4 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              background: '#fff',
              color: '#000',
              zIndex: 100,
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <X size={24} cursor="pointer" onClick={() => setMobileMenuOpen(false)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '4rem', fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>
               {['Collections', 'Discover', 'World of Zanny'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} onClick={() => setMobileMenuOpen(false)}>
                  {item}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        .navbar-container {
          padding: 1.5rem 2rem;
        }
        .navbar-logo {
          font-size: 2rem;
        }
        @media (max-width: 768px) {
          .navbar-container { padding: 1rem !important; }
          .navbar-logo { font-size: 1.5rem !important; }
          .nav-links { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </motion.nav>
  );
}
