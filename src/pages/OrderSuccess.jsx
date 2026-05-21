import React from 'react';
import { Link } from 'react-router-dom';

export default function OrderSuccess() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', textAlign: 'center', padding: '2rem' }}>
      <div style={{ fontSize: '4rem', color: '#27ae60', marginBottom: '1rem' }}>✓</div>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', letterSpacing: '2px', marginBottom: '1rem' }}>Order Placed Successfully!</h2>
      <p style={{ color: '#888', maxWidth: '400px', marginBottom: '2rem' }}>
        Thank you for your purchase. Your order has been successfully submitted. Our team will contact you shortly to confirm delivery!
      </p>
      <Link to="/account" style={{ background: '#1a1a1a', color: '#fff', padding: '0.8rem 2rem', textDecoration: 'none', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
        View Your Orders
      </Link>
    </div>
  );
}
