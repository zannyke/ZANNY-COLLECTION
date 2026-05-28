import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProducts, CATEGORIES } from '../../context/ProductContext';
import { useTheme } from '../../context/ThemeContext';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = ['Black', 'White', 'Red', 'Blue', 'Grey', 'Green', 'Brown', 'Navy', 'Beige', 'Pink', 'Yellow', 'Purple', 'Orange'];
const BADGES = ['', 'NEW', 'HOT', 'SALE'];

export default function EditProduct() {
  const { id } = useParams();
  const { products, editProduct, loading } = useProducts();
  const { t, resolvedTheme } = useTheme();
  const navigate = useNavigate();

  const product = products.find(p => p.id?.toString() === id);

  const [form, setForm] = useState({
    name: '', category: 'shirts-tees', price: '', original_price: '', discount_label: '', description: '',
    badge: '', variations: []
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [existingGallery, setExistingGallery] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        category: product.category || 'shirts-tees',
        price: product.price || '',
        original_price: product.original_price || '',
        discount_label: product.discount_label || '',
        description: product.description || '',
        badge: product.badge || '',
        variations: product.parsedVariations || []
      });
      setPreview(product.image_url || null);
      setExistingGallery(product.parsedGallery || []);
    }
  }, [product]);

  if (loading) return <p style={{ padding: '2rem', color: t.textMuted }}>Loading...</p>;
  if (!product && !loading) return <p style={{ padding: '2rem', color: t.textMuted }}>Product not found.</p>;

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const requiresSize = form.category !== 'accessories';
  const totalStock = form.variations.reduce((sum, v) => sum + Number(v.quantity || 0), 0);

  const addVariation = () => setForm(prev => ({ ...prev, variations: [...prev.variations, { color: 'Black', size: requiresSize ? 'M' : '', quantity: 1 }] }));
  const removeVariation = (index) => setForm(prev => ({ ...prev, variations: prev.variations.filter((_, i) => i !== index) }));
  const updateVariation = (index, field, value) => {
    const newVars = [...form.variations];
    newVars[index][field] = value;
    setForm(prev => ({ ...prev, variations: newVars }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name = 'Product name is required.';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Enter a valid price.';
    if (!form.description.trim()) e.description = 'Add a short description.';
    if (form.variations.length === 0) e.variations = 'Add at least one variation.';
    if (form.variations.some(v => !v.color || isNaN(v.quantity) || Number(v.quantity) < 0 || (requiresSize && !v.size))) e.variations = 'Fill all variation fields correctly.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setUploading(true);
    setApiError('');

    const variationsString = JSON.stringify(form.variations);

    const result = await editProduct(product.id, {
      ...form,
      price: Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : null,
      stock: totalStock,
      image_url: product.image_url,
      parsedGallery: existingGallery
    }, file, galleryFiles);

    setUploading(false);

    if (result && result.success) {
      setSubmitted(true);
      setTimeout(() => navigate('/admin'), 1500);
    } else {
      setApiError('Failed to save product to database. Error: ' + (result?.error || 'unknown'));
    }
  };

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text, flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontSize: '3rem' }}>✓</div>
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', letterSpacing: '2px' }}>Product Updated!</p>
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
      <div style={{ background: t.sidebar, borderBottom: `1px solid ${t.border}`, padding: '1rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/admin" style={{ color: t.textMuted, fontSize: '0.8rem', textDecoration: 'none', letterSpacing: '0.5px' }}>← Dashboard</Link>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '2px' }}>Edit Product: {product.name}</h1>
        </div>
        <Link to={`/product/${product.id}`} style={{ color: t.textMuted, fontSize: '0.75rem', textDecoration: 'none' }}>View Listing ↗</Link>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Price (KSh) *</label>
              <input type="number" style={inputStyle('price')} value={form.price} onChange={e => set('price', e.target.value)} placeholder="e.g. 3500" min="0" />
              {errors.price && <p style={{ color: '#c0392b', fontSize: '0.72rem', marginTop: '0.35rem' }}>{errors.price}</p>}
            </div>
            <div>
              <label style={labelStyle}>Badge</label>
              <select value={form.badge} onChange={e => set('badge', e.target.value)} style={{ ...inputStyle(), appearance: 'none' }}>
                {BADGES.map(b => <option key={b} value={b} style={{ background: t.surface, color: t.text }}>{b || '(none)'}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', background: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.02)' : '#fdfdfd', padding: '1.5rem', border: `1px solid ${t.border}` }}>
            <div>
              <label style={labelStyle}>Previous Price (Optional)</label>
              <input type="number" style={inputStyle('original_price')} value={form.original_price} onChange={e => set('original_price', e.target.value)} placeholder="e.g. 5000" min="0" />
            </div>
            <div>
              <label style={labelStyle}>Discount Label (Optional)</label>
              <input type="text" style={inputStyle('discount_label')} value={form.discount_label} onChange={e => set('discount_label', e.target.value)} placeholder="e.g. -20% or KSh 1,500 OFF" />
            </div>
          </div>

          <div style={{ background: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.02)' : '#fdfdfd', padding: '1.5rem', border: `1px solid ${errors.variations ? '#c0392b' : t.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Product Variations (Stock: {totalStock})</label>
              <button type="button" onClick={addVariation} style={{ background: t.text, color: t.bg, border: 'none', padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>+ Add Variation</button>
            </div>
            {errors.variations && <p style={{ color: '#c0392b', fontSize: '0.75rem', marginBottom: '1rem' }}>{errors.variations}</p>}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {form.variations.map((v, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <select value={v.color} onChange={e => updateVariation(i, 'color', e.target.value)} style={{ ...inputStyle(), appearance: 'none' }}>
                      <option value="">Select Color</option>
                      {COLORS.map(c => <option key={c} value={c} style={{ background: t.surface, color: t.text }}>{c}</option>)}
                    </select>
                  </div>
                  {requiresSize && (
                    <div style={{ flex: 1 }}>
                      <select value={v.size} onChange={e => updateVariation(i, 'size', e.target.value)} style={{ ...inputStyle(), appearance: 'none' }}>
                        <option value="">Select Size</option>
                        {SIZES.map(s => <option key={s} value={s} style={{ background: t.surface, color: t.text }}>{s}</option>)}
                      </select>
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <input type="number" value={v.quantity} onChange={e => updateVariation(i, 'quantity', e.target.value)} placeholder="Qty" min="0" style={inputStyle()} />
                  </div>
                  <button type="button" onClick={() => removeVariation(i)} style={{ background: '#c0392b', color: '#fff', border: 'none', padding: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>X</button>
                </div>
              ))}
              {form.variations.length === 0 && (
                <p style={{ color: t.textMuted, fontSize: '0.8rem', textAlign: 'center', padding: '1rem' }}>No variations added. Product will be out of stock.</p>
              )}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Main Thumbnail Image</label>
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2.2rem 1.5rem',
                background: t.input,
                border: `2px dashed ${t.border}`,
                borderRadius: '10px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = t.text}
              onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '1.4rem', color: t.textMuted }}>↑</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: t.text }}>Click to upload thumbnail</span>
                <span style={{ fontSize: '0.7rem', color: t.textMuted }}>PNG, JPG or WEBP up to 5MB</span>
                {file && <span style={{ fontSize: '0.75rem', color: resolvedTheme === 'dark' ? '#00ff9d' : '#05cd99', fontWeight: 700, marginTop: '0.5rem' }}>✓ {file.name}</span>}
              </div>
              <input 
                type="file" 
                accept="image/*"
                style={{ display: 'none' }} 
                onChange={(e) => {
                  const selected = e.target.files[0];
                  if (selected) {
                    setFile(selected);
                    setPreview(URL.createObjectURL(selected));
                  }
                }} 
              />
            </label>
          </div>

          <div>
            <label style={labelStyle}>Additional Gallery Images</label>
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2.2rem 1.5rem',
                background: t.input,
                border: `2px dashed ${t.border}`,
                borderRadius: '10px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = t.text}
              onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '1.4rem', color: t.textMuted }}>＋</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: t.text }}>Click to upload gallery images</span>
                <span style={{ fontSize: '0.7rem', color: t.textMuted }}>Select multiple files</span>
                {galleryFiles.length > 0 && <span style={{ fontSize: '0.75rem', color: resolvedTheme === 'dark' ? '#00ff9d' : '#05cd99', fontWeight: 700, marginTop: '0.5rem' }}>✓ {galleryFiles.length} files selected</span>}
              </div>
              <input 
                type="file" 
                accept="image/*"
                multiple
                style={{ display: 'none' }} 
                onChange={(e) => {
                  const selectedFiles = Array.from(e.target.files);
                  if (selectedFiles.length > 0) {
                    setGalleryFiles(prev => [...prev, ...selectedFiles]);
                    const previews = selectedFiles.map(f => URL.createObjectURL(f));
                    setGalleryPreviews(prev => [...prev, ...previews]);
                  }
                }} 
              />
            </label>
            {existingGallery.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '0.75rem', color: t.textMuted, marginBottom: '0.5rem' }}>Current Gallery Images</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {existingGallery.map((url, i) => (
                    <div key={i} style={{ position: 'relative', width: '60px', height: '75px' }}>
                      <img src={url} alt="gallery" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                      <button type="button" onClick={() => {
                        setExistingGallery(prev => prev.filter((_, idx) => idx !== i));
                      }} style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer' }}>x</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {galleryPreviews.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '0.75rem', color: t.textMuted, marginBottom: '0.5rem' }}>New Gallery Images (To be uploaded)</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {galleryPreviews.map((url, i) => (
                    <div key={i} style={{ position: 'relative', width: '60px', height: '75px' }}>
                      <img src={url} alt="gallery" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                      <button type="button" onClick={() => {
                        setGalleryPreviews(prev => prev.filter((_, idx) => idx !== i));
                        setGalleryFiles(prev => prev.filter((_, idx) => idx !== i));
                      }} style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer' }}>x</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ background: t.input, border: `1px solid ${t.border}`, padding: '1.25rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            {preview ? (
              <img src={preview} alt="preview" style={{ width: '60px', height: '75px', objectFit: 'cover', background: t.surface }} />
            ) : (
              <div style={{ width: '60px', height: '75px', background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${t.border}` }}>
                <span style={{ fontSize: '0.6rem', color: t.textMuted }}>NO IMG</span>
              </div>
            )}
            <div>
              <p style={{ color: t.textMuted, fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                {CATEGORIES.find(c => c.id === form.category)?.label}
              </p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: t.text }}>{form.name || 'Product Name'}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                <p style={{ color: resolvedTheme === 'dark' ? '#00ff9d' : '#00b894', fontSize: '0.85rem', fontWeight: 600 }}>
                  {form.price ? `KSh ${Number(form.price).toLocaleString()}` : 'KSh —'}
                </p>
                {form.original_price && (
                  <p style={{ color: t.textMuted, fontSize: '0.7rem', textDecoration: 'line-through' }}>
                    KSh {Number(form.original_price).toLocaleString()}
                  </p>
                )}
                {form.discount_label && (
                  <span style={{ background: '#c0392b', color: '#fff', fontSize: '0.6rem', padding: '0.1rem 0.3rem', letterSpacing: '1px' }}>
                    {form.discount_label}
                  </span>
                )}
              </div>
            </div>
            {form.badge && <span style={{ marginLeft: 'auto', background: t.border, color: t.textMuted, padding: '0.2rem 0.6rem', fontSize: '0.65rem', letterSpacing: '1px' }}>{form.badge}</span>}
          </div>

          {/* API Error Banner */}
          {apiError && (
            <div style={{ background: '#fff5f5', border: '1px solid #fecaca', padding: '1rem 1.25rem', borderRadius: '4px' }}>
              <p style={{ color: '#c0392b', fontSize: '0.82rem', lineHeight: 1.6 }}>⚠️ {apiError}</p>
            </div>
          )}

          {/* Submit */}
          <motion.button
            whileTap={{ scale: uploading ? 1 : 0.97 }}
            disabled={uploading}
            type="submit"
            style={{
              padding: '1rem', background: uploading ? t.border : t.text, color: uploading ? t.textMuted : t.bg,
              border: 'none', cursor: uploading ? 'wait' : 'pointer', fontSize: '0.85rem',
              fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase',
              fontFamily: 'var(--font-body)',
            }}
          >
            {uploading ? 'Updating Server...' : 'Save Changes'}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
