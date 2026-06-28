import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, X, Download, ChevronRight } from 'lucide-react';

const STORAGE_KEY = 'zanny_app_banner_dismissed';

export default function AppBanner() {
  const [visible, setVisible] = useState(false);
  const [apkUrl, setApkUrl] = useState(null);

  useEffect(() => {
    // Don't show if already dismissed
    if (localStorage.getItem(STORAGE_KEY)) return;

    // Fetch latest APK URL from the version API so the banner
    // always points to the newest build pushed to storage
    fetch('/api/version')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.url) setApkUrl(data.url);
      })
      .catch(() => {});

    // Delay slightly so it doesn't clash with the cookie banner
    const t = setTimeout(() => setVisible(true), 3500);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          id="app-promo-banner"
          role="banner"
          aria-label="Download the Zanny Collection app"
          initial={{ opacity: 0, y: -80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -80 }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 300,
            background: '#111',
            color: '#fff',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            fontFamily: 'var(--font-body)',
            boxShadow: '0 4px 30px rgba(0,0,0,0.5)',
          }}
        >
          <div
            className="container"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.75rem 1.5rem',
              flexWrap: 'wrap',
            }}
          >
            {/* Icon */}
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Smartphone size={18} color="#ddd" />
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '0.1rem' }}>
                Shop anywhere — the Zanny app is available now
              </p>
              <p style={{ fontSize: '0.72rem', color: '#777', margin: 0 }}>
                Real-time cart sync · Push notifications · M-Pesa checkout
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
              {/* "Learn more" goes to the /app page */}
              <Link
                to="/app"
                onClick={dismiss}
                id="app-banner-learn-more"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1rem',
                  background: 'transparent',
                  color: '#ddd',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  transition: 'all 0.25s',
                  whiteSpace: 'nowrap',
                }}
                className="app-banner-outline-btn"
              >
                Learn more
                <ChevronRight size={13} />
              </Link>

              {/* Direct download — uses the live APK URL from /api/version */}
              <a
                href={apkUrl || '/app'}
                id="app-banner-download-btn"
                // If apkUrl isn't loaded yet, link to the /app page instead
                {...(apkUrl ? { download: true } : { onClick: (e) => { e.preventDefault(); window.location.href = '/app'; } })}
                onClick={dismiss}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1.1rem',
                  background: '#fff',
                  color: '#111',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  transition: 'all 0.25s',
                  whiteSpace: 'nowrap',
                }}
                className="app-banner-primary-btn"
              >
                <Download size={13} />
                Get App
              </a>

              {/* Dismiss */}
              <button
                id="app-banner-dismiss"
                aria-label="Dismiss app banner"
                onClick={dismiss}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#555',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.3rem',
                  transition: 'color 0.2s',
                  flexShrink: 0,
                }}
                className="app-banner-dismiss-btn"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <style>{`
            .app-banner-outline-btn:hover {
              border-color: rgba(255,255,255,0.45) !important;
              color: #fff !important;
            }
            .app-banner-primary-btn:hover {
              background: #e8e8e8 !important;
            }
            .app-banner-dismiss-btn:hover {
              color: #bbb !important;
            }
            @media (max-width: 600px) {
              #app-promo-banner .container {
                gap: 0.75rem;
              }
              .app-banner-outline-btn {
                display: none !important;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
