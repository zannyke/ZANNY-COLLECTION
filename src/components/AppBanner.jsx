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
        if (data?.apk_url || data?.url) setApkUrl(data.apk_url || data.url);
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
          <div className="app-banner-container">
            {/* Icon */}
            <div className="app-banner-icon-box">
              <Smartphone size={18} color="#ddd" />
            </div>

            {/* Text */}
            <div className="app-banner-text-box">
              <p className="app-banner-title">
                Shop anywhere — the Zanny app is available now
              </p>
              <p className="app-banner-desc">
                Real-time cart sync · Push notifications · M-Pesa checkout
              </p>
            </div>

            {/* Actions */}
            <div className="app-banner-actions">
              {/* "Learn more" goes to the /app page */}
              <Link
                to="/app"
                onClick={dismiss}
                id="app-banner-learn-more"
                className="app-banner-outline-btn"
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
                className="app-banner-primary-btn"
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
              >
                <Download size={13} />
                Get App
              </a>

              {/* Dismiss */}
              <button
                id="app-banner-dismiss"
                aria-label="Dismiss app banner"
                onClick={dismiss}
                className="app-banner-dismiss-btn"
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
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <style>{`
            .app-banner-container {
              display: flex;
              align-items: center;
              gap: 1rem;
              padding: 0.75rem 2rem;
              max-width: 1400px;
              margin: 0 auto;
              width: 100%;
            }
            .app-banner-icon-box {
              width: 36px;
              height: 36px;
              borderRadius: 8px;
              background: rgba(255,255,255,0.08);
              display: flex;
              align-items: center;
              justifyContent: center;
              flex-shrink: 0;
            }
            .app-banner-text-box {
              flex: 1;
              min-width: 0;
            }
            .app-banner-title {
              font-size: 0.8rem;
              font-weight: 600;
              letter-spacing: 0.5px;
              margin: 0 0 0.1rem 0;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .app-banner-desc {
              font-size: 0.72rem;
              color: #777;
              margin: 0;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .app-banner-actions {
              display: flex;
              align-items: center;
              gap: 0.75rem;
              flex-shrink: 0;
            }
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
            
            @media (max-width: 768px) {
              .app-banner-container {
                padding: 0.6rem 1rem;
                gap: 0.75rem;
              }
              .app-banner-icon-box {
                display: none;
              }
              .app-banner-desc {
                display: none;
              }
              .app-banner-outline-btn {
                display: none !important;
              }
              .app-banner-title {
                font-size: 0.75rem;
                white-space: normal;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
