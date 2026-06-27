import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useProducts, CATEGORIES } from '../../context/ProductContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Monitor, TrendingUp, BarChart3, Activity, Package, ShoppingBag, LayoutDashboard, Menu, X, MessageSquare, Lock, Eye, EyeOff, Laptop, Trash2, Ban, ExternalLink, AlertTriangle, Award } from 'lucide-react';

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
      className="glass-card"
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
    <div className="glass-card" style={{ background: t.surface, border: `1px solid ${t.border}`, padding: '0.75rem 1rem' }}>
      <p style={{ color: t.textMuted, fontSize: '0.75rem', marginBottom: '0.4rem' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, fontSize: '0.85rem' }}>
          {p.name}: <strong>{p.value.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
};

// ── Custom UI Modal ───────────────────────────────────────────────────
function CustomModal({ isOpen, title, message, isPrompt, promptLabel, onConfirm, onCancel, t, accentColor }) {
  if (!isOpen) return null;
  const [inputValue, setInputValue] = React.useState('');
  
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ background: t.surface, border: `1px solid ${t.border}`, padding: '2rem', width: '95%', maxWidth: '420px', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '1rem', color: t.text }}>{title}</h3>
        <p style={{ color: t.textMuted, fontSize: '0.9rem', marginBottom: isPrompt ? '1rem' : '2rem', lineHeight: 1.5 }}>{message}</p>
        
        {isPrompt && (
          <div style={{ marginBottom: '2rem' }}>
            {promptLabel && <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{promptLabel}</label>}
            <input 
              type="text" 
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', background: t.input, border: `1px solid ${t.border}`, color: t.text, fontFamily: 'var(--font-body)', fontSize: '0.9rem', borderRadius: '8px' }} 
              autoFocus
            />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button onClick={() => { setInputValue(''); onCancel(); }} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: `1px solid ${t.border}`, color: t.text, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.2s', borderRadius: '8px' }} onMouseEnter={e => e.currentTarget.style.background = t.surfaceHover} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Cancel</button>
          <button onClick={() => { onConfirm(isPrompt ? inputValue : true); setInputValue(''); }} style={{ padding: '0.6rem 1.2rem', background: accentColor || t.text, border: 'none', color: '#000', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, borderRadius: '8px' }}>Confirm</button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Orders Tab ────────────────────────────────────────────────────────
function OrdersTab({ t, accentColor, uiPrompt }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    fetch('/api/orders')
      .then(async r => {
        if (r.status === 401 || r.status === 403) {
          sessionStorage.removeItem('zanny_admin');
          window.location.href = '/admin/login';
          return;
        }
        return r.json();
      })
      .then(data => { if (data) { setOrders(Array.isArray(data) ? data : []); setLoading(false); } })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id, status) => {
    let trackingNumber = null;
    if (status === 'shipped') {
      trackingNumber = await uiPrompt("Tracking Information", "Enter tracking number/link for the customer email (optional):", "Tracking Details");
      if (trackingNumber === null) return; // User cancelled
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
    } else if (res.status === 401 || res.status === 403) {
      sessionStorage.removeItem('zanny_admin');
      window.location.href = '/admin/login';
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
function SecurityTab({ t, accentColor, logout, uiConfirm }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Vault Lock State
  const [isUnlocked, setIsUnlocked] = useState(() => sessionStorage.getItem('zanny_admin_unlocked') === 'true');
  const [vaultPassword, setVaultPassword] = useState('');
  const [vaultError, setVaultError] = useState('');

  const [sessions, setSessions] = useState([]);
  const [blacklists, setBlacklists] = useState([]);

  const fetchData = async () => {
    try {
      const [sessRes, blRes] = await Promise.all([
        fetch('/api/admin/sessions'),
        fetch('/api/admin/blacklist')
      ]);
      
      if (sessRes.status === 401 || sessRes.status === 403 || blRes.status === 401 || blRes.status === 403) {
        logout();
        return;
      }
      
      if (sessRes.ok) setSessions(await sessRes.json());
      if (blRes.ok) setBlacklists(await blRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      fetchData();
    }
  }, [isUnlocked]);

  const revokeSession = async (id) => {
    const confirmed = await uiConfirm("Revoke Session", "Log out this device immediately?");
    if (!confirmed) return;
    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) fetchData();
      else alert("Failed to revoke session");
    } catch (err) {
      console.error(err);
    }
  };

  const blockIp = async (ip_address) => {
    const confirmed = await uiConfirm("Block IP", `Are you sure you want to completely block IP: ${ip_address}? They will be immediately denied access.`);
    if (!confirmed) return;
    try {
      const res = await fetch('/api/admin/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip_address })
      });
      if (res.ok) fetchData();
      else {
        const err = await res.json();
        alert(err.error || "Failed to block IP");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unblockIp = async (id) => {
    const confirmed = await uiConfirm("Unblock IP", "Remove this IP from the blacklist?");
    if (!confirmed) return;
    try {
      const res = await fetch('/api/admin/blacklist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) fetchData();
      else alert("Failed to unblock IP");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const confirmed = await uiConfirm("Global Logout", "Are you sure? Changing your password will instantly log out ALL other devices currently signed in.");
    if (!confirmed) return;

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
      
      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }
      
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

  if (!isUnlocked) {
    return (
      <div style={{ maxWidth: '400px', margin: '2rem auto', textAlign: 'center' }}>
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, padding: '3rem 2rem' }}>
          <Lock size={48} color={accentColor} style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: '0.5rem', color: t.text, letterSpacing: '1px' }}>Security Vault</h2>
          <p style={{ color: t.textMuted, fontSize: '0.85rem', marginBottom: '2rem', lineHeight: 1.5 }}>Enter the master security password to access sensitive settings.</p>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            if (vaultPassword === 'zanny2026') {
              sessionStorage.setItem('zanny_admin_unlocked', 'true');
              setIsUnlocked(true);
            } else {
              setVaultError('Incorrect master password');
              setVaultPassword('');
            }
          }}>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Master Password"
                value={vaultPassword}
                onChange={e => { setVaultPassword(e.target.value); setVaultError(''); }}
                autoFocus
                style={{ width: '100%', padding: '0.85rem', paddingRight: '2.5rem', background: t.input, border: `1px solid ${vaultError ? '#c0392b' : t.border}`, color: t.text, fontFamily: 'var(--font-body)', fontSize: '0.9rem', textAlign: 'center', borderRadius: '8px' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '0.85rem', background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer' }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {vaultError && <p style={{ color: '#c0392b', fontSize: '0.8rem', marginBottom: '1rem', fontWeight: 600 }}>{vaultError}</p>}
            
            <button type="submit" style={{ width: '100%', padding: '0.85rem', background: accentColor || t.text, color: rawTheme.bg, border: 'none', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.85rem', borderRadius: '8px' }}>
              Unlock Vault
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', letterSpacing: '2px', marginBottom: '0.3rem' }}>Security</h1>
        <p style={{ color: t.textMuted, fontSize: '0.8rem' }}>Update your admin dashboard password.</p>
      </div>

      <div style={{ background: t.surface, border: `1px solid ${t.border}`, padding: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '1px', marginBottom: '1.5rem' }}>Change Password</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Password</label>
            <input 
              type={showPassword ? "text" : "password"} 
              required
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', paddingRight: '2.5rem', background: t.input, border: `1px solid ${t.border}`, color: t.text, fontFamily: 'var(--font-body)', fontSize: '0.9rem', borderRadius: '8px' }} 
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '2.1rem', background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer' }}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>New Password</label>
            <input 
              type={showPassword ? "text" : "password"} 
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', paddingRight: '2.5rem', background: t.input, border: `1px solid ${t.border}`, color: t.text, fontFamily: 'var(--font-body)', fontSize: '0.9rem', borderRadius: '8px' }} 
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '2.1rem', background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer' }}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Confirm New Password</label>
            <input 
              type={showPassword ? "text" : "password"} 
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', paddingRight: '2.5rem', background: t.input, border: `1px solid ${t.border}`, color: t.text, fontFamily: 'var(--font-body)', fontSize: '0.9rem', borderRadius: '8px' }} 
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '2.1rem', background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer' }}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && <p style={{ color: '#c0392b', fontSize: '0.85rem', marginTop: '0.5rem' }}>{error}</p>}
          {success && <p style={{ color: accentColor, fontSize: '0.85rem', marginTop: '0.5rem' }}>Password updated securely! Logging you out...</p>}

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              marginTop: '1rem', width: '100%', padding: '0.85rem', 
              background: loading ? t.surfaceHover : t.text, 
              color: loading ? t.textMuted : rawTheme.bg, 
              border: 'none', cursor: loading ? 'default' : 'pointer', 
              fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase',
              transition: 'all 0.2s', borderRadius: '8px'
            }}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      <div style={{ background: t.surface, border: `1px solid ${t.border}`, padding: '2rem', marginTop: '2.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '1px', marginBottom: '1.5rem' }}>Active Devices</h2>
        <p style={{ fontSize: '0.8rem', color: t.textMuted, marginBottom: '1.5rem' }}>These devices are currently signed into your admin account. If you don't recognize a device, log it out immediately or block its IP.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sessions.map(s => (
            <div key={s.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: `1px solid ${s.is_current ? accentColor : t.border}`, background: t.input, gap: '1rem', flexWrap: 'wrap', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Laptop size={24} color={s.is_current ? accentColor : t.textMuted} />
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', color: s.is_current ? accentColor : t.text }}>
                    {s.device_name || 'Unknown Device'} 
                    {s.is_current && <span style={{ fontSize: '0.65rem', background: accentColor, color: '#000', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '0.5rem', textTransform: 'uppercase', fontWeight: 800 }}>This Device</span>}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: t.textMuted, marginTop: '0.2rem' }}>IP: {s.ip_address || 'Unknown'} · Logged in: {new Date(s.created_at).toLocaleString()}</p>
                </div>
              </div>
              
              {!s.is_current && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => blockIp(s.ip_address)} style={{ background: 'none', border: `1px solid ${t.border}`, color: t.textMuted, padding: '0.4rem 0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }} title="Block this IP address permanently">
                    <Ban size={14} /> Block IP
                  </button>
                  <button onClick={() => revokeSession(s.id)} style={{ background: 'none', border: `1px solid #c0392b`, color: '#c0392b', padding: '0.4rem 0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }} title="Log out this device">
                    <Trash2 size={14} /> Log Out
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: t.surface, border: `1px solid ${t.border}`, padding: '2rem', marginTop: '2.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '1px', marginBottom: '1.5rem', color: '#c0392b' }}>Blacklisted IPs</h2>
        <p style={{ fontSize: '0.8rem', color: t.textMuted, marginBottom: '1.5rem' }}>These IP addresses are permanently blocked from logging into the admin dashboard.</p>
        
        {blacklists.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: t.textMuted }}>No IPs are currently blocked.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {blacklists.map(b => (
              <div key={b.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: `1px solid ${t.border}`, background: t.input, borderRadius: '8px' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#c0392b' }}>{b.ip_address}</p>
                  <p style={{ fontSize: '0.75rem', color: t.textMuted, marginTop: '0.2rem' }}>Blocked on: {new Date(b.created_at).toLocaleString()}</p>
                </div>
                <button onClick={() => unblockIp(b.id)} style={{ background: 'none', border: `1px solid ${t.border}`, color: t.text, padding: '0.4rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem' }}>
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
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

// ── App Updates Tab ───────────────────────────────────────────────────
function VersionTab({ t, accentColor, rawTheme }) {
  const [apkInfo, setApkInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState('');
  const [build, setBuild] = useState('');
  const [apkUrl, setApkUrl] = useState('');
  const [changelog, setChangelog] = useState('');
  const [adminSecret, setAdminSecret] = useState('ZannyAdmin2024Secret');
  
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', isError: false });

  const fetchVersionInfo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/version');
      if (res.ok) {
        const data = await res.json();
        setApkInfo(data);
        if (data) {
          setVersion(data.version || '');
          setBuild(String((data.build || 0) + 1));
          setApkUrl(data.url || '');
          setChangelog('');
        }
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVersionInfo();
  }, []);

  const handleApkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setStatusMsg({ text: 'Uploading APK to Cloudflare R2...', isError: false });
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload-apk', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setApkUrl(data.url);
        setStatusMsg({ text: 'APK uploaded successfully! URL set in form.', isError: false });
      } else {
        setStatusMsg({ text: data.error || 'Upload failed', isError: true });
      }
    } catch (err) {
      setStatusMsg({ text: 'Network error during upload', isError: true });
    }
    setUploading(false);
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    setPublishing(true);
    setStatusMsg({ text: 'Publishing update...', isError: false });

    try {
      const res = await fetch('/api/version', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version,
          build: Number(build),
          url: apkUrl,
          changelog,
          admin_secret: adminSecret
        })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg({ text: 'Version published successfully!', isError: false });
        fetchVersionInfo();
      } else {
        setStatusMsg({ text: data.error || 'Publish failed', isError: true });
      }
    } catch (err) {
      setStatusMsg({ text: 'Network error during publish', isError: true });
    }
    setPublishing(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
      
      {/* Current Version Details */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignSelf: 'start' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '1px', margin: 0 }}>Current APK Release</h2>
        
        {loading ? (
          <p style={{ color: t.textMuted, fontSize: '0.85rem' }}>Fetching version details...</p>
        ) : !apkInfo ? (
          <p style={{ color: t.textMuted, fontSize: '0.85rem' }}>No active release configuration found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
            <div>
              <p style={{ color: t.textMuted, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.3rem' }}>Version / Build</p>
              <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>v{apkInfo.version} <span style={{ color: t.textMuted, fontWeight: 400, fontSize: '0.9rem' }}>({apkInfo.build})</span></p>
            </div>
            
            <div>
              <p style={{ color: t.textMuted, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.3rem' }}>Release URL</p>
              <a href={apkInfo.url} target="_blank" rel="noopener noreferrer" style={{ color: accentColor, wordBreak: 'break-all', display: 'inline-block', textDecoration: 'underline' }}>
                {apkInfo.url}
              </a>
            </div>

            <div>
              <p style={{ color: t.textMuted, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.3rem' }}>Changelog</p>
              <p style={{ color: t.text, lineHeight: 1.4 }}>{apkInfo.changelog || 'No changelog provided.'}</p>
            </div>

            <div>
              <p style={{ color: t.textMuted, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.3rem' }}>Published At</p>
              <p style={{ color: t.text }}>{new Date(apkInfo.publishedAt).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Release Form */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, padding: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '1px', marginBottom: '1.5rem', margin: 0 }}>Release New Version</h2>
        
        {/* Upload Card */}
        <div style={{ margin: '1.5rem 0', padding: '1rem', border: `1px dashed ${t.border}`, borderRadius: '8px', background: t.input }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Upload APK File First</label>
          <input 
            type="file" 
            accept=".apk"
            onChange={handleApkUpload}
            disabled={uploading}
            style={{ width: '100%', color: t.text, fontSize: '0.8rem' }}
          />
          {uploading && <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: accentColor }}>Uploading file...</p>}
        </div>

        <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Version String</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. 1.0.24"
              value={version} 
              onChange={e => setVersion(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', background: t.input, border: `1px solid ${t.border}`, color: t.text, fontFamily: 'var(--font-body)', fontSize: '0.85rem', borderRadius: '8px' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Build Number</label>
            <input 
              type="number" 
              required 
              placeholder="e.g. 43"
              value={build} 
              onChange={e => setBuild(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', background: t.input, border: `1px solid ${t.border}`, color: t.text, fontFamily: 'var(--font-body)', fontSize: '0.85rem', borderRadius: '8px' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>APK R2 URL</label>
            <input 
              type="url" 
              required 
              placeholder="https://pub-..."
              value={apkUrl} 
              onChange={e => setApkUrl(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', background: t.input, border: `1px solid ${t.border}`, color: t.text, fontFamily: 'var(--font-body)', fontSize: '0.85rem', borderRadius: '8px' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Changelog</label>
            <textarea 
              required 
              rows={3}
              placeholder="e.g. Added new category items and fixed push notifications."
              value={changelog} 
              onChange={e => setChangelog(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', background: t.input, border: `1px solid ${t.border}`, color: t.text, fontFamily: 'var(--font-body)', fontSize: '0.85rem', borderRadius: '8px', resize: 'vertical' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: t.textMuted, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin secret key</label>
            <input 
              type="password" 
              required 
              value={adminSecret} 
              onChange={e => setAdminSecret(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', background: t.input, border: `1px solid ${t.border}`, color: t.text, fontFamily: 'var(--font-body)', fontSize: '0.85rem', borderRadius: '8px' }} 
            />
          </div>

          {statusMsg.text && (
            <p style={{ color: statusMsg.isError ? '#c0392b' : accentColor, fontSize: '0.8rem', fontWeight: 600, margin: '0.5rem 0' }}>
              {statusMsg.text}
            </p>
          )}

          <button 
            type="submit" 
            disabled={publishing || uploading}
            style={{ width: '100%', padding: '0.85rem', background: accentColor || t.text, color: rawTheme.bg, border: 'none', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', cursor: (publishing || uploading) ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.85rem', borderRadius: '8px', opacity: (publishing || uploading) ? 0.6 : 1 }}
          >
            {publishing ? 'Publishing...' : 'Publish APK Release'}
          </button>
        </form>
      </div>

    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { products, deleteProduct, getBestSellers } = useProducts();
  const { theme, setTheme, t: rawTheme, resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', isPrompt: false, promptLabel: '', onConfirm: null, onCancel: null });
  const bestSellers = getBestSellers();

  const uiConfirm = (title, message) => new Promise(resolve => {
    setModalState({ isOpen: true, title, message, isPrompt: false, onConfirm: () => { setModalState(prev => ({...prev, isOpen: false})); resolve(true); }, onCancel: () => { setModalState(prev => ({...prev, isOpen: false})); resolve(false); } });
  });

  const uiPrompt = (title, message, promptLabel) => new Promise(resolve => {
    setModalState({ isOpen: true, title, message, isPrompt: true, promptLabel, onConfirm: (val) => { setModalState(prev => ({...prev, isOpen: false})); resolve(val); }, onCancel: () => { setModalState(prev => ({...prev, isOpen: false})); resolve(null); } });
  });

  const totalRevenue = products.reduce((s, p) => s + p.price * p.sold, 0);
  const logout = () => { sessionStorage.removeItem('zanny_admin'); navigate('/admin/login'); };

  const chartColor  = resolvedTheme === 'dark' ? '#ffffff' : '#1a1a1a';
  const accentColor = resolvedTheme === 'dark' ? '#00ff9d' : '#00b894';

  const [overviewView, setOverviewView] = useState('alerts');
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetch('/api/orders')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setRecentOrders(data.slice(0, 5)); })
      .catch(console.error);
  }, []);

  const isDark = resolvedTheme === 'dark';
  const glassT = {
    bg: 'transparent',
    surface: isDark ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255, 255, 255, 0.6)',
    surfaceHover: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.85)',
    border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(11, 20, 55, 0.12)',
    text: isDark ? '#ffffff' : '#0f172a',
    textMuted: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(15, 23, 42, 0.65)',
    accent: accentColor,
    sidebar: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.75)',
    sidebarText: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.75)',
    sidebarTextActive: isDark ? '#ffffff' : '#0f172a',
    sidebarHover: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.05)',
    input: isDark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.55)',
  };
  const t = glassT;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard',   icon: <LayoutDashboard size={16} strokeWidth={1.5} />, path: null },
    { id: 'orders',    label: 'Orders',      icon: <ShoppingBag size={16} strokeWidth={1.5} />,     path: null },
    { id: 'feedback',  label: 'Feedback',    icon: <MessageSquare size={16} strokeWidth={1.5} />,   path: null },
    { id: 'version',   label: 'App Updates', icon: <Laptop size={16} strokeWidth={1.5} />,          path: null },
    { id: 'security',  label: 'Security',    icon: <Lock size={16} strokeWidth={1.5} />,            path: null },
    { id: 'products',  label: 'Add Product', icon: <Package size={16} strokeWidth={1.5} />,         path: '/admin/add-product' },
    { id: 'store',     label: 'View Store',  icon: <ExternalLink size={16} strokeWidth={1.5} />,    path: '/' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url(/homepage-background.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      color: t.text,
      fontFamily: 'var(--font-body)',
      position: 'relative'
    }}>
      {/* Dark/Light overlay for premium readability */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: isDark ? 'rgba(8, 10, 24, 0.72)' : 'rgba(244, 247, 254, 0.45)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Mobile Header (Only visible on small screens) */}
        <div className="mobile-admin-header" style={{
          display: 'none', justifyContent: 'space-between', alignItems: 'center',
          padding: '1rem 1.5rem', background: t.sidebar, borderBottom: `1px solid ${t.border}`,
          position: 'sticky', top: 0, zIndex: 20,
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%', border: `1.5px solid ${t.text}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.8rem', color: t.text
            }}>Z</div>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px' }}>ZANNY ADMIN</p>
          </div>
          <button onClick={() => setMobileMenuOpen(true)} style={{ background: 'none', border: 'none', color: t.text, cursor: 'pointer' }}>
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Drawer Overlay */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)} 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(8, 10, 24, 0.5)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 25,
            }} 
          />
        )}

        {/* ── Sidebar ── */}
        <div className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`} style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: '240px',
          background: t.sidebar, borderRight: `1px solid ${t.border}`,
          display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem', zIndex: 15,
          transition: 'transform 0.3s ease',
          backdropFilter: 'blur(24px) saturate(140%)',
          WebkitBackdropFilter: 'blur(24px) saturate(140%)',
        }}>
          <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="sidebar-logo">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%', border: `1.5px solid ${t.sidebarTextActive}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.9rem', color: t.sidebarTextActive
              }}>Z</div>
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px', color: t.sidebarTextActive }}>ZANNY</p>
                <p style={{ fontSize: '0.65rem', color: t.sidebarText, letterSpacing: '0.5px' }}>Admin Console</p>
              </div>
            </div>
            <button className="sidebar-close-btn" onClick={() => setMobileMenuOpen(false)} style={{
              background: 'none', border: 'none', color: t.sidebarText, cursor: 'pointer', padding: '0.2rem', display: 'none'
            }}>
              <X size={20} />
            </button>
          </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, marginTop: '1rem' }}>
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            const baseStyle = {
              padding: '0.75rem 1rem', textDecoration: 'none',
              fontSize: '0.85rem', letterSpacing: '0.5px', borderRadius: '8px',
              transition: 'all 0.2s ease-in-out', display: 'flex', alignItems: 'center', gap: '0.75rem',
              color: isActive ? t.sidebarTextActive : t.sidebarText,
              background: isActive ? t.sidebarHover : 'transparent',
              border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', width: '100%', textAlign: 'left',
              fontWeight: isActive ? 600 : 400
            };

            const content = (
              <>
                <span style={{ display: 'flex', alignItems: 'center', opacity: isActive ? 1 : 0.7 }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </>
            );

            if (item.path) {
              return (
                <Link key={item.id} to={item.path} style={{ ...baseStyle }}
                  onMouseEnter={e => { e.currentTarget.style.background = t.sidebarHover; e.currentTarget.style.color = t.sidebarTextActive; e.currentTarget.querySelector('span').style.opacity = 1; }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.sidebarText; e.currentTarget.querySelector('span').style.opacity = 0.7; } }}
                >{content}</Link>
              );
            }

            return (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }} style={baseStyle}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = t.sidebarHover; e.currentTarget.style.color = t.sidebarTextActive; e.currentTarget.querySelector('span').style.opacity = 1; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.sidebarText; e.currentTarget.querySelector('span').style.opacity = 0.7; } }}
              >{content}</button>
            );
          })}
        </nav>

        {/* Theme Switcher */}
        <div style={{ marginBottom: '1.5rem', padding: '0.4rem', background: t.sidebarHover, borderRadius: '8px', display: 'flex', gap: '0.25rem' }}>
          {[
            { id: 'light',  icon: <Sun size={14} />,     label: 'Light' },
            { id: 'dark',   icon: <Moon size={14} />,    label: 'Dark' },
            { id: 'system', icon: <Monitor size={14} />, label: 'System' },
          ].map(item => (
            <button
              key={item.id} onClick={() => setTheme(item.id)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0.5rem', border: 'none', borderRadius: '6px',
                background: theme === item.id ? t.sidebar : 'transparent',
                color: theme === item.id ? t.sidebarTextActive : t.sidebarText,
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
                padding: '0.75rem 1.5rem', background: t.text, color: rawTheme.bg,
                textDecoration: 'none', fontSize: '0.78rem', fontWeight: 700,
                letterSpacing: '1.5px', textTransform: 'uppercase', borderRadius: '8px'
              }}>+ Add Product</Link>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
              <StatCard label="Daily Hustlers" value="—" sub="Requires CF Analytics" t={t} />
              <StatCard label="Hype Factor"    value="—" sub="Requires CF Analytics"  t={t} />
              <StatCard label="Street Rep"     value={products.reduce((s, p) => s + p.sold, 0).toLocaleString()} sub="Total items sold" accent={accentColor} t={t} />
              <StatCard label="Zanny Drops"    value={products.length} sub={`${CATEGORIES.length} categories`} t={t} />
            </div>

            {/* Store Overview Widget */}
            <div style={{ background: t.surface, border: `1px solid ${t.border}`, padding: '2rem', marginBottom: '2rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', letterSpacing: '1px' }}>Store Overview</h2>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { id: 'alerts', label: 'Low Stock Alerts', icon: <AlertTriangle size={14} /> },
                    { id: 'orders', label: 'Recent Orders', icon: <Package size={14} /> },
                    { id: 'top', label: 'Top Selling', icon: <Award size={14} /> },
                    { id: 'actions', label: 'Quick Actions', icon: <Activity size={14} /> },
                  ].map(view => (
                    <button key={view.id} onClick={() => setOverviewView(view.id)} style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem',
                      background: overviewView === view.id ? t.text : 'transparent',
                      color: overviewView === view.id ? rawTheme.bg : t.textMuted,
                      border: `1px solid ${overviewView === view.id ? t.text : t.border}`, 
                      cursor: 'pointer', borderRadius: '8px',
                      fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px', transition: 'all 0.2s',
                    }}>{view.icon} {view.label}</button>
                  ))}
                </div>
              </div>

              {/* View Content */}
              <div style={{ minHeight: '260px' }}>
                {overviewView === 'alerts' && (
                  <div>
                    {products.filter(p => p.stock < 10).length === 0 ? (
                      <p style={{ color: t.textMuted, fontSize: '0.9rem', padding: '2rem 0', textAlign: 'center' }}>All products are well stocked.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {products.filter(p => p.stock < 10).map(p => (
                          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: `1px solid ${t.border}`, borderRadius: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                              <div>
                                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</p>
                                <p style={{ color: t.textMuted, fontSize: '0.75rem' }}>{CATEGORIES.find(c => c.id === p.category)?.label || p.category}</p>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ color: '#c0392b', fontWeight: 700, fontSize: '1.1rem' }}>{p.stock} left</p>
                              <button onClick={() => setActiveTab('products')} style={{ background: 'none', border: 'none', color: accentColor, fontSize: '0.75rem', textDecoration: 'none', cursor: 'pointer' }}>Restock →</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {overviewView === 'orders' && (
                  <div>
                    {recentOrders.length === 0 ? (
                      <p style={{ color: t.textMuted, fontSize: '0.9rem', padding: '2rem 0', textAlign: 'center' }}>No recent orders.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {recentOrders.map(o => (
                          <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: `1px solid ${t.border}`, borderRadius: '4px' }}>
                            <div>
                              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Order #{o.id.toString().substring(0,8)}</p>
                              <p style={{ color: t.textMuted, fontSize: '0.75rem' }}>{o.customer_email}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ fontWeight: 700 }}>KSh {o.total_amount?.toLocaleString()}</p>
                              <p style={{ color: t.textMuted, fontSize: '0.75rem', textTransform: 'uppercase' }}>{o.status}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {overviewView === 'top' && (
                  <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {bestSellers.slice(0,5).map((p, i) => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: `1px solid ${t.border}`, borderRadius: '4px', background: i === 0 ? t.surfaceHover : 'transparent' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '24px', height: '24px', background: accentColor, color: '#000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>{i + 1}</div>
                            <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                            <div>
                              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</p>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontWeight: 700 }}>{p.sold} sold</p>
                            <p style={{ color: t.textMuted, fontSize: '0.75rem' }}>KSh {(p.price * p.sold).toLocaleString()} rev</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {overviewView === 'actions' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <Link to="/admin/add-product" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem', border: `1px solid ${t.border}`, borderRadius: '8px', textDecoration: 'none', color: t.text, transition: 'all 0.2s', background: t.surfaceHover }}>
                      <Package size={32} color={accentColor} />
                      <span style={{ fontWeight: 600 }}>Add New Product</span>
                    </Link>
                    <button onClick={() => setActiveTab('orders')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem', border: `1px solid ${t.border}`, borderRadius: '8px', background: 'transparent', color: t.text, cursor: 'pointer', transition: 'all 0.2s' }}>
                      <ShoppingBag size={32} color={accentColor} />
                      <span style={{ fontWeight: 600 }}>Review Orders</span>
                    </button>
                    <Link to="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem', border: `1px solid ${t.border}`, borderRadius: '8px', textDecoration: 'none', color: t.text, transition: 'all 0.2s' }}>
                      <ExternalLink size={32} color={accentColor} />
                      <span style={{ fontWeight: 600 }}>Visit Storefront</span>
                    </Link>
                    <button onClick={() => setActiveTab('security')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem', border: `1px solid ${t.border}`, borderRadius: '8px', background: 'transparent', color: t.text, cursor: 'pointer', transition: 'all 0.2s' }}>
                      <Lock size={32} color={accentColor} />
                      <span style={{ fontWeight: 600 }}>Security Settings</span>
                    </button>
                  </div>
                )}
              </div>
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
                            <button onClick={async () => { 
                              const confirmed = await uiConfirm("Delete Product", "Are you sure you want to completely delete this product?");
                              if(confirmed) deleteProduct(p.id); 
                            }} style={{
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
            <OrdersTab t={t} accentColor={accentColor} uiPrompt={uiPrompt} />
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

        {/* ── APP UPDATES TAB ── */}
        {activeTab === 'version' && (
          <>
            <div style={{ marginBottom: '2.5rem' }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', letterSpacing: '2px', marginBottom: '0.3rem' }}>App Updates</h1>
              <p style={{ color: t.textMuted, fontSize: '0.8rem' }}>Manage and publish Android app APK updates to your users.</p>
            </div>
            <VersionTab t={t} accentColor={accentColor} rawTheme={rawTheme} />
          </>
        )}

        {/* ── SECURITY TAB ── */}
        {activeTab === 'security' && (
          <SecurityTab t={t} accentColor={accentColor} logout={logout} uiConfirm={uiConfirm} />
        )}
      </div>

      </div>

      <CustomModal {...modalState} t={t} accentColor={accentColor} />

      <style>{`
        .glass-card {
          backdrop-filter: blur(20px) saturate(140%) !important;
          -webkit-backdrop-filter: blur(20px) saturate(140%) !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.15) !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .glass-card:hover {
          box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.25) !important;
          transform: translateY(-1px);
        }

        .admin-order-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .order-col-left { flex: 0 0 auto; }
        .order-col-mid { flex: 1; min-width: 180px; }
        .order-col-right { margin-left: auto; display: flex; align-items: center; gap: 1rem; }

        .sidebar-close-btn { display: none; }

        @media (max-width: 900px) {
          .admin-main-content { margin-left: 0 !important; padding: 1.5rem 1rem !important; }
          .mobile-admin-header { display: flex !important; }
          .admin-sidebar { transform: translateX(-100%); z-index: 30 !important; }
          .admin-sidebar.open { transform: translateX(0); box-shadow: 4px 0 24px rgba(0,0,0,0.35) !important; }
          .sidebar-close-btn { display: block !important; }
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
