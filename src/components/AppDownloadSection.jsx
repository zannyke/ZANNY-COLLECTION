import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Download, CheckCircle, RefreshCcw } from 'lucide-react';

export default function AppDownloadSection() {
  const [apkInfo, setApkInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/version')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        if (data && data.url) {
          setApkInfo(data);
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load APK version config:', err);
        setError(true);
        setLoading(false);
      });
  }, []);

  // Format date if available
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="app-download-section" style={{
      background: '#0d0d0f',
      color: '#fff',
      padding: '6rem 2rem',
      position: 'relative',
      overflow: 'hidden',
      borderTop: '1px solid #1a1a1f'
    }}>
      {/* Dynamic Background Glows */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 70%)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        left: '-10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0) 75%)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 10, maxWidth: '1100px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '4rem',
          alignItems: 'center'
        }}>
          {/* Left Content Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#888', textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.75rem' }}>
              <Smartphone size={14} />
              <span>Zanny Collection App</span>
            </div>
            
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
              lineHeight: 1.1,
              letterSpacing: '1px',
              margin: 0
            }}>
              STREETWEAR IN YOUR POCKET
            </h2>
            
            <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
              Experience the ultimate streetwear shopping experience. Sync your shopping cart across all devices in real-time, get notifications for exclusive drops, and track your orders on the go.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0 0', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {[
                'Real-time Mobile & Web Cart Sync',
                'Instant Push Notifications for Drops',
                'Seamless order tracking and M-Pesa checkout',
                'Optimized, fluid, and premium mobile design'
              ].map((feature, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: '#ddd' }}>
                  <CheckCircle size={16} style={{ color: '#fff', flexShrink: 0 }} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right Download Card Column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <div className="download-card" style={{
              width: '100%',
              maxWidth: '440px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '2.5rem',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem'
            }}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', gap: '1rem' }}>
                  <RefreshCcw size={28} className="spin-icon" style={{ color: '#aaa' }} />
                  <p style={{ fontSize: '0.85rem', color: '#888' }}>Fetching latest app version...</p>
                </div>
              ) : error || !apkInfo ? (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Android App Available</p>
                  <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '2rem' }}>
                    Download the official Android app to shop on the go.
                  </p>
                  <a
                    href="https://pub-0a4117480fe8436ca1a1255ce208d231.r2.dev/zanny_collection.apk"
                    className="download-btn-active"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      width: '100%',
                      padding: '1.1rem',
                      background: '#fff',
                      color: '#000',
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      borderRadius: '8px',
                      transition: 'all 0.3s'
                    }}
                  >
                    <Download size={18} />
                    Download APK (Android)
                  </a>
                </div>
              ) : (
                <>
                  <div>
                    <span style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      color: '#ddd'
                    }}>
                      LATEST RELEASE
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', margin: '0.75rem 0 0.25rem 0' }}>
                      v{apkInfo.version}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#777' }}>
                      Build {apkInfo.build} • Published {formatDate(apkInfo.publishedAt)}
                    </p>
                  </div>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />

                  {apkInfo.changelog && (
                    <div>
                      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>What's New</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#bbb', lineHeight: 1.5 }}>
                        {apkInfo.changelog}
                      </p>
                    </div>
                  )}

                  <a
                    href={apkInfo.url}
                    className="download-btn-active"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      width: '100%',
                      padding: '1.1rem',
                      background: '#fff',
                      color: '#000',
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      borderRadius: '8px',
                      transition: 'all 0.3s'
                    }}
                  >
                    <Download size={18} />
                    Download v{apkInfo.version} APK
                  </a>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        .spin-icon {
          animation: spin 1.5s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        .download-btn-active:hover {
          background: #e5e5e5 !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255,255,255,0.15) !important;
        }
        .download-btn-active:active {
          transform: translateY(0);
        }
      `}</style>
    </section>
  );
}
