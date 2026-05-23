import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FEEDBACK_SUGGESTIONS = {
  1: "Very disappointed with the quality/delivery.",
  2: "Not quite what I expected.",
  3: "It's okay, but could be better.",
  4: "Great product, very satisfied.",
  5: "Excellent quality, fast delivery! Highly recommended."
};

export default function ReviewPopup() {
  const { user, isAuthenticated } = useAuth();
  const [pendingOrder, setPendingOrder] = useState(null);
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Check for pending reviews
      fetch(`/api/feedback/pending?userId=${user.id}`)
        .then(r => r.json())
        .then(data => {
          if (data.pending) {
            setPendingOrder(data.pending);
          }
        })
        .catch(console.error);
    }
  }, [isAuthenticated, user]);

  const handleStarClick = (value) => {
    setRating(value);
    setComment(FEEDBACK_SUGGESTIONS[value]);
  };

  const handleDismiss = async () => {
    setPendingOrder(null);
    try {
      await fetch('/api/feedback/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: pendingOrder.id })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: pendingOrder.id, rating, comment })
      });
      if (!res.ok) throw new Error('Failed to submit');
      
      setStatus('success');
      setTimeout(() => {
        setPendingOrder(null);
      }, 3000);
    } catch (err) {
      setStatus('error');
    }
  };

  if (!pendingOrder) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.6)',
          zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem'
        }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          style={{
            background: '#fff',
            width: '100%',
            maxWidth: '450px',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          {/* Header */}
          <div style={{ background: '#1a1a1a', padding: '1.5rem', color: '#fff', position: 'relative' }}>
            <button 
              onClick={handleDismiss}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1.2rem', letterSpacing: '1px' }}>How did we do?</h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#aaa' }}>Your order <strong>{pendingOrder.id}</strong> was recently delivered.</p>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ width: '60px', height: '60px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <Star fill="currentColor" size={30} />
                </motion.div>
                <h4 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>Thank You!</h4>
                <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>Your feedback helps us improve.</p>
              </div>
            ) : (
              <>
                {/* Items Preview */}
                <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1rem', borderBottom: '1px solid #eee', marginBottom: '1.5rem' }}>
                  {pendingOrder.items?.map((item, idx) => (
                    <div key={idx} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8f8f8', padding: '0.5rem', borderRadius: '6px', border: '1px solid #f0f0f0' }}>
                      {item.image_url && <img src={item.image_url} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />}
                      <div>
                        <p style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>{item.name}</p>
                        <p style={{ fontSize: '0.7rem', color: '#888', margin: 0 }}>Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <p style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem', color: '#444' }}>Rate your items & delivery</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', transition: 'transform 0.1s' }}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => handleStarClick(star)}
                        whileHover={{ scale: 1.1 }}
                      >
                        <Star size={36} fill={(hoverRating || rating) >= star ? '#f59e0b' : 'transparent'} color={(hoverRating || rating) >= star ? '#f59e0b' : '#ddd'} />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you loved or what we can improve..."
                  style={{ width: '100%', padding: '0.85rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.85rem', minHeight: '90px', resize: 'vertical', marginBottom: '1rem', fontFamily: 'var(--font-body)', outline: 'none' }}
                />

                {status === 'error' && <p style={{ color: '#dc2626', fontSize: '0.8rem', textAlign: 'center', marginTop: '-0.5rem', marginBottom: '1rem' }}>Failed to submit. Please try again.</p>}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    onClick={handleDismiss}
                    style={{ flex: 1, padding: '0.85rem', background: '#f5f5f5', color: '#444', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Not Now
                  </button>
                  <button 
                    disabled={rating === 0 || status === 'loading'}
                    onClick={handleSubmit}
                    style={{ flex: 2, padding: '0.85rem', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: rating === 0 ? 'not-allowed' : 'pointer', opacity: rating === 0 ? 0.5 : 1 }}
                  >
                    {status === 'loading' ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
