import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';

import { DELIVERY_ZONES } from '../utils/delivery';
import CustomSelect from '../components/CustomSelect';

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    zone: 'kiambu',
  });

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || '',
        phone: user.phone || prev.phone,
        zone: user.deliveryZone || prev.zone
      }));
    }
  }, [user]);

  const selectedZone = DELIVERY_ZONES.find(z => z.id === form.zone) || DELIVERY_ZONES[0];
  const deliveryFee = selectedZone.fee;
  const finalTotal = cartTotal + deliveryFee;

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'paystack'
  const [error, setError] = useState('');

  // Trust System Logic
  const isRestricted = user?.restricted_from_cod === 1;

  useEffect(() => {
    if (isRestricted) {
      setPaymentMethod('paystack');
    }
  }, [isRestricted]);

  // ── Loading / Auth Guards ──────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ width: '30px', height: '30px', border: '2px solid #ddd', borderTopColor: '#1a1a1a', borderRadius: '50%' }} />
          <p style={{ color: '#666', fontSize: '0.9rem' }}>Securing checkout portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', fontFamily: 'var(--font-body)' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '1rem', letterSpacing: '1px' }}>ACCOUNT REQUIRED FOR CHECKOUT</h2>
        <p style={{ color: '#555', fontSize: '0.95rem', maxWidth: '440px', lineHeight: 1.6, marginBottom: '2.5rem' }}>
          To complete your purchase, track your package status, and receive receipt confirmations, you need to sign in or create an account.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/login?redirect=checkout')} style={{ padding: '1rem 2rem', background: '#1a1a1a', color: '#fff', border: 'none', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', fontSize: '0.85rem' }}>Log In</button>
          <button onClick={() => navigate('/register?redirect=checkout')} style={{ padding: '1rem 2rem', background: '#fff', color: '#1a1a1a', border: '1px solid #ddd', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', fontSize: '0.85rem' }}>Create Account</button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div style={{ minHeight: '60vh', textAlign: 'center', paddingTop: '100px' }}>
        <h2>Your cart is empty.</h2>
        <Link to="/" style={{ textDecoration: 'underline', color: '#1a1a1a', marginTop: '1rem', display: 'inline-block' }}>Return to Shop</Link>
      </div>
    );
  }

  // ── Submit Handler ─────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const fullAddress = `${form.address}, ${selectedZone.label}`;

    try {
      if (paymentMethod === 'paystack') {
        // ── Track A: Paystack Prepaid ─────────────────────────────────────────
        // Do NOT create the order yet. The Paystack webhook on the Worker
        // will insert the confirmed order AFTER payment completes.
        const res = await fetch('/api/payments/initialize-paystack', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cartItems.map(item => ({
              product_id: item.id,
              product_name: item.name,
              product_price: item.price,
              selected_size: item.size,
              selected_color: item.color,
              quantity: item.qty
            })),
            total_amount: finalTotal,
            delivery_address: fullAddress,
            recipient_name: form.fullName,
            recipient_phone: form.phone
          })
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to initialize payment. Please try again.');
          setLoading(false);
          return;
        }

        // Clear cart immediately, then redirect to Paystack hosted checkout
        clearCart();
        window.location.href = data.url;

      } else {
        // ── Track B: Cash on Delivery ─────────────────────────────────────────
        const orderRes = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientName: form.fullName,
            totalAmount: finalTotal,
            shippingAddress: fullAddress,
            phoneNumber: form.phone,
            status: 'pending',
            items: cartItems.map(item => ({
              id: item.id,
              qty: item.qty,
              size: item.size,
              color: item.color,
              price: item.price
            }))
          })
        });

        if (!orderRes.ok) {
          const errData = await orderRes.json();
          setError(errData.error || 'There was an issue processing your order.');
          setLoading(false);
          return;
        }

        clearCart();
        navigate('/order-success');
      }

    } catch (err) {
      console.error(err);
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', paddingBottom: '5rem' }}>
      <style>{`
        .checkout-container {
          max-width: 1000px;
          padding: 1rem;
          margin: 0 auto;
        }
        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 768px) {
          .checkout-container {
            padding: 2rem;
          }
          .checkout-grid {
            grid-template-columns: 1.3fr 1fr;
            gap: 4rem;
          }
        }
      `}</style>
      <PageHeader title="Checkout" subtitle="Complete your delivery details" />

      <div className="checkout-container">
        {error && (
          <div style={{ background: '#f8d7da', color: '#721c24', padding: '1rem', marginBottom: '2rem', border: '1px solid #f5c6cb', borderRadius: '4px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <div className="checkout-grid">

          {/* ── Delivery & Payment Form ── */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#fff', padding: '2rem', border: '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', margin: 0 }}>Delivery Information</h3>
              <Link to="/cart" style={{ color: '#1a1a1a', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #ddd', padding: '0.4rem 0.8rem', borderRadius: '4px' }}>← Back to Cart</Link>
            </div>

            <input required type="text" placeholder="Full Name" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} style={{ padding: '0.85rem', border: '1px solid #ddd', outline: 'none' }} />
            <input required type="email" placeholder="Email Address" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ padding: '0.85rem', border: '1px solid #ddd', outline: 'none' }} />
            <input required type="tel" placeholder="Phone Number (for delivery rider)" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={{ padding: '0.85rem', border: '1px solid #ddd', outline: 'none' }} />
            <input required type="text" placeholder="Delivery Address / Specific Location" value={form.address} onChange={e => setForm({...form, address: e.target.value})} style={{ padding: '0.85rem', border: '1px solid #ddd', outline: 'none' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>Delivery Region</label>
              <div style={{ border: '1px solid #ddd', background: '#fff', borderRadius: '4px', padding: '0.2rem 0.85rem' }}>
                <CustomSelect
                  options={DELIVERY_ZONES.map(z => ({ value: z.id, label: z.label, shortLabel: z.shortLabel }))}
                  value={form.zone}
                  onChange={(val) => setForm({ ...form, zone: val })}
                  placeholder="Select Delivery Region"
                />
              </div>
            </div>

            {/* ── Payment Method ── */}
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginTop: '1rem' }}>Payment Method</h3>

            {isRestricted && (
              <div style={{ background: '#fff3cd', color: '#856404', padding: '1rem', border: '1px solid #ffeeba', borderRadius: '4px', fontSize: '0.85rem', lineHeight: 1.5 }}>
                <strong>Note:</strong> Due to consecutive past cancellations, Pay on Delivery is temporarily disabled for your account. Please pay online with Paystack. You will regain this privilege after 3 successful deliveries.
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Paystack Option */}
              <label style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', border: paymentMethod === 'paystack' ? '2px solid #1a1a1a' : '1px solid #ddd', padding: '1rem', cursor: 'pointer', background: paymentMethod === 'paystack' ? '#fafafa' : '#fff', borderRadius: '4px', transition: 'all 0.2s' }}>
                <input type="radio" name="payment" value="paystack" checked={paymentMethod === 'paystack'} onChange={() => setPaymentMethod('paystack')} style={{ marginTop: '0.2rem' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <p style={{ fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Pay Online</p>
                    <span style={{ background: '#0066cc', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '3px', letterSpacing: '0.5px' }}>PAYSTACK</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.3rem' }}>Pay securely online with M-Pesa, card, or bank. You will be redirected to the Paystack checkout page.</p>
                </div>
              </label>

              {/* Cash on Delivery Option */}
              <label style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', border: paymentMethod === 'cod' ? '2px solid #1a1a1a' : '1px solid #ddd', padding: '1rem', cursor: isRestricted ? 'not-allowed' : 'pointer', background: paymentMethod === 'cod' ? '#fafafa' : '#fff', borderRadius: '4px', opacity: isRestricted ? 0.5 : 1, transition: 'all 0.2s' }}>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => !isRestricted && setPaymentMethod('cod')} disabled={isRestricted} style={{ marginTop: '0.2rem' }} />
                <div>
                  <p style={{ fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Pay on Delivery</p>
                  <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.3rem' }}>Pay cash when the item is delivered to you. Available across all delivery zones.</p>
                </div>
              </label>

            </div>

            {paymentMethod === 'paystack' && (
              <div style={{ background: '#f0f7ff', border: '1px solid #bcd4f0', borderRadius: '4px', padding: '0.85rem', fontSize: '0.8rem', color: '#1a4a7a', lineHeight: 1.6 }}>
                🔒 You will be redirected to a secure Paystack checkout page. Your payment details are handled directly by Paystack and are never stored on our servers.
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              style={{
                marginTop: '1rem', padding: '1rem', background: loading ? '#888' : '#1a1a1a', color: '#fff',
                border: 'none', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.85rem'
              }}
            >
              {loading
                ? 'Processing...'
                : paymentMethod === 'paystack'
                  ? `Pay KSh ${finalTotal.toLocaleString()} Online`
                  : `Confirm Order (KSh ${finalTotal.toLocaleString()})`
              }
            </motion.button>
          </form>

          {/* ── Order Summary ── */}
          <div style={{ background: '#fff', padding: '2rem', border: '1px solid #eee', alignSelf: 'start', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1.5rem' }}>Order Summary</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {cartItems.map(item => (
                <div key={item.key} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img src={item.image} alt={item.name} style={{ width: '50px', height: '60px', objectFit: 'cover', background: '#f8f8f8' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#888' }}>Size: {item.size}{item.color ? ` | ${item.color}` : ''} | Qty: {item.qty}</p>
                  </div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>KSh {(item.price * item.qty).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#555' }}>
                <span>Subtotal</span>
                <span>KSh {cartTotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#555' }}>
                <span>Delivery Fee</span>
                <span style={{ color: deliveryFee === 0 ? '#2d6a4f' : '#1a1a1a', fontWeight: deliveryFee === 0 ? 600 : 400 }}>
                  {deliveryFee === 0 ? 'Free' : `KSh ${deliveryFee.toLocaleString()}`}
                </span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
              <span>Total to Pay</span>
              <span>KSh {finalTotal.toLocaleString()}</span>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['🔒 Secure Checkout', '🚚 Fast Nationwide Delivery', '↩ 30-Day Returns'].map(badge => (
                <span key={badge} style={{ fontSize: '0.75rem', color: '#888', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>{badge}</span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
