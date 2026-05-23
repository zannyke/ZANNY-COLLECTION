import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { User, LogOut, Trash2, PlusCircle, Package, ChevronDown, ChevronUp, Star } from 'lucide-react';

const STATUS_BADGE = {
  pending:   { bg: '#fff8e1', color: '#f59e0b', label: 'Pending' },
  confirmed: { bg: '#e0f2fe', color: '#0284c7', label: 'Confirmed' },
  shipped:   { bg: '#ede9fe', color: '#7c3aed', label: 'Shipped' },
  delivered: { bg: '#dcfce7', color: '#16a34a', label: 'Delivered ✓' },
  cancelled: { bg: '#fee2e2', color: '#dc2626', label: 'Cancelled' },
};

const FEEDBACK_SUGGESTIONS = {
  1: "Very disappointed with the quality/delivery.",
  2: "Not quite what I expected.",
  3: "It's okay, but could be better.",
  4: "Great product, very satisfied.",
  5: "Excellent quality, fast delivery! Highly recommended."
};

function FeedbackForm({ orderId }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

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
      
      window.dispatchEvent(new CustomEvent('feedbackSubmitted', { detail: { orderId } }));
      setStatus('success');
    } catch (err) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div style={{ marginTop: '1rem', padding: '1rem', background: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9', borderRadius: '4px', fontSize: '0.85rem' }}>
        Thank you for your feedback! It helps us improve.
      </div>
    );
  }

  return (
    <div style={{ marginTop: '1rem', padding: '1.25rem', background: '#fff', border: '1px solid #eee', borderRadius: '4px' }}>
      <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Leave Feedback</p>
      
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

function OrderCard({ order }) {
  const [open, setOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const sc = STATUS_BADGE[order.status] || STATUS_BADGE.pending;

  const orderTime = new Date(order.created_at).getTime();
  const now = new Date().getTime();
  const diffHours = (now - orderTime) / (1000 * 60 * 60);
  const canCancel = order.status === 'pending' && diffHours < 24;

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, status: 'cancelled', cancelledByCustomer: true })
      });
      if (res.ok) {
        window.location.reload();
      } else {
        alert('Failed to cancel order.');
      }
    } catch(err) {
      alert('Error cancelling order.');
    }
    setCancelling(false);
  };

  return (
    <div style={{ border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '1rem',
          padding: '1rem 1.25rem', background: '#fff', border: 'none',
          cursor: 'pointer', textAlign: 'left', flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: '0.88rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.5px' }}>{order.id}</p>
          <p style={{ color: '#888', fontSize: '0.75rem', marginTop: '0.15rem' }}>
            {order.created_at ? new Date(order.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>KSh {Number(order.total_amount).toLocaleString()}</p>
          <span style={{
            padding: '0.25rem 0.65rem', borderRadius: '50px',
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
            background: sc.bg, color: sc.color,
          }}>{sc.label}</span>
          {open ? <ChevronUp size={14} color="#888" /> : <ChevronDown size={14} color="#888" />}
        </div>
      </button>

      {open && (
        <div style={{ borderTop: '1px solid #f0f0f0', padding: '1rem 1.25rem', background: '#fafafa' }}>
          <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#aaa', marginBottom: '0.75rem' }}>Items</p>
          {(order.items || []).map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid #f0f0f0' }}>
              {item.image_url && (
                <img src={item.image_url} alt={item.product_name} style={{ width: '36px', height: '44px', objectFit: 'cover', background: '#eee' }} />
              )}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a1a1a' }}>{item.product_name || 'Product'}</p>
                <p style={{ fontSize: '0.75rem', color: '#888' }}>Size: {item.size || '—'} · Qty: {item.quantity}</p>
              </div>
              <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>KSh {Number(item.price_at_purchase).toLocaleString()}</p>
            </div>
          ))}
          <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>📍 {order.shipping_address} &nbsp;·&nbsp; 📞 {order.phone_number}</p>
          
          {order.status === 'delivered' && (
            order.has_feedback ? (
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9', borderRadius: '4px', fontSize: '0.85rem' }}>
                Thank you for your feedback! It helps us improve.
              </div>
            ) : (
              <FeedbackForm orderId={order.id} />
            )
          )}

          {order.status === 'pending' && !canCancel && (
            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '1rem', fontStyle: 'italic' }}>
              Order is locked for delivery (past 24 hours).
            </p>
          )}

          {canCancel && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
              {!showConfirm ? (
                <>
                  <button 
                    onClick={() => setShowConfirm(true)}
                    disabled={cancelling}
                    style={{
                      padding: '0.6rem 1.25rem',
                      background: '#fff',
                      color: '#dc2626',
                      border: '1px solid #dc2626',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    Cancel Order
                  </button>
                  <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem' }}>
                    You can cancel this order within 24 hours of placing it.
                  </p>
                </>
              ) : (
                <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '6px', border: '1px solid #fecaca' }}>
                  <p style={{ color: '#991b1b', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                    Are you sure you want to cancel this order?
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                      onClick={handleCancel}
                      disabled={cancelling}
                      style={{
                        padding: '0.5rem 1rem', background: '#dc2626', color: '#fff',
                        border: 'none', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600,
                        cursor: cancelling ? 'not-allowed' : 'pointer', opacity: cancelling ? 0.7 : 1
                      }}
                    >
                      {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
                    </button>
                    <button 
                      onClick={() => setShowConfirm(false)}
                      disabled={cancelling}
                      style={{
                        padding: '0.5rem 1rem', background: '#fff', color: '#444',
                        border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600,
                        cursor: cancelling ? 'not-allowed' : 'pointer'
                      }}
                    >
                      No, keep it
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  const { user, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders]   = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch('/api/orders')
      .then(r => r.json())
      .then(data => {
        // Filter to only this user's orders
        const mine = Array.isArray(data) ? data.filter(o => o.user_id === user.id) : [];
        setOrders(mine);
        setLoadingOrders(false);
      })
      .catch(() => setLoadingOrders(false));
  }, [user]);

  // Listen for feedback submissions from the global ReviewPopup
  useEffect(() => {
    const handleFeedback = (e) => {
      setOrders(prev => prev.map(o => 
        o.id === e.detail.orderId ? { ...o, has_feedback: 1 } : o
      ));
    };
    window.addEventListener('feedbackSubmitted', handleFeedback);
    return () => window.removeEventListener('feedbackSubmitted', handleFeedback);
  }, []);

  const handleSignOut = () => { logout(); navigate('/'); };
  const handleDelete  = () => {
    if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      deleteAccount();
      navigate('/');
    }
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: 'var(--font-body)', paddingBottom: '5rem' }}>
      <PageHeader title="My Account" subtitle="Manage your profile, orders, and preferences." />

      <div className="container" style={{ maxWidth: '860px', marginTop: '3rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* ── Profile Card ── */}
          <div style={{ background: '#fff', border: '1px solid #eee', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%',
                background: '#1a1a1a', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.6rem',
              }}>
                {user.firstName[0].toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: 0, textTransform: 'uppercase' }}>
                  {user.firstName} {user.lastName}
                </h2>
                <p style={{ color: '#888', margin: '0.25rem 0 0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={13} /> {user.email}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={() => navigate('/register')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 1.25rem', background: '#f9f9f9', border: '1px solid #eee', cursor: 'pointer', textAlign: 'left', color: '#1a1a1a', fontSize: '0.9rem', transition: 'all 0.2s' }}>
                <PlusCircle size={16} color="#555" />
                <div style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontWeight: 600 }}>Add Another Account</span>
                  <span style={{ fontSize: '0.78rem', color: '#888' }}>Register a new profile.</span>
                </div>
              </button>

              <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 1.25rem', background: '#f9f9f9', border: '1px solid #eee', cursor: 'pointer', textAlign: 'left', color: '#1a1a1a', fontSize: '0.9rem', transition: 'all 0.2s' }}>
                <LogOut size={16} color="#555" />
                <span style={{ fontWeight: 600 }}>Sign Out</span>
              </button>

              <button onClick={handleDelete} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 1.25rem', background: '#fff5f5', border: '1px solid #ffebeb', cursor: 'pointer', textAlign: 'left', color: '#c0392b', fontSize: '0.9rem', marginTop: '0.5rem', transition: 'all 0.2s' }}>
                <Trash2 size={16} />
                <div style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontWeight: 600 }}>Delete Account</span>
                  <span style={{ fontSize: '0.78rem', opacity: 0.8 }}>Permanently remove your data.</span>
                </div>
              </button>
            </div>
          </div>

          {/* ── Order History ── */}
          <div style={{ background: '#fff', border: '1px solid #eee', padding: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Package size={18} /> Order History
            </h3>

            {loadingOrders && <p style={{ color: '#aaa', fontSize: '0.88rem' }}>Loading orders…</p>}

            {!loadingOrders && orders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2.5rem 0', color: '#bbb' }}>
                <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</p>
                <p style={{ fontSize: '0.88rem' }}>You haven't placed any orders yet.</p>
                <Link to="/" style={{ display: 'inline-block', marginTop: '0.75rem', color: '#1a1a1a', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'underline' }}>
                  Shop Now →
                </Link>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {orders.map(order => <OrderCard key={order.id} order={order} />)}
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
