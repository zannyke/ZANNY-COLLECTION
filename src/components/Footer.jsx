import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-container" style={{ backgroundColor: '#111', color: '#fff' }}>
      <div className="container footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '4rem' }}>
        <div>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1.5rem', letterSpacing: '2px' }}>ZANNY</h4>
          <p style={{ color: '#999', fontSize: '0.875rem' }}>
            Elevating everyday luxury. Founded in 2026, Zanny Collection redefines modern elegance with a commitment to uncompromising quality.
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
            <li><a href="#" className="footer-link">Terms of Service</a></li>
            <li><a href="#" className="footer-link">Privacy Policy</a></li>
            <li><a href="#" className="footer-link">Cookie Policy</a></li>
          </ul>
        </div>

        <div>
          <h5 style={{ textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Newsletter</h5>
          <p style={{ color: '#999', fontSize: '0.875rem', marginBottom: '1rem' }}>Subscribe to receive updates, access to exclusive deals, and more.</p>
          <form style={{ display: 'flex', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              style={{ background: 'transparent', border: 'none', color: '#fff', flex: 1, outline: 'none', fontSize: '0.875rem' }}
            />
            <button type="submit" style={{ background: 'transparent', border: 'none', color: '#fff', textTransform: 'uppercase', fontSize: '0.75rem', cursor: 'pointer', letterSpacing: '1px' }}>
              Subscribe
            </button>
          </form>
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
