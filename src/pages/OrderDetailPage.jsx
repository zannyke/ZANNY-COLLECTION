import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Package, Star, AlertCircle, RefreshCw, Navigation, CheckCircle2, Circle } from 'lucide-react';

const STATUS_BADGE = {
  pending:   { bg: '#f5f5f5', color: '#1a1a1a', label: 'Pending', msg: 'Waiting to be processed' },
  confirmed: { bg: '#e5e5e5', color: '#1a1a1a', label: 'Confirmed', msg: 'Preparing your order' },
  shipped:   { bg: '#d5d5d5', color: '#1a1a1a', label: 'Shipped', msg: 'On the way to you' },
  delivered: { bg: '#1a1a1a', color: '#ffffff', label: 'Delivered ✓', msg: 'Successfully delivered' },
  cancelled: { bg: '#ffeeee', color: '#dc2626', label: 'Cancelled', msg: 'Order was cancelled' },
};

const FEEDBACK_SUGGESTIONS = {
  1: "Very disappointed with the quality/delivery.",
  2: "Not quite what I expected.",
  3: "It's okay, but could be better.",
  4: "Great product, very satisfied.",
  5: "Excellent quality, fast delivery! Highly recommended."
};

function FeedbackForm({ orderId, onComplete }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('idle');

  const handleStarClick = (value) => {
    setRating(value);
    setComment(FEEDBACK_SUGGESTIONS[value]);
  };

  const submitFeedback = async () => {
    if (rating === 0) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, rating, comment })
      });
      if (!res.ok) throw new Error('Failed to submit feedback');
      
      setStatus('success');
      setTimeout(onComplete, 2000);
    } catch (err) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div style={{ marginTop: '1rem', padding: '1rem', background: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9', borderRadius: '4px', fontSize: '0.85rem' }}>
        Thank you for your feedback!
      </div>
    );
  }

  return (
    <div style={{ marginTop: '1rem', padding: '1.25rem', background: '#fcfcfc', border: '1px solid #eee', borderRadius: '4px' }}>
      <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Leave Feedback for this Order</p>
      
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => handleStarClick(star)}
          >
            <Star size={24} fill={(hoverRating || rating) >= star ? '#f59e0b' : 'transparent'} color={(hoverRating || rating) >= star ? '#f59e0b' : '#ddd'} />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Tell us what you think..."
        style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.85rem', minHeight: '80px', resize: 'vertical', marginBottom: '0.75rem', fontFamily: 'var(--font-body)' }}
      />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          disabled={rating === 0 || status === 'loading'}
          onClick={submitFeedback}
          style={{ padding: '0.6rem 1.5rem', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, cursor: rating === 0 ? 'not-allowed' : 'pointer', opacity: rating === 0 ? 0.5 : 1 }}
        >
          {status === 'loading' ? 'Submitting...' : 'Submit Feedback'}
        </button>
        {status === 'error' && <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>Failed to submit. Try again.</span>}
      </div>
    </div>
  );
}

function PackageHistory({ order }) {
  const steps = [
    { id: 'pending', label: 'ORDER PLACED', date: order.created_at, activeStatus: ['pending', 'confirmed', 'shipped', 'delivered'], msg: 'Your order has been placed successfully.' },
    { id: 'confirmed', label: 'PENDING CONFIRMATION', date: order.confirmed_at, activeStatus: ['confirmed', 'shipped', 'delivered'], msg: 'Your order has been confirmed.' },
    { id: 'shipped', label: 'SHIPPED', date: order.shipped_at, activeStatus: ['shipped', 'delivered'], msg: 'Your order is on its way.' },
    { id: 'delivered', label: 'DELIVERED', date: order.delivered_at, activeStatus: ['delivered'], msg: 'Your order has been delivered.' }
  ];

  if (order.status === 'cancelled') {
    return (
       <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Package History</h3>
          <p style={{ color: '#dc2626', fontWeight: 600 }}>This order was cancelled.</p>
       </div>
    );
  }

  return (
    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: '1.5rem' }}>Package History</h3>
      
      {order.tracking_number && (
        <div style={{ background: '#fcfcfc', border: '1px solid #eee', padding: '1.25rem', borderRadius: '4px', marginBottom: '1.5rem', borderLeft: '3px solid #1a1a1a' }}>
          <p style={{ color: '#555', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>Tracking Code / Link Provided:</p>
          <p style={{ color: '#1a1a1a', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{order.tracking_number}</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {steps.map((step, idx) => {
          const isCompleted = step.activeStatus.includes(order.status);
          const isCurrent = order.status === step.id;
          
          return (
            <div key={step.id} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
              {/* Timeline line */}
              {idx !== steps.length - 1 && (
                <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '-8px', width: '2px', background: isCompleted ? '#1a1a1a' : '#eee', zIndex: 1 }} />
              )}
              
              {/* Dot */}
              <div style={{ position: 'relative', zIndex: 2, marginTop: '2px' }}>
                {isCompleted && !isCurrent ? (
                  <CheckCircle2 size={24} fill="#1a1a1a" color="#fff" />
                ) : isCurrent ? (
                   <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '4px solid #1a1a1a', background: '#fff' }} />
                ) : (
                  <Circle size={24} color="#ddd" />
                )}
              </div>

              {/* Content */}
              <div style={{ paddingBottom: '2rem', flex: 1, opacity: isCompleted ? 1 : 0.5 }}>
                <span style={{ 
                  display: 'inline-block', 
                  background: isCurrent || isCompleted ? '#1a1a1a' : '#f5f5f5', 
                  color: isCurrent || isCompleted ? '#fff' : '#888',
                  border: isCurrent || isCompleted ? '1px solid #1a1a1a' : '1px solid #eee',
                  padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase'
                }}>
                  {step.label}
                </span>
                {step.date && (
                  <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    {new Date(step.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </p>
                )}
                {isCurrent && (
                  <p style={{ color: '#555', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
                    {step.msg}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) throw new Error('Failed to fetch order');
        const orders = await res.json();
        const found = orders.find(o => o.id === orderId);
        if (!found) throw new Error('Order not found');
        setOrder(found);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
        <RefreshCw className="spinner" size={32} color="#aaa" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
        <AlertCircle size={48} color="#dc2626" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontFamily: 'var(--font-heading)' }}>{error || 'Order Not Found'}</h2>
        <Link to="/account" style={{ marginTop: '1rem', color: '#1a1a1a', textDecoration: 'underline' }}>Back to Account</Link>
      </div>
    );
  }

  const sc = STATUS_BADGE[order.status] || STATUS_BADGE.pending;
  
  // Logic
  const itemsSum = order.items.reduce((acc, item) => acc + (item.price_at_purchase * item.quantity), 0);
  const deliveryFee = Math.max(0, order.total_amount - itemsSum);
  const isMpesa = !!order.mpesa_receipt || !!order.mpesa_checkout_id;
  const paymentMethodStr = isMpesa ? 'Pay Now with M-Pesa' : 'Cash on Delivery';

  const orderTime = new Date(order.created_at).getTime();
  const now = new Date().getTime();
  const diffHours = (now - orderTime) / (1000 * 60 * 60);
  const canCancel = order.status === 'pending' && diffHours < 24;

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, status: 'cancelled', cancelledByCustomer: true })
      });
      if (res.ok) {
        setOrder(prev => ({ ...prev, status: 'cancelled' }));
      } else {
        alert('Failed to cancel order.');
      }
    } catch(err) {
      alert('Error cancelling order.');
    }
    setCancelling(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', color: '#1a1a1a', paddingTop: '100px', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '900px', padding: '0 1rem' }}>
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/account')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#1a1a1a', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', marginBottom: '1.5rem', padding: 0 }}
        >
          <ChevronLeft size={20} /> Order Details
        </button>

        {/* Header Section */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>Order nº {order.id}</h1>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{order.items.length} Items</p>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Placed on {new Date(order.created_at).toLocaleDateString('en-GB')}</p>
            <p style={{ color: '#1a1a1a', fontSize: '1rem', fontWeight: 600, marginTop: '0.5rem' }}>Total: KSh {Number(order.total_amount).toLocaleString()}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
             <span style={{
                display: 'inline-block',
                background: sc.bg, color: sc.color,
                padding: '0.35rem 0.85rem', borderRadius: '50px',
                fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase'
              }}>
                {sc.label}
              </span>
          </div>
        </div>

        {/* Items Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem', color: '#555' }}>Items in your order</h2>
          
          <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
            {order.items.map((item, idx) => (
              <div key={item.id} style={{ padding: '1.5rem', borderBottom: idx !== order.items.length - 1 ? '1px solid #eee' : 'none' }}>
                
                {/* Item Status */}
                <div style={{ display: 'inline-block', background: sc.color, color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  {sc.msg}
                </div>
                
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ width: '100px', height: '100px', background: '#f8f8f8', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={item.image_url} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column' }}>
                    <Link to={`/product/${item.product_id}`} style={{ textDecoration: 'none', color: '#1a1a1a' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.25rem' }}>{item.product_name}</h3>
                    </Link>
                    <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                      QTY: {item.quantity} {item.size && `| Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                    </p>
                    <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                       <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>KSh {Number(item.price_at_purchase).toLocaleString()}</span>
                    </div>
                  </div>

                  <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '160px' }}>
                    {canCancel && (
                      <button 
                        disabled={cancelling}
                        onClick={handleCancel}
                        style={{ width: '100%', padding: '0.75rem', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: cancelling ? 'not-allowed' : 'pointer', fontSize: '0.9rem', opacity: cancelling ? 0.7 : 1 }}
                      >
                        {cancelling ? 'Cancelling...' : 'Cancel Item'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {order.status === 'delivered' && !order.has_feedback && (
              <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                <FeedbackForm orderId={order.id} onComplete={() => setOrder({...order, has_feedback: 1})} />
              </div>
            )}
          </div>
        </div>

        {/* Tracking Timeline Section */}
        <PackageHistory order={order} />

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          {/* Payment Info */}
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #eee', paddingBottom: '0.75rem', marginBottom: '1rem', color: '#555' }}>Payment Information</h3>
            
            <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>Payment Method</p>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{paymentMethodStr}</p>
            
            <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem' }}>Payment Details</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', color: '#666', fontSize: '0.9rem' }}>
              <span>Items total:</span>
              <span>KSh {itemsSum.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
              <span>Delivery Fees:</span>
              <span>KSh {deliveryFee.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.05rem', color: '#1a1a1a', borderTop: '1px dashed #eee', paddingTop: '0.5rem' }}>
              <span>Total:</span>
              <span>KSh {Number(order.total_amount).toLocaleString()}</span>
            </div>
          </div>

          {/* Delivery Info */}
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #eee', paddingBottom: '0.75rem', marginBottom: '1rem', color: '#555' }}>Delivery Information</h3>
            
            <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>Delivery Method</p>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{order.shipping_address?.toLowerCase().includes('pick-up') ? 'Pick-up Station' : 'Standard Delivery'}</p>
            
            <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem' }}>Delivery Address</p>
            <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.5rem', whiteSpace: 'pre-wrap' }}>
              {order.shipping_address}
            </p>
            
            <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem', marginTop: '1.5rem' }}>Shipping Details</p>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Phone: {order.phone_number}</p>
          </div>

        </div>

      </div>
    </div>
  );
}
