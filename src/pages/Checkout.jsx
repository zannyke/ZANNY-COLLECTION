import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: isAuthenticated ? `${user.firstName} ${user.lastName}` : '',
    email: isAuthenticated ? user.email : '',
    phone: '',
    address: '',
    city: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (cartItems.length === 0 && !success) {
    return (
      <div style={{ minHeight: '60vh', textAlign: 'center', paddingTop: '100px' }}>
        <h2>Your cart is empty.</h2>
        <Link to="/" style={{ textDecoration: 'underline', color: '#1a1a1a', marginTop: '1rem', display: 'inline-block' }}>Return to Shop</Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fullAddress = `${form.address}, ${form.city}`;
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'guest',
          totalAmount: cartTotal,
          shippingAddress: fullAddress,
          phoneNumber: form.phone,
          items: cartItems.map(item => ({
            id: item.id,
            qty: item.qty,
            size: item.size,
            price: item.price
          }))
        })
      });

      if (res.ok) {
        setSuccess(true);
        clearCart();
        setTimeout(() => navigate('/account'), 3000);
      } else {
        alert("There was an issue processing your order.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div style={{ fontSize: '4rem', color: '#27ae60', marginBottom: '1rem' }}>✓</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', letterSpacing: '2px', marginBottom: '1rem' }}>Order Placed</h2>
        <p style={{ color: '#888', maxWidth: '400px', textAlign: 'center' }}>
          Your order has been successfully submitted. Our team will contact you shortly to confirm delivery!
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', paddingBottom: '5rem' }}>
      <PageHeader title="Checkout" subtitle="Complete your delivery details" />
      
      <div className="container" style={{ maxWidth: '1000px', padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem' }}>
          
          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#fff', padding: '2rem', border: '1px solid #eee' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>Delivery Information</h3>
            
            <input required type="text" placeholder="Full Name" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} style={{ padding: '0.85rem', border: '1px solid #ddd', outline: 'none' }} />
            <input required type="email" placeholder="Email Address" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ padding: '0.85rem', border: '1px solid #ddd', outline: 'none' }} />
            <input required type="tel" placeholder="Phone Number (for delivery rider)" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={{ padding: '0.85rem', border: '1px solid #ddd', outline: 'none' }} />
            <input required type="text" placeholder="Delivery Address / Location" value={form.address} onChange={e => setForm({...form, address: e.target.value})} style={{ padding: '0.85rem', border: '1px solid #ddd', outline: 'none' }} />
            <input required type="text" placeholder="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})} style={{ padding: '0.85rem', border: '1px solid #ddd', outline: 'none' }} />

            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginTop: '1rem' }}>Payment Method</h3>
            <div style={{ border: '1px solid #ddd', padding: '1rem', background: '#f8f8f8' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Pay on Delivery</p>
              <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.2rem' }}>You will pay via M-Pesa or Cash when the item is delivered to you.</p>
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
              {loading ? 'Processing...' : `Confirm Order (KSh ${cartTotal.toLocaleString()})`}
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

            <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
              <span>Total to Pay</span>
              <span>KSh {cartTotal.toLocaleString()}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
