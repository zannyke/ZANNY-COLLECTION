import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useProducts, CATEGORIES } from '../../context/ProductContext';

// ── Simulated Analytics Data ─────────────────────────────
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
function StatCard({ label, value, sub, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#181818', border: '1px solid #222',
        padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem',
      }}
    >
      <p style={{ color: '#666', fontSize: '0.7rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ color: accent || '#fff', fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{value}</p>
      {sub && <p style={{ color: '#444', fontSize: '0.75rem' }}>{sub}</p>}
    </motion.div>
  );
}

// ── Tooltip style ────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1e1e1e', border: '1px solid #333', padding: '0.75rem 1rem' }}>
      <p style={{ color: '#aaa', fontSize: '0.75rem', marginBottom: '0.4rem' }}>{label}</p>
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
  const [period, setPeriod] = useState('daily');
  const bestSellers = getBestSellers();

  const totalVisitors = monthly.reduce((s, m) => s + m.Visitors, 0);
  const totalViews   = monthly.reduce((s, m) => s + m.PageViews, 0);
  const totalRevenue = products.reduce((s, p) => s + p.price * p.sold, 0);

  const logout = () => {
    sessionStorage.removeItem('zanny_admin');
    navigate('/admin/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0e0e0e', color: '#fff', fontFamily: 'var(--font-body)' }}>
      {/* ── Sidebar ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: '220px',
        background: '#111', borderRight: '1px solid #1e1e1e',
        display: 'flex', flexDirection: 'column', padding: '2rem 1.5rem', zIndex: 10,
      }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%', border: '1.5px solid #fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.9rem',
            }}>Z</div>
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px' }}>ZANNY</p>
              <p style={{ fontSize: '0.65rem', color: '#555', letterSpacing: '0.5px' }}>Admin Console</p>
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
              padding: '0.65rem 0.75rem', color: '#aaa', textDecoration: 'none',
              fontSize: '0.82rem', letterSpacing: '0.5px', borderRadius: '4px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1e1e1e'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#aaa'; }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button onClick={logout} style={{
          background: 'none', border: '1px solid #222', color: '#555',
          padding: '0.6rem', cursor: 'pointer', fontSize: '0.75rem',
          letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-body)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#c0392b'; e.currentTarget.style.color = '#c0392b'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#222'; e.currentTarget.style.color = '#555'; }}
        >Sign Out</button>
      </div>

      {/* ── Main content ── */}
      <div style={{ marginLeft: '220px', padding: '2.5rem 3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', letterSpacing: '2px', marginBottom: '0.3rem' }}>Dashboard</h1>
            <p style={{ color: '#555', fontSize: '0.8rem' }}>Welcome back. Here's what's happening with Zanny Collection.</p>
          </div>
          <Link to="/admin/add-product" style={{
            padding: '0.75rem 1.5rem', background: '#fff', color: '#000',
            textDecoration: 'none', fontSize: '0.78rem', fontWeight: 700,
            letterSpacing: '1.5px', textTransform: 'uppercase',
          }}>+ Add Product</Link>
        </div>

        {/* ── KPI Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          <StatCard label="Daily Hustlers" value={totalVisitors.toLocaleString()} sub="Site visits" />
          <StatCard label="Hype Factor" value={totalViews.toLocaleString()} sub="Page views" />
          <StatCard label="Street Rep" value={products.reduce((s, p) => s + p.sold, 0).toLocaleString()} sub="Total items in the street" accent="#00ff9d" />
          <StatCard label="Zanny Drops" value={products.length} sub={`${CATEGORIES.length} categories`} />
        </div>

        {/* ── Traffic Chart ── */}
        <div style={{ background: '#181818', border: '1px solid #222', padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '1px' }}>Website Traffic</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['daily','weekly','monthly','yearly'].map(p => (
                <button key={p} onClick={() => setPeriod(p)} style={{
                  padding: '0.35rem 0.85rem', background: period === p ? '#fff' : 'transparent',
                  color: period === p ? '#000' : '#666', border: '1px solid #333',
                  cursor: 'pointer', fontSize: '0.7rem', textTransform: 'uppercase',
                  letterSpacing: '0.5px', fontFamily: 'var(--font-body)', transition: 'all 0.2s',
                }}>{p}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={DATA[period]} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fff" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#fff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
              <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#666', fontSize: '0.75rem' }} />
              <Area type="monotone" dataKey="Visitors" stroke="#fff" strokeWidth={1.5} fill="url(#colorV)" />
              <Area type="monotone" dataKey="PageViews" stroke="#d4af37" strokeWidth={1.5} fill="url(#colorP)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* ── Best Sellers Chart ── */}
          <div style={{ background: '#181818', border: '1px solid #222', padding: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '1px', marginBottom: '1.5rem' }}>Best Sellers</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bestSellers} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sold" name="Units Sold" fill="#fff" radius={[0, 2, 2, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── Category breakdown ── */}
          <div style={{ background: '#181818', border: '1px solid #222', padding: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '1px', marginBottom: '1.5rem' }}>By Category</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {CATEGORIES.map(cat => {
                const count = products.filter(p => p.category === cat.id).length;
                const soldCount = products.filter(p => p.category === cat.id).reduce((s, p) => s + p.sold, 0);
                const maxSold = Math.max(...CATEGORIES.map(c => products.filter(p => p.category === c.id).reduce((s, p) => s + p.sold, 0)));
                return (
                  <div key={cat.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#888' }}>{cat.label}</span>
                      <span style={{ fontSize: '0.75rem', color: '#555' }}>{soldCount} sold · {count} items</span>
                    </div>
                    <div style={{ height: '4px', background: '#1e1e1e', borderRadius: '2px' }}>
                      <div style={{ height: '100%', width: `${maxSold ? (soldCount / maxSold) * 100 : 0}%`, background: '#fff', borderRadius: '2px', transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Product Management Table ── */}
        <div style={{ background: '#181818', border: '1px solid #222', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '1px' }}>All Products ({products.length})</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #222', color: '#555' }}>
                  {['Product', 'Category', 'Price', 'Stock', 'Sold', 'Badge', 'Action'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #1a1a1a' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.85rem 1rem', color: '#ddd', fontWeight: 500 }}>{p.name}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#666' }}>{CATEGORIES.find(c => c.id === p.category)?.label}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#aaa' }}>KSh {p.price.toLocaleString()}</td>
                    <td style={{ padding: '0.85rem 1rem', color: p.stock < 15 ? '#c0392b' : '#aaa' }}>{p.stock}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#d4af37', fontWeight: 600 }}>{p.sold}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {p.badge && <span style={{ background: '#222', color: '#aaa', padding: '0.2rem 0.5rem', fontSize: '0.65rem', letterSpacing: '1px' }}>{p.badge}</span>}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <button onClick={() => deleteProduct(p.id)} style={{
                        background: 'none', border: '1px solid #333', color: '#555',
                        padding: '0.3rem 0.75rem', cursor: 'pointer', fontSize: '0.7rem',
                        fontFamily: 'var(--font-body)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#c0392b'; e.currentTarget.style.color = '#c0392b'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#555'; }}
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
          div[style*='margin-left: 220px'] { margin-left: 0 !important; padding: 1.5rem !important; }
          div[style*='position: fixed'][style*='width: 220px'] { display: none !important; }
        }
      `}</style>
    </div>
  );
}
