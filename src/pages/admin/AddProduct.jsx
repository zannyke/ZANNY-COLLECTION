import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProducts, CATEGORIES } from '../../context/ProductContext';
import { useTheme } from '../../context/ThemeContext';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const BADGES = ['', 'NEW', 'HOT', 'SALE'];

export default function AddProduct() {
  const { addProduct } = useProducts();
  const { t, resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', category: 'shirts-tees', price: '', description: '',
    stock: '', badge: 'NEW', sizes: ['S','M','L'], image: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const toggleSize = (size) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name = 'Product name is required.';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Enter a valid price.';
    if (!form.description.trim()) e.description = 'Add a short description.';
    if (!form.stock || isNaN(form.stock))  e.stock = 'Enter stock quantity.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    addProduct({
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      image: form.image || '/collection1.png',
    });
    setSubmitted(true);
    setTimeout(() => navigate('/admin'), 1500);
  };

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text, flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontSize: '3rem' }}>✓</div>
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', letterSpacing: '2px' }}>Product Added!</p>
      <p style={{ color: t.textMuted, fontSize: '0.85rem' }}>Redirecting to dashboard...</p>
    </div>
  );

  const inputStyle = (field) => ({
    width: '100%', padding: '0.85rem 1rem', background: t.input,
    border: `1px solid ${errors[field] ? '#c0392b' : t.border}`,
    color: t.text, outline: 'none', fontSize: '0.9rem',
    fontFamily: 'var(--font-body)', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  });

  const labelStyle = {
    display: 'block', color: t.textMuted, fontSize: '0.7rem',
    letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '0.5rem',
  };

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: 'var(--font-body)', transition: 'background 0.3s' }}>
      {/* Header bar */}
      <div style={{ background: t.sidebar, borderBottom: `1px solid ${t.border}`, padding: '1rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/admin" style={{ color: t.textMuted, fontSize: '0.8rem', textDecoration: 'none', letterSpacing: '0.5px' }}>← Dashboard</Link>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '2px' }}>Add New Product</h1>
        </div>
        <Link to="/" style={{ color: t.textMuted, fontSize: '0.75rem', textDecoration: 'none' }}>View Store ↗</Link>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Row: Name + Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Product Name *</label>
              <input style={inputStyle('name')} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Zenith Oversized Tee" />
              {errors.name && <p style={{ color: '#c0392b', fontSize: '0.72rem', marginTop: '0.35rem' }}>{errors.name}</p>}
            </div>
            <div>
              <label style={labelStyle}>Category *</label>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value)}
                style={{ ...inputStyle(), appearance: 'none' }}
              >
                {CATEGORIES.map(c => <option key={c.id} value={c.id} style={{ background: t.surface, color: t.text }}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description *</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Short product description for the listing..."
              rows={4}
              style={{ ...inputStyle('description'), resize: 'vertical' }}
            />
            {errors.description && <p style={{ color: '#c0392b', fontSize: '0.72rem', marginTop: '0.35rem' }}>{errors.description}</p>}
          </div>

          {/* Row: Price + Stock + Badge */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Price (KSh) *</label>
              <input type="number" style={inputStyle('price')} value={form.price} onChange={e => set('price', e.target.value)} placeholder="e.g. 3500" min="0" />
              {errors.price && <p style={{ color: '#c0392b', fontSize: '0.72rem', marginTop: '0.35rem' }}>{errors.price}</p>}
            </div>
            <div>
              <label style={labelStyle}>Stock Quantity *</label>
              <input type="number" style={inputStyle('stock')} value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="e.g. 50" min="0" />
              {errors.stock && <p style={{ color: '#c0392b', fontSize: '0.72rem', marginTop: '0.35rem' }}>{errors.stock}</p>}
            </div>
            <div>
              <label style={labelStyle}>Badge</label>
              <select value={form.badge} onChange={e => set('badge', e.target.value)} style={{ ...inputStyle(), appearance: 'none' }}>
                {BADGES.map(b => <option key={b} value={b} style={{ background: t.surface, color: t.text }}>{b || '(none)'}</option>)}
              </select>
            </div>
          </div>

          {/* Available Sizes */}
          <div>
            <label style={labelStyle}>Available Sizes</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {SIZES.map(s => (
                <button key={s} type="button" onClick={() => toggleSize(s)} style={{
                  width: '44px', height: '44px', fontSize: '0.75rem', fontWeight: 600,
                  border: form.sizes.includes(s) ? `1.5px solid ${t.text}` : `1px solid ${t.border}`,
                  background: form.sizes.includes(s) ? t.text : 'transparent',
                  color: form.sizes.includes(s) ? t.bg : t.textMuted,
                  cursor: 'pointer', letterSpacing: '0.5px', transition: 'all 0.2s',
                }}>{s}</button>
              ))}
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label style={labelStyle}>Image URL (optional)</label>
            <input style={inputStyle('image')} value={form.image} onChange={e => set('image', e.target.value)} placeholder="/collection1.png  or full URL" />
            <p style={{ color: t.textMuted, fontSize: '0.72rem', marginTop: '0.4rem', opacity: 0.6 }}>Leave blank to use default image. In future you can upload directly.</p>
          </div>

          {/* Preview strip */}
          <div style={{ background: t.input, border: `1px solid ${t.border}`, padding: '1.25rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <img src={form.image || '/collection1.png'} alt="preview" style={{ width: '60px', height: '75px', objectFit: 'cover', background: t.surface }} />
            <div>
              <p style={{ color: t.textMuted, fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                {CATEGORIES.find(c => c.id === form.category)?.label}
              </p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: t.text }}>{form.name || 'Product Name'}</p>
              <p style={{ color: resolvedTheme === 'dark' ? '#00ff9d' : '#00b894', fontSize: '0.85rem', marginTop: '0.2rem', fontWeight: 600 }}>
                {form.price ? `KSh ${Number(form.price).toLocaleString()}` : 'KSh —'}
              </p>
            </div>
            {form.badge && <span style={{ marginLeft: 'auto', background: t.border, color: t.textMuted, padding: '0.2rem 0.6rem', fontSize: '0.65rem', letterSpacing: '1px' }}>{form.badge}</span>}
          </div>

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            style={{
              padding: '1rem', background: t.text, color: t.bg,
              border: 'none', cursor: 'pointer', fontSize: '0.85rem',
              fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase',
              fontFamily: 'var(--font-body)',
            }}
          >
            Publish Product to Store
          </motion.button>
        </form>
      </div>
    </div>
  );
}
