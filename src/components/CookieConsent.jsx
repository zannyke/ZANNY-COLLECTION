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

          {/* Main consent modal */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: '2rem', left: '50%',
              transform: 'translateX(-50%)',
              width: 'min(680px, 95vw)',
              background: '#fff',
              zIndex: 1000,
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {/* Gold top accent bar */}
            <div style={{ height: '3px', background: 'linear-gradient(90deg, #1a1a1a 0%, #5a5a5a 50%, #1a1a1a 100%)' }} />

            <div style={{ padding: '2rem 2.5rem' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
                <div style={{
                  width: '36px', height: '36px', border: '1.5px solid #1a1a1a',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', flexShrink: 0,
                }}>Z</div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '1.5px', marginBottom: '0.1rem' }}>
                    Your Privacy Matters
                  </h2>
                  <p style={{ fontSize: '0.7rem', color: '#aaa', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    ZANNY COLLECTION — Nairobi, Kenya
                  </p>
                </div>
              </div>

              {/* Body text */}
              <p style={{ fontSize: '0.875rem', color: '#555', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                We use cookies and similar technologies to enhance your experience, personalize content, and analyze site traffic.
                By clicking <strong>"Accept All"</strong>, you agree to our{' '}
                <Link to="/cookie" onClick={rejectNonEssential} style={{ color: '#1a1a1a', fontWeight: 600 }}>Cookie Policy</Link>,{' '}
                <Link to="/privacy" onClick={rejectNonEssential} style={{ color: '#1a1a1a', fontWeight: 600 }}>Privacy Policy</Link>, and{' '}
                <Link to="/terms" onClick={rejectNonEssential} style={{ color: '#1a1a1a', fontWeight: 600 }}>Terms of Service</Link>.
              </p>

              {/* Manage preferences panel */}
              <AnimatePresence>
                {showManage && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden', marginBottom: '1.5rem' }}
                  >
                    <div style={{ border: '1px solid #eee', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', marginBottom: '0.25rem' }}>
                        Cookie Preferences
                      </p>
                      {[
                        { key: 'essential',  label: 'Essential Cookies',    desc: 'Required for basic site functionality. Cannot be disabled.' },
                        { key: 'functional', label: 'Functional Cookies',   desc: 'Enable personalization and saved preferences.' },
                        { key: 'analytics',  label: 'Analytics Cookies',    desc: 'Help us understand how visitors interact with our site.' },
                        { key: 'marketing',  label: 'Marketing Cookies',    desc: 'Used for targeted advertising and social media features.' },
                      ].map(({ key, label, desc }) => (
                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                          <div>
                            <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.15rem' }}>{label}</p>
                            <p style={{ fontSize: '0.75rem', color: '#888' }}>{desc}</p>
                          </div>
                          {/* Toggle switch */}
                          <button
                            onClick={() => togglePref(key)}
                            style={{
                              width: '44px', height: '24px',
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
                              left: prefs[key] ? '22px' : '3px',
                              width: '18px', height: '18px',
                              borderRadius: '50%',
                              background: '#fff',
                              transition: 'left 0.3s',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="consent-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={acceptAll}
                  style={{
                    flex: 1, minWidth: '140px',
                    padding: '0.85rem 1.5rem',
                    background: '#1a1a1a', color: '#fff',
                    border: 'none', cursor: 'pointer',
                    fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1.5px',
                    textTransform: 'uppercase', fontFamily: 'var(--font-body)',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#333'}
                  onMouseLeave={e => e.currentTarget.style.background = '#1a1a1a'}
                >
                  Accept All
                </motion.button>

                {showManage ? (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={savePrefs}
                    style={{
                      flex: 1, minWidth: '140px',
                      padding: '0.85rem 1.5rem',
                      background: 'transparent', color: '#1a1a1a',
                      border: '1.5px solid #1a1a1a', cursor: 'pointer',
                      fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1.5px',
                      textTransform: 'uppercase', fontFamily: 'var(--font-body)',
                    }}
                  >
                    Save Preferences
                  </motion.button>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowManage(true)}
                    style={{
                      flex: 1, minWidth: '140px',
                      padding: '0.85rem 1.5rem',
                      background: 'transparent', color: '#555',
                      border: '1px solid #ddd', cursor: 'pointer',
                      fontSize: '0.8rem', fontWeight: 500, letterSpacing: '1px',
                      textTransform: 'uppercase', fontFamily: 'var(--font-body)',
                    }}
                  >
                    Manage Preferences
                  </motion.button>
                )}

                <button
                  onClick={rejectNonEssential}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#aaa', fontSize: '0.75rem',
                    textDecoration: 'underline', padding: '0.5rem',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Reject Non-Essential
                </button>
              </div>
            </div>

            <style>{`
              @media (max-width: 500px) {
                .consent-actions { flex-direction: column; }
                .consent-actions button { width: 100%; }
              }
            `}</style>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
