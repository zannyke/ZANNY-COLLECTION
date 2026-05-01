import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function PageHeader({ title, subtitle }) {
  return (
    <div style={{
      paddingTop: '100px',
      borderBottom: '1px solid #e8e8e8',
      backgroundColor: '#fff',
    }}>
      <div className="container" style={{ padding: '1.5rem 2rem' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#888',
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            textDecoration: 'none',
            marginBottom: '2rem',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#000'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
        >
          <ChevronLeft size={14} strokeWidth={2} />
          Back to Home
        </Link>

        <div style={{ paddingBottom: '2.5rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            letterSpacing: '2px',
            textAlign: 'center',
            marginBottom: subtitle ? '0.75rem' : 0,
            color: '#111',
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              textAlign: 'center',
              color: '#888',
              fontSize: '1rem',
              letterSpacing: '0.5px',
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
