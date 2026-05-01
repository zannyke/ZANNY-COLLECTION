import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES, PRODUCTS, useCart } from '../context/CartContext';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('M');
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
    >
      {/* Image */}
      <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '3/4', background: '#f4f4f4' }}>
        <motion.img
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.5 }}
          src={product.image}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {product.badge && (
          <span style={{
            position: 'absolute', top: '0.75rem', left: '0.75rem',
            background: product.badge === 'SALE' ? '#c0392b' : '#1a1a1a',
            color: '#fff', fontSize: '0.6rem', fontWeight: 700,
            padding: '0.2rem 0.55rem', letterSpacing: '1.5px',
          }}>
            {product.badge}
          </span>
        )}
      </div>

      {/* Info */}
      <div>
        <p style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>
          {CATEGORIES.find(c => c.id === product.category)?.label}
        </p>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', marginBottom: '0.3rem' }}>
          {product.name}
        </p>
        <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>
          KSh {product.price.toLocaleString()}
        </p>
      </div>

      {/* Size selector */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {SIZES.map(s => (
          <button
            key={s}
            onClick={() => setSelectedSize(s)}
            style={{
              width: '32px', height: '32px', fontSize: '0.65rem', fontWeight: 600,
              border: selectedSize === s ? '1.5px solid #1a1a1a' : '1px solid #ddd',
              background: selectedSize === s ? '#1a1a1a' : 'transparent',
              color: selectedSize === s ? '#fff' : '#1a1a1a',
              cursor: 'pointer', letterSpacing: '0.5px',
              transition: 'all 0.2s',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Add to cart */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={handleAdd}
        style={{
          padding: '0.75rem',
          background: added ? '#2d6a4f' : '#1a1a1a',
          color: '#fff', border: 'none', cursor: 'pointer',
          fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1.5px',
          textTransform: 'uppercase', transition: 'background 0.3s',
          fontFamily: 'var(--font-body)',
        }}
      >
        {added ? '✓ Added to Cart' : 'Add to Cart'}
      </motion.button>
    </motion.div>
  );
}

export default function Collections() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = PRODUCTS.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      CATEGORIES.find(c => c.id === p.category)?.label.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <section id="collections" style={{ backgroundColor: '#fff', paddingBottom: '6rem' }}>
      {/* Section header */}
      <div style={{ padding: '5rem 2rem 3rem', textAlign: 'center' }}>
        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ fontSize: '0.75rem', letterSpacing: '3px', color: '#888', textTransform: 'uppercase', marginBottom: '0.75rem' }}
        >
          Explore the Collection
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1.5rem' }}
        >
          Curated For The Bold
        </motion.h2>

        {/* Inline search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
            border: '1px solid #ddd', padding: '0.6rem 1.2rem',
            width: 'min(400px, 90vw)', marginBottom: '2.5rem',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#aaa" strokeWidth="1.5">
            <circle cx="8.5" cy="8.5" r="5" /><path d="M13 13 L18 18" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search products, categories..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              border: 'none', outline: 'none', fontSize: '0.875rem',
              fontFamily: 'var(--font-body)', width: '100%', background: 'transparent',
              color: '#1a1a1a',
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: '1rem' }}>×</button>
          )}
        </motion.div>

        {/* Category pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
          <button
            onClick={() => setActiveCategory('all')}
            style={{
              padding: '0.45rem 1.1rem', fontSize: '0.75rem', fontWeight: 600,
              letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer',
              border: activeCategory === 'all' ? '1.5px solid #1a1a1a' : '1px solid #ddd',
              background: activeCategory === 'all' ? '#1a1a1a' : 'transparent',
              color: activeCategory === 'all' ? '#fff' : '#555',
              transition: 'all 0.2s',
            }}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '0.45rem 1.1rem', fontSize: '0.75rem', fontWeight: 600,
                letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer',
                border: activeCategory === cat.id ? '1.5px solid #1a1a1a' : '1px solid #ddd',
                background: activeCategory === cat.id ? '#1a1a1a' : 'transparent',
                color: activeCategory === cat.id ? '#fff' : '#555',
                transition: 'all 0.2s',
                fontFamily: 'var(--font-body)',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div className="container">
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: 'center', padding: '4rem', color: '#999' }}
            >
              <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No products found</p>
              <p style={{ fontSize: '0.875rem' }}>Try a different search or category</p>
            </motion.div>
          ) : (
            <motion.div
              key={activeCategory + searchQuery}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '2.5rem 2rem',
              }}
            >
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
