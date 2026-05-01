import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-container" style={{ backgroundColor: '#111', color: '#fff' }}>
      <div className="container footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '4rem' }}>
        <div>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1.5rem', letterSpacing: '2px' }}>ZANNY</h4>
          <p style={{ color: '#999', fontSize: '0.875rem' }}>
            Premium for the hustle. Founded in 2026, Zanny Collection provides high-end design for the dreamers, the doers, and the ones on the way up.
          </p>
        </div>
        
        <div>
          <h5 style={{ textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Customer Care</h5>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#999', fontSize: '0.875rem' }}>
            <li><Link to="/contact" className="footer-link">Contact Us</Link></li>
            <li><Link to="/shipping" className="footer-link">Shipping & Returns</Link></li>
            <li><Link to="/faqs" className="footer-link">FAQs</Link></li>
            <li><Link to="/care" className="footer-link">Care Guide</Link></li>
          </ul>
        </div>

        <div>
          <h5 style={{ textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Legal</h5>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#999', fontSize: '0.875rem' }}>
            <li><Link to="/terms" className="footer-link">Terms of Service</Link></li>
            <li><Link to="/privacy" className="footer-link">Privacy Policy</Link></li>
            <li><Link to="/cookie" className="footer-link">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #333', paddingTop: '2rem', textAlign: 'center', color: '#666', fontSize: '0.75rem' }}>
        &copy; {new Date().getFullYear()} Zanny Collection. All rights reserved.
      </div>
      <style>{`
        .footer-container { padding: 6rem 0 2rem; }
        .footer-grid { gap: 4rem; }
        .footer-link:hover { color: #fff; transition: color 0.3s; }
        
        @media (max-width: 768px) {
          .footer-container { padding: 4rem 0 2rem; }
          .footer-grid { gap: 2rem; }
        }
      `}</style>
    </footer>
  );
}
