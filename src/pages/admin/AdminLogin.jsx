import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

// Expected hash for the admin password (zanny2026)
const ADMIN_HASH = '8bef858d3755303abebcbb3b9aacc446dd90e5c5aa268731388a4c5a4b14a8cb';

export default function AdminLogin() {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t, resolvedTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw })
      });

      if (res.ok) {
        sessionStorage.setItem('zanny_admin', 'true');
        navigate('/admin');
      } else {
        const err = await res.json();
        setError(err.message || 'Incorrect password. Please try again.');
        setPw('');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: t.bg, fontFamily: 'var(--font-body)', transition: 'background 0.3s',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{
          width: '100%', maxWidth: '400px', padding: '2rem',
          background: t.surface, border: `1px solid ${t.border}`,
          boxShadow: resolvedTheme === 'dark' ? '0 24px 60px rgba(0,0,0,0.6)' : '0 24px 60px rgba(0,0,0,0.05)',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%',
            border: `1.5px solid ${t.text}`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 1rem',
            fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: t.text,
          }}>Z</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', color: t.text, fontSize: '1.4rem', letterSpacing: '3px' }}>
            ZANNY ADMIN
          </h1>
          <p style={{ color: t.textMuted, fontSize: '0.75rem', letterSpacing: '1px', marginTop: '0.3rem' }}>
            Brand Management Console
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', color: t.textMuted, fontSize: '0.7rem', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Admin Password
            </label>
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setError(''); }}
              placeholder="Enter password"
              autoFocus
              style={{
                width: '100%', padding: '0.9rem 1rem',
                background: t.input, border: `1px solid ${error ? '#c0392b' : t.border}`,
                color: t.text, outline: 'none', fontSize: '1rem',
                fontFamily: 'var(--font-body)', boxSizing: 'border-box',
                transition: 'all 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = t.textMuted}
              onBlur={e => e.target.style.borderColor = error ? '#c0392b' : t.border}
            />
            {error && <p style={{ color: '#c0392b', fontSize: '0.75rem', marginTop: '0.5rem' }}>{error}</p>}
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading || !pw}
            style={{
              padding: '0.9rem', marginTop: '0.5rem',
              background: loading ? t.border : t.text,
              color: t.bg, border: 'none',
              fontSize: '0.8rem', fontWeight: 700, letterSpacing: '2px',
              textTransform: 'uppercase', cursor: loading || !pw ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-body)', opacity: !pw ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </motion.button>
        </form>

        <p style={{ color: t.textMuted, fontSize: '0.7rem', textAlign: 'center', marginTop: '2rem', opacity: 0.6 }}>
          Protected area — ZANNY COLLECTION © {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  );
}
