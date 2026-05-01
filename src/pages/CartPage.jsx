import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import PageHeader from '../components/PageHeader';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQty, clearCart, cartTotal } = useCart();

  if (cartItems.length === 0) {
    return (
      <div style={{ minHeight: '80vh', backgroundColor: '#fff' }}>
        <PageHeader title="My Cart" subtitle="Your bag is currently empty." />
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '0.95rem' }}>
            Discover our latest collections and find something you love.
          </p>
          <Link
            to="/#collections"
            style={{
              display: 'inline-block',
              padding: '0.9rem 2.5rem',
              background: '#1a1a1a', color: '#fff',
              textDecoration: 'none',
              textTransform: 'uppercase', letterSpacing: '2px',
              fontSize: '0.8rem', fontWeight: 600,
            }}
          >
            Explore Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '80vh', backgroundColor: '#fff' }}>
      <PageHeader title="My Cart" subtitle={`${cartItems.reduce((s, i) => s + i.qty, 0)} item(s) in your bag`} />

      <div className="container" style={{ padding: '3rem 2rem', maxWidth: '1100px' }}>
        <div className="cart-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3rem', alignItems: 'start' }}>

          {/* ── Cart Items ── */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
              <p style={{ fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888' }}>Item</p>
              <p style={{ fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888' }}>Subtotal</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {cartItems.map((item, idx) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{
                    display: 'flex', gap: '1.5rem', alignItems: 'flex-start',
                    padding: '1.5rem 0', borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  {/* Product image */}
                  <div style={{ width: '90px', height: '110px', flexShrink: 0, background: '#f8f8f8', overflow: 'hidden' }}>
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  {/* Product info */}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', marginBottom: '0.3rem' }}>{item.name}</p>
                    <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.2rem' }}>Size: <strong>{item.size}</strong></p>
                    <p style={{ fontSize: '0.85rem', color: '#444', marginBottom: '1rem' }}>KSh {item.price.toLocaleString()} each</p>

                    {/* Qty controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <button
                        onClick={() => updateQty(item.key, item.qty - 1)}
                        style={{ width: '28px', height: '28px', border: '1px solid #ddd', background: 'none', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >−</button>
                      <span style={{ minWidth: '20px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.key, item.qty + 1)}
                        style={{ width: '28px', height: '28px', border: '1px solid #ddd', background: 'none', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >+</button>
                      <button
                        onClick={() => removeFromCart(item.key)}
                        style={{ marginLeft: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: '0.75rem', letterSpacing: '0.5px', textDecoration: 'underline' }}
                      >Remove</button>
                    </div>
                  </div>

                  {/* Line subtotal */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>KSh {(item.price * item.qty).toLocaleString()}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Clear cart */}
            <div style={{ marginTop: '1.5rem' }}>
              <button
                onClick={clearCart}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'underline' }}
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* ── Order Summary ── */}
          <div style={{ position: 'sticky', top: '100px', background: '#fafafa', padding: '2rem', border: '1px solid #eee' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '1.5rem', letterSpacing: '1px' }}>Order Summary</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#555' }}>
                <span>Subtotal</span>
                <span>KSh {cartTotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#555' }}>
                <span>Shipping</span>
                <span style={{ color: '#2d6a4f', fontWeight: 600 }}>Free</span>
              </div>
              <div style={{ height: '1px', background: '#eee', margin: '0.5rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem' }}>
                <span>Total</span>
                <span>KSh {cartTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Promo code */}
            <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', border: '1px solid #ddd' }}>
              <input
                type="text"
                placeholder="Promo code"
                style={{ flex: 1, padding: '0.7rem 1rem', border: 'none', outline: 'none', fontSize: '0.85rem', background: 'transparent', fontFamily: 'var(--font-body)' }}
              />
              <button style={{ padding: '0.7rem 1rem', background: '#f0f0f0', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Apply</button>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              style={{
                width: '100%', padding: '1rem',
                background: '#1a1a1a', color: '#fff',
                border: 'none', cursor: 'pointer',
                fontSize: '0.85rem', fontWeight: 600, letterSpacing: '2px',
                textTransform: 'uppercase', fontFamily: 'var(--font-body)',
                marginBottom: '1rem',
              }}
            >
              Proceed to Checkout
            </motion.button>

            <Link
              to="/#collections"
              style={{
                display: 'block', textAlign: 'center',
                fontSize: '0.75rem', color: '#888',
                textDecoration: 'underline', letterSpacing: '0.5px',
              }}
            >
              Continue Shopping
            </Link>

            {/* Trust badges */}
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['🔒 Secure Checkout', '🚚 Free Shipping Worldwide', '↩ 30-Day Returns'].map(badge => (
                <p key={badge} style={{ fontSize: '0.75rem', color: '#888', letterSpacing: '0.3px' }}>{badge}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cart-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
