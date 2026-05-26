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
        phone: user.phone_number || prev.phone,
        zone: user.default_delivery_zone || prev.zone
      }));
    }
  }, [user]);

  const selectedZone = DELIVERY_ZONES.find(z => z.id === form.zone) || DELIVERY_ZONES[0];
  const deliveryFee = selectedZone.fee;
  const finalTotal = cartTotal + deliveryFee;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'mpesa'
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [polling, setPolling] = useState(false);
  const [pollError, setPollError] = useState('');

  // Update mpesaPhone when form phone changes initially
  useEffect(() => {
    if (form.phone && !mpesaPhone) {
      setMpesaPhone(form.phone);
    }
  }, [form.phone]);

  // Trust System Logic
  const isRestricted = user?.restricted_from_cod === 1;

  useEffect(() => {
    if (isRestricted) {
      setPaymentMethod('mpesa');
    }
  }, [isRestricted]);

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

  if (cartItems.length === 0 && !success && !polling) {
    return (
      <div style={{ minHeight: '60vh', textAlign: 'center', paddingTop: '100px' }}>
        <h2>Your cart is empty.</h2>
        <Link to="/" style={{ textDecoration: 'underline', color: '#1a1a1a', marginTop: '1rem', display: 'inline-block' }}>Return to Shop</Link>
      </div>
    );
  }

  const handleMpesaPolling = async (checkoutRequestId, orderId) => {
    let attempts = 0;
    const maxAttempts = 20; // 20 * 3s = 60 seconds

    const poll = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/mpesa/status?checkoutRequestId=${checkoutRequestId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'paid') {
            clearInterval(poll);
            clearCart();
            navigate('/order-success');
          } else if (data.status === 'payment_failed') {
            clearInterval(poll);
            setPolling(false);
            setPollError('M-Pesa payment failed or was cancelled. Please try again.');
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }

      if (attempts >= maxAttempts) {
        clearInterval(poll);
        setPolling(false);
        setPollError('Payment request timed out. If you paid, please contact support.');
      }
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPollError('');

    const fullAddress = `${form.address}, ${selectedZone.label}`;
    
    try {
      // 1. Create the base order in D1
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'guest',
          totalAmount: finalTotal,
          shippingAddress: fullAddress,
          phoneNumber: form.phone,
          status: paymentMethod === 'mpesa' ? 'pending_payment' : 'pending',
          items: cartItems.map(item => ({
            id: item.id,
            qty: item.qty,
            size: item.size,
            price: item.price
          }))
        })
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json();
        alert(errData.error || "There was an issue processing your order.");
        setLoading(false);
        return;
      }

      const orderData = await orderRes.json();
      const orderId = orderData.orderId; // Assume API returns the created orderId

      if (paymentMethod === 'mpesa') {
        // 2. Trigger STK Push
        const stkRes = await fetch('/api/mpesa/stkpush', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderId,
            amount: finalTotal,
            phone: mpesaPhone || form.phone
          })
        });

        const stkData = await stkRes.json();
        
        if (stkRes.ok && stkData.success) {
          setPolling(true);
          handleMpesaPolling(stkData.checkoutRequestId, orderId);
        } else {
          setPollError(stkData.error || "Failed to initiate M-Pesa. Try again.");
          setLoading(false);
        }

      } else {
        // Cash on Delivery
        clearCart();
        navigate('/order-success');
      }

    } catch (err) {
      console.error(err);
      alert("Network error.");
      setLoading(false);
    }
  };

  if (polling) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fafafa', padding: '2rem', textAlign: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ width: '50px', height: '50px', border: '3px solid #ddd', borderTopColor: '#2d6a4f', borderRadius: '50%', marginBottom: '2rem' }} />
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '1rem' }}>Waiting for Payment...</h2>
        <p style={{ fontSize: '1rem', color: '#555', maxWidth: '400px', lineHeight: 1.6 }}>
          Please check your phone. An M-Pesa STK Push has been sent to <strong>{mpesaPhone || form.phone}</strong>.
          Enter your M-Pesa PIN to complete the transaction.
        </p>
        <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#888' }}>Do not refresh this page.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', paddingBottom: '5rem' }}>
      <PageHeader title="Checkout" subtitle="Complete your delivery details" />
      
      <div className="container" style={{ maxWidth: '1000px', padding: '2rem' }}>
        {pollError && (
          <div style={{ background: '#f8d7da', color: '#721c24', padding: '1rem', marginBottom: '2rem', border: '1px solid #f5c6cb', borderRadius: '4px' }}>
            {pollError}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem' }}>
          
          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#fff', padding: '2rem', border: '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', margin: 0 }}>Delivery Information</h3>
              <Link to="/cart" style={{ color: '#1a1a1a', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #ddd', padding: '0.4rem 0.8rem', borderRadius: '4px' }}>← Back to Cart</Link>
            </div>
            
            <input required type="text" placeholder="Full Name" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} style={{ padding: '0.85rem', border: '1px solid #ddd', outline: 'none' }} />
            <input required type="email" placeholder="Email Address" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ padding: '0.85rem', border: '1px solid #ddd', outline: 'none' }} />
            <input required type="tel" placeholder="Phone Number (for delivery rider)" value={form.phone} onChange={e => { setForm({...form, phone: e.target.value}); if(!mpesaPhone) setMpesaPhone(e.target.value); }} style={{ padding: '0.85rem', border: '1px solid #ddd', outline: 'none' }} />
            <input required type="text" placeholder="Delivery Address / Specific Location" value={form.address} onChange={e => setForm({...form, address: e.target.value})} style={{ padding: '0.85rem', border: '1px solid #ddd', outline: 'none' }} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>Delivery Region</label>
              <div style={{ border: '1px solid #ddd', background: '#fff', borderRadius: '4px', padding: '0.2rem 0.85rem' }}>
                <CustomSelect 
                  options={DELIVERY_ZONES.map(z => ({ value: z.id, label: z.label }))}
                  value={form.zone}
                  onChange={(val) => setForm({ ...form, zone: val })}
                  placeholder="Select Delivery Region"
                />
              </div>
            </div>

            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginTop: '1rem' }}>Payment Method</h3>
            
            {isRestricted && (
              <div style={{ background: '#fff3cd', color: '#856404', padding: '1rem', border: '1px solid #ffeeba', borderRadius: '4px', fontSize: '0.85rem', lineHeight: 1.5 }}>
                <strong>Note:</strong> Due to consecutive past cancellations, Pay on Delivery is temporarily disabled for your account. Please pay upfront via M-Pesa. You will regain this privilege after 3 successful deliveries.
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* M-Pesa Option */}
              <label style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', border: paymentMethod === 'mpesa' ? '2px solid #2d6a4f' : '1px solid #ddd', padding: '1rem', cursor: 'pointer', background: paymentMethod === 'mpesa' ? '#f0fdf4' : '#fff', borderRadius: '4px', transition: 'all 0.2s' }}>
                <input type="radio" name="payment" value="mpesa" checked={paymentMethod === 'mpesa'} onChange={() => setPaymentMethod('mpesa')} style={{ marginTop: '0.2rem' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: paymentMethod === 'mpesa' ? '#2d6a4f' : '#1a1a1a' }}>Pay with M-Pesa</p>
                  <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.2rem' }}>A prompt will be sent to your phone to enter your PIN.</p>
                  
                  {paymentMethod === 'mpesa' && (
                    <div style={{ marginTop: '1rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#444' }}>M-Pesa Phone Number</label>
                      <input 
                        type="tel" 
                        required={paymentMethod === 'mpesa'} 
                        placeholder="e.g. 0712345678" 
                        value={mpesaPhone} 
                        onChange={e => setMpesaPhone(e.target.value)} 
                        style={{ width: '100%', padding: '0.6rem', marginTop: '0.3rem', border: '1px solid #ddd', outline: 'none' }} 
                      />
                    </div>
                  )}
                </div>
              </label>

              {/* COD Option */}
              <label style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', border: paymentMethod === 'cod' ? '2px solid #1a1a1a' : '1px solid #ddd', padding: '1rem', cursor: isRestricted ? 'not-allowed' : 'pointer', background: paymentMethod === 'cod' ? '#fafafa' : '#fff', borderRadius: '4px', opacity: isRestricted ? 0.5 : 1, transition: 'all 0.2s' }}>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => !isRestricted && setPaymentMethod('cod')} disabled={isRestricted} style={{ marginTop: '0.2rem' }} />
                <div>
                  <p style={{ fontWeight: 600, color: '#1a1a1a' }}>Pay on Delivery</p>
                  <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.2rem' }}>Pay when the item is delivered to you.</p>
                </div>
              </label>

            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              style={{
                marginTop: '1rem', padding: '1rem', background: loading ? '#888' : '#1a1a1a', color: '#fff',
                border: 'none', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer'
              }}
            >
              {loading ? 'Processing...' : (paymentMethod === 'mpesa' ? `Pay KSh ${finalTotal.toLocaleString()}` : `Confirm Order (KSh ${finalTotal.toLocaleString()})`)}
            </motion.button>
          </form>

          {/* Summary */}
          <div style={{ background: '#fff', padding: '2rem', border: '1px solid #eee', alignSelf: 'start', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1.5rem' }}>Order Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {cartItems.map(item => (
                <div key={item.key} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img src={item.image} alt={item.name} style={{ width: '50px', height: '60px', objectFit: 'cover', background: '#f8f8f8' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#888' }}>Size: {item.size} | Qty: {item.qty}</p>
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
          </div>

        </div>
      </div>
    </div>
  );
}
