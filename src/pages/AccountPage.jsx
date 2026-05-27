import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { User, LogOut, Trash2, PlusCircle, Package, ChevronRight, Shield, X, AlertTriangle, Settings } from 'lucide-react';

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
    <div style={{ border: '1px solid #f0f0f0', borderRadius: '8px', overflow: 'hidden', transition: 'all 0.2s', background: '#fff' }}>
      <button
        onClick={() => navigate(`/order/${order.id}`)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '1rem',
          padding: '1.25rem', background: '#fff', border: 'none',
          cursor: 'pointer', textAlign: 'left', flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: '0.9rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.5px', margin: 0 }}>
            Order {order.id.slice(0, 8)}...
          </p>
          <p style={{ color: '#888', fontSize: '0.75rem', marginTop: '0.25rem', margin: 0 }}>
            {order.created_at ? new Date(order.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <p style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>KSh {Number(order.total_amount).toLocaleString()}</p>
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
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'profile' | 'danger'

  // Admin step-up auth state
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  const handleAdminAccess = async (e) => {
    e.preventDefault();
    if (!adminPassword) return;
    setAdminLoading(true);
    try {
      const res = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('zanny_admin_unlocked', 'true');
        navigate('/admin');
      } else {
        setAdminError(data.message || 'Incorrect password.');
        setAdminPassword('');
      }
    } catch (err) {
      setAdminError('Network error. Please try again.');
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetch('/api/orders')
      .then(r => r.json())
      .then(data => {
        const mine = Array.isArray(data) ? data.filter(o => o.user_id === user.id) : [];
        setOrders(mine);
        setLoadingOrders(false);
      })
      .catch(() => setLoadingOrders(false));
  }, [user]);

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

      <div className="container" style={{ maxWidth: '1000px', marginTop: '3rem', padding: '0 1rem' }}>
        
        {/* Modern Split Dashboard Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 280px) 1fr', gap: '2rem', alignItems: 'start' }} className="account-grid">
          
          {/* Sidebar / Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* User Profile Summary Card */}
            <div style={{ background: '#fff', border: '1px solid #eee', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', textAlign: 'center' }}>
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #1a1a1a 0%, #444 100%)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem',
                margin: '0 auto 1rem auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                {user.firstName[0].toUpperCase()}
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', margin: 0, textTransform: 'uppercase', color: '#1a1a1a' }}>
                {user.firstName} {user.lastName}
              </h2>
              <p style={{ color: '#888', margin: '0.25rem 0 0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <User size={13} /> {user.email}
              </p>
            </div>

            {/* Sidebar Navigation (Tabs) */}
            <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '0.5rem' }} className="account-nav-tabs">
              <button 
                onClick={() => setActiveTab('orders')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', border: 'none', borderRadius: '8px',
                  background: activeTab === 'orders' ? '#1a1a1a' : 'transparent',
                  color: activeTab === 'orders' ? '#fff' : '#444',
                  fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                }}
              >
                <Package size={18} />
                <span>Order History</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('profile')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', border: 'none', borderRadius: '8px',
                  background: activeTab === 'profile' ? '#1a1a1a' : 'transparent',
                  color: activeTab === 'profile' ? '#fff' : '#444',
                  fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', marginTop: '0.25rem'
                }}
              >
                <Settings size={18} />
                <span>Account Settings</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('danger')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', border: 'none', borderRadius: '8px',
                  background: activeTab === 'danger' ? '#fff5f5' : 'transparent',
                  color: activeTab === 'danger' ? '#c0392b' : '#c0392b',
                  fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', marginTop: '0.25rem',
                  borderLeft: activeTab === 'danger' ? '3px solid #c0392b' : '3px solid transparent'
                }}
              >
                <AlertTriangle size={18} />
                <span>Security & Danger Zone</span>
              </button>
            </div>

          </div>

          {/* Right Column / Content Area */}
          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minHeight: '350px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                
                {/* ── Tab: Orders ── */}
                {activeTab === 'orders' && (
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', letterSpacing: '0.5px', textTransform: 'uppercase', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#1a1a1a', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.75rem' }}>
                      <Package size={20} /> Order History
                    </h3>

                    {loadingOrders && <p style={{ color: '#aaa', fontSize: '0.88rem' }}>Loading orders…</p>}

                    {!loadingOrders && orders.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '3.5rem 0', color: '#bbb' }}>
                        <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem', margin: 0 }}>📦</p>
                        <p style={{ fontSize: '0.9rem', fontWeight: 500, margin: '0.5rem 0' }}>You haven't placed any orders yet.</p>
                        <Link to="/" style={{ display: 'inline-block', marginTop: '0.75rem', color: '#1a1a1a', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'underline' }}>
                          Shop Now →
                        </Link>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {orders.map(order => <OrderCard key={order.id} order={order} />)}
                    </div>
                  </div>
                )}

                {/* ── Tab: Profile / Account Settings ── */}
                {activeTab === 'profile' && (
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', letterSpacing: '0.5px', textTransform: 'uppercase', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#1a1a1a', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.75rem' }}>
                      <Settings size={20} /> Account Settings
                    </h3>
                    
                    <p style={{ fontSize: '0.88rem', color: '#666', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                      Manage secondary links or access dashboard management options if you are an administrator.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <button onClick={() => navigate('/register')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: '#f9f9f9', border: '1px solid #eee', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', color: '#1a1a1a', fontSize: '0.9rem', transition: 'all 0.2s' }}>
                        <PlusCircle size={18} color="#555" />
                        <div style={{ flex: 1 }}>
                          <span style={{ display: 'block', fontWeight: 600 }}>Add Another Account</span>
                          <span style={{ fontSize: '0.78rem', color: '#888' }}>Register an additional profile.</span>
                        </div>
                      </button>

                      {user.role === 'admin' && (
                        <button onClick={() => setShowAdminPrompt(true)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: '#1a1a1a', border: '1px solid #1a1a1a', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', color: '#fff', fontSize: '0.9rem', transition: 'all 0.2s' }}>
                          <Shield size={18} color="#00ff9d" />
                          <div style={{ flex: 1 }}>
                            <span style={{ display: 'block', fontWeight: 600 }}>Admin Dashboard</span>
                            <span style={{ fontSize: '0.78rem', color: '#ccc' }}>Access the secure backend management system.</span>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Tab: Security & Danger Zone ── */}
                {activeTab === 'danger' && (
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', letterSpacing: '0.5px', textTransform: 'uppercase', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#c0392b', borderBottom: '1px solid #f9ebea', paddingBottom: '0.75rem' }}>
                      <AlertTriangle size={20} /> Security & Danger Zone
                    </h3>
                    
                    <div style={{ background: '#fff5f5', border: '1px solid #ffebeb', borderRadius: '8px', padding: '1rem 1.25rem', color: '#c0392b', fontSize: '0.85rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                      <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Important Security Notice</strong>
                        Actions performed in this area are critical. Deleting your account will remove all order histories, addresses, and account files immediately.
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {/* Sign Out Card */}
                      <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                          <span style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: '#1a1a1a' }}>Sign Out</span>
                          <span style={{ fontSize: '0.78rem', color: '#888' }}>End your current active session on this device.</span>
                        </div>
                        <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#444', transition: 'all 0.2s' }}>
                          <LogOut size={15} />
                          <span>Sign Out</span>
                        </button>
                      </div>

                      {/* Delete Account Card */}
                      <div style={{ border: '1px solid #f9ebea', borderRadius: '8px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: '#fcf8f8' }}>
                        <div>
                          <span style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: '#c0392b' }}>Delete Account</span>
                          <span style={{ fontSize: '0.78rem', color: '#a04000' }}>Permanently erase your account records from the database.</span>
                        </div>
                        <button onClick={handleDelete} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: '#c0392b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#fff', transition: 'all 0.2s' }}>
                          <Trash2 size={15} />
                          <span>Delete Account</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* Admin Step-up Auth Modal */}
      {showAdminPrompt && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: '#fff', width: '100%', maxWidth: '400px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Shield size={20} color="#1a1a1a" />
                <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>Security Verification</h3>
              </div>
              <button onClick={() => { setShowAdminPrompt(false); setAdminError(''); setAdminPassword(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#888" /></button>
            </div>
            <form onSubmit={handleAdminAccess} style={{ padding: '2rem 1.5rem' }}>
              <p style={{ color: '#555', fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Please enter your master password to unlock the Admin Dashboard.
              </p>
              
              {adminError && (
                <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '4px', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  {adminError}
                </div>
              )}

              <input
                type="password"
                placeholder="Enter password..."
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                autoFocus
                style={{ width: '100%', padding: '0.9rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.95rem', marginBottom: '1.5rem' }}
              />
              <button disabled={adminLoading} type="submit" style={{ width: '100%', padding: '0.9rem', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.95rem', fontWeight: 600, cursor: adminLoading ? 'not-allowed' : 'pointer' }}>
                {adminLoading ? 'Verifying...' : 'Unlock Dashboard'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
