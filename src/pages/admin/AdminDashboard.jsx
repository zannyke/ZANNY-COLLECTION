import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useProducts, CATEGORIES } from '../../context/ProductContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Monitor, TrendingUp, BarChart3, Activity, Package, ShoppingBag, LayoutDashboard, Menu, X, MessageSquare, Lock } from 'lucide-react';

// ── Simulated Analytics Data ─────────────────────────────────────────
const daily   = Array.from({ length: 30 }, (_, i) => ({ date: `Day ${i + 1}`, Visitors: 0, PageViews: 0 }));
const weekly  = ['Week 1','Week 2','Week 3','Week 4'].map(w => ({ date: w, Visitors: 0, PageViews: 0 }));
const monthly = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => ({ date: m, Visitors: 0, PageViews: 0 }));
const yearly  = ['2023','2024','2025','2026'].map(y => ({ date: y, Visitors: 0, PageViews: 0 }));
const DATA = { daily, weekly, monthly, yearly };

const STATUS_COLORS = {
  pending:   { bg: '#fff8e1', text: '#f59e0b', border: '#fde68a' },
  confirmed: { bg: '#e0f2fe', text: '#0284c7', border: '#bae6fd' },
  shipped:   { bg: '#ede9fe', text: '#7c3aed', border: '#ddd6fe' },
  delivered: { bg: '#dcfce7', text: '#16a34a', border: '#bbf7d0' },
  cancelled: { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' },
};

// ── Stat Card ─────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent, t }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: t.surface, border: `1px solid ${t.border}`,
        padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem',
      }}
    >
      <p style={{ color: t.textMuted, fontSize: '0.7rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ color: accent || t.text, fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{value}</p>
      {sub && <p style={{ color: t.textMuted, fontSize: '0.75rem', opacity: 0.7 }}>{sub}</p>}
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label, t }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, padding: '0.75rem 1rem' }}>
      <p style={{ color: t.textMuted, fontSize: '0.75rem', marginBottom: '0.4rem' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, fontSize: '0.85rem' }}>
          {p.name}: <strong>{p.value.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
};

// ── Orders Tab ────────────────────────────────────────────────────────
function OrdersTab({ t, accentColor }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    fetch('/api/orders')
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id, status) => {
    let trackingNumber = null;
    if (status === 'shipped') {
      trackingNumber = window.prompt("Enter tracking number/link for the customer email (optional):");
    }

    setUpdating(id);
    const res = await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, status, trackingNumber })
    });
    
    if (res.ok) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } else {
      const err = await res.json();
      alert(`Failed to update status: ${err.error || 'Unknown error'}`);
    }
    setUpdating(null);
  };

  if (loading) return <p style={{ color: t.textMuted, padding: '2rem' }}>Loading orders…</p>;
  if (!orders.length) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: t.textMuted }}>
      <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📦</p>
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', letterSpacing: '1px', marginBottom: '0.5rem' }}>No Orders Yet</p>
      <p style={{ fontSize: '0.82rem' }}>Orders placed by customers will appear here.</p>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '1px' }}>All Orders ({orders.length})</h2>
        <button onClick={fetchOrders} style={{ background: 'none', border: `1px solid ${t.border}`, color: t.textMuted, padding: '0.4rem 0.9rem', cursor: 'pointer', fontSize: '0.72rem', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>↻ Refresh</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {orders.map(order => {
          const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
          const isExpanded = expanded === order.id;
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ background: t.surface, border: `1px solid ${t.border}`, overflow: 'hidden' }}
            >
              {/* Order Header Row */}
              <div
                className="admin-order-row"
                style={{ padding: '1.1rem 1.5rem', cursor: 'pointer' }}
                onClick={() => setExpanded(isExpanded ? null : order.id)}
              >
                <div className="order-col-left">
                  <p style={{ fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.5px' }}>{order.id}</p>
                  <p style={{ color: t.textMuted, fontSize: '0.72rem', marginTop: '0.15rem' }}>
                    {order.created_at ? new Date(order.created_at).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                  </p>
                </div>

                <div className="order-col-mid" style={{ color: t.textMuted }}>
                  <p style={{ fontSize: '0.82rem' }}>📍 {order.shipping_address || '—'}</p>
                  <p style={{ fontSize: '0.82rem', marginTop: '0.15rem' }}>📞 {order.phone_number || '—'}</p>
                </div>

                <div className="order-col-right">
                  <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem' }}>
                    KSh {Number(order.total_amount).toLocaleString()}
                  </p>

                  <span style={{
                    padding: '0.3rem 0.75rem', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 700,
                    letterSpacing: '0.5px', textTransform: 'uppercase',
                    background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`
                  }}>{order.status}</span>

                  <span style={{ color: t.textMuted, fontSize: '0.9rem', userSelect: 'none' }}>{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div style={{ borderTop: `1px solid ${t.border}`, padding: '1.25rem 1.5rem', background: t.bg }}>
                  {/* Items */}
                  <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: t.textMuted, marginBottom: '0.75rem' }}>Items Ordered</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {(order.items || []).map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0', borderBottom: `1px solid ${t.border}` }}>
                        {item.image_url && (
                          <img src={item.image_url} alt={item.product_name} style={{ width: '40px', height: '48px', objectFit: 'cover', background: t.surface }} />
                        )}
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.product_name || 'Unknown Product'}</p>
                          <p style={{ fontSize: '0.75rem', color: t.textMuted }}>Size: {item.size || '—'} · Qty: {item.quantity}</p>
                        </div>
                        <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>KSh {Number(item.price_at_purchase).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  {/* Status Updater */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: t.textMuted }}>Update Status:</p>
                    {['pending','confirmed','shipped','delivered','cancelled'].map(s => {
                      const c = STATUS_COLORS[s];
                      const isActive = order.status === s;
                      return (
                        <button
                          key={s}
                          disabled={updating === order.id || isActive}
                          onClick={() => updateStatus(order.id, s)}
                          style={{
                            padding: '0.35rem 0.85rem', fontSize: '0.7rem', fontWeight: 700,
                            letterSpacing: '0.5px', textTransform: 'uppercase', cursor: isActive ? 'default' : 'pointer',
                            border: `1.5px solid ${isActive ? c.border : t.border}`,
                            background: isActive ? c.bg : 'transparent',
                            color: isActive ? c.text : t.textMuted,
                            borderRadius: '4px', fontFamily: 'var(--font-body)',
                            transition: 'all 0.2s',
                            opacity: updating === order.id && !isActive ? 0.5 : 1,
                          }}
                        >{s}</button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Security Tab ────────────────────────────────────────────────────────
function SecurityTab({ t, accentColor, logout }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        // Automatically logout after 2 seconds to force re-login with new password
        setTimeout(() => logout(), 2500);
      } else {
        setError(data.error || 'Failed to update password');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '500px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', letterSpacing: '2px', marginBottom: '0.3rem' }}>Security</h1>
        <p style={{ color: t.textMuted, fontSize: '0.8rem' }}>Update your admin dashboard password.</p>
      </div>

      <div style={{ background: t.surface, border: `1px solid ${t.border}`, padding: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '1px', marginBottom: '1.5rem' }}>Change Password</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Password</label>
            <input 
              type="password" 
              required
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', background: t.bg, border: `1px solid ${t.border}`, color: t.text, fontFamily: 'var(--font-body)', fontSize: '0.9rem' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>New Password</label>
            <input 
              type="password" 
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', background: t.bg, border: `1px solid ${t.border}`, color: t.text, fontFamily: 'var(--font-body)', fontSize: '0.9rem' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Confirm New Password</label>
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', background: t.bg, border: `1px solid ${t.border}`, color: t.text, fontFamily: 'var(--font-body)', fontSize: '0.9rem' }} 
            />
          </div>

          {error && <p style={{ color: '#c0392b', fontSize: '0.85rem', marginTop: '0.5rem' }}>{error}</p>}
          {success && <p style={{ color: accentColor, fontSize: '0.85rem', marginTop: '0.5rem' }}>Password updated securely! Logging you out...</p>}

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              marginTop: '1rem', width: '100%', padding: '0.85rem', 
              background: loading ? t.surfaceHover : t.text, 
              color: loading ? t.textMuted : t.bg, 
              border: 'none', cursor: loading ? 'default' : 'pointer', 
              fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase',
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Feedback Tab ──────────────────────────────────────────────────────
function FeedbackTab({ t }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/feedback')
      .then(r => r.json())
      .then(data => { setFeedbacks(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: t.textMuted, padding: '2rem' }}>Loading feedback…</p>;
  if (!feedbacks.length) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: t.textMuted }}>
      <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💬</p>
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', letterSpacing: '1px' }}>No Feedback Yet</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {feedbacks.map(f => (
        <div key={f.id} style={{ background: t.surface, border: `1px solid ${t.border}`, padding: '1.5rem', borderRadius: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Order: {f.order_id}</span>
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>{f.rating} / 5 ★</span>
          </div>
          <p style={{ color: t.textMuted, fontSize: '0.85rem', lineHeight: 1.5 }}>{f.comment}</p>
          <p style={{ color: t.textMuted, fontSize: '0.7rem', marginTop: '1rem' }}>{new Date(f.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { products, deleteProduct, getBestSellers } = useProducts();
  const { theme, setTheme, t, resolvedTheme } = useTheme();
  const [period, setPeriod] = useState('daily');
  const [chartType, setChartType] = useState('area');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const bestSellers = getBestSellers();

  const totalRevenue = products.reduce((s, p) => s + p.price * p.sold, 0);
  const logout = () => { sessionStorage.removeItem('zanny_admin'); navigate('/admin/login'); };

  const chartColor  = resolvedTheme === 'dark' ? '#ffffff' : '#1a1a1a';
  const accentColor = resolvedTheme === 'dark' ? '#00ff9d' : '#00b894';

  const renderChart = () => {
    const data = DATA[period];
    const commonProps = { data, margin: { top: 5, right: 10, left: 0, bottom: 5 } };
    if (chartType === 'bar') return (
      <BarChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
        <XAxis dataKey="date" tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip t={t} />} cursor={{ fill: t.surfaceHover }} />
        <Legend wrapperStyle={{ color: t.textMuted, fontSize: '0.75rem' }} />
        <Bar dataKey="Visitors" fill={chartColor} radius={[2,2,0,0]} />
        <Bar dataKey="PageViews" fill={accentColor} radius={[2,2,0,0]} />
      </BarChart>
    );
    if (chartType === 'line') return (
      <LineChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
        <XAxis dataKey="date" tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip t={t} />} />
        <Legend wrapperStyle={{ color: t.textMuted, fontSize: '0.75rem' }} />
        <Line type="monotone" dataKey="Visitors" stroke={chartColor} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        <Line type="monotone" dataKey="PageViews" stroke={accentColor} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
      </LineChart>
    );
    return (
      <AreaChart {...commonProps}>
        <defs>
          <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={chartColor}  stopOpacity={0.15} />
            <stop offset="95%" stopColor={chartColor}  stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={accentColor} stopOpacity={0.15} />
            <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
        <XAxis dataKey="date" tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip t={t} />} />
        <Legend wrapperStyle={{ color: t.textMuted, fontSize: '0.75rem' }} />
        <Area type="monotone" dataKey="Visitors"  stroke={chartColor}  strokeWidth={1.5} fill="url(#colorV)" />
        <Area type="monotone" dataKey="PageViews" stroke={accentColor} strokeWidth={1.5} fill="url(#colorP)" />
      </AreaChart>
    );
  };

  const navItems = [
    { id: 'dashboard', label: '▪ Dashboard',   icon: <LayoutDashboard size={14} />, path: null },
    { id: 'orders',    label: '▪ Orders',       icon: <ShoppingBag size={14} />,    path: null },
    { id: 'feedback',  label: '▪ Feedback',     icon: <MessageSquare size={14} />,  path: null },
    { id: 'security',  label: '▪ Security',     icon: <Lock size={14} />,           path: null },
    { id: 'products',  label: '▪ Add Product',  icon: <Package size={14} />,        path: '/admin/add-product' },
    { id: 'store',     label: '▪ View Store',   icon: null,                          path: '/' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: 'var(--font-body)', transition: 'background 0.3s, color 0.3s' }}>
      
      {/* Mobile Header (Only visible on small screens) */}
      <div className="mobile-admin-header" style={{
        display: 'none', justifyContent: 'space-between', alignItems: 'center',
        padding: '1rem 1.5rem', background: t.sidebar, borderBottom: `1px solid ${t.border}`,
        position: 'sticky', top: 0, zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%', border: `1.5px solid ${t.text}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.8rem', color: t.text
          }}>Z</div>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px' }}>ZANNY ADMIN</p>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: 'none', border: 'none', color: t.text, cursor: 'pointer' }}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* ── Sidebar ── */}
      <div className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`} style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: '240px',
        background: t.sidebar, borderRight: `1px solid ${t.border}`,
        display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem', zIndex: 15,
        transition: 'transform 0.3s ease',
      }}>
        <div style={{ marginBottom: '2.5rem' }} className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%', border: `1.5px solid ${t.text}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.9rem', color: t.text
            }}>Z</div>
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px' }}>ZANNY</p>
              <p style={{ fontSize: '0.65rem', color: t.textMuted, letterSpacing: '0.5px' }}>Admin Console</p>
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            const baseStyle = {
              padding: '0.65rem 0.75rem', textDecoration: 'none',
              fontSize: '0.82rem', letterSpacing: '0.5px', borderRadius: '4px',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem',
              color: isActive ? t.text : t.textMuted,
              background: isActive ? t.surfaceHover : 'transparent',
              border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', width: '100%', textAlign: 'left',
            };

            if (item.path) {
              return (
                <Link key={item.id} to={item.path} style={{ ...baseStyle, color: isActive ? t.text : t.textMuted }}
                  onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; e.currentTarget.style.color = t.text; }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.textMuted; } }}
                >{item.label}</Link>
              );
            }

            return (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }} style={baseStyle}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = t.surfaceHover; e.currentTarget.style.color = t.text; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.textMuted; } }}
              >{item.label}</button>
            );
          })}
        </nav>

        {/* Theme Switcher */}
        <div style={{ marginBottom: '1.5rem', padding: '0.5rem', background: t.surface, borderRadius: '8px', display: 'flex', gap: '0.25rem' }}>
          {[
            { id: 'light',  icon: <Sun size={14} />,     label: 'Light' },
            { id: 'dark',   icon: <Moon size={14} />,    label: 'Dark' },
            { id: 'system', icon: <Monitor size={14} />, label: 'System' },
          ].map(item => (
            <button
              key={item.id} onClick={() => setTheme(item.id)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0.5rem', border: 'none', borderRadius: '4px',
                background: theme === item.id ? (resolvedTheme === 'dark' ? '#333' : '#eee') : 'transparent',
                color: theme === item.id ? t.text : t.textMuted,
                cursor: 'pointer', transition: 'all 0.2s',
              }} title={item.label}
            >{item.icon}</button>
          ))}
        </div>

        <button onClick={logout} style={{
          background: 'none', border: `1px solid ${t.border}`, color: t.textMuted,
          padding: '0.6rem', cursor: 'pointer', fontSize: '0.75rem',
          letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-body)',
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#c0392b'; e.currentTarget.style.color = '#c0392b'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textMuted; }}
        >Sign Out</button>
      </div>

      {/* ── Main Content ── */}
      <div className="admin-main-content" style={{ marginLeft: '240px', padding: '2.5rem 3rem', transition: 'all 0.3s' }}>

        {/* ── DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', letterSpacing: '2px', marginBottom: '0.3rem' }}>Dashboard</h1>
                <p style={{ color: t.textMuted, fontSize: '0.8rem' }}>Welcome back. Here's what's happening with Zanny Collection.</p>
              </div>
              <Link to="/admin/add-product" style={{
                padding: '0.75rem 1.5rem', background: t.text, color: t.bg,
                textDecoration: 'none', fontSize: '0.78rem', fontWeight: 700,
                letterSpacing: '1.5px', textTransform: 'uppercase',
              }}>+ Add Product</Link>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
              <StatCard label="Daily Hustlers" value="—" sub="Requires CF Analytics" t={t} />
              <StatCard label="Hype Factor"    value="—" sub="Requires CF Analytics"  t={t} />
              <StatCard label="Street Rep"     value={products.reduce((s, p) => s + p.sold, 0).toLocaleString()} sub="Total items sold" accent={accentColor} t={t} />
              <StatCard label="Zanny Drops"    value={products.length} sub={`${CATEGORIES.length} categories`} t={t} />
            </div>

            {/* Traffic Chart */}
            <div style={{ background: t.surface, border: `1px solid ${t.border}`, padding: '2rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '1px' }}>Website Traffic</h2>
                  <p style={{ fontSize: '0.75rem', color: '#c0392b', marginTop: '0.5rem', marginBottom: '0.5rem' }}>* Log into your Cloudflare Dashboard and turn on "Web Analytics" to track this data.</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[
                      { id: 'area', icon: <TrendingUp size={14} />, label: 'Area' },
                      { id: 'bar',  icon: <BarChart3 size={14} />,  label: 'Bar' },
                      { id: 'line', icon: <Activity size={14} />,   label: 'Line' },
                    ].map(type => (
                      <button key={type.id} onClick={() => setChartType(type.id)} style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.35rem 0.65rem',
                        background: chartType === type.id ? t.text : 'transparent',
                        color: chartType === type.id ? t.bg : t.textMuted,
                        border: `1px solid ${t.border}`, cursor: 'pointer',
                        fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px', transition: 'all 0.2s',
                      }}>{type.icon} {type.label}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['daily','weekly','monthly','yearly'].map(p => (
                    <button key={p} onClick={() => setPeriod(p)} style={{
                      padding: '0.35rem 0.85rem',
                      background: period === p ? t.text : 'transparent',
                      color: period === p ? t.bg : t.textMuted,
                      border: `1px solid ${t.border}`, cursor: 'pointer',
                      fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px',
                      fontFamily: 'var(--font-body)', transition: 'all 0.2s',
                    }}>{p}</button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>{renderChart()}</ResponsiveContainer>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              {/* Best Sellers */}
              <div style={{ background: t.surface, border: `1px solid ${t.border}`, padding: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '1px', marginBottom: '1.5rem' }}>Best Sellers</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={bestSellers} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={t.border} horizontal={false} />
                    <XAxis type="number" tick={{ fill: t.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: t.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} width={120} />
                    <Tooltip content={<CustomTooltip t={t} />} />
                    <Bar dataKey="sold" name="Units Sold" fill={chartColor} radius={[0,2,2,0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Category Breakdown */}
              <div style={{ background: t.surface, border: `1px solid ${t.border}`, padding: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '1px', marginBottom: '1.5rem' }}>By Category</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {CATEGORIES.map(cat => {
                    const count    = products.filter(p => p.category === cat.id).length;
                    const soldCount = products.filter(p => p.category === cat.id).reduce((s, p) => s + p.sold, 0);
                    const maxSold   = Math.max(1, ...CATEGORIES.map(c => products.filter(p => p.category === c.id).reduce((s, p) => s + p.sold, 0)));
                    return (
                      <div key={cat.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.75rem', color: t.textMuted }}>{cat.label}</span>
                          <span style={{ fontSize: '0.75rem', color: t.textMuted, opacity: 0.6 }}>{soldCount} sold · {count} items</span>
                        </div>
                        <div style={{ height: '4px', background: t.border, borderRadius: '2px' }}>
                          <div style={{ height: '100%', width: `${(soldCount / maxSold) * 100}%`, background: chartColor, borderRadius: '2px', transition: 'width 0.8s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Product Management Table */}
            <div style={{ background: t.surface, border: `1px solid ${t.border}`, padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '1px' }}>All Products ({products.length})</h2>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${t.border}`, color: t.textMuted }}>
                      {['Product','Category','Price','Stock','Sold','Badge','Action'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 && (
                      <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: t.textMuted }}>No products added yet. <Link to="/admin/add-product" style={{ color: t.text }}>Add your first product →</Link></td></tr>
                    )}
                    {products.map(p => (
                      <tr key={p.id} style={{ borderBottom: `1px solid ${t.border}`, transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = t.surfaceHover}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '0.85rem 1rem', color: t.text, fontWeight: 500 }}>{p.name}</td>
                        <td style={{ padding: '0.85rem 1rem', color: t.textMuted }}>{CATEGORIES.find(c => c.id === p.category)?.label}</td>
                        <td style={{ padding: '0.85rem 1rem', color: t.textMuted }}>KSh {p.price.toLocaleString()}</td>
                        <td style={{ padding: '0.85rem 1rem', color: p.stock < 15 ? '#c0392b' : t.textMuted }}>{p.stock}</td>
                        <td style={{ padding: '0.85rem 1rem', color: accentColor, fontWeight: 600 }}>{p.sold}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {p.badge && <span style={{ background: t.border, color: t.textMuted, padding: '0.2rem 0.5rem', fontSize: '0.65rem', letterSpacing: '1px' }}>{p.badge}</span>}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => navigate(`/admin/product/edit/${p.id}`)} style={{
                              background: 'none', border: `1px solid ${t.border}`, color: t.textMuted,
                              padding: '0.3rem 0.75rem', cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'var(--font-body)',
                            }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.color = accentColor; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textMuted; }}
                            >Edit / Restock</button>
                            <button onClick={() => { if(window.confirm('Are you sure you want to completely delete this product?')) deleteProduct(p.id); }} style={{
                              background: 'none', border: `1px solid ${t.border}`, color: t.textMuted,
                              padding: '0.3rem 0.75rem', cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'var(--font-body)',
                            }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = '#c0392b'; e.currentTarget.style.color = '#c0392b'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textMuted; }}
                            >Remove</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === 'orders' && (
          <>
            <div style={{ marginBottom: '2.5rem' }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', letterSpacing: '2px', marginBottom: '0.3rem' }}>Orders</h1>
              <p style={{ color: t.textMuted, fontSize: '0.8rem' }}>Manage and fulfil customer orders from your D1 database.</p>
            </div>
            <OrdersTab t={t} accentColor={accentColor} />
          </>
        )}

        {/* ── FEEDBACK TAB ── */}
        {activeTab === 'feedback' && (
          <>
            <div style={{ marginBottom: '2.5rem' }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', letterSpacing: '2px', marginBottom: '0.3rem' }}>Customer Feedback</h1>
              <p style={{ color: t.textMuted, fontSize: '0.8rem' }}>Read what your customers are saying about your products.</p>
            </div>
            <FeedbackTab t={t} />
          </>
        )}

        {/* ── SECURITY TAB ── */}
        {activeTab === 'security' && (
          <SecurityTab t={t} accentColor={accentColor} logout={logout} />
        )}
      </div>

      <style>{`
        .admin-order-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .order-col-left { flex: 0 0 auto; }
        .order-col-mid { flex: 1; min-width: 180px; }
        .order-col-right { margin-left: auto; display: flex; align-items: center; gap: 1rem; }

        @media (max-width: 900px) {
          .admin-main-content { margin-left: 0 !important; padding: 1.5rem 1rem !important; }
          .mobile-admin-header { display: flex !important; }
          .admin-sidebar { transform: translateX(-100%); }
          .admin-sidebar.open { transform: translateX(0); box-shadow: 4px 0 24px rgba(0,0,0,0.2); }
          .sidebar-logo { display: none; }
        }
        
        @media (max-width: 600px) {
          .admin-order-row { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
          .order-col-left { width: 100%; display: flex; justify-content: space-between; border-bottom: 1px solid ${t.border}; padding-bottom: 0.5rem; }
          .order-col-mid { width: 100%; min-width: 0; }
          .order-col-right { margin-left: 0; width: 100%; justify-content: space-between; margin-top: 0.5rem; }
        }
      `}</style>
    </div>
  );
}
