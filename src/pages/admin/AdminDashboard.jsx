import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useProducts, CATEGORIES } from '../../context/ProductContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Monitor, TrendingUp, BarChart3, Activity } from 'lucide-react';

// ── Simulated Analytics Data (unchanged) ─────────────────────────────
const daily = Array.from({ length: 30 }, (_, i) => ({
  date: `May ${i + 1}`,
  Visitors: Math.floor(80 + Math.random() * 320),
  PageViews: Math.floor(200 + Math.random() * 800),
}));
const weekly = ['Week 1','Week 2','Week 3','Week 4','Week 5','Week 6','Week 7','Week 8'].map(w => ({
  date: w,
  Visitors: Math.floor(400 + Math.random() * 1600),
  PageViews: Math.floor(1000 + Math.random() * 4000),
}));
const monthly = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => ({
  date: m,
  Visitors: Math.floor(1500 + Math.random() * 6000),
  PageViews: Math.floor(4000 + Math.random() * 15000),
}));
const yearly = ['2022','2023','2024','2025','2026'].map(y => ({
  date: y,
  Visitors: Math.floor(8000 + Math.random() * 40000),
  PageViews: Math.floor(20000 + Math.random() * 100000),
}));
const DATA = { daily, weekly, monthly, yearly };

// ── Stat Card ────────────────────────────────────────────
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

// ── Tooltip style ────────────────────────────────────────
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { products, deleteProduct, getBestSellers } = useProducts();
  const { theme, setTheme, t, resolvedTheme } = useTheme();
  const [period, setPeriod] = useState('daily');
  const [chartType, setChartType] = useState('area');
  const bestSellers = getBestSellers();

  const totalVisitors = monthly.reduce((s, m) => s + m.Visitors, 0);
  const totalViews   = monthly.reduce((s, m) => s + m.PageViews, 0);
  const totalRevenue = products.reduce((s, p) => s + p.price * p.sold, 0);

  const logout = () => {
    sessionStorage.removeItem('zanny_admin');
    navigate('/admin/login');
  };

  const chartColor = resolvedTheme === 'dark' ? '#ffffff' : '#1a1a1a';
  const accentColor = resolvedTheme === 'dark' ? '#00ff9d' : '#00b894';

  const renderChart = () => {
    const data = DATA[period];
    const commonProps = { data, margin: { top: 5, right: 10, left: 0, bottom: 5 } };

    if (chartType === 'bar') {
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
          <XAxis dataKey="date" tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip t={t} />} cursor={{ fill: t.surfaceHover }} />
          <Legend wrapperStyle={{ color: t.textMuted, fontSize: '0.75rem' }} />
          <Bar dataKey="Visitors" fill={chartColor} radius={[2, 2, 0, 0]} />
          <Bar dataKey="PageViews" fill={accentColor} radius={[2, 2, 0, 0]} />
        </BarChart>
      );
    }

    if (chartType === 'line') {
      return (
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
    }

    return (
      <AreaChart {...commonProps}>
        <defs>
          <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chartColor} stopOpacity={0.15} />
            <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={accentColor} stopOpacity={0.15} />
            <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
        <XAxis dataKey="date" tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: t.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip t={t} />} />
        <Legend wrapperStyle={{ color: t.textMuted, fontSize: '0.75rem' }} />
        <Area type="monotone" dataKey="Visitors" stroke={chartColor} strokeWidth={1.5} fill="url(#colorV)" />
        <Area type="monotone" dataKey="PageViews" stroke={accentColor} strokeWidth={1.5} fill="url(#colorP)" />
      </AreaChart>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: 'var(--font-body)', transition: 'background 0.3s, color 0.3s' }}>
      {/* ── Sidebar ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: '240px',
        background: t.sidebar, borderRight: `1px solid ${t.border}`,
        display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem', zIndex: 10,
        transition: 'all 0.3s',
      }}>
        <div style={{ marginBottom: '2.5rem' }}>
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
          {[
            { label: '▪ Dashboard',      path: '/admin' },
            { label: '▪ Add Product',    path: '/admin/add-product' },
            { label: '▪ View Store',     path: '/' },
          ].map(item => (
            <Link key={item.label} to={item.path} style={{
              padding: '0.65rem 0.75rem', color: t.textMuted, textDecoration: 'none',
              fontSize: '0.82rem', letterSpacing: '0.5px', borderRadius: '4px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = t.surfaceHover; e.currentTarget.style.color = t.text; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.textMuted; }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Theme Switcher */}
        <div style={{ 
          marginBottom: '1.5rem', padding: '0.5rem', background: t.surface, 
          borderRadius: '8px', display: 'flex', gap: '0.25rem' 
        }}>
          {[
            { id: 'light', icon: <Sun size={14} />, label: 'Light' },
            { id: 'dark',  icon: <Moon size={14} />, label: 'Dark' },
            { id: 'system',icon: <Monitor size={14} />, label: 'System' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setTheme(item.id)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0.5rem', border: 'none', borderRadius: '4px',
                background: theme === item.id ? (resolvedTheme === 'dark' ? '#333' : '#eee') : 'transparent',
                color: theme === item.id ? t.text : t.textMuted,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              title={item.label}
            >
              {item.icon}
            </button>
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

      {/* ── Main content ── */}
      <div style={{ marginLeft: '240px', padding: '2.5rem 3rem' }}>
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

        {/* ── KPI Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          <StatCard label="Daily Hustlers" value={totalVisitors.toLocaleString()} sub="Site visits" t={t} />
          <StatCard label="Hype Factor" value={totalViews.toLocaleString()} sub="Page views" t={t} />
          <StatCard label="Street Rep" value={products.reduce((s, p) => s + p.sold, 0).toLocaleString()} sub="Total items in the street" accent={accentColor} t={t} />
          <StatCard label="Zanny Drops" value={products.length} sub={`${CATEGORIES.length} categories`} t={t} />
        </div>

        {/* ── Traffic Chart ── */}
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '1px' }}>Website Traffic</h2>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                {[
                  { id: 'area', icon: <TrendingUp size={14} />, label: 'Area' },
                  { id: 'bar',  icon: <BarChart3 size={14}  />, label: 'Bar' },
                  { id: 'line', icon: <Activity size={14}   />, label: 'Line' },
                ].map(type => (
                  <button key={type.id} onClick={() => setChartType(type.id)} style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.35rem 0.65rem', background: chartType === type.id ? t.text : 'transparent',
                    color: chartType === type.id ? t.bg : t.textMuted, border: `1px solid ${t.border}`,
                    cursor: 'pointer', fontSize: '0.65rem', textTransform: 'uppercase',
                    letterSpacing: '0.5px', transition: 'all 0.2s',
                  }}>
                    {type.icon} {type.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['daily','weekly','monthly','yearly'].map(p => (
                <button key={p} onClick={() => setPeriod(p)} style={{
                  padding: '0.35rem 0.85rem', background: period === p ? t.text : 'transparent',
                  color: period === p ? t.bg : t.textMuted, border: `1px solid ${t.border}`,
                  cursor: 'pointer', fontSize: '0.7rem', textTransform: 'uppercase',
                  letterSpacing: '0.5px', fontFamily: 'var(--font-body)', transition: 'all 0.2s',
                }}>{p}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            {renderChart()}
          </ResponsiveContainer>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* ── Best Sellers Chart ── */}
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, padding: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '1px', marginBottom: '1.5rem' }}>Best Sellers</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bestSellers} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border} horizontal={false} />
                <XAxis type="number" tick={{ fill: t.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: t.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} width={120} />
                <Tooltip content={<CustomTooltip t={t} />} />
                <Bar dataKey="sold" name="Units Sold" fill={chartColor} radius={[0, 2, 2, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── Category breakdown ── */}
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, padding: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '1px', marginBottom: '1.5rem' }}>By Category</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {CATEGORIES.map(cat => {
                const count = products.filter(p => p.category === cat.id).length;
                const soldCount = products.filter(p => p.category === cat.id).reduce((s, p) => s + p.sold, 0);
                const maxSold = Math.max(...CATEGORIES.map(c => products.filter(p => p.category === c.id).reduce((s, p) => s + p.sold, 0)));
                return (
                  <div key={cat.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', color: t.textMuted }}>{cat.label}</span>
                      <span style={{ fontSize: '0.75rem', color: t.textMuted, opacity: 0.6 }}>{soldCount} sold · {count} items</span>
                    </div>
                    <div style={{ height: '4px', background: t.border, borderRadius: '2px' }}>
                      <div style={{ height: '100%', width: `${maxSold ? (soldCount / maxSold) * 100 : 0}%`, background: chartColor, borderRadius: '2px', transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Product Management Table ── */}
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '1px' }}>All Products ({products.length})</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${t.border}`, color: t.textMuted }}>
                  {['Product', 'Category', 'Price', 'Stock', 'Sold', 'Badge', 'Action'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
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
                      <button onClick={() => deleteProduct(p.id)} style={{
                        background: 'none', border: `1px solid ${t.border}`, color: t.textMuted,
                        padding: '0.3rem 0.75rem', cursor: 'pointer', fontSize: '0.7rem',
                        fontFamily: 'var(--font-body)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#c0392b'; e.currentTarget.style.color = '#c0392b'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textMuted; }}
                      >Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*='margin-left: 240px'] { margin-left: 0 !important; padding: 1.5rem !important; }
          div[style*='position: fixed'][style*='width: 240px'] { display: none !important; }
        }
      `}</style>
    </div>
  );
}
