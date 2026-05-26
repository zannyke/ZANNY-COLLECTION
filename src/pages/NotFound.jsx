import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '4rem', marginBottom: '1rem', letterSpacing: '4px' }}>
        404
      </h1>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '2rem', letterSpacing: '1px' }}>
        PAGE NOT FOUND
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '400px', lineHeight: 1.6 }}>
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        style={{
          display: 'inline-block',
          padding: '1rem 2rem',
          background: 'var(--text-primary)',
          color: 'var(--bg-primary)',
          textDecoration: 'none',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          fontWeight: 600,
          fontSize: '0.8rem',
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = 0.8}
        onMouseLeave={e => e.currentTarget.style.opacity = 1}
      >
        Return Home
      </Link>
    </div>
  );
}
