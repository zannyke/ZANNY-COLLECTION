import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [prefs, setPrefs] = useState({
    essential: true,   // always on
    analytics: true,
    marketing: true,
    functional: true,
  });

  useEffect(() => {
    const consent = localStorage.getItem('zanny_consent');
    if (!consent) {
      // Small delay so page loads first
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('zanny_consent', JSON.stringify({ all: true, timestamp: Date.now() }));
    setVisible(false);
  };

  const savePrefs = () => {
    localStorage.setItem('zanny_consent', JSON.stringify({ prefs, timestamp: Date.now() }));
    setVisible(false);
  };

  const rejectNonEssential = () => {
    localStorage.setItem('zanny_consent', JSON.stringify({ prefs: { essential: true, analytics: false, marketing: false, functional: false }, timestamp: Date.now() }));
    setVisible(false);
  };

  const togglePref = (key) => {
    if (key === 'essential') return;
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Subtle backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(3px)',
              zIndex: 999,
            }}
          />

          {/* Main consent modal - Full width banner */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              bottom: 0, left: 0, right: 0,
              width: '100%',
              background: '#fff',
              zIndex: 1000,
              boxShadow: '0 -10px 50px rgba(0,0,0,0.15)',
              fontFamily: 'var(--font-body)',
              borderTop: '1px solid #eee',
            }}
          >
            {/* Top accent line */}
            <div style={{ height: '2px', background: '#1a1a1a', opacity: 0.1 }} />

            <div className="container" style={{ padding: '1.5rem 0' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1.5rem' 
              }} className="consent-inner-wrapper">
                
                {/* Upper part: Info */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '2rem',
                  justifyContent: 'space-between'
                }} className="consent-info-row">
                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '40px', height: '40px', border: '1.5px solid #1a1a1a',
                      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0,
                      marginTop: '2px'
                    }}>Z</div>
                    <div style={{ flex: 1 }}>
                      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', letterSpacing: '1.5px', marginBottom: '0.5rem' }}>
                        Your Privacy at Zanny
                      </h2>
                      <p style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.6, maxWidth: '900px' }}>
                        We use cookies to improve your experience and analyze site traffic. By clicking <strong>"Accept All"</strong>, you consent to our use of cookies as described in our{' '}
                        <Link to="/cookie" style={{ color: '#1a1a1a', fontWeight: 600, textDecoration: 'underline' }}>Cookie Policy</Link> and{' '}
                        <Link to="/privacy" style={{ color: '#1a1a1a', fontWeight: 600, textDecoration: 'underline' }}>Privacy Policy</Link>.
                      </p>
                    </div>
                  </div>

                  {/* Desktop Quick Actions (visible only on wide screens) */}
                  <div className="desktop-actions" style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={acceptAll}
                      style={{
                        padding: '0.75rem 1.8rem',
                        background: '#1a1a1a', color: '#fff',
                        border: 'none', cursor: 'pointer',
                        fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1.5px',
                        textTransform: 'uppercase', fontFamily: 'var(--font-body)',
                      }}
                    >
                      Accept All
                    </motion.button>
                  </div>
                </div>

                {/* Manage preferences panel */}
                <AnimatePresence>
                  {showManage && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ 
                        border: '1px solid #f0f0f0', 
                        padding: '1.5rem', 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '1.5rem',
                        background: '#fafafa'
                      }}>
                        {[
                          { key: 'essential',  label: 'Essential',    desc: 'Required for site functionality.' },
                          { key: 'functional', label: 'Functional',   desc: 'Personalization & preferences.' },
                          { key: 'analytics',  label: 'Analytics',    desc: 'Usage & performance metrics.' },
                          { key: 'marketing',  label: 'Marketing',    desc: 'Targeted ads & social features.' },
                        ].map(({ key, label, desc }) => (
                          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                            <div>
                              <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.1rem' }}>{label}</p>
                              <p style={{ fontSize: '0.7rem', color: '#888' }}>{desc}</p>
                            </div>
                            <button
                              onClick={() => togglePref(key)}
                              style={{
                                width: '38px', height: '20px',
                                borderRadius: '50px',
                                background: prefs[key] ? '#1a1a1a' : '#ddd',
                                border: 'none', cursor: key === 'essential' ? 'not-allowed' : 'pointer',
                                position: 'relative', flexShrink: 0,
                                transition: 'background 0.3s',
                                opacity: key === 'essential' ? 0.6 : 1,
                              }}
                              disabled={key === 'essential'}
                            >
                              <span style={{
                                position: 'absolute',
                                top: '3px',
                                left: prefs[key] ? '20px' : '3px',
                                width: '14px', height: '14px',
                                borderRadius: '50%',
                                background: '#fff',
                                transition: 'left 0.3s',
                              }} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bottom part: All buttons (mobile) / Secondary buttons (desktop) */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  gap: '1rem',
                  borderTop: '1px solid #f5f5f5',
                  paddingTop: '1rem'
                }} className="consent-bottom-row">
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <button
                      onClick={() => setShowManage(!showManage)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#1a1a1a', fontSize: '0.75rem', fontWeight: 600,
                        letterSpacing: '1px', textTransform: 'uppercase',
                        padding: 0, fontFamily: 'var(--font-body)',
                      }}
                    >
                      {showManage ? 'Close Preferences' : 'Manage Preferences'}
                    </button>
                    <button
                      onClick={rejectNonEssential}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#aaa', fontSize: '0.75rem',
                        textDecoration: 'underline', padding: 0,
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      Reject Non-Essential
                    </button>
                  </div>

                  {/* Mobile-only primary action (duplicated from top but hidden on desktop) */}
                  <div className="mobile-actions" style={{ display: 'none' }}>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={acceptAll}
                      style={{
                        padding: '0.8rem 2rem',
                        background: '#1a1a1a', color: '#fff',
                        border: 'none', cursor: 'pointer',
                        fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1.5px',
                        textTransform: 'uppercase', width: '100%'
                      }}
                    >
                      Accept All
                    </motion.button>
                  </div>

                  {showManage && (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={savePrefs}
                      style={{
                        padding: '0.6rem 1.2rem',
                        background: '#fff', color: '#1a1a1a',
                        border: '1px solid #1a1a1a', cursor: 'pointer',
                        fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Save Preferences
                    </motion.button>
                  )}
                </div>
              </div>
            </div>

            <style>{`
              @media (max-width: 900px) {
                .desktop-actions { display: none !important; }
                .mobile-actions { display: block !important; width: 100%; margin-top: 0.5rem; }
                .consent-bottom-row { flex-direction: column; align-items: stretch !important; gap: 1.5rem; }
                .consent-info-row { flex-direction: column; gap: 1rem; }
              }
              @media (max-width: 600px) {
                .container { padding: 1.25rem !important; }
                .consent-inner-wrapper { gap: 1.25rem; }
              }
            `}</style>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
