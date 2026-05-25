import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { User, LogOut, Trash2, PlusCircle, Package, ChevronRight } from 'lucide-react';

const STATUS_BADGE = {
  pending:   { bg: '#fff8e1', color: '#f59e0b', label: 'Pending' },
  confirmed: { bg: '#e0f2fe', color: '#0284c7', label: 'Confirmed' },
  shipped:   { bg: '#ede9fe', color: '#7c3aed', label: 'Shipped' },
  delivered: { bg: '#dcfce7', color: '#16a34a', label: 'Delivered ✓' },
  cancelled: { bg: '#fee2e2', color: '#dc2626', label: 'Cancelled' },
};

function OrderCard({ order }) {
  const navigate = useNavigate();
  const sc = STATUS_BADGE[order.status] || STATUS_BADGE.pending;

  return (
    <div style={{ border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden' }}>
      <button
        onClick={() => navigate(`/order/${order.id}`)}
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
          <ChevronRight size={14} color="#888" />
        </div>
      </button>
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
