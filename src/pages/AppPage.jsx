import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  Download,
  CheckCircle,
  RefreshCcw,
  Bell,
  ShoppingCart,
  MapPin,
  Zap,
  Shield,
  Star,
  ChevronRight,
  Package,
  ChevronLeft,
  ArrowDownToLine,
  RotateCcw,
  Wifi,
} from 'lucide-react';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

/* ─── Feature list ─────────────────────────────────────────── */
const APP_FEATURES = [
  {
    icon: ShoppingCart,
    title: 'Real-Time Cart Sync',
    description:
      'Your cart stays perfectly in sync between the app and the website. Add on your phone, see it instantly on your laptop.',
  },
  {
    icon: Bell,
    title: 'Exclusive Drop Alerts',
    description:
      'Be the first to know when new collections land. Push notifications delivered straight to your lock screen.',
  },
  {
    icon: MapPin,
    title: 'M-Pesa Checkout',
    description:
      'Pay seamlessly with M-Pesa right inside the app. No redirects, no friction — just tap and confirm.',
  },
  {
    icon: Package,
    title: 'Live Order Tracking',
    description:
      'Follow every step of your order from dispatch to doorstep with real-time status updates.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'Built with Flutter for buttery-smooth performance. Instant product loads and fluid animations.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description:
      'All sessions are JWT-secured. Your payment details and personal data are always protected.',
  },
];

/* ─── Install steps ─────────────────────────────────────────── */
const INSTALL_STEPS = [
  {
    step: '01',
    icon: Wifi,
    title: 'Enable Unknown Sources',
    description:
      'Go to Settings → Security → enable "Install from Unknown Sources" for your browser app.',
  },
  {
    step: '02',
    icon: ArrowDownToLine,
    title: 'Download the APK',
    description:
      'Tap the Download button. Your browser will save the .apk file to your Downloads folder.',
  },
  {
    step: '03',
    icon: Smartphone,
    title: 'Open & Install',
    description:
      'Open the downloaded file from your notifications or Files app. Tap "Install" and wait a few seconds.',
  },
  {
    step: '04',
    icon: CheckCircle,
    title: 'Sign In & Shop',
    description:
      'Open Zanny Collection, sign in with your existing account (or create one), and start shopping.',
  },
];

/* ─── Testimonials ──────────────────────────────────────────── */
const REVIEWS = [
  {
    name: 'Brian M.',
    rating: 5,
    text: 'The app is smooth and the cart sync with the website works perfectly. M-Pesa checkout is super fast.',
  },
  {
    name: 'Amara K.',
    rating: 5,
    text: 'Love the push notifications for new drops. I grabbed a limited hoodie before it sold out!',
  },
  {
    name: 'Jayden O.',
    rating: 5,
    text: 'Feels like a premium brand experience right on my phone. The design is clean and everything just works.',
  },
];

/* ─── Animation preset ──────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function AppPage() {
  const [apkInfo, setApkInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/version')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.apk_url || data?.url) setApkInfo(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatDate = (s) => {
    if (!s) return '';
    try {
      return new Date(s).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return s;
    }
  };

  const downloadUrl =
    apkInfo?.apk_url ||
    apkInfo?.url ||
    'https://pub-0a4117480fe8436ca1a1255ce208d231.r2.dev/zanny_collection.apk';
  const versionLabel = apkInfo ? `v${apkInfo.version}` : '';

  return (
    <>
      <title>Zanny Collection App — Shop on Android</title>
      <meta
        name="description"
        content="Download the Zanny Collection Android app. Real-time cart sync, push notifications, M-Pesa checkout and order tracking in one premium app."
      />

      {/* ── PAGE HEADER ──────────────────────────────────────── */}
      <div style={{ paddingTop: '80px', borderBottom: '1px solid #e8e8e8', background: '#fff' }}>
        <div className="container" style={{ padding: '1.5rem 2rem' }}>
          <button
            onClick={() =>
              window.history.state?.idx > 0 ? navigate(-1) : navigate('/')
            }
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#888',
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              marginBottom: '2rem',
              fontFamily: 'inherit',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#111')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
          >
            <ChevronLeft size={14} strokeWidth={2} />
            Go Back
          </button>

          <div style={{ paddingBottom: '2.5rem', textAlign: 'center' }}>
            <p
              style={{
                fontSize: '0.7rem',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: '#aaa',
                marginBottom: '0.75rem',
              }}
            >
              Android Application
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                letterSpacing: '2px',
                color: '#111',
                marginBottom: '0.75rem',
              }}
            >
              GET THE APP
            </h1>
            <p style={{ color: '#888', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto' }}>
              The full Zanny Collection experience — now in your pocket. Shop drops, track orders,
              and checkout with M-Pesa right from your Android phone.
            </p>
          </div>
        </div>
      </div>

      <main style={{ background: '#f8f8f8', color: '#111', fontFamily: 'var(--font-body)' }}>

        {/* ── HERO DOWNLOAD STRIP ──────────────────────────────── */}
        <section style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '3rem 2rem' }}>
          <div
            className="container"
            style={{
              maxWidth: '1100px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            {/* Left: App identity */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  background: '#1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: '1.4rem',
                  color: '#fff',
                  letterSpacing: '1px',
                  flexShrink: 0,
                }}>
                  Z
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.1rem',
                      letterSpacing: '1px',
                      marginBottom: '0.15rem',
                    }}
                  >
                    Zanny Collection
                  </p>
                  <p style={{ color: '#aaa', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                    Android · Free
                  </p>
                </div>
              </div>


              {/* Rating stars */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#111" color="#111" />
                ))}
                <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: '0.25rem' }}>
                  5.0 · Premium Experience
                </span>
              </div>

              {/* Feature bullets */}
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  'Real-time cart sync across all devices',
                  'Instant push notifications for drops',
                  'M-Pesa checkout built right in',
                  'Live order tracking from app',
                ].map((item, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      fontSize: '0.875rem',
                      color: '#555',
                    }}
                  >
                    <CheckCircle size={15} color="#111" style={{ flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Right: version card */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              <div
                style={{
                  background: '#fafafa',
                  border: '1px solid #e8e8e8',
                  borderRadius: '16px',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                }}
              >
                {loading ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2rem 0',
                      gap: '0.75rem',
                    }}
                  >
                    <RotateCcw size={22} className="spin-app-page" color="#aaa" />
                    <p style={{ color: '#aaa', fontSize: '0.8rem' }}>
                      Fetching latest version…
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Version badge + info */}
                    <div>
                      <span
                        style={{
                          display: 'inline-block',
                          background: '#111',
                          color: '#fff',
                          padding: '0.25rem 0.7rem',
                          borderRadius: '4px',
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          letterSpacing: '1.5px',
                          textTransform: 'uppercase',
                          marginBottom: '0.85rem',
                        }}
                      >
                        Latest Release
                      </span>
                      <h2
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '2rem',
                          letterSpacing: '1px',
                          marginBottom: '0.25rem',
                        }}
                      >
                        {apkInfo ? `v${apkInfo.version}` : 'Zanny App'}
                      </h2>
                    </div>

                    <div style={{ height: '1px', background: '#eee' }} />

                    {/* Premium Clothing Message */}
                    <div>
                      <p
                        style={{
                          fontSize: '0.65rem',
                          letterSpacing: '1.5px',
                          textTransform: 'uppercase',
                          color: '#aaa',
                          marginBottom: '0.5rem',
                        }}
                      >
                        Premium Streetwear
                      </p>
                      <p style={{ color: '#555', fontSize: '0.875rem', lineHeight: 1.6 }}>
                        Experience premium fashion. Download our official Android app to browse collections, receive notifications for limited streetwear drops, and shop seamlessly on the go.
                      </p>
                    </div>

                    {/* Download CTA */}
                    <a
                      href={downloadUrl}
                      id="version-card-download-btn"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.7rem',
                        padding: '1rem',
                        background: '#111',
                        color: '#fff',
                        textDecoration: 'none',
                        fontFamily: 'var(--font-body)',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        borderRadius: '8px',
                        transition: 'background 0.25s, transform 0.25s',
                      }}
                      className="app-dl-btn"
                    >
                      <Download size={17} />
                      {apkInfo ? `Download ${versionLabel} APK` : 'Download APK'}
                    </a>

                    <p
                      style={{
                        textAlign: 'center',
                        color: '#bbb',
                        fontSize: '0.7rem',
                        margin: '-0.75rem 0 0',
                      }}
                    >
                      Android only · Requires enabling Unknown Sources
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FEATURES ────────────────────────────────────────── */}
        <section style={{ padding: 'clamp(4rem, 8vw, 6rem) 2rem', background: '#f8f8f8' }}>
          <div className="container" style={{ maxWidth: '1200px' }}>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              style={{ textAlign: 'center', marginBottom: '3.5rem' }}
            >
              <p
                style={{
                  fontSize: '0.7rem',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  color: '#aaa',
                  marginBottom: '0.75rem',
                }}
              >
                Why the app?
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                  letterSpacing: '1px',
                  color: '#111',
                }}
              >
                EVERYTHING YOU NEED
              </h2>
            </motion.div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1px',
                background: '#e8e8e8',
                border: '1px solid #e8e8e8',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              {APP_FEATURES.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={i}
                    style={{
                      background: '#fff',
                      padding: '2.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      transition: 'background 0.2s',
                    }}
                    className="feature-card-light"
                  >
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        border: '1px solid #e8e8e8',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f8f8f8',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={19} color="#1a1a1a" strokeWidth={1.6} />
                    </div>
                    <div>
                      <h3
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '0.95rem',
                          letterSpacing: '0.5px',
                          marginBottom: '0.45rem',
                          color: '#111',
                        }}
                      >
                        {feature.title}
                      </h3>
                      <p style={{ color: '#777', fontSize: '0.85rem', lineHeight: 1.7 }}>
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── REVIEWS (dark accent section — matches homepage pattern) ── */}
        <section style={{ background: '#111', color: '#fff', padding: 'clamp(4rem, 8vw, 6rem) 2rem' }}>
          <div className="container" style={{ maxWidth: '1100px' }}>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              style={{ textAlign: 'center', marginBottom: '3.5rem' }}
            >
              <p
                style={{
                  fontSize: '0.7rem',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  color: '#666',
                  marginBottom: '0.75rem',
                }}
              >
                From our users
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                  letterSpacing: '1px',
                }}
              >
                WHAT PEOPLE SAY
              </h2>
            </motion.div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {REVIEWS.map((review, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  style={{
                    border: '1px solid #222',
                    borderRadius: '12px',
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    background: '#161616',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    {[...Array(review.rating)].map((_, j) => (
                      <Star key={j} size={13} fill="#fff" color="#fff" />
                    ))}
                  </div>
                  <p
                    style={{
                      color: '#aaa',
                      fontSize: '0.875rem',
                      lineHeight: 1.7,
                      fontStyle: 'italic',
                      flex: 1,
                    }}
                  >
                    "{review.text}"
                  </p>
                  <p
                    style={{
                      color: '#555',
                      fontSize: '0.72rem',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                    }}
                  >
                    — {review.name}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW TO INSTALL ───────────────────────────────────── */}
        <section
          id="how-to-install"
          style={{ background: '#fff', padding: 'clamp(4rem, 8vw, 6rem) 2rem', borderTop: '1px solid #eee' }}
        >
          <div className="container" style={{ maxWidth: '900px' }}>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              style={{ textAlign: 'center', marginBottom: '4rem' }}
            >
              <p
                style={{
                  fontSize: '0.7rem',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  color: '#aaa',
                  marginBottom: '0.75rem',
                }}
              >
                Step by step
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                  letterSpacing: '1px',
                  color: '#111',
                  marginBottom: '0.75rem',
                }}
              >
                HOW TO INSTALL
              </h2>
              <p style={{ color: '#888', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
                The Zanny app is an APK — distributed directly, no app store needed. Install it on
                Android in under a minute.
              </p>
            </motion.div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {INSTALL_STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.step}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={i}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '56px 1fr',
                      gap: '1.5rem',
                      padding: '2rem 0',
                      borderBottom:
                        i < INSTALL_STEPS.length - 1 ? '1px solid #f0f0f0' : 'none',
                      alignItems: 'flex-start',
                    }}
                  >
                    {/* Step icon */}
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        border: '1px solid #e8e8e8',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f8f8f8',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={20} color="#1a1a1a" strokeWidth={1.6} />
                    </div>

                    {/* Content */}
                    <div style={{ paddingTop: '0.2rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '0.7rem',
                            letterSpacing: '2px',
                            color: '#ccc',
                          }}
                        >
                          {step.step}
                        </span>
                        <h3
                          style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '1rem',
                            letterSpacing: '0.5px',
                            color: '#111',
                          }}
                        >
                          {step.title}
                        </h3>
                      </div>
                      <p style={{ color: '#777', fontSize: '0.875rem', lineHeight: 1.7 }}>
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA (matches AppDownloadSection pattern from homepage) ── */}
        <section
          style={{
            background: '#111',
            color: '#fff',
            padding: 'clamp(5rem, 10vw, 8rem) 2rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle radial glow */}
          <div
            style={{
              position: 'absolute',
              top: '-20%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '600px',
              height: '400px',
              background:
                'radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#666',
                textTransform: 'uppercase',
                letterSpacing: '3px',
                fontSize: '0.72rem',
                marginBottom: '1.5rem',
                fontFamily: 'var(--font-body)',
              }}
            >
              <Smartphone size={14} />
              <span>Zanny Collection App</span>
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2.2rem, 6vw, 4rem)',
                letterSpacing: '2px',
                lineHeight: 1.1,
                marginBottom: '1.25rem',
              }}
            >
              STREETWEAR IN<br />YOUR POCKET
            </h2>

            <p
              style={{
                color: '#888',
                fontSize: '0.95rem',
                lineHeight: 1.7,
                maxWidth: '480px',
                margin: '0 auto 2.5rem',
              }}
            >
              Download the Zanny Collection app and carry the full collection with you, wherever you go.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <a
                href={downloadUrl}
                id="final-cta-download-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.7rem',
                  padding: '1rem 2.2rem',
                  background: '#fff',
                  color: '#111',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  borderRadius: '6px',
                  transition: 'all 0.25s',
                }}
                className="app-dl-btn-inv"
              >
                <Download size={17} />
                Download APK {versionLabel}
              </a>
              <Link
                to="/collections"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem 2rem',
                  background: 'transparent',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 500,
                  fontSize: '0.82rem',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  borderRadius: '6px',
                  transition: 'all 0.25s',
                }}
                className="app-outline-inv"
              >
                Browse Collections
                <ChevronRight size={15} />
              </Link>
            </div>
          </motion.div>
        </section>

        <Footer />
      </main>

      <style>{`
        .spin-app-page {
          animation: spinAppPage 1.4s linear infinite;
        }
        @keyframes spinAppPage {
          100% { transform: rotate(360deg); }
        }
        .app-dl-btn:hover {
          background: #2c2c2c !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.18);
        }
        .app-dl-btn-inv:hover {
          background: #e8e8e8 !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255,255,255,0.12);
        }
        .app-outline-inv:hover {
          border-color: rgba(255,255,255,0.45) !important;
          background: rgba(255,255,255,0.05) !important;
        }
        .feature-card-light:hover {
          background: #fafafa !important;
        }
      `}</style>
    </>
  );
}
