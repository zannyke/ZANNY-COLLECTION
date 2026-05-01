import React from 'react';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#111', color: '#fff', padding: '6rem 0 2rem' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>
        <div>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1.5rem', letterSpacing: '2px' }}>ZANNY</h4>
          <p style={{ color: '#999', fontSize: '0.875rem' }}>
            Elevating everyday luxury. Founded in 2026, Zanny Collection redefines modern elegance with a commitment to uncompromising quality.
          </p>
        </div>
        
        <div>
          <h5 style={{ textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Customer Care</h5>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#999', fontSize: '0.875rem' }}>
            <li><a href="#" className="footer-link">Contact Us</a></li>
            <li><a href="#" className="footer-link">Shipping & Returns</a></li>
            <li><a href="#" className="footer-link">FAQs</a></li>
            <li><a href="#" className="footer-link">Care Guide</a></li>
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
        .footer-link:hover { color: #fff; transition: color 0.3s; }
      `}</style>
    </footer>
  );
}
